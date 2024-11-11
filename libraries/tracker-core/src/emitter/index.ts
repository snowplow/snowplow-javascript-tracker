import { EventStore, newInMemoryEventStore } from '../event_store';
import { Payload } from '../payload';
import { EmitterRequest, newEmitterRequest } from './emitter_request';
import { EmitterEvent, newEmitterEvent } from './emitter_event';
import { newEventStorePayload } from '../event_store_payload';
import { LOG } from '../logger';

/**
 * A collection of event payloads which are sent to the collector.
 */
export type EventBatch = Payload[];

/**
 * The data that will be available to the `onRequestFailure` callback
 */
export type RequestFailure = {
  /** The batch of events that failed to send */
  events: EventBatch;
  /** The status code of the failed request */
  status?: number;
  /** The error message of the failed request */
  message?: string;
  /** Whether the tracker will retry the request */
  willRetry: boolean;
};

/* The supported methods which events can be sent with */
export type EventMethod = 'post' | 'get';

export interface EmitterConfigurationBase {
  /**
   * The preferred technique to use to send events
   * @defaultValue post
   */
  eventMethod?: EventMethod;
  /**
   * The post path which events will be sent to.
   * Ensure your collector is configured to accept events on this post path
   * @defaultValue '/com.snowplowanalytics.snowplow/tp2'
   */
  postPath?: string;
  /**
   * The amount of events that should be buffered before sending
   * Recommended to leave as 1 to reduce change of losing events
   * @defaultValue 1 on Web, 10 on Node
   */
  bufferSize?: number;
  /**
   * The max size a POST request can be before the tracker will force send it
   * Also dictates the max size of a POST request before a batch of events is split into multiple requests
   * @defaultValue 40000
   */
  maxPostBytes?: number;
  /**
   * The max size a GET request (its complete URL) can be. Requests over this size will be tried as a POST request.
   * @defaultValue unlimited
   */
  maxGetBytes?: number;
  /**
   * Should the Sent Timestamp be attached to events.
   * Only applies for GET events.
   * @defaultValue true
   */
  useStm?: boolean;
  /**
   * How long to wait before aborting requests to the collector
   * @defaultValue 5000 (milliseconds)
   */
  connectionTimeout?: number;
  /**
   * An object of key value pairs which represent headers to
   * attach when sending a POST request, only works for POST
   * @defaultValue `{}`
   */
  customHeaders?: Record<string, string>;
  /**
   * Controls whether or not the browser sends credentials (defaults to 'include')
   * @defaultValue 'include'
   */
  credentials?: 'omit' | 'same-origin' | 'include';
  /**
   * Whether to retry failed requests to the collector.
   *
   * Failed requests are requests that failed due to
   * [timeouts](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/timeout_event),
   * [network errors](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/error_event),
   * and [abort events](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/abort_event).
   *
   * Takes precedent over `retryStatusCodes` and `dontRetryStatusCodes`.
   *
   * @defaultValue true
   */
  retryFailedRequests?: boolean;
  /**
   * List of HTTP response status codes for which events sent to Collector should be retried in future requests.
   * Only non-success status codes are considered (greater or equal to 300).
   * The retry codes are only considered for GET and POST requests.
   * They take priority over the `dontRetryStatusCodes` option.
   * By default, the tracker retries on all non-success status codes except for 400, 401, 403, 410, and 422.
   */
  retryStatusCodes?: number[];
  /**
   * List of HTTP response status codes for which events sent to Collector should not be retried in future request.
   * Only non-success status codes are considered (greater or equal to 300).
   * The don't retry codes are only considered for GET and POST requests.
   * By default, the tracker retries on all non-success status codes except for 400, 401, 403, 410, and 422 (these don't retry codes will remain even if you set your own `dontRetryStatusCodes` but can be changed using the `retryStatusCodes`).
   */
  dontRetryStatusCodes?: number[];
  /**
   * Id service full URL. This URL will be added to the queue and will be called using a GET method.
   * This option is there to allow the service URL to be called in order to set any required identifiers e.g. extra cookies.
   *
   * The request respects the `anonymousTracking` option, including the SP-Anonymous header if needed, and any additional custom headers from the customHeaders option.
   */
  idService?: string;
  /**
   * Indicates that the request should be allowed to outlive the webpage that initiated it.
   * Enables collector requests to complete even if the page is closed or navigated away from.
   * Note: Browsers put a limit on keepalive requests of 64KB. In case of multiple keepalive requests in parallel (may happen in case of multiple trackers), the limit is shared.
   * @defaultValue false
   */
  keepalive?: boolean;
  /**
   * Enables overriding the default fetch function with a custom implementation.
   * @param input - Instance of Request
   * @param options - Additional options for the request
   * @returns A Promise that resolves to the Response.
   */
  customFetch?: (input: Request, options?: RequestInit) => Promise<Response>;
  /**
   * A callback function to be executed whenever a request is successfully sent to the collector.
   * In practice this means any request which returns a 2xx status code will trigger this callback.
   *
   * @param data - The event batch that was successfully sent
   */
  onRequestSuccess?: (data: EventBatch, response: Response) => void;
  /**
   * A callback function to be executed whenever a request fails to be sent to the collector.
   * This is the inverse of the onRequestSuccess callback, so any non 2xx status code will trigger this callback.
   *
   * @param data - The data associated with the event(s) that failed to send
   */
  onRequestFailure?: (data: RequestFailure, response?: Response) => void;
  /**
   * Enables providing a custom EventStore implementation to store events before sending them to the collector.
   */
  eventStore?: EventStore;
}

