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

;(function() {

	var
		json2 = require('JSON'),
		lodash = require('./lib_managed/lodash'),
		localStorageAccessible = require('./lib/detectors').localStorageAccessible,
		helpers = require('./lib/helpers'),
		object = typeof exports !== 'undefined' ? exports : this; // For eventual node.js environment support

	/**
	 * Object handling sending events to a collector.
	 * Instantiated once per tracker instance.
	 *
	 * @param string functionName The Snowplow function name (used to generate the localStorage key)
	 * @param string namespace The tracker instance's namespace (used to generate the localStorage key)
	 * @param object mutSnowplowState Gives the pageUnloadGuard a reference to the outbound queue
	 *                                so it can unload the page when all queues are empty
	 * @param boolean useLocalStorage Whether to use localStorage at all
	 * @param boolean usePost Whether to send events by POST or GET
	 * @param int bufferSize How many events to batch in localStorage before sending them all.
	 *                       Only applies when sending POST requests and when localStorage is available.
	 * @param int maxPostBytes Maximum combined size in bytes of the event JSONs in a POST request
	 * @return object OutQueueManager instance
	 */
	object.OutQueueManager = function (functionName, namespace, mutSnowplowState, useLocalStorage, usePost, bufferSize, maxPostBytes) {
		var	queueName,
			executingQueue = false,
			configCollectorUrl,
			outQueue;

		// Fall back to GET for browsers which don't support CORS XMLHttpRequests (e.g. IE <= 9)
		usePost = usePost && window.XMLHttpRequest && ('withCredentials' in new XMLHttpRequest());

		var path = usePost ? '/com.snowplowanalytics.snowplow/tp2' : '/i';

		bufferSize = (localStorageAccessible() && useLocalStorage && usePost && bufferSize) || 1;

		// Different queue names for GET and POST since they are stored differently
		queueName = ['snowplowOutQueue', functionName, namespace, usePost ? 'post2' : 'get'].join('_');

		if (useLocalStorage) {
			// Catch any JSON parse errors or localStorage that might be thrown
			try {
				// TODO: backward compatibility with the old version of the queue for POST requests
				outQueue = json2.parse(localStorage.getItem(queueName));
			}
			catch(e) {}
		}

		// Initialize to and empty array if we didn't get anything out of localStorage
		if (!lodash.isArray(outQueue)) {
			outQueue = [];
		}

		// Used by pageUnloadGuard
		mutSnowplowState.outQueues.push(outQueue);

		if (usePost && bufferSize > 1) {
			mutSnowplowState.bufferFlushers.push(function () {
				if (!executingQueue) {
					executeQueue();
				}
			});
		}

		/*
		 * Convert a dictionary to a querystring
		 * The context field is the last in the querystring
		 */
		function getQuerystring(request) {
			var querystring = '?',
				lowPriorityKeys = {'co': true, 'cx': true},
				firstPair = true;

			for (var key in request) {
				if (request.hasOwnProperty(key) && !(lowPriorityKeys.hasOwnProperty(key))) {
					if (!firstPair) {
						querystring += '&';
					} else {
						firstPair = false;
					}
					querystring += encodeURIComponent(key) + '=' + encodeURIComponent(request[key]);
				}
			}

			for (var contextKey in lowPriorityKeys) {
				if (request.hasOwnProperty(contextKey)  && lowPriorityKeys.hasOwnProperty(contextKey)) {
					querystring += '&' + contextKey + '=' + encodeURIComponent(request[contextKey]);
				}
			}

			return querystring;
		}

		/*
		 * Convert numeric fields to strings to match payload_data schema
		 */
		function getBody(request) {
			var cleanedRequest = lodash.mapValues(request, function (v) {
				return v.toString();
			});
			return {
				evt: cleanedRequest,
				bytes: getUTF8Length(json2.stringify(cleanedRequest))
			};
		}

		/**
		 * Count the number of bytes a string will occupy when UTF-8 encoded
		 * Taken from http://stackoverflow.com/questions/2848462/count-bytes-in-textarea-using-javascript/
		 *
		 * @param string s
		 * @return number Length of s in bytes when UTF-8 encoded
		 */
		function getUTF8Length(s) {
			var len = 0;
			for (var i = 0; i < s.length; i++) {
				var code = s.charCodeAt(i);
				if (code <= 0x7f) {
					len += 1;
				} else if (code <= 0x7ff) {
					len += 2;
				} else if (code >= 0xd800 && code <= 0xdfff) {
					// Surrogate pair: These take 4 bytes in UTF-8 and 2 chars in UCS-2
					// (Assume next char is the other [valid] half and just skip it)
					len += 4; i++;
				} else if (code < 0xffff) {
					len += 3;
				} else {
					len += 4;
				}
			}
			return len;
		}

		/*
		 * Queue an image beacon for submission to the collector.
		 * If we're not processing the queue, we'll start.
		 */
		function enqueueRequest (request, url) {

			configCollectorUrl = url + path;
			if (usePost) {
				var body = getBody(request);
				if (body.bytes >= maxPostBytes) {
					helpers.warn("Event of size " + body.bytes + " is too long - the maximum size is " + maxPostBytes);
					var xhr = initializeXMLHttpRequest(configCollectorUrl);
					xhr.send(encloseInPayloadDataEnvelope(attachStmToEvent([body.evt])));
					return;
				} else {
					outQueue.push(body);
				}
			} else {
				outQueue.push(getQuerystring(request));
			}
			var savedToLocalStorage = false;
			if (useLocalStorage) {
				savedToLocalStorage = helpers.attemptWriteLocalStorage(queueName, json2.stringify(outQueue));
			}

			if (!executingQueue && (!savedToLocalStorage || outQueue.length >= bufferSize)) {
				executeQueue();
			}
		}

		/*
		 * Run through the queue of image beacons, sending them one at a time.
		 * Stops processing when we run out of queued requests, or we get an error.
		 */
		function executeQueue () {

			// Failsafe in case there is some way for a bad value like "null" to end up in the outQueue
			while (outQueue.length && typeof outQueue[0] !== 'string' && typeof outQueue[0] !== 'object') {
				outQueue.shift();
			}

			if (outQueue.length < 1) {
				executingQueue = false;
				return;
			}

			// Let's check that we have a Url to ping
			if (!lodash.isString(configCollectorUrl)) {
				throw "No Snowplow collector configured, cannot track";
			}

			executingQueue = true;

			var nextRequest = outQueue[0];

			if (usePost) {

				var xhr = initializeXMLHttpRequest(configCollectorUrl);

				// Time out POST requests after 5 seconds
				var xhrTimeout = setTimeout(function () {
					xhr.abort();
					executingQueue = false;
				}, 5000);

				function chooseHowManyToExecute(q) {
					var numberToSend = 0;
					var byteCount = 0;
					while (numberToSend < q.length) {
						byteCount += q[numberToSend].bytes;
						if (byteCount >= maxPostBytes) {
							break;
						} else {
							numberToSend += 1;
						}
					}
					return numberToSend;
				}

				// Keep track of number of events to delete from queue
				var numberToSend = chooseHowManyToExecute(outQueue);

				xhr.onreadystatechange = function () {
					if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 400) {
						for (var deleteCount = 0; deleteCount < numberToSend; deleteCount++) {
							outQueue.shift();
						}
						if (useLocalStorage) {
							helpers.attemptWriteLocalStorage(queueName, json2.stringify(outQueue));
						}
						clearTimeout(xhrTimeout);
						executeQueue();
					} else if (xhr.readyState === 4 && xhr.status >= 400) {
						clearTimeout(xhrTimeout);
						executingQueue = false;
					}
				};

				var batch = lodash.map(outQueue.slice(0, numberToSend), function (x) {
					return x.evt;
				});

				if (batch.length > 0) {
					xhr.send(encloseInPayloadDataEnvelope(attachStmToEvent(batch)));
				}

			} else {

				var image = new Image(1, 1);

				image.onload = function () {
					outQueue.shift();
					if (useLocalStorage) {
						helpers.attemptWriteLocalStorage(queueName, json2.stringify(outQueue));
					}
					executeQueue();
				};

				image.onerror = function () {
					executingQueue = false;
				};

				image.src = configCollectorUrl + nextRequest.replace('?', '?stm=' + new Date().getTime() + '&');
			}
		}

		/**
		 * Open an XMLHttpRequest for a given endpoint with the correct credentials and header
		 *
		 * @param string url The destination URL
		 * @return object The XMLHttpRequest
		 */
		function initializeXMLHttpRequest(url) {
			var xhr = new XMLHttpRequest();
			xhr.open('POST', url, true);
			xhr.withCredentials = true;
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			return xhr;
		}

		/**
		 * Enclose an array of events in a self-describing payload_data JSON string
		 *
		 * @param array events Batch of events
		 * @return string payload_data self-describing JSON
		 */
		function encloseInPayloadDataEnvelope(events) {
			return json2.stringify({
				schema: 'iglu:com.snowplowanalytics.snowplow/payload_data/jsonschema/1-0-3',
				data: events
			});
		}

		/**
		 * Attaches the STM field to outbound POST events.
		 *
		 * @param events the events to attach the STM to
		 */
		function attachStmToEvent(events) {
			var stm = new Date().getTime().toString();
			for (var i = 0; i < events.length; i++) {
				events[i]['stm'] = stm;
			}
			return events
		}

		return {
			enqueueRequest: enqueueRequest,
			executeQueue: executeQueue
		};
	};

}());
