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

import { isFunction, addEventListener, BrowserPlugin, BrowserTracker } from '@snowplow/browser-tracker-core';
import { buildSelfDescribingEvent, SelfDescribingJson, Timestamp } from '@snowplow/tracker-core';

let windowAlias = window,
  _trackers: Record<string, BrowserTracker> = {};

export const ErrorTrackingPlugin = (): BrowserPlugin => {
  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      _trackers[tracker.id] = tracker;
    },
  };
};

/**
 * Send error as self-describing event
 *
 * @param message string Message appeared in console
 * @param filename string Source file (not used)
 * @param lineno number Line number
 * @param colno number Column number (not used)
 * @param error Error error object (not present in all browsers)
 * @param contexts Array of custom contexts
 */
export function trackError(
  {
    message,
    filename,
    lineno,
    colno,
    error,
    contexts,
    timestamp,
  }: {
    message: string;
    filename: string;
    lineno: number;
    colno: number;
    error: Error;
    contexts?: Array<SelfDescribingJson>;
    timestamp?: Timestamp;
  },
  trackers: Array<string> = Object.keys(_trackers)
) {
  const stack = error && error.stack ? error.stack : null;

  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t].core.track(
        buildSelfDescribingEvent({
          event: {
            schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
            data: {
              programmingLanguage: 'JAVASCRIPT',
              message: message || "JS Exception. Browser doesn't support ErrorEvent API",
              stackTrace: stack,
              lineNumber: lineno,
              lineColumn: colno,
              fileName: filename,
            },
          },
        }),
        contexts,
        timestamp
      );
    }
  });
}

export function enableErrorTracking(
  {
    filter,
    contextsAdder,
    contexts,
  }: {
    filter: (error: ErrorEvent) => boolean;
    contextsAdder: (error: ErrorEvent) => Array<SelfDescribingJson>;
    contexts: SelfDescribingJson[];
  },
  trackers: Array<string> = Object.keys(_trackers)
) {
  /**
   * Closure callback to filter, contextualize and track unhandled exceptions
   *
   * @param errorEvent ErrorEvent passed to event listener
   */
  const captureError = (errorEvent: Event) => {
    if ((isFunction(filter) && filter(errorEvent as ErrorEvent)) || filter == null) {
      sendError({ errorEvent: errorEvent as ErrorEvent, commonContexts: contexts, contextsAdder }, trackers);
    }
  };

  addEventListener(windowAlias, 'error', captureError, true);
}

/**
 * Attach custom contexts using `contextAdder`
 *
 *
 * @param contextsAdder function to get details from internal browser state
 * @returns {Array} custom contexts
 */
function sendError(
  {
    errorEvent,
    commonContexts,
    contextsAdder,
  }: {
    errorEvent: ErrorEvent;
    commonContexts: Array<SelfDescribingJson>;
    contextsAdder: (error: ErrorEvent) => Array<SelfDescribingJson>;
  },
  trackers: Array<string>
) {
  let contexts = commonContexts || [];
  if (isFunction(contextsAdder)) {
    contexts = contexts.concat(contextsAdder(errorEvent));
  }

  trackError(
    {
      message: errorEvent.message,
      filename: errorEvent.filename,
      lineno: errorEvent.lineno,
      colno: errorEvent.colno,
      error: errorEvent.error,
      contexts,
    },
    trackers
  );
}
