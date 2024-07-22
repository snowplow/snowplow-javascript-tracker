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

import {
  isFunction,
  addEventListener,
  BrowserPlugin,
  BrowserTracker,
  dispatchToTrackersInCollection,
} from '@snowplow/browser-tracker-core';
import { buildSelfDescribingEvent, CommonEventProperties, SelfDescribingJson } from '@snowplow/tracker-core';
import { truncateString } from './util';

let _trackers: Record<string, BrowserTracker> = {};

export function ErrorTrackingPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      _trackers[tracker.id] = tracker;
    },
  };
}

/**
 * Event for tracking an error
 */
export interface ErrorEventProperties {
  /** The error message */
  message: string;
  /** The filename where the error occurred */
  filename?: string;
  /** The line number which the error occurred on */
  lineno?: number;
  /** The column number which the error occurred on */
  colno?: number;
  /** The error object */
  error?: Error;
}

/**
 * Send error as self-describing event
 *
 * @param event - The event information
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackError(
  event: ErrorEventProperties & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { message, filename, lineno, colno, error, context, timestamp } = event,
    stack = error && truncateString(error.stack, 8192),
    truncatedMessage = message && truncateString(message, 2048);

  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(
      buildSelfDescribingEvent({
        event: {
          schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
          data: {
            programmingLanguage: 'JAVASCRIPT',
            message: truncatedMessage ?? "JS Exception. Browser doesn't support ErrorEvent API",
            stackTrace: stack,
            lineNumber: lineno,
            lineColumn: colno,
            fileName: filename,
          },
        },
      }),
      context,
      timestamp
    );
  });
}

/**
 * The configuration for automatic error tracking
 */
export interface ErrorTrackingConfiguration {
  /** A callback which allows on certain errors to be tracked */
  filter?: (error: ErrorEvent) => boolean;
  /** A callback to dynamically add extra context based on the error */
  contextAdder?: (error: ErrorEvent) => Array<SelfDescribingJson>;
  /** Context to be added to every error */
  context?: Array<SelfDescribingJson>;
}

/**
 * Enable automatic error tracking, added event handler for 'error' event on window
 * @param configuration - The error tracking configuration
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function enableErrorTracking(
  configuration: ErrorTrackingConfiguration = {},
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { filter, contextAdder, context } = configuration,
    captureError = (errorEvent: Event) => {
      if ((filter && isFunction(filter) && filter(errorEvent as ErrorEvent)) || filter == null) {
        sendError({ errorEvent: errorEvent as ErrorEvent, commonContext: context, contextAdder }, trackers);
      }
    };

  addEventListener(window, 'error', captureError, true);
}

function sendError(
  {
    errorEvent,
    commonContext,
    contextAdder,
  }: {
    errorEvent: ErrorEvent;
    commonContext?: Array<SelfDescribingJson>;
    contextAdder?: (error: ErrorEvent) => Array<SelfDescribingJson>;
  },
  trackers: Array<string>
) {
  let context = commonContext || [];
  if (contextAdder && isFunction(contextAdder)) {
    context = context.concat(contextAdder(errorEvent));
  }

  trackError(
    {
      message: errorEvent.message,
      filename: errorEvent.filename,
      lineno: errorEvent.lineno,
      colno: errorEvent.colno,
      error: errorEvent.error,
      context,
    },
    trackers
  );
}
