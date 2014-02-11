/*
 * JavaScript tracker for Snowplow: context.js
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

/*
 * Does browser have cookies enabled (for this site)?
 */
SnowPlow.hasCookies = function(testCookieName) {
	var cookieName = testCookieName || 'testcookie';

	if (!SnowPlow.isDefined(SnowPlow.navigatorAlias.cookieEnabled)) {
		SnowPlow.setCookie(cookieName, '1');
		return SnowPlow.getCookie(cookieName) === '1' ? '1' : '0';
	}

	return SnowPlow.navigatorAlias.cookieEnabled ? '1' : '0';
}

/*
 * JS Implementation for browser fingerprint.
 * Does not require any external resources.
 * Based on https://github.com/carlo/jquery-browser-fingerprint
 * @return {number} 32-bit positive integer hash 
 */
SnowPlow.detectSignature = function(hashSeed) {

    var fingerprint = [
        navigator.userAgent,
        [ screen.height, screen.width, screen.colorDepth ].join("x"),
        ( new Date() ).getTimezoneOffset(),
        SnowPlow.hasSessionStorage(),
        SnowPlow.hasLocalStorage(),
    ];

    var plugins = [];
    if (navigator.plugins)
    {
        for(var i = 0; i < navigator.plugins.length; i++)
        {
            var mt = [];
            for(var j = 0; j < navigator.plugins[i].length; j++)
            {
                mt.push([navigator.plugins[i][j].type, navigator.plugins[i][j].suffixes]);
            }
            plugins.push([navigator.plugins[i].name + "::" + navigator.plugins[i].description, mt.join("~")]);
        }
    }
    return SnowPlow.murmurhash3_32_gc(fingerprint.join("###") + "###" + plugins.sort().join(";"), hashSeed);
}

/*
 * Returns visitor timezone
 */
SnowPlow.detectTimezone = function() {
	//var tz = require('jstimezonedetect').determine(); // For the online version
	var tz = require('../src/js/lib/jstz.js').determine();  
    	return (typeof (tz) === 'undefined') ? '' : tz.name();
}

/**
 * Gets the current viewport.
 *
 * Code based on:
 * - http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
 * - http://responsejs.com/labs/dimensions/
 */
SnowPlow.detectViewport = function() {
	var e = SnowPlow.windowAlias, a = 'inner';
	if (!('innerWidth' in SnowPlow.windowAlias)) {
		a = 'client';
		e = SnowPlow.documentAlias.documentElement || SnowPlow.documentAlias.body;
	}
	return e[a+'Width'] + 'x' + e[a+'Height'];
}

/**
 * Gets the dimensions of the current
 * document.
 *
 * Code based on:
 * - http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
 */
SnowPlow.detectDocumentSize = function() {
	var de = SnowPlow.documentAlias.documentElement; // Alias
	var w = Math.max(de.clientWidth, de.offsetWidth, de.scrollWidth);
	var h = Math.max(de.clientHeight, de.offsetHeight, de.scrollHeight);
	return w + 'x' + h;
}

/*
 * Returns browser features (plugins, resolution, cookies)
 */
SnowPlow.detectBrowserFeatures = function(testCookieName) {
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
	if (SnowPlow.navigatorAlias.mimeTypes && SnowPlow.navigatorAlias.mimeTypes.length) {
		for (i in pluginMap) {
			if (Object.prototype.hasOwnProperty.call(pluginMap, i)) {
				mimeType = SnowPlow.navigatorAlias.mimeTypes[pluginMap[i]];
				features[i] = (mimeType && mimeType.enabledPlugin) ? '1' : '0';
			}
		}
	}

	// Safari and Opera
	// IE6/IE7 navigator.javaEnabled can't be aliased, so test directly
	if (typeof navigator.javaEnabled !== 'unknown' &&
			SnowPlow.isDefined(SnowPlow.navigatorAlias.javaEnabled) &&
			SnowPlow.navigatorAlias.javaEnabled()) {
		features.java = '1';
	}

	// Firefox
	if (SnowPlow.isFunction(SnowPlow.windowAlias.GearsFactory)) {
		features.gears = '1';
	}

	// Other browser features
	features.res = SnowPlow.screenAlias.width + 'x' + SnowPlow.screenAlias.height;
	features.cd = screen.colorDepth;
	features.cookie = SnowPlow.hasCookies(testCookieName);

	return features;
}
