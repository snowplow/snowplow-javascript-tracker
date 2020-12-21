/*
 * JavaScript tracker for Snowplow: tests/unit/helpers.spec.js
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

import {
  decorateQuerystring,
  resolveDynamicContexts,
  getCssClasses,
} from '../../src/js/lib/helpers';

describe('decorateQuerystring', () => {
  it('Decorate a URL with no querystring or fragment', () => {
    const url = 'http://www.example.com'
    const expected = 'http://www.example.com?_sp=a.b'
    const actual = decorateQuerystring(url, '_sp', 'a.b')
    expect(actual).toEqual(expected)
  })

  it('Decorate a URL with a fragment but no querystring', () => {
    const url = 'http://www.example.com#fragment'
    const expected = 'http://www.example.com?_sp=a.b#fragment'
    const actual = decorateQuerystring(url, '_sp', 'a.b')
    expect(actual).toEqual(expected)
  })

  it('Decorate a URL with an empty querystring', () => {
    const url = 'http://www.example.com?'
    const expected = 'http://www.example.com?_sp=a.b'
    const actual = decorateQuerystring(url, '_sp', 'a.b')
    expect(actual).toEqual(expected)
  })

  it('Decorate a URL with a nonempty querystring', () => {
    const url = 'http://www.example.com?name=value'
    const expected = 'http://www.example.com?_sp=a.b&name=value'
    const actual = decorateQuerystring(url, '_sp', 'a.b')
    expect(actual).toEqual(expected)
  })

  it('Override an existing field', () => {
    const url = 'http://www.example.com?_sp=outdated'
    const expected = 'http://www.example.com?_sp=a.b'
    const actual = decorateQuerystring(url, '_sp', 'a.b')
    expect(actual).toEqual(expected)
  })

  it('Decorate a URL whose querystring contains multiple question marks', () => {
    const url = 'http://www.example.com?test=working?&name=value'
    const expected = 'http://www.example.com?_sp=a.b&test=working?&name=value'
    const actual = decorateQuerystring(url, '_sp', 'a.b')
    expect(actual).toEqual(expected)
  })

  it('Override a field in a querystring containing a question mark', () => {
    const url = 'http://www.example.com?test=working?&_sp=outdated'
    const expected = 'http://www.example.com?test=working?&_sp=a.b'
    const actual = decorateQuerystring(url, '_sp', 'a.b')
    expect(actual).toEqual(expected)
  })

  it('Decorate a querystring with multiple ?s and #s', () => {
    const url =
      'http://www.example.com?test=working?&_sp=outdated?&?name=value#fragment?#?#'
    const expected =
      'http://www.example.com?test=working?&_sp=a.b&?name=value#fragment?#?#'
    const actual = decorateQuerystring(url, '_sp', 'a.b')
    expect(actual).toEqual(expected)
  })
})

describe('getCssClasses', () => {
  it("Tokenize a DOM element's className field", () => {
    const element = {
      className: '   the  quick   brown_fox-jumps/over\nthe\t\tlazy   dog  ',
    }
    const expected = [
      'the',
      'quick',
      'brown_fox-jumps/over',
      'the',
      'lazy',
      'dog',
    ]
    const actual = getCssClasses(element)
    expect(actual).toEqual(expected)
  })
})

describe('resolveDynamicContexts', () => {
  it('Resolves context generators and static contexts', () => {
    const contextGenerator = () => {
      return {
        schema: 'iglu:com.acme.marketing/some_event/jsonschema/1-0-0',
        data: { test: 1 },
      }
    }
    const staticContext = {
      schema: 'iglu:com.acme.marketing/some_event/jsonschema/1-0-0',
      data: { test: 1 },
    }
    const expected = [contextGenerator(), staticContext]
    const actual = resolveDynamicContexts([contextGenerator, staticContext])
    expect(actual).toEqual(expected)
  })

  it('Resolves context generators with arguments', () => {
    const contextGenerator = (argOne, argTwo) => ({
        schema: 'iglu:com.acme.marketing/some_event/jsonschema/1-0-0',
        data: {
          firstVal: argOne,
          secondVal: argTwo,
        },
      });
    const expected = [
      {
        schema: 'iglu:com.acme.marketing/some_event/jsonschema/1-0-0',
        data: {
          firstVal: 1,
          secondVal: 2,
        },
      },
    ]
    const actual = resolveDynamicContexts([contextGenerator], 1, 2)
    expect(actual).toEqual(expected)
  })

  it('Context generators which return empty are ignored', () => {
    const contextGenerator = () => null;
    const staticContext = {
      schema: 'iglu:com.acme.marketing/some_event/jsonschema/1-0-0',
      data: { test: 1 },
    }
    const expected = [staticContext]
    const actual = resolveDynamicContexts([contextGenerator, staticContext])
    expect(actual).toEqual(expected)
  })
})
