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
	'intern/dojo/node!../../src/js/lib/helpers'
], function(registerSuite, assert, helpers) {

	registerSuite({

		name: 'Helpers test',

		'Get page title': function() {

			return this.remote
				.get(require.toUrl('tests/pages/helpers.html'))
				.setFindTimeout(5000)
				.findByCssSelector('body.loaded')
				.findById('title')
				.getVisibleText()
				.then(function (text) {
					assert.strictEqual(text, 'Helpers test page', 'Get the page title' );
				});
		},

		'Get host name': function() {

			return this.remote
				.get(require.toUrl('tests/pages/helpers.html'))
				.setFindTimeout(5000)
				.findByCssSelector('body.loaded')
				.findById('hostname')
				.getVisibleText()
				.then(function (text){
					assert.strictEqual(text, 'localhost', 'Get the host name');
				});
		},

		'Get referrer from querystring': function() {

			return this.remote
				.get(require.toUrl('tests/pages/helpers.html') + '?name=value&referrer=previous#fragment')
				.setFindTimeout(5000)
				.findByCssSelector('body.loaded')
				.findById('referrer')
				.getVisibleText()
				.then(function (text){
					assert.strictEqual(text, 'previous', 'Get the referrer from the querystring');
				});
		},

		'Add event listener': function() {

			return this.remote
				.get(require.toUrl('tests/pages/helpers.html'))
				.setFindTimeout(5000)
				.findByCssSelector('body.loaded')
				.findById('click')
				.click()
				.getVisibleText()
				.then(function (text){
					assert.strictEqual(text, 'clicked', 'Add a click event listener');
				});
		}
	});
});	
