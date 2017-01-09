/*
 * JavaScript tracker core for Snowplow: tests/base64.js
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
	"intern/dojo/node!../../lib/base64.js"
], function (registerSuite, assert, base64) {

	registerSuite({
		name: "Base 64 encoding test",
		"Encode a string": function () {
			assert.strictEqual(base64.base64encode('my_string'), 'bXlfc3RyaW5n', 'Base64-encode a string');
		},

		"Encode a string containing special characters": function () {
			assert.strictEqual(base64.base64encode('™®字'), '4oSiwq7lrZc=', 'Base64-encode a containing TM, Registered Trademark, and Chinese characters');
		}
	});
});
