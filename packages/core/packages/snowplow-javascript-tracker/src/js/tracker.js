/*
 * JavaScript tracker for Snowplow: tracker.js
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
		lodash = require('./lib/lodash'),
		helpers = require('./lib/helpers'),
		cookie = require('./lib/cookie'),
		detectors = require('./lib/detectors'),
		payload = require('./payload'),
		json2 = require('JSON'),
		sha1 = require('sha1'),

		object = typeof exports !== 'undefined' ? exports : this; // For eventual node.js environment support

	/*
	 * Snowplow Tracker class
	 *
	 * @param version The current version of the JavaScript Tracker
	 *
	 * @param mutSnowplowState An object containing hasLoaded, registeredOnLoadHandlers, and expireDateTime
	 * Passed in by reference in case they are altered by snowplow.js
	 *
	 * Takes an argmap as its sole parameter. Argmap supports:
	 *
	 * 1. Empty             - to initialize an Async Tracker
	 * 2. {cf: 'subdomain'} - to initialize a Sync Tracker with
	 *                        a CloudFront-based collector 
	 * 3. {url: 'rawurl'}   - to initialize a Sync Tracker with a
	 *                        URL-based collector
	 *
	 * See also: Tracker.setCollectorUrl() and Tracker.setCollectorCf()
	 */
	object.Tracker = function Tracker(version, mutSnowplowState, argmap) {

		/************************************************************
		 * Private members
		 ************************************************************/

		var
			// Aliases
			documentAlias = document,
			windowAlias = window,
			navigatorAlias = navigator,

			// Current URL and Referrer URL
			locationArray = helpers.fixupUrl(documentAlias.domain, windowAlias.location.href, helpers.getReferrer()),
			domainAlias = helpers.fixupDomain(locationArray[0]),
			locationHrefAlias = locationArray[1],
			configReferrerUrl = locationArray[2],

			// Request method is always GET for Snowplow
			configRequestMethod = 'GET',

			// Platform defaults to web for this tracker
			configPlatform = 'web',

			// Snowplow collector URL
			configCollectorUrl = constructCollectorUrl(argmap),

			// Site ID
			configTrackerSiteId = '', // Updated for Snowplow

			// Document URL
			configCustomUrl,

			// Document title
			configTitle = documentAlias.title,

			// Extensions to be treated as download links
			configDownloadExtensions = '7z|aac|ar[cj]|as[fx]|avi|bin|csv|deb|dmg|doc|exe|flv|gif|gz|gzip|hqx|jar|jpe?g|js|mp(2|3|4|e?g)|mov(ie)?|ms[ip]|od[bfgpst]|og[gv]|pdf|phps|png|ppt|qtm?|ra[mr]?|rpm|sea|sit|tar|t?bz2?|tgz|torrent|txt|wav|wm[av]|wpd||xls|xml|z|zip',

			// Hosts or alias(es) to not treat as outlinks
			configHostsAlias = [domainAlias],

			// HTML anchor element classes to not track
			configIgnoreClasses = [],

			// HTML anchor element classes to treat as downloads
			configDownloadClasses = [],

			// HTML anchor element classes to treat at outlinks
			configLinkClasses = [],

			// Maximum delay to wait for web bug image to be fetched (in milliseconds)
			configTrackerPause = 500,

			// Minimum visit time after initial page view (in milliseconds)
			configMinimumVisitTime,

			// Recurring heart beat after initial ping (in milliseconds)
			configHeartBeatTimer,

			// Disallow hash tags in URL
			configDiscardHashTag,

			// First-party cookie name prefix
			configCookieNamePrefix = '_sp_',

			// First-party cookie domain
			// User agent defaults to origin hostname
			configCookieDomain,

			// First-party cookie path
			// Default is user agent defined.
			configCookiePath,

			// Do Not Track
			configDoNotTrack,

			// Count sites which are pre-rendered
			configCountPreRendered,

			// Life of the visitor cookie (in milliseconds)
			configVisitorCookieTimeout = 63072000000, // 2 years

			// Life of the session cookie (in milliseconds)
			configSessionCookieTimeout = 1800000, // 30 minutes

			// Life of the referral cookie (in milliseconds)
			configReferralCookieTimeout = 15768000000, // 6 months

			// Enable Base64 encoding for unstructured events
			configEncodeBase64 = true,

			// Default hash seed for MurmurHash3 in detectors.detectSignature
			configUserFingerprintHashSeed = 123412414,

			// Document character set
			documentCharset = documentAlias.characterSet || documentAlias.charset,

			// Browser language (or Windows language for IE). Imperfect but CloudFront doesn't log the Accept-Language header
			browserLanguage = navigatorAlias.userLanguage || navigatorAlias.language,

			// Browser features via client-side data collection
			browserFeatures = detectors.detectBrowserFeatures(getSnowplowCookieName('testcookie')),

			// Visitor timezone
			timezone = detectors.detectTimezone(),

			// Visitor fingerprint
			userFingerprint = detectors.detectSignature(configUserFingerprintHashSeed),

			// Guard against installing the link tracker more than once per Tracker instance
			linkTrackingInstalled = false,

			// Guard against installing the activity tracker more than once per Tracker instance
			activityTrackingInstalled = false,

			// Last activity timestamp
			lastActivityTime,

			// How are we scrolling?
			minXOffset,
			maxXOffset,
			minYOffset,
			maxYOffset,

			// Internal state of the pseudo click handler
			lastButton,
			lastTarget,

			// Hash function
			hash = sha1,

			// Domain hash value
			domainHash,

			// Domain unique user ID
			domainUserId,

			// Business-defined unique user ID
			businessUserId,

			// Ecommerce transaction data
			// Will be committed, sent and emptied by a call to trackTrans.
			ecommerceTransaction = ecommerceTransactionTemplate();

		/**
		 * Determines how to build our collector URL,
		 * based on the argmap passed into the
		 * Tracker's constructor.
		 *
		 * argmap is optional because we cannot know it
		 * when constructing an AsyncTracker
		 */
		function constructCollectorUrl(argmap) {
			if (typeof argmap === "undefined") {
				return null; // JavaScript joys, changing an undefined into a null
			} else if ('cf' in argmap) {
				return collectorUrlFromCfDist(argmap.cf);
			} else if ('url' in argmap) {
				return asCollectorUrl(argmap.url);
			}
		}

		/*
		 * Initializes an empty ecommerce
		 * transaction and line items
		 */
		function ecommerceTransactionTemplate() {
			return { transaction: {}, items: [] }
		}

		/*
		 * Removes hash tag from the URL
		 *
		 * URLs are purified before being recorded in the cookie,
		 * or before being sent as GET parameters
		 */
		function purify(url) {
			var targetPattern;

			if (configDiscardHashTag) {
				targetPattern = new RegExp('#.*');
				return url.replace(targetPattern, '');
			}
			return url;
		}

		/*
		 * Extract scheme/protocol from URL
		 */
		function getProtocolScheme(url) {
			var e = new RegExp('^([a-z]+):'),
			matches = e.exec(url);

			return matches ? matches[1] : null;
		}

		/*
		 * Resolve relative reference
		 *
		 * Note: not as described in rfc3986 section 5.2
		 */
		function resolveRelativeReference(baseUrl, url) {
			var protocol = getProtocolScheme(url),
				i;

			if (protocol) {
				return url;
			}

			if (url.slice(0, 1) === '/') {
				return getProtocolScheme(baseUrl) + '://' + helpers.getHostName(baseUrl) + url;
			}

			baseUrl = purify(baseUrl);
			if ((i = baseUrl.indexOf('?')) >= 0) {
				baseUrl = baseUrl.slice(0, i);
			}
			if ((i = baseUrl.lastIndexOf('/')) !== baseUrl.length - 1) {
				baseUrl = baseUrl.slice(0, i + 1);
			}

			return baseUrl + url;
		}

		/*
		 * Is the host local? (i.e., not an outlink)
		 *
		 * This is a pretty flawed approach - assumes
		 * a website only has one domain.
		 *
		 * TODO: I think we can blow this away for
		 * Snowplow and handle the equivalent with a
		 * whitelist of the site's domains. 
		 * 
		 */
		function isSiteHostName(hostName) {
			var i,
				alias,
				offset;

			for (i = 0; i < configHostsAlias.length; i++) {

				alias = helpers.fixupDomain(configHostsAlias[i].toLowerCase());

				if (hostName === alias) {
					return true;
				}

				if (alias.slice(0, 1) === '.') {
					if (hostName === alias.slice(1)) {
						return true;
					}

					offset = hostName.length - alias.length;
					if ((offset > 0) && (hostName.slice(offset) === alias)) {
						return true;
					}
				}
			}
			return false;
		}

		/*
		 * Send image request to the Snowplow Collector using GET.
		 * The Collector serves a transparent, single pixel (1x1) GIF
		 */
		function getImage(request) {

			var image = new Image(1, 1);

			// Let's chec that we have a Url to ping
			if (configCollectorUrl === null) {
				throw "No Snowplow collector configured, cannot track";
			}

			// Okay? Let's proceed.
			image.onload = function () { };
			image.src = configCollectorUrl + request;
		}

		/*
		 * Send request
		 */
		function sendRequest(request, delay) {
			var now = new Date();

			if (!configDoNotTrack) {
				getImage(request);
				mutSnowplowState.expireDateTime = now.getTime() + delay;
			}
		}

		/*
		 * Get cookie name with prefix and domain hash
		 */
		function getSnowplowCookieName(baseName) {
			return configCookieNamePrefix + baseName + '.' + domainHash;
		}

		/*
		 * Cookie getter.
		 */
		function getSnowplowCookieValue(cookieName) {
			return cookie.getCookie(getSnowplowCookieName(cookieName));
		}

		/*
		 * Update domain hash
		 */
		function updateDomainHash() {
			domainHash = hash((configCookieDomain || domainAlias) + (configCookiePath || '/')).slice(0, 4); // 4 hexits = 16 bits
		}

		/*
		 * Process all "activity" events.
		 * For performance, this function must have low overhead.
		 */
		function activityHandler() {
			var now = new Date();
			lastActivityTime = now.getTime();
		}

		/*
		 * Process all "scroll" events.
		 */
		function scrollHandler() {
			updateMaxScrolls();
			activityHandler();
		}

		/*
		 * Returns [pageXOffset, pageYOffset].
		 * Adapts code taken from: http://www.javascriptkit.com/javatutors/static2.shtml
		 */
		function getPageOffsets() {
			var iebody = (documentAlias.compatMode && documentAlias.compatMode != "BackCompat") ?
			               documentAlias.documentElement :
			               documentAlias.body;
			return [iebody.scrollLeft || windowAlias.pageXOffset,
			       iebody.scrollTop || windowAlias.pageYOffset];
		}

		/*
		 * Quick initialization/reset of max scroll levels
		 */
		function resetMaxScrolls() {
			var offsets = getPageOffsets();
			
			var x = offsets[0];
			minXOffset = x;
			maxXOffset = x;
			
			var y = offsets[1];
			minYOffset = y;
			maxYOffset = y;
		}

		/*
		 * Check the max scroll levels, updating as necessary
		 */
		function updateMaxScrolls() {
			var offsets = getPageOffsets();
			
			var x = offsets[0];
			if (x < minXOffset) {
				minXOffset = x;
			} else if (x > maxXOffset) {
				maxXOffset = x;
			}

			var y = offsets[1];
			if (y < minYOffset) {
				minYOffset = y;
			} else if (y > maxYOffset) {
				maxYOffset = y;
			}	
		}

		/*
		 * Sets the Visitor ID cookie: either the first time loadDomainUserIdCookie is called
		 * or when there is a new visit or a new page view
		 */
		function setDomainUserIdCookie(_domainUserId, createTs, visitCount, nowTs, lastVisitTs) {
			cookie.setCookie(getSnowplowCookieName('id'), _domainUserId + '.' + createTs + '.' + visitCount + '.' + nowTs + '.' + lastVisitTs, configVisitorCookieTimeout, configCookiePath, configCookieDomain);
		}

		/*
		 * Load visitor ID cookie
		 */
		function loadDomainUserIdCookie() {
			var now = new Date(),
				nowTs = Math.round(now.getTime() / 1000),
				id = getSnowplowCookieValue('id'),
				tmpContainer;

			if (id) {
				tmpContainer = id.split('.');
				// New visitor set to 0 now
				tmpContainer.unshift('0');
			} else {
				// Domain - generate a pseudo-unique ID to fingerprint this user;
				// Note: this isn't a RFC4122-compliant UUID
				if (!domainUserId) {
					domainUserId = hash(
						(navigatorAlias.userAgent || '') +
							(navigatorAlias.platform || '') +
							json2.stringify(browserFeatures) + nowTs
					).slice(0, 16); // 16 hexits = 64 bits
				}

				tmpContainer = [
					// New visitor
					'1',
					// Domain user ID
					domainUserId,
					// Creation timestamp - seconds since Unix epoch
					nowTs,
					// visitCount - 0 = no previous visit
					0,
					// Current visit timestamp
					nowTs,
					// Last visit timestamp - blank meaning no previous visit
					''
				];
			}
			return tmpContainer;
		}

		/*
		 * Get the current timestamp:
		 * milliseconds since epoch.
		 */
		function getTimestamp() {
			var now = new Date(),
				nowTs = now.getTime();

			return nowTs;
		}

		/*
		 * Attaches all the common web fields to the request
		 * (resolution, url, referrer, etc.)
		 * Also sets the required cookies.
		 *
		 * Takes in a string builder, adds in parameters to it
		 * and then generates the request.
		 */
		function getRequest(sb) {
			var i,
				now = new Date(),
				nowTs = Math.round(now.getTime() / 1000),
				newVisitor,
				_domainUserId, // Don't shadow the global
				visitCount,
				createTs,
				currentVisitTs,
				lastVisitTs,
				referralTs,
				referralUrl,
				referralUrlMaxLength = 1024,
				currentReferrerHostName,
				originalReferrerHostName,
				idname = getSnowplowCookieName('id'),
				sesname = getSnowplowCookieName('ses'),
				id = loadDomainUserIdCookie(),
				ses = getSnowplowCookieValue('ses'), // aka cookie.getCookieValue(sesname)
				currentUrl = configCustomUrl || locationHrefAlias,
				featurePrefix;

			if (configDoNotTrack) {
				cookie.setCookie(idname, '', -1, configCookiePath, configCookieDomain);
				cookie.setCookie(sesname, '', -1, configCookiePath, configCookieDomain);
				return '';
			}

			newVisitor = id[0];
			_domainUserId = id[1]; // We could use the global (domainUserId) but this is better etiquette
			createTs = id[2];
			visitCount = id[3];
			currentVisitTs = id[4];
			lastVisitTs = id[5];

			// New session
			if (!ses) {
				// New session (aka new visit)
				visitCount++;
				// Update the last visit timestamp
				lastVisitTs = currentVisitTs;
			}

			// Build out the rest of the request - first add fields we can safely skip encoding
			sb.addRaw('dtm', getTimestamp());
			sb.addRaw('tid', String(Math.random()).slice(2, 8));
			sb.addRaw('vp', detectors.detectViewport());
			sb.addRaw('ds', detectors.detectDocumentSize());
			sb.addRaw('vid', visitCount);
			sb.addRaw('duid', _domainUserId); // Set to our local variable

			// Encode all these
			sb.add('p', configPlatform);		
			sb.add('tv', version);
			sb.add('fp', userFingerprint);
			sb.add('aid', configTrackerSiteId);
			sb.add('lang', browserLanguage);
			sb.add('cs', documentCharset);
			sb.add('tz', timezone);
			sb.add('uid', businessUserId); // Business-defined user ID

			// Adds with custom conditions
			if (configReferrerUrl.length) sb.add('refr', purify(configReferrerUrl));

			// Browser features. Cookies, color depth and resolution don't get prepended with f_ (because they're not optional features)
			for (i in browserFeatures) {
				if (Object.prototype.hasOwnProperty.call(browserFeatures, i)) {
					featurePrefix = (i === 'res' || i === 'cd' || i === 'cookie') ? '' : 'f_';
					sb.addRaw(featurePrefix + i, browserFeatures[i]);
				}
			}

			// Add the page URL last as it may take us over the IE limit (and we don't always need it)
			sb.add('url', purify(currentUrl));
			var request = sb.build();

			// Update cookies
			setDomainUserIdCookie(_domainUserId, createTs, visitCount, nowTs, lastVisitTs);
			cookie.setCookie(sesname, '*', configSessionCookieTimeout, configCookiePath, configCookieDomain);

			return request;
		}

		/**
		 * Builds a collector URL from a CloudFront distribution.
		 * We don't bother to support custom CNAMEs because Amazon CloudFront doesn't support that for SSL.
		 *
		 * @param string account The account ID to build the tracker URL from
		 *
		 * @return string The URL on which the collector is hosted
		 */
		function collectorUrlFromCfDist(distSubdomain) {
			return asCollectorUrl(distSubdomain + '.cloudfront.net');
		}

		/**
		 * Adds the protocol in front of our collector URL, and i to the end
		 *
		 * @param string rawUrl The collector URL without protocol
		 *
		 * @return string collectorUrl The tracker URL with protocol
		 */
		function asCollectorUrl(rawUrl) {
			return ('https:' == documentAlias.location.protocol ? 'https' : 'http') + '://' + rawUrl + '/i';               
		}

		/*
		 * Log the page view / visit
		 *
		 * @param string customTitle The user-defined page title to attach to this page view
		 * @param object context Custom context relating to the event
		 */
		function logPageView(customTitle, context) {

			// Fixup page title. We'll pass this to logPagePing too.
			var pageTitle = helpers.fixupTitle(customTitle || configTitle);

			// Log page view
			var sb = payload.payloadBuilder(configEncodeBase64);
			sb.add('e', 'pv'); // 'pv' for Page View
			sb.add('page', pageTitle);
			sb.addJson('cx', 'co', context);
			var request = getRequest(sb, 'pageView');
			sendRequest(request, configTrackerPause);

			// Send ping (to log that user has stayed on page)
			var now = new Date();
			if (configMinimumVisitTime && configHeartBeatTimer && !activityTrackingInstalled) {
				activityTrackingInstalled = true;

				// Capture our initial scroll points
				resetMaxScrolls();

				// Add event handlers; cross-browser compatibility here varies significantly
				// @see http://quirksmode.org/dom/events
				helpers.addEventListener(documentAlias, 'click', activityHandler);
				helpers.addEventListener(documentAlias, 'mouseup', activityHandler);
				helpers.addEventListener(documentAlias, 'mousedown', activityHandler);
				helpers.addEventListener(documentAlias, 'mousemove', activityHandler);
				helpers.addEventListener(documentAlias, 'mousewheel', activityHandler);
				helpers.addEventListener(windowAlias, 'DOMMouseScroll', activityHandler);
				helpers.addEventListener(windowAlias, 'scroll', scrollHandler); // Will updateMaxScrolls() for us
				helpers.addEventListener(documentAlias, 'keypress', activityHandler);
				helpers.addEventListener(documentAlias, 'keydown', activityHandler);
				helpers.addEventListener(documentAlias, 'keyup', activityHandler);
				helpers.addEventListener(windowAlias, 'resize', activityHandler);
				helpers.addEventListener(windowAlias, 'focus', activityHandler);
				helpers.addEventListener(windowAlias, 'blur', activityHandler);

				// Periodic check for activity.
				lastActivityTime = now.getTime();
				setInterval(function heartBeat() {
					var now = new Date();

					// There was activity during the heart beat period;
					// on average, this is going to overstate the visitDuration by configHeartBeatTimer/2
					if ((lastActivityTime + configHeartBeatTimer) > now.getTime()) {
						// Send ping if minimum visit time has elapsed
						if (configMinimumVisitTime < now.getTime()) {
							logPagePing(pageTitle, context); // Grab the min/max globals
						}
					}
				}, configHeartBeatTimer);
			}
		}

		/*
		 * Log that a user is still viewing a given page
		 * by sending a page ping.
		 * Not part of the public API - only called from
		 * logPageView() above.
		 *
		 * @param string pageTitle The page title to attach to this page ping
		 * @param object context Custom context relating to the event
		 */
		function logPagePing(pageTitle, context) {
			var sb = payload.payloadBuilder(configEncodeBase64);
			sb.add('e', 'pp'); // 'pp' for Page Ping
			sb.add('page', pageTitle);
			sb.addRaw('pp_mix', minXOffset); // Global
			sb.addRaw('pp_max', maxXOffset); // Global
			sb.addRaw('pp_miy', minYOffset); // Global
			sb.addRaw('pp_may', maxYOffset); // Global
			sb.addJson('cx', 'co', context);
			resetMaxScrolls();
			var request = getRequest(sb, 'pagePing');
			sendRequest(request, configTrackerPause);
		}

		/**
		 * Log a structured event happening on this page
		 *
		 * @param string category The name you supply for the group of objects you want to track
		 * @param string action A string that is uniquely paired with each category, and commonly used to define the type of user interaction for the web object
		 * @param string label (optional) An optional string to provide additional dimensions to the event data
		 * @param string property (optional) Describes the object or the action performed on it, e.g. quantity of item added to basket
		 * @param numeric value (optional) An integer or floating point number to provide numerical data about the user event
		 * @param object context Custom context relating to the event
		 */
		function logStructEvent(category, action, label, property, value, context) {
			var sb = payload.payloadBuilder(configEncodeBase64);
			sb.add('e', 'se'); // 'se' for Structured Event
			sb.add('se_ca', category);
			sb.add('se_ac', action)
			sb.add('se_la', label);
			sb.add('se_pr', property);
			sb.add('se_va', value);
			sb.addJson('cx', 'co', context);
			var request = getRequest(sb, 'structEvent');
			sendRequest(request, configTrackerPause);
		}

		/**
		 * Log an unstructured event happening on this page
		 *
		 * @param string name The name of the event
		 * @param object properties The properties of the event
		 * @param object context Custom context relating to the event
		 */
		function logUnstructEvent(name, properties, context) {
			var sb = payload.payloadBuilder(configEncodeBase64);
			sb.add('e', 'ue'); // 'ue' for Unstructured Event
			sb.add('ue_na', name);
			sb.addJson('ue_px', 'ue_pr', properties);
			sb.addJson('cx', 'co', context);
			var request = getRequest(sb, 'unstructEvent');
			sendRequest(request, configTrackerPause);
		}

		/**
		 * Log ecommerce transaction metadata
		 *
		 * @param string orderId 
		 * @param string affiliation 
		 * @param string total 
		 * @param string tax 
	 	 * @param string shipping 
		 * @param string city 
	 	 * @param string state 
	 	 * @param string country 
	 	 * @param string currency The currency the total/tax/shipping are expressed in
		 * @param object context Custom context relating to the event
		 */
		// TODO: add params to comment
		function logTransaction(orderId, affiliation, total, tax, shipping, city, state, country, currency, context) {
			var sb = payload.payloadBuilder(configEncodeBase64);
			sb.add('e', 'tr'); // 'tr' for TRansaction
			sb.add('tr_id', orderId);
			sb.add('tr_af', affiliation);
			sb.add('tr_tt', total);
			sb.add('tr_tx', tax);
			sb.add('tr_sh', shipping);
			sb.add('tr_ci', city);
			sb.add('tr_st', state);
			sb.add('tr_co', country);
			sb.add('tr_cu', currency);
			sb.addJson('cx', 'co', context);
			var request = getRequest(sb, 'transaction');
			sendRequest(request, configTrackerPause);
		}

		/**
		 * Log ecommerce transaction item
		 *
		 * @param string orderId
		 * @param string sku
		 * @param string name
		 * @param string category
		 * @param string price
		 * @param string quantity
		 * @param string currency The currency the price is expressed in
		 * @param object context Custom context relating to the event
		 */
		// TODO: add params to comment
		function logTransactionItem(orderId, sku, name, category, price, quantity, currency, context) {
			var sb = payload.payloadBuilder(configEncodeBase64);
			sb.add('e', 'ti'); // 'ti' for Transaction Item
			sb.add('ti_id', orderId);
			sb.add('ti_sk', sku);
			sb.add('ti_na', name);
			sb.add('ti_ca', category);
			sb.add('ti_pr', price);
			sb.add('ti_qu', quantity);
			sb.add('ti_cu', currency);
			sb.addJson('cx', 'co', context);
			var request = getRequest(sb, 'transactionItem');
			sendRequest(request, configTrackerPause);
		}

		// ---------------------------------------
		// Next 2 log methods are not supported in
		// Snowplow Enrichment process yet

		/*
		 * Log the link or click with the server
		 *
		 * @param string url The target URL
		 * @param string linkType The type of link - link or download (see getLinkType() for details)
		 * @param object context Custom context relating to the event
		 */
		// TODO: rename to LinkClick
		// TODO: this functionality is not yet fully implemented.
		// See https://github.com/snowplow/snowplow/issues/75
		function logLink(url, linkType, context) {
			var sb = payload.payloadBuilder(configEncodeBase64);
			sb.add('e', linkType);
			sb.add('t_url', purify(url));
			var request = getRequest(sb, 'link');
			sendRequest(request, configTrackerPause);
		}

		/**
		 * Log an ad impression
		 *
		 * @param string bannerId Identifier for the ad banner displayed
		 * @param string campaignId (optional) Identifier for the campaign which the banner belongs to
		 * @param string advertiserId (optional) Identifier for the advertiser which the campaign belongs to
		 * @param string userId (optional) Ad server identifier for the viewer of the banner
		 * @param object context Custom context relating to the event
		 */
		// TODO: rename to logAdImpression and deprecate logImpression
		// TODO: should add impressionId as well.
		// TODO: should add in zoneId (aka placementId, slotId?) as well
		// TODO: change ad_ to ai_?
		function logImpression(bannerId, campaignId, advertiserId, userId, context) {
			var sb = payload.payloadBuilder(configEncodeBase64);
			sb.add('e', 'ad'); // 'ad' for AD impression
			sb.add('ad_ba', bannerId);
			sb.add('ad_ca', campaignId)
			sb.add('ad_ad', advertiserId);
			sb.add('ad_uid', userId);
			sb.addJson('cx', 'co', context);
			var request = getRequest(sb, 'impression');
			sendRequest(request, configTrackerPause);
		}

		// TODO: add in ad clicks and conversions

		/*
		 * Browser prefix
		 */
		function prefixPropertyName(prefix, propertyName) {
			
			if (prefix !== '') {
				return prefix + propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
			}

			return propertyName;
		}

		/*
		 * Check for pre-rendered web pages, and log the page view/link
		 * according to the configuration and/or visibility
		 *
		 * @see http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/PageVisibility/Overview.html
		 */
		function trackCallback(callback) {
			var isPreRendered,
				i,
				// Chrome 13, IE10, FF10
				prefixes = ['', 'webkit', 'ms', 'moz'],
				prefix;

			if (!configCountPreRendered) {
				for (i = 0; i < prefixes.length; i++) {
					prefix = prefixes[i];

					// does this browser support the page visibility API?
					if (Object.prototype.hasOwnProperty.call(documentAlias, prefixPropertyName(prefix, 'hidden'))) {
						// if pre-rendered, then defer callback until page visibility changes
						if (documentAlias[prefixPropertyName(prefix, 'visibilityState')] === 'prerender') {
							isPreRendered = true;
						}
						break;
					}
				}
			}

			if (isPreRendered) {
				// note: the event name doesn't follow the same naming convention as vendor properties
				helpers.addEventListener(documentAlias, prefix + 'visibilitychange', function ready() {
					documentAlias.removeEventListener(prefix + 'visibilitychange', ready, false);
					callback();
				});
				return;
			}

			// configCountPreRendered === true || isPreRendered === false
			callback();
		}

		/*
		 * Construct regular expression of classes
		 */
		function getClassesRegExp(configClasses, defaultClass) {
			var i,
				classesRegExp = '(^| )(piwik[_-]' + defaultClass;

			if (configClasses) {
				for (i = 0; i < configClasses.length; i++) {
					classesRegExp += '|' + configClasses[i];
				}
			}
			classesRegExp += ')( |$)';

			return new RegExp(classesRegExp);
		}

		/*
		 * Link or Download?
		 */
		// TODO: why is a download assumed to always be on the same host?
		// TODO: why return 0 if can't detect it as a link or download?
		function getLinkType(className, href, isInLink) {
			// outlinks
			if (!isInLink) {
				return 'lnk';
			}

			// does class indicate whether it is an (explicit/forced) outlink or a download?
			var downloadPattern = getClassesRegExp(configDownloadClasses, 'download'),
				linkPattern = getClassesRegExp(configLinkClasses, 'link'),

				// does file extension indicate that it is a download?
				downloadExtensionsPattern = new RegExp('\\.(' + configDownloadExtensions + ')([?&#]|$)', 'i');

			return linkPattern.test(className) ? 'lnk' : (downloadPattern.test(className) || downloadExtensionsPattern.test(href) ? 'dl' : 0);
		}

		/*
		 * Process clicks
		 */
		function processClick(sourceElement) {
			var parentElement,
				tag,
				linkType;

			while ((parentElement = sourceElement.parentNode) !== null &&
					!lodash.isUndefined(parentElement) && // buggy IE5.5
					((tag = sourceElement.tagName.toUpperCase()) !== 'A' && tag !== 'AREA')) {
				sourceElement = parentElement;
			}

			if (!lodash.isUndefined(sourceElement.href)) {
				// browsers, such as Safari, don't downcase hostname and href
				var originalSourceHostName = sourceElement.hostname || helpers.getHostName(sourceElement.href),
					sourceHostName = originalSourceHostName.toLowerCase(),
					sourceHref = sourceElement.href.replace(originalSourceHostName, sourceHostName),
					scriptProtocol = new RegExp('^(javascript|vbscript|jscript|mocha|livescript|ecmascript|mailto):', 'i');

				// Ignore script pseudo-protocol links
				if (!scriptProtocol.test(sourceHref)) {
					// Track outlinks and all downloads
					linkType = getLinkType(sourceElement.className, sourceHref, isSiteHostName(sourceHostName));
					if (linkType) {
						// decodeUrl %xx
						sourceHref = unescape(sourceHref);
						logLink(sourceHref, linkType);
					}
				}
			}
		}

		/*
		 * Handle click event
		 */
		function clickHandler(evt) {
			var button,
				target;

			evt = evt || windowAlias.event;
			button = evt.which || evt.button;
			target = evt.target || evt.srcElement;

			// Using evt.type (added in IE4), we avoid defining separate handlers for mouseup and mousedown.
			if (evt.type === 'click') {
				if (target) {
					processClick(target);
				}
			} else if (evt.type === 'mousedown') {
				if ((button === 1 || button === 2) && target) {
					lastButton = button;
					lastTarget = target;
				} else {
					lastButton = lastTarget = null;
				}
			} else if (evt.type === 'mouseup') {
				if (button === lastButton && target === lastTarget) {
					processClick(target);
				}
				lastButton = lastTarget = null;
			}
		}

		/*
		 * Add click listener to a DOM element
		 */
		function addClickListener(element, enable) {
			if (enable) {
				// for simplicity and performance, we ignore drag events
				helpers.addEventListener(element, 'mouseup', clickHandler, false);
				helpers.addEventListener(element, 'mousedown', clickHandler, false);
			} else {
				helpers.addEventListener(element, 'click', clickHandler, false);
			}
		}

		/*
		 * Add click handlers to anchor and AREA elements, except those to be ignored
		 */
		function addClickListeners(enable) {
			if (!linkTrackingInstalled) {
				linkTrackingInstalled = true;

				// iterate through anchor elements with href and AREA elements

				var i,
					ignorePattern = getClassesRegExp(configIgnoreClasses, 'ignore'),
					linkElements = documentAlias.links;

				if (linkElements) {
					for (i = 0; i < linkElements.length; i++) {
						if (!ignorePattern.test(linkElements[i].className)) {
							addClickListener(linkElements[i], enable);
						}
					}
				}
			}
		}

		/************************************************************
		 * Constructor
		 ************************************************************/

		/*
		 * Initialize tracker
		 */
		updateDomainHash();


		/************************************************************
		 * Public data and methods
		 ************************************************************/

		return {

			/**
			 * Get the current user ID (as set previously
			 * with setUserId()).
			 *
			 * @return string Business-defined user ID
			 */
			getUserId: function () {
				return businessUserId;
			},

			/**
			 * Get visitor ID (from first party cookie)
			 *
			 * @return string Visitor ID in hexits (or null, if not yet known)
			 */
			getDomainUserId: function () {
				return (loadDomainUserIdCookie())[1];
			},

			/**
			 * Get the visitor information (from first party cookie)
			 *
			 * @return array
			 */
			getDomainUserInfo: function () {
				return loadDomainUserIdCookie();
			},

			/**
			 * Specify the app ID
			 *
			 * @param int|string appId
			 */
			setAppId: function (appId) {
				configTrackerSiteId = appId;
			},

			/**
			 * Set delay for link tracking (in milliseconds)
			 *
			 * @param int delay
			 */
			setLinkTrackingTimer: function (delay) {
				configTrackerPause = delay;
			},

			/**
			 * Set list of file extensions to be recognized as downloads
			 *
			 * @param string extensions
			 */
			setDownloadExtensions: function (extensions) {
				configDownloadExtensions = extensions;
			},

			/**
			 * Specify additional file extensions to be recognized as downloads
			 *
			 * @param string extensions
			 */
			addDownloadExtensions: function (extensions) {
				configDownloadExtensions += '|' + extensions;
			},

			/**
			 * Set array of domains to be treated as local
			 *
			 * @param string|array hostsAlias
			 */
			setDomains: function (hostsAlias) {
				configHostsAlias = lodash.isString(hostsAlias) ? [hostsAlias] : hostsAlias;
				configHostsAlias.push(domainAlias);
			},

			/**
			 * Set array of classes to be ignored if present in link
			 *
			 * @param string|array ignoreClasses
			 */
			setIgnoreClasses: function (ignoreClasses) {
				configIgnoreClasses = lodash.isString(ignoreClasses) ? [ignoreClasses] : ignoreClasses;
			},

			/**
			 * Override referrer
			 *
			 * @param string url
			 */
			setReferrerUrl: function (url) {
				configReferrerUrl = url;
			},

			/**
			 * Override url
			 *
			 * @param string url
			 */
			setCustomUrl: function (url) {
				configCustomUrl = resolveRelativeReference(locationHrefAlias, url);
			},

			/**
			 * Override document.title
			 *
			 * @param string title
			 */
			setDocumentTitle: function (title) {
				configTitle = title;
			},

			/**
			 * Set array of classes to be treated as downloads
			 *
			 * @param string|array downloadClasses
			 */
			setDownloadClasses: function (downloadClasses) {
				configDownloadClasses = lodash.isString(downloadClasses) ? [downloadClasses] : downloadClasses;
			},

			/**
			 * Set array of classes to be treated as outlinks
			 *
			 * @param string|array linkClasses
			 */
			setLinkClasses: function (linkClasses) {
				configLinkClasses = lodash.isString(linkClasses) ? [linkClasses] : linkClasses;
			},

			/**
			 * Strip hash tag (or anchor) from URL
			 *
			 * @param bool enableFilter
			 */
			discardHashTag: function (enableFilter) {
				configDiscardHashTag = enableFilter;
			},

			/**
			 * Set first-party cookie name prefix
			 *
			 * @param string cookieNamePrefix
			 */
			setCookieNamePrefix: function (cookieNamePrefix) {
				configCookieNamePrefix = cookieNamePrefix;
			},

			/**
			 * Set first-party cookie domain
			 *
			 * @param string domain
			 */
			setCookieDomain: function (domain) {

				configCookieDomain = helpers.fixupDomain(domain);
				updateDomainHash();
			},

			/**
			 * Set first-party cookie path
			 *
			 * @param string domain
			 */
			setCookiePath: function (path) {
				configCookiePath = path;
				updateDomainHash();
			},

			/**
			 * Set visitor cookie timeout (in seconds)
			 *
			 * @param int timeout
			 */
			setVisitorCookieTimeout: function (timeout) {
				configVisitorCookieTimeout = timeout * 1000;
			},

			/**
			 * Set session cookie timeout (in seconds)
			 *
			 * @param int timeout
			 */
			setSessionCookieTimeout: function (timeout) {
				configSessionCookieTimeout = timeout * 1000;
			},

			/**
			 * Set referral cookie timeout (in seconds)
			 *
			 * @param int timeout
			 */
			setReferralCookieTimeout: function (timeout) {
				configReferralCookieTimeout = timeout * 1000;
			},

			/**
			 * @param number seed The seed used for MurmurHash3
			 */
			setUserFingerprintSeed: function(seed) {
				configUserFingerprintHashSeed = seed;
				userFingerprint = detectors.detectSignature(configUserFingerprintHashSeed);
			},

			/**
			 * Prevent tracking if user's browser has Do Not Track feature enabled,
			 * where tracking is:
			 * 1) Sending events to a collector
			 * 2) Setting first-party cookies
			 * @param bool enable If true and Do Not Track feature enabled, don't track. 
			 */
			respectDoNotTrack: function (enable) {
				var dnt = navigatorAlias.doNotTrack || navigatorAlias.msDoNotTrack;

				configDoNotTrack = enable && (dnt === 'yes' || dnt === '1');
			},

			/**
			 * Enable/disable user fingerprinting. User fingerprinting is enabled by default.
			 * @param bool enable If false, turn off user fingerprinting
			 */
			enableUserFingerprint: function(enable) {
				if (!enable) {
					userFingerprint = '';
				}
			},

			/**
			 * Add click listener to a specific link element.
			 * When clicked, Piwik will log the click automatically.
			 *
			 * @param DOMElement element
			 * @param bool enable If true, use pseudo click-handler (mousedown+mouseup)
			 */
			addListener: function (element, enable) {
				addClickListener(element, enable);
			},

			/**
			 * Install link tracker
			 *
			 * The default behaviour is to use actual click events. However, some browsers
			 * (e.g., Firefox, Opera, and Konqueror) don't generate click events for the middle mouse button.
			 *
			 * To capture more "clicks", the pseudo click-handler uses mousedown + mouseup events.
			 * This is not industry standard and is vulnerable to false positives (e.g., drag events).
			 *
			 * There is a Safari/Chrome/Webkit bug that prevents tracking requests from being sent
			 * by either click handler.  The workaround is to set a target attribute (which can't
			 * be "_self", "_top", or "_parent").
			 *
			 * @see https://bugs.webkit.org/show_bug.cgi?id=54783
			 *
			 * @param bool enable If true, use pseudo click-handler (mousedown+mouseup)
			 */
			enableLinkTracking: function (enable) {
				if (mutSnowplowState.hasLoaded) {
					// the load event has already fired, add the click listeners now
					addClickListeners(enable);
				} else {
					// defer until page has loaded
					mutSnowplowState.registeredOnLoadHandlers.push(function () {
						addClickListeners(enable);
					});
				}
			},

			/**
			 * Enables page activity tracking (sends page
			 * pings to the Collector regularly).
			 *
			 * @param int minimumVisitLength Seconds to wait before sending first page ping
			 * @param int heartBeatDelay Seconds to wait between pings
			 */
			enableActivityTracking: function (minimumVisitLength, heartBeatDelay) {
				
				var now = new Date();

				configMinimumVisitTime = now.getTime() + minimumVisitLength * 1000;
				configHeartBeatTimer = heartBeatDelay * 1000;
			},

			/**
			 * Frame buster
			 */
			killFrame: function () {
				if (windowAlias.location !== windowAlias.top.location) {
					windowAlias.top.location = windowAlias.location;
				}
			},

			/**
			 * Redirect if browsing offline (aka file: buster)
			 *
			 * @param string url Redirect to this URL
			 */
			redirectFile: function (url) {
				if (windowAlias.location.protocol === 'file:') {
					windowAlias.location = url;
				}
			},

			/**
			 * Count sites in pre-rendered state
			 *
			 * @param bool enable If true, track when in pre-rendered state
			 */
			setCountPreRendered: function (enable) {
				configCountPreRendered = enable;
			},

			/**
			 * Set the business-defined user ID for this user.
			 *
			 * @param string userId The business-defined user ID
			 */
			setUserId: function(userId) {
				businessUserId = userId;
			},

			/**
			 * Set the business-defined user ID for this user using the location querystring.
			 * 
			 * @param string queryName Name of a querystring name-value pair
			 */
			 setUserIdFromLocation: function(querystringField) {
			 	businessUserId = helpers.fromQuerystring(querystringField, locationHrefAlias);
			 },

			/**
			 * Set the business-defined user ID for this user using the referrer querystring.
			 * 
			 * @param string queryName Name of a querystring name-value pair
			 */
			 setUserIdFromReferrer: function(querystringField) {
			 	businessUserId = helpers.fromQuerystring(querystringField, configReferrerUrl);
			 },

			/**
			 * Set the business-defined user ID for this user to the value of a cookie.
			 * 
			 * @param string cookieName Name of the cookie whose value will be assigned to businessUserId
			 */
			 setUserIdFromCookie: function(cookieName) {
			 	businessUserId = cookie.getCookie(cookieName);
			 },

			/**
			 * Configure this tracker to log to a CloudFront collector. 
			 *
			 * @param string distSubdomain The subdomain on your CloudFront collector's distribution
			 */
			setCollectorCf: function (distSubdomain) {
				configCollectorUrl = collectorUrlFromCfDist(distSubdomain);
			},

			/**
			 *
			 * Specify the Snowplow collector URL. No need to include HTTP
			 * or HTTPS - we will add this.
			 * 
			 * @param string rawUrl The collector URL minus protocol and /i
			 */
			setCollectorUrl: function (rawUrl) {
				configCollectorUrl = asCollectorUrl(rawUrl);
			},

			/**
			 * Specify the platform
			 *
			 * @param string platform Overrides the default tracking platform
			 */
			setPlatform: function(platform) {
				configPlatform = platform;
			},

			/**
			 *
			 * Enable Base64 encoding for unstructured event payload
			 *
			 * @param boolean enabled A boolean value indicating if the Base64 encoding for unstructured events should be enabled or not
			 */
			encodeBase64: function (enabled) {
				configEncodeBase64 = enabled;
			},

			/**
			 * Log visit to this page
			 *
			 * @param string customTitle
			 * @param object Custom context relating to the event
			 */
			trackPageView: function (customTitle, context) {
				trackCallback(function () {
					logPageView(customTitle, context);
				});
			},

			/**
			 * Track a structured event happening on this page.
			 *
			 * Replaces trackEvent, making clear that the type
			 * of event being tracked is a structured one.
			 *
			 * @param string category The name you supply for the group of objects you want to track
			 * @param string action A string that is uniquely paired with each category, and commonly used to define the type of user interaction for the web object
			 * @param string label (optional) An optional string to provide additional dimensions to the event data
			 * @param string property (optional) Describes the object or the action performed on it, e.g. quantity of item added to basket
			 * @param int|float|string value (optional) An integer that you can use to provide numerical data about the user event
			 * @param object Custom context relating to the event
			 */
			trackStructEvent: function (category, action, label, property, value, context) {
				logStructEvent(category, action, label, property, value, context);                   
			},

			/**
			 * Track an unstructured event happening on this page.
			 *
			 * @param string name The name of the event
			 * @param object properties The properties of the event
			 * @param object Custom context relating to the event
			 */
			trackUnstructEvent: function (name, properties, context) {
				logUnstructEvent(name, properties, context);
			},

			/**
			 * Track an ecommerce transaction
			 *
			 * @param string orderId Required. Internal unique order id number for this transaction.
			 * @param string affiliation Optional. Partner or store affiliation.
			 * @param string total Required. Total amount of the transaction.
			 * @param string tax Optional. Tax amount of the transaction.
			 * @param string shipping Optional. Shipping charge for the transaction.
			 * @param string city Optional. City to associate with transaction.
			 * @param string state Optional. State to associate with transaction.
			 * @param string country Optional. Country to associate with transaction.
			 * @param string currency Optional. Currency to associate with this transaction.
			 * @param object context Option. Context relating to the event.
			 */
			addTrans: function(orderId, affiliation, total, tax, shipping, city, state, country, currency, context) {
				ecommerceTransaction.transaction = {
					 orderId: orderId,
					 affiliation: affiliation,
					 total: total,
					 tax: tax,
					 shipping: shipping,
					 city: city,
					 state: state,
					 country: country,
					 currency: currency,
					 context: context
				};
			},

			/**
			 * Track an ecommerce transaction item
			 *
			 * @param string orderId Required Order ID of the transaction to associate with item.
			 * @param string sku Required. Item's SKU code.
			 * @param string name Optional. Product name.
			 * @param string category Optional. Product category.
			 * @param string price Required. Product price.
			 * @param string quantity Required. Purchase quantity.
			 * @param string currency Optional. Product price currency.
			 * @param object context Option. Context relating to the event.
			 */
			addItem: function(orderId, sku, name, category, price, quantity, currency, context) {
				ecommerceTransaction.items.push({
					orderId: orderId,
					sku: sku,
					name: name,
					category: category,
					price: price,
					quantity: quantity,
					currency: currency,
					context: context
				});
			},

			/**
			 * Commit the ecommerce transaction
			 *
			 * This call will send the data specified with addTrans,
			 * addItem methods to the tracking server.
			 */
			trackTrans: function() {
				 logTransaction(
						 ecommerceTransaction.transaction.orderId,
						 ecommerceTransaction.transaction.affiliation,
						 ecommerceTransaction.transaction.total,
						 ecommerceTransaction.transaction.tax,
						 ecommerceTransaction.transaction.shipping,
						 ecommerceTransaction.transaction.city,
						 ecommerceTransaction.transaction.state,
						 ecommerceTransaction.transaction.country,
						 ecommerceTransaction.transaction.currency,
						 ecommerceTransaction.transaction.context
						);
				for (var i = 0; i < ecommerceTransaction.items.length; i++) {
					var item = ecommerceTransaction.items[i];
					logTransactionItem(
						item.orderId,
						item.sku,
						item.name,
						item.category,
						item.price,
						item.quantity,
						item.currency,
						item.context
						);
				}

				ecommerceTransaction = ecommerceTransactionTemplate();
			},

			// ---------------------------------------
			// Next 2 track events not supported in
			// Snowplow Enrichment process yet

			/**
			 * Manually log a click from your own code
			 *
			 * @param string sourceUrl
			 * @param string linkType
			 * @param object Custom context relating to the event
			 */
			// TODO: break this into trackLink(destUrl) and trackDownload(destUrl)
			trackLink: function (sourceUrl, linkType, context) {
				trackCallback(function () {
					logLink(sourceUrl, linkType, context);
				});
			},

			/**
			 * Track an ad being served
			 *
			 * DEPRECATED: Use trackAdImpression() (scheduled for version 1.1.0)
			 *
			 * @param string bannerId Identifier for the ad banner displayed
			 * @param string campaignId (optional) Identifier for the campaign which the banner belongs to
			 * @param string advertiserId (optional) Identifier for the advertiser which the campaign belongs to
			 * @param string userId (optional) Ad server identifier for the viewer of the banner
			 * @param object Custom context relating to the event
			 */
			trackImpression: function (bannerId, campaignId, advertiserId, userId, context) {
				if (typeof console !== 'undefined') {
					console.log("Snowplow: trackImpression is deprecated. When version 1.1.0 is released, switch to trackAdImpression.");
				}
				logImpression(bannerId, campaignId, advertiserId, userId, context);
			}

			// TODO: add in ad clicks and conversions
		};
	}

}());
