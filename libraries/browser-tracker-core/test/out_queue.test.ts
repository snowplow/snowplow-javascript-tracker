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

describe('OutQueueManager', () => {
  const maxQueueSize = 2;

  var outQueue: OutQueue;

  beforeEach(() => {
    localStorage.clear();

    outQueue = OutQueueManager(
      'sp',
      new SharedState(),
      true,
      'post',
      '/com.snowplowanalytics.snowplow/tp2',
      1,
      40000,
      false,
      maxQueueSize,
      5000,
      false,
      {},
      true
    );
  });

  it('should add event to outQueue and store event in local storage', () => {
    const expected = { e: 'pv', eid: '20269f92-f07c-44a6-87ef-43e171305076' };
    outQueue.enqueueRequest(expected, '');

    const retrievedQueue = JSON.parse(
      window.localStorage.getItem('snowplowOutQueue_sp_post2') ?? fail('Unable to find local storage queue')
    );
    expect(retrievedQueue).toHaveLength(1);
    expect(retrievedQueue[0]).toMatchObject({ bytes: 55, evt: expected });
  });

  it('should add event to outQueue and store only events up to max local storage queue size in local storage', () => {
    const expected1 = { e: 'pv', eid: '65cb78de-470c-4764-8c10-02bd79477a3a' };
    const expected2 = { e: 'pv', eid: '6000c7bd-08a6-49c2-b61c-9531d3d46200' };
    const unexpected = { e: 'pv', eid: '7a3391a8-622b-4ce4-80ed-c941aa05baf5' };

    outQueue.enqueueRequest(expected1, '');
    outQueue.enqueueRequest(expected2, '');
    outQueue.enqueueRequest(unexpected, '');

    const retrievedQueue = JSON.parse(
      window.localStorage.getItem('snowplowOutQueue_sp_post2') ?? fail('Unable to find local storage queue')
    );
    expect(retrievedQueue).toHaveLength(maxQueueSize);
    expect(retrievedQueue[0]).toMatchObject({ bytes: 55, evt: expected1 });
    expect(retrievedQueue[1]).toMatchObject({ bytes: 55, evt: expected2 });
  });
});
