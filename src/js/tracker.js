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
		json2 = require('JSON'),
		sha1 = require('sha1'),
		links = require('./links'),
		forms = require('./forms'),
		requestQueue = require('./out_queue'),
		coreConstructor = require('snowplow-tracker-core'),
		uuid = require('uuid'),

		object = typeof exports !== 'undefined' ? exports : this; // For eventual node.js environment support

	/**
	 * Snowplow Tracker class
	 *
	 * @param namespace The namespace of the tracker object

	 * @param version The current version of the JavaScript Tracker
	 *
	 * @param pageViewId ID for the current page view, to be attached to all events in the web_page context
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
	 * 10. forceSecureTracker, false
	 * 11. useLocalStorage, true
	 * 12. useCookies, true
	 * 13. sessionCookieTimeout, 1800
	 * 14. contexts, {}
	 * 15. post, false
	 * 16. bufferSize, 1
	 * 17. crossDomainLinker, false
	 * 18. maxPostBytes, 40000
	 */
	object.Tracker = function Tracker(functionName, namespace, version, pageViewId, mutSnowplowState, argmap) {

		/************************************************************
		 * Private members
		 ************************************************************/
		var
			// Tracker core
			core = coreConstructor(true, function(payload) {
				addBrowserData(payload);
				sendRequest(payload, configTrackerPause);
			}),

			// Aliases
			documentAlias = document,
			windowAlias = window,
			navigatorAlias = navigator,

			// Current URL and Referrer URL
			locationArray = proxies.fixupUrl(documentAlias.domain, windowAlias.location.href, helpers.getReferrer()),
			domainAlias = helpers.fixupDomain(locationArray[0]),
			locationHrefAlias = locationArray[1],
			configReferrerUrl = locationArray[2],

			customReferrer,

			argmap = argmap || {},

			// Request method is always GET for Snowplow
			configRequestMethod = 'GET',

			// Platform defaults to web for this tracker
			configPlatform = argmap.hasOwnProperty('platform') ? argmap.platform : 'web',

			// Snowplow collector URL
			configCollectorUrl,

			// Site ID
			configTrackerSiteId = argmap.hasOwnProperty('appId') ? argmap.appId : '', // Updated for Snowplow

			// Document URL
			configCustomUrl,

			// Document title
			lastDocumentTitle = documentAlias.title,

			// Custom title
			lastConfigTitle,

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
			configCookiePath = '/',

			// Do Not Track browser feature
			dnt = navigatorAlias.doNotTrack || navigatorAlias.msDoNotTrack,

			// Do Not Track
			configDoNotTrack = argmap.hasOwnProperty('respectDoNotTrack') ? argmap.respectDoNotTrack && (dnt === 'yes' || dnt === '1') : false,

			// Count sites which are pre-rendered
			configCountPreRendered,

			// Life of the visitor cookie (in seconds)
			configVisitorCookieTimeout = 63072000, // 2 years

			// Life of the session cookie (in seconds)
			configSessionCookieTimeout = argmap.hasOwnProperty('sessionCookieTimeout') ? argmap.sessionCookieTimeout : 1800, // 30 minutes

			// Default hash seed for MurmurHash3 in detectors.detectSignature
			configUserFingerprintHashSeed = argmap.hasOwnProperty('userFingerprintSeed') ? argmap.userFingerprintSeed : 123412414,

			// Document character set
			documentCharset = documentAlias.characterSet || documentAlias.charset,

			// This forces the tracker to be HTTPS even if the page is not secure
			forceSecureTracker = argmap.hasOwnProperty('forceSecureTracker') ? (argmap.forceSecureTracker === true) : false,

			// Whether to use localStorage to store events between sessions while offline
			useLocalStorage = argmap.hasOwnProperty('useLocalStorage') ? argmap.useLocalStorage : true,

			// Whether to use cookies
			configUseCookies = argmap.hasOwnProperty('useCookies') ? argmap.useCookies : true,

			// Browser language (or Windows language for IE). Imperfect but CloudFront doesn't log the Accept-Language header
			browserLanguage = navigatorAlias.userLanguage || navigatorAlias.language,

			// Browser features via client-side data collection
			browserFeatures = detectors.detectBrowserFeatures(configUseCookies, getSnowplowCookieName('testcookie')),

			// Visitor fingerprint
			userFingerprint = (argmap.userFingerprint === false) ? '' : detectors.detectSignature(configUserFingerprintHashSeed),

			// Unique ID for the tracker instance used to mark links which are being tracked
			trackerId = functionName + '_' + namespace,

			// Guard against installing the activity tracker more than once per Tracker instance
			activityTrackingInstalled = false,

			// Last activity timestamp
			lastActivityTime,

			// The last time an event was fired on the page - used to invalidate session if cookies are disabled
			lastEventTime = new Date().getTime(),

			// How are we scrolling?
			minXOffset,
			maxXOffset,
			minYOffset,
			maxYOffset,

			// Hash function
			hash = sha1,

			// Domain hash value
			domainHash,

			// Domain unique user ID
			domainUserId,

			// ID for the current session
			memorizedSessionId,

			// Index for the current session - kept in memory in case cookies are disabled
			memorizedVisitCount = 1,

			// Business-defined unique user ID
			businessUserId,

			// Ecommerce transaction data
			// Will be committed, sent and emptied by a call to trackTrans.
			ecommerceTransaction = ecommerceTransactionTemplate(),

			// Manager for automatic link click tracking
			linkTrackingManager = links.getLinkTrackingManager(core, trackerId, addCommonContexts),

			// Manager for automatic form tracking
			formTrackingManager = forms.getFormTrackingManager(core, trackerId, addCommonContexts),

			// Manager for local storage queue
			outQueueManager = new requestQueue.OutQueueManager(
				functionName,
				namespace,
				mutSnowplowState,
				useLocalStorage,
				argmap.post,
				argmap.bufferSize,
				argmap.maxPostBytes || 40000),

			// Flag to prevent the geolocation context being added multiple times
			geolocationContextAdded = false,

			// Set of contexts to be added to every event
			autoContexts = argmap.contexts || {},

			// Context to be added to every event
			commonContexts = [];

		if (autoContexts.webPage) {
			commonContexts.push(getWebPageContext());
		}

		if (autoContexts.gaCookies) {
			commonContexts.push(getGaCookiesContext());
		}

		if (autoContexts.geolocation) {
			enableGeolocationContext();
		}

		// Enable base 64 encoding for unstructured events and custom contexts
		core.setBase64Encoding(argmap.hasOwnProperty('encodeBase64') ? argmap.encodeBase64 : true);

		// Set up unchanging name-value pairs
		core.setTrackerVersion(version);
		core.setTrackerNamespace(namespace);
		core.setAppId(configTrackerSiteId);
		core.setPlatform(configPlatform);
		core.setTimezone(detectors.detectTimezone());
		core.addPayloadPair('lang', browserLanguage);
		core.addPayloadPair('cs', documentCharset);

		// Browser features. Cookies, color depth and resolution don't get prepended with f_ (because they're not optional features)
		for (var i in browserFeatures) {
			if (Object.prototype.hasOwnProperty.call(browserFeatures, i)) {
				if (i === 'res' || i === 'cd' || i === 'cookie') {
					core.addPayloadPair(i, browserFeatures[i]);
				} else {
					core.addPayloadPair('f_' + i, browserFeatures[i]);
				}
			}
		}

		/**
		 * Recalculate the domain, URL, and referrer
		 */
		function refreshUrl() {
			locationArray = proxies.fixupUrl(documentAlias.domain, windowAlias.location.href, helpers.getReferrer());

			// If this is a single-page app and the page URL has changed, then:
			//   - if the new URL's querystring contains a "refer(r)er" parameter, use it as the referrer
			//   - otherwise use the old URL as the referer
			if (locationArray[1] !== locationHrefAlias) {
				configReferrerUrl = helpers.getReferrer(locationHrefAlias);
			}

			domainAlias = helpers.fixupDomain(locationArray[0]);
			locationHrefAlias = locationArray[1];
		}

		/**
		 * Decorate the querystring of a single link
		 *
		 * @param event e The event targeting the link
		 */
		function linkDecorationHandler(e) {
			var tstamp = new Date().getTime();
			var initialQsParams = '_sp=' + domainUserId + '.' + tstamp;
			if (this.href) {
				this.href = helpers.decorateQuerystring(this.href, '_sp', domainUserId + '.' + tstamp);
			}
		}

		/**
		 * Enable querystring decoration for links pasing a filter
		 * Whenever such a link is clicked on or navigated to via the keyboard,
		 * add "_sp={{duid}}.{{timestamp}}" to its querystring
		 *
		 * @param function crossDomainLinker Function used to determine which links to decorate
		 */
		function decorateLinks(crossDomainLinker) {
			for (var i=0; i<document.links.length; i++) {
				var elt = document.links[i];
				if (!elt.spDecorationEnabled && crossDomainLinker(elt)) {
					helpers.addEventListener(elt, 'click', linkDecorationHandler, true);
					helpers.addEventListener(elt, 'mousedown', linkDecorationHandler, true);

					// Don't add event listeners more than once
					elt.spDecorationEnabled = true;
				}
			}
		}

		/*
		 * Initializes an empty ecommerce
		 * transaction and line items
		 */
		function ecommerceTransactionTemplate() {
			return {
				transaction: {},
				items: []
			};
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
				outQueueManager.enqueueRequest(request.build(), configCollectorUrl);
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
			refreshUrl();
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
			return [iebody.scrollLeft || windowAlias.pageXOffset, iebody.scrollTop || windowAlias.pageYOffset];
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
		 * Prevents offsets from being decimal or NaN
		 * See https://github.com/snowplow/snowplow-javascript-tracker/issues/324
		 * TODO: the NaN check should be moved into the core
		 */
		function cleanOffset(offset) {
			var rounded = Math.round(offset);
			if (!isNaN(rounded)) {
				return rounded;
			}
		}

		/*
		 * Sets or renews the session cookie
		 */
		function setSessionCookie() {
			cookie.cookie(getSnowplowCookieName('ses'), '*', configSessionCookieTimeout, configCookiePath, configCookieDomain);
		}

		/*
		 * Sets the Visitor ID cookie: either the first time loadDomainUserIdCookie is called
		 * or when there is a new visit or a new page view
		 */
		function setDomainUserIdCookie(_domainUserId, createTs, visitCount, nowTs, lastVisitTs, sessionId) {
			cookie.cookie(
				getSnowplowCookieName('id'),
				_domainUserId + '.' + createTs + '.' + visitCount + '.' + nowTs + '.' + lastVisitTs + '.' + sessionId,
				configVisitorCookieTimeout,
				configCookiePath,
				configCookieDomain);
		}

		/**
		 * Generate a pseudo-unique ID to fingerprint this user
		 * Note: this isn't a RFC4122-compliant UUID
		 */
		function createNewDomainUserId() {
			return hash(
				(navigatorAlias.userAgent || '') +
					(navigatorAlias.platform || '') +
					json2.stringify(browserFeatures) + Math.round(new Date().getTime() / 1000)
			).slice(0, 16); // 16 hexits = 64 bits
		}

		/*
		 * Load the domain user ID and the session ID
		 * Set the cookies (if cookies are enabled)
		 */
		function initializeIdsAndCookies() {
			var sesCookieSet = configUseCookies && !!getSnowplowCookieValue('ses');
			var idCookieComponents = loadDomainUserIdCookie();

			if (idCookieComponents[1]) {
				domainUserId = idCookieComponents[1];
			} else {
				domainUserId = createNewDomainUserId();
				idCookieComponents[1] = domainUserId;
			}

			memorizedSessionId = idCookieComponents[6];

			if (!sesCookieSet) {

				// Increment the session ID
				idCookieComponents[3] ++;

				// Create a new sessionId
				memorizedSessionId = uuid.v4();
				idCookieComponents[6] = memorizedSessionId;
				// Set lastVisitTs to currentVisitTs
				idCookieComponents[5] = idCookieComponents[4];
			}

			if (configUseCookies) {
				setSessionCookie();
				// Update currentVisitTs
				idCookieComponents[4] = Math.round(new Date().getTime() / 1000);
				idCookieComponents.shift();
				setDomainUserIdCookie.apply(null, idCookieComponents);
			}
		}

		/*
		 * Load visitor ID cookie
		 */
		function loadDomainUserIdCookie() {
			if (!configUseCookies) {
				return [];
			}
			var now = new Date(),
				nowTs = Math.round(now.getTime() / 1000),
				id = getSnowplowCookieValue('id'),
				tmpContainer;

			if (id) {
				tmpContainer = id.split('.');
				// New visitor set to 0 now
				tmpContainer.unshift('0');
			} else {

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

			if (!tmpContainer[6]) {
				tmpContainer[6] = uuid.v4();
			}

			return tmpContainer;
		}

		/*
		 * Update session id, create if required
		 */
		function updateSessionId() {
			var ses = getSnowplowCookieValue('ses'), // aka cookie.cookie(sesname)
				id = loadDomainUserIdCookie(),
				cookiesDisabled = id[0],
				currentVisitTs = id[4],
				lastVisitTs = id[5],
				sessionIdFromCookie = id[6];

			// If cookies are enabled, base visit count and session ID on the cookies
			if (cookiesDisabled === '0') {
				memorizedSessionId = sessionIdFromCookie;

				// New session?
				if (!ses && configUseCookies) {
					// New session (aka new visit)
					visitCount++;
					// Update the last visit timestamp
					lastVisitTs = currentVisitTs;
					// Regenerate the session ID
					memorizedSessionId = uuid.v4();
				}

				memorizedVisitCount = visitCount;

			// Otherwise, a new session starts if configSessionCookieTimeout seconds have passed since the last event
			} else {
				if ((new Date().getTime() - lastEventTime) > configSessionCookieTimeout * 1000) {
					memorizedSessionId = uuid.v4();
					memorizedVisitCount++;
				}
			}

			return lastVisitTs;
		}

		/*
		 * Get the current session id
		 */
		function getInternalSessionId() {
			updateSessionId();

			return memorizedSessionId;
		}

		/*
		 * Attaches common web fields to every request
		 * (resolution, url, referrer, etc.)
		 * Also sets the required cookies.
		 */
		function addBrowserData(sb) {
			var nowTs = Math.round(new Date().getTime() / 1000),
				idname = getSnowplowCookieName('id'),
				sesname = getSnowplowCookieName('ses'),
				id = loadDomainUserIdCookie(),
				_domainUserId = id[1], // We could use the global (domainUserId) but this is better etiquette
				createTs = id[2],
				visitCount = id[3],
				lastVisitTs = id[5];

			if (configDoNotTrack && configUseCookies) {
				cookie.cookie(idname, '', -1, configCookiePath, configCookieDomain);
				cookie.cookie(sesname, '', -1, configCookiePath, configCookieDomain);
				return;
			}

			// update session id
			lastVisitTs = updateSessionId();

			// Build out the rest of the request
			sb.add('vp', detectors.detectViewport());
			sb.add('ds', detectors.detectDocumentSize());
			sb.add('vid', memorizedVisitCount);
			sb.add('sid', memorizedSessionId);
			sb.add('duid', _domainUserId); // Set to our local variable
			sb.add('fp', userFingerprint);
			sb.add('uid', businessUserId);

			refreshUrl();

			sb.add('refr', purify(customReferrer || configReferrerUrl));

			// Add the page URL last as it may take us over the IE limit (and we don't always need it)
			sb.add('url', purify(configCustomUrl || locationHrefAlias));

			// Update cookies
			if (configUseCookies) {
				setDomainUserIdCookie(_domainUserId, createTs, memorizedVisitCount, nowTs, lastVisitTs, memorizedSessionId);
				setSessionCookie();
			}

			lastEventTime = new Date().getTime();
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
			if (forceSecureTracker)
				return ('https' + '://' + rawUrl);
			else
				return ('https:' === documentAlias.location.protocol ? 'https' : 'http') + '://' + rawUrl;
		}

		/**
		 * Add common contexts to every event
		 * TODO: move this functionality into the core
		 *
		 * @param array userContexts List of user-defined contexts
		 * @return userContexts combined with commonContexts
		 */
		function addCommonContexts(userContexts) {
			var combinedContexts = commonContexts.concat(userContexts || []);
			if (autoContexts.performanceTiming) {
				var performanceTimingContext = getPerformanceTimingContext();
				if (performanceTimingContext) {
					combinedContexts.push(performanceTimingContext);
				}
			}
			return combinedContexts;
		}

		/**
		 * Put together a web page context with a unique UUID for the page view
		 *
		 * @return object web_page context
		 */
		function getWebPageContext() {
			return {
				schema: 'iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0',
				data: {
					id: pageViewId
				}
			};
		}

		/**
		 * Creates a context from the window.performance.timing object
		 *
		 * @return object PerformanceTiming context
		 */
		function getPerformanceTimingContext() {
			var performance = windowAlias.performance || windowAlias.mozPerformance || windowAlias.msPerformance || windowAlias.webkitPerformance;
			if (performance) {

				// On Safari, the fields we are interested in are on the prototype chain of
				// performance.timing so we cannot copy them using lodash.clone
				var performanceTiming = {};
				for (var field in performance.timing) {
					// Don't copy the toJSON method
					if (!lodash.isFunction(performance.timing[field])) {
						performanceTiming[field] = performance.timing[field];
					}
				}

				// Old Chrome versions add an unwanted requestEnd field
				delete performanceTiming.requestEnd;

				// Add the Chrome firstPaintTime to the performance if it exists
				if (windowAlias.chrome && windowAlias.chrome.loadTimes && typeof windowAlias.chrome.loadTimes().firstPaintTime === 'number') {
					performanceTiming.chromeFirstPaint = Math.round(windowAlias.chrome.loadTimes().firstPaintTime * 1000);
				}

				return {
					schema: 'iglu:org.w3/PerformanceTiming/jsonschema/1-0-0',
					data: performanceTiming
				};
			}
		}

		/**
		 * Attempts to create a context using the geolocation API and add it to commonContexts
		 */
		function enableGeolocationContext() {
			if (!geolocationContextAdded && navigatorAlias.geolocation && navigatorAlias.geolocation.getCurrentPosition) {
				geolocationContextAdded = true;
				navigator.geolocation.getCurrentPosition(function (position) {
					var coords = position.coords;
					var geolocationContext = {
						schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
						data: {
							latitude: coords.latitude,
							longitude: coords.longitude,
							latitudeLongitudeAccuracy: coords.accuracy,
							altitude: coords.altitude,
							altitudeAccuracy: coords.altitudeAccuracy,
							bearing: coords.heading,
							speed: coords.speed,
							timestamp: position.timestamp
						}
					};
					commonContexts.push(geolocationContext);
				});
			}
		}

		/**
		 * Creates a context containing the values of the cookies set by GA
		 *
		 * @return object GA cookies context
		 */
		function getGaCookiesContext() {
			var gaCookieData = {};
			lodash.forEach(['__utma', '__utmb', '__utmc', '__utmv', '__utmz', '_ga'], function (cookieType) {
				var value = cookie.cookie(cookieType);
				if (value) {
					gaCookieData[cookieType] = value;
				}
			});
			return {
				schema: 'iglu:com.google.analytics/cookies/jsonschema/1-0-0',
				data: gaCookieData
			};
		}

		/**
		 * Combine an array of unchanging contexts with the result of a context-creating function
		 *
		 * @param object staticContexts Array of custom contexts
		 * @param object contextCallback Function returning an array of contexts
		 */
		function finalizeContexts(staticContexts, contextCallback) {
			return (staticContexts || []).concat(contextCallback ? contextCallback() : []);
		}

		/**
		 * Log the page view / visit
		 *
		 * @param string customTitle The user-defined page title to attach to this page view
		 * @param object context Custom context relating to the event
		 * @param object contextCallback Function returning an array of contexts
		 */
		function logPageView(customTitle, context, contextCallback) {

			refreshUrl();

			// So we know what document.title was at the time of trackPageView
			lastDocumentTitle = documentAlias.title;
			lastConfigTitle = customTitle;

			// Fixup page title
			var pageTitle = helpers.fixupTitle(lastConfigTitle || lastDocumentTitle);

			// Log page view
			core.trackPageView(
				purify(configCustomUrl || locationHrefAlias),
				pageTitle,
				purify(customReferrer || configReferrerUrl),
				addCommonContexts(finalizeContexts(context, contextCallback)));

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
							logPagePing(finalizeContexts(context, contextCallback)); // Grab the min/max globals
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
		 * @param object context Custom context relating to the event
		 */
		function logPagePing(context) {
			refreshUrl();
			newDocumentTitle = documentAlias.title;
			if (newDocumentTitle !== lastDocumentTitle) {
				lastDocumentTitle = newDocumentTitle;
				lastConfigTitle = null;
			}
			core.trackPagePing(
				purify(configCustomUrl || locationHrefAlias),
				helpers.fixupTitle(lastConfigTitle || lastDocumentTitle),
				purify(customReferrer || configReferrerUrl),
				cleanOffset(minXOffset),
				cleanOffset(maxXOffset),
				cleanOffset(minYOffset),
				cleanOffset(maxYOffset),
				addCommonContexts(context));
			resetMaxScrolls();
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
		function logTransaction(orderId, affiliation, total, tax, shipping, city, state, country, currency, context) {
			core.trackEcommerceTransaction(orderId, affiliation, total, tax, shipping, city, state, country, currency, addCommonContexts(context));
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
		function logTransactionItem(orderId, sku, name, category, price, quantity, currency, context) {
			core.trackEcommerceTransactionItem(orderId, sku, name, category, price, quantity, currency, addCommonContexts(context));
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
					if (documentAlias[prefixPropertyName(prefix, 'hidden')]) {
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


		/************************************************************
		 * Constructor
		 ************************************************************/

		/*
		 * Initialize tracker
		 */
		updateDomainHash();

		initializeIdsAndCookies();

		if (argmap.crossDomainLinker) {
			decorateLinks(argmap.crossDomainLinker);
		}

		/************************************************************
		 * Public data and methods
		 ************************************************************/

		return {
			/**
			 * Get the current session id
			 *
			 * @return string 
			 */
			 getSessionId: function() {
			 	return getInternalSessionId();
			 },

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
			 * Get the user fingerprint
			 *
			 * @return string The user fingerprint
			 */
			getUserFingerprint: function () {
				return userFingerprint;
			},

			/**
			* Specify the app ID
			*
			* @param int|string appId
			*/
			setAppId: function (appId) {
				helpers.warn('setAppId is deprecated. Instead add an "appId" field to the argmap argument of newTracker.');
				core.setAppId(appId);
			},

			/**
			 * Override referrer
			 *
			 * @param string url
			 */
			setReferrerUrl: function (url) {
				customReferrer = url;
			},

			/**
			 * Override url
			 *
			 * @param string url
			 */
			setCustomUrl: function (url) {
				refreshUrl();
				configCustomUrl = resolveRelativeReference(locationHrefAlias, url);
			},

			/**
			 * Override document.title
			 *
			 * @param string title
			 */
			setDocumentTitle: function (title) {
				// So we know what document.title was at the time of trackPageView
				lastDocumentTitle = documentAlias.title;
				lastConfigTitle = title;
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
				configVisitorCookieTimeout = timeout;
			},

			/**
			 * Set session cookie timeout (in seconds)
			 *
			 * @param int timeout
			 */
			setSessionCookieTimeout: function (timeout) {
				configSessionCookieTimeout = timeout;
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
			 * Enable querystring decoration for links pasing a filter
			 *
			 * @param function crossDomainLinker Function used to determine which links to decorate
			 */
			crossDomainLinker: function (crossDomainLinkerCriterion) {
				decorateLinks(crossDomainLinkerCriterion);
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
			 * @param bool trackContent Whether to track the innerHTML of the link element
			 * @param array context Context for all link click events
			 */
			enableLinkClickTracking: function (criterion, pseudoClicks, trackContent, context) {
				if (mutSnowplowState.hasLoaded) {
					// the load event has already fired, add the click listeners now
					linkTrackingManager.configureLinkClickTracking(criterion, pseudoClicks, trackContent, context);
					linkTrackingManager.addClickListeners();
				} else {
					// defer until page has loaded
					mutSnowplowState.registeredOnLoadHandlers.push(function () {
						linkTrackingManager.configureLinkClickTracking(criterion, pseudoClicks, trackContent, context);
						linkTrackingManager.addClickListeners();
					});
				}
			},

			/**
			 * Add click event listeners to links which have been added to the page since the
			 * last time enableLinkClickTracking or refreshLinkClickTracking was used
			 */
			refreshLinkClickTracking: function () {
				if (mutSnowplowState.hasLoaded) {
					linkTrackingManager.addClickListeners();
				} else {
					mutSnowplowState.registeredOnLoadHandlers.push(function () {
						linkTrackingManager.addClickListeners();
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
				configMinimumVisitTime = new Date().getTime() + minimumVisitLength * 1000;
				configHeartBeatTimer = heartBeatDelay * 1000;
			},

			/**
			 * Enables automatic form tracking.
			 * An event will be fired when a form field is changed or a form submitted.
			 * This can be called multiple times: only forms not already tracked will be tracked.
			 *
			 * @param object config Configuration object determining which forms and fields to track.
			 *                      Has two properties: "forms" and "fields"
			 * @param array context Context for all form tracking events
			 */
			enableFormTracking: function (config, context) {
				if (mutSnowplowState.hasLoaded) {
					formTrackingManager.configureFormTracking(config);
					formTrackingManager.addFormListeners(context);
				} else {
					mutSnowplowState.registeredOnLoadHandlers.push(function () {
						formTrackingManager.configureFormTracking(config);
						formTrackingManager.addFormListeners(context);
					});
				}
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
				refreshUrl();
				businessUserId = helpers.fromQuerystring(querystringField, locationHrefAlias);
			},

			/**
			 * Set the business-defined user ID for this user using the referrer querystring.
			 * 
			 * @param string queryName Name of a querystring name-value pair
			 */
			setUserIdFromReferrer: function(querystringField) {
				refreshUrl();
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
				core.setPlatform(platform);
			},

			/**
			*
			* Enable Base64 encoding for unstructured event payload
			*
			* @param bool enabled A boolean value indicating if the Base64 encoding for unstructured events should be enabled or not
			*/
			encodeBase64: function (enabled) {
				helpers.warn('This usage of encodeBase64 is deprecated. Instead add an "encodeBase64" field to the argmap argument of newTracker.');
				core.setBase64Encoding(enabled);
			},

			/**
			 * Send all events in the outQueue
			 * Use only when sending POSTs with a bufferSize of at least 2
			 */
			flushBuffer: function () {
				outQueueManager.executeQueue();
			},

			/**
			 * Add the geolocation context to all events
			 */
			enableGeolocationContext: enableGeolocationContext,

			/**
			 * Log visit to this page
			 *
			 * @param string customTitle
			 * @param object Custom context relating to the event
			 * @param object contextCallback Function returning an array of contexts
			 */
			trackPageView: function (customTitle, context, contextCallback) {
				trackCallback(function () {
					logPageView(customTitle, context, contextCallback);
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
				core.trackStructEvent(category, action, label, property, value, addCommonContexts(context));
			},

			/**
			 * Track an unstructured event happening on this page.
			 *
			 * @param object eventJson Contains the properties and schema location for the event
			 * @param object context Custom context relating to the event
			 */
			trackUnstructEvent: function (eventJson, context) {
				core.trackUnstructEvent(eventJson, addCommonContexts(context));
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

			/**
			 * Manually log a click from your own code
			 *
			 * @param string elementId
			 * @param array elementClasses
			 * @param string elementTarget
			 * @param string targetUrl
			 * @param string elementContent innerHTML of the element
			 * @param object Custom context relating to the event
			 */
			// TODO: break this into trackLink(destUrl) and trackDownload(destUrl)
			trackLinkClick: function(targetUrl, elementId, elementClasses, elementTarget, elementContent, context) {
				trackCallback(function () {
					core.trackLinkClick(targetUrl, elementId, elementClasses, elementTarget, elementContent, addCommonContexts(context));
				});
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
					core.trackAdImpression(impressionId, costModel, cost, targetUrl, bannerId, zoneId, advertiserId, campaignId, addCommonContexts(context));
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
				core.trackAdClick(targetUrl, clickId, costModel, cost, bannerId, zoneId, impressionId, advertiserId, campaignId, addCommonContexts(context));
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
				core.trackAdConversion(conversionId, costModel, cost, category, action, property, initialValue, advertiserId, campaignId, addCommonContexts(context));
			},

			/**
			 * Track a social interaction event
			 *
			 * @param string action (required) Social action performed
			 * @param string network (required) Social network
			 * @param string target Object of the social action e.g. the video liked, the tweet retweeted
			 * @param object Custom context relating to the event
			 */
			trackSocialInteraction: function(action, network, target, context) {
				core.trackSocialInteraction(action, network, target, addCommonContexts(context));
			},

			/**
			 * Track an add-to-cart event
			 *
			 * @param string sku Required. Item's SKU code.
			 * @param string name Optional. Product name.
			 * @param string category Optional. Product category.
			 * @param string unitPrice Optional. Product price.
			 * @param string quantity Required. Quantity added.
			 * @param string currency Optional. Product price currency.
			 * @param array context Optional. Context relating to the event.
			 */
			trackAddToCart: function(sku, name, category, unitPrice, quantity, currency, context) {
				core.trackAddToCart(sku, name, category, unitPrice, quantity, currency, addCommonContexts(context));
			},

			/**
			 * Track a remove-from-cart event
			 *
			 * @param string sku Required. Item's SKU code.
			 * @param string name Optional. Product name.
			 * @param string category Optional. Product category.
			 * @param string unitPrice Optional. Product price.
			 * @param string quantity Required. Quantity removed.
			 * @param string currency Optional. Product price currency.
			 * @param array context Optional. Context relating to the event.
			 */
			trackRemoveFromCart: function(sku, name, category, unitPrice, quantity, currency, context) {
				core.trackRemoveFromCart(sku, name, category, unitPrice, quantity, currency, addCommonContexts(context));
			},

			/**
			 * Track an internal search event
			 *
			 * @param array terms Search terms
			 * @param object filters Search filters
			 * @param number totalResults Number of results
			 * @param number pageResults Number of results displayed on page
			 * @param array context Optional. Context relating to the event.
			 */
			trackSiteSearch: function(terms, filters, totalResults, pageResults, context) {
				core.trackSiteSearch(terms, filters, totalResults, pageResults, addCommonContexts(context));
			},

			/**
			 * Track a timing event (such as the time taken for a resource to load)
			 *
			 * @param string category Required.
			 * @param string variable Required.
			 * @param number timing Required.
			 * @param string label Optional.
			 * @param array context Optional. Context relating to the event.
			 */
			trackTiming: function (category, variable, timing, label, context) {
				core.trackUnstructEvent({
					schema: 'iglu:com.snowplowanalytics.snowplow/timing/jsonschema/1-0-0',
					data: {
						category: category,
						variable: variable,
						timing: timing,
						label: label
					}
				}, addCommonContexts(context))
			}
		};
	};

}());
