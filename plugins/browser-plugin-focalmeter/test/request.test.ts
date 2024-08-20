/*
 * Copyright (c) 2023 Snowplow Analytics Ltd, 2010 Anthon Pang
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
import { enableFocalMeterIntegration, FocalMeterPlugin } from '../src';

describe('FocalmeterPlugin', () => {
  // Mock XHR network requests
  let xhrMock: Partial<XMLHttpRequest>;
  let xhrOpenMock: jest.Mock;
  let queuedStateChangeCallbacks: any[] = [];
  let domain = 'https://kantar.com';

  beforeEach(() => {
    xhrOpenMock = jest.fn();
    xhrMock = {
      open: xhrOpenMock,
      send: jest.fn(),
      setRequestHeader: jest.fn(),
      withCredentials: true,
      status: 200,
      response: '',
      readyState: 4,
    };

    Object.defineProperty(xhrMock, 'onreadystatechange', {
      set: (val) => {
        queuedStateChangeCallbacks.push(val);
      },
    });

    jest.spyOn(window, 'XMLHttpRequest').mockImplementation(() => xhrMock as XMLHttpRequest);
  });

  it('makes a request to Kantar endpoint with user ID', async () => {
    const tracker = createTrackerWithPlugin();
    enableFocalMeterIntegration({ kantarEndpoint: domain });

    tracker?.trackPageView();
    const userId = tracker?.getDomainUserId();

    await checkMock(() => {
      expect(xhrOpenMock).toHaveBeenCalledTimes(1);
      expect(xhrOpenMock).toHaveBeenLastCalledWith('GET', `${domain}?vendor=snowplow&cs_fpid=${userId}&c12=not_set`);
    });
  });

  it('makes a request to Kantar endpoint with processed user ID', async () => {
    const tracker = createTrackerWithPlugin();
    enableFocalMeterIntegration({ kantarEndpoint: domain, processUserId: (userId) => userId + '-processed' });

    tracker?.trackPageView();
    const userId = tracker?.getDomainUserId();

    await checkMock(() => {
      expect(xhrOpenMock).toHaveBeenCalledTimes(1);
      expect(xhrOpenMock).toHaveBeenLastCalledWith('GET', `${domain}?vendor=snowplow&cs_fpid=${userId}-processed&c12=not_set`);
    });
  });

  it('makes a request to Kantar endpoint when user ID changes', async () => {
    const tracker = createTrackerWithPlugin();
    enableFocalMeterIntegration({ kantarEndpoint: domain });

    // Doesn't make a request if anonymous tracking
    tracker?.enableAnonymousTracking();
    tracker?.trackPageView();
    await checkMock(() => {
      expect(xhrOpenMock).toHaveBeenCalledTimes(0);
    });

    // Makes a request when disabling anonymous tracking
    tracker?.disableAnonymousTracking();
    tracker?.trackPageView();
    const userId = tracker?.getDomainUserId();
    await checkMock(() => {
      expect(xhrOpenMock).toHaveBeenCalledTimes(1);
      expect(xhrOpenMock).toHaveBeenLastCalledWith('GET', `${domain}?vendor=snowplow&cs_fpid=${userId}&c12=not_set`);
    });

    // Doesn't make another request since user ID didn't change
    tracker?.trackPageView();
    await checkMock(() => {
      expect(xhrOpenMock).toHaveBeenCalledTimes(0);
    });
  });

  it('can work with multiple trackers', async () => {
    const tracker1 = createTrackerWithPlugin();
    const tracker2 = createTrackerWithPlugin();

    enableFocalMeterIntegration(
      {
        kantarEndpoint: domain,
      },
      [tracker1!.namespace, tracker2!.namespace]
    );

    // Makes requests for both trackers
    tracker1?.trackPageView();
    await checkMock(() => expect(xhrOpenMock).toHaveBeenCalledTimes(1));
    tracker2?.trackPageView();
    await checkMock(() => expect(xhrOpenMock).toHaveBeenCalledTimes(1));

    // Doesn't make any more requests for the trackers
    tracker1?.trackPageView();
    await checkMock(() => expect(xhrOpenMock).toHaveBeenCalledTimes(0));
    tracker2?.trackPageView();
    await checkMock(() => expect(xhrOpenMock).toHaveBeenCalledTimes(0));
  });

  function createTrackerWithPlugin(id: string | undefined = undefined) {
    const state = new SharedState();
    id ??= 'sp-' + Math.random();

    return addTracker(id, id, 'js-3.0.0', '', state, {
      stateStorageStrategy: 'cookie',
      encodeBase64: false,
      plugins: [FocalMeterPlugin()],
      customFetch: async () => new Response(null, { status: 200 }),
    });
  }

  function checkMock(callback: () => void) {
    return new Promise((resolve) => {
      setTimeout(() => {
        callback();
        queuedStateChangeCallbacks.forEach((callback) => callback());
        queuedStateChangeCallbacks = [];
        xhrOpenMock.mockReset();
        resolve(true);
      }, 100);
    });
  }
});
