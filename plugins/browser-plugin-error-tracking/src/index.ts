import { isFunction, addEventListener, BrowserPlugin, BrowserTracker } from '@snowplow/browser-core';
import { SelfDescribingJson } from '@snowplow/tracker-core';

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
  }: {
    message: string;
    filename: string;
    lineno: number;
    colno: number;
    error: Error;
    contexts: Array<SelfDescribingJson>;
  },
  trackers: Array<string> = Object.keys(_trackers)
) {
  const stack = error && error.stack ? error.stack : null;

  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t].core.trackSelfDescribingEvent(
        {
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
        contexts
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
