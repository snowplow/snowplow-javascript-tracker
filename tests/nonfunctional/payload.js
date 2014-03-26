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
		sampleJson = {
			page: {
				page_type: 'test',
				last_updated: new Date(2014,1,26)
			},
			user: {
				user_type: 'tester'
			}
		},
		expectedStrings = [
		'?e=pv&page=Asynchronous%20website%2Fwebapp%20examples%20for%20snowplow.js',
		'?co=%7B%22page%22%3A%7B%22page_type%22%3A%22test%22%2C%22last_updated%24tms%22%3A1393372800000%7D%2C%22user%22%3A%7B%22user_type%22%3A%22tester%22%7D%7D',
		'?cx=eyJwYWdlIjp7InBhZ2VfdHlwZSI6InRlc3QiLCJsYXN0X3VwZGF0ZWQkdG1zIjoxMzkzMzcyODAwMDAwfSwidXNlciI6eyJ1c2VyX3R5cGUiOiJ0ZXN0ZXIifX0'
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
			var nonJson = [1,2,3];

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
