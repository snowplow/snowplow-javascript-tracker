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

import { OutQueueManager, OutQueue } from '../src/tracker/out_queue';
import { SharedState } from '../src/state';
import { EventBatch, RequestFailure } from '../src/tracker/types';

const readPostQueue = () => {
  return JSON.parse(
    window.localStorage.getItem('snowplowOutQueue_sp_post2') ?? fail('Unable to find local storage queue')
  );
};

const readGetQueue = () =>
  JSON.parse(window.localStorage.getItem('snowplowOutQueue_sp_get') ?? fail('Unable to find local storage queue'));

const getQuerystring = (p: object) =>
  '?' +
  Object.entries(p)
    .map(([k, v]) => k + '=' + encodeURIComponent(v))
    .join('&');

describe('OutQueueManager', () => {
  const maxQueueSize = 2;

  var xhrMock: Partial<XMLHttpRequest>;
  var xhrOpenMock: jest.Mock;
  beforeEach(() => {
    localStorage.clear();

    xhrOpenMock = jest.fn();
    xhrMock = {
      open: xhrOpenMock,
      send: jest.fn(),
      setRequestHeader: jest.fn(),
      withCredentials: true,
      abort: jest.fn(),
    };

    jest.spyOn(window, 'XMLHttpRequest').mockImplementation(() => xhrMock as XMLHttpRequest);
  });

  const respondMockRequest = (status: number, statusText: string = '') => {
    (xhrMock as any).status = status;
    (xhrMock as any).response = '';
    (xhrMock as any).statusText = statusText;
    (xhrMock as any).readyState = 4;
    (xhrMock as any).onreadystatechange();
  };

  describe('POST requests', () => {
    var outQueue: OutQueue;

    const getQueue = () => {
      return JSON.parse(
        window.localStorage.getItem('snowplowOutQueue_sp_post2') ?? fail('Unable to find local storage queue')
      );
    };

    beforeEach(() => {
      outQueue = OutQueueManager(
        'sp',
        new SharedState(),
        true,
        'post',
        '/com.snowplowanalytics.snowplow/tp2',
        1,
        40000,
        0, // maxGetBytes – 0 for no limit
        false,
        maxQueueSize,
        5000,
        false,
        {},
        true,
        [401], // retry status codes - override don't retry ones
        [401, 505] // don't retry status codes
      );
    });

    it('should add event to outQueue and store event in local storage', () => {
      const expected = { e: 'pv', eid: '20269f92-f07c-44a6-87ef-43e171305076' };
      outQueue.enqueueRequest(expected, 'http://example.com');

      const retrievedQueue = getQueue();
      expect(retrievedQueue).toHaveLength(1);
      expect(retrievedQueue[0]).toMatchObject({ bytes: 55, evt: expected });
    });

    it('should add event to outQueue and store only events up to max local storage queue size in local storage', () => {
      const expected1 = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
      const expected2 = { e: 'pv', eid: '6000c7bd-08a6-49c2-b61c-9531d3d46200' };
      const unexpected = { e: 'pv', eid: '7a3391a8-622b-4ce4-80ed-c941aa05baf5' };

      outQueue.enqueueRequest(expected1, 'http://example.com');
      outQueue.enqueueRequest(expected2, 'http://example.com');
      outQueue.enqueueRequest(unexpected, 'http://example.com');

      const retrievedQueue = getQueue();
      expect(retrievedQueue).toHaveLength(maxQueueSize);
      expect(retrievedQueue[0]).toMatchObject({ bytes: 55, evt: expected1 });
      expect(retrievedQueue[1]).toMatchObject({ bytes: 55, evt: expected2 });
    });

    it('should remove events from event queue on success', () => {
      const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
      outQueue.enqueueRequest(request, 'http://example.com');

      let retrievedQueue = getQueue();
      expect(retrievedQueue).toHaveLength(1);

      respondMockRequest(200);
      retrievedQueue = getQueue();
      expect(retrievedQueue).toHaveLength(0);
    });

    it('should keep events in queue on failure', () => {
      const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
      outQueue.enqueueRequest(request, 'http://example.com');

      let retrievedQueue = getQueue();
      expect(retrievedQueue).toHaveLength(1);

      respondMockRequest(500);
      retrievedQueue = getQueue();
      expect(retrievedQueue).toHaveLength(1);
    });

    it('should retry on custom retry status code', () => {
      const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
      outQueue.enqueueRequest(request, 'http://example.com');

      let retrievedQueue = getQueue();
      expect(retrievedQueue).toHaveLength(1);

      respondMockRequest(401);
      retrievedQueue = getQueue();
      expect(retrievedQueue).toHaveLength(1);
    });

    it("should not retry on custom don't retry status code", () => {
      const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
      outQueue.enqueueRequest(request, 'http://example.com');

      let retrievedQueue = getQueue();
      expect(retrievedQueue).toHaveLength(1);

      respondMockRequest(505);
      retrievedQueue = getQueue();
      expect(retrievedQueue).toHaveLength(0);
    });
  });

  describe('GET requests', () => {
    var getOutQueue: (maxGetBytes: number) => OutQueue;

    beforeEach(() => {
      getOutQueue = (maxGetBytes) =>
        OutQueueManager(
          'sp',
          new SharedState(),
          true,
          'get',
          '/com.snowplowanalytics.snowplow/tp2',
          1,
          40000,
          maxGetBytes,
          false,
          maxQueueSize,
          5000,
          false,
          {},
          true,
          [],
          []
        );
    });

    it('should add large event to out queue without bytes limit', () => {
      var outQueue = getOutQueue(0);

      const expected = { e: 'pv', eid: '20269f92-f07c-44a6-87ef-43e171305076', aid: 'x'.repeat(1000) };
      outQueue.enqueueRequest(expected, '');

      const retrievedQueue = JSON.parse(
        window.localStorage.getItem('snowplowOutQueue_sp_get') ?? fail('Unable to find local storage queue')
      );
      expect(retrievedQueue).toHaveLength(1);
      expect(retrievedQueue[0]).toEqual(getQuerystring(expected));
    });

    it('should not add event larger than max bytes limit to queue but should try to send it as POST', () => {
      var outQueue = getOutQueue(100);
      const consoleWarn = jest.fn();
      global.console.warn = consoleWarn;

      const expected = { e: 'pv', eid: '20269f92-f07c-44a6-87ef-43e171305076', aid: 'x'.repeat(1000) };
      outQueue.enqueueRequest(expected, 'http://acme.com');

      expect(window.localStorage.getItem('snowplowOutQueue_sp_get')).toBeNull; // should not save to local storage
      expect(consoleWarn.mock.calls.length).toEqual(1); // should log a warning message
      expect(xhrOpenMock).toHaveBeenCalledWith('POST', 'http://acme.com/com.snowplowanalytics.snowplow/tp2', true); // should make the POST request
    });
  });

  describe('idService requests', () => {
    const idServiceEndpoint = 'http://example.com/id';

    const readGetQueue = () =>
      JSON.parse(window.localStorage.getItem('snowplowOutQueue_sp_get') ?? fail('Unable to find local storage queue'));

    const getQuerystring = (p: object) =>
      '?' +
      Object.entries(p)
        .map(([k, v]) => k + '=' + encodeURIComponent(v))
        .join('&');

    describe('GET requests', () => {
      const createGetQueue = () =>
        OutQueueManager(
          'sp',
          new SharedState(),
          true,
          'get',
          '/com.snowplowanalytics.snowplow/tp2',
          1,
          40000,
          0,
          false,
          maxQueueSize,
          5000,
          false,
          {},
          true,
          [],
          [],
          idServiceEndpoint
        );

      it('should first execute the idService request and in the same `enqueueRequest` the tracking request', () => {
        const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
        const getQueue = createGetQueue();

        getQueue.enqueueRequest(request, 'http://example.com');

        let retrievedQueue = readGetQueue();
        expect(retrievedQueue).toHaveLength(1);
        /* The first XHR is for the idService */
        respondMockRequest(200);
        retrievedQueue = readGetQueue();
        expect(retrievedQueue).toHaveLength(1);
        expect(retrievedQueue[0]).toEqual(getQuerystring(request));
        /* The second XHR is the event request */
        respondMockRequest(200);
        retrievedQueue = readGetQueue();
        expect(retrievedQueue).toHaveLength(0);
      });

      it('should first execute the idService request and in the same `enqueueRequest` the tracking request irregardless of failure of the idService endpoint', () => {
        const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
        const getQueue = createGetQueue();

        getQueue.enqueueRequest(request, 'http://example.com');

        let retrievedQueue = readGetQueue();
        expect(retrievedQueue).toHaveLength(1);
        /* The first XHR is for the idService */
        respondMockRequest(500);
        retrievedQueue = readGetQueue();
        expect(retrievedQueue).toHaveLength(1);
        expect(retrievedQueue[0]).toEqual(getQuerystring(request));
        /* The second XHR is the event request */
        respondMockRequest(200);
        retrievedQueue = readGetQueue();
        expect(retrievedQueue).toHaveLength(0);
      });
    });

    describe('POST requests', () => {
      const createPostQueue = () =>
        OutQueueManager(
          'sp',
          new SharedState(),
          true,
          'post',
          '/com.snowplowanalytics.snowplow/tp2',
          1,
          40000,
          0,
          false,
          maxQueueSize,
          5000,
          false,
          {},
          true,
          [],
          [],
          idServiceEndpoint
        );

      it('should first execute the idService request and in the same `enqueueRequest` the tracking request irregardless of failure of the idService endpoint', () => {
        const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
        const postQueue = createPostQueue();

        postQueue.enqueueRequest(request, 'http://example.com');

        let retrievedQueue = readPostQueue();
        expect(retrievedQueue).toHaveLength(1);
        /* The first XHR is for the idService */
        respondMockRequest(500);
        retrievedQueue = readPostQueue();
        expect(retrievedQueue).toHaveLength(1);
        expect(retrievedQueue[0].evt).toEqual(request);
        /* The second XHR is the event request */
        respondMockRequest(200);
        retrievedQueue = readPostQueue();
        expect(retrievedQueue).toHaveLength(0);
      });
    });
  });

  describe('retryFailures = true', () => {
    const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
    let createOutQueue = () =>
      OutQueueManager(
        'sp',
        new SharedState(),
        true,
        'post',
        '/com.snowplowanalytics.snowplow/tp2',
        1,
        40000,
        0,
        false,
        maxQueueSize,
        10,
        false,
        {},
        true,
        [],
        [],
        '',
        true
      );

    it('should remain in queue on failure', (done) => {
      let outQueue = createOutQueue();
      outQueue.enqueueRequest(request, 'http://example.com');

      let retrievedQueue = readPostQueue();
      expect(retrievedQueue).toHaveLength(1);

      respondMockRequest(0);

      setTimeout(() => {
        retrievedQueue = readPostQueue();
        expect(retrievedQueue).toHaveLength(1);
        done();
      }, 20);
    });
  });

  describe('retryFailures = false', () => {
    const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
    let createOutQueue = () =>
      OutQueueManager(
        'sp',
        new SharedState(),
        true,
        'post',
        '/com.snowplowanalytics.snowplow/tp2',
        1,
        40000,
        0,
        false,
        maxQueueSize,
        0,
        false,
        {},
        true,
        [],
        [],
        '',
        false
      );

    it('should remove from queue on failure', (done) => {
      let outQueue = createOutQueue();
      outQueue.enqueueRequest(request, 'http://example.com');

      let retrievedQueue = readPostQueue();
      expect(retrievedQueue).toHaveLength(1);

      respondMockRequest(0);

      setTimeout(() => {
        retrievedQueue = readPostQueue();
        expect(retrievedQueue).toHaveLength(0);
        done();
      }, 20);
    });
  });

  type createQueueArgs = {
    method: string;
    onSuccess?: (data: EventBatch) => void;
    onFailure?: (data: RequestFailure) => void;
    maxPostBytes?: number;
    maxGetBytes?: number;
  };

  const createQueue = (args: createQueueArgs) =>
    OutQueueManager(
      'sp',
      new SharedState(),
      true,
      args.method,
      '/com.snowplowanalytics.snowplow/tp2',
      1,
      args.maxPostBytes ?? 40000,
      args.maxGetBytes ?? 0,
      true,
      maxQueueSize,
      5000,
      false,
      {},
      true,
      [],
      [],
      '',
      false,
      args.onSuccess,
      args.onFailure
    );

  describe('onRequestSuccess', () => {
    const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };

    describe('POST requests', () => {
      const method = 'POST';

      it('should fire on a successful request', () => {
        const callbackStorage: EventBatch[] = [];
        const onSuccess = (e: EventBatch) => {
          callbackStorage.push(e);
        };

        const postQueue = createQueue({ method, onSuccess });
        postQueue.enqueueRequest(request, 'http://example.com');

        expect(readPostQueue()).toHaveLength(1);

        respondMockRequest(200);

        expect(readPostQueue()).toHaveLength(0);
        expect(callbackStorage).toHaveLength(1);

        let dataFromCallback = callbackStorage[0][0] as Record<string, unknown>;
        expect(dataFromCallback.e).toEqual(request.e);
        expect(dataFromCallback.eid).toEqual(request.eid);
        expect(dataFromCallback.stm).toMatch(/\d{13}/);
      });

      // Oversized events don't get placed in the queue, but the callback should still fire
      it('should fire on a successful oversized request', () => {
        const callbackStorage: EventBatch[] = [];
        const onSuccess = (e: EventBatch) => {
          callbackStorage.push(e);
        };

        const postQueue = createQueue({ method, onSuccess, maxPostBytes: 1 });
        postQueue.enqueueRequest(request, 'http://example.com');

        respondMockRequest(200);

        expect(callbackStorage).toHaveLength(1);

        let dataFromCallback = callbackStorage[0][0] as Record<string, unknown>;
        expect(dataFromCallback.e).toEqual(request.e);
        expect(dataFromCallback.eid).toEqual(request.eid);
        expect(dataFromCallback.stm).toMatch(/\d{13}/);
      });
    });

    describe('GET requests', () => {
      const method = 'GET';

      it('should fire on a successful request', () => {
        let callbackStorage: EventBatch[] = [];
        const onSuccess = (e: EventBatch) => {
          callbackStorage.push(e);
        };

        const getQueue = createQueue({ method, onSuccess });
        getQueue.enqueueRequest(request, 'http://example.com');

        expect(readGetQueue()).toHaveLength(1);

        respondMockRequest(200);

        expect(readGetQueue()).toHaveLength(0);
        expect(callbackStorage).toHaveLength(1);

        let dataFromCallback = callbackStorage[0][0] as string;
        expect(dataFromCallback).toMatch(/\?stm=\d{13}&e=pv&eid=65cb78de-470c-4764-8c10-02bd79477a3a/);
      });

      // A single oversized events means no queue, but the callback should still fire
      it('should fire the onRequestSuccess on a successful oversized request', () => {
        let callbackStorage: EventBatch[] = [];
        const onSuccess = (e: EventBatch) => {
          callbackStorage.push(e);
        };

        const getQueue = createQueue({ method, onSuccess });
        getQueue.enqueueRequest(request, 'http://example.com');

        respondMockRequest(200);

        expect(callbackStorage).toHaveLength(1);

        let dataFromCallback = callbackStorage[0][0] as string;
        expect(dataFromCallback).toMatch(/\?stm=\d{13}&e=pv&eid=65cb78de-470c-4764-8c10-02bd79477a3a/);
      });
    });
  });

  describe('onRequestFailure', () => {
    const request = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };

    const createQueue = (args: createQueueArgs) =>
      OutQueueManager(
        'sp',
        new SharedState(),
        true,
        args.method,
        '/com.snowplowanalytics.snowplow/tp2',
        1,
        40000,
        0,
        true,
        maxQueueSize,
        5000,
        false,
        {},
        true,
        [],
        [500],
        '',
        false,
        args.onSuccess,
        args.onFailure
      );

    describe('POST requests', () => {
      const method = 'POST';

      it('should fire on a failed request', () => {
        const callbackStorage: RequestFailure[] = [];
        const onFailure = (e: RequestFailure) => {
          callbackStorage.push(e);
        };

        const postQueue = createQueue({ method, onFailure });
        postQueue.enqueueRequest(request, 'http://example.com');

        expect(readPostQueue()).toHaveLength(1);

        respondMockRequest(500, 'Internal Server Error');

        expect(readPostQueue()).toHaveLength(0);
        expect(callbackStorage).toHaveLength(1);

        let dataFromCallback = callbackStorage[0] as RequestFailure;

        const event = dataFromCallback.events[0] as Record<string, unknown>;
        expect(event.e).toEqual(request.e);
        expect(event.eid).toEqual(request.eid);
        expect(event.stm).toMatch(/\d{13}/);

        expect(dataFromCallback.status).toEqual(500);
        expect(dataFromCallback.message).toEqual('Internal Server Error');
        expect(dataFromCallback.willRetry).toEqual(false);
      });

      // A single oversized events means no queue, but the callback should still fire
      it('should fire on a failed oversized request', () => {
        const callbackStorage: RequestFailure[] = [];
        const onFailure = (e: RequestFailure) => {
          callbackStorage.push(e);
        };

        const postQueue = createQueue({ method, onFailure, maxPostBytes: 1 });
        postQueue.enqueueRequest(request, 'http://example.com');

        respondMockRequest(0, 'Request failed');

        expect(callbackStorage).toHaveLength(1);

        let dataFromCallback = callbackStorage[0].events[0] as Record<string, unknown>;
        expect(dataFromCallback.e).toEqual(request.e);
        expect(dataFromCallback.eid).toEqual(request.eid);

        // The payload will have had `stm` added to it
        expect(dataFromCallback.stm).toMatch(/\d{13}/);
        expect(callbackStorage[0].status).toEqual(0);
        expect(callbackStorage[0].message).toEqual('Request failed');
      });
    });

    describe('GET requests', () => {
      const method = 'GET';

      it('should fire on a failed request', () => {
        let callbackStorage: RequestFailure[] = [];
        const onFailure = (e: RequestFailure) => {
          callbackStorage.push(e);
        };

        const getQueue = createQueue({ method, onFailure });
        getQueue.enqueueRequest(request, 'http://example.com');

        expect(readGetQueue()).toHaveLength(1);

        respondMockRequest(500, 'Internal Server Error');

        expect(readGetQueue()).toHaveLength(0);
        expect(callbackStorage).toHaveLength(1);

        let dataFromCallback = callbackStorage[0] as RequestFailure;

        expect(dataFromCallback.events[0]).toMatch(/\?stm=\d{13}&e=pv&eid=65cb78de-470c-4764-8c10-02bd79477a3a/);

        expect(dataFromCallback.status).toEqual(500);
        expect(dataFromCallback.message).toEqual('Internal Server Error');
        expect(dataFromCallback.willRetry).toEqual(false);
      });

      // A single oversized events means no queue, but the callback should still fire
      it('should fire on a failed oversized request', () => {
        let callbackStorage: RequestFailure[] = [];
        const onFailure = (e: RequestFailure) => {
          callbackStorage.push(e);
        };

        const getQueue = createQueue({ method, onFailure, maxPostBytes: 1 });
        getQueue.enqueueRequest(request, 'http://example.com');

        expect(readGetQueue()).toHaveLength(1);

        respondMockRequest(500, 'Internal Server Error');

        expect(readGetQueue()).toHaveLength(0);
        expect(callbackStorage).toHaveLength(1);

        let dataFromCallback = callbackStorage[0] as RequestFailure;

        expect(dataFromCallback.events[0]).toMatch(/\?stm=\d{13}&e=pv&eid=65cb78de-470c-4764-8c10-02bd79477a3a/);

        expect(dataFromCallback.status).toEqual(500);
        expect(dataFromCallback.message).toEqual('Internal Server Error');
        expect(dataFromCallback.willRetry).toEqual(false);
      });
    });
  });
});
