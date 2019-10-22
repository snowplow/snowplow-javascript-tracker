/*
 * JavaScript tracker for Snowplow: tests/functional/helpers.spec.js
 *
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright
 * 2012-2014 Snowplow Analytics Ltd. All rights reserved.
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
import F from 'lodash/fp'

describe('Helpers test', () => {
  // I think failure on click handlers are related to the following, skipping on effected browser/os combo
  // https://support.saucelabs.com/hc/en-us/articles/115003957233-Safari-11-with-Selenium-3-x-not-Handling-Click-Events-on-Option-Elements
  if (
    F.isMatch(
      { browserVersion: '13.0.1', 'safari:platformVersion': '10.13.6' },
      browser.capabilities
    )
  ) {
    fit('skipping in safari 13 on osx 10.13 (webdriver issue)', () => {})
  }

  it('Gets page title', () => {
    browser.url('/helpers.html')
    $('body.loaded').waitForExist()
    const value = $('#title').getText()
    expect(value).toBe('Helpers test page')
  })

  it('Gets host name', () => {
    browser.url('/helpers.html')
    $('body.loaded').waitForExist()
    const value = $('#hostname').getText()
    expect(value).toBe('snowplow-js-tracker.local')
  })

  it('Gets referrer from querystring', () => {
    browser.url('/helpers.html' + '?name=value&referrer=previous#fragment')
    $('body.loaded').waitForExist()
    const value = $('#referrer').getText()
    expect(value).toBe('previous')
  })

  it('Can add an even listener', () => {
    browser.url('/helpers.html')
    $('body.loaded').waitForExist()
    $('#click').click()
    const value = $('#click').getText()
    expect(value).toBe('clicked')
  })
})
