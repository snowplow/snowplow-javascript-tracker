/*
 * JavaScript tracker for Snowplow: tests/functional/integration.spec.js
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

import F from 'lodash/fp'
import { reset, fetchResults, start, stop } from '../micro'

const isMatchWithCB = F.isMatchWith((lt, rt) =>
  F.isFunction(rt) ? rt(lt) : undefined
)

describe('Activity tracking should send page pings', () => {
  if (
    F.isMatch(
      { version: '12604.5.6.1.1', browserName: 'safari' },
      browser.capabilities
    )
  ) {
    fit('skipping in safari 11 (saucelabs)', () => {})
  }

  let log = []
  let container
  let containerUrl

  const logContains = ev => F.some(isMatchWithCB(ev), log)

  beforeAll(() => {
    browser.call(() => {
      return start()
        .then(e => {
          container = e
          return container.inspect()
        })
        .then(info => {
          containerUrl =
            'snowplow-js-tracker.local:' +
            F.get('NetworkSettings.Ports["9090/tcp"][0].HostPort', info)
        })
    })
    browser.url('/index.html')
    browser.setCookies({ name: 'container', value: containerUrl })
    browser.url('/activity-tracking.html')
    browser.waitUntil(
      () => $('#init').getText() === 'true',
      5000,
      'expected init after 5s'
    )
  })

  afterAll(() => {
    log = []
    browser.call(() => {
      return stop(container)
    })
  })

  it('sends at least one ping in the expected interval', () => {
    $('#bottomRight').scrollIntoView()
    // time for activity to register and request to arrive
    browser.pause(5000)
    browser.call(() =>
      fetchResults(containerUrl).then(r => {
        log = r
        return Promise.resolve()
      })
    )

    const gtZero = F.compose(
      F.negate(F.gt(0)),
      F.toNumber
    )

    expect(
      logContains({
        event: {
          parameters: {
            e: 'pp',
            aid: 'ppAppId',
            pp_max: gtZero,
            pp_may: gtZero,
          },
        },
      })
    ).toBe(true)
  })
})
