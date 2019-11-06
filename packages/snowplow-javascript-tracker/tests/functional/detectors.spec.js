/*
 * JavaScript tracker for Snowplow: tests/functional/detectors.spec.js
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
import moment from 'moment-timezone'

describe('Detectors test', () => {
  beforeAll(() => {
    browser.url('/detectors.html')
    $('body.loaded').waitForExist()
  })

  it('Returns a value for user fingerprint', () => {
    expect($('#detectSignature').getText()).toBeTruthy()
  })

  it('Returns a value for document dimensions', () => {
    const value = $('#detectDocumentDimensions').getText()
    const [reportedWidth, reportedHeight] = value.split('x')
    expect(+reportedWidth).toBeGreaterThan(1)
    expect(+reportedHeight).toBeGreaterThan(1)
  })

  it('Retuens a value for viewport dimensions', () => {
    const value = $('#detectViewport').getText()
    const [reportedWidth, reportedHeight] = value.split('x')
    expect(+reportedWidth).toBeGreaterThan(1)
    expect(+reportedHeight).toBeGreaterThan(1)
  })

  it('Check localStorage availability', () => {
    const supportsLocalStorage = !F.isMatch( { version: '12603.3.8', browserName: 'safari' }, browser.capabilities)
    expect($('#localStorageAccessible').getText()).toBe(String(supportsLocalStorage))
  })

  it('Check sessionStorage availability', () => {
    expect($('#hasSessionStorage').getText()).toBe('true')
  })

  it('Check whether cookies are enabled', () => {
    expect($('#hasCookies').getText()).toBe('1')
  })

  it('Detect timezone', () => {
    const value = $('#detectTimezone').getText()
    expect(moment.tz.names().includes(value)).toBeTruthy()
  })

  it('Browser features', () => {
    const value = $('#detectBrowserFeatures').getText()
    const { cd } = JSON.parse(value)
    // The only feature which is the same for all tested browsers
    expect(cd).toBe(24)
  })
})
