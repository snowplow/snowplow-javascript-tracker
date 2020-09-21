/*
 * JavaScript tracker for Snowplow: tests/functional/integration.spec.js
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

import F from 'lodash/fp'
import { fetchResults, start, stop } from '../micro'

const isMatchWithCallback = F.isMatchWith((lt, rt) =>
  F.isFunction(rt) ? rt(lt) : undefined
)

describe('Activity tracking should send page pings', () => {
  let log = []
  let docker

  const logContains = ev => F.some(isMatchWithCallback(ev), log)

  beforeAll(() => {
    browser.call(() => {
      return start()
        .then((container) => {
          docker = container
        })
    })
    browser.url('/index.html')
    browser.setCookies({ name: 'container', value: docker.url })
    browser.url('/activity-tracking.html')
    browser.waitUntil(
      () => $('#init').getText() === 'true',
      5000,
      'expected init after 10s'
    )
  })

  afterAll(() => {
    browser.call(() => {
      return stop(docker.container)
    })
  })
  
  it('sends at least one ping in the expected interval', () => {
    $('#bottomRight').scrollIntoView()
    // time for activity to register and request to arrive
    browser.pause(5000)
    browser.call(() =>
      fetchResults(docker.url).then(result => {
        log = result
      })
    )

    const gtZero = F.compose(
      F.negate(F.gt(0)),
      F.toNumber
    )

    expect(
      logContains({
        event: {
            event_name: 'page_ping',
            app_id: 'ppAppId',
            pp_xoffset_max: gtZero,
            pp_yoffset_max: gtZero,
        },
      })
    ).toBe(true)
  })
})
