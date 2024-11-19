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

import { SharedState, addTracker, EventStore, Payload } from '@snowplow/browser-tracker-core';
import F from 'lodash/fp';
import { newInMemoryEventStore } from '@snowplow/tracker-core';

jest.useFakeTimers();

const getPPEvents: (events: readonly Payload[]) => Payload[] = (events) => {
  return events.filter((payload) => payload.e === 'pp');
};

const extractSchemas: (events: Payload[]) => any[] = (events) => {
  return events.map((payload) => {
    return JSON.parse(payload.co as string).data;
  });
};

const extractPageId: (payload: Payload) => string = (payload) => {
  return JSON.parse(payload.co as string).data[0].data.id;
};

describe('Activity tracker behaviour', () => {
  let eventStore: EventStore;
  const customFetch = async () => new Response(null, { status: 500 });

  beforeEach(() => {
    eventStore = newInMemoryEventStore({});
  });

  beforeAll(() => {
    document.domain = 'http://localhost';
  });

  beforeEach(() => {
    jest.clearAllTimers();
  });

  it('supports different timings for ping vs callback activity tracking', async () => {
    let callbacks = 0;
    const state = new SharedState();
    const t =
      addTracker('sp1', 'sp1', '', '', state, { stateStorageStrategy: 'cookie', customFetch, eventStore }) ??
      fail('Failed to create tracker');
    t.enableActivityTracking({ minimumVisitLength: 10, heartbeatDelay: 10 });
    t.enableActivityTrackingCallback({
      minimumVisitLength: 5,
      heartbeatDelay: 5,
      callback: () => {
        callbacks++;
      },
    });
    t.trackPageView();
    jest.advanceTimersByTime(2500);
    t.updatePageActivity();
    jest.advanceTimersByTime(5000); // CB = 1, PP = 0

    // callback timer starts tracking
    t.updatePageActivity();
    jest.advanceTimersByTime(5000); // CB = 2, PP = 1

    // page ping timer starts tracking
    t.updatePageActivity();
    jest.advanceTimersByTime(5000); // CB = 3, PP = 1

    // window for callbacks ticks
    t.updatePageActivity();
    jest.advanceTimersByTime(5000); // CB = 4, PP = 2
    // window for page ping ticks

    expect(callbacks).toBe(4);
    const events = await eventStore.getAllPayloads();
    expect(F.size(getPPEvents(events))).toBe(2);
  });

  it('maintains current static context behaviour', async () => {
    const state = new SharedState();
    const t =
      addTracker('sp2', 'sp2', '', '', state, {
        resetActivityTrackingOnPageView: false,
        stateStorageStrategy: 'cookie',
        encodeBase64: false,
        customFetch,
        eventStore,
      }) ?? fail('Failed to create tracker');
    t.enableActivityTracking({ minimumVisitLength: 0, heartbeatDelay: 2 });
    t.trackPageView({
      context: [
        {
          schema: 'iglu:com.acme/static_context/jsonschema/1-0-0',
          data: {
            staticValue: Date.now(),
          },
        },
      ],
    });
    const pageOneTime = Date.now();

    jest.advanceTimersByTime(500);

    t.updatePageActivity();
    jest.advanceTimersByTime(2000); // PP = 1

    // page two with new static context, time has moved on 2 seconds by now
    t.trackPageView({
      context: [
        {
          schema: 'iglu:com.acme/static_context/jsonschema/1-0-0',
          data: {
            staticValue: Date.now(),
          },
        },
      ],
    });
    const pageTwoTime = Date.now();

    jest.advanceTimersByTime(500);
    t.updatePageActivity();
    jest.advanceTimersByTime(2000); // PP = 2

    // current behaviour is to capture context on the first trackPageView after enabling
    // event tracking. This might not be ideal, but lets make sure it stays this way
    // unless we mean it to change when resetActivityTrackingOnPageView = false.

    const findWithStaticValue = F.filter(F.get('data.staticValue'));
    const extractContextsWithStaticValue = F.compose(findWithStaticValue, F.flatten, extractSchemas, getPPEvents);

    const countWithStaticValueEq = (value: number) =>
      F.compose(F.size, F.filter(F.compose(F.eq(value), F.get('data.staticValue'))), extractContextsWithStaticValue);

    // we expect there to be two page pings with static contexts attached
    // they should both have the time from page one.
    const events = await eventStore.getAllPayloads();
    expect(countWithStaticValueEq(pageOneTime)(events)).toBe(2);
    expect(countWithStaticValueEq(pageTwoTime)(events)).toBe(0);
  });

  it('does not reset activity tracking on pageview when resetActivityTrackingOnPageView: false,', async () => {
    const state = new SharedState();
    const t =
      addTracker('sp3', 'sp3', '', '', state, {
        resetActivityTrackingOnPageView: false,
        stateStorageStrategy: 'cookie',
        encodeBase64: false,
        customFetch,
        eventStore,
      }) ?? fail('Failed to create tracker');
    t.enableActivityTracking({ minimumVisitLength: 0, heartbeatDelay: 30 });
    t.trackPageView();

    jest.advanceTimersByTime(15000);

    // activity on page one
    t.updatePageActivity();
    jest.advanceTimersByTime(25000);

    // activity on page one
    t.updatePageActivity();

    // shift to page two and trigger tick
    t.trackPageView();
    jest.advanceTimersByTime(25000);

    // Activity tracking is currently not reset per page view so we get an extra page ping on page two.
    const events = await eventStore.getAllPayloads();
    const pps = getPPEvents(events);
    expect(F.size(pps)).toBe(2);
  });

  it('does reset activity tracking on pageview by default', async () => {
    const state = new SharedState();
    const t =
      addTracker('sp4', 'sp4', '', '', state, {
        stateStorageStrategy: 'cookie',
        encodeBase64: false,
        customFetch,
        eventStore,
      }) ?? fail('Failed to create tracker');
    t.enableActivityTracking({ minimumVisitLength: 0, heartbeatDelay: 30 });
    t.trackPageView();

    jest.advanceTimersByTime(15000);

    // activity on page one
    t.updatePageActivity();

    jest.advanceTimersByTime(25000); // PP = 1

    // activity on page one
    t.updatePageActivity();

    // shift to page two and trigger tick
    t.trackPageView();

    jest.advanceTimersByTime(5000);

    // activity on page two
    t.updatePageActivity();

    jest.advanceTimersByTime(20000);

    // Activity began tracking on the first page but moved on before 30 seconds.
    // Activity tracking should still not have fire despite being on site 30 seconds, as user has moved page.

    const events = await eventStore.getAllPayloads();
    const pps = getPPEvents(events);

    expect(F.size(pps)).toBe(1);
  });

  it('fires initial delayed activity tracking on first pageview and second pageview', async () => {
    const state = new SharedState();
    const t =
      addTracker('sp5', 'sp5', '', '', state, {
        stateStorageStrategy: 'cookie',
        encodeBase64: false,
        customFetch,
        eventStore,
      }) ?? fail('Failed to create tracker');
    t.enableActivityTracking({ minimumVisitLength: 10, heartbeatDelay: 5 });

    t.trackPageView();
    const firstPageId = t.getPageViewId();

    jest.advanceTimersByTime(2500);

    // initial callback timer starts tracking
    t.updatePageActivity();

    jest.advanceTimersByTime(5000);

    const initial_pps = getPPEvents(await eventStore.getAllPayloads());
    expect(F.size(initial_pps)).toBe(0);

    jest.advanceTimersByTime(5000); // PP = 1

    // page ping timer starts tracking
    t.updatePageActivity();

    jest.advanceTimersByTime(5000); // PP = 2

    t.updatePageActivity();
    jest.advanceTimersByTime(5000); // PP = 3

    // Move to second page view
    t.trackPageView();
    const secondPageId = t.getPageViewId();

    jest.advanceTimersByTime(2500);

    // window for callbacks ticks
    t.updatePageActivity();

    jest.advanceTimersByTime(5000);

    // Should still only have 3 page pings from first page
    const first_page_only_pps = getPPEvents(await eventStore.getAllPayloads());
    expect(F.size(first_page_only_pps)).toBe(3);

    jest.advanceTimersByTime(5000); // PP = 4

    // window for page ping ticks
    t.updatePageActivity();
    jest.advanceTimersByTime(5000); // PP = 5

    // Activity began tracking on the first page and tracked two page pings in 16 seconds.
    // Activity tracking only fires one further event over next 11 seconds as a page view event occurs, resetting timer back to 10 seconds.

    const pps = getPPEvents(await eventStore.getAllPayloads());

    expect(F.size(pps)).toBe(5);

    const pph = F.head(pps);
    const ppl = F.last(pps);

    expect(firstPageId).toBe(extractPageId(pph!));
    expect(secondPageId).toBe(extractPageId(ppl!));
  });

  it('disables activity tracking', async () => {
    const state = new SharedState();
    const t =
      addTracker('sp6', 'sp6', '', '', state, { stateStorageStrategy: 'cookie', customFetch, eventStore }) ??
      fail('Failed to create tracker');
    t.enableActivityTracking({ minimumVisitLength: 5, heartbeatDelay: 5 });
    t.trackPageView();

    jest.advanceTimersByTime(100);
    t.updatePageActivity();
    jest.advanceTimersByTime(4900);

    expect(F.size(getPPEvents(await eventStore.getAllPayloads()))).toBe(1);

    // page ping timer starts tracking
    jest.advanceTimersByTime(100);
    t.updatePageActivity();
    jest.advanceTimersByTime(4900);

    expect(F.size(getPPEvents(await eventStore.getAllPayloads()))).toBe(2);

    /* Disabling activity tracking and callback is expected to not allow more activity actions */
    t.disableActivityTracking();
    t.disableActivityTrackingCallback();

    jest.advanceTimersByTime(100);
    t.updatePageActivity();
    jest.advanceTimersByTime(4900);

    expect(F.size(getPPEvents(await eventStore.getAllPayloads()))).toBe(2);
  });

  it('disables activity tracking callback', () => {
    let callbacks = 0;
    const state = new SharedState();
    const t =
      addTracker('sp7', 'sp7', '', '', state, { stateStorageStrategy: 'cookie', customFetch, eventStore }) ??
      fail('Failed to create tracker');
    t.enableActivityTrackingCallback({ minimumVisitLength: 5, heartbeatDelay: 5, callback: () => callbacks++ });
    t.trackPageView();

    jest.advanceTimersByTime(100);
    t.updatePageActivity();
    jest.advanceTimersByTime(4900);

    expect(callbacks).toBe(1);

    // page ping timer starts tracking
    jest.advanceTimersByTime(100);
    t.updatePageActivity();
    jest.advanceTimersByTime(4900);

    expect(callbacks).toBe(2);

    /* Disabling activity tracking and callback is expected to not allow more activity actions */
    t.disableActivityTracking();
    t.disableActivityTrackingCallback();

    jest.advanceTimersByTime(100);
    t.updatePageActivity();
    jest.advanceTimersByTime(4900);

    expect(callbacks).toBe(2);
  });
});
