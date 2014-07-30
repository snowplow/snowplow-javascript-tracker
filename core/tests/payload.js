/*
 * JavaScript tracker for Snowplow: tests/payload.js
 * 
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright 
 * 2012-2014 Snowplow Analytics Ltd. All rights reserved. 
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
	'intern/dojo/node!../lib/payload.js'
], function (registerSuite, assert, payload) {


	var sampleJson = {
		schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
		data: [
			{
				schema: "iglu:com.example_company/page/jsonschema/1-2-1",
				data: {
					pageType: 'test',
					lastUpdated: new Date(2014,1,26)
				}
			},
			{
            	schema: "iglu:com.example_company/user/jsonschema/2-0-0",
				data: {
					userType: 'tester',
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

		'Identify a JSON': function() {
			var json = {
				'name': 'john',
				'properties': {
					'age': 30,
					'languages': ['English', 'French']
				}
			};

			assert.strictEqual(payload.isJson(json), true, 'JSON should be identified');
		},

		'Identify a non-JSON': function() {
			var nonJson = function(){};

			assert.strictEqual(payload.isJson(nonJson), false, 'Non-JSON should be rejected');
		},

		'Identify an empty JSON': function() {
			var emptyJson = {};

			assert.strictEqual(payload.isNonEmptyJson(emptyJson), false, '{} should be identified as empty')
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
			})

			assert.deepEqual(sb.build(), {e: 'pv', tv: 'js-2.0.0'}, 'A dictionary of name-value pairs should be added to the payload');
		},

		'Add a JSON to the payload': function() {
			var sb = payload.payloadBuilder(false);
			sb.addJson('cx', 'co', sampleJson);

			assert.deepEqual(sb.build(), expectedPayloads[0], 'JSON should be added correctly');
		},

		'Add a base 64 encoded JSON to the payload': function() {
			var sb = payload.payloadBuilder(true);
			sb.addJson('cx', 'co', sampleJson);

			assert.deepEqual(sb.build(), expectedPayloads[1], 'JSON should be encoded correctly');
		}
	});
});
