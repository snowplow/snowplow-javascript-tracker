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

import { buildLinkClick, trackerCore } from '@snowplow/tracker-core';
import { JSDOM } from 'jsdom';
import { PerformanceTimingPlugin } from '../src';

declare var jsdom: JSDOM;

describe('Performance Timing plugin', () => {
  it('Returns values for Performance Timing properties', (done) => {
    Object.defineProperty(jsdom.window.performance, 'timing', {
      value: {
        navigationStart: 1,
        redirectStart: 2,
        redirectEnd: 3,
        fetchStart: 4,
        domainLookupStart: 5,
        domainLookupEnd: 6,
        connectStart: 7,
        secureConnectionStart: 8,
        connectEnd: 9,
        requestStart: 10,
        responseStart: 11,
        responseEnd: 12,
        unloadEventStart: 13,
        unloadEventEnd: 14,
        domLoading: 15,
        domInteractive: 16,
        domContentLoadedEventStart: 17,
        domContentLoadedEventEnd: 18,
        domComplete: 19,
        loadEventStart: 20,
        loadEventEnd: 21,
        msFirstPaint: 22,
        chromeFirstPaint: 23,
        requestEnd: 24,
        proxyStart: 25,
        proxyEnd: 26,
      },
      configurable: true,
    });

    const core = trackerCore({
      corePlugins: [PerformanceTimingPlugin()],
      callback: (payloadBuilder) => {
        const json = payloadBuilder.getJson().filter((e) => e.keyIfEncoded === 'cx');
        expect(json[0].json).toMatchObject({
          data: [
            {
              schema: 'iglu:org.w3/PerformanceTiming/jsonschema/1-0-0',
              data: {
                navigationStart: 1,
                redirectStart: 2,
                redirectEnd: 3,
                fetchStart: 4,
                domainLookupStart: 5,
                domainLookupEnd: 6,
                connectStart: 7,
                secureConnectionStart: 8,
                connectEnd: 9,
                requestStart: 10,
                responseStart: 11,
                responseEnd: 12,
                unloadEventStart: 13,
                unloadEventEnd: 14,
                domLoading: 15,
                domInteractive: 16,
                domContentLoadedEventStart: 17,
                domContentLoadedEventEnd: 18,
                domComplete: 19,
                loadEventStart: 20,
                loadEventEnd: 21,
                msFirstPaint: 22,
                chromeFirstPaint: 23,
                requestEnd: 24,
                proxyStart: 25,
                proxyEnd: 26,
              },
            },
          ],
        });
        done();
      },
    });

    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });
});
