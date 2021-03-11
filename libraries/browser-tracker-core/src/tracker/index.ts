/*
 * Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import {
  trackerCore,
  buildPagePing,
  buildPageView,
  CommonEventProperties,
  PayloadBuilder,
  SelfDescribingJson,
} from '@snowplow/tracker-core';
import hash from 'sha1';
import { v4 as uuid } from 'uuid';
import { detectDocumentSize, detectViewport } from '../detectors';
import {
  decorateQuerystring,
  findRootDomain,
  fixupDomain,
  getReferrer,
  addEventListener,
  getHostName,
  cookie,
  attemptGetLocalStorage,
  attemptWriteLocalStorage,
  attemptDeleteLocalStorage,
  deleteCookie,
  fixupTitle,
  warn,
  fromQuerystring,
  isInteger,
} from '../helpers';
import { OutQueueManager } from './out_queue';
import { fixupUrl } from '../proxies';
import { SharedState } from '../state';
import {
  PageViewEvent,
  ActivityCallback,
  ActivityCallbackData,
  TrackerConfiguration,
  BrowserTracker,
  ActivityTrackingConfiguration,
  ActivityTrackingConfigurationCallback,
  DisableAnonymousTrackingConfiguration,
  EnableAnonymousTrackingConfiguration,
  FlushBufferConfiguration,
} from './types';

/** Repesents an instance of an activity tracking configuration */
type ActivityConfig = {
  /** The callback to fire based on heart beat */
  callback: ActivityCallback;
  /** The minimum time that must have elapsed before first heartbeat */
  configMinimumVisitLength: number;
  /** The interval at which the callback will be fired */
  configHeartBeatTimer: number;
  /** The setInterval identifier */
  activityInterval?: number;
};

/** The configurations for the two types of Activity Tracking */
type ActivityConfigurations = {
  /** The configuration for enableActivityTrackingCallback */
  callback?: ActivityConfig;
  /** The configuration for enableActivityTracking */
  pagePing?: ActivityConfig;
};

/** The configuration for if either activity tracking system is enable */
type ActivityTrackingConfig = {
  /** Tracks if activity tracking is enabled */
  enabled: boolean;
  /** Tracks if activity tracking hooks have been installed */
  installed: boolean;
  /** Stores the configuration for each type of activity tracking */
  configurations: ActivityConfigurations;
};

/**
 * The Snowplow Tracker
 *
 * @param trackerId The unique identifier of the tracker
 * @param namespace The namespace of the tracker object
 * @param version The current version of the JavaScript Tracker
 * @param endpoint The collector endpoint to send events to, with or without protocol
 * @param sharedState An object containing state which is shared across tracker instances
 * @param trackerConfiguration Dictionary of configuration options
 */
