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

import * as uuid from 'uuid';
jest.mock('uuid');
const MOCK_UUID = '123456789';
jest.spyOn(uuid, 'v4').mockReturnValue(MOCK_UUID);

import { createTestIdCookie, createTestSessionIdCookie, createTracker } from '../helpers';

jest.useFakeTimers();

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

  it('Writes cookies synchronously on session change', () => {
    const tracker = createTracker(undefined, undefined, false); // async cookie writes enabled

    expect(cookieJar).toContain('_sp_ses');

    tracker?.newSession();
    expect(cookieJar).toContain(tracker?.getDomainUserInfo().slice(1).join('.'));
  });

  it('Sets initial domain session index on first session', () => {
    const tracker = createTracker();

    expect(tracker?.getDomainSessionIndex()).toEqual(1);
  });

  it('Sets correct domain session index on new session', () => {
    const initialSessionIndex = 1;
    document.cookie = createTestIdCookie({ visitCount: initialSessionIndex });
    const tracker = createTracker();

    expect(tracker?.getDomainSessionIndex()).toEqual(initialSessionIndex + 1);
  });

  it('Sets correct domain session index on existing session', () => {
    const initialSessionIndex = 2;
    document.cookie = createTestIdCookie({ visitCount: initialSessionIndex }) + ' ' + createTestSessionIdCookie();
    const tracker = createTracker();

    expect(tracker?.getDomainSessionIndex()).toEqual(initialSessionIndex);
  });

  it('Sets correct domain session index (1) after clearUserData() on existing session', () => {
    const initialSessionIndex = 2;
    document.cookie = createTestIdCookie({ visitCount: initialSessionIndex }) + ' ' + createTestSessionIdCookie();
    const tracker = createTracker();
    expect(tracker?.getDomainSessionIndex()).toEqual(initialSessionIndex);

    tracker?.clearUserData();
    expect(tracker?.getDomainSessionIndex()).toEqual(1);
  });

  it('Sets blank domain user id after clearUserData() if anonymous tracking', () => {
    const tracker = createTracker({
      anonymousTracking: { withSessionTracking: true },
    });

    tracker?.clearUserData();
    expect(tracker?.getDomainUserId()).toEqual('');
  });

  it('Sets correct domain session index anonymous track', () => {
    const tracker = createTracker({ anonymousTracking: true });
    expect(tracker?.getDomainSessionIndex()).toEqual(1);
  });

  it('Retains correct domain session index on opt-out cookie present', () => {
    const optOutCookieName = 'optOut';
    const tracker = createTracker();
    tracker?.setOptOutCookie(optOutCookieName);
    document.cookie = `${optOutCookieName}=1;`;

    tracker?.trackPageView({ title: 'my page' });
    expect(tracker?.getDomainSessionIndex()).toEqual(1);
  });

  it('Sets correct domain session index after session expiration', () => {
    // Session timeout is in seconds
    const tracker = createTracker({ sessionCookieTimeout: 1 });
    // Advance timer by more than one second
    jest.advanceTimersByTime(1001);
    tracker?.trackPageView({ title: 'my page' });
    expect(tracker?.getDomainSessionIndex()).toEqual(2);
  });

  it('Adds the client session context entity when enabled', (done) => {
    const tracker = createTracker({
      contexts: { session: true },
      encodeBase64: false,
      plugins: [
        {
          afterTrack: (payload) => {
            let context = payload.co as string;
            expect(context).toContain('client_session');
            done();
          },
        },
      ],
    });

    tracker?.trackPageView();
  });

  it('Adds the client session context entity when anonymous session tracking', (done) => {
    const tracker = createTracker({
      contexts: { session: true },
      encodeBase64: false,
      anonymousTracking: { withSessionTracking: true },
      plugins: [
        {
          afterTrack: (payload) => {
            let context = payload.co as string;
            expect(context).toContain('client_session');
            expect(context).toContain('"userId":"00000000-0000-0000-0000-000000000000"');
            expect(context).toContain('"previousSessionId":null');
            done();
          },
        },
      ],
    });

    tracker?.trackPageView();
  });

  it("Doesn't add the client session context entity when anonymous tracking without session tracking", (done) => {
    const tracker = createTracker({
      contexts: { session: true },
      encodeBase64: false,
      anonymousTracking: true,
      plugins: [
        {
          afterTrack: (payload) => {
            let context = payload.co as string;
            expect(context).not.toContain('client_session');
            done();
          },
        },
      ],
    });

    tracker?.trackPageView();
  });

  describe('onSessionUpdateCallback functionality', () => {
    beforeEach(() => {
      const standardDate = new Date('2023-01-01T00:00:00Z');
      jest.setSystemTime(standardDate);
    });

    it('properly calls onSessionUpdateCallback', (done) => {
      const tracker = createTracker({
        contexts: { session: true },
        encodeBase64: false,
        onSessionUpdateCallback(updatedSession) {
          expect(updatedSession).toMatchSnapshot();
          done();
        },
      });

      tracker?.trackPageView();
    });

    it('properly calls onSessionUpdateCallback with correct storage strategy', (done) => {
      const tracker = createTracker({
        contexts: { session: true },
        encodeBase64: false,
        stateStorageStrategy: 'localStorage',
        onSessionUpdateCallback(updatedSession) {
          expect(updatedSession).toMatchSnapshot();
          done();
        },
      });

      tracker?.trackPageView();
    });

    it('properly calls onSessionUpdateCallback with anonymousTracking and withSessionTracking', (done) => {
      const tracker = createTracker({
        contexts: { session: true },
        encodeBase64: false,
        anonymousTracking: { withSessionTracking: true },
        onSessionUpdateCallback(updatedSession) {
          expect(updatedSession).toMatchSnapshot();
          done();
        },
      });

      tracker?.trackPageView();
    });

    it('does not call onSessionUpdateCallback with anonymousTracking', () => {
      const mockOnSessionUpdateCallback = jest.fn();
      const tracker = createTracker({
        contexts: { session: true },
        encodeBase64: false,
        anonymousTracking: true,
        onSessionUpdateCallback: mockOnSessionUpdateCallback,
      });

      tracker?.trackPageView();
      expect(mockOnSessionUpdateCallback).not.toHaveBeenCalled();
    });

    it('properly calls onSessionUpdateCallback when newSession API is called', () => {
      const mockOnSessionUpdateCallback = jest.fn();

      const tracker = createTracker({
        contexts: { session: true },
        encodeBase64: false,
        anonymousTracking: { withSessionTracking: true },
        onSessionUpdateCallback: mockOnSessionUpdateCallback,
      });

      tracker?.trackPageView();
      expect(mockOnSessionUpdateCallback).toHaveBeenCalledTimes(1);
      tracker?.newSession();
      expect(mockOnSessionUpdateCallback).toHaveBeenCalledTimes(2);
    });
  });
});
