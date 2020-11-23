/*
 * JavaScript tracker for Snowplow: tests/integration/sessionStorage.spec.js
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
import util from 'util'
import F from 'lodash/fp'
import { fetchResults, start, stop } from '../micro'

const dumpLog = log => console.log(util.inspect(log, true, null, true))

describe('Sessions', () => {
  let log = []
  let docker

  const logContains = ev => F.some(F.isMatch(ev), log)

  beforeAll(() => {
    browser.call(() => {
      return start()
        .then((container) => {
          docker = container
        })
    })
    browser.url('/index.html')
    browser.setCookies({ name: 'container', value: docker.url })
    browser.url('/session-integration.html')
    browser.pause(5000) // Time for requests to get written
    browser.call(() =>
      fetchResults(docker.url).then(result => {
        log = result
      })
    )
  })
  
  afterAll(() => {
    browser.call(() => {
      return stop(docker.container)
    })
  })

  it('should count sessions using cookies', () => {
    expect(
      logContains({
        event: {
            event: 'page_view',
            name_tracker: 'cookieSessionTracker',
            domain_sessionidx: 2,
          }
      })
    ).toBe(true)
  })

  it('should count sessions using local storage', () => {
    expect(
      logContains({
        event: {
            event: 'page_view',
            name_tracker: 'localStorageSessionTracker',
            domain_sessionidx: 2,
          }
      })
    ).toBe(true)
  })

  it('should count sessions using anonymousSessionTracking', () => {
    expect(
      logContains({
        event: {
            event: 'page_view',
            name_tracker: 'anonymousSessionTracker',
            domain_sessionidx: 2,
          }
      })
    ).toBe(true)
  })

  it('should only increment domain_sessionidx outside of session timeout (local storage)', () => {
    const withSingleVid = ev =>
      F.get('event.name_tracker', ev) === 'localStorageSessionTracker' &&
      F.get('event.domain_sessionidx', ev) === 1

    expect(F.size(F.filter(withSingleVid, log))).toBe(2)
  })

  it('should only increment domain_sessionidx outside of session timeout (anonymous session tracking)', () => {
    const withSingleVid = ev =>
      F.get('event.name_tracker', ev) === 'anonymousSessionTracker' &&
      F.get('event.domain_sessionidx', ev) === 1

    expect(F.size(F.filter(withSingleVid, log))).toBe(2)
  })

  it('should only increment domain_sessionidx outside of session timeout (cookie storage)', () => {
    const withSingleVid = ev => 
      F.get('event.name_tracker', ev) === 'cookieSessionTracker' &&
      F.get('event.domain_sessionidx', ev) === 1

    expect(F.size(F.filter(withSingleVid, log))).toBe(2)
  })
})
