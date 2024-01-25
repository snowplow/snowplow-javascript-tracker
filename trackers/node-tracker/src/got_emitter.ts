import util from 'util';
import got, { Response, RequestError, Agents, RequiredRetryOptions, ToughCookieJar, PromiseCookieJar } from 'got';
import { Payload, version } from '@snowplow/tracker-core';

import { Emitter, HttpProtocol, HttpMethod, preparePayload } from './emitter';

/**
 * Create an emitter object, which uses the `got` library, that will send events to a collector
 *
 * @param endpoint - The collector to which events will be sent
 * @param protocol - http or https
 * @param port - The port for requests to use
 * @param method - get or post
 * @param bufferSize - Number of events which can be queued before flush is called
 * @param retry - Configure the retry policy for `got` - https://github.com/sindresorhus/got/blob/v11.5.2/readme.md#retry
 * @param cookieJar - Add a cookieJar to `got` - https://github.com/sindresorhus/got/blob/v11.5.2/readme.md#cookiejar
 * @param callback - Callback called after a `got` request following retries - called with ErrorRequest (https://github.com/sindresorhus/got/blob/v11.5.2/readme.md#errors) and Response (https://github.com/sindresorhus/got/blob/v11.5.2/readme.md#response)
 * @param agents - Set new http.Agent and https.Agent objects on `got` requests - https://github.com/sindresorhus/got/blob/v11.5.2/readme.md#agent
 * @param serverAnonymization - If the request should undergo server anonymization.
 */
export function gotEmitter(
  endpoint: string,
  protocol: HttpProtocol = HttpProtocol.HTTPS,
  port?: number,
  method?: HttpMethod,
  bufferSize?: number,
  retry?: number | Partial<RequiredRetryOptions>,
  cookieJar?: PromiseCookieJar | ToughCookieJar,
  callback?: (error?: RequestError, response?: Response<string>) => void,
  agents?: Agents,
  serverAnonymization: boolean = false
): Emitter {
  const maxBufferLength = bufferSize ?? (method === HttpMethod.GET ? 0 : 10);
  const path = method === HttpMethod.GET ? '/i' : '/com.snowplowanalytics.snowplow/tp2';
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

    const headers = {
      'user-agent': `snowplow-nodejs-tracker/${version}`,
      ...(serverAnonymization && { 'SP-Anonymous': '*' }),
      ...(method === HttpMethod.POST && { 'content-type': 'application/json; charset=utf-8' }),
    };

    if (method === HttpMethod.POST) {
      const postJson = {
        schema: 'iglu:com.snowplowanalytics.snowplow/payload_data/jsonschema/1-0-4',
        data: bufferCopy.map(preparePayload),
      };
      got
        .post(targetUrl, {
          json: postJson,
          agent: agents,
          headers,
          retry,
          cookieJar,
        })
        .then(handleSuccess, handleFailure);
    } else {
      for (let i = 0; i < bufferCopy.length; i++) {
        got
          .get(targetUrl, {
            searchParams: preparePayload(bufferCopy[i]),
            agent: agents,
            headers,
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

  const setAnonymization = (shouldAnonymize: boolean) => {
    serverAnonymization = shouldAnonymize;
  };

  return {
    /**
     * Send all events queued in the buffer to the collector
     */
    flush,
    input,
    setAnonymization,
  };
}
