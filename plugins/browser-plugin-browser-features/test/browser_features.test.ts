/*
 * JavaScript tracker for Snowplow: tests/functional/detectors.spec.js
 *
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright
 * 2012-2020 Snowplow Analytics Ltd. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
 *   names of their contributors may be used to endorse or promote products
 *   derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import { trackerCore } from '@snowplow/tracker-core';
import { JSDOM } from 'jsdom';
import { BrowserFeaturesPlugin } from '../src/index';

declare var jsdom: JSDOM;

describe('Browser Features plugin', () => {
  it('Returns undefined or false for unavailable mimeTypes', (done) => {
    Object.defineProperty(jsdom.window.navigator, 'mimeTypes', {
      value: {
        'application/pdf': { enabledPlugin: false },
        length: 1,
      },
      configurable: true,
    });

    const core = trackerCore(false, (payloadBuilder) => {
      const payload = payloadBuilder.build();
      expect(payload['f_pdf']).toBe('0');
      expect(payload['f_qt']).toBeUndefined();
      done();
    });

    BrowserFeaturesPlugin().coreInit?.(core);
    core.trackLinkClick('https://example.com');
  });

  it('Returns values for available mimeTypes', (done) => {
    Object.defineProperty(jsdom.window.navigator, 'mimeTypes', {
      value: {
        'application/pdf': { enabledPlugin: true },
        'video/quicktime': { enabledPlugin: true },
        'audio/x-pn-realaudio-plugin': { enabledPlugin: true },
        'application/x-mplayer2': { enabledPlugin: true },
        'application/x-director': { enabledPlugin: true },
        'application/x-shockwave-flash': { enabledPlugin: true },
        'application/x-java-vm': { enabledPlugin: true },
        'application/x-googlegears': { enabledPlugin: true },
        'application/x-silverlight': { enabledPlugin: true },
        length: 9,
      },
      configurable: true,
    });

    const core = trackerCore(false, (payloadBuilder) => {
      const payload = payloadBuilder.build();
      expect(payload['f_pdf']).toBe('1');
      expect(payload['f_qt']).toBe('1');
      expect(payload['f_realp']).toBe('1');
      expect(payload['f_wma']).toBe('1');
      expect(payload['f_dir']).toBe('1');
      expect(payload['f_fla']).toBe('1');
      expect(payload['f_java']).toBe('1');
      expect(payload['f_gears']).toBe('1');
      expect(payload['f_ag']).toBe('1');
      done();
    });

    BrowserFeaturesPlugin().coreInit?.(core);
    core.trackLinkClick('https://example.com');
  });
});
