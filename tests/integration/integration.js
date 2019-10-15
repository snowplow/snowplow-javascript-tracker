/*
 * JavaScript tracker for Snowplow: tests/functional/helpers.js
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

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!lodash',
  'intern/dojo/node!lodash/fp',
  'intern/dojo/node!url',
  "intern/dojo/node!../micro"
], function(registerSuite, assert, lodash, F, url, micro) {
  let log = [];

  function someTestsFailed(suite) {
    return lodash.some(suite.tests, function (test) { return test.error !== null; });
  }

  const isMatchWithCB = F.isMatchWith((lt, rt) => F.isFunction(rt) ? rt(lt) : undefined);

  const logContains = ev => F.some(isMatchWithCB(ev), log);

  const parseAndDecode64 = cx => JSON.parse(Buffer.from(cx, 'base64'));

  const retrieveSchemaData = schema => F.compose(
    F.get('data'),
    F.find({ schema }),
    F.get('data'),
    parseAndDecode64
  );

  registerSuite({

    teardown: function () {
      if (someTestsFailed(this)) {
        console.log("Tests failed with following log:");
        lodash.forEach(log, function (l) { console.log(l); });
      }
      console.log("Cleaning log");
      log = [];
    },

    setup: () => micro.fetchResults().then(results => {
      log = results;
      return Promise.resolve();
    }),

    name: 'Test that request_recorder logs meet expectations',

    'Check existence of page view': function () {
      assert.isTrue(
        logContains(
          {
            event: {
              parameters: {
                e: 'pv',
                p: 'mob',
                aid: 'CFe23a',
                uid: 'Malcolm',
                page: 'Integration test page',
              }
            }
          }
        )
        , 'A page view should be detected'
      );
    },

    'Check existence of page view with custom context in log': function () {
      const expected = {
        event: {
          parameters: {
            e: 'pv',
            p: 'mob',
            aid: 'CFe23a',
            uid: 'Malcolm',
            page: 'My Title',
            cx: F.compose(
              F.isMatch({ keywords: [ 'tester' ] }),
              retrieveSchemaData("iglu:org.schema/WebPage/jsonschema/1-0-0")
            )
          }
        }
      };

      assert.isTrue(logContains(expected), 'A page view should be detected');
    },

    'Check nonexistence of nonexistent event types in log': function () {
      assert.isFalse(logContains({
        e: 'ad'
      }), 'No nonexistent event type should be detected');
    },

    'Check a structured event was sent': function () {
      assert.isTrue(
        logContains({
          event: {
            parameters: {
              e: 'se',
              se_ca: 'Mixes',
              se_ac: 'Play',
              se_la: 'MRC/fabric-0503-mix',
              se_va: '0.0'
            }
          }
        }), 'A structured event should be detected');
    },

    'Check an unstructured event with true timestamp was sent': function () {
      assert.isTrue(logContains({
        event: {
          parameters: {
            e: 'ue',
            ue_px: F.compose(
              F.isMatch({ bannerId: 'ASO01043' }),
              F.get('data.data'),
              parseAndDecode64,
            ),
            ttm: '1477401868'
          }
        }
      }), 'An unstructured event should be detected');
    },

    'Check a transaction event was sent': function () {
      assert.isTrue(logContains({event:{parameters:{
        e: 'tr',
        tr_id: 'order-123',
        tr_af: 'acme',
        tr_tt: '8000',
        tr_tx: '100',
        tr_ci: 'phoenix',
        tr_st: 'arizona',
        tr_co: 'USA',
        tr_cu: 'JPY'
      }}}), 'A transaction event should be detected');
    },

    'Check a transaction item event was sent': function () {
      assert.isTrue(logContains({event:{parameters:{
        e: 'ti',
        ti_id: 'order-123',
        ti_sk: '1001',
        ti_nm: 'Blue t-shirt',
        ti_ca: 'clothing',
        ti_pr: '2000',
        ti_qu: '2',
        ti_cu: 'JPY'
      }}}), 'A transaction item event should be detected');
    },

    'Check an unhandled exception was sent': function () {
      assert.isTrue(logContains({
        event: {
          parameters: {
            ue_px: F.compose(
              isMatchWithCB({
                schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
                data: {
                  programmingLanguage: 'JAVASCRIPT',
                  message: F.negate(F.isNull)
                }
              }),
              F.get('data'),
              parseAndDecode64,
            )
          }
        }
      }));
    },

    'Check pageViewId is regenerated for each trackPageView': function () {
      const pageViews = F.filter(ev => F.get('event.parameters.e', ev) === 'pv', log);

      const getWebPageId = F.compose(
        F.get('id'),
        retrieveSchemaData('iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0'),
        F.get('event.parameters.cx')
      );

      assert.isTrue(F.size(F.groupBy(getWebPageId, pageViews)) >= 2);
    },

    'Check global contexts are for structured events': function () {
      assert.isTrue(logContains({event:{parameters:{
        e: 'se',
        cx: function (cx) {
          var contexts = parseAndDecode64(cx).data;
          return 2 === lodash.size(
            lodash.filter(contexts,
              lodash.overSome(
                lodash.matches({
                  schema: "iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1",
                  data: {
                    osType: 'ubuntu'
                  }
                }),
                lodash.matches({
                  schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
                  data: {
                    'latitude': 40.0,
                    'longitude': 55.1
                  }
                })
              )
            )
          );
        }
      }}}));
    },

    'Check an unstructured event with global context from accept ruleset': function () {
      assert.isTrue(logContains({event:{parameters:{
        e: 'ue',
        ue_px: function (ue_px) {
          var event = parseAndDecode64(ue_px).data;
          return lodash.isMatch(event,
            {
              schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
              data: {
                bannerId: 'ASO01042'
              }
            }
          );
        },
        cx: function (cx) {
          var contexts = parseAndDecode64(cx).data;
          return 2 === lodash.size(
            lodash.filter(contexts,
              lodash.overSome(
                lodash.matches({
                  schema: "iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1",
                  data: {
                    osType: 'ubuntu'
                  }
                }),
                lodash.matches({
                  schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
                  data: {
                    'latitude': 40.0,
                    'longitude': 55.1
                  }
                })
              )
            )
          );
        }
      }}}), 'An unstructured event with global contexts should be detected');
    },

    'Check an unstructured event missing global context from reject ruleset': function () {
      assert.isTrue(logContains({event:{parameters:{
        e: 'ue',
        ue_px: function (ue_px) {
          var event = parseAndDecode64(ue_px).data;
          return lodash.isMatch(event,
            {
              schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
              data:{
                bannerId: 'ASO01041'
              }
            }
          );
        },
        cx: function (cx) {
          var contexts = parseAndDecode64(cx).data;
          return 0 === lodash.size(
            lodash.filter(contexts,
              lodash.overSome(
                lodash.matches({
                  schema: "iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1",
                  data: {
                    osType: 'ubuntu'
                  }
                }),
                lodash.matches({
                  schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
                  data: {
                    'latitude': 40.0,
                    'longitude': 55.1
                  }
                })
              )
            )
          );
        }
      }}}), 'An unstructured event without global contexts should be detected');
    },

    'Check a GDPR context': function () {
      assert.isTrue(logContains({event:{parameters:{
        cx: function (cx) {
          var contexts = parseAndDecode64(cx).data;
          return 1 === lodash.size(
            lodash.filter(contexts,
              lodash.overSome(
                lodash.matches({
                  schema: "iglu:com.snowplowanalytics.snowplow/gdpr/jsonschema/1-0-0",
                  data: {
                    'basisForProcessing': 'consent',
                    'documentId': 'someId',
                    'documentVersion': '0.1.0',
                    'documentDescription': 'this document is a test'
                  }
                })
              )
            )
          );
        }
      }}}), 'An event with GDPR context should be detected');
    },

    'Check that all events have a GDPR context attached': function() {
      const withoutGdprContext = F.compose(
        F.negate(F.includes('iglu:com.snowplowanalytics.snowplow/gdpr/jsonschema/1-0-0')),
        F.get('contexts')
      );

      const numberWithoutGdpr = F.size(F.filter(withoutGdprContext, log));

      assert.isTrue(numberWithoutGdpr === 0);
    }
  });
});
