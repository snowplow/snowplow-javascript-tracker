/*
 * Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang
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

import { SharedState, Tracker } from '@snowplow/browser-core';
import F from 'lodash/fp';

jest.useFakeTimers('modern');

const getPPEvents = F.compose(F.filter(F.compose(F.eq('pp'), F.get('evt.e'))), F.first);

const extractSchemas = F.map(F.compose(F.get('data'), (cx: string) => JSON.parse(cx), F.get('evt.co')));

const extractPageId = F.compose(F.get('data[0].data.id'), (cx: string) => JSON.parse(cx), F.get('evt.co'));

describe('Activity tracker behaviour', () => {
  beforeAll(() => {
    document.domain = 'http://localhost';
  });

  beforeEach(() => {
    jest.clearAllTimers();
  });

  it('supports different timings for ping vs callback activity tracking', () => {
    let callbacks = 0;
    const state = new SharedState();
    const t = Tracker('', '', '', '', state, { stateStorageStrategy: 'cookie' });
    t.enableActivityTracking(10, 10);
    t.enableActivityTrackingCallback(5, 5, () => {
      callbacks++;
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
    expect(F.size(getPPEvents(state.outQueues))).toBe(2);
  });

  it('maintains current static context behaviour', () => {
    const state = new SharedState();
    const t = Tracker('', '', '', '', state, {
      resetActivityTrackingOnPageView: false,
      stateStorageStrategy: 'cookie',
      encodeBase64: false,
    });
    t.enableActivityTracking(0, 2);
    t.trackPageView(null, [
      {
        schema: 'iglu:com.acme/static_context/jsonschema/1-0-0',
        data: {
          staticValue: Date.now(),
        },
      },
    ]);
    const pageOneTime = Date.now();

    jest.advanceTimersByTime(500);

    t.updatePageActivity();
    jest.advanceTimersByTime(2000); // PP = 1

    // page two with new static context, time has moved on 2 seconds by now
    t.trackPageView(null, [
      {
        schema: 'iglu:com.acme/static_context/jsonschema/1-0-0',
        data: {
          staticValue: Date.now(),
        },
      },
    ]);
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
    expect(countWithStaticValueEq(pageOneTime)(state.outQueues)).toBe(2);
    expect(countWithStaticValueEq(pageTwoTime)(state.outQueues)).toBe(0);
  });

  it('does not reset activity tracking on pageview when resetActivityTrackingOnPageView: false,', () => {
    const state = new SharedState();
    const t = Tracker('', '', '', '', state, {
      resetActivityTrackingOnPageView: false,
      stateStorageStrategy: 'cookie',
      encodeBase64: false,
    });
    t.enableActivityTracking(0, 30);
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
    const pps = getPPEvents(state.outQueues);
    expect(F.size(pps)).toBe(2);
  });

  it('does reset activity tracking on pageview by default', () => {
    const state = new SharedState();
    const t = Tracker('', '', '', '', state, {
      stateStorageStrategy: 'cookie',
      encodeBase64: false,
    });
    t.enableActivityTracking(0, 30);
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

    const pps = getPPEvents(state.outQueues);

    expect(F.size(pps)).toBe(1);
  });

  it('fires initial delayed activity tracking on first pageview and second pageview', () => {
    const state = new SharedState();
    const t = Tracker('', '', '', '', state, {
      stateStorageStrategy: 'cookie',
      encodeBase64: false,
    });
    t.enableActivityTracking(10, 5);

    t.trackPageView();
    const firstPageId = t.getPageViewId();

    jest.advanceTimersByTime(2500);

    // initial callback timer starts tracking
    t.updatePageActivity();

    jest.advanceTimersByTime(5000);

    const initial_pps = getPPEvents(state.outQueues);
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
    const first_page_only_pps = getPPEvents(state.outQueues);
    expect(F.size(first_page_only_pps)).toBe(3);

    jest.advanceTimersByTime(5000); // PP = 4

    // window for page ping ticks
    t.updatePageActivity();
    jest.advanceTimersByTime(5000); // PP = 5

    // Activity began tracking on the first page and tracked two page pings in 16 seconds.
    // Activity tracking only fires one further event over next 11 seconds as a page view event occurs, resetting timer back to 10 seconds.

    const pps = getPPEvents(state.outQueues);

    expect(F.size(pps)).toBe(5);

    const pph = F.head(pps);
    const ppl = F.last(pps);

    expect(firstPageId).toBe(extractPageId(pph));
    expect(secondPageId).toBe(extractPageId(ppl));
  });
});
