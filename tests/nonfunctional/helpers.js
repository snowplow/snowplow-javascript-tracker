/*
 * JavaScript tracker for Snowplow: tests/nonfunctional/helpers.js
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
	"intern!object",
	"intern/chai!assert",
	"intern/dojo/node!../../src/js/lib/helpers"
], function (registerSuite, assert, helpers) {

	var decorateQuerystring = helpers.decorateQuerystring;

	registerSuite({
		name: "decorateQuerystring test",
		"Decorate a URL with no querystring or fragment": function () {
			var url = 'http://www.example.com';
			var expected = 'http://www.example.com?_sp=a.b';
			var actual = decorateQuerystring(url, '_sp', 'a.b');
			assert.equal(actual, expected);
		},

		"Decorate a URL with a fragment but no querystring": function () {
			var url = 'http://www.example.com#fragment';
			var expected = 'http://www.example.com?_sp=a.b#fragment';
			var actual = decorateQuerystring(url, '_sp', 'a.b');
			assert.equal(actual, expected);
		},

		"Decorate a URL with an empty querystring": function () {
			var url = 'http://www.example.com?';
			var expected = 'http://www.example.com?_sp=a.b';
			var actual = decorateQuerystring(url, '_sp', 'a.b');
			assert.equal(actual, expected);
		},

		"Decorate a URL with a nonempty querystring": function () {
			var url = 'http://www.example.com?name=value';
			var expected = 'http://www.example.com?_sp=a.b&name=value';
			var actual = decorateQuerystring(url, '_sp', 'a.b');
			assert.equal(actual, expected);
		},

		"Override an existing field": function () {
			var url = 'http://www.example.com?_sp=outdated';
			var expected = 'http://www.example.com?_sp=a.b';
			var actual = decorateQuerystring(url, '_sp', 'a.b');
			assert.equal(actual, expected);
		},

		"Decorate a URL whose querystring contains multiple question marks": function () {
			var url = 'http://www.example.com?test=working?&name=value';
			var expected = 'http://www.example.com?_sp=a.b&test=working?&name=value';
			var actual = decorateQuerystring(url, '_sp', 'a.b');
			assert.equal(actual, expected);
		},

		"Override a field in a querystring containing a question mark": function () {
			var url = 'http://www.example.com?test=working?&_sp=outdated';
			var expected = 'http://www.example.com?test=working?&_sp=a.b';
			var actual = decorateQuerystring(url, '_sp', 'a.b');
			assert.equal(actual, expected);
		},

		"Decorate a querystring with multiple ?s and #s": function () {
			var url = 'http://www.example.com?test=working?&_sp=outdated?&?name=value#fragment?#?#';
			var expected = 'http://www.example.com?test=working?&_sp=a.b&?name=value#fragment?#?#';
			var actual = decorateQuerystring(url, '_sp', 'a.b');
			assert.equal(actual, expected);
		},
	});

	registerSuite({
		name: "getCssClasses test",
		"Tokenize a DOM element's className field": function () {
			var element = {
				className: '   the  quick   brown_fox-jumps/over\nthe\t\tlazy   dog  '
			};
			var expected = ['the', 'quick', 'brown_fox-jumps/over', 'the', 'lazy', 'dog'];
			var actual = helpers.getCssClasses(element);
			assert.deepEqual(actual, expected);
		},
	});
});
