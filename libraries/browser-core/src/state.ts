/*
 * JavaScript tracker for Snowplow: snowplow.js
 *
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright
 * 2012-2020 Snowplow Analytics Ltd. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
 *   names of their contributors may be used to endorse or promote products
 *   derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import forEach from 'lodash/forEach';
import { addEventListener } from './helpers';

declare global {
  interface Document {
    attachEvent: (type: string, fn: EventListenerOrEventListenerObject) => void;
    detachEvent: (type: string, fn: EventListenerOrEventListenerObject) => void;
  }
}

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

export function newSharedState(): SharedState {
  const documentAlias = document,
    windowAlias = window,
    /* Contains four variables that are shared with tracker.js and must be passed by reference */
    mutSnowplowState = new SharedState();

  /************************************************************
   * Private methods
   ************************************************************/

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
    forEach(mutSnowplowState.bufferFlushers, function (flusher) {
      flusher();
    });

    /*
     * Delay/pause (blocks UI)
     */
    if (mutSnowplowState.expireDateTime) {
      // the things we do for backwards compatibility...
      // in ECMA-262 5th ed., we could simply use:
      //     while (Date.now() < mutSnowplowState.expireDateTime) { }
      do {
        now = new Date();
        if (
          Array.prototype.filter.call(mutSnowplowState.outQueues, function (queue) {
            return queue.length > 0;
          }).length === 0
        ) {
          break;
        }
      } while (now.getTime() < mutSnowplowState.expireDateTime);
    }
  }

  /*
   * Handler for onload event
   */
  function loadHandler() {
    var i;

    if (!mutSnowplowState.hasLoaded) {
      mutSnowplowState.hasLoaded = true;
      for (i = 0; i < mutSnowplowState.registeredOnLoadHandlers.length; i++) {
        mutSnowplowState.registeredOnLoadHandlers[i]();
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

  return mutSnowplowState;
}