export interface EmitterConfiguration extends EmitterConfigurationBase {
  /* The collector URL to which events will be sent */
  endpoint: string;
  /* http or https. Defaults to https */
  protocol?: 'http' | 'https';
  /* Collector port number */
  port?: number;
  /* If the request should undergo server anonymization. */
  serverAnonymization?: boolean;
}

/**
 * Emitter is responsible for sending events to the collector.
 * It manages the event queue and sends events in batches depending on configuration.
 */
export interface Emitter {
  /**
   * Forces the emitter to send all events in the event store to the collector.
   * @returns A Promise that resolves when all events have been sent to the collector.
   */
  flush: () => Promise<void>;
  /**
   * Adds a payload to the event store or sends it to the collector.
   * @param payload - A payload to be sent to the collector
   * @returns Promise that resolves when the payload has been added to the event store or sent to the collector
   */
  input: (payload: Payload) => Promise<void>;
  /**
   * Updates the collector URL to which events will be sent.
   * @param url - New collector URL
   */
  setCollectorUrl: (url: string) => void;
  /**
   * Sets the server anonymization flag.
   */
  setAnonymousTracking: (anonymous: boolean) => void;
  /**
   * Updates the buffer size of the emitter.
   */
  setBufferSize: (bufferSize: number) => void;
}

interface RequestResult {
  success: boolean;
  retry: boolean;
  status?: number;
}

