/*
 * JavaScript tracker for Snowplow: tests/unit/proxies.spec.js
 *
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright
 * 2012-2016 Snowplow Analytics Ltd. All rights reserved.
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

import { fixupUrl } from '../../src/js/lib/proxies';

describe('Proxies', () => {
  beforeAll(() => {
    document.body.innerHTML =
      '<div><div><div><div><div><div>You have reached the cached page for</div></div></div></div></div></div><a href="http://www.example.com/">'
  })

  it('Host name is not a special case, Except in special cases, fixupUrl changes nothing', () => {
    const initialLocationArray = [
      'normalhostname',
      'href',
      'http://referrer.com',
    ]
    const fixedupLocationArray = fixupUrl.apply(null, initialLocationArray)
    const expectedLocationArray = fixedupLocationArray

    for (let i = 0; i < 3; i++) {
      expect(fixedupLocationArray[i]).toEqual(expectedLocationArray[i])
    }
  })

  it("Host name = 'translate.googleusercontent.com', Get the URL for the untranslated page from the querystring and make the translated page the referrer", () => {
    const initialLocationArray = [
      'translate.googleusercontent.com',
      'http://translate.googleusercontent.com/translate?hl=en&sl=fr&u=http:www.francais.fr/path',
      '',
    ]
    const fixedupLocationArray = fixupUrl.apply(null, initialLocationArray)
    const expectedLocationArray = [
      'www.francais.fr',
      'http:www.francais.fr/path',
      'http://translate.googleusercontent.com/translate?hl=en&sl=fr&u=http:www.francais.fr/path',
    ]

    for (let i = 0; i < 3; i++) {
      expect(fixedupLocationArray[i]).toEqual(expectedLocationArray[i])
    }
  })

  it("Host name = 'ccj.bingj.com', On a page cached by Bing, get the original URL from the first link", () => {
    const initialLocationArray = [
      'cc.bingj.com',
      'http://cc.bingj.com/cache.aspx?q=example.com&d=4870936571937837&mkt=en-GB&setlang=en-GB&w=QyOPD1fo3C2nC9sXMLmUUs81Jt78MYIp',
      'http://referrer.com',
    ]
    const fixedupLocationArray = fixupUrl.apply(null, initialLocationArray)
    const expectedLocationArray = [
      'www.example.com',
      'http://www.example.com/',
      'http://referrer.com',
    ]

    for (let i = 0; i < 3; i++) {
      expect(fixedupLocationArray[i]).toEqual(expectedLocationArray[i])
    }
  })

  it("Host name = 'webcache.googleusercontent.com', On a page cached by Google, get the original URL from the first link", () => {
    const initialLocationArray = [
      'webcache.googleusercontent.com',
      'http://webcache.googleusercontent.com/search?q=cache:http://example.com/#fragment',
      'http://referrer.com',
    ]
    const fixedupLocationArray = fixupUrl.apply(null, initialLocationArray)
    const expectedLocationArray = [
      'www.example.com',
      'http://www.example.com/',
      'http://referrer.com',
    ]

    for (let i = 0; i < 3; i++) {
      expect(fixedupLocationArray[i]).toEqual(expectedLocationArray[i])
    }
  })

  it('Host name is an IP address, On a page cached by Yahoo, get the original URL from the first link', () => {
    const initialLocationArray = [
      '98.139.21.31',
      'http://98.139.21.31/search/srpcache',
      'http://referrer.com',
    ]
    const fixedupLocationArray = fixupUrl.apply(null, initialLocationArray)
    const expectedLocationArray = [
      'www.example.com',
      'http://www.example.com/',
      'http://referrer.com',
    ]

    for (let i = 0; i < 3; i++) {
      expect(fixedupLocationArray[i]).toEqual(expectedLocationArray[i])
    }
  })
})
