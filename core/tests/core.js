/*
 * JavaScript tracker core for Snowplow: tests/integration.js
 * 
 * Copyright (c) 2014 Snowplow Analytics Ltd. All rights reserved.
 *
 * This program is licensed to you under the Apache License Version 2.0,
 * and you may not use this file except in compliance with the Apache License Version 2.0.
 * You may obtain a copy of the Apache License Version 2.0 at http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the Apache License Version 2.0 is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Apache License Version 2.0 for the specific language governing permissions and limitations there under.
 */

define([
	"intern!object",
	"intern/chai!assert",
	"intern/dojo/node!../lib/core.js",
	"intern/dojo/node!JSON"
], function(registerSuite, assert, core, JSON) {

	var unstructEventSchema = 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0';
	var tracker = core(false);

	registerSuite({
		name: "Tracking events",
		"Track a page view": function() {
			var url = 'http://www.example.com';
			var page = 'title page';
			var expected = {
				e: 'pv',
				url: url,
				page: page
			};
			assert.deepEqual(tracker.trackPageView(url, page), expected, 'A page view should be tracked correctly');
		},

		"Track a page ping": function() {
			var url = 'http://www.example.com';
			var referer = 'http://www.google.com';
			var expected = {
				e: 'pp',
				url: url,
				refr: referer
			};

			assert.deepEqual(tracker.trackPagePing(url, null, referer), expected, 'A page ping should be tracked correctly');
		},

		"Track a structured event": function() {
			var expected = {
				e: 'se',
				se_ca: 'cat',
				se_ac: 'act',
				se_la: 'lab',
				se_pr: 'prop',
				se_va: 'val'
			};

			assert.deepEqual(tracker.trackStructEvent('cat', 'act', 'lab', 'prop', 'val'), expected, 'A structured event should be tracked correctly');
		},

		"Track an ecommerce transaction event": function() {
			var orderId = 'ak0008';
			var totalValue = 50;
			var taxValue = 6;
			var shipping = 0;
			var city = 'Phoenix';
			var state = 'Arizona';
			var country = 'USA';
			var currency = 'USD';
			var expected = {
				e: 'tr',
				tr_id: orderId,
				tr_tt: totalValue,
				tr_tx: taxValue,
				tr_sh: shipping,
				tr_ci: city,
				tr_st: state,
				tr_co: country,
				tr_cu: currency
			};

			assert.deepEqual(tracker.trackEcommerceTransaction(orderId,  null, totalValue, taxValue, shipping, city, state, country, currency), expected, 'A transaction event should be tracked correctly');
		},

		"Track an ecommerce transaction item event": function() {
			var orderId = 'ak0008';
			var sku = '4q345';
			var price = 17;
			var quantity = 2;
			var name = 'red shoes';
			var category = 'clothing';
			var currency = 'USD';
			var expected = {
				e: 'ti',
				ti_id: orderId,
				ti_sk: sku,
				ti_nm: name,
				ti_ca: category,
				ti_pr: price,
				ti_qu: quantity,
				ti_cu: currency
			};

			assert.deepEqual(tracker.trackEcommerceTransactionItem(orderId, sku, name, category, price, quantity, currency), expected, 'A transaction item event should be tracked correctly');
		},

		"Track an unstructured event": function() {
			var inputJson = {
				schema: 'iglu:com.acme/user/jsonschema/1-0-1',
				data: {
					name: 'Eric'
				}
			};
			var expected = {
				e: 'ue',
				ue_pr: JSON.stringify({
					schema: unstructEventSchema,
					data: inputJson
				})
			};

			assert.deepEqual(tracker.trackUnstructEvent(inputJson), expected, 'An unstructured event should be tracked correctly');
		},

		"Track a link click": function() {
			var targetUrl = 'http://www.example.com';
			var elementId = 'first header';
			var elementClasses = ['header'];

			var inputJson = {
				schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-0',
				data: {
					targetUrl: targetUrl,
					elementId: elementId,
					elementClasses: elementClasses
				}
			};
			var expected = {
				e: 'ue',
				ue_pr: JSON.stringify({
					schema: unstructEventSchema,
					data: inputJson
				})
			};

			assert.deepEqual(tracker.trackLinkClick(targetUrl, elementId, elementClasses), expected, 'A link click should be tracked correctly');
		},

		"Track a screen view": function() {
			var name = 'intro';
			var id = '7398-4352-5345-1950'

			var inputJson = {
				schema: 'iglu:com.snowplowanalytics.snowplow/screen_view/jsonschema/1-0-0',
				data: {
					name: name,
					id: id
				}
			};
			var expected = {
				e: 'ue',
				ue_pr: JSON.stringify({
					schema: unstructEventSchema,
					data: inputJson
				})
			};

			assert.deepEqual(tracker.trackScreenView(name, id), expected, 'A screen view should be tracked correctly');
		},

		"Track an ad impression": function() {
			var impressionId = 'a0e8f8780ab3';
			var costModel = 'cpc';
			var cost = 0.5;
			var targetUrl = 'http://adsite.com';
			var bannerId = '123';
			var zoneId = 'zone-14';
			var advertiserId = 'ad-company';
			var campaignId = 'campaign-7592';

			var inputJson = {
				schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
				data: {
					impressionId: impressionId,
					costModel: costModel,						
					cost: cost,
					targetUrl: targetUrl,
					bannerId: bannerId,
					zoneId: zoneId,
					advertiserId: advertiserId,
					campaignId: campaignId
				}
			};
			var expected = {
				e: 'ue',
				ue_pr: JSON.stringify({
					schema: unstructEventSchema,
					data: inputJson
				})
			};

			assert.deepEqual(tracker.trackAdImpression(impressionId, costModel, cost, targetUrl, bannerId, zoneId, advertiserId, campaignId), expected, 'An ad impression should be tracked correctly');
		},

		"Track an ad click": function() {
			var targetUrl = 'http://adsite.com';
			var clickId = 'click-321';
			var costModel = 'cpc';
			var cost = 0.5;
			var bannerId = '123';
			var zoneId = 'zone-14';
			var impressionId = 'a0e8f8780ab3';
			var advertiserId = 'ad-company';
			var campaignId = 'campaign-7592';

			var inputJson = {
				schema: 'iglu:com.snowplowanalytics.snowplow/ad_click/jsonschema/1-0-0',
				data: {
					targetUrl: targetUrl,
					clickId: clickId,
					costModel: costModel,
					cost: cost,
					bannerId: bannerId,
					zoneId: zoneId,
					impressionId: impressionId,
					advertiserId: advertiserId,
					campaignId: campaignId
				}
			};
			var expected = {
				e: 'ue',
				ue_pr: JSON.stringify({
					schema: unstructEventSchema,
					data: inputJson
				})
			};

			assert.deepEqual(tracker.trackAdClick(targetUrl, clickId, costModel, cost, bannerId, zoneId, impressionId, advertiserId, campaignId), expected, 'An ad click should be tracked correctly');
		},

		"Track an ad conversion": function() {
			var conversionId = 'conversion-59';
			var costModel = 'cpc';
			var cost = 0.5;
			var category = 'cat';
			var action = 'act';
			var property = 'prop';
			var initialValue = 7;
			var advertiserId = 'ad-company';
			var campaignId = 'campaign-7592';

			var inputJson = {
				schema: 'iglu:com.snowplowanalytics.snowplow/ad_conversion/jsonschema/1-0-0',
				data: {
					conversionId: conversionId,
					costModel: costModel,					
					cost: cost,
					category: category,
					action: action,
					property: property,
					initialValue: initialValue,
					advertiserId: advertiserId,
					campaignId: campaignId			
				}
			};
			var expected = {
				e: 'ue',
				ue_pr: JSON.stringify({
					schema: unstructEventSchema,
					data: inputJson
				})
			};

			assert.deepEqual(tracker.trackAdConversion(conversionId, costModel, cost, category, action, property, initialValue, advertiserId, campaignId), expected, 'An ad conversion should be tracked correctly');
		},

		"Track a page view with custom context": function() {
			var url = 'http://www.example.com';
			var page = 'title page';
			var inputContext = [{
				schema: 'iglu:com.acme/user/jsonschema/1-0-0',
				data: {
					userType: 'tester',
					userName: 'Jon'
				}
			}]
			var expected = {
				e: 'pv',
				url: url,
				page: page,
				co: JSON.stringify({
					schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
					data: inputContext
				})
			};
			console.log(expected)
			console.log(tracker.trackPageView(url, page, null, inputContext))
			assert.deepEqual(tracker.trackPageView(url, page, null, inputContext), expected, 'A custom context should be attached correctly');
		},

		"Add individual name-value pairs to the payload": function() {
			var tracker = core(false);
			var url = 'http://www.example.com';
			var expected = {
				e: 'pv',
				url: url,
				tna: 'cf',
				tv: 'js-2.0.0'
			};
			tracker.addPayloadPair('tna', 'cf');
			tracker.addPayloadPair('tv', 'js-2.0.0');
			assert.deepEqual(tracker.trackPageView(url), expected, 'Payload name-value pairs should be set correctly');
		},

		"Add a dictionary of name-value pairs to the payload": function() {
			var tracker = core(false);
			var url = 'http://www.example.com';
			var expected = {
				e: 'pv',
				url: url,
				tv: 'js-2.0.0',
				tna: 'cf',
				aid: 'cf325'
			};
			tracker.addPayloadPair('tv', 'js-2.0.0');
			tracker.addPayloadDict({
				tna: 'cf',
				aid: 'cf325'
			});

			assert.deepEqual(tracker.trackPageView(url), expected, 'Payload name-value pairs should be set correctly');
		},

		"Reset payload name-value pairs": function() {
			var tracker = core(false);
			var url = 'http://www.example.com';
			var expected = {
				e: 'pv',
				url: url,
				tna: 'cf'
			};
			tracker.addPayloadPair('tna', 'mistake');
			tracker.resetPayloadPairs({'tna': 'cf'});

			assert.deepEqual(tracker.trackPageView(url), expected, 'Payload name-value pairs should be reset correctly');
		},

		"Execute a callback": function() {
			var callbackTarget;
			var tracker = core(false, function(payload) {
				callbackTarget = payload;
			});
			var url = 'http://www.example.com';
			var expected = {
				e: 'pv',
				url: url,
			};
			tracker.trackPageView(url);

			assert.deepEqual(callbackTarget, expected, 'The callback should be executed correctly');
		}

	});
	
});
