/*
 * JavaScript tracker for Snowplow: tests/nonfunctional/payload.js
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
	'intern/dojo/node!../../src/js/payload.js'
], function (registerSuite, assert, payload) {

	var 
		sampleJson = [
          {
            schema: "iglu://com.example_company/page/jsonschema/1-2-1",
            data: {
              pageType: 'test',
              lastUpdated: new Date(2014,1,26)
            }
          },
          {
            schema: "iglu://com.example_company/user/jsonschema/2-0-0",
            data: {
              userType: 'tester',
            }
          }
        ]
		expectedStrings = [
		'?e=pv&page=Asynchronous%20website%2Fwebapp%20examples%20for%20snowplow.js',
		'?co=%5B%7B%22schema%22%3A%22iglu%3A%2F%2Fcom.example_company%2Fpage%2Fjsonschema%2F1-2-1%22%2C%22data%22%3A%7B%22pageType%22%3A%22test%22%2C%22lastUpdated%22%3A%222014-02-26T00%3A00%3A00.000Z%22%7D%7D%2C%7B%22schema%22%3A%22iglu%3A%2F%2Fcom.example_company%2Fuser%2Fjsonschema%2F2-0-0%22%2C%22data%22%3A%7B%22userType%22%3A%22tester%22%7D%7D%5D',
		'?cx=W3sic2NoZW1hIjoiaWdsdTovL2NvbS5leGFtcGxlX2NvbXBhbnkvcGFnZS9qc29uc2NoZW1hLzEtMi0xIiwiZGF0YSI6eyJwYWdlVHlwZSI6InRlc3QiLCJsYXN0VXBkYXRlZCI6IjIwMTQtMDItMjZUMDA6MDA6MDAuMDAwWiJ9fSx7InNjaGVtYSI6ImlnbHU6Ly9jb20uZXhhbXBsZV9jb21wYW55L3VzZXIvanNvbnNjaGVtYS8yLTAtMCIsImRhdGEiOnsidXNlclR5cGUiOiJ0ZXN0ZXIifX1d'
		];

	registerSuite({

		name: 'Payload test',

		'Identify JSON': function() {
			var json = {
				'name': 'john',
				'properties': {
					'age': 30,
					'languages': ['English', 'French']
				}
			};

			assert.strictEqual(payload.isJson(json), true, 'JSON should be identified');
		},

		'Identify non-JSON': function() {
			var nonJson = function(){};

			assert.strictEqual(payload.isJson(nonJson), false, 'Non-JSON should be rejected');
		},

		'Identify empty JSON': function() {
			var emptyJson = {};

			assert.strictEqual(payload.isNonEmptyJson(emptyJson), false, 'Identify {} as empty')
		},

		'Build payload': function () {

			var sb = payload.payloadBuilder(false);
			sb.add('e', 'pv');
			sb.add('page', 'Asynchronous website/webapp examples for snowplow.js');

			assert.equal(sb.build(), expectedStrings[0], 'Text should be encoded correctly');
		},

		'Add JSON': function() {

			var sb = payload.payloadBuilder(false);

			sb.addJson('cx', 'co', sampleJson);

			assert.equal(sb.build(), expectedStrings[1], 'JSON should be added correctly');
		},

		'Base 64 encoding': function() {

			var sb = payload.payloadBuilder(true);

			sb.addJson('cx', 'co', sampleJson);

			assert.equal(sb.build(), expectedStrings[2], 'JSON should be encoded correctly');
		}
	});
});
