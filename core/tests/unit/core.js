/*
 * JavaScript tracker core for Snowplow: tests/integration.js
 * 
 * Copyright (c) 2014-2016 Snowplow Analytics Ltd. All rights reserved.
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
	"intern/chai!expect",
	"intern/dojo/node!../../lib/core.js"
], function (registerSuite, assert, expect, core) {

	var unstructEventSchema = 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0';
	var tracker = core.trackerCore(false);

	// Doesn't check true timestamp
	function compare(result, expected, message) {
		result = result.build();
		assert.ok(result['eid'], 'A UUID should be attached to all events');
		delete result['eid'];
		assert.ok(result['dtm'], 'A timestamp should be attached to all events');
		delete result['dtm'];
		assert.deepEqual(result, expected, message);
	}

	registerSuite({
		name: "Tracking events",

		"Track a page view": function () {
			var url = 'http://www.example.com';
			var page = 'title page';
			var expected = {
				e: 'pv',
				url: url,
				page: page
			};
			compare(tracker.trackPageView(url, page), expected, 'A page view should be tracked correctly');
		},

		"Track a page ping": function () {
			var url = 'http://www.example.com';
			var referer = 'http://www.google.com';
			var expected = {
				e: 'pp',
				url: url,
				refr: referer,
				pp_mix: '1',
				pp_max: '2',
				pp_miy: '3',
				pp_may: '4'
			};

			compare(tracker.trackPagePing(url, null, referer, 1, 2, 3, 4), expected, 'A page ping should be tracked correctly');
		},

		"Track a structured event": function () {
			var expected = {
				e: 'se',
				se_ca: 'cat',
				se_ac: 'act',
				se_la: 'lab',
				se_pr: 'prop',
				se_va: 'val'
			};

			compare(tracker.trackStructEvent('cat', 'act', 'lab', 'prop', 'val'), expected, 'A structured event should be tracked correctly');
		},

		"Track an ecommerce transaction event": function () {
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

			compare(tracker.trackEcommerceTransaction(orderId,  null, totalValue, taxValue, shipping, city, state, country, currency), expected, 'A transaction event should be tracked correctly');
		},

		"Track an ecommerce transaction item event": function () {
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

			compare(tracker.trackEcommerceTransactionItem(orderId, sku, name, category, price, quantity, currency), expected, 'A transaction item event should be tracked correctly');
		},

		"Track an unstructured event": function () {
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

			compare(tracker.trackUnstructEvent(inputJson), expected, 'An unstructured event should be tracked correctly');
		},

		"Track a self-describing event": function () {
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

			compare(tracker.trackSelfDescribingEvent(inputJson), expected, 'A self-describing event should be tracked correctly');
		},

		"Track a link click": function () {
			var targetUrl = 'http://www.example.com';
			var elementId = 'first header';
			var elementClasses = ['header'];
			var elementContent = 'link';

			var inputJson = {
				schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
				data: {
					targetUrl: targetUrl,
					elementId: elementId,
					elementClasses: elementClasses,
					elementContent: elementContent
				}
			};
			var expected = {
				e: 'ue',
				ue_pr: JSON.stringify({
					schema: unstructEventSchema,
					data: inputJson
				})
			};

			compare(tracker.trackLinkClick(targetUrl, elementId, elementClasses, null, elementContent), expected, 'A link click should be tracked correctly');
		},

		"Track a screen view": function () {
			var name = 'intro';
			var id = '7398-4352-5345-1950';

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

			compare(tracker.trackScreenView(name, id), expected, 'A screen view should be tracked correctly');
		},

		"Track an ad impression": function () {
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

			compare(tracker.trackAdImpression(impressionId, costModel, cost, targetUrl, bannerId, zoneId, advertiserId, campaignId), expected, 'An ad impression should be tracked correctly');
		},

		"Track an ad click": function () {
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

			compare(tracker.trackAdClick(targetUrl, clickId, costModel, cost, bannerId, zoneId, impressionId, advertiserId, campaignId), expected, 'An ad click should be tracked correctly');
		},

		"Track an ad conversion": function () {
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

			compare(tracker.trackAdConversion(conversionId, costModel, cost, category, action, property, initialValue, advertiserId, campaignId), expected, 'An ad conversion should be tracked correctly');
		},

		"Track a social interaction": function () {
			var action = 'like';
			var network = 'facebook';
			var target = 'status-0000345345';

			var inputJson = {
				schema: 'iglu:com.snowplowanalytics.snowplow/social_interaction/jsonschema/1-0-0',
				data: {
					action: action,
					network: network,
					target: target
				}
			};

			var expected = {
				e: 'ue',
				ue_pr: JSON.stringify({
					schema: unstructEventSchema,
					data: inputJson
				})
			};

			compare(tracker.trackSocialInteraction(action, network, target), expected);
		},


		"Track an add-to-cart event": function () {
			var sku = '4q345';
			var unitPrice = 17;
			var quantity = 2;
			var name = 'red shoes';
			var category = 'clothing';
			var currency = 'USD';

			var inputJson = {
				schema: 'iglu:com.snowplowanalytics.snowplow/add_to_cart/jsonschema/1-0-0',
				data: {
					sku: sku,
					name: name,
					category: category,
					unitPrice: unitPrice,
					quantity: quantity,
					currency: currency
				}
			};

			var expected = {
				e: 'ue',
				ue_pr: JSON.stringify({
					schema: unstructEventSchema,
					data: inputJson
				})
			};

			compare(tracker.trackAddToCart(sku, name, category, unitPrice, quantity, currency), expected);
		},

		"Track a remove-from-cart event": function () {
			var sku = '4q345';
			var unitPrice = 17;
			var quantity = 2;
			var name = 'red shoes';
			var category = 'clothing';
			var currency = 'USD';

			var inputJson = {
				schema: 'iglu:com.snowplowanalytics.snowplow/remove_from_cart/jsonschema/1-0-0',
				data: {
					sku: sku,
					name: name,
					category: category,
					unitPrice: unitPrice,
					quantity: quantity,
					currency: currency
				}
			};

			var expected = {
				e: 'ue',
				ue_pr: JSON.stringify({
					schema: unstructEventSchema,
					data: inputJson
				})
			};

			compare(tracker.trackRemoveFromCart(sku, name, category, unitPrice, quantity, currency), expected);
		},

		"Track a form change event": function () {
			var formId = "parent";
			var elementId = "child";
			var nodeName = "INPUT";
			var type = "text";
			var elementClasses = ["important"];
			var value = "male";

			var inputJson = {
				schema: 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0',
				data: {
					formId: formId,
					elementId: elementId,
					nodeName: nodeName,
					type: type,
					elementClasses: elementClasses,
					value: value
				}
			};

			var expected = {
				e: 'ue',
				ue_pr: JSON.stringify({
					schema: unstructEventSchema,
					data: inputJson
				})
			};

			compare(tracker.trackFormChange(formId, elementId, nodeName, type, elementClasses, value), expected);
		},

		"Track a form submission event": function () {
			var formId = "parent";
			var formClasses = ["formclass"];
			var elements = [{
				name: "gender",
				value: "male",
				nodeName: "INPUT",
				type: "text"
			}];

			var inputJson = {
				schema: 'iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0',
				data: {
					formId: formId,
					formClasses: formClasses,
					elements: elements
				}
			};

			var expected = {
				e: 'ue',
				ue_pr: JSON.stringify({
					schema: unstructEventSchema,
					data: inputJson
				})
			};

			compare(tracker.trackFormSubmission(formId, formClasses, elements), expected);
		},

		"Track a site seach event": function () {
			var terms = ["javascript", "development"];
			var filters = {
				"safeSearch": true,
				"category": "books"
			};
			var totalResults = 35;
			var pageResults = 10;

			var inputJson = {
				schema: 'iglu:com.snowplowanalytics.snowplow/site_search/jsonschema/1-0-0',
				data: {
					terms: terms,
					filters: filters,
					totalResults: totalResults,
					pageResults: pageResults
				}
			};

			var expected = {
				e: 'ue',
				ue_pr: JSON.stringify({
					schema: unstructEventSchema,
					data: inputJson
				})
			};

			compare(tracker.trackSiteSearch(terms, filters, totalResults, pageResults), expected);
		},

		"Track a consent withdrawn event": function () {
			var all = false;
			var id = 1234;
			var version = 2;
			var name = "consent_form";
			var description = "user withdraws consent for form";
			var tstamp = 1000000000000;
			var inputContext = [{
				schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
				data: {
					id: id,
					version: version,
					name: name,
					description: description
				}
			}];
			var inputJson = {
				schema: 'iglu:com.snowplowanalytics.snowplow/consent_withdrawn/jsonschema/1-0-0',
				data: {
					all: all
				}
			};
			var expected = {
				e: 'ue',
				ue_pr: JSON.stringify({
					schema: unstructEventSchema,
					data: inputJson
				}),
				co: JSON.stringify({
					schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
					data: inputContext
				})
			};
			compare(tracker.trackConsentWithdrawn(all, id, version, name, description, [], tstamp), expected);
		},

		"Track a page view with custom context": function () {
			var url = 'http://www.example.com';
			var page = 'title page';
			var inputContext = [{
				schema: 'iglu:com.acme/user/jsonschema/1-0-0',
				data: {
					userType: 'tester',
					userName: 'Jon'
				}
			}];
			var expected = {
				e: 'pv',
				url: url,
				page: page,
				co: JSON.stringify({
					schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
					data: inputContext
				})
			};
			compare(tracker.trackPageView(url, page, null, inputContext), expected, 'A custom context should be attached correctly');
		},

		"Track a page view with a timestamp": function () {
			var tstamp = 1000000000000;

			assert.strictEqual(tracker.trackPageView('http://www.example.com', null, null, null, tstamp).build()['dtm'], '1000000000000', 'A timestamp should be attached correctly');
		},

		"Add individual name-value pairs to the payload": function () {
			var tracker = core.trackerCore(false);
			var url = 'http://www.example.com';
			var expected = {
				e: 'pv',
				url: url,
				tna: 'cf',
				tv: 'js-2.0.0'
			};
			tracker.addPayloadPair('tna', 'cf');
			tracker.addPayloadPair('tv', 'js-2.0.0');

			compare(tracker.trackPageView(url), expected, 'Payload name-value pairs should be set correctly');
		},

		"Add a dictionary of name-value pairs to the payload": function () {
			var tracker = core.trackerCore(false);
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

			compare(tracker.trackPageView(url), expected, 'Payload name-value pairs should be set correctly');
		},

		"Reset payload name-value pairs": function () {
			var tracker = core.trackerCore(false);
			var url = 'http://www.example.com';
			var expected = {
				e: 'pv',
				url: url,
				tna: 'cf'
			};
			tracker.addPayloadPair('tna', 'mistake');
			tracker.resetPayloadPairs({'tna': 'cf'});

			compare(tracker.trackPageView(url), expected, 'Payload name-value pairs should be reset correctly');
		},

		"Execute a callback": function () {
			var callbackTarget;
			var tracker = core.trackerCore(false, function (payload) {
				callbackTarget = payload;
			});
			var url = 'http://www.example.com';
			var expected = {
				e: 'pv',
				url: url
			};
			tracker.trackPageView(url);

			compare(callbackTarget, expected, 'The callback should be executed correctly');
		},

		"Use setter methods": function () {
			var tracker = core.trackerCore(false);
			tracker.setTrackerVersion('js-3.0.0');
			tracker.setTrackerNamespace('cf1');
			tracker.setAppId('my-app');
			tracker.setPlatform('web');
			tracker.setUserId('jacob');
			tracker.setScreenResolution(400, 200);
			tracker.setViewport(500, 800);
			tracker.setColorDepth(24);
			tracker.setTimezone('Europe London');
			tracker.setIpAddress('37.151.33.154');
			var url = 'http://www.example.com';
			var page = 'title page';
			var expected = {
				e: 'pv',
				url: url,
				page: page,
				tna: 'cf1',
				tv: 'js-3.0.0',
				aid: 'my-app',
				p: 'web',
				uid: 'jacob',
				res: '400x200',
				vp: '500x800',
				cd: 24,
				tz: 'Europe London',
				ip: '37.151.33.154'
			};

			compare(tracker.trackPageView(url, page), expected, 'setXXX methods should work correctly');
		},

		"Set true timestamp": function () {
			var url = 'http://www.example.com';
			var page = 'title page';
            var result = tracker.trackPageView(url, page, null, null, { type: 'ttm', value: 1477403862 }).build();
			assert('ttm' in result, 'ttm should be attached');
			assert.strictEqual(result['ttm'] , '1477403862', 'ttm should be attached as is');
			assert(!('dtm' in result), 'dtm should absent');
		},

		"Set device timestamp as ADT": function () {

			var inputJson = {
				schema: 'iglu:com.acme/user/jsonschema/1-0-1',
				data: {
					name: 'Eric'
				}
			};

			// Object structure should be enforced by typesystem
			var result = tracker.trackSelfDescribingEvent(inputJson, [inputJson], {type: 'dtm', value: 1477403869}).build();
			assert('dtm' in result, 'dtm should be attached');
			assert.strictEqual(result['dtm'] , '1477403869', 'dtm should be attached as is');
			assert(!('ttm' in result), 'ttm should absent');
		}
	});
	
});
