import test from 'ava';

import { newEmitter, Emitter } from '../../src/emitter';
import { newInMemoryEventStore } from '../../src/event_store';

function createMockFetch(status: number, requests: Request[]) {
  return async (input: Request) => {
    requests.push(input);
    let response = new Response(null, { status });
    return response;
  };
}

test.before(() => {
  console.error = () => {}; // Silence console.error globally
});

test('input adds an event to the event store', async (t) => {
  const requests: Request[] = [];
  const mockFetch = createMockFetch(200, requests);
  const eventStore = newInMemoryEventStore({});
  const emitter: Emitter = newEmitter({
    endpoint: 'https://example.com',
    bufferSize: 2,
    customFetch: mockFetch,
    eventStore,
  });

  await emitter.input({ e: 'pv' });

  t.is(await eventStore.count(), 1);
  t.is(requests.length, 0);
});

test('input sends events to the collector when the buffer is full', async (t) => {
  const requests: Request[] = [];
  const mockFetch = createMockFetch(200, requests);
  const eventStore = newInMemoryEventStore({});
  const emitter: Emitter = newEmitter({
    endpoint: 'https://example.com',
    bufferSize: 2,
    customFetch: mockFetch,
    eventStore,
  });

  await emitter.input({ e: 'pv' });
  await emitter.input({ e: 'pv' });

  t.is(requests.length, 1);
  t.is(await eventStore.count(), 0);
});

test('flush sends events to the collector', async (t) => {
  const requests: Request[] = [];
  const mockFetch = createMockFetch(200, requests);
  const eventStore = newInMemoryEventStore({});
  const emitter: Emitter = newEmitter({
    endpoint: 'https://example.com',
    bufferSize: 5,
    customFetch: mockFetch,
    eventStore,
  });

  await emitter.input({ e: 'pv' });
  await emitter.input({ e: 'pv' });
  await emitter.flush();

  t.is(requests.length, 1);
  t.is(await eventStore.count(), 0);
});

test('flush does not make any request when the event store is empty', async (t) => {
  const requests: Request[] = [];
  const mockFetch = createMockFetch(200, requests);
  const eventStore = newInMemoryEventStore({});
  const emitter: Emitter = newEmitter({
    endpoint: 'https://example.com',
    bufferSize: 5,
    customFetch: mockFetch,
    eventStore,
  });

  await emitter.flush();

  t.is(requests.length, 0);
  t.is(await eventStore.count(), 0);
});

test('flush makes separate requests for server anonymization settings in events', async (t) => {
  const requests: Request[] = [];
  const mockFetch = createMockFetch(200, requests);
  const eventStore = newInMemoryEventStore({});
  const emitter: Emitter = newEmitter({
    endpoint: 'https://example.com',
    bufferSize: 5,
    customFetch: mockFetch,
    eventStore,
  });

  await emitter.input({ e: 'pv' });
  await emitter.input({ e: 'pv' });
  emitter.setAnonymousTracking(true);
  await emitter.input({ e: 'pv' });
  await emitter.input({ e: 'pv' });
  await emitter.flush();

  t.is(requests.length, 2);
  t.is(requests[0].headers.get('SP-Anonymous'), null);
  t.is(requests[1].headers.get('SP-Anonymous'), '*');
  t.is(await eventStore.count(), 0);
});

test('setCollectorUrl changes the collector URL', async (t) => {
  const requests: Request[] = [];
  const mockFetch = createMockFetch(200, requests);
  const eventStore = newInMemoryEventStore({});
  const emitter: Emitter = newEmitter({
    endpoint: 'https://example.com',
    bufferSize: 5,
    customFetch: mockFetch,
    eventStore,
  });

  emitter.setCollectorUrl('https://example2.com');
  await emitter.input({ e: 'pv' });
  await emitter.flush();

  t.is(requests.length, 1);
  t.is(await eventStore.count(), 0);
  t.is(requests[0].url, 'https://example2.com/com.snowplowanalytics.snowplow/tp2');
});

test('calls onRequestSuccess when the request is successful', async (t) => {
  const requests: Request[] = [];
  const mockFetch = createMockFetch(200, requests);
  const eventStore = newInMemoryEventStore({});

  await new Promise((resolve) => {
    const emitter: Emitter = newEmitter({
      endpoint: 'https://example.com',
      bufferSize: 5,
      customFetch: mockFetch,
      onRequestSuccess: (data) => {
        t.is(data.length, 1);
        resolve(null);
      },
      eventStore,
    });

    emitter.input({ e: 'pv' }).then(() => emitter.flush());
  });
});

test('handles errors when onRequestSuccess throws', async (t) => {
  const requests: Request[] = [];
  const mockFetch = createMockFetch(200, requests);
  const eventStore = newInMemoryEventStore({});
  const emitter: Emitter = newEmitter({
    endpoint: 'https://example.com',
    bufferSize: 5,
    customFetch: mockFetch,
    onRequestSuccess: () => {
      throw new Error('error');
    },
    eventStore,
  });

  await emitter.input({ e: 'pv' });
  await emitter.flush();
  t.is(await eventStore.count(), 0);
});

