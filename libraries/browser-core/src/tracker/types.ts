/*
 * JavaScript tracker for Snowplow: tracker.js
 *
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright
 * 2012-2020 Snowplow Analytics Ltd. All rights reserved.
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

import { BrowserPlugin } from '../plugins';
import { SelfDescribingJson, Timestamp, TrackerCore } from '@snowplow/tracker-core';
import { SharedState } from '../state';

export type ActivityCallbackData = {
  context: Array<SelfDescribingJson>;
  pageViewId: string;
  minXOffset: number;
  minYOffset: number;
  maxXOffset: number;
  maxYOffset: number;
};

export type ActivityCallback = {
  (data: ActivityCallbackData): void;
};

export type AnonymousTrackingOptions = boolean & { withSessionTracking?: boolean; withServerAnonymisation?: boolean };
export type StateStorageStrategy = 'cookieAndLocalStorage' | 'cookie' | 'localStorage' | 'none';
export type Platform = 'web' | 'mob' | 'pc' | 'srv' | 'app' | 'tv' | 'cnsl' | 'iot';
export type CookieSameSite = 'None' | 'Lax' | 'Strict';
export type EventMethod = 'post' | 'get' | 'beacon';

export type TrackerConfiguration = {
  encodeBase64?: boolean;
  cookieDomain?: string;
  cookieName?: string;
  cookieSameSite?: CookieSameSite;
  cookieSecure?: boolean;
  cookieLifetime?: number;
  sessionCookieTimeout?: number;
  appId?: string;
  platform?: Platform;
  respectDoNotTrack?: boolean;
  pageUnloadTimer?: number;
  forceSecureTracker?: boolean;
  forceUnsecureTracker?: boolean;
  eventMethod?: EventMethod;
  postPath?: string;
  useStm?: boolean;
  bufferSize?: number;
  crossDomainLinker?: (elt: HTMLAnchorElement | HTMLAreaElement) => boolean;
  maxPostBytes?: number;
  discoverRootDomain?: boolean;
  stateStorageStrategy?: StateStorageStrategy;
  maxLocalStorageQueueSize?: number;
  resetActivityTrackingOnPageView?: boolean;
  connectionTimeout?: number;
  anonymousTracking?: AnonymousTrackingOptions;
  contexts?: { webPage: boolean };
  plugins?: Array<BrowserPlugin>;
};

export interface BrowserTracker {
  id: string;
  core: TrackerCore;
  sharedState: SharedState;

  /**
   * Get the domain session index also known as current memorized visit count.
   *
   * @return int Domain session index
   */
  getDomainSessionIndex: () => void;

  /**
   * Get the page view ID as generated or provided by mutSnowplowState.pageViewId.
   *
   * @return string Page view ID
   */
  getPageViewId: () => void;

  /**
   * Expires current session and starts a new session.
   */
  newSession: () => void;

  /**
   * Get the cookie name as cookieNamePrefix + basename + . + domain.
   *
   * @return string Cookie name
   */
  getCookieName: (basename: string) => void;

  /**
   * Get the current user ID (as set previously
   * with setUserId()).
   *
   * @return string Business-defined user ID
   */
  getUserId: () => void;

  /**
   * Get visitor ID (from first party cookie)
   *
   * @return string Visitor ID in hexits (or null, if not yet known)
   */
  getDomainUserId: () => void;

  /**
   * Get the visitor information (from first party cookie)
   *
   * @return array
   */
  getDomainUserInfo: () => void;

  /**
   * Override referrer
   *
   * @param string url
   */
  setReferrerUrl: (url: string) => void;

  /**
   * Override url
   *
   * @param string url
   */
  setCustomUrl: (url: string) => void;

  /**
   * Override document.title
   *
   * @param string title
   */
  setDocumentTitle: (title: string) => void;

  /**
   * Strip hash tag (or anchor) from URL
   *
   * @param bool enableFilter
   */
  discardHashTag: (enableFilter: boolean) => void;

  /**
   * Strip braces from URL
   *
   * @param bool enableFilter
   */
  discardBrace: (enableFilter: boolean) => void;

  /**
   * Set first-party cookie path
   *
   * @param string domain
   */
  setCookiePath: (path: string) => void;

  /**
   * Set visitor cookie timeout (in seconds)
   *
   * @param int timeout
   */
  setVisitorCookieTimeout: (timeout: number) => void;

  /**
   * Enable querystring decoration for links pasing a filter
   *
   * @param function crossDomainLinker Function used to determine which links to decorate
   */
  crossDomainLinker: (crossDomainLinkerCriterion: (elt: HTMLAnchorElement | HTMLAreaElement) => boolean) => void;

  /**
   * Enables page activity tracking (sends page
   * pings to the Collector regularly).
   *
   * @param int minimumVisitLength Seconds to wait before sending first page ping
   * @param int heartBeatDelay Seconds to wait between pings
   */
  enableActivityTracking: (minimumVisitLength: number, heartBeatDelay: number) => void;

  /**
   * Enables page activity tracking (replaces collector ping with callback).
   *
   * @param int minimumVisitLength Seconds to wait before sending first page ping
   * @param int heartBeatDelay Seconds to wait between pings
   * @param function callback function called with ping data
   */
  enableActivityTrackingCallback: (
    minimumVisitLength: number,
    heartBeatDelay: number,
    callback: ActivityCallback
  ) => void;

  /**
   * Triggers the activityHandler manually to allow external user defined
   * activity. i.e. While watching a video
   */
  updatePageActivity: () => void;

  /**
   * Sets the opt out cookie.
   *
   * @param string name of the opt out cookie
   */
  setOptOutCookie: (name: string) => void;

  /**
   * Set the business-defined user ID for this user.
   *
   * @param string userId The business-defined user ID
   */
  setUserId: (userId: string) => void;

  /**
   * Set the business-defined user ID for this user using the location querystring.
   *
   * @param string queryName Name of a querystring name-value pair
   */
  setUserIdFromLocation: (querystringField: string) => void;

  /**
   * Set the business-defined user ID for this user using the referrer querystring.
   *
   * @param string queryName Name of a querystring name-value pair
   */
  setUserIdFromReferrer: (querystringField: string) => void;

  /**
   * Set the business-defined user ID for this user to the value of a cookie.
   *
   * @param string cookieName Name of the cookie whose value will be assigned to businessUserId
   */
  setUserIdFromCookie: (cookieName: string) => void;

  /**
   *
   * Specify the Snowplow collector URL. No need to include HTTP
   * or HTTPS - we will add this.
   *
   * @param string rawUrl The collector URL minus protocol and /i
   */
  setCollectorUrl: (rawUrl: string) => void;

  /**
   * Send all events in the outQueue
   * Use only when sending POSTs with a bufferSize of at least 2
   */
  flushBuffer: () => void;

  /**
   * Stop regenerating `pageViewId` (available from `web_page` context)
   */
  preservePageViewId: () => void;

  /**
   * Log visit to this page
   *
   * @param string customTitle
   * @param object Custom context relating to the event
   * @param object contextCallback Function returning an array of contexts
   * @param tstamp number or Timestamp object
   * @param function afterTrack (optional) A callback function triggered after event is tracked
   */
  trackPageView: (
    customTitle?: string | null,
    context?: Array<SelfDescribingJson> | null,
    contextCallback?: (() => Array<SelfDescribingJson>) | null,
    tstamp?: Timestamp | null
  ) => void;

  /**
   * Disables anonymous tracking if active (ie. tracker initialized with `anonymousTracking`)
   * For stateStorageStrategy override, uses supplied value first,
   * falls back to one defined in initial config, otherwise uses cookieAndLocalStorage.
   * @param {string} stateStorageStrategy - Override for state storage
   */
  disableAnonymousTracking: (stateStorageStrategy?: StateStorageStrategy) => void;

  /**
   * Enables anonymous tracking (ie. tracker initialized without `anonymousTracking`)
   */
  enableAnonymousTracking: (anonymousArgs?: AnonymousTrackingOptions) => void;

  /**
   * Clears all cookies and local storage containing user and session identifiers
   */
  clearUserData: () => void;
}
