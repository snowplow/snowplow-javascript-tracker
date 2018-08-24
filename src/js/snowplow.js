/*
 * JavaScript tracker for Snowplow: snowplow.js
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

/*jslint browser:true, plusplus:true, vars:true, nomen:true, evil:true */
/*global window */
/*global unescape */
/*global ActiveXObject */
/*global _snaq:true */
/*members encodeURIComponent, decodeURIComponent, getElementsByTagName,
	shift, unshift,
	addEventListener, attachEvent, removeEventListener, detachEvent,
	cookie, domain, readyState, documentElement, doScroll, title, text,
	location, top, document, referrer, parent, links, href, protocol, GearsFactory,
	event, which, button, srcElement, type, target,
	parentNode, tagName, hostname, className,
	userAgent, cookieEnabled, platform, mimeTypes, enabledPlugin, javaEnabled,
	XDomainRequest, XMLHttpRequest, ActiveXObject, open, setRequestHeader, onreadystatechange, setRequestHeader, send, readyState, status,
	getTime, getTimeAlias, setTime, toGMTString, getHours, getMinutes, getSeconds,
	toLowerCase, charAt, indexOf, lastIndexOf, split, slice, toUpperCase,
	onload, src,
	round, random,
	exec,
	res, width, height,
	pdf, qt, realp, wma, dir, fla, java, gears, ag,
	hook, getHook,
	setCollectorCf, setCollectorUrl, setAppId,
	setDownloadExtensions, addDownloadExtensions,
	setDomains, setIgnoreClasses, setRequestMethod,
	setReferrerUrl, setCustomUrl, setDocumentTitle,
	setDownloadClasses, setLinkClasses,
	discardHashTag,
	setCookieNamePrefix, setCookieDomain, setCookiePath, setVisitorIdCookie,
	setVisitorCookieTimeout, setSessionCookieTimeout, setReferralCookieTimeout,
	doNotTrack, respectDoNotTrack, msDoNotTrack, getTimestamp, getCookieValue,
	detectTimezone, detectViewport,
	addListener, enableLinkTracking, enableActivityTracking, setLinkTrackingTimer,
	enableDarkSocialTracking,
	killFrame, redirectFile, setCountPreRendered,
	trackLink, trackPageView, trackImpression,
	addPlugin, getAsyncTracker
*/

