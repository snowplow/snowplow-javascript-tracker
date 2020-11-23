/*
 * JavaScript tracker for Snowplow: tests/integration/integration.spec.js
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
import { version } from '../../package.json'

const dumpLog = log => console.log(util.inspect(log, true, null, true))

const retrieveSchemaData = schema =>
	F.compose(
		F.get('data'),
		F.find({ schema }),
		F.get('data')
  )
  
const loadUrlAndWait = (url) => {
  browser.url(url)
  browser.waitUntil(
    () => $('#init').getText() === 'true',
    {
      timeout: 5000,
      timeoutMsg: 'expected init after 5s'
    }
  )
}

const isMatchWithCallback = F.isMatchWith((lt, rt) =>
  F.isFunction(rt) ? rt(lt) : undefined
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

describe('Snowplow Micro integration', () => {
  let eventMethods = ['get', 'post', 'beacon']
  let log = []
  let docker

  const logContains = ev => F.some(F.isMatch(ev), log)
  const logContainsFn = ev => F.some(isMatchWithCallback(ev), log)

  beforeAll(() => {
    browser.call(() => {
      return start()
        .then((container) => {
          docker = container
        })
    })
    browser.url('/index.html')
    browser.setCookies({ name: 'container', value: docker.url })

    loadUrlAndWait('/integration.html?eventMethod=get')
    $('#bottomRight').scrollIntoView()
    browser.pause(10000) // Time for requests to get written
    loadUrlAndWait('/integration.html?eventMethod=post')
    $('#bottomRight').scrollIntoView()
    browser.pause(6000) // Time for requests to get written
    loadUrlAndWait('/integration.html?eventMethod=beacon')
    $('#bottomRight').scrollIntoView()
    browser.pause(6000) // Time for requests to get written

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

  eventMethods.forEach(method => {
    it(`${method}: contains correct tracker version`, () => {
      expect(
        logContains({
          rawEvent: {
            parameters: {
              tv: `js-${version}`
            }
          },
          event: {
            app_id: `sp-${method}`,
            v_tracker: `js-${version}`
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains page view`, () => {
      expect(
        logContains({
          event: {
            event: 'page_view',
            platform: 'mob',
            app_id: `sp-${method}`,
            user_id: 'Malcolm',
            page_title: 'Integration test page',
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains page view with custom context in log`, () => {
      const expected = {
        event: {
          event: 'page_view',
          platform: 'mob',
          app_id: `sp-${method}`,
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

    it(`${method}: contains nonnonexistent event types in log`, () => {
      expect(
        logContains({
          event: 'ad',
          app_id: `sp-${method}`
        })
      ).toBe(false)
    })

    it(`${method}: contains at least one ping in the expected interval`, () => { 
      const gtZero = F.compose(
        F.negate(F.gt(0)),
        F.toNumber
      )
  
      expect(
        logContainsFn({
          event: {
              event_name: 'page_ping',
              app_id: `sp-${method}`,
              pp_xoffset_max: gtZero,
              pp_yoffset_max: gtZero,
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains a structured event`, () => {
      expect(
        logContains({
          event: {
            app_id: `sp-${method}`,
            event: 'struct',
            se_category: 'Mixes',
            se_action: 'Play',
            se_label: 'MRC/fabric-0503-mix',
            se_value: 0.0,
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains an unstructured event with true timestamp`, () => {
      expect(
        logContains({
          event: {
            app_id: `sp-${method}`,
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

    it(`${method}: contains a transaction event`, () => {
      expect(
        logContains({
          event: {
              app_id: `sp-${method}`,
              event: 'transaction',
              tr_orderid: 'order-123',
              tr_affiliation: 'acme',
              tr_total: 8000,
              tr_tax: 100,
              tr_shipping: 50,
              tr_city: 'phoenix',
              tr_state: 'arizona',
              tr_country: 'USA',
              tr_currency: 'JPY',
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains a transaction item event`, () => {
      expect(
        logContains({
          event: {
            app_id: `sp-${method}`,
            event: 'transaction_item',
            ti_orderid: 'order-123',
            ti_sku: '1001',
            ti_name: 'Blue t-shirt',
            ti_category: 'clothing',
            ti_price: 2000,
            ti_quantity: 2,
            ti_currency: 'JPY',
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains an unhandled exception event`, () => {
      expect(
        logContains({
            event: {
              app_id: `sp-${method}`,
              unstruct_event: {
                data: {
                  schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1'
                }
              },
              contexts: {
                data: [{
                  schema: 'iglu:org.schema/WebPage/jsonschema/1-0-0',
                  data: { keywords: ['tester'] }
                }]
              }
            }
          }
        )
      ).toBe(true)
    })

    it(`${method}: shows that pageViewId is regenerated for each trackPageView`, () => {
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

    it(`${method}: contains a GDPR context`, () => {
      expect(
        logContains({
          event: {
            app_id: `sp-${method}`,
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

    it(`${method}: has a GDPR context attached to all events`, () => {
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

    it(`${method}: has global contexts attached to structured events`, () => {
      expect(
        logContains({
          event: {
            app_id: `sp-${method}`,
            event: 'struct',
            contexts: {
              data: [geoContext, mobileContext]
            },
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains an unstructured event with global context from accept ruleset`, () => {
      expect(
        logContains({
          event: {
            app_id: `sp-${method}`,
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

    it(`${method}: contains an unstructured event missing global context from reject ruleset`, () => {
      expect(
        logContains({
          event: {
            app_id: `sp-${method}`,
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

    it(`${method}: contains page view event with non-base64 encoded context payload`, () => {
      expect(
        logContains({
          rawEvent: {
            parameters: {
              co: '{"schema":"iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0","data":[{"schema":"iglu:org.schema/WebPage/jsonschema/1-0-0","data":{"keywords":["tester"]}}]}'
            },
          },
          event: {
            event: 'page_view',
            platform: 'web',
            app_id: `no-b64-${method}`,
            page_title: 'My Title',
            contexts: {
              data: [{
                schema: 'iglu:org.schema/WebPage/jsonschema/1-0-0',
                data: { keywords: ['tester'] }
              }]
            }
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains social interaction event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}`,
            user_id: 'Malcolm',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/social_interaction/jsonschema/1-0-0',
                data: { action: 'retweet', network: 'twitter', target: '1234' }
              }
            }
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains ad impression event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}`,
            user_id: 'Malcolm',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
                data: {
                  impressionId: "67965967893",
                  costModel: "cpm",
                  cost: 5.5,
                  targetUrl: "http://www.example.com",
                  bannerId: "23",
                  zoneId: "7",
                  advertiserId: "201",
                  campaignId: "12"
                }
              }
            }
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains ad click event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}`,
            user_id: 'Malcolm',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/ad_click/jsonschema/1-0-0',
                data: {
                  impressionId: "67965967893",
                  clickId: "12243253",
                  costModel: "cpm",
                  cost: 2.5,
                  targetUrl: "http://www.example.com",
                  bannerId: "23",
                  zoneId: "7",
                  advertiserId: "201",
                  campaignId: "12"
                }
              }
            }
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains ad conversion event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}`,
            user_id: 'Malcolm',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/ad_conversion/jsonschema/1-0-0',
                data: {
                  conversionId: "743560297",
                  costModel: "cpa",
                  cost: 10,
                  category: "ecommerce",
                  action: "purchase",
                  property: '',
                  initialValue: 99,
                  advertiserId: "201",
                  campaignId: "12"
                }
              }
            }
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains add to cart event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}`,
            user_id: 'Malcolm',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/add_to_cart/jsonschema/1-0-0',
                data: {
                  sku: "000345",
                  name: "blue tie",
                  category: "clothing",
                  unitPrice: 3.49,
                  quantity: 2,
                  currency: "GBP"
                }
              }
            }
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains remove from cart event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}`,
            user_id: 'Malcolm',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/remove_from_cart/jsonschema/1-0-0',
                data: {
                  sku: "000345",
                  name: "blue tie",
                  category: "clothing",
                  unitPrice: 3.49,
                  quantity: 1,
                  currency: "GBP"
                }
              }
            }
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains site search event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}`,
            user_id: 'Malcolm',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/site_search/jsonschema/1-0-0',
                data: {
                  terms: [ "unified", "log" ],
                  filters: { "category": "books", "sub-category": "non-fiction" },
                  totalResults: 14,
                  pageResults: 8
                }
              }
            }
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains timing event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}`,
            user_id: 'Malcolm',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/timing/jsonschema/1-0-0',
                data: {
                  category: "load",
                  variable: "map_loaded",
                  timing: 50,
                  label: "Map loading time"
                }
              }
            }
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains consent granted event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}`,
            user_id: 'Malcolm',
            contexts: {
              data: [{
                schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
                data: {
                  id: "1234",
                  version: "5",
                  name: "consent_document",
                  description: "a document granting consent"
                }
              }]
            },
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/consent_granted/jsonschema/1-0-0',
                data: {
                  expiry: "2020-11-21T08:00:00.000Z"
                }
              }
            }
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains consent withdrawn event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}`,
            user_id: 'Malcolm',
            contexts: {
              data: [{
                schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
                data: {
                  id: "1234",
                  version: "5",
                  name: "consent_document",
                  description: "a document withdrawing consent"
                }
              }]
            },
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/consent_withdrawn/jsonschema/1-0-0',
                data: {
                  all: false
                }
              }
            }
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains custom error event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}`,
            user_id: 'Malcolm',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
                data: {
                  programmingLanguage: "JAVASCRIPT",
                  lineNumber: 237,
                  lineColumn: 5,
                  fileName: "trackError.js"
                }
              }
            }
          },
        })
      ).toBe(true)
    })

    it(`${method}: contains enhanced ecommerce event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}`,
            user_id: 'Malcolm',
            contexts: {
              data: [{
                schema: 'iglu:com.google.analytics.enhanced-ecommerce/actionFieldObject/jsonschema/1-0-0',
                data: {
                  id: 'T12345',
                  affiliation: 'Google Store - Online',
                  revenue: 37.39,
                  tax: 2.85,
                  shipping: 5.34,
                  coupon: 'WINTER2016'
                }
              },
              {
                schema: 'iglu:com.google.analytics.enhanced-ecommerce/impressionFieldObject/jsonschema/1-0-0',
                data: {
                  id: 'P12345',
                  name: 'Android Warhol T-Shirt',
                  list: 'Search Results',
                  brand: 'Google',
                  category: 'Apparel/T-Shirts',
                  variant: 'Black',
                  position: 1
                }
              },
              {
                schema: 'iglu:com.google.analytics.enhanced-ecommerce/productFieldObject/jsonschema/1-0-0',
                data: {
                  id: 'P12345',
                  name: 'Android Warhol T-Shirt',
                  list: 'Search Results',
                  brand: 'Google',
                  category: 'Apparel/T-Shirts',
                  variant: 'Black',
                  price: 1
                }
              },
              {
                schema: 'iglu:com.google.analytics.enhanced-ecommerce/promoFieldObject/jsonschema/1-0-0',
                data: {
                  id: 'PROMO_1234',
                  name: 'Summer Sale',
                  creative: 'summer_banner2',
                  position: 'banner_slot1'
                }
              }]
            },
            unstruct_event: {
              data: {
                schema: 'iglu:com.google.analytics.enhanced-ecommerce/action/jsonschema/1-0-0',
                data: {
                  action: 'purchase'
                }
              }
            }
          },
        })
      ).toBe(true)
    })
      
  });
})
