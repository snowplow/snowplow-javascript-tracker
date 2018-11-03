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
	"intern/dojo/node!../../lib/contexts.js"
], function (registerSuite, assert, expect, contexts) {
	registerSuite({
		name: "Global context tests",

		"Identify context primitives": function () {
			var geolocationContext = {
				schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
				data: {
					'latitude': 40.0,
					'longitude' : 55.1
				}
			};

			function eventTypeContextGenerator(payload, eventType, schema) {
				var context = {};
				context['schema'] = 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1';
				context['data']['osType'] = 'ubuntu';
				context['data']['osVersion'] = '2018.04';
				context['data']['deviceManufacturer'] = 'ASUS';
				context['data']['deviceModel'] = String(eventType);
				return context;
			}

			assert.isTrue(contexts.isContextPrimitive(geolocationContext), 'A context primitive should be identified');
			assert.isTrue(contexts.isContextPrimitive(eventTypeContextGenerator), 'A context primitive should be identified');
		},

		"Identify rulesets": function () {
			var acceptRuleSet = {
				accept: ['iglu:com.snowplowanalytics.snowplow/././.']
			};

			var rejectRuleSet = {
				reject: ['iglu:com.snowplowanalytics.snowplow/././.']
			};

			var bothRuleSet = {
				accept: ['iglu:com.snowplowanalytics.snowplow/././.'],
				reject: ['iglu:com.snowplowanalytics.snowplow/././.']
			};

			var pageview_schema = 'iglu:com.snowplowanalytics.snowplow/pageview/jsonschema/1-0-1';

			assert.isTrue(contexts.isValidMatcher(acceptRuleSet.accept[0]), 'All rule elements are correctly identified as valid matchers');
			assert.isTrue(contexts.isValidRuleSetArg(acceptRuleSet.accept), 'A rulset arg is correctly identified');
			assert.isTrue(contexts.isRuleSet(acceptRuleSet), 'An accept ruleset is identified');
			assert.isTrue(contexts.isRuleSet(rejectRuleSet), 'A reject ruleset is identified');
			assert.isTrue(contexts.isRuleSet(bothRuleSet), 'A ruleset with both elements is identified');
			assert.deepEqual(contexts.getSchemaParts(pageview_schema), ['com.snowplowanalytics.snowplow', 'pageview', 'jsonschema', '1-0-1'], 'Gets correct parts for schema');
			assert.isTrue(contexts.matchSchemaAgainstRule('iglu:com.snowplowanalytics.snowplow/././.', pageview_schema), 'Matches schema against wildcarded rule');
			assert.isTrue(contexts.matchSchemaAgainstRuleSet(acceptRuleSet, pageview_schema), 'Accept ruleset accepts matching schema');
			assert.isFalse(contexts.matchSchemaAgainstRuleSet(rejectRuleSet, pageview_schema), 'Reject ruleset rejects matching schema');
		},

		"Identify filter functions": function () {

		},

		"Identify ruleset provider": function () {

		},

		"Identify filter provider": function () {

		},

		"Add global contexts": function () {

		},

		"Remove global contexts": function () {

		},

		"Clear global contexts": function () {

		}
	});

});
