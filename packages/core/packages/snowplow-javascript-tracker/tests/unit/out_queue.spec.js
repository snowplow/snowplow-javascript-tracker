/*
 * JavaScript tracker for Snowplow: tests/unit/out_queue.spec.js
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

import { OutQueueManager } from '../../src/js/out_queue'

describe('OutQueueManager', () => {

  const maxQueueSize = 2;

  var outQueue;

  beforeEach(() => {
    localStorage.clear();

    outQueue = new OutQueueManager(
      'sp', 'cf', {outQueues: []}, true, 'post', 
      '/com.snowplowanalytics.snowplow/tp2', 1, 40000, false,
      maxQueueSize
    );
  })

  it('should add event to outQueue and store event in local storage', () => {
    const expected = { e: "pv", eid: "20269f92-f07c-44a6-87ef-43e171305076" };
    outQueue.enqueueRequest(expected, '');

    const retrievedQueue = JSON.parse(window.localStorage.getItem('snowplowOutQueue_sp_cf_post2'));
    expect(retrievedQueue).toHaveLength(1);
    expect(retrievedQueue[0]).toMatchObject({ bytes: 55, evt: expected });
  })

  it('should add event to outQueue and store only events up to max local storage queue size in local storage', () => {
    const expected1 = { e: "pv", eid: "65cb78de-470c-4764-8c10-02bd79477a3a" };
    const expected2 = { e: "pv", eid: "6000c7bd-08a6-49c2-b61c-9531d3d46200" };
    const unexpected = { e: "pv", eid:"7a3391a8-622b-4ce4-80ed-c941aa05baf5" };

    outQueue.enqueueRequest(expected1, '');
    outQueue.enqueueRequest(expected2, '');
    outQueue.enqueueRequest(unexpected, '');

    const retrievedQueue = JSON.parse(window.localStorage.getItem('snowplowOutQueue_sp_cf_post2'));
    expect(retrievedQueue).toHaveLength(maxQueueSize);
    expect(retrievedQueue[0]).toMatchObject({ bytes: 55, evt: expected1 });
    expect(retrievedQueue[1]).toMatchObject({ bytes: 55, evt: expected2 });
  })
})
