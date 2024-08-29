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
  bufferFlushers: Array<(sync: boolean) => void> = [];

  /* DOM Ready */
  hasLoaded: boolean = false;
  registeredOnLoadHandlers: Array<() => void> = [];

  /* pageViewId, which can changed by other trackers on page;
   * initialized by tracker sent first event */
  pageViewId?: string;
  /* URL of the page view which the `pageViewId` was generated for */
  pageViewUrl?: string;
}

export function createSharedState(): SharedState {
  const sharedState = new SharedState(),
    documentAlias = document,
    windowAlias = window;

  /*
   * Handle page visibility event
   * Works everywhere except IE9
   */
  function visibilityChangeHandler() {
    if (documentAlias.visibilityState == 'hidden') {
      // Flush all POST queues
      sharedState.bufferFlushers.forEach(function (flusher) {
        flusher(false);
      });
    }
  }

  function flushBuffers() {
    // Flush all POST queues
    sharedState.bufferFlushers.forEach(function (flusher) {
      flusher(false);
    });
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
  if (documentAlias.visibilityState) {
    // Flush for mobile and modern browsers
    addEventListener(documentAlias, 'visibilitychange', visibilityChangeHandler, false);
  }
  // Last attempt at flushing in beforeunload
  addEventListener(windowAlias, 'beforeunload', flushBuffers, false);

  if (document.readyState === 'loading') {
    addReadyListener();
  } else {
    loadHandler();
  }

  return sharedState;
}
