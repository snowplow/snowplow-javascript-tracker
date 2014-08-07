/*
 * JavaScript tracker for Snowplow: tests/functional/detectors.js
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
	'intern/dojo/node!../../src/js/lib/helpers'
], function(registerSuite, assert, helpers) {

	var 
		// Expected viewport dimensions vary based on browser
		expectedViewportWidths = [980, 996, 1024],
		expectedViewportHeights = [636, 644, 667, 670, 673, 684, 695, 705, 706, 712],

		// User fingerprint varies based on browser features
		// TODO: try to hash this off the useragent - 
		// i.e. formal 1:1 relationship between viewport or signature and an individual browser
		expectedSignatures = [
			3343029130, // IE9 Windows
			1101697779, // IE10
			154466408,  // IE11
			2557409154, // Firefox 27.0 Mac
			1076144906, // Firefox 27.0 XP
			3900377526, // Firefox 27.0 Linux
			705067259,  // Chrome 32.0 Mac OS X
			4229530558, // Chrome 32.0 Windows NT
			3773734853, // Chrome 32.0 Linux
			3339203264, // Safari 7.0 Mac
			3166667154  // Safari 6.0.5 Mac
		];

	registerSuite({

		name: 'Detectors test',

		'Get viewport dimensions': function() {

			return this.remote
				.get(require.toUrl('tests/pages/detectors.html'))
				.waitForElementByCssSelector('body.loaded', 5000)
				.elementById('detectViewport')
				.text()
				.then(function (text) {
					var dimensions = text.split('x');
					assert.include(expectedViewportWidths, parseInt(dimensions[0]), 'Viewport width is valid');
					assert.include(expectedViewportHeights, parseInt(dimensions[1]), 'Viewport height is valid');
				});
		},

		'Check localStorage availability': function() {

			return this.remote
				.get(require.toUrl('tests/pages/detectors.html'))
				.waitForElementByCssSelector('body.loaded', 5000)
				.elementById('localStorageAccessible')
				.text()
				.then(function (text) {
					assert.strictEqual(text, 'true', 'Detect localStorage accessibility');
				});
		},

		'Check sessionStorage availability': function() {

			return this.remote
				.get(require.toUrl('tests/pages/detectors.html'))
				.waitForElementByCssSelector('body.loaded', 5000)
				.elementById('hasSessionStorage')
				.text()
				.then(function (text) {
					assert.strictEqual(text, 'true', 'Detect sessionStorage');
				});
		},

		'Check whether cookies are enabled': function() {

			return this.remote
				.get(require.toUrl('tests/pages/detectors.html'))
				.waitForElementByCssSelector('body.loaded', 5000)
				.elementById('hasCookies')
				.text()
				.then(function (text) {
					assert.equal(text, '1', 'Detect whether cookies can be set');
				});
		},

		'Detect timezone': function() {

			return this.remote
				.get(require.toUrl('tests/pages/detectors.html'))
				.waitForElementByCssSelector('body.loaded', 5000)
				.elementById('detectTimezone')
				.text()
				.then(function (text) {
					assert.include(['UTC', 'America/Los_Angeles'], text, 'Detect the timezone');
				});
		},

		'User fingerprinting': function() {

			return this.remote
				.get(require.toUrl('tests/pages/detectors.html'))
				.waitForElementByCssSelector('body.loaded', 5000)
				.elementById('detectSignature')
				.text()
				.then(function (text) {
					assert.include(expectedSignatures, parseInt(text), 'Create a user fingerprint based on browser features');
				});
		}
	});
});
