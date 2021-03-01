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

import { JSDOM } from 'jsdom';
import { fixupTitle, getHostName, getReferrer, addEventListener } from '../src/helpers';

declare var jsdom: JSDOM;

describe('Helpers', () => {
  beforeAll(() => {
    document.head.innerHTML = '<title>Helpers test page</title>';
    document.body.innerHTML = '<div><p id="click">Click here</p></div>';
  });

  it('Gets page title from document', () => {
    const title = fixupTitle({ text: '' });
    expect(title).toBe('Helpers test page');
  });

  it('Prefers page title from parameter', () => {
    const title = fixupTitle('Title param');
    expect(title).toBe('Title param');
  });

  it('Prefers page title from object parameter', () => {
    document.head.innerHTML = '';
    const title = fixupTitle({ text: 'Title param 2' });
    expect(title).toBe('Title param 2');
  });

  it('Gets host name', () => {
    const hostName = getHostName(location.href);
    expect(hostName).toBe('snowplow-js-tracker.local');
  });

  it('Gets referrer from document', () => {
    const referer = getReferrer();
    expect(referer).toBe('https://example.com/'); // From jest.config.js
  });

  it('Gets referrer from querystring', () => {
    jsdom.reconfigure({
      url: window.location.href + '?name=value&referrer=previous#fragment',
    });
    const referer = getReferrer();
    expect(referer).toBe('previous');
  });

  it('Can add an event listener', (done) => {
    const element = document.getElementById('click');
    if (element !== null) {
      addEventListener(element, 'click', function () {
        done();
      });

      var evt = new Event('click', { bubbles: false, cancelable: false, composed: false });
      element.dispatchEvent(evt);
    }
  });
});
