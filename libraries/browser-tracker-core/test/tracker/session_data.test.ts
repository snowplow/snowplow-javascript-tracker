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

import { addTracker, SharedState } from '../../src';
import { createTestIdCookie, createTestSessionIdCookie } from '../helpers';

jest.useFakeTimers('modern');

describe('Tracker API: ', () => {
  let cookieJar: string;

  beforeAll(() => {
    cookieJar = '';
    jest.spyOn(document, 'cookie', 'set').mockImplementation((cookie) => {
      cookieJar += cookie;
    });
    jest.spyOn(document, 'cookie', 'get').mockImplementation(() => cookieJar);
  });

  afterEach(() => {
    cookieJar = '';
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('Sets initial domain session index on first session', () => {
    const tracker = addTracker('sp1', 'sp1', '', '', new SharedState());

    expect(tracker?.getDomainSessionIndex()).toEqual(1);
  });

  it('Sets correct domain session index on new session', () => {
    const initialSessionIndex = 1;
    document.cookie = createTestIdCookie({ visitCount: initialSessionIndex });
    const tracker = addTracker('sp2', 'sp2', '', '', new SharedState());

    expect(tracker?.getDomainSessionIndex()).toEqual(initialSessionIndex + 1);
  });

  it('Sets correct domain session index on existing session', () => {
    const initialSessionIndex = 2;
    document.cookie = createTestIdCookie({ visitCount: initialSessionIndex }) + ' ' + createTestSessionIdCookie();
    const tracker = addTracker('sp3', 'sp3', '', '', new SharedState());

    expect(tracker?.getDomainSessionIndex()).toEqual(initialSessionIndex);
  });

  it('Sets correct domain session index (1) after clearUserData() on existing session', () => {
    const initialSessionIndex = 2;
    document.cookie = createTestIdCookie({ visitCount: initialSessionIndex }) + ' ' + createTestSessionIdCookie();
    const tracker = addTracker('sp4', 'sp4', '', '', new SharedState());
    expect(tracker?.getDomainSessionIndex()).toEqual(initialSessionIndex);

    tracker?.clearUserData();
    expect(tracker?.getDomainSessionIndex()).toEqual(1);
  });

  it('Sets correct domain session index anonymous track', () => {
    const tracker = addTracker('sp5', 'sp5', '', '', new SharedState(), { anonymousTracking: true });
    expect(tracker?.getDomainSessionIndex()).toEqual(1);
  });

  it('Retains correct domain session index on opt-out cookie present', () => {
    const optOutCookieName = 'optOut';
    const tracker = addTracker('sp6', 'sp6', '', '', new SharedState());
    tracker?.setOptOutCookie(optOutCookieName);
    document.cookie = `${optOutCookieName}=1;`;

    tracker?.trackPageView({ title: 'my page' });
    expect(tracker?.getDomainSessionIndex()).toEqual(1);
  });

  it('Sets correct domain session index after session expiration', () => {
    // Session timeout is in seconds
    const tracker = addTracker('sp7', 'sp7', '', '', new SharedState(), { sessionCookieTimeout: 1 });
    // Advance timer by more than one second
    jest.advanceTimersByTime(1001);
    tracker?.trackPageView({ title: 'my page' });
    expect(tracker?.getDomainSessionIndex()).toEqual(2);
  });
});
