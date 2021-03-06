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

import { addEventListener } from './helpers';

declare global {
  interface Document {
    attachEvent: (type: string, fn: EventListenerOrEventListenerObject) => void;
    detachEvent: (type: string, fn: EventListenerOrEventListenerObject) => void;
  }
}

/**
 * A set of variables which are shared among all initialised trackers
 */
export class SharedState {
  /* List of request queues - one per Tracker instance */
  outQueues: Array<unknown> = [];
  bufferFlushers: Array<() => void> = [];

  /* Time at which to stop blocking excecution */
  expireDateTime?: number;

  /* DOM Ready */
  hasLoaded: boolean = false;
  registeredOnLoadHandlers: Array<() => void> = [];

  /* pageViewId, which can changed by other trackers on page;
   * initialized by tracker sent first event */
  pageViewId?: string;
}

export function createSharedState(): SharedState {
  const documentAlias = document,
    windowAlias = window,
    sharedState = new SharedState();

  /*
   * Handle beforeunload event
   *
   * Subject to Safari's "Runaway JavaScript Timer" and
   * Chrome V8 extension that terminates JS that exhibits
   * "slow unload", i.e., calling getTime() > 1000 times
   */
  function beforeUnloadHandler() {
    var now;

    // Flush all POST queues
    sharedState.bufferFlushers.forEach(function (flusher) {
      flusher();
    });

    /*
     * Delay/pause (blocks UI)
     */
    if (sharedState.expireDateTime) {
      // the things we do for backwards compatibility...
      // in ECMA-262 5th ed., we could simply use:
      //     while (Date.now() < mutSnowplowState.expireDateTime) { }
      do {
        now = new Date();
        if (
          Array.prototype.filter.call(sharedState.outQueues, function (queue) {
            return queue.length > 0;
          }).length === 0
        ) {
          break;
        }
      } while (now.getTime() < sharedState.expireDateTime);
    }
  }

  /*
   * Handler for onload event
   */
  function loadHandler() {
    var i;

    if (!sharedState.hasLoaded) {
      sharedState.hasLoaded = true;
      for (i = 0; i < sharedState.registeredOnLoadHandlers.length; i++) {
        sharedState.registeredOnLoadHandlers[i]();
      }
    }
    return true;
  }

  /*
   * Add onload or DOM ready handler
   */
  function addReadyListener() {
    if (documentAlias.addEventListener) {
      documentAlias.addEventListener('DOMContentLoaded', function ready() {
        documentAlias.removeEventListener('DOMContentLoaded', ready, false);
        loadHandler();
      });
    } else if (documentAlias.attachEvent) {
      documentAlias.attachEvent('onreadystatechange', function ready() {
        if (documentAlias.readyState === 'complete') {
          documentAlias.detachEvent('onreadystatechange', ready);
          loadHandler();
        }
      });
    }

    // fallback
    addEventListener(windowAlias, 'load', loadHandler, false);
  }

  /************************************************************
   * Constructor
   ************************************************************/

  // initialize the Snowplow singleton
  addEventListener(windowAlias, 'beforeunload', beforeUnloadHandler, false);
  addReadyListener();

  return sharedState;
}