export function Tracker(
  trackerId: string,
  namespace: string,
  version: string,
  endpoint: string,
  sharedState: SharedState,
  trackerConfiguration?: TrackerConfiguration
): BrowserTracker {
  const newTracker = (
    trackerId: string,
    namespace: string,
    version: string,
    endpoint: string,
    state: SharedState,
    trackerConfiguration: TrackerConfiguration = {}
  ) => {
    /************************************************************
     * Private members
     ************************************************************/

    //use POST if eventMethod isn't present on the newTrackerConfiguration
    trackerConfiguration.eventMethod = trackerConfiguration.eventMethod ?? 'post';

    const getStateStorageStrategy = (config: TrackerConfiguration) =>
        config.stateStorageStrategy ?? 'cookieAndLocalStorage',
      getAnonymousSessionTracking = (config: TrackerConfiguration) => {
        if (typeof config.anonymousTracking === 'boolean') {
          return false;
        }
        return config.anonymousTracking?.withSessionTracking === true ?? false;
      },
      getAnonymousServerTracking = (config: TrackerConfiguration) => {
        if (typeof config.anonymousTracking === 'boolean') {
          return false;
        }
        return config.anonymousTracking?.withServerAnonymisation === true ?? false;
      },
      getAnonymousTracking = (config: TrackerConfiguration) => !!config.anonymousTracking;

    // Get all injected plugins
    let plugins = trackerConfiguration.plugins ?? [];
    if (trackerConfiguration?.contexts?.webPage ?? true) {
      plugins.push(getWebPagePlugin()); // Defaults to including the Web Page context
    }

    let // Tracker core
      core = trackerCore(trackerConfiguration.encodeBase64 ?? true, plugins, function (payloadBuilder) {
        addBrowserData(payloadBuilder);
        sendRequest(payloadBuilder);
      }),
      // Aliases
      documentAlias = document,
      windowAlias = window,
      navigatorAlias = navigator,
      screenAlias = screen,
      browserLanguage = (navigatorAlias as any).userLanguage || navigatorAlias.language,
      documentCharset = documentAlias.characterSet || documentAlias.charset,
      // Current URL and Referrer URL
      locationArray = fixupUrl(windowAlias.location.hostname, windowAlias.location.href, getReferrer()),
      domainAlias = fixupDomain(locationArray[0]),
      locationHrefAlias = locationArray[1],
      configReferrerUrl = locationArray[2],
      customReferrer: string,
      // Platform defaults to web for this tracker
      configPlatform = trackerConfiguration.platform ?? 'web',
      // Snowplow collector URL
      configCollectorUrl = asCollectorUrl(endpoint),
      // Custom path for post requests (to get around adblockers)
      configPostPath = trackerConfiguration.postPath ?? '/com.snowplowanalytics.snowplow/tp2',
      // Site ID
      configTrackerSiteId = trackerConfiguration.appId ?? '',
      // Document URL
      configCustomUrl: string,
      // Document title
      lastDocumentTitle = documentAlias.title,
      // Custom title
      lastConfigTitle: string | null | undefined,
      // Controls whether activity tracking page ping event timers are reset on page view events
      resetActivityTrackingOnPageView = trackerConfiguration.resetActivityTrackingOnPageView ?? true,
      // Disallow hash tags in URL. TODO: Should this be set to true by default?
      configDiscardHashTag: boolean,
      // Disallow brace in URL.
      configDiscardBrace: boolean,
      // First-party cookie name prefix
      configCookieNamePrefix = trackerConfiguration.cookieName ?? '_sp_',
      // First-party cookie domain
      // User agent defaults to origin hostname
      configCookieDomain = trackerConfiguration.cookieDomain ?? undefined,
      // First-party cookie path
      // Default is user agent defined.
      configCookiePath = '/',
      // First-party cookie samesite attribute
      configCookieSameSite = trackerConfiguration.cookieSameSite ?? 'None',
      // First-party cookie secure attribute
      configCookieSecure = trackerConfiguration.cookieSecure ?? true,
      // Do Not Track browser feature
      dnt = navigatorAlias.doNotTrack || (navigatorAlias as any).msDoNotTrack || windowAlias.doNotTrack,
      // Do Not Track
      configDoNotTrack =
        typeof trackerConfiguration.respectDoNotTrack !== 'undefined'
          ? trackerConfiguration.respectDoNotTrack && (dnt === 'yes' || dnt === '1')
          : false,
      // Opt out of cookie tracking
      configOptOutCookie: string,
      // Life of the visitor cookie (in seconds)
      configVisitorCookieTimeout = trackerConfiguration.cookieLifetime ?? 63072000, // 2 years
      // Life of the session cookie (in seconds)
      configSessionCookieTimeout = trackerConfiguration.sessionCookieTimeout ?? 1800, // 30 minutes
      // Allows tracking user session (using cookies or local storage), can only be used with anonymousTracking
      configAnonymousSessionTracking = getAnonymousSessionTracking(trackerConfiguration),
      // Will send a header to server to prevent returning cookie and capturing IP
      configAnonymousServerTracking = getAnonymousServerTracking(trackerConfiguration),
      // Sets tracker to work in anonymous mode without accessing client storage
      configAnonymousTracking = getAnonymousTracking(trackerConfiguration),
      // Strategy defining how to store the state: cookie, localStorage, cookieAndLocalStorage or none
      configStateStorageStrategy = getStateStorageStrategy(trackerConfiguration),
      // Last activity timestamp
      lastActivityTime: number,
      // The last time an event was fired on the page - used to invalidate session if cookies are disabled
      lastEventTime = new Date().getTime(),
      // How are we scrolling?
      minXOffset: number,
      maxXOffset: number,
      minYOffset: number,
      maxYOffset: number,
      // Domain hash value
      domainHash: string,
      // Domain unique user ID
      domainUserId: string,
      // ID for the current session
      memorizedSessionId: string,
      // Index for the current session - kept in memory in case cookies are disabled
      memorizedVisitCount = 1,
      // Business-defined unique user ID
      businessUserId: string | null,
      // Manager for local storage queue
      outQueue = OutQueueManager(
        trackerId,
        state,
        configStateStorageStrategy == 'localStorage' || configStateStorageStrategy == 'cookieAndLocalStorage',
        trackerConfiguration.eventMethod,
        configPostPath,
        trackerConfiguration.bufferSize ?? 1,
        trackerConfiguration.maxPostBytes ?? 40000,
        trackerConfiguration.useStm ?? true,
        trackerConfiguration.maxLocalStorageQueueSize ?? 1000,
        trackerConfiguration.connectionTimeout ?? 5000,
        configAnonymousServerTracking
      ),
      // Whether pageViewId should be regenerated after each trackPageView. Affect web_page context
      preservePageViewId = false,
      // Whether first trackPageView was fired and pageViewId should not be changed anymore until reload
      pageViewSent = false,
      // Activity tracking config for callback and pacge ping variants
      activityTrackingConfig: ActivityTrackingConfig = {
        enabled: false,
        installed: false, // Guard against installing the activity tracker more than once per Tracker instance
        configurations: {},
      };

    if (trackerConfiguration.hasOwnProperty('discoverRootDomain') && trackerConfiguration.discoverRootDomain) {
      configCookieDomain = findRootDomain(configCookieSameSite, configCookieSecure);
    }

    // Set up unchanging name-value pairs
    core.setTrackerVersion(version);
    core.setTrackerNamespace(namespace);
    core.setAppId(configTrackerSiteId);
    core.setPlatform(configPlatform);
    core.addPayloadPair('cookie', navigatorAlias.cookieEnabled ? '1' : '0');
    core.addPayloadPair('cs', documentCharset);
    core.addPayloadPair('lang', browserLanguage);
    core.addPayloadPair('res', screenAlias.width + 'x' + screenAlias.height);
    core.addPayloadPair('cd', screenAlias.colorDepth);

    /*
     * Initialize tracker
     */
    updateDomainHash();

    initializeIdsAndCookies();

    if (trackerConfiguration.crossDomainLinker) {
      decorateLinks(trackerConfiguration.crossDomainLinker);
    }

    /**
     * Recalculate the domain, URL, and referrer
     */
    function refreshUrl() {
      locationArray = fixupUrl(windowAlias.location.hostname, windowAlias.location.href, getReferrer());

      // If this is a single-page app and the page URL has changed, then:
      //   - if the new URL's querystring contains a "refer(r)er" parameter, use it as the referrer
      //   - otherwise use the old URL as the referer
      if (locationArray[1] !== locationHrefAlias) {
        configReferrerUrl = getReferrer(locationHrefAlias);
      }

      domainAlias = fixupDomain(locationArray[0]);
      locationHrefAlias = locationArray[1];
    }

    /**
     * Decorate the querystring of a single link
     *
     * @param event e The event targeting the link
     */
    function linkDecorationHandler(evt: Event) {
      var timestamp = new Date().getTime();
      let elt = evt.target as HTMLAnchorElement | HTMLAreaElement | null;
      if (elt?.href) {
        elt.href = decorateQuerystring(elt.href, '_sp', domainUserId + '.' + timestamp);
      }
    }

    /**
     * Enable querystring decoration for links pasing a filter
     * Whenever such a link is clicked on or navigated to via the keyboard,
     * add "_sp={{duid}}.{{timestamp}}" to its querystring
     *
     * @param crossDomainLinker Function used to determine which links to decorate
     */
    function decorateLinks(crossDomainLinker: (elt: HTMLAnchorElement | HTMLAreaElement) => boolean) {
      for (var i = 0; i < documentAlias.links.length; i++) {
        var elt = documentAlias.links[i];
        if (!(elt as any).spDecorationEnabled && crossDomainLinker(elt)) {
          addEventListener(elt, 'click', linkDecorationHandler, true);
          addEventListener(elt, 'mousedown', linkDecorationHandler, true);

          // Don't add event listeners more than once
          (elt as any).spDecorationEnabled = true;
        }
      }
    }

    /*
     * Removes hash tag from the URL
     *
     * URLs are purified before being recorded in the cookie,
     * or before being sent as GET parameters
     */
    function purify(url: string) {
      var targetPattern;

      if (configDiscardHashTag) {
        targetPattern = new RegExp('#.*');
        url = url.replace(targetPattern, '');
      }

      if (configDiscardBrace) {
        targetPattern = new RegExp('[{}]', 'g');
        url = url.replace(targetPattern, '');
      }
      return url;
    }

    /*
     * Extract scheme/protocol from URL
     */
    function getProtocolScheme(url: string) {
      var e = new RegExp('^([a-z]+):'),
        matches = e.exec(url);

      return matches ? matches[1] : null;
    }

    /*
     * Resolve relative reference
     *
     * Note: not as described in rfc3986 section 5.2
     */
    function resolveRelativeReference(baseUrl: string, url: string) {
      var protocol = getProtocolScheme(url),
        i;

      if (protocol) {
        return url;
      }

      if (url.slice(0, 1) === '/') {
        return getProtocolScheme(baseUrl) + '://' + getHostName(baseUrl) + url;
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
    function sendRequest(request: PayloadBuilder) {
      // Set to true if Opt-out cookie is defined
      var toOptoutByCookie;
      if (configOptOutCookie) {
        toOptoutByCookie = !!cookie(configOptOutCookie);
      } else {
        toOptoutByCookie = false;
      }

      if (!(configDoNotTrack || toOptoutByCookie)) {
        outQueue.enqueueRequest(request.build(), configCollectorUrl);
      }
    }

    /*
     * Get cookie name with prefix and domain hash
     */
    function getSnowplowCookieName(baseName: string) {
      return configCookieNamePrefix + baseName + '.' + domainHash;
    }

    /*
     * Cookie getter.
     */
    function getSnowplowCookieValue(cookieName: string) {
      var fullName = getSnowplowCookieName(cookieName);
      if (configStateStorageStrategy == 'localStorage') {
        return attemptGetLocalStorage(fullName);
      } else if (configStateStorageStrategy == 'cookie' || configStateStorageStrategy == 'cookieAndLocalStorage') {
        return cookie(fullName);
      }
      return undefined;
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
      var iebody =
        documentAlias.compatMode && documentAlias.compatMode !== 'BackCompat'
          ? documentAlias.documentElement
          : documentAlias.body;
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
     */
    function cleanOffset(offset: number) {
      return Math.round(offset);
    }

    /*
     * Sets or renews the session cookie
     */
    function setSessionCookie() {
      var cookieName = getSnowplowCookieName('ses');
      var cookieValue = '*';
      setCookie(cookieName, cookieValue, configSessionCookieTimeout);
    }

    /*
     * Sets the Visitor ID cookie: either the first time loadDomainUserIdCookie is called
     * or when there is a new visit or a new page view
     */
    function setDomainUserIdCookie(
      domainUserId: string,
      createTs: number,
      visitCount: number,
      nowTs: number,
      lastVisitTs: number,
      sessionId: string
    ) {
      var cookieName = getSnowplowCookieName('id');
      var cookieValue =
        domainUserId + '.' + createTs + '.' + visitCount + '.' + nowTs + '.' + lastVisitTs + '.' + sessionId;
      setCookie(cookieName, cookieValue, configVisitorCookieTimeout);
    }

    /*
     * no-op if anonymousTracking enabled, will still set cookies if anonymousSessionTracking is enabled
     * Sets a cookie based on the storage strategy:
     * - if 'localStorage': attemps to write to local storage
     * - if 'cookie' or 'cookieAndLocalStorage': writes to cookies
     * - otherwise: no-op
     */
    function setCookie(name: string, value: string, timeout: number) {
      if (configAnonymousTracking && !configAnonymousSessionTracking) {
        return;
      }

      if (configStateStorageStrategy == 'localStorage') {
        attemptWriteLocalStorage(name, value, timeout);
      } else if (configStateStorageStrategy == 'cookie' || configStateStorageStrategy == 'cookieAndLocalStorage') {
        cookie(name, value, timeout, configCookiePath, configCookieDomain, configCookieSameSite, configCookieSecure);
      }
    }

    /**
     * Generate a pseudo-unique ID to identify this user
     */
    function createNewDomainUserId() {
      return uuid();
    }

    /**
     * Clears all cookie and local storage for id and ses values
     */
    function deleteCookies() {
      const idname = getSnowplowCookieName('id');
      const sesname = getSnowplowCookieName('ses');
      attemptDeleteLocalStorage(idname);
      attemptDeleteLocalStorage(sesname);
      deleteCookie(idname, configCookieDomain, configCookieSameSite, configCookieSecure);
      deleteCookie(sesname, configCookieDomain, configCookieSameSite, configCookieSecure);
    }

    /*
     * Load the domain user ID and the session ID
     * Set the cookies (if cookies are enabled)
     */
    function initializeIdsAndCookies() {
      if (configAnonymousTracking && !configAnonymousSessionTracking) {
        return;
      }

      var sesCookieSet = configStateStorageStrategy != 'none' && !!getSnowplowCookieValue('ses');
      var idCookieComponents = loadDomainUserIdCookie();

      if (idCookieComponents[1]) {
        domainUserId = idCookieComponents[1] as string;
      } else if (!configAnonymousTracking) {
        domainUserId = createNewDomainUserId();
        idCookieComponents[1] = domainUserId;
      } else {
        domainUserId = '';
        idCookieComponents[1] = domainUserId;
      }

      memorizedSessionId = idCookieComponents[6] as string;

      if (!sesCookieSet) {
        // Increment the session ID
        (idCookieComponents[3] as number)++;
        // Create a new sessionId
        memorizedSessionId = uuid();
        idCookieComponents[6] = memorizedSessionId;
        // Set lastVisitTs to currentVisitTs
        idCookieComponents[5] = idCookieComponents[4];
      }

      if (configStateStorageStrategy != 'none') {
        setSessionCookie();
        // Update currentVisitTs
        idCookieComponents[4] = Math.round(new Date().getTime() / 1000);
        idCookieComponents.shift();
        setDomainUserIdCookie.apply(null, idCookieComponents as any); // TODO: Remove any
      }
    }

    /*
     * Load visitor ID cookie
     */
    function loadDomainUserIdCookie() {
      if (configStateStorageStrategy == 'none') {
        return [];
      }
      var now = new Date(),
        nowTs = Math.round(now.getTime() / 1000),
        id = getSnowplowCookieValue('id'),
        tmpContainer;

      if (id) {
        tmpContainer = id.split('.');
        // cookies enabled
        tmpContainer.unshift('0');
      } else {
        tmpContainer = [
          // cookies disabled
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
          '',
        ];
      }

      if (!tmpContainer[6]) {
        // session id
        tmpContainer[6] = uuid();
      }

      return tmpContainer;
    }

    /*
     * Attaches common web fields to every request (resolution, url, referrer, etc.)
     * Also sets the required cookies.
     */
    function addBrowserData(payloadBuilder: PayloadBuilder) {
      const anonymizeOr = (value: string | number | null) => (configAnonymousTracking ? null : value);
      const anonymizeSessionOr = (value: string | number) =>
        configAnonymousSessionTracking ? value : anonymizeOr(value);

      var nowTs = Math.round(new Date().getTime() / 1000),
        ses = getSnowplowCookieValue('ses'),
        id = loadDomainUserIdCookie(),
        cookiesDisabled = id[0],
        _domainUserId = id[1] as string, // We could use the global (domainUserId) but this is better etiquette
        createTs = id[2] as number,
        visitCount = id[3] as number,
        currentVisitTs = id[4] as number,
        lastVisitTs = id[5] as number,
        sessionIdFromCookie = id[6] as string;

      var toOptoutByCookie;
      if (configOptOutCookie) {
        toOptoutByCookie = !!cookie(configOptOutCookie);
      } else {
        toOptoutByCookie = false;
      }

      if (configDoNotTrack || toOptoutByCookie) {
        deleteCookies();
        return;
      }

      // If cookies are enabled, base visit count and session ID on the cookies
      if (cookiesDisabled === '0') {
        memorizedSessionId = sessionIdFromCookie as string;

        // New session?
        if (!ses && configStateStorageStrategy != 'none') {
          // New session (aka new visit)
          (visitCount as number)++;
          // Update the last visit timestamp
          lastVisitTs = currentVisitTs;
          // Regenerate the session ID
          memorizedSessionId = uuid();
        }

        memorizedVisitCount = visitCount as number;
      } else if (new Date().getTime() - lastEventTime > configSessionCookieTimeout * 1000) {
        memorizedSessionId = uuid();
        memorizedVisitCount++;
      }

      payloadBuilder.add('vp', detectViewport());
      payloadBuilder.add('ds', detectDocumentSize());
      payloadBuilder.add('vid', anonymizeSessionOr(memorizedVisitCount));
      payloadBuilder.add('sid', anonymizeSessionOr(memorizedSessionId));
      payloadBuilder.add('duid', anonymizeOr(_domainUserId)); // Set to our local variable
      payloadBuilder.add('uid', anonymizeOr(businessUserId));

      refreshUrl();

      payloadBuilder.add('refr', purify(customReferrer || configReferrerUrl));

      // Add the page URL last as it may take us over the IE limit (and we don't always need it)
      payloadBuilder.add('url', purify(configCustomUrl || locationHrefAlias));

      // Update cookies
      if (configStateStorageStrategy != 'none') {
        setDomainUserIdCookie(_domainUserId, createTs, memorizedVisitCount, nowTs, lastVisitTs, memorizedSessionId);
        setSessionCookie();
      }

      lastEventTime = new Date().getTime();
    }

    /**
     * Adds the protocol in front of our collector URL
     *
     * @param string collectorUrl The collector URL with or without protocol
     * @returns string collectorUrl The tracker URL with protocol
     */
    function asCollectorUrl(collectorUrl: string) {
      if (collectorUrl.indexOf('http') === 0) {
        return collectorUrl;
      }

      return ('https:' === documentAlias.location.protocol ? 'https' : 'http') + '://' + collectorUrl;
    }

    /**
     * Initialize new `pageViewId` if it shouldn't be preserved.
     * Should be called when `trackPageView` is invoked
     */
    function resetPageView() {
      if (!preservePageViewId || state.pageViewId == null) {
        state.pageViewId = uuid();
      }
    }

    /**
     * Safe function to get `pageViewId`.
     * Generates it if it wasn't initialized by other tracker
     */
    function getPageViewId() {
      if (state.pageViewId == null) {
        state.pageViewId = uuid();
      }
      return state.pageViewId;
    }

    /**
     * Put together a web page context with a unique UUID for the page view
     *
     * @returns web_page context
     */
    function getWebPagePlugin() {
      return {
        contexts: () => {
          return [
            {
              schema: 'iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0',
              data: {
                id: getPageViewId(),
              },
            },
          ];
        },
      };
    }

    /**
     * Expires current session and starts a new session.
     */
    function newSession() {
      // If cookies are enabled, base visit count and session ID on the cookies
      var nowTs = Math.round(new Date().getTime() / 1000),
        id = loadDomainUserIdCookie(),
        cookiesDisabled = id[0],
        _domainUserId = id[1] as string, // We could use the global (domainUserId) but this is better etiquette
        createTs = id[2] as number,
        visitCount = id[3] as number,
        currentVisitTs = id[4] as number,
        lastVisitTs = id[5] as number,
        sessionIdFromCookie = id[6] as string;

      // When cookies are enabled
      if (cookiesDisabled === '0') {
        memorizedSessionId = sessionIdFromCookie;

        // When cookie/local storage is enabled - make a new session
        if (configStateStorageStrategy != 'none') {
          // New session (aka new visit)
          visitCount++;
          // Update the last visit timestamp
          lastVisitTs = currentVisitTs;
          // Regenerate the session ID
          memorizedSessionId = uuid();
        }

        memorizedVisitCount = visitCount;

        // Create a new session cookie
        setSessionCookie();
      } else {
        memorizedSessionId = uuid();
        memorizedVisitCount++;
      }

      // Update cookies
      if (configStateStorageStrategy != 'none') {
        setDomainUserIdCookie(_domainUserId, createTs, memorizedVisitCount, nowTs, lastVisitTs, memorizedSessionId);
        setSessionCookie();
      }

      lastEventTime = new Date().getTime();
    }

    /**
     * Combine an array of unchanging contexts with the result of a context-creating function
     *
     * @param staticContexts Array of custom contexts
     * @param contextCallback Function returning an array of contexts
     */
    function finalizeContexts(
      staticContexts?: Array<SelfDescribingJson> | null,
      contextCallback?: (() => Array<SelfDescribingJson>) | null
    ) {
      return (staticContexts || []).concat(contextCallback ? contextCallback() : []);
    }

    function logPageView({ title, context, timestamp, contextCallback }: PageViewEvent & CommonEventProperties) {
      refreshUrl();
      if (pageViewSent) {
        // Do not reset pageViewId if previous events were not page_view
        resetPageView();
      }
      pageViewSent = true;

      // So we know what document.title was at the time of trackPageView
      lastDocumentTitle = documentAlias.title;
      lastConfigTitle = title;

      // Fixup page title
      var pageTitle = fixupTitle(lastConfigTitle || lastDocumentTitle);

      // Log page view
      core.track(
        buildPageView({
          pageUrl: purify(configCustomUrl || locationHrefAlias),
          pageTitle,
          referrer: purify(customReferrer || configReferrerUrl),
        }),
        finalizeContexts(context, contextCallback),
        timestamp
      );

      // Send ping (to log that user has stayed on page)
      var now = new Date();
      var installingActivityTracking = false;

      if (activityTrackingConfig.enabled && !activityTrackingConfig.installed) {
        activityTrackingConfig.installed = true;
        installingActivityTracking = true;

        // Add mousewheel event handler, detect passive event listeners for performance
        var detectPassiveEvents: { update: () => void; hasSupport?: boolean } = {
          update: function update() {
            if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
              var passive = false;
              var options = Object.defineProperty({}, 'passive', {
                get: function get() {
                  passive = true;
                },
              });
              // note: have to set and remove a no-op listener instead of null
              // (which was used previously), becasue Edge v15 throws an error
              // when providing a null callback.
              // https://github.com/rafrex/detect-passive-events/pull/3
              var noop = function noop() {};
              window.addEventListener('testPassiveEventSupport', noop, options);
              window.removeEventListener('testPassiveEventSupport', noop, options);
              detectPassiveEvents.hasSupport = passive;
            }
          },
        };
        detectPassiveEvents.update();

        // Detect available wheel event
        var wheelEvent =
          'onwheel' in document.createElement('div')
            ? 'wheel' // Modern browsers support "wheel"
            : (document as any).onmousewheel !== undefined
            ? 'mousewheel' // Webkit and IE support at least "mousewheel"
            : 'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox

        if (Object.prototype.hasOwnProperty.call(detectPassiveEvents, 'hasSupport')) {
          addEventListener(documentAlias, wheelEvent, activityHandler, { passive: true });
        } else {
          addEventListener(documentAlias, wheelEvent, activityHandler);
        }

        // Capture our initial scroll points
        resetMaxScrolls();

        // Add event handlers; cross-browser compatibility here varies significantly
        // @see http://quirksmode.org/dom/events
        const documentHandlers = ['click', 'mouseup', 'mousedown', 'mousemove', 'keypress', 'keydown', 'keyup'];
        const windowHandlers = ['resize', 'focus', 'blur'];
        const listener = (_: Document | Window, handler = activityHandler) => (ev: string) =>
          addEventListener(documentAlias, ev, handler);

        documentHandlers.forEach(listener(documentAlias));
        windowHandlers.forEach(listener(windowAlias));
        listener(windowAlias, scrollHandler)('scroll');
      }

      if (activityTrackingConfig.enabled && (resetActivityTrackingOnPageView || installingActivityTracking)) {
        // Periodic check for activity.
        lastActivityTime = now.getTime();

        let key: keyof ActivityConfigurations;
        for (key in activityTrackingConfig.configurations) {
          const config = activityTrackingConfig.configurations[key];
          if (config) {
            //Clear page ping heartbeat on new page view
            window.clearInterval(config.activityInterval);

            activityInterval(config, context, contextCallback);
          }
        }
      }
    }

    function activityInterval(
      config: ActivityConfig,
      context?: Array<SelfDescribingJson> | null,
      contextCallback?: (() => Array<SelfDescribingJson>) | null
    ) {
      const executePagePing = (cb: ActivityCallback, c: Array<SelfDescribingJson>) => {
        refreshUrl();
        cb({ context: c, pageViewId: getPageViewId(), minXOffset, minYOffset, maxXOffset, maxYOffset });
        resetMaxScrolls();
      };

      const timeout = () => {
        var now = new Date();

        // There was activity during the heart beat period;
        // on average, this is going to overstate the visitDuration by configHeartBeatTimer/2
        if (lastActivityTime + config.configMinimumVisitLength > now.getTime()) {
          executePagePing(config.callback, finalizeContexts(context, contextCallback));
        }

        config.activityInterval = windowAlias.setInterval(heartbeat, config.configHeartBeatTimer);
      };

      const heartbeat = () => {
        var now = new Date();

        // There was activity during the heart beat period;
        // on average, this is going to overstate the visitDuration by configHeartBeatTimer/2
        if (lastActivityTime + config.configHeartBeatTimer > now.getTime()) {
          executePagePing(config.callback, finalizeContexts(context, contextCallback));
        }
      };

      if (config.configMinimumVisitLength != 0) {
        config.activityInterval = windowAlias.setTimeout(timeout, config.configMinimumVisitLength);
      } else {
        config.activityInterval = windowAlias.setInterval(heartbeat, config.configHeartBeatTimer);
      }
    }

    /**
     * Configure the activity tracking and ensures integer values for min visit and heartbeat
     */
    function configureActivityTracking(
      configuration: ActivityTrackingConfiguration & ActivityTrackingConfigurationCallback
    ): ActivityConfig | undefined {
      const { minimumVisitLength, heartbeatDelay, callback } = configuration;
      if (isInteger(minimumVisitLength) && isInteger(heartbeatDelay)) {
        return {
          configMinimumVisitLength: minimumVisitLength * 1000,
          configHeartBeatTimer: heartbeatDelay * 1000,
          callback,
        };
      }

      warn('Activity tracking not enabled, please provide integer values for minimumVisitLength and heartbeatDelay.');
      return undefined;
    }

    /**
     * Log that a user is still viewing a given page by sending a page ping.
     * Not part of the public API - only called from logPageView() above.
     */
    function logPagePing({ context, minXOffset, minYOffset, maxXOffset, maxYOffset }: ActivityCallbackData) {
      var newDocumentTitle = documentAlias.title;
      if (newDocumentTitle !== lastDocumentTitle) {
        lastDocumentTitle = newDocumentTitle;
        lastConfigTitle = undefined;
      }
      core.track(
        buildPagePing({
          pageUrl: purify(configCustomUrl || locationHrefAlias),
          pageTitle: fixupTitle(lastConfigTitle || lastDocumentTitle),
          referrer: purify(customReferrer || configReferrerUrl),
          minXOffset: cleanOffset(minXOffset),
          maxXOffset: cleanOffset(maxXOffset),
          minYOffset: cleanOffset(minYOffset),
          maxYOffset: cleanOffset(maxYOffset),
        }),
        context
      );
    }

    const apiMethods = {
      getDomainSessionIndex: function () {
        return memorizedVisitCount;
      },

      getPageViewId: function () {
        return getPageViewId();
      },

      newSession: newSession,

      getCookieName: function (basename: string) {
        return getSnowplowCookieName(basename);
      },

      getUserId: function () {
        return businessUserId;
      },

      getDomainUserId: function () {
        return loadDomainUserIdCookie()[1];
      },

      getDomainUserInfo: function () {
        return loadDomainUserIdCookie();
      },

      setReferrerUrl: function (url: string) {
        customReferrer = url;
      },

      setCustomUrl: function (url: string) {
        refreshUrl();
        configCustomUrl = resolveRelativeReference(locationHrefAlias, url);
      },

      setDocumentTitle: function (title: string) {
        // So we know what document.title was at the time of trackPageView
        lastDocumentTitle = documentAlias.title;
        lastConfigTitle = title;
      },

      discardHashTag: function (enableFilter: boolean) {
        configDiscardHashTag = enableFilter;
      },

      discardBrace: function (enableFilter: boolean) {
        configDiscardBrace = enableFilter;
      },

      setCookiePath: function (path: string) {
        configCookiePath = path;
        updateDomainHash();
      },

      setVisitorCookieTimeout: function (timeout: number) {
        configVisitorCookieTimeout = timeout;
      },

      crossDomainLinker: function (crossDomainLinkerCriterion: (elt: HTMLAnchorElement | HTMLAreaElement) => boolean) {
        decorateLinks(crossDomainLinkerCriterion);
      },

      enableActivityTracking: function (configuration: ActivityTrackingConfiguration) {
        activityTrackingConfig.enabled = true;
        activityTrackingConfig.configurations.pagePing = configureActivityTracking({
          ...configuration,
          callback: logPagePing,
        });
      },

      enableActivityTrackingCallback: function (
        configuration: ActivityTrackingConfiguration & ActivityTrackingConfigurationCallback
      ) {
        activityTrackingConfig.enabled = true;
        activityTrackingConfig.configurations.callback = configureActivityTracking(configuration);
      },

      updatePageActivity: function () {
        activityHandler();
      },

      setOptOutCookie: function (name: string) {
        configOptOutCookie = name;
      },

      setUserId: function (userId: string) {
        businessUserId = userId;
      },

      setUserIdFromLocation: function (querystringField: string) {
        refreshUrl();
        businessUserId = fromQuerystring(querystringField, locationHrefAlias);
      },

      setUserIdFromReferrer: function (querystringField: string) {
        refreshUrl();
        businessUserId = fromQuerystring(querystringField, configReferrerUrl);
      },

      setUserIdFromCookie: function (cookieName: string) {
        businessUserId = cookie(cookieName);
      },

      setCollectorUrl: function (collectorUrl: string) {
        configCollectorUrl = asCollectorUrl(collectorUrl);
        outQueue.setCollectorUrl(configCollectorUrl);
      },

      setBufferSize: function (newBufferSize: number) {
        outQueue.setBufferSize(newBufferSize);
      },

      flushBuffer: function (configuration: FlushBufferConfiguration = {}) {
        outQueue.executeQueue();
        if (configuration.newBufferSize) {
          outQueue.setBufferSize(configuration.newBufferSize);
        }
      },

      trackPageView: function (event: PageViewEvent & CommonEventProperties = {}) {
        logPageView(event);
      },

      preservePageViewId: function () {
        preservePageViewId = true;
      },

      disableAnonymousTracking: function (configuration?: DisableAnonymousTrackingConfiguration) {
        if (configuration && configuration.stateStorageStrategy) {
          trackerConfiguration.stateStorageStrategy = configuration.stateStorageStrategy;
          trackerConfiguration.anonymousTracking = false;
          configStateStorageStrategy = getStateStorageStrategy(trackerConfiguration);
        } else {
          trackerConfiguration.anonymousTracking = false;
        }

        configAnonymousTracking = getAnonymousTracking(trackerConfiguration);
        configAnonymousSessionTracking = getAnonymousSessionTracking(trackerConfiguration);
        configAnonymousServerTracking = getAnonymousServerTracking(trackerConfiguration);

        outQueue.setUseLocalStorage(
          configStateStorageStrategy == 'localStorage' || configStateStorageStrategy == 'cookieAndLocalStorage'
        );
        outQueue.setAnonymousTracking(configAnonymousServerTracking);

        initializeIdsAndCookies();

        outQueue.executeQueue(); // There might be some events in the queue we've been unable to send in anonymous mode
      },

      enableAnonymousTracking: function (configuration?: EnableAnonymousTrackingConfiguration) {
        trackerConfiguration.anonymousTracking = (configuration && configuration?.options) || true;

        configAnonymousTracking = getAnonymousTracking(trackerConfiguration);
        configAnonymousSessionTracking = getAnonymousSessionTracking(trackerConfiguration);
        configAnonymousServerTracking = getAnonymousServerTracking(trackerConfiguration);

        // Reset the page view, if not tracking the session, so can't stitch user into new events on the page view id
        if (!configAnonymousSessionTracking) {
          resetPageView();
        }

        outQueue.setAnonymousTracking(configAnonymousServerTracking);
      },

      clearUserData: deleteCookies,
    };

    return {
      ...apiMethods,
      id: trackerId,
      core: core,
      sharedState: state,
      plugins: plugins,
    };
  };

  // Initialise the tracker
  const { plugins, ...tracker } = newTracker(
    trackerId,
    namespace,
    version,
    endpoint,
    sharedState,
    trackerConfiguration
  );

  // Initialise each plugin with the tracker
  plugins.forEach((p) => {
    p.activateBrowserPlugin?.(tracker);
  });

  return tracker;
}
