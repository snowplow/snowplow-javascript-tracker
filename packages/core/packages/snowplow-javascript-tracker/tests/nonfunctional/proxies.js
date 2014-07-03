/*
 * JavaScript tracker for Snowplow: tests/nonfunctional/proxies.js
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
	"intern/dojo/node!../../src/js/lib/proxies"
], function(registerSuite, assert, proxies) {

	this.document = {
		links: [{href: "http://www.example.com/"}],
		body: {
			children: [{
				children: [{
					children: [{
						children: [{
							children: [{
								children: [{
									innerHTML: 'You have reached the cached page for'
								}]
							}]
						}]
					}]
				}]
			}]
		}
	};

	registerSuite({

		"name": "Proxies test",

		"Host name is not a special case": function() {

			var 
				initialLocationArray = ["normalhostname", "href", "http://referrer.com"],
				fixedupLocationArray = proxies.fixupUrl.apply(null, initialLocationArray),
				expectedLocationArray = fixedupLocationArray,
				i;

			for (i = 0; i < 3; i++) {
				assert.strictEqual(fixedupLocationArray[i], expectedLocationArray[i], 'Except in special cases, fixupUrl changes nothing');
			}
		},

		"Host name = 'translate.googleusercontent.com'": function() {
			var 
				initialLocationArray = [
					"translate.googleusercontent.com",
					"http://translate.googleusercontent.com/translate?hl=en&sl=fr&u=http:www.francais.fr/path",
					""],
				fixedupLocationArray = proxies.fixupUrl.apply(null, initialLocationArray),
				expectedLocationArray = [
					"www.francais.fr",
					"http:www.francais.fr/path",
					"http://translate.googleusercontent.com/translate?hl=en&sl=fr&u=http:www.francais.fr/path"],
				i;

			for (i = 0; i < 3; i++) {
				assert.strictEqual(fixedupLocationArray[i], expectedLocationArray[i], 'Get the URL for the untranslated page from the querystring and make the translated page the referrer');
			}
		},

		"Host name = 'ccj.bingj.com'": function() {
			var 
				initialLocationArray = [
					"cc.bingj.com",
					"http://cc.bingj.com/cache.aspx?q=example.com&d=4870936571937837&mkt=en-GB&setlang=en-GB&w=QyOPD1fo3C2nC9sXMLmUUs81Jt78MYIp",
					"http://referrer.com"],
				fixedupLocationArray = proxies.fixupUrl.apply(null, initialLocationArray),
				expectedLocationArray = [ "www.example.com", "http://www.example.com/", "http://referrer.com" ],
				i;

			for (i = 0; i < 3; i++) {
				assert.strictEqual(fixedupLocationArray[i], expectedLocationArray[i], 'On a page cached by Bing, get the original URL from the first link');
			}
		},

		"Host name = 'webcache.googleusercontent.com'": function() {
			var 
				initialLocationArray = [
					"webcache.googleusercontent.com",
					"http://webcache.googleusercontent.com/search?q=cache:http://example.com/#fragment",
					"http://referrer.com"],
				fixedupLocationArray = proxies.fixupUrl.apply(null, initialLocationArray),
				expectedLocationArray = [ "www.example.com", "http://www.example.com/", "http://referrer.com" ],
				i;

			for (i = 0; i < 3; i++) {
				assert.strictEqual(fixedupLocationArray[i], expectedLocationArray[i], 'On a page cached by Google, get the original URL from the first link');
			}
		},


		"Host name is an IP address": function() {
			var 
				initialLocationArray = [
					"98.139.21.31",
					"http://98.139.21.31/search/srpcache",
					"http://referrer.com"],
				fixedupLocationArray = proxies.fixupUrl.apply(null, initialLocationArray),
				expectedLocationArray = [ "www.example.com", "http://www.example.com/", "http://referrer.com" ],
				i;

			for (i = 0; i < 3; i++) {
				assert.strictEqual(fixedupLocationArray[i], expectedLocationArray[i], 'On a page cached by Yahoo, get the original URL from the first link');
			}
		}
	})
});
