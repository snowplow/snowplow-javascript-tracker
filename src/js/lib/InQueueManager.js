/*
 * JavaScript tracker for Snowplow: InQueueManager.js
 *
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright
 * 2012-2014 Snowplow Analytics Ltd. All rights reserved.
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

import { warn, isFunction} from './Utilities'

// Symbols for private methods
const getNamedTrackers = Symbol('getNamedTrackers')
const applyAsyncFunction = Symbol('applyAsyncFunction')
const legacyCreateNewNamespace = Symbol('legacyCreateNewNamespace')
const createNewNamespace = Symbol('createNewNamespace')
const parseInputString = Symbol('parseInputString')

// Page view ID should be shared between all tracker instances
let trackerDictionary = {}

class InQueueManager {
    /**
     * Creates a new proxy object to manage the event queue
     *
     * @param {Function} TrackerConstructor - the constructor a new tracker
     * @param {String} version - the version of the tracker
     * @param {Object} mutSnowplowState - the mutable snowplow state
     * @param {Object} asyncQueue - the queue object to manage
     * @param {Object} functionName - the Snowplow function name (used to generate the localStorage key)
     */
    constructor(
        TrackerConstructor,
        version,
        mutSnowplowState,
        asyncQueue,
        functionName
    ) {
        this.TrackerConstructor = TrackerConstructor
        this.version = version
        this.mutSnowplowState = mutSnowplowState
        this.asyncQueue = asyncQueue
        this.functionName = functionName

        // We need to manually apply any events collected before this initialization
        for (var i = 0; i < asyncQueue.length; i++) {
            this[applyAsyncFunction](asyncQueue[i])
        }
    }

    /**
     *
     * Private Methods
     *
     */

    /**
     * Get an array of trackers to which a function should be applied.
     *
     * @param {Array} names -  List of namespaces to use. If empty, use all namespaces.
     * @returns {Array} - array of trackers
     */
    [getNamedTrackers](names) {
        var namedTrackers = []

        if (!names || names.length === 0) {
            namedTrackers = Object.keys(trackerDictionary).map(tracker=>trackerDictionary[tracker])
        } else {
            for (var i = 0; i < names.length; i++) {
                if (trackerDictionary.hasOwnProperty(names[i])) {
                    namedTrackers.push(trackerDictionary[names[i]])
                } else {
                    warn(
                        'Warning: Tracker namespace "' +
                            names[i] +
                            '" not configured'
                    )
                }
            }
        }

        if (namedTrackers.length === 0) {
            warn('Warning: No tracker configured')
        }

        return namedTrackers
    }

    /**
     * Legacy support for input of the form _snaq.push(['setCollectorCf', 'd34uzc5hjrimh8'])
     *
     * @param {String} f - Either 'setCollectorCf' or 'setCollectorUrl'
     * @param {String} endpoint - Collector endpoint
     * @param {String} namespace -  Optional tracker name
     * @deprecated - This will be removed soon. Use createNewNamespace instead
     */
    [legacyCreateNewNamespace](f, endpoint, namespace) {
        //TODO: remove this in 2.1.0
        warn(
            `${f} is deprecated. Set the collector when a new tracker instance using newTracker.`
        )

        var name

        if (namespace === undefined) {
            name = 'sp'
        } else {
            name = namespace
        }

        this[createNewNamespace](name)
        trackerDictionary[name][f](endpoint)
    }

    /**
     * Initiate a new tracker namespace
     *
     * @param {String} namespace - Namespace to create
     * @param {String} endpoint -  with the form d3rkrsqld9gmqf.cloudfront.net
     */
    [createNewNamespace](namespace, endpoint, argmap) {
        argmap = argmap || {}

        if (!trackerDictionary.hasOwnProperty(namespace)) {
            trackerDictionary[namespace] = new this.TrackerConstructor(
                this.functionName,
                namespace,
                this.version,
                this.mutSnowplowState,
                argmap
            )
            trackerDictionary[namespace].setCollectorUrl(endpoint)
        } else {
            warn('Tracker namespace ' + namespace + ' already exists.')
        }
    }

    /**
     * Output an array of the form ['functionName', [trackerName1, trackerName2, ...]]
     *
     * @param {String} inputString - The input string to parse
     * @returns {Array} - ['functionName', [trackerName1, trackerName2, ...]]
     */
    [parseInputString](inputString) {
        var separatedString = inputString.split(':'),
            extractedFunction = separatedString[0],
            extractedNames =
                separatedString.length > 1 ? separatedString[1].split(';') : []

        return [extractedFunction, extractedNames]
    }

    /**
     * Apply wrapper function
     *
     * @param {Array} parameterArray An array comprising either:
     *      [ 'methodName', optional_parameters ]
     * or:
     *      [ functionObject, optional_parameters ]
     */
    [applyAsyncFunction]() {
        var i, j, f, parameterArray, input, parsedString, names, namedTrackers

        // Outer loop in case someone push'es in zarg of arrays
        for (i = 0; i < arguments.length; i += 1) {
            parameterArray = arguments[i]

            // Arguments is not an array, so we turn it into one
            input = Array.prototype.shift.call(parameterArray)

            // Custom callback rather than tracker method, called with trackerDictionary as the context
            if (isFunction(input)) {
                input.apply(trackerDictionary, parameterArray)
                continue
            }

            parsedString = this[parseInputString](input)
            f = parsedString[0]
            names = parsedString[1]

            if (f === 'newTracker') {
                this[createNewNamespace](
                    parameterArray[0],
                    parameterArray[1],
                    parameterArray[2]
                )
                continue
            }

            if (
                (f === 'setCollectorCf' || f === 'setCollectorUrl') &&
                (!names || names.length === 0)
            ) {
                this[legacyCreateNewNamespace](
                    f,
                    parameterArray[0],
                    parameterArray[1]
                )
                continue
            }

            namedTrackers = this[getNamedTrackers](names)

            for (j = 0; j < namedTrackers.length; j++) {
                namedTrackers[j][f].apply(namedTrackers[j], parameterArray)
            }
        }
    }

    /**
     *
     * Public Methods
     *
     */

    /**
     * @param {any} - Push x to async queue
     */
    push() {
        this[applyAsyncFunction].apply(this, arguments)
    }
}

export default InQueueManager
