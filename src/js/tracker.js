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
		lodash = require('./lib_managed/lodash'),
		helpers = require('./lib/helpers'),
		proxies = require('./lib/proxies'),
		cookie = require('browser-cookie-lite'),
		detectors = require('./lib/detectors'),
		payload = require('./payload'),
		json2 = require('JSON'),
		sha1 = require('sha1'),
		requestQueue = require('./out_queue'),

		object = typeof exports !== 'undefined' ? exports : this; // For eventual node.js environment support

	/**
	 * Snowplow Tracker class
	 *
	 * @param namespace The namespace of the tracker object

	 * @param version The current version of the JavaScript Tracker
	 *
	 * @param mutSnowplowState An object containing hasLoaded, registeredOnLoadHandlers, and expireDateTime
	 * Passed in by reference in case they are altered by snowplow.js
	 *
	 * @param argmap Optional dictionary of configuration options. Supported fields and their default values:
	 *
	 * 1. encodeBase64, true
	 * 2. cookieDomain, null
	 * 3. cookieName, '_sp_'
	 * 4. appId, ''
	 * 5. platform, 'web'
	 * 6. respectDoNotTrack, false
	 * 7. userFingerprint, true
	 * 8. userFingerprintSeed, 123412414
	 * 9. pageUnloadTimer, 500
	 * 10. writeCookies, true
	 */
	object.Tracker = function Tracker(functionName, namespace, version, mutSnowplowState, argmap) {

		/************************************************************
		 * Private members
		 ************************************************************/

		var
			// Aliases
			documentAlias = document,
			windowAlias = window,
			navigatorAlias = navigator,

			// Current URL and Referrer URL
			locationArray = proxies.fixupUrl(documentAlias.domain, windowAlias.location.href, helpers.getReferrer()),
			domainAlias = helpers.fixupDomain(locationArray[0]),
			locationHrefAlias = locationArray[1],
			configReferrerUrl = locationArray[2],

			argmap = argmap || {},

			// Request method is always GET for Snowplow
			configRequestMethod = 'GET',

			// Initial segment of schema field for Snowplow's self-describing JSONs
			configBaseSchemaPath = 'iglu://com.snowplowanalytics',

			// The schema against which custom context arrays should be validated
			configContextSchema = configBaseSchemaPath + '/contexts/jsonschema/1-0-0',

			// The schema against which unstructured event envelopes should be validated
			configUnstructEventSchema = configBaseSchemaPath +  '/unstruct_event/jsonschema/1-0-0',

			// Platform defaults to web for this tracker
			configPlatform = argmap.hasOwnProperty('platform') ? argmap.platform : 'web',

			// Snowplow collector URL
			configCollectorUrl,

			// Site ID
			configTrackerSiteId = argmap.hasOwnProperty('appId') ? argmap.appId : '', // Updated for Snowplow

			// Document URL
			configCustomUrl,

			// Document title
			configTitle = documentAlias.title,

			// Maximum delay to wait for web bug image to be fetched (in milliseconds)
			configTrackerPause = argmap.hasOwnProperty('pageUnloadTimer') ? argmap.pageUnloadTimer : 500,

			// Minimum visit time after initial page view (in milliseconds)
			configMinimumVisitTime,

			// Recurring heart beat after initial ping (in milliseconds)
			configHeartBeatTimer,

			// Disallow hash tags in URL. TODO: Should this be set to true by default?
			configDiscardHashTag,

			// First-party cookie name prefix
			configCookieNamePrefix = argmap.hasOwnProperty('cookieName') ? argmap.cookieName : '_sp_',

			// First-party cookie domain
			// User agent defaults to origin hostname
			configCookieDomain = argmap.hasOwnProperty('cookieDomain') ? argmap.cookieDomain : null,

			// First-party cookie path
			// Default is user agent defined.
			configCookiePath,

			configWriteCookies = argmap.hasOwnProperty('writeCookies') ? argmap.writeCookies : true,

			// Do Not Track browser feature
			dnt = navigatorAlias.doNotTrack || navigatorAlias.msDoNotTrack,

			// Do Not Track
			configDoNotTrack = argmap.hasOwnProperty('respectDoNotTrack') ? argmap.respectDoNotTrack && (dnt === 'yes' || dnt === '1') : false,

			// Count sites which are pre-rendered
			configCountPreRendered,

			// Life of the visitor cookie (in milliseconds)
			configVisitorCookieTimeout = 63072000, // 2 years

			// Life of the session cookie (in milliseconds)
			configSessionCookieTimeout = 1800, // 30 minutes

			// Enable Base64 encoding for unstructured events
			configEncodeBase64 = argmap.hasOwnProperty('encodeBase64') ? argmap.encodeBase64 : true,

			// Default hash seed for MurmurHash3 in detectors.detectSignature
			configUserFingerprintHashSeed = argmap.hasOwnProperty('userFingerprintSeed') ? argmap.userFingerprintSeed : 123412414,

			// Document character set
			documentCharset = documentAlias.characterSet || documentAlias.charset,

			// Browser language (or Windows language for IE). Imperfect but CloudFront doesn't log the Accept-Language header
			browserLanguage = navigatorAlias.userLanguage || navigatorAlias.language,

			// Browser features via client-side data collection
			browserFeatures = detectors.detectBrowserFeatures(getSnowplowCookieName('testcookie')),

			// Visitor timezone
			timezone = detectors.detectTimezone(),

			// Visitor fingerprint
			userFingerprint = (argmap.userFingerprint === false) ? '' : detectors.detectSignature(configUserFingerprintHashSeed),

			// Filter function used to determine whether clicks on a link should be tracked
			linkTrackingFilter,

			// Whether pseudo clicks are tracked
			linkTrackingPseudoClicks,

			// The context attached to link click events
			linkTrackingContext,

			// Unique ID for the tracker instance used to mark links which are being tracked
			trackerId = functionName + '_' + namespace,

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
			ecommerceTransaction = ecommerceTransactionTemplate(),

			outQueueManager = new requestQueue.OutQueueManager(functionName, namespace);

		/*
		 * Creates a JSON from the default header and a custom contexts array
		 */
		function completeContext(context) {
			if (!lodash.isEmpty(context)) {
				return {
					schema: configContextSchema,
					data: context
				};
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
		 * Send request
		 */
		function sendRequest(request, delay) {
			var now = new Date();

			if (!configDoNotTrack) {
				outQueueManager.enqueueRequest(request, configCollectorUrl);
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
			return cookie.cookie(getSnowplowCookieName(cookieName));
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
			cookie.cookie(getSnowplowCookieName('id'), _domainUserId + '.' + createTs + '.' + visitCount + '.' + nowTs + '.' + lastVisitTs, configVisitorCookieTimeout, configCookiePath, configCookieDomain);
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
				ses = getSnowplowCookieValue('ses'), // aka cookie.cookie(sesname)
				currentUrl = configCustomUrl || locationHrefAlias,
				featurePrefix;

			if (configDoNotTrack && configWriteCookies) {
				cookie.cookie(idname, '', -1, configCookiePath, configCookieDomain);
				cookie.cookie(sesname, '', -1, configCookiePath, configCookieDomain);
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
			sb.add('tna', namespace);

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
			if (configWriteCookies) {
				setDomainUserIdCookie(_domainUserId, createTs, visitCount, nowTs, lastVisitTs);
				cookie.cookie(sesname, '*', configSessionCookieTimeout, configCookiePath, configCookieDomain);
			}
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

		/**
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
			sb.addJson('cx', 'co', completeContext(context));
			var request = getRequest(sb);
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

		/**
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
			sb.addJson('cx', 'co', completeContext(context));
			resetMaxScrolls();
			var request = getRequest(sb);
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
			sb.addJson('cx', 'co', completeContext(context));
			var request = getRequest(sb);
			sendRequest(request, configTrackerPause);
		}

		/**
		 * Log an unstructured event happening on this page
		 *
		 * @param object eventJson Contains the properties and schema location for the event
		 * @param object context Custom context relating to the event
		 */
		function logUnstructEvent(eventJson, context) {
			helpers.deleteEmptyProperties(eventJson.data);
			if (!lodash.isEmpty(eventJson.data)) {
				var envelope = {
					schema: configUnstructEventSchema,
					data: eventJson
				},
					sb = payload.payloadBuilder(configEncodeBase64);
				sb.add('e', 'ue'); // 'ue' for Unstructured Event
				sb.addJson('ue_px', 'ue_pr', envelope);
				sb.addJson('cx', 'co', completeContext(context));
				var request = getRequest(sb);
				sendRequest(request, configTrackerPause);
			}
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
			sb.addJson('cx', 'co', completeContext(context));
			var request = getRequest(sb);
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
			sb.addJson('cx', 'co', completeContext(context));
			var request = getRequest(sb);
			sendRequest(request, configTrackerPause);
		}

		// ---------------------------------------
		// Next 2 log methods are not supported in
		// Snowplow Enrichment process yet

		/**
		 * Log the link or click with the server
		 *
		 * @param string elementId
		 * @param array elementClasses
		 * @param string elementTarget
		 * @param string targetUrl
		 * @param object context Custom context relating to the event
		 */
		// TODO: rename to LinkClick
		// TODO: this functionality is not yet fully implemented.
		// See https://github.com/snowplow/snowplow/issues/75
		function logLink(targetUrl, elementId, elementClasses, elementTarget, context) {
			var eventJson = {
				schema: configBaseSchemaPath + '/link_click/jsonschema/1-0-0',
				data: {
					targetUrl: targetUrl,				
					elementId: elementId,
					elementClasses: elementClasses,
					elementTarget: elementTarget
				},
			};

			logUnstructEvent(eventJson, context);
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
			sb.addJson('cx', 'co', completeContext(context));
			var request = getRequest(sb);
			sendRequest(request, configTrackerPause);
		}

		/*
		 * Browser prefix
		 */
		function prefixPropertyName(prefix, propertyName) {
			
			if (prefix !== '') {
				return prefix + propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
			}

			return propertyName;
		}

		/**
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
		 * Process clicks
		 */
		function processClick(sourceElement, context) {

			var parentElement,
				tag,
				elementId,
				elementClasses,
				elementTarget;

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

					elementId = sourceElement.id;
					elementClasses = lodash.map(sourceElement.classList);
					elementTarget = sourceElement.target;

					// decodeUrl %xx
					sourceHref = unescape(sourceHref);
					logLink(sourceHref, elementId, elementClasses, elementTarget, context);
				}
			}
		}

		/*
		 * Return function to handle click event
		 */
		function getClickHandler(context) {
			return function(evt) {
				var button,
					target;

				evt = evt || windowAlias.event;
				button = evt.which || evt.button;
				target = evt.target || evt.srcElement;

				// Using evt.type (added in IE4), we avoid defining separate handlers for mouseup and mousedown.
				if (evt.type === 'click') {
					if (target) {
						processClick(target, context);
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
						processClick(target, context);
					}
					lastButton = lastTarget = null;
				}
			}
		}

		/*
		 * Add click listener to a DOM element
		 */
		function addClickListener(element) {
			if (linkTrackingPseudoClicks) {
				// for simplicity and performance, we ignore drag events
				helpers.addEventListener(element, 'mouseup', getClickHandler(linkTrackingContext), false);
				helpers.addEventListener(element, 'mousedown', getClickHandler(linkTrackingContext), false);
			} else {
				helpers.addEventListener(element, 'click', getClickHandler(linkTrackingContext), false);
			}
		}

		/*
		 * Add click handlers to anchor and AREA elements, except those to be ignored
		 */
		function addClickListeners() {

			var linkElements = documentAlias.links,
				i;

			for (i = 0; i < linkElements.length; i++) {
				// Add a listener to link elements which pass the filter and aren't already tracked
				if (linkTrackingFilter(linkElements[i]) && !linkElements[i][trackerId]) {
					addClickListener(linkElements[i]);
					linkElements[i][trackerId] = true;
				}
			}
		}

		/*
		 * Check whether a list of classes contains any of the classes of a link element
		 * Used to determine whether clicks on that link should be tracked
		 */
		function checkLink(linkElement, specifiedClasses) {
			var linkClasses = lodash.map(linkElement.classList),
				i,
				j;

			for (i = 0; i < linkClasses.length; i++) {
				for (j = 0; j < specifiedClasses.length; j++) {
					if (linkClasses[i] === specifiedClasses[j]) {
						return true;
					}
				}
			}
			return false;
		}

		/*
		 * Configures link click tracking: how to filter which links will be tracked,
		 * whether to use pseudo click tracking, and what context to attach to link_click events
		 */
		function configureLinkClickTracking(criterion, pseudoClicks, context) {
			var specifiedClasses,
				inclusive;

			linkTrackingContext = context;
			linkTrackingPseudoClicks = pseudoClicks;

			// If the criterion argument is not an object, add listeners to all links
			if (lodash.isArray(criterion) || !lodash.isObject(criterion)) {
				linkTrackingFilter = function (link) {
					return true;
				}
				return;
			}

			if (criterion.hasOwnProperty('filter')) {
				linkTrackingFilter = criterion.filter;
			} else {

				inclusive = (criterion.hasOwnProperty('whitelist'));
				specifiedClasses = criterion.whitelist || criterion.blacklist;

				// If the class list is a single string, convert it to an array
				if (!lodash.isArray(specifiedClasses)) {
					specifiedClasses = [specifiedClasses];
				}

				linkTrackingFilter = function(link) {
					return checkLink(link, specifiedClasses) === inclusive;
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
				helpers.warn('setAppId is deprecated. Instead add an "appId" field to the argmap argument of newTracker.');
				configTrackerSiteId = appId;
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
				helpers.warn('setCookieNamePrefix is deprecated. Instead add a "cookieName" field to the argmap argument of newTracker.');
				configCookieNamePrefix = cookieNamePrefix;
			},

			/**
			 * Set first-party cookie domain
			 *
			 * @param string domain
			 */
			setCookieDomain: function (domain) {
				helpers.warn('setCookieDomain is deprecated. Instead add a "cookieDomain" field to the argmap argument of newTracker.');
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
			* @param number seed The seed used for MurmurHash3
			*/
			setUserFingerprintSeed: function(seed) {
				helpers.warn('setUserFingerprintSeed is deprecated. Instead add a "userFingerprintSeed" field to the argmap argument of newTracker.');
				configUserFingerprintHashSeed = seed;
				userFingerprint = detectors.detectSignature(configUserFingerprintHashSeed);
			},

			/**
			* Enable/disable user fingerprinting. User fingerprinting is enabled by default.
			* @param bool enable If false, turn off user fingerprinting
			*/
			enableUserFingerprint: function(enable) {
			helpers.warn('enableUserFingerprintSeed is deprecated. Instead add a "userFingerprint" field to the argmap argument of newTracker.');
				if (!enable) {
					userFingerprint = '';
				}
			},

			/**
			 * Prevent tracking if user's browser has Do Not Track feature enabled,
			 * where tracking is:
			 * 1) Sending events to a collector
			 * 2) Setting first-party cookies
			 * @param bool enable If true and Do Not Track feature enabled, don't track. 
			 */
			respectDoNotTrack: function (enable) {
				helpers.warn('This usage of respectDoNotTrack is deprecated. Instead add a "respectDoNotTrack" field to the argmap argument of newTracker.');
				var dnt = navigatorAlias.doNotTrack || navigatorAlias.msDoNotTrack;

				configDoNotTrack = enable && (dnt === 'yes' || dnt === '1');
			},

			/**
			 * Add click listener to a specific link element.
			 * When clicked, Piwik will log the click automatically.
			 *
			 * @param DOMElement element
			 * @param bool enable If true, use pseudo click-handler (mousedown+mouseup)
			 */
			addListener: function (element, pseudoClicks, context) {
				addClickListener(element, pseudoClicks, context);
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
			 * @param object criterion Criterion by which it will be decided whether a link will be tracked
			 * @param bool pseudoClicks If true, use pseudo click-handler (mousedown+mouseup)
			 */
			enableLinkClickTracking: function (criterion, pseudoClicks, context) {
				if (mutSnowplowState.hasLoaded) {
					// the load event has already fired, add the click listeners now
					configureLinkClickTracking(criterion, pseudoClicks, context);
					addClickListeners();
				} else {
					// defer until page has loaded
					mutSnowplowState.registeredOnLoadHandlers.push(function () {
						configureLinkClickTracking(criterion, pseudoClicks, context);
						addClickListeners();
					});
				}
			},

			/**
			 * Add click event listeners to links which have been added to the page since the
			 * last time enableLinkClickTracking or refreshLinkClickTracking was used
			 */
			refreshLinkClickTracking: function () {
				addClickListeners();
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
			 	businessUserId = cookie.cookie(cookieName);
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
				helpers.warn('setPlatform is deprecated. Instead add a "platform" field to the argmap argument of newTracker.');
				configPlatform = platform;
			},

			/**
			*
			* Enable Base64 encoding for unstructured event payload
			*
			* @param boolean enabled A boolean value indicating if the Base64 encoding for unstructured events should be enabled or not
			*/
			encodeBase64: function (enabled) {
				helpers.warn('This usage of encodeBase64 is deprecated. Instead add an "encodeBase64" field to the argmap argument of newTracker.');
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
			 * @param object eventJson Contains the properties and schema location for the event
			 * @param object context Custom context relating to the event
			 */
			trackUnstructEvent: function (eventJson, context) {
				logUnstructEvent(eventJson, context);
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
			 * @param object context Optional. Context relating to the event.
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
			 * @param object context Optional. Context relating to the event.
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
			 * @param string elementId
			 * @param array elementClasses
			 * @param string elementTarget
			 * @param string targetUrl
			 * @param object Custom context relating to the event
			 */
			// TODO: break this into trackLink(destUrl) and trackDownload(destUrl)
			trackLinkClick: function(targetUrl, elementId, elementClasses, elementTarget, context) {
				trackCallback(function () {
					logLink(targetUrl, elementId, elementClasses, elementTarget, context);
				});
			},

			/**
			 * Track an ad being served
			 *
			 * DEPRECATED: Use trackAdImpression()
			 *
			 * @param string bannerId Identifier for the ad banner displayed
			 * @param string campaignId (optional) Identifier for the campaign which the banner belongs to
			 * @param string advertiserId (optional) Identifier for the advertiser which the campaign belongs to
			 * @param string userId (optional) Ad server identifier for the viewer of the banner
			 * @param object Custom context relating to the event
			 */
			trackImpression: function (bannerId, campaignId, advertiserId, userId, context) {
				helpers.warn('trackImpression is deprecated. When version 1.1.0 is released, switch to trackAdImpression.');
				logImpression(bannerId, campaignId, advertiserId, userId, context);
			},

			/**
			 * Track an ad being served
			 *
			 * @param string impressionId Identifier for a particular ad impression
			 * @param string costModel The cost model. 'cpa', 'cpc', or 'cpm'			 
			 * @param number cost Cost
			 * @param string bannerId Identifier for the ad banner displayed
			 * @param string zoneId Identifier for the ad zone
			 * @param string advertiserId Identifier for the advertiser
			 * @param string campaignId Identifier for the campaign which the banner belongs to
			 * @param object Custom context relating to the event
			 */			
			trackAdImpression: function(impressionId, costModel, cost, targetUrl, bannerId, zoneId, advertiserId, campaignId, context) {
				trackCallback(function () {
					var eventJson = {
						schema: configBaseSchemaPath + '/ad_impression/jsonschema/1-0-0',
						data: {
							impressionId: impressionId,
							costModel: costModel,						
							cost: cost,
							bannerId: bannerId,
							targetUrl: targetUrl,
							zoneId: zoneId,
							advertiserId: advertiserId,
							campaignId: campaignId
						}
					};

					logUnstructEvent(eventJson, context);
				});
			},
			
			/**
			 * Track an ad being clicked
			 *
			 * @param string clickId Identifier for the ad click
			 * @param string costModel The cost model. 'cpa', 'cpc', or 'cpm'			 
			 * @param number cost Cost
			 * @param string targetUrl (required) The link's target URL
			 * @param string bannerId Identifier for the ad banner displayed
			 * @param string zoneId Identifier for the ad zone
			 * @param string impressionId Identifier for a particular ad impression
			 * @param string advertiserId Identifier for the advertiser
			 * @param string campaignId Identifier for the campaign which the banner belongs to
			 * @param object Custom context relating to the event
			 */
			trackAdClick: function(targetUrl, clickId, costModel, cost, bannerId, zoneId, impressionId, advertiserId, campaignId, context) {
				var eventJson = {
					schema: configBaseSchemaPath + '/ad_click/jsonschema/1-0-0',
					data: {
						targetUrl: targetUrl,					
						clickId: clickId,
						costModel: costModel,					
						cost: cost,
						bannerId: bannerId,
						zoneId: zoneId,
						impressionId: impressionId,
						advertiserId: advertiserId,
						campaignId: campaignId
					}
				};

				logUnstructEvent(eventJson, context);
			},

			/**
			 * Track an ad conversion event
			 *
			 * @param string conversionId Identifier for the ad conversion event
			 * @param number cost Cost
			 * @param string category The name you supply for the group of objects you want to track
			 * @param string action A string that is uniquely paired with each category
			 * @param string property Describes the object of the conversion or the action performed on it
			 * @param number initialValue Revenue attributable to the conversion at time of conversion
			 * @param string advertiserId Identifier for the advertiser
			 * @param string costModel The cost model. 'cpa', 'cpc', or 'cpm'
			 * @param string campaignId Identifier for the campaign which the banner belongs to
			 * @param object Custom context relating to the event
			 */
			trackAdConversion: function(conversionId, costModel, cost, category, action, property, initialValue, advertiserId, campaignId, context) {
				var eventJson = {
					schema: configBaseSchemaPath + '/ad_conversion/jsonschema/1-0-0',
					data: {
						conversionId: conversionId,
						costModel: costModel,					
						cost: cost,
						category: category,
						action: action,
						property: property,
						initialValue: initialValue,
						advertiserId: advertiserId,
						campaignId: campaignId					
					}
				};

				logUnstructEvent(eventJson, context);
			}
		}
	}

}());
