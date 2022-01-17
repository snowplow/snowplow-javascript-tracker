/*
 * Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { isStringArray, LOG } from '@snowplow/tracker-core';
import {
  isFunction,
  addTracker,
  createSharedState,
  SharedState,
  BrowserTracker,
  addEventListener,
  getTrackers,
} from '@snowplow/browser-tracker-core';
import * as Snowplow from '@snowplow/browser-tracker';
import { Plugins } from './features';
import { JavaScriptTrackerConfiguration } from './configuration';

declare global {
  interface Window {
    [key: string]: unknown;
  }
}

/*
 * Proxy object
 * This allows the caller to continue push()'ing after the Tracker has been initialized and loaded
 */
export interface Queue {
  /**
   * Allows the caller to push events
   *
   * @param array - parameterArray An array comprising either:
   *      [ 'functionName', optional_parameters ]
   * or:
   *      [ functionObject, optional_parameters ]
   */
  push: (...args: any[]) => void;
}

interface PluginQueueItem {
  timeout: number;
}

type FunctionParameters = [Record<string, unknown> | null | undefined, Array<string>] | [Array<string>];

/**
 * This allows the caller to continue push()'ing after the Tracker has been initialized and loaded
 *
 * @param functionName - The global function name this script has been created on
 * @param asyncQueue - The existing queue of items to be processed
 */
