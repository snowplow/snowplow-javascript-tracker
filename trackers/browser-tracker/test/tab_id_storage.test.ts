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

import { addTracker, SharedState } from '@snowplow/browser-tracker-core';

describe('Tab identification behaviour', () => {
  let mockStorage: Record<string, any> = {};

  beforeAll(() => {
    global.Storage.prototype.setItem = jest.fn((key, value) => {
      mockStorage[key] = value;
    });
    global.Storage.prototype.getItem = jest.fn((key) => mockStorage[key]);
  });

  beforeEach(() => {
    mockStorage = {};
  });

  afterAll(() => {
    (global.Storage.prototype.setItem as jest.Mock).mockReset();
    (global.Storage.prototype.getItem as jest.Mock).mockReset();
  });

  it('creates a tab identifier and persists across tracking', () => {
    const state = new SharedState();
    const tracker =
      addTracker('sp1', 'sp1', '', '', state, { contexts: { browser: true } }) ?? fail('Failed to create tracker');

    tracker.trackPageView();
    const tabId = tracker.getTabId();
    expect(tabId).toEqual(window.sessionStorage.getItem('_sp_tab_id'));

    tracker.trackPageView();
    expect(tabId).toEqual(tracker.getTabId());
  });

  it('uses a null tab identifier on anonymous tracking', () => {
    const state = new SharedState();
    const tracker =
      addTracker('sp2', 'sp2', '', '', state, { anonymousTracking: true, contexts: { browser: true } }) ??
      fail('Failed to create tracker');

    tracker.trackPageView();
    expect(window.sessionStorage.getItem('_sp_tab_id')).toBe(undefined);
    expect(tracker.getTabId()).toEqual(null);
  });

  it('uses a null tab identifier on stateless strategy', () => {
    const state = new SharedState();
    const tracker =
      addTracker('sp3', 'sp3', '', '', state, { stateStorageStrategy: 'none', contexts: { browser: true } }) ??
      fail('Failed to create tracker');

    tracker.trackPageView();
    expect(window.sessionStorage.getItem('_sp_tab_id')).toBe(undefined);
    // Every call should generate a random identifier
    expect(tracker.getTabId()).toEqual(null);
  });

  it('uses the correct stored identifier after disabling anonymous tracking', () => {
    const state = new SharedState();
    const tracker =
      addTracker('sp4', 'sp4', '', '', state, { anonymousTracking: true, contexts: { browser: true } }) ??
      fail('Failed to create tracker');

    tracker.trackPageView();
    expect(window.sessionStorage.getItem('_sp_tab_id')).toBe(undefined);
    expect(tracker.getTabId()).toEqual(null);

    tracker.disableAnonymousTracking();
    tracker.trackPageView();
    const storedTabId = window.sessionStorage.getItem('_sp_tab_id');
    const tabId = tracker.getTabId();
    expect(storedTabId).not.toBe(undefined);
    expect(tabId).toEqual(storedTabId);
  });
});
