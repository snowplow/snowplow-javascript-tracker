/*
 * JavaScript tracker for Snowplow: out_queue.js
 *
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright
 * 2012-2020 Snowplow Analytics Ltd. All rights reserved.
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

import mapValues from 'lodash/mapValues';
import isString from 'lodash/isString';
import map from 'lodash/map';
import {
  warn,
  attemptWriteLocalStorage,
  attemptWriteSessionStorage,
  attemptGetSessionStorage,
  localStorageAccessible,
  SharedState,
} from '@snowplow/browser-core';
import { Payload } from '@snowplow/tracker-core';
import { OutQueue } from './types';

/**
 * Object handling sending events to a collector.
 * Instantiated once per tracker instance.
 *
 * @param string functionName The Snowplow function name (used to generate the localStorage key)
 * @param string namespace The tracker instance's namespace (used to generate the localStorage key)
 * @param object mutSnowplowState Gives the pageUnloadGuard a reference to the outbound queue
 *                                so it can unload the page when all queues are empty
 * @param boolean useLocalStorage Whether to use localStorage at all
 * @param string eventMethod if null will use 'beacon' otherwise can be set to 'post', 'get', or 'beacon' to force.
 * @param string postPath The path where events are to be posted
 * @param int bufferSize How many events to batch in localStorage before sending them all.
 *                       Only applies when sending POST requests and when localStorage is available.
 * @param int maxPostBytes Maximum combined size in bytes of the event JSONs in a POST request
 * @param boolean useStm Whether to add timestamp to events
 * @param int maxLocalStorageQueueSize Maximum number of queued events we will attempt to store in local storage.
 *
 * @return object OutQueueManager instance
 */