export function InQueueManager(functionName: string, asyncQueue: Array<unknown>): Queue {
  const windowAlias = window,
    documentAlias = document,
    sharedState: SharedState = createSharedState(),
    availableTrackerIds: Array<string> = [],
    pendingPlugins: Record<string, PluginQueueItem> = {},
    pendingQueue: Array<[string, FunctionParameters]> = [];

  let version: string, availableFunctions: Record<string, Function>;
  ({ version, ...availableFunctions } = Snowplow);

  function parseInputString(inputString: string): [string, string[] | undefined] {
    const separatedString = inputString.split(':'),
      extractedFunction = separatedString[0],
      extractedNames = separatedString.length > 1 ? separatedString[1].split(';') : undefined;

    return [extractedFunction, extractedNames];
  }

  function dispatch(f: string, parameters: FunctionParameters) {
    if (availableFunctions[f]) {
      try {
        availableFunctions[f].apply(null, parameters);
      } catch (ex) {
        LOG.error(f + ' failed', ex);
      }
    } else {
      LOG.warn(f + ' is not an available function');
    }
  }

  function tryProcessQueue() {
    if (Object.keys(pendingPlugins).length === 0) {
      pendingQueue.forEach((q) => {
        let fnParameters = q[1];
        if (
          typeof availableFunctions[q[0]] !== 'undefined' &&
          availableFunctions[q[0]].length > fnParameters.length &&
          Array.isArray(fnParameters[0])
        ) {
          fnParameters = [{}, fnParameters[0]];
        }
        dispatch(q[0], fnParameters);
      });
    }
  }

  function updateAvailableFunctions(newFunctions: Record<string, Function>) {
    // Spread in any new methods
    availableFunctions = {
      ...availableFunctions,
      ...newFunctions,
    };
  }

  function newTracker(parameterArray: Array<unknown>) {
    if (
      typeof parameterArray[0] === 'string' &&
      typeof parameterArray[1] === 'string' &&
      (typeof parameterArray[2] === 'undefined' || typeof parameterArray[2] === 'object')
    ) {
      const trackerId = `${functionName}_${parameterArray[0]}`,
        trackerConfiguration = parameterArray[2] as JavaScriptTrackerConfiguration,
        plugins = Plugins(trackerConfiguration),
        tracker = addTracker(trackerId, parameterArray[0], `js-${version}`, parameterArray[1], sharedState, {
          ...trackerConfiguration,
          plugins: plugins.map((p) => p[0]),
        });

      if (tracker) {
        availableTrackerIds.push(tracker.id);
      } else {
        LOG.warn(parameterArray[0] + ' already exists');
        return;
      }

      plugins.forEach((p) => {
        updateAvailableFunctions(p[1]);
      });
    } else {
      LOG.error('newTracker failed', new Error('Invalid parameters'));
    }
  }

  function addPlugin(parameterArray: Array<unknown>, trackerIdentifiers: Array<string>) {
    function postScriptHandler(scriptSrc: string) {
      if (Object.prototype.hasOwnProperty.call(pendingPlugins, scriptSrc)) {
        windowAlias.clearTimeout(pendingPlugins[scriptSrc].timeout);
        delete pendingPlugins[scriptSrc];
        tryProcessQueue();
      }
    }

    if (
      typeof parameterArray[0] === 'string' &&
      isStringArray(parameterArray[1]) &&
      (typeof parameterArray[2] === 'undefined' || Array.isArray(parameterArray[2]))
    ) {
      const scriptSrc = parameterArray[0],
        constructorPath = parameterArray[1],
        constructorParams = parameterArray[2],
        pauseTracking = parameterArray[3] ?? true;

      if (pauseTracking) {
        const timeout = windowAlias.setTimeout(() => {
          postScriptHandler(scriptSrc);
        }, 5000);
        pendingPlugins[scriptSrc] = {
          timeout: timeout,
        };
      }
      const pluginScript = documentAlias.createElement('script');
      pluginScript.setAttribute('src', scriptSrc);
      pluginScript.setAttribute('async', '1');
      addEventListener(
        pluginScript,
        'error',
        () => {
          postScriptHandler(scriptSrc);
          LOG.warn(`Failed to load plugin ${constructorPath[0]} from ${scriptSrc}`);
        },
        true
      );
      addEventListener(
        pluginScript,
        'load',
        () => {
          const [windowFn, innerFn] = constructorPath,
            plugin = windowAlias[windowFn];
          if (plugin && typeof plugin === 'object') {
            const { [innerFn]: pluginConstructor, ...api } = plugin as Record<string, Function>;
            availableFunctions['addPlugin'].apply(null, [
              { plugin: pluginConstructor.apply(null, constructorParams) },
              trackerIdentifiers,
            ]);
            updateAvailableFunctions(api);
          }
          postScriptHandler(scriptSrc);
        },
        true
      );
      documentAlias.head.appendChild(pluginScript);
      return;
    }

    if (
      typeof parameterArray[0] === 'object' &&
      typeof parameterArray[1] === 'string' &&
      (typeof parameterArray[2] === 'undefined' || Array.isArray(parameterArray[2]))
    ) {
      const plugin = parameterArray[0],
        constructorPath = parameterArray[1],
        constructorParams = parameterArray[2];
      if (plugin) {
        const { [constructorPath]: pluginConstructor, ...api } = plugin as Record<string, Function>;
        availableFunctions['addPlugin'].apply(null, [
          { plugin: pluginConstructor.apply(null, constructorParams) },
          trackerIdentifiers,
        ]);
        updateAvailableFunctions(api);
        return;
      }
    }

    LOG.warn(`Failed to add Plugin: ${parameterArray[1]}`);
  }

  /**
   * apply wrapper
   *
   * @param array - parameterArray An array comprising either:
   *      [ 'functionName', optional_parameters ]
   * or:
   *      [ functionObject, optional_parameters ]
   */
  function applyAsyncFunction(...args: any[]) {
    // Outer loop in case someone push'es in zarg of arrays
    for (let i = 0; i < args.length; i += 1) {
      let parameterArray = args[i],
        input = Array.prototype.shift.call(parameterArray);

      // Custom callback rather than tracker method, called with trackerDictionary as the context
      if (isFunction(input)) {
        try {
          let fnTrackers: Record<string, BrowserTracker> = {};
          for (const tracker of getTrackers(availableTrackerIds)) {
            // Strip GlobalSnowplowNamespace from ID
            fnTrackers[tracker.id.replace(`${functionName}_`, '')] = tracker;
          }
          input.apply(fnTrackers, parameterArray);
        } catch (ex) {
          LOG.error('Tracker callback failed', ex);
        } finally {
          continue;
        }
      }

      let parsedString = parseInputString(input),
        f = parsedString[0],
        names = parsedString[1];

      if (f === 'newTracker') {
        newTracker(parameterArray);
        continue;
      }

      const trackerIdentifiers = names ? names.map((n) => `${functionName}_${n}`) : availableTrackerIds;

      if (f === 'addPlugin') {
        addPlugin(parameterArray, trackerIdentifiers);
        continue;
      }

      let fnParameters: FunctionParameters;
      if (parameterArray.length > 0) {
        fnParameters = [parameterArray[0], trackerIdentifiers];
      } else if (typeof availableFunctions[f] !== 'undefined') {
        fnParameters = availableFunctions[f].length === 2 ? [{}, trackerIdentifiers] : [trackerIdentifiers];
      } else {
        fnParameters = [trackerIdentifiers];
      }

      if (Object.keys(pendingPlugins).length > 0) {
        pendingQueue.push([f, fnParameters]);
        continue;
      }

      dispatch(f, fnParameters);
    }
  }

  // We need to manually apply any events collected before this initialization
  for (let i = 0; i < asyncQueue.length; i++) {
    applyAsyncFunction(asyncQueue[i]);
  }

  return {
    push: applyAsyncFunction,
  };
}
