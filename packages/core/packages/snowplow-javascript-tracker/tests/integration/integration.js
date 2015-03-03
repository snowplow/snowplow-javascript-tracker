/*
 * JavaScript tracker for Snowplow: tests/functional/helpers.js
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
	'intern/dojo/node!fs',
	'intern/dojo/node!querystring',
	'intern/dojo/node!lodash'
], function(registerSuite, assert, fs, querystring, lodash) {

	function parseLog () {
		return fs.readFileSync('./tracker.log', 'utf8').split('\n');
	}

	function querystringFromLine(line) {
		return line ? JSON.parse(line) : {};
	}

	function requestMatchesExpectedQuerystring(actual, expected) {
		if (!actual) {
			return false;
		}
		return !lodash.any(lodash.keys(expected), function (key) {
			if (expected[key] !== actual[key]) {
				return true;
			}
			return false;
		});
	}

	function checkExistenceOfExpectedQuerystring(expected) {
		var lines = parseLog();

		return lodash.any(lines, function (line) {
			if (requestMatchesExpectedQuerystring(querystringFromLine(line), expected)) {
				return true;
			}
			return false;
		});
	}

	registerSuite({

		name: 'Test that request_recorder logs meet expectations',

		'Check existence of page view in log': function() {
			assert.isTrue(checkExistenceOfExpectedQuerystring({
				e: 'pv',
				p: 'mob',
				aid: 'CFe23a',
				uid: 'Malcolm',
				page: 'My Title',
				cx: 'eyJzY2hlbWEiOiJpZ2x1OmNvbS5zbm93cGxvd2FuYWx5dGljcy5zbm93cGxvdy9jb250ZXh0cy9qc29uc2NoZW1hLzEtMC0wIiwiZGF0YSI6W3sic2NoZW1hIjoiaWdsdTpjb20uZXhhbXBsZV9jb21wYW55L3VzZXIvanNvbnNjaGVtYS8yLTAtMCIsImRhdGEiOnsidXNlclR5cGUiOiJ0ZXN0ZXIifX1dfQ'
			}), 'A page view should be detected');
		},

		'Check nonexistence of nonexistent event types in log': function() {
			assert.isFalse(checkExistenceOfExpectedQuerystring({
				e: 'ad'
			}), 'No nonexistent event type should be detected');
		},

		'Check a structured event was sent': function () {
			assert.isTrue(checkExistenceOfExpectedQuerystring({
				e: 'se',
				se_ca: 'Mixes',
				se_ac: 'Play',
				se_la: 'MRC/fabric-0503-mix',
				se_va: '0.0'
			}), 'A structured event should be detected');
		},

		'Check an unstructured event was sent': function () {
			assert.isTrue(checkExistenceOfExpectedQuerystring({
				e: 'ue',
				ue_px: 'eyJzY2hlbWEiOiJpZ2x1OmNvbS5zbm93cGxvd2FuYWx5dGljcy5zbm93cGxvdy91bnN0cnVjdF9ldmVudC9qc29uc2NoZW1hLzEtMC0wIiwiZGF0YSI6eyJzY2hlbWEiOiJpZ2x1OmNvbS5hY21lX2NvbXBhbnkvdmlld2VkX3Byb2R1Y3QvanNvbnNjaGVtYS81LTAtMCIsImRhdGEiOnsicHJvZHVjdElkIjoiQVNPMDEwNDMifX19'
			}), 'An unstructured event should be detected');
		},

		'Check a transaction event was sent': function () {
			assert.isTrue(checkExistenceOfExpectedQuerystring({
				e: 'tr',
				tr_id: 'order-123',
				tr_af: 'acme',
				tr_tt: '8000',
				tr_tx: '100',
				tr_ci: 'phoenix',
				tr_st: 'arizona',
				tr_co: 'USA',
				tr_cu: 'JPY'
			}), 'A transaction event should be detected');
		},

		'Check a transaction item event was sent': function () {
			assert.isTrue(checkExistenceOfExpectedQuerystring({
				e: 'ti',
				ti_id: 'order-123',
				ti_sk: '1001',
				ti_nm: 'Blue t-shirt',
				ti_ca: 'clothing',
				ti_pr: '2000',
				ti_qu: '2',
				ti_cu: 'JPY'
			}), 'A transaction item event should be detected');
		}
	});
});
