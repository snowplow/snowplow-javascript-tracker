/*
 * Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang
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
  LOG,
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
  fromQuerystring,
  isInteger,
} from '../helpers';
import { BrowserPlugin } from '../plugins';
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
  BrowserPluginConfiguration,
  ClearUserDataConfiguration,
} from './types';
import {
  parseIdCookie,
  initializeDomainUserId,
  startNewIdCookieSession,
  updateNowTsInIdCookie,
  serializeIdCookie,
  sessionIdFromIdCookie,
  domainUserIdFromIdCookie,
  updateFirstEventInIdCookie,
  visitCountFromIdCookie,
  cookiesEnabledInIdCookie,
  ParsedIdCookie,
  ClientSession,
  clientSessionFromIdCookie,
  incrementEventIndexInIdCookie,
  emptyIdCookie
} from './id_cookie';

declare global {
  interface Navigator {
    msDoNotTrack: boolean;
  }
  interface Window {
    doNotTrack: boolean;
  }
}

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
 * @param trackerId - The unique identifier of the tracker
 * @param namespace - The namespace of the tracker object
 * @param version - The current version of the JavaScript Tracker
 * @param endpoint - The collector endpoint to send events to, with or without protocol
 * @param sharedState - An object containing state which is shared across tracker instances
 * @param trackerConfiguration - Dictionary of configuration options
 */
