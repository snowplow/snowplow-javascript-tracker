import F from 'lodash/fp';
import { fetchResults } from '../micro';
import { version } from '../../package.json';
import { pageSetup } from './helpers';

const retrieveSchemaData = (schema: unknown) => F.compose(F.get('data'), F.find({ schema }), F.get('data'));

const loadUrlAndWait = async (url: string) => {
  await browser.url(url);
  await browser.waitUntil(async () => (await $('#init').getText()) === 'true', {
    timeout: 5000,
    timeoutMsg: 'expected init after 5s',
  });
  await browser.waitUntil(async () => (await $('#secondInit').getText()) === 'true', {
    timeout: 5000,
    timeoutMsg: 'expected init after 5s',
  });
};

const isMatchWithCallback = F.isMatchWith((lt, rt) => (F.isFunction(rt) ? rt(lt) : undefined));

const mobileContext = {
  schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
  data: {
    osType: 'ubuntu',
  },
};

const geoContext = {
  schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
  data: {
    latitude: 40.0,
    longitude: 55.1,
  },
};

describe('Snowplow Micro integration', () => {
  const browserName = 'browserName' in browser.capabilities && browser.capabilities.browserName;
  if (browserName === 'internet explorer') {
    fit('Skip IE', () => {});
    return;
  }

  let eventMethods = ['get', 'post', 'beacon'];
  let log: Array<unknown> = [];
  let testIdentifier = '';

  const logContains = (ev: unknown) => F.some(F.isMatch(ev as object), log);
  const logContainsFn = (ev: unknown) => F.some(isMatchWithCallback(ev as object), log);

  beforeAll(async () => {
    testIdentifier = await pageSetup();
    await loadUrlAndWait('/integration.html?eventMethod=get');
    await browser.pause(2000); // Time for pings
    await $('#bottomRight').click();
    await browser.pause(5000); // Time for requests to get written
    await loadUrlAndWait('/integration.html?eventMethod=post');
    await browser.pause(2000); // Time for pings
    await $('#bottomRight').click();
    await browser.pause(6000); // Time for requests to get written
    await loadUrlAndWait('/integration.html?eventMethod=beacon');
    await browser.pause(2000); // Time for pings
    await $('#bottomRight').click();
    await browser.pause(6000); // Time for requests to get written
    log = await browser.call(async () => await fetchResults());
  });

  eventMethods.forEach((method) => {
    it(`${method}: contains correct tracker version`, () => {
      expect(
        logContains({
          rawEvent: {
            parameters: {
              tv: `js-${version}`,
            },
          },
          event: {
            app_id: `sp-${method}-${testIdentifier}`,
            v_tracker: `js-${version}`,
          },
        })
      ).toBe(true);
    });

    it(`${method}: contains page view`, () => {
      expect(
        logContains({
          event: {
            event: 'page_view',
            platform: 'mob',
            app_id: `sp-${method}-${testIdentifier}`,
            user_id: 'Malcolm',
            page_title: 'Integration test page',
          },
        })
      ).toBe(true);
    });

    it(`${method}: contains page view with custom context in log`, () => {
      const expected = {
        event: {
          event: 'page_view',
          platform: 'mob',
          app_id: `sp-${method}-${testIdentifier}`,
          user_id: 'Malcolm',
          page_title: 'My Title',
          contexts: {
            data: [
              {
                schema: 'iglu:org.schema/WebPage/jsonschema/1-0-0',
                data: { keywords: ['tester'] },
              },
            ],
          },
        },
      };

      expect(logContains(expected)).toBe(true);
    });

    it(`${method}: contains nonexistent event types in log`, () => {
      expect(
        logContains({
          event: 'ad',
          app_id: `sp-${method}-${testIdentifier}`,
        })
      ).toBe(false);
    });

    it(`${method}: contains at least one ping in the expected interval`, () => {
      const gtZero = F.compose(F.negate(F.gt(0)), F.toNumber);

      expect(
        logContainsFn({
          event: {
            event_name: 'page_ping',
            app_id: `sp-${method}-${testIdentifier}`,
            pp_xoffset_max: gtZero,
            pp_yoffset_max: gtZero,
          },
        })
      ).toBe(true);
    });

    it(`${method}: contains a structured event`, () => {
      expect(
        logContains({
          event: {
            app_id: `sp-${method}-${testIdentifier}`,
            event: 'struct',
            se_category: 'Mixes',
            se_action: 'Play',
            se_label: 'MRC/fabric-0503-mix',
            se_value: 0.0,
          },
        })
      ).toBe(true);
    });

    it(`${method}: contains an self describing event with true timestamp`, () => {
      expect(
        logContains({
          event: {
            app_id: `sp-${method}-${testIdentifier}`,
            event: 'unstruct',
            unstruct_event: {
              data: {
                data: { bannerId: 'ASO01043' },
              },
            },
            true_tstamp: '1970-01-18T02:23:21.868Z',
          },
        })
      ).toBe(true);
    });

    it(`${method}: contains an unhandled exception event`, () => {
      expect(
        logContains({
          event: {
            app_id: `sp-${method}-${testIdentifier}`,
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
              },
            },
            contexts: {
              data: [
                {
                  schema: 'iglu:org.schema/WebPage/jsonschema/1-0-0',
                  data: { keywords: ['tester'] },
                },
              ],
            },
          },
        })
      ).toBe(true);
    });

    it(`${method}: shows that pageViewId is regenerated for each trackPageView`, () => {
      const pageViews = F.filter(
        (ev) =>
          F.get('event.event', ev) === 'page_view' &&
          F.get('event.name_tracker', ev) === 'sp' &&
          F.get('event.app_id', ev) === `sp-${method}-${testIdentifier}`,
        log
      );

      const getWebPageId = F.compose(
        F.get('id'),
        retrieveSchemaData('iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0'),
        F.get('event.contexts')
      );

      expect(F.size(F.groupBy(getWebPageId, pageViews))).toBeGreaterThanOrEqual(2);
    });

    it(`${method}: has global contexts attached to structured events`, () => {
      expect(
        logContains({
          event: {
            app_id: `sp-${method}-${testIdentifier}`,
            event: 'struct',
            contexts: {
              data: [geoContext, mobileContext],
            },
          },
        })
      ).toBe(true);
    });

    it(`${method}: contains an self describing event with global context from accept ruleset`, () => {
      expect(
        logContains({
          event: {
            app_id: `sp-${method}-${testIdentifier}`,
            event: 'unstruct',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
                data: {
                  bannerId: 'ASO01042',
                },
              },
            },
            contexts: {
              data: [geoContext, mobileContext],
            },
          },
        })
      ).toBe(true);
    });

    it(`${method}: contains an self describing event missing global context from reject ruleset`, () => {
      expect(
        logContains({
          event: {
            app_id: `sp-${method}-${testIdentifier}`,
            event: 'unstruct',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
                data: {
                  bannerId: 'ASO01041',
                },
              },
            },
            contexts: {
              data: [],
            },
          },
        })
      ).toBe(true);
    });

    it(`${method}: contains page view event with non-base64 encoded context payload`, () => {
      expect(
        logContains({
          rawEvent: {
            parameters: {
              co: '{"schema":"iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0","data":[{"schema":"iglu:org.schema/WebPage/jsonschema/1-0-0","data":{"keywords":["tester"]}}]}',
            },
          },
          event: {
            event: 'page_view',
            platform: 'web',
            app_id: `no-b64-${method}-${testIdentifier}`,
            page_title: 'My Title',
            contexts: {
              data: [
                {
                  schema: 'iglu:org.schema/WebPage/jsonschema/1-0-0',
                  data: { keywords: ['tester'] },
                },
              ],
            },
          },
        })
      ).toBe(true);
    });

    it(`${method}: contains social interaction event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}-${testIdentifier}`,
            user_id: 'Malcolm',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/social_interaction/jsonschema/1-0-0',
                data: { action: 'retweet', network: 'twitter', target: '1234' },
              },
            },
          },
        })
      ).toBe(true);
    });

    it(`${method}: contains ad impression event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}-${testIdentifier}`,
            user_id: 'Malcolm',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
                data: {
                  impressionId: '67965967893',
                  costModel: 'cpm',
                  cost: 5.5,
                  targetUrl: 'http://www.example.com',
                  bannerId: '23',
                  zoneId: '7',
                  advertiserId: '201',
                  campaignId: '12',
                },
              },
            },
          },
        })
      ).toBe(true);
    });

    it(`${method}: contains ad click event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}-${testIdentifier}`,
            user_id: 'Malcolm',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/ad_click/jsonschema/1-0-0',
                data: {
                  impressionId: '67965967893',
                  clickId: '12243253',
                  costModel: 'cpm',
                  cost: 2.5,
                  targetUrl: 'http://www.example.com',
                  bannerId: '23',
                  zoneId: '7',
                  advertiserId: '201',
                  campaignId: '12',
                },
              },
            },
          },
        })
      ).toBe(true);
    });

    it(`${method}: contains ad conversion event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}-${testIdentifier}`,
            user_id: 'Malcolm',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/ad_conversion/jsonschema/1-0-0',
                data: {
                  conversionId: '743560297',
                  costModel: 'cpa',
                  cost: 10,
                  category: 'ecommerce',
                  action: 'purchase',
                  property: '',
                  initialValue: 99,
                  advertiserId: '201',
                  campaignId: '12',
                },
              },
            },
          },
        })
      ).toBe(true);
    });

    it(`${method}: contains add to cart event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}-${testIdentifier}`,
            user_id: 'Malcolm',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow.ecommerce/snowplow_ecommerce_action/jsonschema/1-0-2',
                data: {
                  type: 'add_to_cart',
                },
              },
            },
            contexts: {
              data: [
                {
                  schema: 'iglu:com.snowplowanalytics.snowplow.ecommerce/product/jsonschema/1-0-0',
                  data: {
                    id: 'P125',
                    name: 'Baseball T',
                    brand: 'Snowplow',
                    category: 'Mens/Apparel',
                    price: 200,
                    currency: 'USD',
                  },
                },
                {
                  schema: 'iglu:com.snowplowanalytics.snowplow.ecommerce/cart/jsonschema/1-0-0',
                  data: {
                    total_value: 200,
                    currency: 'USD',
                  },
                },
              ],
            },
          },
        })
      ).toBe(true);
    });

    it(`${method}: contains remove from cart event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}-${testIdentifier}`,
            user_id: 'Malcolm',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow.ecommerce/snowplow_ecommerce_action/jsonschema/1-0-2',
                data: {
                  type: 'remove_from_cart',
                },
              },
            },
            contexts: {
              data: [
                {
                  schema: 'iglu:com.snowplowanalytics.snowplow.ecommerce/product/jsonschema/1-0-0',
                  data: {
                    id: 'P125',
                    name: 'Baseball T',
                    brand: 'Snowplow',
                    category: 'Mens/Apparel',
                    price: 200,
                    currency: 'USD',
                  },
                },
                {
                  schema: 'iglu:com.snowplowanalytics.snowplow.ecommerce/cart/jsonschema/1-0-0',
                  data: {
                    total_value: 0,
                    currency: 'USD',
                  },
                },
              ],
            },
          },
        })
      ).toBe(true);
    });

    it(`${method}: contains site search event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}-${testIdentifier}`,
            user_id: 'Malcolm',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/site_search/jsonschema/1-0-0',
                data: {
                  terms: ['unified', 'log'],
                  filters: { category: 'books', 'sub-category': 'non-fiction' },
                  totalResults: 14,
                  pageResults: 8,
                },
              },
            },
          },
        })
      ).toBe(true);
    });

    it(`${method}: contains timing event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}-${testIdentifier}`,
            user_id: 'Malcolm',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/timing/jsonschema/1-0-0',
                data: {
                  category: 'load',
                  variable: 'map_loaded',
                  timing: 50,
                  label: 'Map loading time',
                },
              },
            },
          },
        })
      ).toBe(true);
    });

    it(`${method}: contains custom error event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}-${testIdentifier}`,
            user_id: 'Malcolm',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
                data: {
                  programmingLanguage: 'JAVASCRIPT',
                  lineNumber: 237,
                  lineColumn: 5,
                  fileName: 'trackError.js',
                },
              },
            },
          },
        })
      ).toBe(true);
    });

    it(`${method}: contains enhanced ecommerce event`, () => {
      expect(
        logContains({
          event: {
            event: 'unstruct',
            platform: 'mob',
            app_id: `sp-${method}-${testIdentifier}`,
            user_id: 'Malcolm',
            contexts: {
              data: [
                {
                  schema: 'iglu:com.google.analytics.enhanced-ecommerce/actionFieldObject/jsonschema/1-0-0',
                  data: {
                    id: 'T12345',
                    affiliation: 'Google Store - Online',
                    revenue: 37.39,
                    tax: 2.85,
                    shipping: 5.34,
                    coupon: 'WINTER2016',
                  },
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
                    position: 1,
                  },
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
                    quantity: 1,
                  },
                },
                {
                  schema: 'iglu:com.google.analytics.enhanced-ecommerce/promoFieldObject/jsonschema/1-0-0',
                  data: {
                    id: 'PROMO_1234',
                    name: 'Summer Sale',
                    creative: 'summer_banner2',
                    position: 'banner_slot1',
                  },
                },
              ],
            },
            unstruct_event: {
              data: {
                schema: 'iglu:com.google.analytics.enhanced-ecommerce/action/jsonschema/1-0-0',
                data: {
                  action: 'purchase',
                },
              },
            },
          },
        })
      ).toBe(true);
    });

    it(`${method}: doesn't contain a structured event with a user id (unset with null)`, () => {
      expect(
        logContains({
          event: {
            app_id: `sp-${method}-${testIdentifier}`,
            event: 'struct',
            se_category: 'userIdTest1',
            user_id: 'Dave',
          },
        })
      ).toBe(false);
    });

    it(`${method}: doesn't contain a structured event with a user id (unset with undefined)`, () => {
      expect(
        logContains({
          event: {
            app_id: `sp-${method}-${testIdentifier}`,
            event: 'struct',
            se_category: 'userIdTest2',
            user_id: 'Dave',
          },
        })
      ).toBe(false);
    });

    it(`${method}: has custom headers attached if possible`, () => {
      const results = log.filter(
        (event: any) =>
          event.rawEvent.context.headers.map((h: any) => h.toLowerCase()).includes('content-language: de-de, en-ca') &&
          event.event.app_id === `sp-${method}-${testIdentifier}`
      ) as Array<any>;

      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });
});
