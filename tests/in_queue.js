/*
 * JavaScript tracker for Snowplow: tests/in_queue.js
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
	'intern/dojo/node!../src/js/in_queue'
], function(registerSuite, assert, in_queue) {

	var MockTracker = function () {
		var attribute = 10;
		return {
			increaseAttribute: function(n) {
				attribute += n;
			},
			setAttribute: function(p) {
				attribute = p;
			},
			getAttribute: function() {
				return attribute;
			}
		}
	};

	var mockTracker = MockTracker(),
		snaq = [['increaseAttribute', 5]];
	snaq = new in_queue.AsyncQueueProxy(mockTracker, snaq);

	registerSuite({
		name: 'queue test',
		'Make a proxy': function() {
			assert.equal(mockTracker.getAttribute(), 15, 'Function originally stored in snaq is executed when snaq becomes an AsyncQueueProxy');
		},

		'Add to snaq after conversion': function() {
			snaq.push(['setAttribute', 7]);
			assert.equal(mockTracker.getAttribute(), 7, 'Function added to snaq after it becomes an AsyncQueueProxy is executed');
		}
	});
});