export function Tracker(
  trackerId: string,
  namespace: string,
  version: string,
  endpoint: string,
  sharedState: SharedState,
  trackerConfiguration: TrackerConfiguration = {}
): BrowserTracker {
  const browserPlugins: Array<BrowserPlugin> = [];

  const newTracker = (
    trackerId: string,
    namespace: string,
    version: string,
    endpoint: string,
    state: SharedState,
    trackerConfiguration: TrackerConfiguration
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
    browserPlugins.push(getBrowserDataPlugin());
    if (trackerConfiguration?.contexts?.webPage ?? true) {
      browserPlugins.push(getWebPagePlugin()); // Defaults to including the Web Page context
    }
    browserPlugins.push(...(trackerConfiguration.plugins ?? []));

    let // Tracker core
      core = trackerCore({
        base64: trackerConfiguration.encodeBase64,
        corePlugins: browserPlugins,
        callback: sendRequest,
      }),
      // Aliases
      browserLanguage = (navigator as any).userLanguage || navigator.language,
      documentCharset = document.characterSet || document.charset,
      // Current URL and Referrer URL
      locationArray = fixupUrl(window.location.hostname, window.location.href, getReferrer()),
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
      lastDocumentTitle = document.title,
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
      dnt = navigator.doNotTrack || navigator.msDoNotTrack || window.doNotTrack,
      // Do Not Track
      configDoNotTrack =
        typeof trackerConfiguration.respectDoNotTrack !== 'undefined'
          ? trackerConfiguration.respectDoNotTrack && (dnt === 'yes' || dnt === '1')
          : false,
      // Opt out of cookie tracking
      configOptOutCookie: string | null | undefined,
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
      businessUserId: string | null | undefined,
      // Manager for local storage queue
      outQueue = OutQueueManager(
        trackerId,
        state,
        configStateStorageStrategy == 'localStorage' || configStateStorageStrategy == 'cookieAndLocalStorage',
        trackerConfiguration.eventMethod,
        configPostPath,
        trackerConfiguration.bufferSize ?? 1,
        trackerConfiguration.maxPostBytes ?? 40000,
        trackerConfiguration.maxGetBytes ?? 0,
        trackerConfiguration.useStm ?? true,
        trackerConfiguration.maxLocalStorageQueueSize ?? 1000,
        trackerConfiguration.connectionTimeout ?? 5000,
        configAnonymousServerTracking,
        trackerConfiguration.customHeaders ?? {},
        trackerConfiguration.withCredentials ?? true
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
      },
      configSessionContext = trackerConfiguration.contexts?.session ?? false;

    if (trackerConfiguration.hasOwnProperty('discoverRootDomain') && trackerConfiguration.discoverRootDomain) {
      configCookieDomain = findRootDomain(configCookieSameSite, configCookieSecure);
    }

    // Set up unchanging name-value pairs
    core.setTrackerVersion(version);
    core.setTrackerNamespace(namespace);
    core.setAppId(configTrackerSiteId);
    core.setPlatform(configPlatform);
    core.addPayloadPair('cookie', navigator.cookieEnabled ? '1' : '0');
    core.addPayloadPair('cs', documentCharset);
    core.addPayloadPair('lang', browserLanguage);
    core.addPayloadPair('res', screen.width + 'x' + screen.height);
    core.addPayloadPair('cd', screen.colorDepth);

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
      locationArray = fixupUrl(window.location.hostname, window.location.href, getReferrer());

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
     * @param event - e The event targeting the link
     */
    function linkDecorationHandler(evt: Event) {
      const timestamp = new Date().getTime();
      const elt = evt.currentTarget as HTMLAnchorElement | HTMLAreaElement | null;
      if (elt?.href) {
        elt.href = decorateQuerystring(elt.href, '_sp', domainUserId + '.' + timestamp);
      }
    }

    /**
     * Enable querystring decoration for links pasing a filter
     * Whenever such a link is clicked on or navigated to via the keyboard,
     * add "_sp={{duid}}.{{timestamp}}" to its querystring
     *
     * @param crossDomainLinker - Function used to determine which links to decorate
     */
    function decorateLinks(crossDomainLinker: (elt: HTMLAnchorElement | HTMLAreaElement) => boolean) {
      for (let i = 0; i < document.links.length; i++) {
        const elt = document.links[i];
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
      let targetPattern;

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
      const e = new RegExp('^([a-z]+):'),
        matches = e.exec(url);

      return matches ? matches[1] : null;
    }

    /*
     * Resolve relative reference
     *
     * Note: not as described in rfc3986 section 5.2
     */
    function resolveRelativeReference(baseUrl: string, url: string) {
      let protocol = getProtocolScheme(url),
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
      let toOptoutByCookie;
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
      const fullName = getSnowplowCookieName(cookieName);
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
      const now = new Date();
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
     * Returns [pageXOffset, pageYOffset]
     */
    function getPageOffsets() {
      const documentElement = document.documentElement;
      if (documentElement) {
        return [documentElement.scrollLeft || window.pageXOffset, documentElement.scrollTop || window.pageYOffset];
      }

      return [0, 0];
    }

    /*
     * Quick initialization/reset of max scroll levels
     */
    function resetMaxScrolls() {
      const offsets = getPageOffsets();

      const x = offsets[0];
      minXOffset = x;
      maxXOffset = x;

      const y = offsets[1];
      minYOffset = y;
      maxYOffset = y;
    }

    /*
     * Check the max scroll levels, updating as necessary
     */
    function updateMaxScrolls() {
      const offsets = getPageOffsets();

      const x = offsets[0];
      if (x < minXOffset) {
        minXOffset = x;
      } else if (x > maxXOffset) {
        maxXOffset = x;
      }

      const y = offsets[1];
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
      const cookieName = getSnowplowCookieName('ses');
      const cookieValue = '*';
      setCookie(cookieName, cookieValue, configSessionCookieTimeout);
    }

    /*
     * Sets the Visitor ID cookie: either the first time loadDomainUserIdCookie is called
     * or when there is a new visit or a new page view
     */
    function setDomainUserIdCookie(idCookie: ParsedIdCookie) {
      const cookieName = getSnowplowCookieName('id');
      const cookieValue = serializeIdCookie(idCookie);
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
        cookie(
          name,
          value,
          timeout,
          configCookiePath,
          configCookieDomain,
          configCookieSameSite,
          configCookieSecure
        );
      }
    }

    /**
     * Clears all cookie and local storage for id and ses values
     */
    function clearUserDataAndCookies(configuration?: ClearUserDataConfiguration) {
      const idname = getSnowplowCookieName('id');
      const sesname = getSnowplowCookieName('ses');
      attemptDeleteLocalStorage(idname);
      attemptDeleteLocalStorage(sesname);
      deleteCookie(idname, configCookieDomain, configCookieSameSite, configCookieSecure);
      deleteCookie(sesname, configCookieDomain, configCookieSameSite, configCookieSecure);
      if (!configuration?.preserveSession) {
        memorizedSessionId = uuid();
        memorizedVisitCount = 0;
      }
      if (!configuration?.preserveUser) {
        domainUserId = uuid();
        businessUserId = null;
      }
    }

    /**
     * Toggle Anaonymous Tracking
     */
    function toggleAnonymousTracking(
      configuration?: EnableAnonymousTrackingConfiguration | DisableAnonymousTrackingConfiguration
    ) {
      if (configuration && configuration.stateStorageStrategy) {
        trackerConfiguration.stateStorageStrategy = configuration.stateStorageStrategy;
        configStateStorageStrategy = getStateStorageStrategy(trackerConfiguration);
      }

      configAnonymousTracking = getAnonymousTracking(trackerConfiguration);
      configAnonymousSessionTracking = getAnonymousSessionTracking(trackerConfiguration);
      configAnonymousServerTracking = getAnonymousServerTracking(trackerConfiguration);

      outQueue.setUseLocalStorage(
        configStateStorageStrategy == 'localStorage' || configStateStorageStrategy == 'cookieAndLocalStorage'
      );
      outQueue.setAnonymousTracking(configAnonymousServerTracking);
    }

    /*
     * Load the domain user ID and the session ID
     * Set the cookies (if cookies are enabled)
     */
    function initializeIdsAndCookies() {
      if (configAnonymousTracking && !configAnonymousSessionTracking) {
        return;
      }

      const sesCookieSet = configStateStorageStrategy != 'none' && !!getSnowplowCookieValue('ses');
      const idCookie = loadDomainUserIdCookie();

      domainUserId = initializeDomainUserId(idCookie, configAnonymousTracking);

      if (!sesCookieSet) {
        memorizedSessionId = startNewIdCookieSession(idCookie);
      } else {
        memorizedSessionId = sessionIdFromIdCookie(idCookie);
      }

      if (configStateStorageStrategy != 'none') {
        setSessionCookie();
        // Update currentVisitTs
        updateNowTsInIdCookie(idCookie);
        setDomainUserIdCookie(idCookie);
      }
    }

    /*
     * Load visitor ID cookie
     */
    function loadDomainUserIdCookie() {
      if (configStateStorageStrategy == 'none') {
        return emptyIdCookie();
      }
      let id = getSnowplowCookieValue('id') || '';
      return parseIdCookie(id, domainUserId, memorizedSessionId, memorizedVisitCount);
    }

    /**
     * Adds the protocol in front of our collector URL
     *
     * @param string - collectorUrl The collector URL with or without protocol
     * @returns string collectorUrl The tracker URL with protocol
     */
    function asCollectorUrl(collectorUrl: string) {
      if (collectorUrl.indexOf('http') === 0) {
        return collectorUrl;
      }

      return ('https:' === document.location.protocol ? 'https' : 'http') + '://' + collectorUrl;
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

    /*
     * Attaches common web fields to every request (resolution, url, referrer, etc.)
     * Also sets the required cookies.
     */
    function getBrowserDataPlugin() {
      return {
        beforeTrack: (payloadBuilder: PayloadBuilder) => {
          const anonymizeOr = (value?: string | number | null) => (configAnonymousTracking ? null : value);
          const anonymizeSessionOr = (value?: string | number | null) =>
            configAnonymousSessionTracking ? value : anonymizeOr(value);

          let ses = getSnowplowCookieValue('ses'),
            idCookie = loadDomainUserIdCookie();

          let toOptoutByCookie;
          if (configOptOutCookie) {
            toOptoutByCookie = !!cookie(configOptOutCookie);
          } else {
            toOptoutByCookie = false;
          }

          if (configDoNotTrack || toOptoutByCookie) {
            clearUserDataAndCookies();
            return;
          }

          // If cookies are enabled, base visit count and session ID on the cookies
          if (cookiesEnabledInIdCookie(idCookie)) {
            // New session?
            if (!ses && configStateStorageStrategy != 'none') {
              memorizedSessionId = startNewIdCookieSession(idCookie);
            } else {
              memorizedSessionId = sessionIdFromIdCookie(idCookie);
            }

            memorizedVisitCount = visitCountFromIdCookie(idCookie);
          } else if (new Date().getTime() - lastEventTime > configSessionCookieTimeout * 1000) {
            memorizedVisitCount++;
            memorizedSessionId = startNewIdCookieSession(idCookie, memorizedVisitCount);
          }

          // Update cookie
          updateNowTsInIdCookie(idCookie);
          updateFirstEventInIdCookie(idCookie, payloadBuilder);
          incrementEventIndexInIdCookie(idCookie);

          payloadBuilder.add('vp', detectViewport());
          payloadBuilder.add('ds', detectDocumentSize());
          payloadBuilder.add('vid', anonymizeSessionOr(memorizedVisitCount));
          payloadBuilder.add('sid', anonymizeSessionOr(memorizedSessionId));
          payloadBuilder.add('duid', anonymizeOr(domainUserIdFromIdCookie(idCookie))); // Set to our local variable
          payloadBuilder.add('uid', anonymizeOr(businessUserId));

          refreshUrl();

          payloadBuilder.add('refr', purify(customReferrer || configReferrerUrl));

          // Add the page URL last as it may take us over the IE limit (and we don't always need it)
          payloadBuilder.add('url', purify(configCustomUrl || locationHrefAlias));

          if (configSessionContext && !configAnonymousSessionTracking && !configAnonymousTracking) {
            addSessionContextToPayload(payloadBuilder, clientSessionFromIdCookie(idCookie, configStateStorageStrategy));
          }

          // Update cookies
          if (configStateStorageStrategy != 'none') {
            setDomainUserIdCookie(idCookie);
            setSessionCookie();
          }

          lastEventTime = new Date().getTime();
        },
      };
    }

    function addSessionContextToPayload(payloadBuilder: PayloadBuilder, clientSession: ClientSession) {
      let payload = payloadBuilder.build();

      let context = {
        schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
        data: [],
      };
      if (payload.cx) {
        context = JSON.parse(atob(payload.cx as string));
      }
      let sessionContext: SelfDescribingJson<ClientSession> = {
        schema: 'iglu:com.snowplowanalytics.snowplow/client_session/jsonschema/1-0-2',
        data: clientSession,
      };
      (context.data as any[]).push(sessionContext);

      payloadBuilder.addJson('cx', 'co', context);
    }

    /**
     * Expires current session and starts a new session.
     */
    function newSession() {
      // If cookies are enabled, base visit count and session ID on the cookies
      let idCookie = loadDomainUserIdCookie();

      // When cookies are enabled
      if (cookiesEnabledInIdCookie(idCookie)) {
        // When cookie/local storage is enabled - make a new session
        if (configStateStorageStrategy != 'none') {
          memorizedSessionId = startNewIdCookieSession(idCookie);
        } else {
          memorizedSessionId = sessionIdFromIdCookie(idCookie);
        }

        memorizedVisitCount = visitCountFromIdCookie(idCookie);

        // Create a new session cookie
        setSessionCookie();
      } else {
        memorizedVisitCount++;
        memorizedSessionId = startNewIdCookieSession(idCookie, memorizedVisitCount);
      }

      updateNowTsInIdCookie(idCookie);

      // Update cookies
      if (configStateStorageStrategy != 'none') {
        setDomainUserIdCookie(idCookie);
        setSessionCookie();
      }

      lastEventTime = new Date().getTime();
    }

    /**
     * Combine an array of unchanging contexts with the result of a context-creating function
     *
     * @param staticContexts - Array of custom contexts
     * @param contextCallback - Function returning an array of contexts
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
      lastDocumentTitle = document.title;
      lastConfigTitle = title;

      // Fixup page title
      const pageTitle = fixupTitle(lastConfigTitle || lastDocumentTitle);

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
      const now = new Date();
      let installingActivityTracking = false;

      if (activityTrackingConfig.enabled && !activityTrackingConfig.installed) {
        activityTrackingConfig.installed = true;
        installingActivityTracking = true;

        // Add mousewheel event handler, detect passive event listeners for performance
        const detectPassiveEvents: { update: () => void; hasSupport?: boolean } = {
          update: function update() {
            if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
              let passive = false;
              const options = Object.defineProperty({}, 'passive', {
                get: function get() {
                  passive = true;
                },
                set: function set() {},
              });
              // note: have to set and remove a no-op listener instead of null
              // (which was used previously), becasue Edge v15 throws an error
              // when providing a null callback.
              // https://github.com/rafrex/detect-passive-events/pull/3
              const noop = function noop() {};
              window.addEventListener('testPassiveEventSupport', noop, options);
              window.removeEventListener('testPassiveEventSupport', noop, options);
              detectPassiveEvents.hasSupport = passive;
            }
          },
        };
        detectPassiveEvents.update();

        // Detect available wheel event
        const wheelEvent =
          'onwheel' in document.createElement('div')
            ? 'wheel' // Modern browsers support "wheel"
            : (document as any).onmousewheel !== undefined
            ? 'mousewheel' // Webkit and IE support at least "mousewheel"
            : 'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox

        if (Object.prototype.hasOwnProperty.call(detectPassiveEvents, 'hasSupport')) {
          addEventListener(document, wheelEvent, activityHandler, { passive: true });
        } else {
          addEventListener(document, wheelEvent, activityHandler);
        }

        // Capture our initial scroll points
        resetMaxScrolls();

        // Add event handlers; cross-browser compatibility here varies significantly
        // @see http://quirksmode.org/dom/events
        const documentHandlers = ['click', 'mouseup', 'mousedown', 'mousemove', 'keypress', 'keydown', 'keyup'];
        const windowHandlers = ['resize', 'focus', 'blur'];
        const listener =
          (_: Document | Window, handler = activityHandler) =>
          (ev: string) =>
            addEventListener(document, ev, handler);

        documentHandlers.forEach(listener(document));
        windowHandlers.forEach(listener(window));
        listener(window, scrollHandler)('scroll');
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
        const now = new Date();

        // There was activity during the heart beat period;
        // on average, this is going to overstate the visitDuration by configHeartBeatTimer/2
        if (lastActivityTime + config.configMinimumVisitLength > now.getTime()) {
          executePagePing(config.callback, finalizeContexts(context, contextCallback));
        }

        config.activityInterval = window.setInterval(heartbeat, config.configHeartBeatTimer);
      };

      const heartbeat = () => {
        const now = new Date();

        // There was activity during the heart beat period;
        // on average, this is going to overstate the visitDuration by configHeartBeatTimer/2
        if (lastActivityTime + config.configHeartBeatTimer > now.getTime()) {
          executePagePing(config.callback, finalizeContexts(context, contextCallback));
        }
      };

      if (config.configMinimumVisitLength != 0) {
        config.activityInterval = window.setTimeout(timeout, config.configMinimumVisitLength);
      } else {
        config.activityInterval = window.setInterval(heartbeat, config.configHeartBeatTimer);
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

      LOG.error('Activity tracking minimumVisitLength & heartbeatDelay must be integers');
      return undefined;
    }

    /**
     * Log that a user is still viewing a given page by sending a page ping.
     * Not part of the public API - only called from logPageView() above.
     */
    function logPagePing({ context, minXOffset, minYOffset, maxXOffset, maxYOffset }: ActivityCallbackData) {
      const newDocumentTitle = document.title;
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
        lastDocumentTitle = document.title;
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
        if (!activityTrackingConfig.configurations.pagePing) {
          activityTrackingConfig.enabled = true;
          activityTrackingConfig.configurations.pagePing = configureActivityTracking({
            ...configuration,
            callback: logPagePing,
          });
        }
      },

      enableActivityTrackingCallback: function (
        configuration: ActivityTrackingConfiguration & ActivityTrackingConfigurationCallback
      ) {
        if (!activityTrackingConfig.configurations.callback) {
          activityTrackingConfig.enabled = true;
          activityTrackingConfig.configurations.callback = configureActivityTracking(configuration);
        }
      },

      updatePageActivity: function () {
        activityHandler();
      },

      setOptOutCookie: function (name?: string | null) {
        configOptOutCookie = name;
      },

      setUserId: function (userId?: string | null) {
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
        trackerConfiguration.anonymousTracking = false;

        toggleAnonymousTracking(configuration);

        initializeIdsAndCookies();

        outQueue.executeQueue(); // There might be some events in the queue we've been unable to send in anonymous mode
      },

      enableAnonymousTracking: function (configuration?: EnableAnonymousTrackingConfiguration) {
        trackerConfiguration.anonymousTracking = (configuration && configuration?.options) ?? true;

        toggleAnonymousTracking(configuration);

        // Reset the page view, if not tracking the session, so can't stitch user into new events on the page view id
        if (!configAnonymousSessionTracking) {
          resetPageView();
        }
      },

      clearUserData: clearUserDataAndCookies,
    };

    return {
      ...apiMethods,
      id: trackerId,
      namespace,
      core: core,
      sharedState: state,
    };
  };

  // Initialise the tracker
  const partialTracker = newTracker(trackerId, namespace, version, endpoint, sharedState, trackerConfiguration),
    tracker = {
      ...partialTracker,
      addPlugin: (configuration: BrowserPluginConfiguration) => {
        tracker.core.addPlugin(configuration);
        configuration.plugin.activateBrowserPlugin?.(tracker);
      },
    };

  // Initialise each plugin with the tracker
  browserPlugins.forEach((p) => {
    p.activateBrowserPlugin?.(tracker);
  });

  return tracker;
}
