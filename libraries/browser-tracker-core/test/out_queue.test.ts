/*
 * Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang
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

import { newOutQueue, OutQueue } from '../src/tracker/out_queue';
import { SharedState } from '../src/state';
import { EventStore, newInMemoryEventStore, EventBatch, RequestFailure } from '@snowplow/tracker-core';

function newMockEventStore({ maxSize }: { maxSize: number }): EventStore & { addCount: () => number } {
  let eventStore = newInMemoryEventStore({ maxSize });
  let addCount = 0;

  return {
    add: (payload) => {
      addCount++;
      return eventStore.add(payload);
    },
    removeHead: eventStore.removeHead,
    count: eventStore.count,
    iterator: eventStore.iterator,
    getAll: eventStore.getAll,
    getAllPayloads: eventStore.getAllPayloads,
    addCount: () => addCount,
  };
}

describe('OutQueueManager', () => {
  const maxQueueSize = 2;

  let eventStore: EventStore & { addCount: () => number };
  let responseStatusCode: number;
  let requests: Request[];
  const customFetch = async (request: Request) => {
    requests.push(request);
    return new Response(null, { status: responseStatusCode });
  };

  beforeEach(() => {
    requests = [];
    responseStatusCode = 200;
    eventStore = newMockEventStore({ maxSize: maxQueueSize });
  });

  describe('POST requests', () => {
    let outQueue: OutQueue;

    beforeEach(() => {
      outQueue = newOutQueue(
        {
          endpoint: 'http://example.com',
          trackerId: 'sp',
          useStm: false,
          retryStatusCodes: [401], // retry status codes - override don't retry ones
          dontRetryStatusCodes: [401, 505], // don't retry status codes
          eventStore,
          customFetch,
        },
        new SharedState()
      );
    });

    it('should add event to outQueue and store event in local storage', async () => {
      const expected = { e: 'pv', eid: '20269f92-f07c-44a6-87ef-43e171305076' };
      outQueue.setBufferSize(5);
      await outQueue.enqueueRequest(expected);

      expect(await eventStore.count()).toEqual(1);
      const events = await eventStore.getAllPayloads();
      expect(events[0]).toMatchObject(expected);
    });

    it('should add event to outQueue and store only events up to max local storage queue size in local storage', async () => {
      const expected1 = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
      const expected2 = { e: 'pv', eid: '6000c7bd-08a6-49c2-b61c-9531d3d46200' };
      const unexpected = { e: 'pv', eid: '7a3391a8-622b-4ce4-80ed-c941aa05baf5' };

      outQueue.setBufferSize(5);
      await outQueue.enqueueRequest(unexpected);
      await outQueue.enqueueRequest(expected1);
      await outQueue.enqueueRequest(expected2);

      expect(await eventStore.count()).toEqual(maxQueueSize);
      const events = await eventStore.getAllPayloads();
      expect(events[0]).toMatchObject(expected1);
      expect(events[1]).toMatchObject(expected2);
    });

    it('should remove events from event queue on success', async () => {
      const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
      await outQueue.enqueueRequest(request);

      expect(await eventStore.count()).toEqual(0);
      expect(requests).toHaveLength(1);
    });

    it('should keep events in queue on failure', async () => {
      const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
      responseStatusCode = 500;
      await outQueue.enqueueRequest(request);

      expect(await eventStore.count()).toEqual(1);
      expect(requests).toHaveLength(1);
    });

    it('should retry on custom retry status code', async () => {
      const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
      responseStatusCode = 401;
      await outQueue.enqueueRequest(request);

      expect(requests).toHaveLength(1);
      expect(await eventStore.count()).toEqual(1);
    });

    it("should not retry on custom don't retry status code", async () => {
      const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
      responseStatusCode = 505;
      await outQueue.enqueueRequest(request);

      expect(requests).toHaveLength(1);
      expect(await eventStore.count()).toEqual(0);
    });
  });

  describe('GET requests', () => {
    let getOutQueue: (maxGetBytes?: number) => OutQueue;

    beforeEach(() => {
      getOutQueue = (maxGetBytes) =>
        newOutQueue(
          {
            endpoint: 'http://example.com',
            trackerId: 'sp',
            eventMethod: 'get',
            maxGetBytes,
            useStm: false,
            maxLocalStorageQueueSize: maxQueueSize,
            eventStore,
            customFetch,
          },
          new SharedState()
        );
    });

    it('should add large event to out queue without bytes limit', async () => {
      let outQueue = getOutQueue(undefined);

      const expected = { e: 'pv', eid: '20269f92-f07c-44a6-87ef-43e171305076', aid: 'x'.repeat(1000) };
      await outQueue.enqueueRequest(expected);

      expect(eventStore.addCount()).toEqual(1);
      expect(await eventStore.count()).toEqual(0);
      expect(requests).toHaveLength(1);
    });

    it('should not add event larger than max bytes limit to queue but should try to send it as POST', async () => {
      let outQueue = getOutQueue(100);
      const consoleWarn = jest.fn();
      global.console.warn = consoleWarn;

      const expected = { e: 'pv', eid: '20269f92-f07c-44a6-87ef-43e171305076', aid: 'x'.repeat(1000) };
      outQueue.enqueueRequest(expected);

      expect(eventStore.addCount()).toEqual(0);
      expect(await eventStore.count()).toEqual(0);
      expect(consoleWarn.mock.calls.length).toEqual(1); // should log a warning message
      expect(requests).toHaveLength(1);
    });
  });

  describe('idService requests', () => {
    const idServiceEndpoint = 'http://example.com/id';

    const getQuerystring = (p: object) =>
      '?' +
      Object.entries(p)
        .map(([k, v]) => k + '=' + encodeURIComponent(v))
        .join('&');

    describe('GET requests', () => {
      let createGetQueue = () => newOutQueue(
        {
          endpoint: 'http://example.com',
          trackerId: 'sp',
          eventMethod: 'get',
          useStm: false,
          maxLocalStorageQueueSize: maxQueueSize,
          eventStore,
          customFetch,
          idService: idServiceEndpoint,
        },
        new SharedState()
      );
  

      it('should first execute the idService request and in the same `enqueueRequest` the tracking request', async () => {
        const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
        const getQueue = createGetQueue();

        await getQueue.enqueueRequest(request);

        expect(requests).toHaveLength(2);
        expect(requests[0].url).toEqual(idServiceEndpoint);
        expect(requests[1].url).toEqual('http://example.com/i' + getQuerystring(request));
      });

      it('should first execute the idService request and in the same `enqueueRequest` the tracking request irregardless of failure of the idService endpoint', async () => {
        const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
        const getQueue = createGetQueue();

        responseStatusCode = 500;
        await getQueue.enqueueRequest(request);

        expect(requests).toHaveLength(2);
        expect(requests[0].url).toEqual(idServiceEndpoint);
        expect(requests[1].url).toEqual('http://example.com/i' + getQuerystring(request));
        expect(await eventStore.count()).toEqual(1);
      });
    });

    describe('POST requests', () => {
      let createPostQueue = () => newOutQueue(
        {
          endpoint: 'http://example.com',
          trackerId: 'sp',
          eventMethod: 'post',
          eventStore,
          customFetch,
          idService: idServiceEndpoint,
        },
        new SharedState()
      );

      it('should first execute the idService request and in the same `enqueueRequest` the tracking request irregardless of failure of the idService endpoint', async () => {
        const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
        const postQueue = createPostQueue();

        await postQueue.enqueueRequest(request);

        expect(requests).toHaveLength(2);
        expect(requests[0].url).toEqual(idServiceEndpoint);
        expect(requests[1].url).toEqual('http://example.com/com.snowplowanalytics.snowplow/tp2');
      });
    });
  });

  describe('retryFailures = true', () => {
    const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
    let createOutQueue = () => newOutQueue(
      {
        endpoint: 'http://example.com',
        trackerId: 'sp',
        eventMethod: 'post',
        retryFailedRequests: true,
        eventStore,
        customFetch,
      },
      new SharedState()
    );

    it('should remain in queue on failure', async () => {
      let outQueue = createOutQueue();
      responseStatusCode = 500;
      await outQueue.enqueueRequest(request);

      expect(requests).toHaveLength(1);
      expect(await eventStore.count()).toEqual(1);
    });
  });

  describe('retryFailures = false', () => {
    const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
    let createOutQueue = () => newOutQueue(
      {
        endpoint: 'http://example.com',
        trackerId: 'sp',
        eventMethod: 'post',
        retryFailedRequests: false,
        eventStore,
        customFetch,
      },
      new SharedState()
    );

    it('should remove from queue on failure', async () => {
      let outQueue = createOutQueue();
      responseStatusCode = 500;
      await outQueue.enqueueRequest(request);

      expect(requests).toHaveLength(1);
      expect(await eventStore.count()).toEqual(0);
    });
  });

  type createQueueArgs = {
    method: 'get' | 'post';
    onSuccess?: (data: EventBatch) => void;
    onFailure?: (data: RequestFailure) => void;
    maxPostBytes?: number;
    maxGetBytes?: number;
  };

  const createQueue = (args: createQueueArgs) =>
    newOutQueue(
      {
        endpoint: 'http://example.com',
        trackerId: 'sp',
        eventMethod: args.method,
        maxPostBytes: args.maxPostBytes,
        maxGetBytes: args.maxGetBytes,
        maxLocalStorageQueueSize: maxQueueSize,
        onRequestSuccess: args.onSuccess,
        onRequestFailure: args.onFailure,
        customFetch,
        eventStore,
      },
      new SharedState()
    );

  describe('onRequestSuccess', () => {
    const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };

    describe('POST requests', () => {
      const method = 'post';

      it('should fire on a successful request', async () => {
        const callbacks: EventBatch[] = [];

        await new Promise(async (resolve) => {
          const onSuccess = (e: EventBatch) => {
            callbacks.push(e);
            resolve(null);
          };

          const postQueue = createQueue({ method, onSuccess });
          await postQueue.enqueueRequest(request);
        });

        expect(requests).toHaveLength(1);
        expect(eventStore.addCount()).toEqual(1);
        expect(callbacks).toHaveLength(1);
        expect(callbacks[0]).toHaveLength(1);

        let dataFromCallback = callbacks[0][0];
        expect(dataFromCallback).toEqual(request);
      });

      // Oversized events don't get placed in the queue, but the callback should still fire
      it('should fire on a successful oversized request', async () => {
        const callbackStorage: EventBatch[] = [];
        await new Promise(async (resolve) => {
          const onSuccess = (e: EventBatch) => {
            callbackStorage.push(e);
            resolve(null);
          };

          const postQueue = createQueue({ method, onSuccess, maxPostBytes: 1 });
          await postQueue.enqueueRequest(request);
        });

        expect(requests).toHaveLength(1);
        expect(eventStore.addCount()).toEqual(0);
        let dataFromCallback = callbackStorage[0][0];
        expect(dataFromCallback).toEqual(request);
      });
    });

    describe('GET requests', () => {
      const method = 'get';

      it('should fire on a successful request', async () => {
        let callbackStorage: EventBatch[] = [];
        await new Promise(async (resolve) => {
          const onSuccess = (e: EventBatch) => {
            callbackStorage.push(e);
            resolve(null);
          };

          const getQueue = createQueue({ method, onSuccess });
          await getQueue.enqueueRequest(request);
        });

        expect(requests).toHaveLength(1);
        expect(eventStore.addCount()).toEqual(1);
        expect(callbackStorage).toHaveLength(1);
        expect(callbackStorage[0]).toHaveLength(1);

        let dataFromCallback = callbackStorage[0][0];
        expect(dataFromCallback).toEqual(request);
      });

      // A single oversized events means no queue, but the callback should still fire
      it('should fire the onRequestSuccess on a successful oversized request', async () => {
        let callbackStorage: EventBatch[] = [];
        await new Promise(async (resolve) => {
          const onSuccess = (e: EventBatch) => {
            callbackStorage.push(e);
            resolve(null);
          };

          const getQueue = createQueue({ method, onSuccess, maxGetBytes: 1 });
          await getQueue.enqueueRequest(request);
        });

        expect(requests).toHaveLength(1);
        expect(eventStore.addCount()).toEqual(0);
        expect(callbackStorage).toHaveLength(1);
        expect(callbackStorage[0]).toHaveLength(1);

        let dataFromCallback = callbackStorage[0][0];
        expect(dataFromCallback).toEqual(request);
      });
    });
  });

  describe('onRequestFailure', () => {
    const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };

  const createQueue = (args: createQueueArgs) =>
    newOutQueue(
      {
        endpoint: 'http://example.com',
        trackerId: 'sp',
        eventMethod: args.method,
        maxPostBytes: args.maxPostBytes,
        maxGetBytes: args.maxGetBytes,
        maxLocalStorageQueueSize: maxQueueSize,
        onRequestSuccess: args.onSuccess,
        onRequestFailure: args.onFailure,
        dontRetryStatusCodes: [500],
        customFetch,
        eventStore,
      },
      new SharedState()
    );

    describe('POST requests', () => {
      const method = 'post';

      it('should fire on a failed request', async () => {
        const callbackStorage: RequestFailure[] = [];
        await new Promise(async (resolve) => {
          const onFailure = (e: RequestFailure) => {
            callbackStorage.push(e);
            resolve(null);
          };

          responseStatusCode = 500;

          const postQueue = createQueue({ method, onFailure });
          await postQueue.enqueueRequest(request);
        });

        expect(requests).toHaveLength(1);
        expect(callbackStorage).toHaveLength(1);
        expect(await eventStore.count()).toEqual(0);

        let dataFromCallback = callbackStorage[0] as RequestFailure;

        const event = dataFromCallback.events[0];
        expect(event).toEqual(request);

        expect(dataFromCallback.status).toEqual(500);
        expect(dataFromCallback.willRetry).toEqual(false);
      });

      // A single oversized events means no queue, but the callback should still fire
      it('should fire on a failed oversized request', async () => {
        const callbackStorage: RequestFailure[] = [];
        await new Promise(async (resolve) => {
          const onFailure = (e: RequestFailure) => {
            callbackStorage.push(e);
            resolve(null);
          };

          responseStatusCode = 501;

          const postQueue = createQueue({ method, onFailure, maxPostBytes: 1 });
          await postQueue.enqueueRequest(request);
        });

        expect(requests).toHaveLength(1);
        expect(callbackStorage).toHaveLength(1);
        expect(eventStore.addCount()).toEqual(0);
        expect(await eventStore.count()).toEqual(0);

        let dataFromCallback = callbackStorage[0].events[0];
        expect(dataFromCallback).toEqual(request);
        expect(callbackStorage[0].status).toEqual(501);
      });
    });

    describe('GET requests', () => {
      const method = 'get';

      it('should fire on a failed request', async () => {
        let callbackStorage: RequestFailure[] = [];
        await new Promise(async (resolve) => {
          const onFailure = (e: RequestFailure) => {
            callbackStorage.push(e);
            resolve(null);
          };

          responseStatusCode = 500;

          const getQueue = createQueue({ method, onFailure });
          await getQueue.enqueueRequest(request);
        });

        expect(requests).toHaveLength(1);
        expect(callbackStorage).toHaveLength(1);
        expect(await eventStore.count()).toEqual(0);

        let dataFromCallback = callbackStorage[0] as RequestFailure;

        expect(dataFromCallback.events[0]).toEqual(request);
        expect(dataFromCallback.status).toEqual(500);
        expect(dataFromCallback.willRetry).toEqual(false);
      });

      // A single oversized events means no queue, but the callback should still fire
      it('should fire on a failed oversized request', async () => {
        let callbackStorage: RequestFailure[] = [];
        await new Promise(async (resolve) => {
          const onFailure = (e: RequestFailure) => {
            callbackStorage.push(e);
            resolve(null);
          };

          responseStatusCode = 500;

          const getQueue = createQueue({ method, onFailure, maxGetBytes: 1 });
          await getQueue.enqueueRequest(request);
        });

        expect(requests).toHaveLength(1);
        expect(callbackStorage).toHaveLength(1);
        expect(eventStore.addCount()).toEqual(0);

        let dataFromCallback = callbackStorage[0];

        expect(dataFromCallback.events[0]).toEqual(request);
        expect(dataFromCallback.status).toEqual(500);
        expect(dataFromCallback.willRetry).toEqual(false);
      });
    });
  });
});
