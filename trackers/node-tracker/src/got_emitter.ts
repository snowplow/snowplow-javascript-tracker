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
  /* If the request should undergo server anonymization. */
  serverAnonymization?: boolean;
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
  serverAnonymization
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

    const headers = {
      'user-agent': `snowplow-nodejs-tracker/${version}`,
      ...(serverAnonymization === true && { 'SP-Anonymous': '*' }),
      ...(method === 'post' && { 'content-type': 'application/json; charset=utf-8' }),
    };

    if (method === 'post') {
      const postJson = {
        schema: 'iglu:com.snowplowanalytics.snowplow/payload_data/jsonschema/1-0-4',
        data: bufferCopy.map(preparePayload),
      };
      got
        .post(targetUrl, {
          json: postJson,
          headers,
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
            headers,
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
