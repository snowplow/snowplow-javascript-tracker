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
import util from 'util'
import F from 'lodash/fp'
import { fetchResults, start, stop } from '../micro'

const dumpLog = log => console.log(util.inspect(log, true, null, true))

const retrieveSchemaData = schema =>
	F.compose(
		F.get('data'),
		F.find({ schema }),
		F.get('data')
	)

const mobileContext = {
  schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
  data: {
    osType: 'ubuntu',
  },
}

const geoContext = {
  schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
  data: {
    latitude: 40.0,
    longitude: 55.1,
  },
}

describe('Test that request_recorder logs meet expectations', () => {
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
    if (browser.setNetworkConditions) {
      browser.setNetworkConditions({}, 'Regular 2G') 
    }
    browser.url('/integration.html')
    browser.pause(7500) // Time for requests to get written
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

  it('Check existence of page view', () => {
    expect(
      logContains({
        event: {
          event: 'page_view',
          platform: 'mob',
          app_id: 'CFe23a',
          user_id: 'Malcolm',
          page_title: 'Integration test page',
        },
      })
    ).toBe(true)
  })

  it('Check existence of page view with custom context in log', () => {
    const expected = {
      event: {
        event: 'page_view',
        platform: 'mob',
        app_id: 'CFe23a',
        user_id: 'Malcolm',
        page_title: 'My Title',
        contexts: {
          data: [{
            schema: 'iglu:org.schema/WebPage/jsonschema/1-0-0',
            data: { keywords: ['tester'] }
          }]
        }
      }
    }

    expect(logContains(expected)).toBe(true)
  })

  it('Check nonexistence of nonexistent event types in log', () => {
    expect(
      logContains({
        event: 'ad',
      })
    ).toBe(false)
  })

  it('Check a structured event was sent', () => {
    expect(
      logContains({
        event: {
          event: 'struct',
          se_category: 'Mixes',
          se_action: 'Play',
          se_label: 'MRC/fabric-0503-mix',
          se_value: 0.0,
        },
      })
    ).toBe(true)
  })

  it('Check an unstructured event with true timestamp was sent', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          unstruct_event: {
            data: {
              data: { bannerId: 'ASO01043' }
            }
          },
          true_tstamp: '1970-01-18T02:23:21.868Z',
        },
      })
    ).toBe(true)
  })

  // it('Check a transaction event was sent', () => {
  //   expect(
  //     logContains({
  //       event: {
  //           e: 'tr',
  //           tr_id: 'order-123',
  //           tr_af: 'acme',
  //           tr_tt: '8000',
  //           tr_tx: '100',
  //           tr_ci: 'phoenix',
  //           tr_st: 'arizona',
  //           tr_co: 'USA',
  //           tr_cu: 'JPY',
  //       },
  //     })
  //   ).toBe(true)
  // })

  // it('Check a transaction item event was sent', () => {
  //   expect(
  //     logContains({
  //       event: {
  //         e: 'ti',
  //         ti_id: 'order-123',
  //         ti_sk: '1001',
  //         ti_nm: 'Blue t-shirt',
  //         ti_ca: 'clothing',
  //         ti_pr: '2000',
  //         ti_qu: '2',
  //         ti_cu: 'JPY',
  //       },
  //     })
  //   ).toBe(true)
  // })

  it('Check an unhandled exception was sent', () => {
    expect(
      logContains({
        event: {
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1'
            }
          }
        }
      })
    ).toBe(true)
  })

  it('Check pageViewId is regenerated for each trackPageView', () => {
    const pageViews = F.filter(
      ev =>
        F.get('event.event', ev) === 'page_view' &&
        F.get('event.name_tracker', ev) === 'cf',
      log
    )

    const getWebPageId = F.compose(
      F.get('id'),
      retrieveSchemaData(
        'iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0'
      ),
      F.get('event.contexts')
    )

    expect(F.size(F.groupBy(getWebPageId, pageViews))).toBeGreaterThanOrEqual(2)
  })

  it('Check a GDPR context', () => {
    expect(
      logContains({
        event: {
          contexts: {
            data: [{
              schema: 'iglu:com.snowplowanalytics.snowplow/gdpr/jsonschema/1-0-0',
              data: {
                basisForProcessing: 'consent',
                documentId: 'someId',
                documentVersion: '0.1.0',
                documentDescription: 'this document is a test',
              }
            }]
          }
        }
      })
    ).toBe(true)
  })

  it('Check that all events have a GDPR context attached', () => {
    const withoutGdprContext = F.compose(
      F.negate(
        F.includes('iglu:com.snowplowanalytics.snowplow/gdpr/jsonschema/1-0-0')
      ),
      F.get('contexts')
    )

    const fromCfTracker = F.compose(
      F.eq('cf'),
      F.get('event.name_tracker')
    )

    const numberWithoutGdpr = F.size(
      F.filter(ev => withoutGdprContext(ev) && fromCfTracker(ev), log)
    )

    expect(numberWithoutGdpr).toBe(0)
  })

  it('Check global contexts are for structured events', () => {
    expect(
      logContains({
        event: {
          event: 'struct',
          contexts: {
            data: [geoContext, mobileContext]
          },
        },
      })
    ).toBe(true)
  })

  it('Check an unstructured event with global context from accept ruleset', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
              data: {
                bannerId: 'ASO01042',
              },
            }
          },
          contexts: {
            data: [geoContext, mobileContext]
          },
        },
      })
    ).toBe(true)
  })

  it('Check an unstructured event missing global context from reject ruleset', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
              data: {
                bannerId: 'ASO01041',
              },
            }
          },
          contexts: {
            data: []
          },
        }
      })
    ).toBe(true)
  })
})
