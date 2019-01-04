/*
 * JavaScript tracker for Snowplow: tests/payload.js
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
	'intern!object',
	'intern/chai!assert',
	'intern/dojo/node!../../lib/payload.js'
], function (registerSuite, assert, payload) {


	var sampleJson = {
		schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
		data: [
			{
				schema: "iglu:com.example_company/page/jsonschema/1-2-1",
				data: {
					pageType: 'test',
					lastUpdated: new Date(Date.UTC(2014, 1, 26))
				}
			},
			{
				schema: "iglu:com.example_company/user/jsonschema/2-0-0",
				data: {
					userType: 'tester'
				}
			}
		]
	};

	var expectedPayloads = [
		{co: '{"schema":"iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0","data":[{"schema":"iglu:com.example_company/page/jsonschema/1-2-1","data":{"pageType":"test","lastUpdated":"2014-02-26T00:00:00.000Z"}},{"schema":"iglu:com.example_company/user/jsonschema/2-0-0","data":{"userType":"tester"}}]}'},
		{cx: 'eyJzY2hlbWEiOiJpZ2x1OmNvbS5zbm93cGxvd2FuYWx5dGljcy5zbm93cGxvdy9jb250ZXh0cy9qc29uc2NoZW1hLzEtMC0wIiwiZGF0YSI6W3sic2NoZW1hIjoiaWdsdTpjb20uZXhhbXBsZV9jb21wYW55L3BhZ2UvanNvbnNjaGVtYS8xLTItMSIsImRhdGEiOnsicGFnZVR5cGUiOiJ0ZXN0IiwibGFzdFVwZGF0ZWQiOiIyMDE0LTAyLTI2VDAwOjAwOjAwLjAwMFoifX0seyJzY2hlbWEiOiJpZ2x1OmNvbS5leGFtcGxlX2NvbXBhbnkvdXNlci9qc29uc2NoZW1hLzItMC0wIiwiZGF0YSI6eyJ1c2VyVHlwZSI6InRlc3RlciJ9fV19'}
	];

	registerSuite({

		name: 'Payload test',

		'Identify a JSON': function () {
			var json = {
				'name': 'john',
				'properties': {
					'age': 30,
					'languages': ['English', 'French']
				}
			};

			assert.strictEqual(payload.isJson(json), true, 'JSON should be identified');
		},

		'Identify a non-JSON': function () {
			var nonJson = function () {};

			assert.strictEqual(payload.isJson(nonJson), false, 'Non-JSON should be rejected');
		},

		'Identify an empty JSON': function () {
			var emptyJson = {};

			assert.strictEqual(payload.isNonEmptyJson(emptyJson), false, '{} should be identified as empty');
		},

		'Build a payload': function () {
			var sb = payload.payloadBuilder(false);
			sb.add('e', 'pv');
			sb.add('tv', 'js-2.0.0');

			assert.deepEqual(sb.build(), {e: 'pv', tv: 'js-2.0.0'}, 'Individual name-value pairs should be added to the payload');
		},

		'Do not add undefined values to a payload': function () {
			var sb = payload.payloadBuilder(false);
			sb.add('e', undefined);

			assert.deepEqual(sb.build(), {}, 'Undefined values should not be added to the payload');
		},

		'Do not add null values to a payload': function () {
			var sb = payload.payloadBuilder(false);
			sb.add('e', null);

			assert.deepEqual(sb.build(), {}, 'Null values should not be added to the payload');
		},

		'Add a dictionary of name-value pairs to the payload': function () {
			var sb = payload.payloadBuilder(false);
			sb.addDict({
				'e': 'pv',
				'tv': 'js-2.0.0'
			});

			assert.deepEqual(sb.build(), {e: 'pv', tv: 'js-2.0.0'}, 'A dictionary of name-value pairs should be added to the payload');
		},

		'Add a JSON to the payload': function () {
			var sb = payload.payloadBuilder(false);
			sb.addJson('cx', 'co', sampleJson);

			assert.deepEqual(sb.build(), expectedPayloads[0], 'JSON should be added correctly');
		},

		'Add a base 64 encoded JSON to the payload': function () {
			var sb = payload.payloadBuilder(true);
			sb.addJson('cx', 'co', sampleJson);

			assert.deepEqual(sb.build(), expectedPayloads[1], 'JSON should be encoded correctly');
		}
	});
});