;(function() {

	// Load all our modules (at least until we fully modularize & remove grunt-concat)
	var
		uuid = require('uuid'),
		lodash = require('./lib_managed/lodash'),
		helpers = require('./lib/helpers'),
		queue = require('./in_queue'),
		tracker = require('./tracker'),

		object = typeof exports !== 'undefined' ? exports : this; // For eventual node.js environment support

	object.Snowplow = function(asynchronousQueue, functionName) {

		var
			documentAlias = document,
			windowAlias = window,

			/* Tracker identifier with version */
			version = 'js-' + '<%= pkg.version %>', // Update banner.js too

			pageViewId = uuid.v4(),

			/* Contains four variables that are shared with tracker.js and must be passed by reference */
			mutSnowplowState = {

				/* List of request queues - one per Tracker instance */
				outQueues: [],
				bufferFlushers: [],

				/* Time at which to stop blocking excecution */
				expireDateTime: null,

				/* DOM Ready */
				hasLoaded: false,
				registeredOnLoadHandlers: []
			};

		/************************************************************
		 * Private methods
		 ************************************************************/


		/*
		 * Handle beforeunload event
		 *
		 * Subject to Safari's "Runaway JavaScript Timer" and
		 * Chrome V8 extension that terminates JS that exhibits
		 * "slow unload", i.e., calling getTime() > 1000 times
		 */
		function beforeUnloadHandler() {
			var now;

			// Flush all POST queues
			lodash.forEach(mutSnowplowState.bufferFlushers, function (flusher) {
				flusher();
			})

			/*
			 * Delay/pause (blocks UI)
			 */
			if (mutSnowplowState.expireDateTime) {
				// the things we do for backwards compatibility...
				// in ECMA-262 5th ed., we could simply use:
				//     while (Date.now() < mutSnowplowState.expireDateTime) { }
				do {
					now = new Date();
					if (lodash.filter(mutSnowplowState.outQueues, function (queue) {
						return queue.length > 0;
					}).length === 0) {
						break;
					}
				} while (now.getTime() < mutSnowplowState.expireDateTime);
			}
		}

		/*
		 * Handler for onload event
		 */
		function loadHandler() {
			var i;

			if (!mutSnowplowState.hasLoaded) {
				mutSnowplowState.hasLoaded = true;
				for (i = 0; i < mutSnowplowState.registeredOnLoadHandlers.length; i++) {
					mutSnowplowState.registeredOnLoadHandlers[i]();
				}
			}
			return true;
		}

		/*
		 * Add onload or DOM ready handler
		 */
		function addReadyListener() {
			var _timer;

			if (documentAlias.addEventListener) {
				helpers.addEventListener(documentAlias, 'DOMContentLoaded', function ready() {
					documentAlias.removeEventListener('DOMContentLoaded', ready, false);
					loadHandler();
				});
			} else if (documentAlias.attachEvent) {
				documentAlias.attachEvent('onreadystatechange', function ready() {
					if (documentAlias.readyState === 'complete') {
						documentAlias.detachEvent('onreadystatechange', ready);
						loadHandler();
					}
				});

				if (documentAlias.documentElement.doScroll && windowAlias === windowAlias.top) {
					(function ready() {
						if (!mutSnowplowState.hasLoaded) {
							try {
								documentAlias.documentElement.doScroll('left');
							} catch (error) {
								setTimeout(ready, 0);
								return;
							}
							loadHandler();
						}
					}());
				}
			}

			// sniff for older WebKit versions
			if ((new RegExp('WebKit')).test(navigator.userAgent)) {
				_timer = setInterval(function () {
					if (mutSnowplowState.hasLoaded || /loaded|complete/.test(documentAlias.readyState)) {
						clearInterval(_timer);
						loadHandler();
					}
				}, 10);
			}

			// fallback
			helpers.addEventListener(windowAlias, 'load', loadHandler, false);
		}

		/************************************************************
		 * Public data and methods
		 ************************************************************/

		windowAlias.Snowplow = {

			/**
			 * Returns a Tracker object, configured with a
			 * CloudFront collector.
			 *
			 * @param string distSubdomain The subdomain on your CloudFront collector's distribution
			 */
			getTrackerCf: function (distSubdomain) {
				var t = new tracker.Tracker(functionName, '', version, pageViewId, mutSnowplowState, {});
				t.setCollectorCf(distSubdomain);
				return t;
			},

			/**
			 * Returns a Tracker object, configured with the
			 * URL to the collector to use.
			 *
			 * @param string rawUrl The collector URL minus protocol and /i
			 */
			getTrackerUrl: function (rawUrl) {
				var t = new tracker.Tracker(functionName, '', version, pageViewId, mutSnowplowState, {});
				t.setCollectorUrl(rawUrl);
				return t;
			},

			/**
			 * Get internal asynchronous tracker object
			 *
			 * @return Tracker
			 */
			getAsyncTracker: function () {
				return new tracker.Tracker(functionName, '', version, pageViewId, mutSnowplowState, {});
			}
		};

		/************************************************************
		 * Constructor
		 ************************************************************/

		// initialize the Snowplow singleton
		helpers.addEventListener(windowAlias, 'beforeunload', beforeUnloadHandler, false);
		addReadyListener();

		// Now replace initialization array with queue manager object
		return new queue.InQueueManager(tracker.Tracker, version, pageViewId, mutSnowplowState, asynchronousQueue, functionName);
	};

}());
