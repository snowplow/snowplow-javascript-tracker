/*
 * JavaScript tracker for Snowplow: tracker.js
 *
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright
 * 2012-2016 Snowplow Analytics Ltd. All rights reserved.
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

var lodash = require('./lib_managed/lodash'),
    helpers = require('./lib/helpers'),
    object = typeof exports !== 'undefined' ? exports : this,
	windowAlias = window;


object.errorManager = function (core) {

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
	function track(message, filename, lineno, colno, error, contexts) {
		var stack = (error && error.stack) ? error.stack : null;

		core.trackSelfDescribingEvent({
			schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
			data: {
				programmingLanguage: "JAVASCRIPT",
				message: message || "JS Exception. Browser doesn't support ErrorEvent API",
				stackTrace: stack,
				lineNumber: lineno,
				lineColumn: colno,
				fileName: filename
			}
		}, contexts)
	}

	/**
	 * Attach custom contexts using `contextAdder`
	 *
	 * 
	 * @param contextsAdder function to get details from internal browser state
	 * @returns {Array} custom contexts
	 */
	function sendError(errorEvent, commonContexts, contextsAdder) {
		var contexts;
		if (lodash.isFunction(contextsAdder)) {
			contexts = commonContexts.concat(contextsAdder(errorEvent));
		} else {
			contexts = commonContexts;
		}

		track(errorEvent.message, errorEvent.filename, errorEvent.lineno, errorEvent.colno, errorEvent.error, contexts)
	}

	return {

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
		enableErrorTracking: function (filter, contextsAdder, contexts) {
			/**
			 * Closure callback to filter, contextualize and track unhandled exceptions
			 *
			 * @param errorEvent ErrorEvent passed to event listener
			 */
			function captureError (errorEvent) {
				if (lodash.isFunction(filter) && filter(errorEvent) || filter == null) {
					sendError(errorEvent, contexts, contextsAdder)
				}
			}

			helpers.addEventListener(windowAlias, 'error', captureError, true);
		}
	}
};
