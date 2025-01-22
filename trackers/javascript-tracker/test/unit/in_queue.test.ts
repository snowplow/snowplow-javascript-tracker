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

import { InQueueManager } from '../../src/in_queue';

import {
  enableActivityTracking,
  setVisitorCookieTimeout,
  trackPageView,
  updatePageActivity,
  setUserId,
} from '@snowplow/browser-tracker';
import { BrowserTracker, addTracker, isFunction, getTrackers } from '@snowplow/browser-tracker-core';

jest.mock('@snowplow/browser-tracker');
jest.mock('@snowplow/browser-tracker-core');
const mockNewTracker = addTracker as jest.Mock<BrowserTracker>;
const mockGetTrackers = getTrackers as jest.Mock<Array<BrowserTracker>>;
const mockEnableActivityTracking = enableActivityTracking as jest.Mock<void>;
const mockSetVisitorCookieTimeout = setVisitorCookieTimeout as jest.Mock<void>;
const mockTrackPageView = trackPageView as jest.Mock<void>;
const mockUpdatePageActivity = updatePageActivity as jest.Mock<void>;
const mockSetUserId = setUserId as jest.Mock<void>;
const mockIsFunction = isFunction as jest.Mock<boolean>;

describe('InQueueManager', () => {
  let output = 0;
  let userId: string | null | undefined;

  const newTracker = (trackerId: string): any => {
    let attribute = 10;
    return {
      id: trackerId,
      enableActivityTracking: function ({ n }: { n: number }) {
        attribute += n;
      },
      setVisitorCookieTimeout: function ({ p }: { p: number }) {
        attribute = p;
      },
      setUserId: function (s?: string | null) {
        userId = s;
      },
      trackPageView: function () {
        output = attribute;
      },
      updatePageActivity: function () {
        output += attribute;
      },
    };
  };

  const mockTrackers: Record<string, any> = {};
  mockNewTracker.mockImplementation((name: string) => {
    mockTrackers[name] = newTracker(name);
    return mockTrackers[name];
  });

  mockGetTrackers.mockImplementation((_: Array<string>) => {
    return Object.values(mockTrackers);
  });

  mockEnableActivityTracking.mockImplementation(function (event: { n: number }, trackers: string[]) {
    trackers.forEach((t) => {
      mockTrackers[t].enableActivityTracking(event);
    });
  });

  mockSetVisitorCookieTimeout.mockImplementation(function (event: { p: number }, trackers: string[]) {
    trackers.forEach((t) => {
      mockTrackers[t].setVisitorCookieTimeout(event);
    });
  });

  mockTrackPageView.mockImplementation(function (trackers: string[]) {
    trackers.forEach((t) => {
      mockTrackers[t].trackPageView();
    });
  });

  mockUpdatePageActivity.mockImplementation(function (trackers: string[]) {
    trackers.forEach((t) => {
      mockTrackers[t].updatePageActivity();
    });
  });

  mockSetUserId.mockImplementation(function (userId: string | null | undefined, trackers: string[]) {
    trackers.forEach((t) => {
      mockTrackers[t].setUserId(userId);
    });
  });

  mockIsFunction.mockImplementation(function (func: any) {
    if (func && typeof func === 'function') {
      return true;
    }
    return false;
  });

  const asyncQueueOps = [
    ['newTracker', 'firstTracker', 'firstEndpoint'],
    ['enableActivityTracking', { n: 5 }],
    ['trackPageView'],
  ];
  const asyncQueue = InQueueManager('snowplow', asyncQueueOps);

  it('Make a proxy, Function originally stored in asyncQueue is executed when asyncQueue becomes an AsyncQueueProxy', () => {
    expect(output).toEqual(15);
  });

  it('Add to asyncQueue after conversion, Function added to asyncQueue after it becomes an AsyncQueueProxy is executed', () => {
    asyncQueue.push(['setVisitorCookieTimeout', { p: 7 }]);
    asyncQueue.push(['trackPageView']);
    expect(output).toEqual(7);
  });

  it('Set UserId to String, null and undefined', () => {
    asyncQueue.push(['setUserId', 'snow123']);
    expect(userId).toEqual('snow123');

    asyncQueue.push(['setUserId', null]);
    expect(userId).toEqual(null);

    asyncQueue.push(['setUserId', undefined]);
    expect(userId).toEqual(undefined);
  });

  it("Backward compatibility: Create a tracker using the legacy setCollectorUrl method, A second tracker is created and both trackers' attributes are added to output", () => {
    asyncQueue.push(['newTracker', 'secondTracker', 'secondEndpoint']);
    asyncQueue.push(['updatePageActivity']);
    expect(output).toEqual(24);
  });

  it("Use 'function:tracker1;tracker2' syntax to control which trackers execute which functions, Set the attributes of the two trackers individually, then add both to output", () => {
    asyncQueue.push(['setVisitorCookieTimeout:firstTracker', { p: 2 }]);
    asyncQueue.push(['setVisitorCookieTimeout:secondTracker', { p: 3 }]);
    asyncQueue.push(['updatePageActivity:firstTracker;secondTracker']);
    expect(output).toEqual(29);
  });
});

describe('Snowplow callback', () => {
  const asyncQueue = InQueueManager('callback', []);
  const mockTrackers: Record<string, any> = {};

  let userId: string | null | undefined;

  const newTracker = (trackerId: string): any => {
    return {
      id: trackerId,
      setUserId: function (s?: string | null) {
        userId = s;
      },
      getUserId: function () {
        return userId;
      },
    };
  };

  beforeEach(() => {
    const tracker = newTracker('sp1');
    mockTrackers.sp1 = tracker;
  });

  afterEach(() => {
    delete mockTrackers.sp1;
  });

  it('Execute a user-defined custom callback', () => {
    let callbackExecuted = false;
    asyncQueue.push([
      function () {
        callbackExecuted = true;
      },
    ]);
    expect(callbackExecuted).toBe(true);
  });

  it('Executing a custom callback that errors should not throw', () => {
    expect(() => {
      asyncQueue.push([
        function () {
          throw 'caught error';
        },
      ]);
    }).not.toThrow();
  });

  it('A custom callback with arguments provided will pass those arguments into the callback parameters', () => {
    asyncQueue.push([
      function (a: number, b: number) {
        expect(a).toEqual(1);
        expect(b).toEqual(2);
      },
      1,
      2,
    ]);
  });

  it('The callback will be passed the tracker dictionary as the argument if there is only one parameter', () => {
    asyncQueue.push([
      function (trackers: Record<string, any>) {
        const tracker = trackers.sp1;
        expect(tracker).toEqual(mockTrackers.callback_sp1);
      },
    ]);
  });

  it('The callback can access the tracker dictionary using both `this` and  the last argument, along with arguments', () => {
    asyncQueue.push([
      function (this: any, a: number, b: number, trackers: Record<string, any>) {
        expect(this.sp1).toEqual(mockTrackers.callback_sp1);
        expect(a).toEqual(1);
        expect(b).toEqual(2);
        expect(trackers.sp1).toEqual(mockTrackers.callback_sp1);
      },
      1,
      2,
    ]);
  });
});
