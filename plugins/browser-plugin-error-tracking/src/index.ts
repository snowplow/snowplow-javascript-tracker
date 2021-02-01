import { isFunction, addEventListener, ApiPlugin, ApiMethods } from '@snowplow/browser-core';
import { Core, SelfDescribingJson, Plugin } from '@snowplow/tracker-core';

interface ErrorMethods extends ApiMethods {
  trackError: (
    message: string,
    filename: string,
    lineno: number,
    colno: number,
    error: Error,
    contexts: Array<SelfDescribingJson>
  ) => void;
  enableErrorTracking: (
    filter: (error: ErrorEvent) => boolean,
    contextsAdder: (error: ErrorEvent) => Array<SelfDescribingJson>,
    contexts: SelfDescribingJson[]
  ) => void;
}

export const ErrorTrackingPlugin = (): Plugin & ApiPlugin<ErrorMethods> => {
  let windowAlias = window,
    _core: Core;

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
  const track = (
    message: string,
    filename: string,
    lineno: number,
    colno: number,
    error: Error,
    contexts: Array<SelfDescribingJson>
  ) => {
    const stack = error && error.stack ? error.stack : null;

    _core.trackSelfDescribingEvent(
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
  };

  /**
   * Attach custom contexts using `contextAdder`
   *
   *
   * @param contextsAdder function to get details from internal browser state
   * @returns {Array} custom contexts
   */
  const sendError = (
    errorEvent: ErrorEvent,
    commonContexts: Array<SelfDescribingJson>,
    contextsAdder: (error: ErrorEvent) => Array<SelfDescribingJson>
  ) => {
    let contexts = commonContexts || [];
    if (isFunction(contextsAdder)) {
      contexts = contexts.concat(contextsAdder(errorEvent));
    }

    track(errorEvent.message, errorEvent.filename, errorEvent.lineno, errorEvent.colno, errorEvent.error, contexts);
  };

  return {
    coreInit: (core: Core) => {
      _core = core;
    },
    apiMethods: {
      /**
       * Track unhandled exception.
       * This method supposed to be used inside try/catch block or with window.onerror
       * (contexts won't be attached), but NOT with `addEventListener` - use
       * `enableErrorTracker` for this
       *
       * @param message string Message appeared in console
       * @param filename string Source file (not used)
       * @param lineno number Line number
       * @param colno number Column number (not used)
       * @param error Error error object (not present in all browsers)
       * @param contexts Array of custom contexts
       */
      trackError: track,
      /**
       * Curried function to enable tracking of unhandled exceptions.
       * Listen for `error` event and
       *
       * @param filter Function ErrorEvent => Bool to check whether error should be tracker
       * @param contextsAdder Function ErrorEvent => Array<Context> to add custom contexts with
       *                     internal state based on particular error
       */
      enableErrorTracking: (
        filter: (error: ErrorEvent) => boolean,
        contextsAdder: (error: ErrorEvent) => Array<SelfDescribingJson>,
        contexts: SelfDescribingJson[]
      ) => {
        /**
         * Closure callback to filter, contextualize and track unhandled exceptions
         *
         * @param errorEvent ErrorEvent passed to event listener
         */
        const captureError = (errorEvent: Event) => {
          if ((isFunction(filter) && filter(errorEvent as ErrorEvent)) || filter == null) {
            sendError(errorEvent as ErrorEvent, contexts, contextsAdder);
          }
        };

        addEventListener(windowAlias, 'error', captureError, true);
      },
    },
  };
};
