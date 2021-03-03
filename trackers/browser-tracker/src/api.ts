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
  ActivityCallback,
  allTrackerNames,
  AnonymousTrackingOptions,
  BrowserTracker,
  getTrackers,
  StateStorageStrategy,
} from '@snowplow/browser-tracker-core';
import { ConditionalContextProvider, ContextPrimitive, SelfDescribingJson, Timestamp } from '@snowplow/tracker-core';

const dispatch = (trackers: Array<string> = allTrackerNames(), fn: (t: BrowserTracker) => void) => {
  getTrackers(trackers).forEach(fn);
};

/**
 * Expires current session and starts a new session.
 */
export const newSession = (trackers?: Array<string>) => {
  dispatch(trackers, (t) => {
    t.newSession();
  });
};

/**
 * Override referrer
 *
 * @param string url
 */
export const setReferrerUrl = function (url: string, trackers?: Array<string>) {
  dispatch(trackers, (t) => {
    t.setReferrerUrl(url);
  });
};

/**
 * Override url
 *
 * @param string url
 */
export const setCustomUrl = function (url: string, trackers?: Array<string>) {
  dispatch(trackers, (t) => {
    t.setCustomUrl(url);
  });
};

/**
 * Override document.title
 *
 * @param string title
 */
export const setDocumentTitle = function (title: string, trackers?: Array<string>) {
  dispatch(trackers, (t) => {
    t.setDocumentTitle(title);
  });
};

/**
 * Strip hash tag (or anchor) from URL
 *
 * @param bool enableFilter
 */
export const discardHashTag = function (enable: boolean, trackers?: Array<string>) {
  dispatch(trackers, (t) => {
    t.discardHashTag(enable);
  });
};

/**
 * Strip braces from URL
 *
 * @param bool enableFilter
 */
export const discardBrace = function (enable: boolean, trackers?: Array<string>) {
  dispatch(trackers, (t) => {
    t.discardBrace(enable);
  });
};

/**
 * Set first-party cookie path
 *
 * @param string domain
 */
export const setCookiePath = function (path: string, trackers?: Array<string>) {
  dispatch(trackers, (t) => {
    t.setCookiePath(path);
  });
};

/**
 * Set visitor cookie timeout (in seconds)
 *
 * @param int timeout
 */
export const setVisitorCookieTimeout = function (timeout: number, trackers?: Array<string>) {
  dispatch(trackers, (t) => {
    t.setVisitorCookieTimeout(timeout);
  });
};

/**
 * Enable querystring decoration for links pasing a filter
 *
 * @param function crossDomainLinker Function used to determine which links to decorate
 */
export const crossDomainLinker = function (
  crossDomainLinkerCriterion: (elt: HTMLAnchorElement | HTMLAreaElement) => boolean,
  trackers?: Array<string>
) {
  dispatch(trackers, (t) => {
    t.crossDomainLinker(crossDomainLinkerCriterion);
  });
};

/**
 * Enables page activity tracking (sends page
 * pings to the Collector regularly).
 *
 * @param int minimumVisitLength Seconds to wait before sending first page ping
 * @param int heartBeatDelay Seconds to wait between pings
 */
export const enableActivityTracking = function (
  { minimumVisitLength, heartBeatDelay }: { minimumVisitLength: number; heartBeatDelay: number },
  trackers?: Array<string>
) {
  dispatch(trackers, (t) => {
    t.enableActivityTracking(minimumVisitLength, heartBeatDelay);
  });
};

/**
 * Enables page activity tracking (replaces collector ping with callback).
 *
 * @param int minimumVisitLength Seconds to wait before sending first page ping
 * @param int heartBeatDelay Seconds to wait between pings
 * @param function callback function called with ping data
 */
export const enableActivityTrackingCallback = function (
  {
    minimumVisitLength,
    heartBeatDelay,
    callback,
  }: { minimumVisitLength: number; heartBeatDelay: number; callback: ActivityCallback },
  trackers?: Array<string>
) {
  dispatch(trackers, (t) => {
    t.enableActivityTrackingCallback(minimumVisitLength, heartBeatDelay, callback);
  });
};

/**
 * Triggers the activityHandler manually to allow external user defined
 * activity. i.e. While watching a video
 */
export const updatePageActivity = function (trackers?: Array<string>) {
  dispatch(trackers, (t) => {
    t.updatePageActivity();
  });
};

/**
 * Sets the opt out cookie.
 *
 * @param string name of the opt out cookie
 */
export const setOptOutCookie = function (name: string, trackers?: Array<string>) {
  dispatch(trackers, (t) => {
    t.setOptOutCookie(name);
  });
};

/**
 * Set the business-defined user ID for this user.
 *
 * @param string userId The business-defined user ID
 */
export const setUserId = function (userId: string, trackers?: Array<string>) {
  dispatch(trackers, (t) => {
    t.setUserId(userId);
  });
};

/**
 * Set the business-defined user ID for this user using the location querystring.
 *
 * @param string queryName Name of a querystring name-value pair
 */
export const setUserIdFromLocation = function (querystringField: string, trackers?: Array<string>) {
  dispatch(trackers, (t) => {
    t.setUserIdFromLocation(querystringField);
  });
};

/**
 * Set the business-defined user ID for this user using the referrer querystring.
 *
 * @param string queryName Name of a querystring name-value pair
 */
export const setUserIdFromReferrer = function (querystringField: string, trackers?: Array<string>) {
  dispatch(trackers, (t) => {
    t.setUserIdFromReferrer(querystringField);
  });
};

/**
 * Set the business-defined user ID for this user to the value of a cookie.
 *
 * @param string cookieName Name of the cookie whose value will be assigned to businessUserId
 */
