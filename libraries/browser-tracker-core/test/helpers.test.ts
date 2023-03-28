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

import {
  cookie,
  decorateQuerystring,
  deleteCookie,
  findRootDomain,
  getCookiesWithPrefix,
  getCssClasses,
} from '../src/helpers';

describe('decorateQuerystring', () => {
  it('Decorate a URL with no querystring or fragment', () => {
    const url = 'http://www.example.com';
    const expected = 'http://www.example.com?_sp=a.b';
    const actual = decorateQuerystring(url, '_sp', 'a.b');
    expect(actual).toEqual(expected);
  });

  it('Decorate a URL with a fragment but no querystring', () => {
    const url = 'http://www.example.com#fragment';
    const expected = 'http://www.example.com?_sp=a.b#fragment';
    const actual = decorateQuerystring(url, '_sp', 'a.b');
    expect(actual).toEqual(expected);
  });

  it('Decorate a URL with an empty querystring', () => {
    const url = 'http://www.example.com?';
    const expected = 'http://www.example.com?_sp=a.b';
    const actual = decorateQuerystring(url, '_sp', 'a.b');
    expect(actual).toEqual(expected);
  });

  it('Decorate a URL with a nonempty querystring', () => {
    const url = 'http://www.example.com?name=value';
    const expected = 'http://www.example.com?_sp=a.b&name=value';
    const actual = decorateQuerystring(url, '_sp', 'a.b');
    expect(actual).toEqual(expected);
  });

  it('Override an existing field', () => {
    const url = 'http://www.example.com?_sp=outdated';
    const expected = 'http://www.example.com?_sp=a.b';
    const actual = decorateQuerystring(url, '_sp', 'a.b');
    expect(actual).toEqual(expected);
  });

  it('Decorate a URL whose querystring contains multiple question marks', () => {
    const url = 'http://www.example.com?test=working?&name=value';
    const expected = 'http://www.example.com?_sp=a.b&test=working?&name=value';
    const actual = decorateQuerystring(url, '_sp', 'a.b');
    expect(actual).toEqual(expected);
  });

  it('Override a field in a querystring containing a question mark', () => {
    const url = 'http://www.example.com?test=working?&_sp=outdated';
    const expected = 'http://www.example.com?test=working?&_sp=a.b';
    const actual = decorateQuerystring(url, '_sp', 'a.b');
    expect(actual).toEqual(expected);
  });

  it('Decorate a querystring with multiple ?s and #s', () => {
    const url = 'http://www.example.com?test=working?&_sp=outdated?&?name=value#fragment?#?#';
    const expected = 'http://www.example.com?test=working?&_sp=a.b&?name=value#fragment?#?#';
    const actual = decorateQuerystring(url, '_sp', 'a.b');
    expect(actual).toEqual(expected);
  });
});

describe('getCssClasses', () => {
  it("Tokenize a DOM element's className field", () => {
    const element = {
      className: '   the  quick   brown_fox-jumps/over\nthe\t\tlazy   dog  ',
    } as Element;
    const expected = ['the', 'quick', 'brown_fox-jumps/over', 'the', 'lazy', 'dog'];
    const actual = getCssClasses(element);
    expect(actual).toEqual(expected);
  });
});

describe('cookie helpers', () => {
  let cookieJar: string;

  beforeAll(() => {
    cookieJar = '';
    jest.spyOn(document, 'cookie', 'set').mockImplementation((cookieValue) => {
      // disallow TLD('com') cookie domains
      const isRootCookie = cookieValue.match(/Domain=([^.]+?);/);
      if (isRootCookie) {
        return;
      }

      const cookies = cookieJar.split(' ');
      const cookieName = cookieValue.split('=').shift();
      //@ts-ignore
      const cookieNameLength = cookieName.length;
      let cookieIndex = -1;
      cookies.forEach((value, index) => {
        if (`${value.substr(0, cookieNameLength)}=` === `${cookieName}=`) {
          cookieIndex = index;
        }
      });
      if (cookieIndex > -1) {
        cookies[cookieIndex] = `${cookieValue};`;
      } else {
        cookies.push(`${cookieValue};`);
      }
      cookieJar = cookies.join(' ').slice(0, -1).trim();
    });
    jest.spyOn(document, 'cookie', 'get').mockImplementation(() => cookieJar);
  });

  afterEach(() => {
    cookieJar = '';
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('getCookiesWithPrefix', () => {
    // Random cookie value from a snowplow initialization
    const gaCookie = '_ga=GA1.2.XXX.YYY';
    const spIdCookie =
      '_sp_id.83fc=e8be487a-01f2-4355-9f54-a0b0a9eb25a4.1673957921.1.1673959786..65134acc-3374-4efb-bf6f-dc891e804248..df52bd6b-14d5-475e-977a-082f27ff54a0.1673957921210.38';
    document.cookie = `${gaCookie}; ${spIdCookie}`;
    const snowplowPrefixedCookies = getCookiesWithPrefix('_sp');
    expect(snowplowPrefixedCookies).toEqual(expect.not.arrayContaining([gaCookie]));
    expect(snowplowPrefixedCookies).toEqual(expect.arrayContaining([spIdCookie]));
  });

  it('reads cookie using cookie with single argument', () => {
    const gaCookie = '_ga=GA1.2.XXX.YYY';
    document.cookie = `${gaCookie}`;
    expect(cookie('_ga')).toEqual('GA1.2.XXX.YYY');
  });

  it('sets cookie using cookie with multiple arguments', () => {
    expect(document.cookie).toEqual('');
    cookie('_ga', 'GA1.2.XXX.YYY');
    expect(document.cookie).toEqual('_ga=GA1.2.XXX.YYY');
  });

  it('deleteCookie', () => {
    const gaCookie = '_ga=GA1.2.XXX.YYY';
    document.cookie = `${gaCookie}`;
    deleteCookie('_ga');
    // Value is deleted
    expect(document.cookie).toMatch('_ga=;');
  });

  describe('findRootDomain', () => {
    let location: Location;

    beforeAll(() => {
      location = window.location;
    });

    afterEach(() => {
      window.location = location;
    });

    it('findRootDomain https://www.example.com', () => {
      const url = 'https://www.example.com';
      const mockLocation = new URL(url);
      // @ts-expect-error
      delete window.location;
      // @ts-expect-error
      window.location = mockLocation;

      const domain = findRootDomain('Strict', true);
      expect(domain).toEqual('example.com');

      window.location = location;
    });

    it('findRootDomain https://sub.example.com', () => {
      const url = 'https://sub.example.com';
      const mockLocation = new URL(url);
      // @ts-expect-error
      delete window.location;
      // @ts-expect-error
      window.location = mockLocation;

      const domain = findRootDomain('Strict', true);
      expect(domain).toEqual('example.com');

      window.location = location;
    });
  });
});
