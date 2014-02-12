/*
 * JavaScript tracker for Snowplow: SnowPlow.js
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
 * UTF-8 encoding
 */
SnowPlow.encodeUtf8 = function (argString) {
	return SnowPlow.decodeUrl(SnowPlow.encodeWrapper(argString));
}

/**
 * Cleans up the page title
 */
SnowPlow.fixupTitle = function (title) {
	if (!Identifiers.isString(title)) {
		title = title.text || '';

		var tmp = SnowPlow.documentAlias.getElementsByTagName('title');
		if (tmp && Identifiers.isDefined(tmp[0])) {
			title = tmp[0].text;
		}
	}
	return title;
}

/*
 * Extract hostname from URL
 */
SnowPlow.getHostName = function (url) {
	// scheme : // [username [: password] @] hostname [: port] [/ [path] [? query] [# fragment]]
	var e = new RegExp('^(?:(?:https?|ftp):)/*(?:[^@]+@)?([^:/#]+)'),
		matches = e.exec(url);

	return matches ? matches[1] : url;
}

/*
 * Checks whether sessionStorage is available, in a way that
 * does not throw a SecurityError in Firefox if "always ask"
 * is enabled for cookies (https://github.com/snowplow/snowplow/issues/163).
 */
SnowPlow.hasSessionStorage = function () {
	try {
		return !!SnowPlow.windowAlias.sessionStorage;
	} catch (e) {
		return true; // SecurityError when referencing it means it exists
	}
}

/*
 * Checks whether localStorage is available, in a way that
 * does not throw a SecurityError in Firefox if "always ask"
 * is enabled for cookies (https://github.com/snowplow/snowplow/issues/163).
 */
SnowPlow.hasLocalStorage = function () {
	try {
		return !!SnowPlow.windowAlias.localStorage;
	} catch (e) {
		return true; // SecurityError when referencing it means it exists
	}
}


/*
 * Converts a date object to Unix timestamp with or without milliseconds
 */
SnowPlow.toTimestamp = function (date, milliseconds) {
	return milliseconds ? date / 1 : Math.floor(date / 1000);
}

/*
 * Converts a date object to Unix datestamp (number of days since epoch)
 */
SnowPlow.toDatestamp = function (date) {
	return Math.floor(date / 86400000);
}
  
/*
 * Fix-up URL when page rendered from search engine cache or translated page.
 * TODO: it would be nice to generalise this and/or move into the ETL phase.
 */
SnowPlow.fixupUrl = function (hostName, href, referrer) {
	/*
	 * Extract parameter from URL
	 */
	function getParameter(url, name) {
		// scheme : // [username [: password] @] hostname [: port] [/ [path] [? query] [# fragment]]
		var e = new RegExp('^(?:https?|ftp)(?::/*(?:[^?]+)[?])([^#]+)'),
			matches = e.exec(url),
			f = new RegExp('(?:^|&)' + name + '=([^&]*)'),
			result = matches ? f.exec(matches[1]) : 0;

		return result ? SnowPlow.decodeWrapper(result[1]) : '';
	}

	if (hostName === 'translate.googleusercontent.com') {		// Google
		if (referrer === '') {
			referrer = href;
		}
		href = getParameter(href, 'u');
		hostName = SnowPlow.getHostName(href);
	} else if (hostName === 'cc.bingj.com' ||					// Bing
			hostName === 'webcache.googleusercontent.com' ||	// Google
			hostName.slice(0, 5) === '74.6.') {					// Yahoo (via Inktomi 74.6.0.0/16)
		href = SnowPlow.documentAlias.links[0].href;
		hostName = SnowPlow.getHostName(href);
	}
	return [hostName, href, referrer];
}

/*
 * Fix-up domain
 */
SnowPlow.fixupDomain = function (domain) {
	var dl = domain.length;

	// remove trailing '.'
	if (domain.charAt(--dl) === '.') {
		domain = domain.slice(0, dl);
	}
	// remove leading '*'
	if (domain.slice(0, 2) === '*.') {
		domain = domain.slice(1);
	}
	return domain;
}

/*
 * Get page referrer
 */
SnowPlow.getReferrer = function () {

	var referrer = '';
	
	var fromQs = SnowPlow.fromQuerystring('referrer', SnowPlow.windowAlias.location.href) ||
	SnowPlow.fromQuerystring('referer', SnowPlow.windowAlias.location.href);

	// Short-circuit
	if (fromQs) {
		return fromQs;
	}

	try {
		referrer = SnowPlow.windowAlias.top.document.referrer;
	} catch (e) {
		if (SnowPlow.windowAlias.parent) {
			try {
				referrer = SnowPlow.windowAlias.parent.document.referrer;
			} catch (e2) {
				referrer = '';
			}
		}
	}
	if (referrer === '') {
		referrer = SnowPlow.documentAlias.referrer;
	}
	return referrer;
}

/*
 * Cross-browser helper function to add event handler
 */
SnowPlow.addEventListener = function (element, eventType, eventHandler, useCapture) {
	if (element.addEventListener) {
		element.addEventListener(eventType, eventHandler, useCapture);
		return true;
	}
	if (element.attachEvent) {
		return element.attachEvent('on' + eventType, eventHandler);
	}
	element['on' + eventType] = eventHandler;
}

/*
 * Call plugin hook methods
 */
SnowPlow.executePluginMethod = function (methodName, callback) {
	var result = '',
			i,
			pluginMethod;

	for (i in SnowPlow.plugins) {
		if (Object.prototype.hasOwnProperty.call(SnowPlow.plugins, i)) {
			pluginMethod = SnowPlow.plugins[i][methodName];
			if (Identifiers.isFunction(pluginMethod)) {
				result += pluginMethod(callback);
			}
		}
	}

	return result;
}

/*
 * Return value from name-value pair in querystring 
 */
SnowPlow.fromQuerystring = function (field, url) {
	var match = RegExp('[?&]' + field + '=([^&]*)').exec(url);
	if (!match) {
		return null;
	}
	return SnowPlow.decodeWrapper(match[1].replace(/\+/g, ' '));
}

SnowPlow.murmurhash3_32_gc = require('murmurhash').v3;
