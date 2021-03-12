/*
 * Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang
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

import { isStringArray } from '@snowplow/tracker-core';
import {
  warn,
  isFunction,
  addTracker,
  createSharedState,
  SharedState,
  BrowserTracker,
  addEventListener,
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
  /* Allows the call to push events */
  push: (...args: any[]) => void;
}

interface PluginQueueItem {
  timeout: number;
}

type FunctionParameters = [Record<string, unknown>, Array<string>] | [Array<string>];

/*
 * Proxy object
 * This allows the caller to continue push()'ing after the Tracker has been initialized and loaded
 */
export function InQueueManager(functionName: string, asyncQueue: Array<unknown>): Queue {
  const windowAlias = window,
    documentAlias = document,
    sharedState: SharedState = createSharedState(),
    availableTrackers: Record<string, Record<string, BrowserTracker>> = { [functionName]: {} },
    pendingPlugins: Record<string, PluginQueueItem> = {},
    pendingQueue: Array<[string, FunctionParameters]> = [];

  let version: string, availableFunctions: Record<string, Function>;
  ({ version, ...availableFunctions } = Snowplow);

  /**
   * Output an array of the form ['functionName', [trackerName1, trackerName2, ...]]
   *
   * @param inputString The functionName string
   */
  function parseInputString(inputString: string): [string, string[] | undefined] {
    const separatedString = inputString.split(':'),
      extractedFunction = separatedString[0],
      extractedNames = separatedString.length > 1 ? separatedString[1].split(';') : undefined;

    return [extractedFunction, extractedNames];
  }

  function trackersForFunctionName() {
    return Object.keys(availableTrackers[functionName]).map((k) => availableTrackers[functionName][k]);
  }

  function dispatch(f: string, parameters: FunctionParameters) {
    if (availableFunctions[f]) {
      try {
        availableFunctions[f].apply(null, parameters);
      } catch (ex) {
        warn(f + ' did not succeed');
      }
    } else {
      warn(f + ' is not an available function');
    }
  }

  function tryProcessQueue() {
    if (Object.keys(pendingPlugins).length === 0) {
      pendingQueue.forEach((q) => {
        dispatch(q[0], q[1]);
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
        tracker = addTracker(trackerId, parameterArray[0], version, parameterArray[1], sharedState, {
          ...trackerConfiguration,
          plugins: plugins.map((p) => p[0]),
        });

      if (tracker) {
        availableTrackers[functionName][trackerId] = tracker;
      } else {
        warn(parameterArray[0] + ' already exists');
        return;
      }

      plugins.forEach((p) => {
        updateAvailableFunctions(p[1]);
      });
    } else {
      warn('Invalid newTracker call');
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

    if (isStringArray(parameterArray[0]) && typeof parameterArray[1] === 'string') {
      const scriptSrc = parameterArray[1],
        constructorPath = parameterArray[0],
        pauseTracking = parameterArray[2] ?? true;

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
      addEventListener(
        pluginScript,
        'error',
        () => {
          postScriptHandler(scriptSrc);
          warn(`failed to load plugin ${constructorPath[0]} from ${scriptSrc}`);
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
            availableFunctions['addPlugin'].apply(null, [{ plugin: pluginConstructor() }, trackerIdentifiers]);
            updateAvailableFunctions(api);
          }
          postScriptHandler(scriptSrc);
        },
        true
      );
      documentAlias.head.appendChild(pluginScript);
      return;
    }

    if (typeof parameterArray[0] === 'string' && typeof parameterArray[1] === 'object') {
      const plugin = parameterArray[1],
        constructorPath = parameterArray[0];
      if (plugin) {
        const { [constructorPath]: pluginConstructor, ...api } = plugin as Record<string, Function>;

        availableFunctions['addPlugin'].apply(null, [{ plugin: pluginConstructor() }, trackerIdentifiers]);
        updateAvailableFunctions(api);
      }
    }
  }

  /**
   * apply wrapper
   *
   * @param array parameterArray An array comprising either:
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
          for (const tracker of trackersForFunctionName()) {
            // Strip GlobalSnowplowNamespace from ID
            fnTrackers[tracker.id.replace(`${functionName}_`, '')] = tracker;
          }
          input.apply(fnTrackers, parameterArray);
        } catch (e) {
          warn(`Custom callback error - ${e}`);
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

      const trackerIdentifiers = names
        ? names.map((n) => `${functionName}_${n}`)
        : trackersForFunctionName().map((t) => t.id);

      if (f === 'addPlugin') {
        addPlugin(parameterArray, trackerIdentifiers);
        continue;
      }

      let fnParameters: FunctionParameters;
      if (parameterArray[0]) {
        fnParameters = [parameterArray[0], trackerIdentifiers];
      } else {
        fnParameters = availableFunctions[f].length === 2 ? [{}, trackerIdentifiers] : [trackerIdentifiers];
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
