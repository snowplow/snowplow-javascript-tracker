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
	'intern/chai!assert'
], function(registerSuite, assert) {

	var 
		// Expected viewport dimensions vary based on browser
		expectedViewportWidths = [
			996,
			1008,	// Windows 8, Windows 8.1
			1016,	// Linux, Firefox 27
			1014,	// Windows 7, Chrome 32
			1022,
			1024,	// Windows 7, IE 9, Firefox 27; Mac OS, Safari
			1020	// Windows 8, Windows 8.1
		],
		expectedViewportHeights = [
			660,	// Firefox 27.0, Linux
			632,	// Firefox 27.0, Linux
			658,	// Firefox 27.0, Windows 7
			666,
			670,	// Safari 6/7
			687,	// Windows 7, IE 9
			694,	// Chrome 32, Windows 7 - 707
			695,	// Windows 7, IE 9
			686,	// Chrome 32, Linux - 686
			705,	// Windows 8/8.1
			717		// Windows 8/8.1
		],

		// User fingerprint varies based on browser features
		// TODO: try to hash this off the useragent - 
		// i.e. formal 1:1 relationship between viewport or signature and an individual browser
		expectedSignatures = [
			1587753772, // IE9, Windows 7
			1101697779, // IE10, Windows 8
			645783373,  // IE11, Windows 8
			580945094,  // Firefox 27.0, Windows 7
			1382842778, // Firefox 27.0, Linux
			1727588738, // Chrome 32.0, Windows 7
			3978691790, // Chrome 32.0, Linux
			3552180943, // Safari 7, OS X 10.9
			812921052   // Safari 6.2.7 Mac OS X 10.8
		];

	registerSuite({

		name: 'Detectors test',

		// These tests don't work as intended.
		// I tend to blame SauceLabs on this, because it can fail on one of two subsequent runs
		// on equal environments, while these functions are fully deterministic.
		//
		// 'Get viewport dimensions': function() {
		//
		// 	return this.remote
		// 		.get(require.toUrl('tests/pages/detectors.html'))
		// 		.setFindTimeout(5000)
		// 		.setWindowSize(1024, 768)
		// 		.findByCssSelector('body.loaded')
		// 		.findById('detectViewport')
		// 		.getVisibleText()
		// 		.then(function (text) {
		// 			var dimensions = text.split('x');
		// 			assert.include(expectedViewportWidths, parseInt(dimensions[0]), 'Viewport width is valid');
		// 			assert.include(expectedViewportHeights, parseInt(dimensions[1]), 'Viewport height is valid');
		// 		});
		// },
		//
		// 'Detect document size': function () {
		// 	return this.remote
		// 		.get(require.toUrl('tests/pages/detectors.html'))
		// 		.setFindTimeout(5000)
		// 		.setWindowSize(1024, 768)
		// 		.findByCssSelector('body.loaded')
		// 		.findById('detectDocumentDimensions')
		// 		.getVisibleText()
		// 		.then(function (text) {
		// 			var dimensions = text.split('x');
		// 			assert.include(expectedViewportWidths, parseInt(dimensions[0]), 'Document width is valid');
		// 			assert.include(expectedViewportHeights, parseInt(dimensions[1]), 'Document height is valid');
		// 		});
		// },
		//
		// 'User fingerprinting': function() {
		//
		//	return this.remote
		//		.get(require.toUrl('tests/pages/detectors.html'))
		//		.setFindTimeout(5000)
		//		.setWindowSize(1024, 768)
		//		.findByCssSelector('body.loaded')
		//		.findById('detectSignature')
		//		.getVisibleText()
		//		.then(function (text) {
		//			assert.include(expectedSignatures, parseInt(text), 'Create a user fingerprint based on browser features');
		//		});
		// },

		'Check localStorage availability': function() {

			return this.remote
				.get(require.toUrl('tests/pages/detectors.html'))
				.setFindTimeout(5000)
				.findByCssSelector('body.loaded')
				.findById('localStorageAccessible')
				.getVisibleText()
				.then(function (text) {
					assert.strictEqual(text, 'true', 'Detect localStorage accessibility');
				});
		},

		'Check sessionStorage availability': function() {

			return this.remote
				.get(require.toUrl('tests/pages/detectors.html'))
				.setFindTimeout(5000)
				.findByCssSelector('body.loaded')
				.findById('hasSessionStorage')
				.getVisibleText()
				.then(function (text) {
					assert.strictEqual(text, 'true', 'Detect sessionStorage');
				});
		},

		'Check whether cookies are enabled': function() {

			return this.remote
				.get(require.toUrl('tests/pages/detectors.html'))
				.setFindTimeout(5000)
				.findByCssSelector('body.loaded')
				.findById('hasCookies')
				.getVisibleText()
				.then(function (text) {
					assert.equal(text, '1', 'Detect whether cookies can be set');
				});
		},

		'Detect timezone': function() {

			return this.remote
				.get(require.toUrl('tests/pages/detectors.html'))
				.setFindTimeout(5000)
				.findByCssSelector('body.loaded')
				.findById('detectTimezone')
				.getVisibleText()
				.then(function (text) {
					assert.include(['UTC', 'America/Los_Angeles'], text, 'Detect the timezone');
				});
		},

		'Browser features': function() {

			return this.remote
				.get(require.toUrl('tests/pages/detectors.html'))
				.setFindTimeout(5000)
				.findByCssSelector('body.loaded')
				.findById('detectBrowserFeatures')
				.getVisibleText()
				.then(function (text) {
					var features = JSON.parse(text);
					// The only features which are the same for all tested browsers
					assert.equal('1', features.java, 'Detect Java');
					assert.equal(24, features.cd, 'Detect color depth');
				});
		}
	});
});
