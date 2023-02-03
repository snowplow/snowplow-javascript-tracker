/*
 * Copyright (c) 2022 Snowplow Analytics Ltd
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import {
  newTracker,
  version,
  buildEcommerceTransaction,
  buildEcommerceTransactionItem,
  buildPageView,
  buildScreenView,
  buildSelfDescribingEvent,
  buildStructEvent,
  Payload,
} from '../src/index';
import test, { ExecutionContext } from 'ava';
import nock from 'nock';
import querystring from 'querystring';
import { gotEmitter } from '../src/got_emitter';

const UUID_REGEX = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

const testMethods = ['get', 'post'] as const;

const endpoint = 'd3rkrsqld9gmqf.cloudfront.net';

const context = [
  {
    schema: 'iglu:com.acme/user/jsonschema/1-0-0',
    data: {
      type: 'tester',
    },
  },
];

const completedContext = JSON.stringify({
  schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
  data: context,
});

nock(new RegExp('https*://' + endpoint))
  .persist()
  .filteringPath(() => '/')
  .get('/')
  .reply(200, (uri) => querystring.parse(uri.slice(3)));

nock(new RegExp('https*://' + endpoint))
  .matchHeader('content-type', 'application/json; charset=utf-8')
  .persist()
  .filteringRequestBody(() => '*')
  .post('/com.snowplowanalytics.snowplow/tp2', '*')
  .reply(200, (_uri, body) => body);

function extractPayload(response?: string, method?: string): Payload {
  if (!response) return {};

  const parsed = JSON.parse(response);
  if (method === 'get') {
    return parsed;
  } else {
    return (parsed['data'] as Array<unknown>)[0] as Payload;
  }
}

function checkPayload(payloadDict: Payload, expected: Payload, t: ExecutionContext<unknown>): void {
  t.like(payloadDict, expected);
  t.deepEqual(payloadDict['co'], completedContext, 'a custom context should be attached');
  t.truthy(payloadDict['dtm'], 'a timestamp should be attached');
  t.truthy(payloadDict['eid'], 'a UUID should be attached');
}

test.before(() => {
  nock.disableNetConnect();
});

test.after(() => {
  nock.cleanAll();
});

for (const method of testMethods) {
  test(method + ' method: track API should return eid in the payload', async (t) => {
    const track = newTracker({ namespace: 'cf', appId: 'cfe35', encodeBase64: false }, { endpoint, protocol: 'http' });
    const eventPayload = track.track(
      buildPageView({ pageUrl: 'http://www.example.com', pageTitle: 'example page', referrer: 'http://google.com' }),
      context
    );
    t.truthy(eventPayload.eid);
    t.regex(eventPayload.eid as string, UUID_REGEX);
  });

  test(method + ' method: trackPageView should send a page view event', async (t) => {
    const expected = {
      tv: 'node-' + version,
      tna: 'cf',
      aid: 'cfe35',
      p: 'srv',
      e: 'pv',
      url: 'http://www.example.com',
      page: 'example page',
      refr: 'http://google.com',
    };

    await new Promise((resolve, reject) => {
      const track = newTracker(
        { namespace: 'cf', appId: 'cfe35', encodeBase64: false },
        {
          endpoint,
          method,
          bufferSize: 0,
          callback: function (error, response) {
            checkPayload(extractPayload(response?.body, method), expected, t);
            if (error) reject(error);
            else resolve(response);
          },
        }
      );
      track.track(
        buildPageView({ pageUrl: 'http://www.example.com', pageTitle: 'example page', referrer: 'http://google.com' }),
        context
      );
    });
  });

  test(method + ' method: trackStructEvent should send a structured event', async (t) => {
    const expected = {
      tv: 'node-' + version,
      tna: 'cf',
      aid: 'cfe35',
      e: 'se',
      se_ca: 'clothes',
      se_ac: 'add_to_basket',
      se_pr: 'jumper',
      se_la: 'red',
      se_va: '15',
    };
    await new Promise((resolve, reject) => {
      const track = newTracker(
        { namespace: 'cf', appId: 'cfe35', encodeBase64: false },
        {
          endpoint,
          method,
          bufferSize: 0,
          callback: function (error, response) {
            checkPayload(extractPayload(response?.body, method), expected, t);
            if (error) reject(error);
            else resolve(response);
          },
        }
      );
      track.track(
        buildStructEvent({ category: 'clothes', action: 'add_to_basket', property: 'jumper', label: 'red', value: 15 }),
        context
      );
    });
  });

  test(method + ' method: trackEcommerceTransactionWithItems should track an ecommerce transaction', async (t) => {
    const expectedTransaction = {
      e: 'tr',
      tr_id: 'order-7',
      tr_af: 'affiliate',
      tr_tt: '15',
      tr_tx: '5',
      tr_sh: '0',
      tr_ci: 'Dover',
      tr_st: 'Delaware',
      tr_co: 'US',
      tr_cu: 'GBP',
    };

    await new Promise((resolve, reject) => {
      const track = newTracker(
        { namespace: 'cf', appId: 'cfe35', encodeBase64: false },
        {
          endpoint,
          method,
          bufferSize: 0,
          callback: function (error, response) {
            const payloadDict = extractPayload(response?.body, method);
            checkPayload(payloadDict, expectedTransaction, t);
            if (error) reject(error);
            else resolve(response);
          },
        }
      );
      track.track(
        buildEcommerceTransaction({
          orderId: 'order-7',
          affiliation: 'affiliate',
          total: 15,
          tax: 5,
          shipping: 0,
          city: 'Dover',
          state: 'Delaware',
          country: 'US',
          currency: 'GBP',
        }),
        context
      );
    });
  });

  test(
    method + ' method: trackEcommerceTransactionWithItems should track an ecommerce transaction and items',
    async (t) => {
      const items = [
        {
          sku: 'item-729',
          name: 'red hat',
          category: 'headgear',
          price: 10,
          quantity: 1,
        },
      ];
      const expectedTransaction = {
        e: 'tr',
        tr_id: 'order-7',
        tr_af: 'affiliate',
        tr_tt: '15',
        tr_tx: '5',
        tr_sh: '0',
        tr_ci: 'Dover',
        tr_st: 'Delaware',
        tr_co: 'US',
        tr_cu: 'GBP',
      };
      const expectedItem = {
        e: 'ti',
        ti_sk: 'item-729',
        ti_nm: 'red hat',
        ti_ca: 'headgear',
        ti_qu: '1',
        ti_id: 'order-7',
        ti_cu: 'GBP',
      };

      let requestCount = items.length + 1;

      await new Promise((resolve, reject) => {
        const track = newTracker(
          { namespace: 'cf', appId: 'cfe35', encodeBase64: false },
          {
            endpoint,
            method,
            bufferSize: 0,
            callback: function (error, response) {
              const payloadDict = extractPayload(response?.body, method);
              const expected = payloadDict['e'] === 'tr' ? expectedTransaction : expectedItem;

              checkPayload(payloadDict, expected, t);

              requestCount--;
              if (requestCount === 0) {
                resolve(response);
              }

              if (error) reject(error);
            },
          }
        );
        track.track(
          buildEcommerceTransaction({
            orderId: 'order-7',
            affiliation: 'affiliate',
            total: 15,
            tax: 5,
            shipping: 0,
            city: 'Dover',
            state: 'Delaware',
            country: 'US',
            currency: 'GBP',
          }),
          context
        );

        items.forEach((item) => {
          track.track(
            buildEcommerceTransactionItem({
              orderId: 'order-7',
              price: item.price,
              sku: item.sku,
              name: item.name,
              category: item.category,
              currency: 'GBP',
              quantity: item.quantity,
            }),
            context
          );
        });
      });
    }
  );

  test(method + ' method: trackUnstructEvent should send a structured event', async (t) => {
    const inputJson = {
      schema: 'iglu:com.acme/viewed_product/jsonschema/1-0-0',
      data: {
        price: 20,
      },
    };
    const expected = {
      tv: 'node-' + version,
      tna: 'cf',
      aid: 'cfe35',
      e: 'ue',
      ue_pr: JSON.stringify({
        schema: 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0',
        data: inputJson,
      }),
    };

    await new Promise((resolve, reject) => {
      const track = newTracker(
        { namespace: 'cf', appId: 'cfe35', encodeBase64: false },
        {
          endpoint,
          method,
          bufferSize: 0,
          callback: function (error, response) {
            checkPayload(extractPayload(response?.body, method), expected, t);
            if (error) reject(error);
            else resolve(response);
          },
        }
      );
      track.track(buildSelfDescribingEvent({ event: inputJson }), context);
    });
  });

  test(method + ' method: trackScreenView should send a screen view event', async (t) => {
    const expected = {
      tv: 'node-' + version,
      tna: 'cf',
      aid: 'cfe35',
      e: 'ue',
      ue_pr: JSON.stringify({
        schema: 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0',
        data: {
          schema: 'iglu:com.snowplowanalytics.snowplow/screen_view/jsonschema/1-0-0',
          data: {
            name: 'title screen',
            id: '12345',
          },
        },
      }),
    };

    await new Promise((resolve, reject) => {
      const track = newTracker(
        { namespace: 'cf', appId: 'cfe35', encodeBase64: false },
        {
          endpoint,
          method,
          bufferSize: 0,
          callback: function (error, response) {
            checkPayload(extractPayload(response?.body, method), expected, t);
            if (error) reject(error);
            else resolve(response);
          },
        }
      );
      track.track(buildScreenView({ name: 'title screen', id: '12345' }), context);
    });
  });

  test(method + ' method: setter methods should set user attributes', async (t) => {
    const expected = {
      tv: 'node-' + version,
      tna: 'cf',
      aid: 'cfe35',
      e: 'pv',
      url: 'http://www.example.com',
      page: 'example page',
      refr: 'http://google.com',
      p: 'web',
      uid: 'jacob',
      res: '400x200',
      vp: '500x800',
      cd: '24',
      tz: 'Europe London',
      dtm: '1000000000000',
    };

    await new Promise((resolve, reject) => {
      const track = newTracker(
        { namespace: 'cf', appId: 'cfe35', encodeBase64: false },
        {
          endpoint,
          method,
          bufferSize: 0,
          callback: function (error, response) {
            checkPayload(extractPayload(response?.body, method), expected, t);
            if (error) reject(error);
            else resolve(response);
          },
        }
      );

      track.setPlatform('web');
      track.setUserId('jacob');
      track.setScreenResolution('400', '200');
      track.setViewport('500', '800');
      track.setColorDepth('24');
      track.setTimezone('Europe London');

      track.track(
        buildPageView({ pageUrl: 'http://www.example.com', pageTitle: 'example page', referrer: 'http://google.com' }),
        context,
        1000000000000
      );
    });
  });

  test(
    method + ' method: base 64 encoding should base 64 encode unstructured events and custom contexts',
    async (t) => {
      const inputJson = {
        schema: 'iglu:com.acme/viewed_product/jsonschema/1-0-0',
        data: {
          price: 20,
        },
      };

      await new Promise((resolve, reject) => {
        const track = newTracker(
          { namespace: 'cf', appId: 'cfe35', encodeBase64: true },
          {
            endpoint,
            method,
            bufferSize: 0,
            callback: function (error, response) {
              const pd = extractPayload(response?.body, method);
              t.is(
                pd['ue_px'],
                'eyJzY2hlbWEiOiJpZ2x1OmNvbS5zbm93cGxvd2FuYWx5dGljcy5zbm93cGxvdy91bnN0cnVjdF9ldmVudC9qc29uc2NoZW1hLzEtMC0wIiwiZGF0YSI6eyJzY2hlbWEiOiJpZ2x1OmNvbS5hY21lL3ZpZXdlZF9wcm9kdWN0L2pzb25zY2hlbWEvMS0wLTAiLCJkYXRhIjp7InByaWNlIjoyMH19fQ'
              );
              t.is(
                pd['cx'],
                'eyJzY2hlbWEiOiJpZ2x1OmNvbS5zbm93cGxvd2FuYWx5dGljcy5zbm93cGxvdy9jb250ZXh0cy9qc29uc2NoZW1hLzEtMC0wIiwiZGF0YSI6W3sic2NoZW1hIjoiaWdsdTpjb20uYWNtZS91c2VyL2pzb25zY2hlbWEvMS0wLTAiLCJkYXRhIjp7InR5cGUiOiJ0ZXN0ZXIifX1dfQ'
              );
              if (error) reject(error);
              else resolve(response);
            },
          }
        );
        track.track(buildSelfDescribingEvent({ event: inputJson }), context);
      });
    }
  );

  test(method + ' method: multiple custom emitters should send an event to multiple collectors', async (t) => {
    const expected = {
      tv: 'node-' + version,
      tna: 'cf',
      aid: 'cfe35',
      p: 'srv',
      e: 'pv',
      url: 'http://www.example.com',
      page: 'example page',
      refr: 'http://google.com',
    };
    let count = 2;

    await new Promise((resolve, reject) => {
      const e = gotEmitter({
        endpoint,
        method,
        bufferSize: 0,
        callback: function (error, response) {
          checkPayload(extractPayload(response?.body, method), expected, t);
          count--;
          if (count === 0) {
            resolve(response);
          }

          if (error) {
            reject(error);
          }
        },
      });

      const track = newTracker(
        { namespace: 'cf', appId: 'cfe35', encodeBase64: false },
        { customEmitter: () => [e, e] }
      );
      track.track(
        buildPageView({ pageUrl: 'http://www.example.com', pageTitle: 'example page', referrer: 'http://google.com' }),
        context
      );
    });
  });

  test(method + ' method: multiple gotemitters should send an event to multiple collectors', async (t) => {
    const expected = {
      tv: 'node-' + version,
      tna: 'cf',
      aid: 'cfe35',
      p: 'srv',
      e: 'pv',
      url: 'http://www.example.com',
      page: 'example page',
      refr: 'http://google.com',
    };
    let count = 2;

    await new Promise((resolve, reject) => {
      const track = newTracker({ namespace: 'cf', appId: 'cfe35', encodeBase64: false }, [
        {
          endpoint,
          method,
          bufferSize: 0,
          callback: function (error, response) {
            checkPayload(extractPayload(response?.body, method), expected, t);
            count--;
            if (count === 0) {
              resolve(response);
            }

            if (error) {
              reject(error);
            }
          },
        },
        {
          endpoint,
          method,
          bufferSize: 0,
          callback: function (error, response) {
            checkPayload(extractPayload(response?.body, method), expected, t);
            count--;
            if (count === 0) {
              resolve(response);
            }

            if (error) {
              reject(error);
            }
          },
        },
      ]);
      track.track(
        buildPageView({ pageUrl: 'http://www.example.com', pageTitle: 'example page', referrer: 'http://google.com' }),
        context
      );
    });
  });

  test(method + ' method: setDomainUserId should attach a duid property to event', async (t) => {
    const expected = {
      duid: 'duid-test-1234',
    };

    await new Promise((resolve, reject) => {
      const track = newTracker(
        { namespace: 'cf', appId: 'cfe35', encodeBase64: false },
        {
          endpoint,
          method,
          bufferSize: 0,
          callback: function (error, response) {
            checkPayload(extractPayload(response?.body, method), expected, t);
            if (error) reject(error);
            else resolve(response);
          },
        }
      );
      track.setDomainUserId('duid-test-1234');
      track.track(
        buildPageView({ pageUrl: 'http://www.example.com', pageTitle: 'example page', referrer: 'http://google.com' }),
        context
      );
    });
  });

  test(method + ' method: setNetworkUserID should attach a nuid property to event', async (t) => {
    const expected = {
      nuid: 'nuid-test-1234',
    };

    await new Promise((resolve, reject) => {
      const track = newTracker(
        { namespace: 'cf', appId: 'cfe35', encodeBase64: false },
        {
          endpoint,
          method,
          bufferSize: 0,
          callback: function (error, response) {
            checkPayload(extractPayload(response?.body, method), expected, t);
            if (error) reject(error);
            else resolve(response);
          },
        }
      );
      track.setNetworkUserId('nuid-test-1234');
      track.track(
        buildPageView({ pageUrl: 'http://www.example.com', pageTitle: 'example page', referrer: 'http://google.com' }),
        context
      );
    });
  });
}
