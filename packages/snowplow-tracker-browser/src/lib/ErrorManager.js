/*
 * JavaScript tracker for Snowplow: ErrorManager.js
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

import { isFunction, addEventListener } from './Utilities'
const windowAlias = window

/**
 * @class ErrorManager
 */
class ErrorManager {
    /**
     * Creates a new ErrorManager object.
     *
     * @param {trackerCore} core  - the Snowplow trackerCore object to use.
     * @returns {ErrorManager} - an instance of the ErrorManager class
     */
    constructor(core) {
        this.core = core
    }

    /**
     * Send error as self-describing event
     *
     * @param {String} message - Message appeared in console
     * @param {String} filename - Source file (not used)
     * @param {Number} lineno - Line number
     * @param {Number} colno  - Column number (not used)
     * @param {Error} error - error object (not present in all browsers)
     * @param {Object[]} contexts - Array of custom contexts
     */
    track(message, filename, lineno, colno, error, contexts) {
        var stack = error && error.stack ? error.stack : null

        this.core.trackSelfDescribingEvent(
            {
                schema:
                    'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
                data: {
                    programmingLanguage: 'JAVASCRIPT',
                    message:
                        message ||
                        'JS Exception. Browser doesn\'t support ErrorEvent API',
                    stackTrace: stack,
                    lineNumber: lineno,
                    lineColumn: colno,
                    fileName: filename,
                },
            },
            contexts
        )
    }

    /**
     * Sends an error as a self describing event.
     * Attach custom contexts using `contextAdder`
     *
     * @param {Event} errorEvent - Error event to send.
     * @param {Object[]} commonContexts  - Array of custom contexts
     * @param {Function} contextsAdder - function to get details from internal browser state
     */
    sendError(errorEvent, commonContexts, contextsAdder) {
        var contexts
        if (isFunction(contextsAdder)) {
            contexts = commonContexts.concat(contextsAdder(errorEvent))
        } else {
            contexts = commonContexts
        }

        this.track(
            errorEvent.message,
            errorEvent.filename,
            errorEvent.lineno,
            errorEvent.colno,
            errorEvent.error,
            contexts
        )
    }

    /**
     * Curried function to enable tracking of unhandled exceptions.
     * Listen for `error` event and send to tracker.
     *
     * @param {Function} filter - ErrorEvent => Bool to check whether error should be tracked
     * @param {Function} contextsAdder - ErrorEvent => Array<Context> to add custom contexts with internal state based on particular error
     * @param {Object[]} contexts - Array of custtom contexts
     */
    enableErrorTracking(filter, contextsAdder, contexts) {
        /**
         * Closure callback to filter, contextualize and track unhandled exceptions
         * @param {ErrorEvent} errorEvent - ErrorEvent passed to event listener
         */
        const captureError = (errorEvent) => {
            if ((isFunction(filter) && filter(errorEvent)) || filter == null) {
                this.sendError(errorEvent, contexts, contextsAdder)
            }
        }

        addEventListener(windowAlias, 'error', captureError, true)
    }

    /**
     * Track unhandled exception.
     * This method supposed to be used inside try/catch block or with window.onerror
     * (contexts won't be attached), but NOT with `addEventListener` - use
     * `enableErrorTracker` for this
     *
     * @param {String} message - Message appeared in console
     * @param {String} filename - Source file (not used)
     * @param {Number} lineno - Line number
     * @param {Number} colno - Column number (not used)
     * @param {Error} error - error object (not present in all browsers)
     * @param {Object[]} contexts - Array of custom contexts
     */
    trackError(message, filename, lineno, colno, error, contexts) {
        return this.track(message, filename, lineno, colno, error, contexts)
    }
}

class ManagedError extends Error {
    constructor(message) {
        super(message)
        this.message = message
    }
}

/**
 * Wrap a function, or object in another function
 *
 * @param {Function} fn - the wrapper function
 * @param {Object} value - the value to be wrapper
 * @returns {Function} - the wrapped function/object
 */
export const wrap = (fn, value) => {
    // not all 'function's are actually functions!
    if (typeof value === 'function') {
        return fn(value)
    } else if (typeof value === 'object' && value !== null) {
        for (var key in value)
            if (value.hasOwnProperty(key)) {
                value[key] = wrap(fn, value[key])
            }
    }

    return value
}

/**
 * Unguard a function
 *
 * @param {Function} fn - the function to unguard
 * @returns {Function} - the unguarded function
 */
export const unguard = fn => {
    return function() {
        try {
            return fn.apply(this, arguments)
        } catch (e) {
            // surface the error
            setTimeout(function() {
                throw e
            }, 0)
        }
    }
}

/**
 * Guard a function
 *
 * @param {Function} fn - the function to guard
 * @returns {Function} - the guarded function
 */
export const guard = fn => {
    return function() {
        // capture the arguments and unguard any functions
        var args = Array.prototype.slice.call(arguments).map(function(arg) {
            return wrap(unguard, arg)
        })

        try {
            return wrap(guard, fn.apply(this, args))
        } catch (e) {
            if (e instanceof ManagedError) {
                throw e
            }
        }
    }
}

/**
 * Guard all functions
 *
 * @param {Array|Object} value - Object or Array of functions to guard
 * @returns {Object} - Object with guarded all functions
 */
export const guardAll = value => {
    var methods = {}
    if (typeof value === 'object' && value !== null) {
        Object.getOwnPropertyNames(value).forEach(function(val) {
            methods[val] = guard(value[val])
        })
    }
    return methods
}

export default ErrorManager