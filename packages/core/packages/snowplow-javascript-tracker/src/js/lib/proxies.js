/*
 * JavaScript tracker for Snowplow: proxies.js
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

;(function(){

	var
		helpers = require('./helpers'),
		object = typeof exports !== 'undefined' ? exports : this;

	/*
	 * Test whether a string is an IP address
	 */
	function isIpAddress(string) {
		var IPRegExp = new RegExp('^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');
		return IPRegExp.test(string);
	}

	/*
	 * If the hostname is an IP address, look for text indicating
	 * that the page is cached by Yahoo
	 */
	function isYahooCachedPage(hostName) {
		var
			initialDivText,
			cachedIndicator;
		if (isIpAddress(hostName)) {
			try {
				initialDivText = document.body.children[0].children[0].children[0].children[0].children[0].children[0].innerHTML;
				cachedIndicator = 'You have reached the cached page for';
				return initialDivText.slice(0, cachedIndicator.length) === cachedIndicator; 
			} catch (e) {
				return false;
			}
		}
	}

	/*
	 * Extract parameter from URL
	 */
	function getParameter(url, name) {
		// scheme : // [username [: password] @] hostname [: port] [/ [path] [? query] [# fragment]]
		var e = new RegExp('^(?:https?|ftp)(?::/*(?:[^?]+))([?][^#]+)'),
			matches = e.exec(url),
			result = helpers.fromQuerystring(name, matches[1]);

		return result;
	}

	/*
	 * Fix-up URL when page rendered from search engine cache or translated page.
	 * TODO: it would be nice to generalise this and/or move into the ETL phase.
	 */
	object.fixupUrl = function (hostName, href, referrer) {

		if (hostName === 'translate.googleusercontent.com') {       // Google
			if (referrer === '') {
				referrer = href;
			}
			href = getParameter(href, 'u');
			hostName = helpers.getHostName(href);
		} else if (hostName === 'cc.bingj.com' ||                   // Bing
		hostName === 'webcache.googleusercontent.com' ||            // Google
		isYahooCachedPage(hostName)) {                         // Yahoo (via Inktomi 74.6.0.0/16)
			href = document.links[0].href;
			hostName = helpers.getHostName(href);
		}
		return [hostName, href, referrer];
	};

}());
