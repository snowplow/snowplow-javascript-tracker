/*
 * JavaScript tracker for Snowplow: tests/functional/activityCallback.spec.js
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

describe('Activity tracking with callbacks', () => {
  if (
    F.isMatch(
      { version: '12604.5.6.1.1', browserName: 'safari' },
      browser.capabilities
    )
  ) {
    fit('skipping in safari 11 (saucelabs)', () => {})
  }

  it('reports events on scroll', () => {
    browser.url('/activity-callback.html?test1')
    browser.waitUntil(
      () => $('#init').getText() === 'true',
      5000,
      'expected init after 5s'
    )

    $('#bottomRight').scrollIntoView()

    browser.waitUntil(
      () => +$('#numEvents').getText() >= 1,
      10000,
      'expected >= 1 event after 10s'
    )
    const [maxX, maxY] = browser.execute(() => {
      return [findMaxX(), findMaxY()]
    })

    expect(maxX).toBeGreaterThan(100)
    expect(maxY).toBeGreaterThan(100)
  })

  it('carries pageviewid change through and resets scroll', () => {
    browser.url('/activity-callback.html?test2')
    browser.waitUntil(
      () => $('#init').getText() === 'true',
      5000,
      'expected init after 5s'
    )

    const firstPageViewId = browser.execute(() => {
      var pid
      getCurrentPageViewId(function(id) {
        pid = id
      })
      return pid
    })

    $('#bottomRight').scrollIntoView()
    $('#middle').scrollIntoView()
    browser.waitUntil(
      () => +$('#numEvents').getText() >= 1,
      10000,
      'expected >= 1 event after 10s'
    )

    browser.execute(() => {
      trackPageView()
    })
    $('#bottomRight').scrollIntoView()

    browser.waitUntil(
      () => +$('#numEvents').getText() > 1,
      10000,
      'expected > 1 event after 10s'
    )

    const secondPageViewId = browser.execute(() => {
      var pid
      getCurrentPageViewId(function(id) {
        pid = id
      })
      return pid
    })

    // sanity check
    expect(firstPageViewId).not.toEqual(secondPageViewId)

    const first = browser.execute(id => {
      return findLastEventForPageViewId(id)
    }, firstPageViewId)
    const second = browser.execute(id => {
      return findLastEventForPageViewId(id)
    }, secondPageViewId)

    const getMinXY = F.at(['minXOffset', 'minYOffset'])

    // the first page view starts at 0,0
    expect(getMinXY(first)).toEqual([0, 0])

    // but the second starts at #bottomRight and only moves as far as #middle
    // so there is no way it can get to 0,0
    const [secondX, secondY] = getMinXY(second)
    expect(secondX).toBeGreaterThan(0)
    expect(secondY).toBeGreaterThan(0)
  })
})
