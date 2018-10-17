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

		"Identify primitive contexts": function () {
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
		}
	});

});