export const setUserIdFromCookie = function (cookieName: string, trackers?: Array<string>) {
  dispatch(trackers, (t) => {
    t.setUserIdFromCookie(cookieName);
  });
};

/**
 *
 * Specify the Snowplow collector URL. No need to include HTTP
 * or HTTPS - we will add this.
 *
 * @param string rawUrl The collector URL minus protocol and /i
 */
export const setCollectorUrl = function (rawUrl: string, trackers?: Array<string>) {
  dispatch(trackers, (t) => {
    t.setCollectorUrl(rawUrl);
  });
};

/**
 * Send all events in the outQueue
 * Use only when sending POSTs with a bufferSize of at least 2
 */
export const flushBuffer = function (trackers?: Array<string>) {
  dispatch(trackers, (t) => {
    t.flushBuffer();
  });
};

/**
 * Log visit to this page
 *
 * @param string customTitle
 * @param object Custom context relating to the event
 * @param object contextCallback Function returning an array of contexts
 * @param tstamp number or Timestamp object
 */
export const trackPageView = function (
  {
    title,
    context,
    contextCallback,
    tstamp,
  }: {
    title?: string | null;
    context?: Array<SelfDescribingJson> | null;
    contextCallback?: (() => Array<SelfDescribingJson>) | null;
    tstamp?: Timestamp | null;
  } = {},
  trackers?: Array<string>
) {
  dispatch(trackers, (t) => {
    t.trackPageView(title, context, contextCallback, tstamp);
  });
};

//   /**
//    * Track a structured event happening on this page.
//    *
//    * Replaces trackEvent, making clear that the type
//    * of event being tracked is a structured one.
//    *
//    * @param string category The name you supply for the group of objects you want to track
//    * @param string action A string that is uniquely paired with each category, and commonly used to define the type of user interaction for the web object
//    * @param string label (optional) An optional string to provide additional dimensions to the event data
//    * @param string property (optional) Describes the object or the action performed on it, e.g. quantity of item added to basket
//    * @param int|float|string value (optional) An integer that you can use to provide numerical data about the user event
//    * @param object context (optional) Custom context relating to the event
//    * @param number|Timestamp tstamp (optional) TrackerTimestamp of the event
//    * @param function afterTrack (optional) A callback function triggered after event is tracked
//    */
export const trackStructEvent = function (
  {
    category,
    action,
    label,
    property,
    value,
    context,
    tstamp,
  }: {
    category: string;
    action: string;
    label?: string;
    property?: string;
    value?: number;
    context?: Array<SelfDescribingJson>;
    tstamp?: Timestamp;
  },
  trackers?: Array<string>
) {
  dispatch(trackers, (t) => {
    t.core.trackStructEvent(category, action, label, property, value, context, tstamp);
  });
};

/**
 * Track a self-describing event happening on this page.
 *
 * @param object eventJson Contains the properties and schema location for the event
 * @param object context Custom context relating to the event
 * @param tstamp number or Timestamp object
 * @param function afterTrack (optional) A callback function triggered after event is tracked
 */
export const trackSelfDescribingEvent = function (
  { event, context, tstamp }: { event: SelfDescribingJson; context?: Array<SelfDescribingJson>; tstamp?: Timestamp },
  trackers?: Array<string>
) {
  dispatch(trackers, (t) => {
    t.core.trackSelfDescribingEvent(event, context, tstamp);
  });
};

/**
 * All provided contexts will be sent with every event
 *
 * @param contexts Array<ContextPrimitive | ConditionalContextProvider>
 */
export const addGlobalContexts = function (
  contexts: Array<ConditionalContextProvider | ContextPrimitive>,
  trackers?: Array<string>
) {
  dispatch(trackers, (t) => {
    t.core.addGlobalContexts(contexts);
  });
};

/**
 * All provided contexts will no longer be sent with every event
 *
 * @param contexts Array<ContextPrimitive | ConditionalContextProvider>
 */
export const removeGlobalContexts = function (
  contexts: Array<ConditionalContextProvider | ContextPrimitive>,
  trackers?: Array<string>
) {
  dispatch(trackers, (t) => {
    t.core.removeGlobalContexts(contexts);
  });
};

/**
 * Clear all global contexts that are sent with events
 */
export const clearGlobalContexts = function (trackers?: Array<string>) {
  dispatch(trackers, (t) => {
    t.core.clearGlobalContexts();
  });
};

/**
 * Stop regenerating `pageViewId` (available from `web_page` context)
 */
export const preservePageViewId = function (trackers?: Array<string>) {
  dispatch(trackers, (t) => {
    t.preservePageViewId();
  });
};

/**
 * Disables anonymous tracking if active (ie. tracker initialized with `anonymousTracking`)
 * For stateStorageStrategy override, uses supplied value first,
 * falls back to one defined in initial config, otherwise uses cookieAndLocalStorage.
 * @param {string} stateStorageStrategy - Override for state storage
 */
export const disableAnonymousTracking = function (
  { stateStorageStrategy }: { stateStorageStrategy?: StateStorageStrategy },
  trackers?: Array<string>
) {
  dispatch(trackers, (t) => {
    t.disableAnonymousTracking(stateStorageStrategy);
  });
};

/**
 * Enables anonymous tracking (ie. tracker initialized without `anonymousTracking`)
 */
export const enableAnonymousTracking = function (
  { options }: { options?: AnonymousTrackingOptions },
  trackers?: Array<string>
) {
  dispatch(trackers, (t) => {
    t.enableAnonymousTracking(options);
  });
};

/**
 * Clears all cookies and local storage containing user and session identifiers
 */
export const clearUserData = function (trackers?: Array<string>) {
  dispatch(trackers, (t) => {
    t.clearUserData();
  });
};
