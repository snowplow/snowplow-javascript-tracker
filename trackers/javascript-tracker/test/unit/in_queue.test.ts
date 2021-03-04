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

import { InQueueManager } from '../../src/in_queue';

import {
  enableActivityTracking,
  setVisitorCookieTimeout,
  trackPageView,
  updatePageActivity,
} from '@snowplow/browser-tracker';
import { BrowserTracker, addTracker, isFunction } from '@snowplow/browser-tracker-core';

jest.mock('@snowplow/browser-tracker');
jest.mock('@snowplow/browser-tracker-core');
const mockNewTracker = addTracker as jest.Mock<BrowserTracker>;
const mockEnableActivityTracking = enableActivityTracking as jest.Mock<void>;
const mockSetVisitorCookieTimeout = setVisitorCookieTimeout as jest.Mock<void>;
const mockTrackPageView = trackPageView as jest.Mock<void>;
const mockUpdatePageActivity = updatePageActivity as jest.Mock<void>;
const mockIsFunction = isFunction as jest.Mock<boolean>;

describe('InQueueManager', () => {
  let output = 0;
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
      trackPageView: function () {
        output = attribute;
      },
      updatePageActivity: function () {
        output += attribute;
      },
    };
  };

  const mockTracker: Record<string, any> = {};
  mockNewTracker.mockImplementation((name: string) => {
    mockTracker[name] = newTracker(name);
    return mockTracker[name];
  });

  mockEnableActivityTracking.mockImplementation(function (event: { n: number }, trackers: string[]) {
    trackers.forEach((t) => {
      mockTracker[t].enableActivityTracking(event);
    });
  });

  mockSetVisitorCookieTimeout.mockImplementation(function (event: { p: number }, trackers: string[]) {
    trackers.forEach((t) => {
      mockTracker[t].setVisitorCookieTimeout(event);
    });
  });

  mockTrackPageView.mockImplementation(function (trackers: string[]) {
    trackers.forEach((t) => {
      mockTracker[t].trackPageView();
    });
  });

  mockUpdatePageActivity.mockImplementation(function (trackers: string[]) {
    trackers.forEach((t) => {
      mockTracker[t].updatePageActivity();
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
});