export function newEmitter({
  endpoint,
  eventMethod = 'post',
  postPath,
  protocol,
  port,
  maxPostBytes = 40000,
  maxGetBytes,
  bufferSize = 1,
  customHeaders,
  serverAnonymization,
  connectionTimeout,
  keepalive,
  idService,
  dontRetryStatusCodes = [],
  retryStatusCodes = [],
  retryFailedRequests = true,
  onRequestFailure,
  onRequestSuccess,
  customFetch = fetch,
  useStm,
  eventStore = newInMemoryEventStore({}),
  credentials,
}: EmitterConfiguration): Emitter {
  let idServiceCalled = false;
  let flushInProgress = false;
  const usePost = eventMethod.toLowerCase() === 'post';
  dontRetryStatusCodes = dontRetryStatusCodes.concat([400, 401, 403, 410, 422]);

  function shouldRetryForStatusCode(statusCode: number): boolean {
    // success, don't retry
    if (statusCode >= 200 && statusCode < 300) {
      return false;
    }

    if (!retryFailedRequests) {
      return false;
    }

    // retry if status code among custom user-supplied retry codes
    if (retryStatusCodes.includes(statusCode)) {
      return true;
    }

    // retry if status code *not* among the don't retry codes
    return !dontRetryStatusCodes.includes(statusCode);
  }

  function callOnRequestSuccess(payloads: Payload[], response: Response) {
    if (onRequestSuccess !== undefined) {
      setTimeout(() => {
        try {
          onRequestSuccess?.(payloads, response);
        } catch (e) {
          LOG.error('Error in onRequestSuccess', e);
        }
      }, 0);
    }
  }

  function callOnRequestFailure(failure: RequestFailure, response?: Response) {
    if (onRequestFailure !== undefined) {
      setTimeout(() => {
        try {
          onRequestFailure?.(failure, response);
        } catch (e) {
          LOG.error('Error in onRequestFailure', e);
        }
      }, 0);
    }
  }

  async function executeRequest(request: EmitterRequest): Promise<RequestResult> {
    const fetchRequest = request.toRequest();
    if (fetchRequest === undefined) {
      throw new Error('Empty batch');
    }

    const payloads = request.getEvents().map((event) => event.getPayload());
    try {
      const response = await customFetch(fetchRequest);
      await response.text(); // wait for the response to be fully read

      request.closeRequest(true);

      if (response.ok) {
        callOnRequestSuccess(payloads, response);
        return { success: true, retry: false, status: response.status };
      } else {
        const willRetry = shouldRetryForStatusCode(response.status);
        callOnRequestFailure(
          {
            events: payloads,
            status: response.status,
            message: response.statusText,
            willRetry: willRetry,
          },
          response
        );
        return { success: false, retry: willRetry, status: response.status };
      }
    } catch (e) {
      request.closeRequest(false);

      const message = typeof e === 'string' ? e : e ? (e as Error).message : 'Unknown error';
      callOnRequestFailure({
        events: payloads,
        message: message,
        willRetry: true,
      });
      return { success: false, retry: true };
    }
  }

  function newEmitterRequestWithConfig(): EmitterRequest {
    return newEmitterRequest({
      endpoint,
      protocol,
      port,
      eventMethod,
      customHeaders,
      connectionTimeout,
      keepalive,
      maxPostBytes,
      useStm,
      credentials,
      postPath,
    });
  }

  function shouldSkipEventStore(emitterEvent: EmitterEvent): boolean {
    const eventTooBigWarning = (bytes: number, maxBytes: number) =>
      LOG.warn('Event (' + bytes + 'B) too big, max is ' + maxBytes);

    if (usePost) {
      const bytes = emitterEvent.getPOSTRequestBytesCount() + 88; // 88 bytes for the payload_data envelope
      const tooBig = bytes > maxPostBytes;
      if (tooBig) {
        eventTooBigWarning(bytes, maxPostBytes);
      }
      return tooBig;
    } else {
      if (maxGetBytes === undefined) {
        return false;
      }
      const bytes = emitterEvent.getGETRequestBytesCount();
      const tooBig = bytes > maxGetBytes;
      if (tooBig) {
        eventTooBigWarning(bytes, maxGetBytes);
      }
      return tooBig;
    }
  }

  async function callIdService() {
    if (idService && !idServiceCalled) {
      idServiceCalled = true;
      const request = new Request(idService, { method: 'GET' });
      await customFetch(request);
    }
  }

  async function flush() {
    if (!flushInProgress) {
      flushInProgress = true;

      try {
        await continueFlush();
      } catch (e) {
        LOG.error('Error sending events', e);
      } finally {
        flushInProgress = false;
      }
    }
  }

  async function continueFlush() {
    await callIdService();

    const request = newEmitterRequestWithConfig();
    const eventStoreIterator = eventStore.iterator();

    while (true) {
      if (request.isFull()) {
        break;
      }

      const { value, done } = await eventStoreIterator.next();
      if (done || value === undefined) {
        break;
      }

      const event = newEmitterEvent(value);
      if (!request.addEvent(event)) {
        break;
      }
    }

    if (request.countEvents() === 0) {
      return;
    }

    const { success, retry, status } = await executeRequest(request);

    if (success || !retry) {
      if (!success) {
        LOG.error(`Status ${status}, will not retry.`);
      }
      await eventStore.removeHead(request.countEvents());
    }

    if (success) {
      await continueFlush();
    }
  }

  async function input(payload: Payload) {
    const eventStorePayload = newEventStorePayload({ payload, svrAnon: serverAnonymization });
    const event = newEmitterEvent(eventStorePayload);
    if (shouldSkipEventStore(event)) {
      const request = newEmitterRequestWithConfig();
      request.addEvent(event);
      await executeRequest(request);
    } else {
      const count = await eventStore.add(eventStorePayload);
      if (count >= bufferSize) {
        await flush();
      }
    }
  }

  function setCollectorUrl(url: string) {
    endpoint = url;
  }

  function setAnonymousTracking(at: boolean) {
    serverAnonymization = at;
  }

  function setBufferSize(bs: number) {
    bufferSize = bs;
  }

  return {
    flush,
    input,
    setCollectorUrl,
    setAnonymousTracking,
    setBufferSize,
  };
}
