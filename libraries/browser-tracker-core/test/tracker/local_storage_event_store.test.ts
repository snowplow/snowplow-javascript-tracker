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

import { newLocalStorageEventStore } from '../../src/tracker/local_storage_event_store';

describe('LocalStorageEventStore', () => {
  const trackerId = 'test-tracker';

  beforeEach(() => {
    localStorage.clear();
  });

  it('should create an event store with useLocalStorage enabled', async () => {
    const eventStore = newLocalStorageEventStore({
      trackerId,
      useLocalStorage: true,
    });

    expect(await eventStore.count()).toBe(0);
  });

  it('should create an event store with useLocalStorage disabled', async () => {
    const eventStore = newLocalStorageEventStore({
      trackerId,
      useLocalStorage: false,
    });

    expect(await eventStore.count()).toBe(0);
  });

  it('should add and retrieve events when localStorage is accessible', async () => {
    const eventStore = newLocalStorageEventStore({
      trackerId,
      useLocalStorage: true,
    });

    const event = { payload: { e: 'pv', eid: 'test-event-id' } };
    await eventStore.add(event);

    expect(await eventStore.count()).toBe(1);
    const events = await eventStore.getAllPayloads();
    expect(events[0]).toMatchObject(event.payload);
  });

  it('should handle SecurityError when accessing localStorage.getItem', () => {
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = jest.fn(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    // Should not throw an error, but should create an empty in-memory store
    const eventStore = newLocalStorageEventStore({
      trackerId,
      useLocalStorage: true,
    });

    expect(eventStore).toBeDefined();
    expect(eventStore.count).toBeDefined();

    Storage.prototype.getItem = originalGetItem;
  });

  it('should handle SecurityError when accessing localStorage.setItem', async () => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = jest.fn(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    const eventStore = newLocalStorageEventStore({
      trackerId,
      useLocalStorage: true,
    });

    const event = { payload: { e: 'pv', eid: 'test-event-id' } };
    
    // Should not throw an error, even though setItem fails
    await expect(eventStore.add(event)).resolves.toBeDefined();

    // Event should still be in the in-memory store
    expect(await eventStore.count()).toBe(1);

    Storage.prototype.setItem = originalSetItem;
  });

  it('should gracefully handle errors when both getItem and setItem throw SecurityError', async () => {
    const originalGetItem = Storage.prototype.getItem;
    const originalSetItem = Storage.prototype.setItem;
    
    Storage.prototype.getItem = jest.fn(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });
    Storage.prototype.setItem = jest.fn(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    const eventStore = newLocalStorageEventStore({
      trackerId,
      useLocalStorage: true,
    });

    const event = { payload: { e: 'pv', eid: 'test-event-id' } };
    await eventStore.add(event);

    // Event should be in the in-memory store
    expect(await eventStore.count()).toBe(1);
    const events = await eventStore.getAllPayloads();
    expect(events[0]).toMatchObject(event.payload);

    Storage.prototype.getItem = originalGetItem;
    Storage.prototype.setItem = originalSetItem;
  });

  it('should persist events to localStorage when accessible', async () => {
    const eventStore = newLocalStorageEventStore({
      trackerId,
      useLocalStorage: true,
    });

    const event = { payload: { e: 'pv', eid: 'test-event-id' } };
    await eventStore.add(event);

    // Check that the event was persisted to localStorage
    const queueName = `snowplowOutQueue_${trackerId}`;
    const stored = localStorage.getItem(queueName);
    expect(stored).toBeDefined();
    expect(JSON.parse(stored!)).toHaveLength(1);
  });

  it('should load events from localStorage on initialization', () => {
    const queueName = `snowplowOutQueue_${trackerId}`;
    const events = [{ payload: { e: 'pv', eid: 'event-1' } }, { payload: { e: 'pv', eid: 'event-2' } }];
    localStorage.setItem(queueName, JSON.stringify(events));

    const eventStore = newLocalStorageEventStore({
      trackerId,
      useLocalStorage: true,
    });

    expect(eventStore.count()).resolves.toBe(2);
  });

  it('should not load from localStorage when useLocalStorage is false', () => {
    const queueName = `snowplowOutQueue_${trackerId}`;
    const events = [{ payload: { e: 'pv', eid: 'event-1' } }, { payload: { e: 'pv', eid: 'event-2' } }];
    localStorage.setItem(queueName, JSON.stringify(events));

    const eventStore = newLocalStorageEventStore({
      trackerId,
      useLocalStorage: false,
    });

    expect(eventStore.count()).resolves.toBe(0);
  });
});
