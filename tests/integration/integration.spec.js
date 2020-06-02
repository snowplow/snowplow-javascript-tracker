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

const parseAndDecode64 = cx => JSON.parse(Buffer.from(cx, 'base64'))

const retrieveSchemaData = schema =>
  F.compose(
    F.get('data'),
    F.find({ schema }),
    F.get('data'),
    parseAndDecode64
  )

const hasMobileContext = isMatchWithCB({
  schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
  data: {
    osType: 'ubuntu',
  },
})

const hasGeoContext = isMatchWithCB({
  schema:
    'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
  data: {
    latitude: 40.0,
    longitude: 55.1,
  },
})

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
    browser.setCookies({
      name: 'container',
      value: containerUrl,
    })
    browser.setNetworkConditions({}, 'GPRS')    
    browser.url('/integration.html')
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

  it('Check existence of page view', () => {
    expect(
      logContains({
        event: {
          parameters: {
            e: 'pv',
            p: 'mob',
            aid: 'CFe23a',
            uid: 'Malcolm',
            page: 'Integration test page',
          },
        },
      })
    ).toBe(true)
  })

  it('Check existence of page view with custom context in log', () => {
    const expected = {
      event: {
        parameters: {
          e: 'pv',
          p: 'mob',
          aid: 'CFe23a',
          uid: 'Malcolm',
          page: 'My Title',
          cx: F.compose(
            F.isMatch({ keywords: ['tester'] }),
            retrieveSchemaData('iglu:org.schema/WebPage/jsonschema/1-0-0')
          ),
        },
      },
    }

    expect(logContains(expected)).toBe(true)
  })

  it('Check nonexistence of nonexistent event types in log', () => {
    expect(
      logContains({
        e: 'ad',
      })
    ).toBe(false)
  })

  it('Check a structured event was sent', () => {
    expect(
      logContains({
        event: {
          parameters: {
            e: 'se',
            se_ca: 'Mixes',
            se_ac: 'Play',
            se_la: 'MRC/fabric-0503-mix',
            se_va: '0.0',
          },
        },
      })
    ).toBe(true)
  })

  it('Check an unstructured event with true timestamp was sent', () => {
    expect(
      logContains({
        event: {
          parameters: {
            e: 'ue',
            ue_px: F.compose(
              F.isMatch({ bannerId: 'ASO01043' }),
              F.get('data.data'),
              parseAndDecode64
            ),
            ttm: '1477401868',
          },
        },
      })
    ).toBe(true)
  })

  it('Check a transaction event was sent', () => {
    expect(
      logContains({
        event: {
          parameters: {
            e: 'tr',
            tr_id: 'order-123',
            tr_af: 'acme',
            tr_tt: '8000',
            tr_tx: '100',
            tr_ci: 'phoenix',
            tr_st: 'arizona',
            tr_co: 'USA',
            tr_cu: 'JPY',
          },
        },
      })
    ).toBe(true)
  })

  it('Check a transaction item event was sent', () => {
    expect(
      logContains({
        event: {
          parameters: {
            e: 'ti',
            ti_id: 'order-123',
            ti_sk: '1001',
            ti_nm: 'Blue t-shirt',
            ti_ca: 'clothing',
            ti_pr: '2000',
            ti_qu: '2',
            ti_cu: 'JPY',
          },
        },
      })
    ).toBe(true)
  })

  it('Check an unhandled exception was sent', () => {
    expect(
      logContains({
        event: {
          parameters: {
            ue_px: F.compose(
              isMatchWithCB({
                schema:
                  'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
                data: {
                  programmingLanguage: 'JAVASCRIPT',
                  message: F.negate(F.isNull),
                },
              }),
              F.get('data'),
              parseAndDecode64
            ),
          },
        },
      })
    ).toBe(true)
  })

  it('Check pageViewId is regenerated for each trackPageView', () => {
    const pageViews = F.filter(
      ev =>
        F.get('event.parameters.e', ev) === 'pv' &&
        F.get('event.parameters.tna', ev) === 'cf',
      log
    )

    const getWebPageId = F.compose(
      F.get('id'),
      retrieveSchemaData(
        'iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0'
      ),
      F.get('event.parameters.cx')
    )

    expect(F.size(F.groupBy(getWebPageId, pageViews))).toBeGreaterThanOrEqual(2)
  })

  it('Check a GDPR context', () => {
    expect(
      logContains({
        event: {
          parameters: {
            cx: F.compose(
              isMatchWithCB({
                schema:
                  'iglu:com.snowplowanalytics.snowplow/gdpr/jsonschema/1-0-0',
                data: {
                  basisForProcessing: 'consent',
                  documentId: 'someId',
                  documentVersion: '0.1.0',
                  documentDescription: 'this document is a test',
                },
              }),
              F.find({
                schema:
                  'iglu:com.snowplowanalytics.snowplow/gdpr/jsonschema/1-0-0',
              }),
              F.get('data'),
              parseAndDecode64
            ),
          },
        },
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
      F.get('event.parameters.tna')
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
          parameters: {
            e: 'se',
            cx: F.compose(
              F.eq(2),
              F.size,
              F.filter(F.overSome([hasGeoContext, hasMobileContext])),
              F.get('data'),
              parseAndDecode64
            ),
          },
        },
      })
    ).toBe(true)
  })

  it('Check an unstructured event with global context from accept ruleset', () => {
    expect(
      logContains({
        event: {
          parameters: {
            e: 'ue',
            ue_px: F.compose(
              isMatchWithCB({
                schema:
                  'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
                data: {
                  bannerId: 'ASO01042',
                },
              }),
              F.get('data'),
              parseAndDecode64
            ),
            cx: F.compose(
              F.eq(2),
              F.size,
              F.filter(F.overSome([hasGeoContext, hasMobileContext])),
              F.get('data'),
              parseAndDecode64
            ),
          },
        },
      })
    ).toBe(true)
  })

  it('Check an unstructured event missing global context from reject ruleset', () => {
    expect(
      logContains({
        event: {
          parameters: {
            e: 'ue',
            ue_px: F.compose(
              isMatchWithCB({
                schema:
                  'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
                data: {
                  bannerId: 'ASO01041',
                },
              }),
              F.get('data'),
              parseAndDecode64
            ),
            cx: F.compose(
              F.eq(0),
              F.size,
              F.filter(F.overSome([hasGeoContext, hasMobileContext])),
              F.get('data'),
              parseAndDecode64
            ),
          },
        },
      })
    ).toBe(true)
  })
})
