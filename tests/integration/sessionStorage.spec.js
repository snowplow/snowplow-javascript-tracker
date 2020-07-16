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
import util from 'util'
import F from 'lodash/fp'
import { reset, fetchResults, start, stop } from '../micro'

const dumpLog = log => console.log(util.inspect(log, true, null, true))

const isMatchWithCB = F.isMatchWith((lt, rt) =>
  F.isFunction(rt) ? rt(lt) : undefined
)

describe('Test that request_recorder logs meet expectations', () => {
  if (
    F.isMatch(
      { version: '12603.3.8', browserName: 'safari' },
      browser.capabilities
    )
  ) {
    // the safari driver sauce uses for safari 10 doesnt support
    // setting cookies, so this whole suite fails
    // https://github.com/webdriverio/webdriverio/issues/2004
    fit('skipping in safari 10', () => {})
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
    browser.url('/session-integration.html')
    browser.pause(15000) // Time for requests to get written
    browser.call(() =>
      fetchResults(containerUrl).then(r => {
        log = r
        return Promise.resolve()
      })
    )
  })

  afterAll(() => {
    log = []
    browser.call(() => {
      return stop(container)
    })
  })

  it('should count sessions using cookies', () => {
    expect(
      logContains({
        event: {
          parameters: {
            e: 'pv',
            tna: 'cookieSessionTracker',
            vid: '2',
          },
        },
      })
    ).toBe(true)
  })

  it('should count sessions using local storage', () => {
    expect(
      logContains({
        event: {
          parameters: {
            e: 'pv',
            tna: 'localStorageSessionTracker',
            vid: '2',
          },
        },
      })
    ).toBe(true)
  })

  it('should count sessions using anonymousSessionTracking', () => {
    expect(
      logContains({
        event: {
          parameters: {
            e: 'pv',
            tna: 'anonymousSessionTracker',
            vid: '2',
          },
        },
      })
    ).toBe(true)
  })

  it('should only increment vid outside of session timeout (local storage)', () => {
    const withSingleVid = ev =>
      F.get('event.parameters.tna', ev) === 'localStorageSessionTracker' &&
      F.get('event.parameters.vid', ev) === '1'

    expect(F.size(F.filter(withSingleVid, log))).toBe(2)
  })

  it('should only increment vid outside of session timeout (anonymous session tracking)', () => {
    const withSingleVid = ev =>
      F.get('event.parameters.tna', ev) === 'anonymousSessionTracker' &&
      F.get('event.parameters.vid', ev) === '1'

    expect(F.size(F.filter(withSingleVid, log))).toBe(2)
  })

  it('should only increment vid outside of session timeout (cookie storage)', () => {
    const withSingleVid = ev =>
      F.get('event.parameters.tna', ev) === 'cookieSessionTracker' &&
      F.get('event.parameters.vid', ev) === '1'

    expect(F.size(F.filter(withSingleVid, log))).toBe(2)
  })
})
