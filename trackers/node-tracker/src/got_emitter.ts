/*
 * Copyright (c) 2022 Snowplow Analytics Ltd
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

import util from 'util';
import got, { Response, RequestError, RequiredRetryOptions, PromiseCookieJar, ToughCookieJar, Agents } from 'got';
import { Payload, version } from '@snowplow/tracker-core';

import { Emitter, preparePayload } from './emitter';

export interface GotEmitterConfiguration {
  /* The collector URL to which events will be sent */
  endpoint: string;
  /* http or https. Defaults to https */
  protocol?: 'http' | 'https';
  /* Collector port number */
  port?: number;
  /* get or post. Defaults to post */
  method?: 'get' | 'post';
  /* Number of events which can be queued before flush is called */
  bufferSize?: number;
  /*  Configure the retry policy for got */
  retry?: number | Partial<RequiredRetryOptions>;
  /* Add a cookieJar to got */
  cookieJar?: PromiseCookieJar | ToughCookieJar;
  /* Callback called after a `got` request following retries */
  callback?: (error?: RequestError, response?: Response<string>) => void;
  /* Set new http.Agent and https.Agent objects on `got` requests */
  agent?: Agents;
}

/**
 * Create an emitter object, which uses the `got` library, that will send events to a collector
 */
export function gotEmitter({
  endpoint,
  protocol = 'https',
  port,
  method = 'post',
  bufferSize,
  retry,
  cookieJar,
  callback,
  agent,
}: GotEmitterConfiguration): Emitter {
  const maxBufferLength = bufferSize ?? (method === 'get' ? 0 : 10);
  const path = method === 'get' ? '/i' : '/com.snowplowanalytics.snowplow/tp2';
  const targetUrl = protocol + '://' + endpoint + (port ? ':' + port : '') + path;
  const debuglog = util.debuglog('snowplow');

  let buffer: Array<Payload> = [];

  /**
   * Handles the callback on a successful response if the callback is present
   * @param response - The got response object
   */
  const handleSuccess = (response: Response<string>) => {
    if (callback) {
      try {
        callback(undefined, response);
      } catch (e) {
        debuglog('Error in callback after failure', e);
      }
    }
  };

  /**
   * Handles the callback on a failed request if the callback is present
   * @param error - The got error object
   */
  const handleFailure = (error: RequestError) => {
    if (callback) {
      try {
        callback(error);
      } catch (e) {
        debuglog('Error in callback after failure', e);
      }
    }
  };

  /**
   * Flushes all events currently stored in buffer
   */
  const flush = (): void => {
    const bufferCopy = buffer;
    buffer = [];
    if (bufferCopy.length === 0) {
      return;
    }

    if (method === 'post') {
      const postJson = {
        schema: 'iglu:com.snowplowanalytics.snowplow/payload_data/jsonschema/1-0-4',
        data: bufferCopy.map(preparePayload),
      };
      got
        .post(targetUrl, {
          json: postJson,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'user-agent': `snowplow-nodejs-tracker/${version}`,
          },
          agent,
          retry,
          cookieJar,
        })
        .then(handleSuccess, handleFailure);
    } else {
      for (let i = 0; i < bufferCopy.length; i++) {
        got
          .get(targetUrl, {
            searchParams: preparePayload(bufferCopy[i]),
            headers: {
              'user-agent': `snowplow-nodejs-tracker/${version}`,
            },
            agent,
            retry,
            cookieJar,
          })
          .then(handleSuccess, handleFailure);
      }
    }
  };

  /**
   * Adds a payload to the internal buffer and sends if buffer >= bufferSize
   * @param payload - Payload to add to buffer
   */
  const input = (payload: Payload): void => {
    buffer.push(payload);
    if (buffer.length >= maxBufferLength) {
      flush();
    }
  };

  return {
    /**
     * Send all events queued in the buffer to the collector
     */
    flush,
    input,
  };
}