test('calls onRequestFailure when the request fails', async (t) => {
  const requests: Request[] = [];
  const mockFetch = createMockFetch(500, requests);
  const eventStore = newInMemoryEventStore({});

  await new Promise((resolve) => {
    const emitter: Emitter = newEmitter({
      endpoint: 'https://example.com',
      bufferSize: 5,
      customFetch: mockFetch,
      onRequestFailure: (requestFailure, response) => {
        t.is(requestFailure.events.length, 1);
        t.is(requestFailure.status, 500);
        t.is(response?.status, 500);
        resolve(null);
      },
      eventStore,
    });

    emitter.input({ e: 'pv' }).then(() => emitter.flush());
  });
});

test('retries when the request fails', async (t) => {
  const requests: Request[] = [];
  const mockFetch = createMockFetch(500, requests);
  const eventStore = newInMemoryEventStore({});
  const emitter: Emitter = newEmitter({
    endpoint: 'https://example.com',
    bufferSize: 5,
    customFetch: mockFetch,
    retryFailedRequests: true,
    eventStore,
  });

  await emitter.input({ e: 'pv' });
  await emitter.flush();
  t.is(requests.length, 1);
  t.is(await eventStore.count(), 1);
});

test('does not retry when the request fails and retryFailedRequests is false', async (t) => {
  const requests: Request[] = [];
  const mockFetch = createMockFetch(500, requests);
  const eventStore = newInMemoryEventStore({});
  const emitter: Emitter = newEmitter({
    endpoint: 'https://example.com',
    bufferSize: 5,
    customFetch: mockFetch,
    retryFailedRequests: false,
    eventStore,
  });

  await emitter.input({ e: 'pv' });
  await emitter.flush();
  t.is(requests.length, 1);
  t.is(await eventStore.count(), 0);
});

test('does not retry certain status codes', async (t) => {
  const requests: Request[] = [];
  const mockFetch = createMockFetch(422, requests);
  const eventStore = newInMemoryEventStore({});
  const emitter: Emitter = newEmitter({
    endpoint: 'https://example.com',
    bufferSize: 5,
    customFetch: mockFetch,
    eventStore,
  });

  await emitter.input({ e: 'pv' });
  await emitter.flush();
  t.is(requests.length, 1);
  t.is(await eventStore.count(), 0);
});

test('does not retry if the status code is in the dontRetry list', async (t) => {
  const requests: Request[] = [];
  const mockFetch = createMockFetch(500, requests);
  const eventStore = newInMemoryEventStore({});
  const emitter: Emitter = newEmitter({
    endpoint: 'https://example.com',
    bufferSize: 5,
    customFetch: mockFetch,
    dontRetryStatusCodes: [500],
    eventStore,
  });

  await emitter.input({ e: 'pv' });
  await emitter.flush();
  t.is(requests.length, 1);
  t.is(await eventStore.count(), 0);
});

test('retries if the status code is in the retry list', async (t) => {
  const requests: Request[] = [];
  const mockFetch = createMockFetch(422, requests);
  const eventStore = newInMemoryEventStore({});
  const emitter: Emitter = newEmitter({
    endpoint: 'https://example.com',
    bufferSize: 5,
    customFetch: mockFetch,
    retryStatusCodes: [422],
    eventStore,
  });

  await emitter.input({ e: 'pv' });
  await emitter.flush();
  t.is(requests.length, 1);
  t.is(await eventStore.count(), 1);
});

test('makes a request to the id service only once', async (t) => {
  const requests: Request[] = [];
  const mockFetch = createMockFetch(200, requests);
  const emitter: Emitter = newEmitter({
    endpoint: 'https://example.com',
    customFetch: mockFetch,
    cookieExtensionService: 'https://id-example.com',
  });

  await emitter.input({ e: 'pv' });

  t.is(requests.length, 2);
  t.is(requests[0].url, 'https://id-example.com/');
  t.is(requests[1].url, 'https://example.com/com.snowplowanalytics.snowplow/tp2');

  await emitter.input({ e: 'pv' });
  t.is(requests.length, 3);
  t.is(requests[2].url, 'https://example.com/com.snowplowanalytics.snowplow/tp2');
});

test('adds a timeout to the request', async (t) => {
  const requests: Request[] = [];
  let eventStore = newInMemoryEventStore({});

  const mockFetch = (input: Request): Promise<Response> => {
    requests.push(input);

    return new Promise((resolve, reject) => {
      let timer = setTimeout(() => {
        t.fail('Request should have timed out');
        resolve(new Response(null, { status: 200 }));
      }, 500);

      input.signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('Request aborted'));
      });
    });
  };
  const emitter: Emitter = newEmitter({
    endpoint: 'https://example.com',
    customFetch: mockFetch,
    connectionTimeout: 100,
    eventStore,
  });

  await emitter.input({ e: 'pv' });

  t.is(requests.length, 1);
  t.is(await eventStore.count(), 1);
});

test('uses custom POST path configured in the emitter', async (t) => {
  const requests: Request[] = [];
  const mockFetch = createMockFetch(200, requests);
  const eventStore = newInMemoryEventStore({});
  const emitter: Emitter = newEmitter({
    endpoint: 'https://example.com',
    customFetch: mockFetch,
    postPath: '/custom',
    eventStore,
  });

  await emitter.input({ e: 'pv' });
  await emitter.flush();

  t.is(requests.length, 1);
  t.is(requests[0].url, 'https://example.com/custom');
});
