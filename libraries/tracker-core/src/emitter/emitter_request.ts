import { PAYLOAD_DATA_SCHEMA } from '../schemata';
import { EmitterEvent } from "./emitter_event";

/**
 * Wrapper around a request with events to the collector.
 * Provides helpers to manage the request and its events.
 * Prepare the request to be sent to the collector.
 */
export interface EmitterRequest {
  /**
   * Add an event to the request
   * @returns true if the event was added, false if the server anonymization setting does not match the existing events
   */
  addEvent: (event: EmitterEvent) => boolean;
  /**
   * Get the events attached to the request
   */
  getEvents: () => EmitterEvent[];
  /**
   * Creates a fetch Request object from the events
   */
  toRequest: () => Request | undefined;
  /**
   * Whether the request is full or events can still be added
   */
  isFull: () => boolean;
  /**
   * Size of the request in bytes
   */
  countBytes: () => number;
  /**
   * The number of events attached to the request
   */
  countEvents: () => number;
  /**
   * Cancel timeout timer if it is still pending.
   * If not successful, the request will be aborted.
   * @param successful - Whether the request was successful
   * @param reason - Reason for aborting the request
   */
  closeRequest: (successful: boolean, reason?: string) => void;
}

export interface EmitterRequestConfiguration {
  endpoint: string;
  port?: number;
  protocol?: 'http' | 'https';
  eventMethod?: 'get' | 'post';
  customHeaders?: Record<string, string>;
  connectionTimeout?: number;
  keepalive?: boolean;
  postPath?: string;
  useStm?: boolean;
  maxPostBytes?: number,
  credentials?: 'omit' | 'same-origin' | 'include';
}

/**
 * Enclose an array of events in a self-describing payload_data JSON string
 *
 * @param array - events Batch of events
 * @returns string payload_data self-describing JSON
 */
export function encloseInPayloadDataEnvelope(events: Array<Record<string, unknown>>) {
  return JSON.stringify({
    schema: PAYLOAD_DATA_SCHEMA,
    data: events,
  });
}

/**
 * Attaches the STM field to outbound POST events.
 *
 * @param events - the events to attach the STM to
 */
export function attachStmToEvent(events: Array<Record<string, unknown>>) {
  const stm = new Date().getTime().toString();
  for (let i = 0; i < events.length; i++) {
    events[i]['stm'] = stm;
  }
  return events;
}

export function newEmitterRequest({
  endpoint,
  protocol = 'https',
  port,
  eventMethod = 'post',
  customHeaders,
  connectionTimeout,
  keepalive = false,
  postPath = '/com.snowplowanalytics.snowplow/tp2',
  useStm = true,
  maxPostBytes = 40000,
  credentials = 'include',
}: EmitterRequestConfiguration): EmitterRequest {
  let events: EmitterEvent[] = [];
  let usePost = eventMethod.toLowerCase() === 'post';
  let timer: ReturnType<typeof setTimeout> | undefined;
  let abortController: AbortController | undefined;

  function countBytes(): number {
    let count = events.reduce(
      (acc, event) => acc + (usePost ? event.getPOSTRequestBytesCount() : event.getGETRequestBytesCount()),
      0
    );
    if (usePost) {
      count += 88; // 88 bytes for the payload_data envelope
    }
    return count;
  }

  function countEvents(): number {
    return events.length;
  }

  function getServerAnonymizationOfExistingEvents(): boolean | undefined {
    return events.length > 0 ? events[0].getServerAnonymization() : undefined;
  }

  function addEvent(event: EmitterEvent) {
    if (events.length > 0 && getServerAnonymizationOfExistingEvents() !== event.getServerAnonymization()) {
      return false;
    } else {
      events.push(event);
      return true;
    }
  }

  function getEvents(): EmitterEvent[] {
    return events;
  }

  function isFull(): boolean {
    if (usePost) {
      return countBytes() >= maxPostBytes;
    } else {
      return events.length >= 1;
    }
  }

  function createHeaders(): Headers {
    const headers = new Headers();
    if (usePost) {
      headers.append('Content-Type', 'application/json; charset=UTF-8');
    }
    if (customHeaders) {
      Object.keys(customHeaders).forEach((key) => {
        headers.append(key, customHeaders[key]);
      });
    }
    if (getServerAnonymizationOfExistingEvents()) {
      headers.append('SP-Anonymous', '*');
    }
    return headers;
  }

  function getFullCollectorUrl(): string {
    let collectorUrl = endpoint;
    if (!endpoint.includes('://')) {
      collectorUrl = `${protocol}://${endpoint}`;
    }
    if (port) {
      collectorUrl = `${collectorUrl}:${port}`;
    }
    
    const path = usePost ? postPath : '/i';
    return collectorUrl + path;
  }

  function makeRequest(url: string, options: RequestInit): Request {
    closeRequest(false);

    abortController = new AbortController();
    timer = setTimeout(() => {
      const reason = 'Request timed out';
      console.error(reason);
      timer = undefined;
      closeRequest(false, reason);
    }, connectionTimeout ?? 5000);

    const requestOptions: RequestInit = {
      headers: createHeaders(),
      signal: abortController.signal,
      keepalive,
      credentials,
      ...options,
    };

    const request = new Request(url, requestOptions);
    return request;
  }

  function makePostRequest(): Request {
    const batch = attachStmToEvent(events.map((event) => event.getPOSTRequestBody()));

    return makeRequest(getFullCollectorUrl(), {
      method: 'POST',
      body: encloseInPayloadDataEnvelope(batch),
    });
  }

  function makeGetRequest(): Request {
    if (events.length !== 1) {
      throw new Error('Only one event can be sent in a GET request');
    }

    const event = events[0];
    const url = event.getGETRequestURL(getFullCollectorUrl(), useStm);

    return makeRequest(url, {
      method: 'GET',
    });
  }

  function toRequest(): Request | undefined {
    if (events.length === 0) {
      return undefined;
    }
    if (usePost) {
      return makePostRequest();
    } else {
      return makeGetRequest();
    }
  }

  function closeRequest(successful: boolean, reason?: string) {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }

    if (abortController !== undefined) {
      const controller = abortController;
      abortController = undefined;
      if (!successful) {
        controller.abort(reason);
      }
    }
  }

  return {
    addEvent,
    getEvents,
    toRequest,
    countBytes,
    countEvents,
    isFull,
    closeRequest,
  };
}
