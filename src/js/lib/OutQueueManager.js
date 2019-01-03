/*
 * JavaScript tracker for Snowplow: out_queue.js
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

import { attemptWriteLocalStorage, warn } from './Utilities'
import { localStorageAccessible } from './Detect'
import mapValues from 'lodash-es/mapValues'
import isString from 'lodash-es/isString'
import isArray from 'lodash-es/isArray'

// Symbols for private methods
const getQuerystring = Symbol('getQuerystring')
const getBody = Symbol('getBody')
const getUTF8Length = Symbol('getUTF8Length')
const initializeXMLHttpRequest = Symbol('initializeXMLHttpRequest')
const encloseInPayloadDataEnvelope = Symbol('encloseInPayloadDataEnvelope')
const attachStmToEvent = Symbol('attachStmToEvent')

class OutQueueManager {
    /**
     * Object handling sending events to a collector.
     * Instantiated once per tracker instance.
     *
     * @param {String} functionName - The Snowplow function name (used to generate the localStorage key)
     * @param {String} namespace - The tracker instance's namespace (used to generate the localStorage key)
     * @param {Object} mutSnowplowState - Gives the pageUnloadGuard a reference to the outbound queue
     *                                so it can unload the page when all queues are empty
     * @param {Boolean} useLocalStorage - Whether to use localStorage at all
     * @param {Boolean} usePost - Whether to send events by POST or GET
     * @param {Number} bufferSize - How many events to batch in localStorage before sending them all.
     *                       Only applies when sending POST requests and when localStorage is available.
     * @param {Number} maxPostBytes -  Maximum combined size in bytes of the event JSONs in a POST request
     * @returns {Object} OutQueueManager instance
     */
    constructor(
        functionName,
        namespace,
        mutSnowplowState,
        useLocalStorage,
        useBeacon, 
        usePost, 
        bufferSize,
        maxPostBytes
    ) {
        this.functionName = functionName
        this.namespace = namespace
        this.mutSnowplowState = mutSnowplowState
        this.useLocalStorage = useLocalStorage
        this.bufferSize = bufferSize
        this.maxPostBytes = maxPostBytes

        this.executingQueue = false
        this.configCollectorUrl = null
        this.outQueue = null

        // Fall back to GET for browsers which don't support CORS XMLHttpRequests (e.g. IE <= 9)
        usePost =
            usePost &&
            window.XMLHttpRequest &&
            'withCredentials' in new XMLHttpRequest()

        this.useBeacon = useBeacon && navigator && navigator.sendBeacon
        this.usePost = usePost
        this.path = this.useBeacon || this.usePost ? '/com.snowplowanalytics.snowplow/tp2' : '/i'

        bufferSize =
            (localStorageAccessible() &&
                useLocalStorage &&
                usePost &&
                bufferSize) ||
            1

        // Different queue names for GET and POST since they are stored differently
        this.queueName = [
            'snowplowOutQueue',
            functionName,
            namespace,
            usePost ? 'post2' : 'get',
        ].join('_')

        if (this.useLocalStorage) {
            // Catch any JSON parse errors or localStorage that might be thrown
            try {
                // TODO: backward compatibility with the old version of the queue for POST requests
                this.outQueue = JSON.parse(localStorage.getItem(this.queueName))
            } catch (e) {
                //TODO: add error handling here?
            }
        }

        // Initialize to and empty array if we didn't get anything out of localStorage
        if (!isArray(this.outQueue)) {
            this.outQueue = []
        }
        
        // Used by pageUnloadGuard
        this.mutSnowplowState.outQueues.push(this.outQueue)

        if (usePost && bufferSize > 1) {
            this.mutSnowplowState.bufferFlushers.push(function() {
                if (!this.executingQueue) {
                    this.executeQueue()
                }
            })
        }
    }

    /**
     *
     * Private Methods
     *
     */

    /*
     * Convert a dictionary to a querystring
     * The context field is the last in the querystring
     */
    [getQuerystring](request) {
        var querystring = '?',
            lowPriorityKeys = { co: true, cx: true },
            firstPair = true

        for (var key in request) {
            if (
                request.hasOwnProperty(key) &&
                !lowPriorityKeys.hasOwnProperty(key)
            ) {
                if (!firstPair) {
                    querystring += '&'
                } else {
                    firstPair = false
                }
                querystring +=
                    encodeURIComponent(key) +
                    '=' +
                    encodeURIComponent(request[key])
            }
        }

        for (var contextKey in lowPriorityKeys) {
            if (
                request.hasOwnProperty(contextKey) &&
                lowPriorityKeys.hasOwnProperty(contextKey)
            ) {
                querystring +=
                    '&' +
                    contextKey +
                    '=' +
                    encodeURIComponent(request[contextKey])
            }
        }

        return querystring
    }

    /*
     * Convert numeric fields to strings to match payload_data schema
     */
    [getBody](request) {
        var cleanedRequest = mapValues(request, function(v) {
            return v.toString()
        })
        return {
            evt: cleanedRequest,
            bytes: this[getUTF8Length](JSON.stringify(cleanedRequest)),
        }
    }

    /**
     * Count the number of bytes a string will occupy when UTF-8 encoded
     * Taken from http://stackoverflow.com/questions/2848462/count-bytes-in-textarea-using-javascript/
     *
     * @param {String} s - string
     * @returns {Number} Length of s in bytes when UTF-8 encoded
     */
    [getUTF8Length](s) {
        var len = 0
        for (var i = 0; i < s.length; i++) {
            var code = s.charCodeAt(i)
            if (code <= 0x7f) {
                len += 1
            } else if (code <= 0x7ff) {
                len += 2
            } else if (code >= 0xd800 && code <= 0xdfff) {
                // Surrogate pair: These take 4 bytes in UTF-8 and 2 chars in UCS-2
                // (Assume next char is the other [valid] half and just skip it)
                len += 4
                i++
            } else if (code < 0xffff) {
                len += 3
            } else {
                len += 4
            }
        }
        return len
    }

    /**
     * Open an XMLHttpRequest for a given endpoint with the correct credentials and header
     *
     * @param {String} url = The destination URL
     * @returns {Object} -  The XMLHttpRequest
     */
    [initializeXMLHttpRequest](url) {
        var xhr = new XMLHttpRequest()
        xhr.open('POST', url, true)
        xhr.withCredentials = true
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
        return xhr
    }

    /**
     * Enclose an array of events in a self-describing payload_data JSON string
     *
     * @param {Array} events Batch of events
     * @returns {String} payload_data self-describing JSON
     */
    [encloseInPayloadDataEnvelope](events) {
        return JSON.stringify({
            schema:
                'iglu:com.snowplowanalytics.snowplow/payload_data/jsonschema/1-0-4',
            data: events,
        })
    }

    /**
     * Attaches the STM field to outbound POST events.
     *
     * @param {Array} events -  the array events to attach the STM to
     * @returns {Array} - the modified array
     */
    [attachStmToEvent](events) {
        var stm = new Date().getTime().toString()
        for (var i = 0; i < events.length; i++) {
            events[i]['stm'] = stm
        }
        return events
    }

    /**
     *
     * Public Methods
     *
     */

    /*
     * Queue an image beacon for submission to the collector.
     * If we're not processing the queue, we'll start.
     */
    enqueueRequest(request, url) {
        this.configCollectorUrl = `${url}${this.path}`
        if (this.usePost) {
            var body = this[getBody](request)
            if (body.bytes >= this.maxPostBytes) {
                warn(
                    'Event of size ' +
                        body.bytes +
                        ' is too long - the maximum size is ' +
                        this.maxPostBytes
                )
                var xhr = this[initializeXMLHttpRequest](
                    this.configCollectorUrl
                )
                xhr.send(
                    this[encloseInPayloadDataEnvelope](
                        this[attachStmToEvent]([body.evt])
                    )
                )
                return
            } else {
                this.outQueue.push(body)
            }
        } else {
            this.outQueue.push(this[getQuerystring](request))
        }
        var savedToLocalStorage = false
        if (this.useLocalStorage) {
            savedToLocalStorage = attemptWriteLocalStorage(
                this.queueName,
                JSON.stringify(this.outQueue)
            )
        }

        if (
            !this.executingQueue &&
            (!savedToLocalStorage || this.outQueue.length >= this.bufferSize)
        ) {
            this.executeQueue()
        }
    }

    /*
     * Run through the queue of image beacons, sending them one at a time.
     * Stops processing when we run out of queued requests, or we get an error.
     */
    executeQueue() {
        const chooseHowManyToExecute= (q) => {
            var numberToSend = 0
            var byteCount = 0
            while (numberToSend < q.length) {
                byteCount += q[numberToSend].bytes
                if (byteCount >= this.maxPostBytes) {
                    break
                } else {
                    numberToSend += 1
                }
            }
            return numberToSend
        }

        // Failsafe in case there is some way for a bad value like "null" to end up in the outQueue
        while (
            this.outQueue.length &&
            typeof this.outQueue[0] !== 'string' &&
            typeof this.outQueue[0] !== 'object'
        ) {
            this.outQueue.shift()
        }

        if (this.outQueue.length < 1) {
            this.executingQueue = false
            return
        }

        // Let's check that we have a Url to ping
        if (!isString(this.configCollectorUrl)) {
            throw 'No Snowplow collector configured, cannot track'
        }

        this.executingQueue = true

        var nextRequest = this.outQueue[0]

        if (this.usePost || this.useBeacon) {
            var xhr = this[initializeXMLHttpRequest](this.configCollectorUrl)

            // Time out POST requests after 5 seconds
            var xhrTimeout = setTimeout(()=> {
                xhr.abort()
                this.executingQueue = false
            }, 5000)

            // Keep track of number of events to delete from queue
            var numberToSend = chooseHowManyToExecute(this.outQueue)

            xhr.onreadystatechange = () => {
                if (
                    xhr.readyState === 4 &&
                    xhr.status >= 200 &&
                    xhr.status < 400
                ) {
                    for (
                        var deleteCount = 0;
                        deleteCount < numberToSend;
                        deleteCount++
                    ) {
                        this.outQueue.shift()
                    }
                    if (this.useLocalStorage) {
                        attemptWriteLocalStorage(
                            this.queueName,
                            JSON.stringify(this.outQueue)
                        )
                    }
                    clearTimeout(xhrTimeout)
                    this.executeQueue()
                } else if (xhr.readyState === 4 && xhr.status >= 400) {
                    clearTimeout(xhrTimeout)
                    this.executingQueue = false
                }
            }

            var batch = this.outQueue.slice(0, numberToSend).map(x => {
                return x.evt
            })

            if (batch.length > 0) {
                let beaconStatus

                if (this.useBeacon) {
                    beaconStatus = navigator.sendBeacon(this.configCollectorUrl, encloseInPayloadDataEnvelope(attachStmToEvent(batch)))
                }
                if (!this.useBeacon || !beaconStatus) {
                    xhr.send(encloseInPayloadDataEnvelope(attachStmToEvent(batch)))
                }

                xhr.send(
                    this[encloseInPayloadDataEnvelope](
                        this[attachStmToEvent](batch)
                    )
                )
            }
        } else {
            var image = new Image(1, 1)

            image.onload = ()=> {
                this.outQueue.shift()
                if (this.useLocalStorage) {
                    attemptWriteLocalStorage(
                        this.queueName,
                        JSON.stringify(this.outQueue)
                    )
                }
                this.executeQueue()
            }

            image.onerror = ()=> {
                this.executingQueue = false
            }

            image.src =
                this.configCollectorUrl +
                nextRequest.replace('?', '?stm=' + new Date().getTime() + '&')
        }
    }
}

export default OutQueueManager
