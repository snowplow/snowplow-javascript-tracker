/*
 * JavaScript tracker for Snowplow: detectors.js
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

;(function() {

	var 
		lodash = require('../lib_managed/lodash'),
		murmurhash3_32_gc = require('murmurhash').v3,
		tz = require('jstimezonedetect').jstz.determine(),
		cookie = require('browser-cookie-lite'),

		object = typeof exports !== 'undefined' ? exports : this, // For eventual node.js environment support
		
		windowAlias = window,
		navigatorAlias = navigator,
		screenAlias = screen,
		documentAlias = document;

	/*
	 * Checks whether sessionStorage is available, in a way that
	 * does not throw a SecurityError in Firefox if "always ask"
	 * is enabled for cookies (https://github.com/snowplow/snowplow/issues/163).
	 */
	object.hasSessionStorage = function () {
		try {
			return !!windowAlias.sessionStorage;
		} catch (e) {
			return true; // SecurityError when referencing it means it exists
		}
	};

	/*
	 * Checks whether localStorage is available, in a way that
	 * does not throw a SecurityError in Firefox if "always ask"
	 * is enabled for cookies (https://github.com/snowplow/snowplow/issues/163).
	 */
	object.hasLocalStorage = function () {
		try {
			return !!windowAlias.localStorage;
		} catch (e) {
			return true; // SecurityError when referencing it means it exists
		}
	};

	/*
	 * Checks whether localStorage is accessible
	 * sets and removes an item to handle private IOS5 browsing
	 * (http://git.io/jFB2Xw)
	 */
	object.localStorageAccessible = function() {
		var mod = 'modernizr';
		if (!object.hasLocalStorage()) {
			return false;
		}
		try {
			windowAlias.localStorage.setItem(mod, mod);
			windowAlias.localStorage.removeItem(mod);
			return true;
		} catch(e) {
			return false;
		}
	 };

	/*
	 * Does browser have cookies enabled (for this site)?
	 */
	object.hasCookies = function(testCookieName) {
		var cookieName = testCookieName || 'testcookie';

		if (lodash.isUndefined(navigatorAlias.cookieEnabled)) {
			cookie.cookie(cookieName, '1');
			return cookie.cookie(cookieName) === '1' ? '1' : '0';
		}

		return navigatorAlias.cookieEnabled ? '1' : '0';
	};

	/**
	 * JS Implementation for browser fingerprint.
	 * Does not require any external resources.
	 * Based on https://github.com/carlo/jquery-browser-fingerprint
	 * @return {number} 32-bit positive integer hash 
	 */
	object.detectSignature = function(hashSeed) {

		var fingerprint = [
			navigatorAlias.userAgent,
			[ screenAlias.height, screenAlias.width, screenAlias.colorDepth ].join("x"),
			( new Date() ).getTimezoneOffset(),
			object.hasSessionStorage(),
			object.hasLocalStorage()
		];

		var plugins = [];
		if (navigatorAlias.plugins)
		{
			for(var i = 0; i < navigatorAlias.plugins.length; i++)
			{
				var mt = [];
				for(var j = 0; j < navigatorAlias.plugins[i].length; j++)
				{
					mt.push([navigatorAlias.plugins[i][j].type, navigatorAlias.plugins[i][j].suffixes]);
				}
				plugins.push([navigatorAlias.plugins[i].name + "::" + navigatorAlias.plugins[i].description, mt.join("~")]);
			}
		}
		return murmurhash3_32_gc(fingerprint.join("###") + "###" + plugins.sort().join(";"), hashSeed);
	};

	/*
	 * Returns visitor timezone
	 */
	object.detectTimezone = function() {
		return (typeof (tz) === 'undefined') ? '' : tz.name();
	};

	/**
	 * Gets the current viewport.
	 *
	 * Code based on:
	 * - http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
	 * - http://responsejs.com/labs/dimensions/
	 */
	object.detectViewport = function() {
		var e = windowAlias, a = 'inner';
		if (!('innerWidth' in windowAlias)) {
			a = 'client';
			e = documentAlias.documentElement || documentAlias.body;
		}
		return e[a+'Width'] + 'x' + e[a+'Height'];
	};

	/**
	 * Gets the dimensions of the current
	 * document.
	 *
	 * Code based on:
	 * - http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
	 */
	object.detectDocumentSize = function() {
		var de = documentAlias.documentElement, // Alias
			be = documentAlias.body,

			// document.body may not have rendered, so check whether be.offsetHeight is null
			bodyHeight = be ? Math.max(be.offsetHeight, be.scrollHeight) : 0;
		var w = Math.max(de.clientWidth, de.offsetWidth, de.scrollWidth);
		var h = Math.max(de.clientHeight, de.offsetHeight, de.scrollHeight, bodyHeight);
		return isNaN(w) || isNaN(h) ? '' : w + 'x' + h;
	};

	/**
	 * Returns browser features (plugins, resolution, cookies)
	 *
	 * @param boolean useCookies Whether to test for cookies
	 * @param string testCookieName Name to use for the test cookie
	 * @return Object containing browser features
	 */
	object.detectBrowserFeatures = function(useCookies, testCookieName) {
		var i,
			mimeType,
			pluginMap = {
				// document types
				pdf: 'application/pdf',

				// media players
				qt: 'video/quicktime',
				realp: 'audio/x-pn-realaudio-plugin',
				wma: 'application/x-mplayer2',

				// interactive multimedia
				dir: 'application/x-director',
				fla: 'application/x-shockwave-flash',

				// RIA
				java: 'application/x-java-vm',
				gears: 'application/x-googlegears',
				ag: 'application/x-silverlight'
			},
			features = {};

		// General plugin detection
		if (navigatorAlias.mimeTypes && navigatorAlias.mimeTypes.length) {
			for (i in pluginMap) {
				if (Object.prototype.hasOwnProperty.call(pluginMap, i)) {
					mimeType = navigatorAlias.mimeTypes[pluginMap[i]];
					features[i] = (mimeType && mimeType.enabledPlugin) ? '1' : '0';
				}
			}
		}

		// Safari and Opera
		// IE6/IE7 navigator.javaEnabled can't be aliased, so test directly
		if (typeof navigatorAlias.javaEnabled !== 'unknown' &&
				!lodash.isUndefined(navigatorAlias.javaEnabled) &&
				navigatorAlias.javaEnabled()) {
			features.java = '1';
		}

		// Firefox
		if (lodash.isFunction(windowAlias.GearsFactory)) {
			features.gears = '1';
		}

		// Other browser features
		features.res = screenAlias.width + 'x' + screenAlias.height;
		features.cd = screenAlias.colorDepth;
		if (useCookies) {
			features.cookie = object.hasCookies(testCookieName);
		}

		return features;
	};

}());