export function OutQueueManager(
  functionName: string,
  namespace: string,
  mutSnowplowState: SharedState,
  useLocalStorage: boolean,
  eventMethod: string | boolean | null,
  postPath: string,
  bufferSize: number,
  maxPostBytes: number,
  useStm: boolean,
  maxLocalStorageQueueSize: number,
  connectionTimeout: number,
  anonymousTracking: boolean
): OutQueue {
  type PostEvent = {
    evt: Record<string, unknown>;
    bytes: number;
  };

  var localStorageAlias = window.localStorage,
    queueName: string,
    executingQueue = false,
    configCollectorUrl: string,
    outQueue: Array<PostEvent> | Array<string> = [],
    preflightName: string,
    beaconPreflight: boolean;

  //Force to lower case if its a string
  eventMethod = typeof eventMethod === 'string' ? eventMethod.toLowerCase() : eventMethod;

  // Use the Beacon API if eventMethod is set null, true, or 'beacon'.
  var isBeaconRequested =
    eventMethod === null || eventMethod === true || eventMethod === 'beacon' || eventMethod === 'true';
  // Fall back to POST or GET for browsers which don't support Beacon API
  var isBeaconAvailable = Boolean(isBeaconRequested && navigator && navigator.sendBeacon);
  var useBeacon = isBeaconAvailable && isBeaconRequested;

  // Use GET if specified
  var isGetRequested = eventMethod === 'get';

  // Don't use XhrHttpRequest for browsers which don't support CORS XMLHttpRequests (e.g. IE <= 9)
  var useXhr = Boolean(window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest());

  // Use POST if specified
  var usePost = !isGetRequested && useXhr && (eventMethod === 'post' || isBeaconRequested);

  // Resolve all options and capabilities and decide path
  var path = usePost ? postPath : '/i';

  bufferSize = (localStorageAccessible() && useLocalStorage && usePost && bufferSize) || 1;

  // Different queue names for GET and POST since they are stored differently
  queueName = `snowplowOutQueue_${functionName}_${namespace}_${usePost ? 'post2' : 'get'}`;
  // Storage name for checking if preflight POST has been sent for Beacon API
  preflightName = `spBeaconPreflight_${functionName}_${namespace}`;

  if (useLocalStorage) {
    // Catch any JSON parse errors or localStorage that might be thrown
    try {
      const localStorageQueue = localStorageAlias.getItem(queueName);
      outQueue = localStorageQueue ? JSON.parse(localStorageQueue) : [];
    } catch (e) {}
  }

  // Initialize to and empty array if we didn't get anything out of localStorage
  if (!Array.isArray(outQueue)) {
    outQueue = [];
  }

  // Used by pageUnloadGuard
  mutSnowplowState.outQueues.push(outQueue);

  if (useXhr && bufferSize > 1) {
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
  function getQuerystring(request: Payload) {
    let querystring = '?',
      lowPriorityKeys = { co: true, cx: true },
      firstPair = true;

    for (const key in request) {
      if (request.hasOwnProperty(key) && !lowPriorityKeys.hasOwnProperty(key)) {
        if (!firstPair) {
          querystring += '&';
        } else {
          firstPair = false;
        }
        querystring += encodeURIComponent(key) + '=' + encodeURIComponent(request[key] as string | number | boolean);
      }
    }

    for (const contextKey in lowPriorityKeys) {
      if (request.hasOwnProperty(contextKey) && lowPriorityKeys.hasOwnProperty(contextKey)) {
        querystring += '&' + contextKey + '=' + encodeURIComponent(request[contextKey] as string | number | boolean);
      }
    }

    return querystring;
  }

  /*
   * Convert numeric fields to strings to match payload_data schema
   */
  function getBody(request: Payload): PostEvent {
    var cleanedRequest = mapValues(request, function (v: Object) {
      return v.toString();
    });
    return {
      evt: cleanedRequest,
      bytes: getUTF8Length(JSON.stringify(cleanedRequest)),
    };
  }

  /**
   * Count the number of bytes a string will occupy when UTF-8 encoded
   * Taken from http://stackoverflow.com/questions/2848462/count-bytes-in-textarea-using-javascript/
   *
   * @param string s
   * @return number Length of s in bytes when UTF-8 encoded
   */
  function getUTF8Length(s: string) {
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
        len += 4;
        i++;
      } else if (code < 0xffff) {
        len += 3;
      } else {
        len += 4;
      }
    }
    return len;
  }

  const postable = (queue: Array<PostEvent> | Array<string>): queue is Array<PostEvent> => {
    return typeof queue[0] === 'object';
  };

  /*
   * Queue an image beacon for submission to the collector.
   * If we're not processing the queue, we'll start.
   */
  function enqueueRequest(request: Payload, url: string) {
    configCollectorUrl = url + path;
    if (usePost) {
      var body = getBody(request);
      if (body.bytes >= maxPostBytes) {
        warn('Event (' + body.bytes + 'B) too big, max is ' + maxPostBytes);
        var xhr = initializeXMLHttpRequest(configCollectorUrl, true);
        xhr.send(encloseInPayloadDataEnvelope(attachStmToEvent([body.evt])));
        return;
      } else {
        (outQueue as Array<PostEvent>).push(body);
      }
    } else {
      (outQueue as Array<string>).push(getQuerystring(request));
    }
    var savedToLocalStorage = false;
    if (useLocalStorage) {
      savedToLocalStorage = attemptWriteLocalStorage(
        queueName,
        JSON.stringify(outQueue.slice(0, maxLocalStorageQueueSize))
      );
    }

    if (!executingQueue && (!savedToLocalStorage || outQueue.length >= bufferSize)) {
      executeQueue();
    }
  }

  /*
   * Run through the queue of image beacons, sending them one at a time.
   * Stops processing when we run out of queued requests, or we get an error.
   */
  function executeQueue() {
    // Failsafe in case there is some way for a bad value like "null" to end up in the outQueue
    while (outQueue.length && typeof outQueue[0] !== 'string' && typeof outQueue[0] !== 'object') {
      outQueue.shift();
    }

    if (outQueue.length < 1) {
      executingQueue = false;
      return;
    }

    // Let's check that we have a Url to ping
    if (!isString(configCollectorUrl)) {
      throw 'No collector configured';
    }

    executingQueue = true;

    if (useXhr) {
      // Keep track of number of events to delete from queue
      const chooseHowManyToSend = (queue: Array<{ bytes: number }>) => {
        let numberToSend = 0,
          byteCount = 0;
        while (numberToSend < queue.length) {
          byteCount += queue[numberToSend].bytes;
          if (byteCount >= maxPostBytes) {
            break;
          } else {
            numberToSend += 1;
          }
        }
        return numberToSend;
      };

      let url: string, xhr: XMLHttpRequest, numberToSend: number;
      if (postable(outQueue)) {
        url = configCollectorUrl;
        xhr = initializeXMLHttpRequest(url, true);
        numberToSend = chooseHowManyToSend(outQueue);
      } else {
        url = createGetUrl(outQueue[0]);
        xhr = initializeXMLHttpRequest(url, false);
        numberToSend = 1;
      }

      // Time out POST requests after connectionTimeout
      const xhrTimeout = setTimeout(function () {
        xhr.abort();
        executingQueue = false;
      }, connectionTimeout);

      // The events (`numberToSend` of them), have been sent, so we remove them from the outQueue
      // We also call executeQueue() again, to let executeQueue() check if we should keep running through the queue
      const onPostSuccess = (numberToSend: number): void => {
        for (var deleteCount = 0; deleteCount < numberToSend; deleteCount++) {
          outQueue.shift();
        }
        if (useLocalStorage) {
          attemptWriteLocalStorage(queueName, JSON.stringify(outQueue.slice(0, maxLocalStorageQueueSize)));
        }
        executeQueue();
      };

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 400) {
          clearTimeout(xhrTimeout);
          if (useBeacon && !beaconPreflight) {
            attemptWriteSessionStorage(preflightName, '*');
          }
          onPostSuccess(numberToSend);
        } else if (xhr.readyState === 4 && xhr.status >= 400) {
          clearTimeout(xhrTimeout);
          executingQueue = false;
        }
      };

      if (!postable(outQueue)) {
        xhr.send();
      } else {
        let batch = outQueue.slice(0, numberToSend);

        if (batch.length > 0) {
          let beaconStatus = false;

          //If using Beacon, check we have sent at least one request using POST as Safari doesn't preflight Beacon
          beaconPreflight = beaconPreflight || (useBeacon && !!attemptGetSessionStorage(preflightName));

          const eventBatch = map(batch, function (x) {
            return x.evt;
          });

          if (beaconPreflight) {
            const blob = new Blob([encloseInPayloadDataEnvelope(attachStmToEvent(eventBatch))], {
              type: 'application/json',
            });
            try {
              beaconStatus = navigator.sendBeacon(url, blob);
            } catch (error) {
              beaconStatus = false;
            }
          }
          // When beaconStatus is true, we can't _guarantee_ that it was successful (beacon queues asynchronously)
          // but the browser has taken it out of our hands, so we want to flush the queue assuming it will do its job
          if (beaconStatus === true) {
            onPostSuccess(numberToSend);
          }

          if (!useBeacon || !beaconStatus) {
            xhr.send(encloseInPayloadDataEnvelope(attachStmToEvent(eventBatch)));
          }
        }
      }
    } else if (!anonymousTracking && !postable(outQueue)) {
      let image = new Image(1, 1),
        loading = true;

      image.onload = function () {
        if (!loading) return;
        loading = false;
        outQueue.shift();
        if (useLocalStorage) {
          attemptWriteLocalStorage(queueName, JSON.stringify(outQueue.slice(0, maxLocalStorageQueueSize)));
        }
        executeQueue();
      };

      image.onerror = function () {
        if (!loading) return;
        loading = false;
        executingQueue = false;
      };

      image.src = createGetUrl(outQueue[0]);

      setTimeout(function () {
        if (loading && executingQueue) {
          loading = false;
          executeQueue();
        }
      }, connectionTimeout);
    } else {
      executingQueue = false;
    }
  }

  /**
   * Open an XMLHttpRequest for a given endpoint with the correct credentials and header
   *
   * @param string url The destination URL
   * @return object The XMLHttpRequest
   */
  function initializeXMLHttpRequest(url: string, post: boolean) {
    var xhr = new XMLHttpRequest();
    if (post) {
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    } else {
      xhr.open('GET', url, true);
    }
    xhr.withCredentials = true;
    if (anonymousTracking) {
      xhr.setRequestHeader('SP-Anonymous', '*');
    }
    return xhr;
  }

  /**
   * Enclose an array of events in a self-describing payload_data JSON string
   *
   * @param array events Batch of events
   * @return string payload_data self-describing JSON
   */
  function encloseInPayloadDataEnvelope(events: Array<Record<string, unknown>>) {
    return JSON.stringify({
      schema: 'iglu:com.snowplowanalytics.snowplow/payload_data/jsonschema/1-0-4',
      data: events,
    });
  }

  /**
   * Attaches the STM field to outbound POST events.
   *
   * @param events the events to attach the STM to
   */
  function attachStmToEvent(events: Array<Record<string, unknown>>) {
    var stm = new Date().getTime().toString();
    for (var i = 0; i < events.length; i++) {
      events[i]['stm'] = stm;
    }
    return events;
  }

  /**
   * Creates the full URL for sending the GET request. Will append `stm` if enabled
   *
   * @param nextRequest the query string of the next request
   */
  function createGetUrl(nextRequest: string) {
    if (useStm) {
      return configCollectorUrl + nextRequest.replace('?', '?stm=' + new Date().getTime() + '&');
    }

    return configCollectorUrl + nextRequest;
  }

  return {
    enqueueRequest: enqueueRequest,
    executeQueue: () => {
      if (!executingQueue) {
        executeQueue();
      }
    },
    setUseLocalStorage: (localStorage: boolean) => {
      useLocalStorage = localStorage;
    },
    setAnonymousTracking: (anonymous: boolean) => {
      anonymousTracking = anonymous;
    },
    setCollectorUrl: (url: string) => {
      configCollectorUrl = url + path;
    },
  };
}
