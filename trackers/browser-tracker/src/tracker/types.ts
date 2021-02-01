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

import { ApiMethods, ApiPlugin } from '@snowplow/browser-core';
import {
  ConditionalContextProvider,
  ContextPrimitive,
  Payload,
  SelfDescribingJson,
  Timestamp,
  Plugin,
} from '@snowplow/tracker-core';

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

export type Configuration = {
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
  plugins?: Array<Plugin | ApiPlugin<ApiMethods>>;
};

export interface TrackerApi {
  [key: string]: Function;

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
   * Alias for setUserId.
   *
   * @param string userId The business-defined user ID
   */
  identifyUser: (userId: string) => void;

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
    tstamp?: Timestamp | null,
    afterTrack?: ((payload: Payload) => void) | null
  ) => void;

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
   * @param object context (optional) Custom context relating to the event
   * @param number|Timestamp tstamp (optional) TrackerTimestamp of the event
   * @param function afterTrack (optional) A callback function triggered after event is tracked
   */
  trackStructEvent: (
    category: string,
    action: string,
    label: string,
    property: string,
    value: number,
    context: Array<SelfDescribingJson>,
    tstamp: Timestamp,
    afterTrack: (payload: Payload) => void
  ) => void;

  /**
   * Track a self-describing event happening on this page.
   *
   * @param object eventJson Contains the properties and schema location for the event
   * @param object context Custom context relating to the event
   * @param tstamp number or Timestamp object
   * @param function afterTrack (optional) A callback function triggered after event is tracked
   */
  trackSelfDescribingEvent: (
    eventJson: SelfDescribingJson,
    context: Array<SelfDescribingJson>,
    tstamp: Timestamp,
    afterTrack: (payload: Payload) => void
  ) => void;

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
   * @param tstamp number or Timestamp object
   */
  addTrans: (
    orderId: string,
    affiliation: string,
    total: string,
    tax: string,
    shipping: string,
    city: string,
    state: string,
    country: string,
    currency: string,
    context: Array<SelfDescribingJson>,
    tstamp: Timestamp
  ) => void;

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
   * @param tstamp number or Timestamp object
   */
  addItem: (
    orderId: string,
    sku: string,
    name: string,
    category: string,
    price: string,
    quantity: string,
    currency: string,
    context: Array<SelfDescribingJson>,
    tstamp: Timestamp
  ) => void;

  /**
   * Commit the ecommerce transaction
   *
   * This call will send the data specified with addTrans,
   * addItem methods to the tracking server.
   */
  trackTrans: () => void;

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
   * @param tstamp number or Timestamp object
   */
  trackAdImpression: (
    impressionId: string,
    costModel: string,
    cost: number,
    targetUrl: string,
    bannerId: string,
    zoneId: string,
    advertiserId: string,
    campaignId: string,
    context: Array<SelfDescribingJson>,
    tstamp: Timestamp
  ) => void;

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
   * @param tstamp number or Timestamp object
   */
  trackAdClick: (
    targetUrl: string,
    clickId: string,
    costModel: string,
    cost: string,
    bannerId: string,
    zoneId: string,
    impressionId: string,
    advertiserId: string,
    campaignId: string,
    context: Array<SelfDescribingJson>,
    tstamp: Timestamp
  ) => void;

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
   * @param tstamp number or Timestamp object
   */
  trackAdConversion: (
    conversionId: string,
    costModel: string,
    cost: number,
    category: string,
    action: string,
    property: string,
    initialValue: number,
    advertiserId: string,
    campaignId: string,
    context: Array<SelfDescribingJson>,
    tstamp: Timestamp
  ) => void;

  /**
   * Track a social interaction event
   *
   * @param string action (required) Social action performed
   * @param string network (required) Social network
   * @param string target Object of the social action e.g. the video liked, the tweet retweeted
   * @param object Custom context relating to the event
   * @param tstamp number or Timestamp object
   */
  trackSocialInteraction: (
    action: string,
    network: string,
    target: string,
    context: Array<SelfDescribingJson>,
    tstamp: Timestamp
  ) => void;

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
   * @param tstamp number or Timestamp object
   */
  trackAddToCart: (
    sku: string,
    name: string,
    category: string,
    unitPrice: string,
    quantity: string,
    currency: string,
    context: Array<SelfDescribingJson>,
    tstamp: Timestamp
  ) => void;

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
   * @param tstamp Opinal number or Timestamp object
   */
  trackRemoveFromCart: (
    sku: string,
    name: string,
    category: string,
    unitPrice: string,
    quantity: string,
    currency: string,
    context: Array<SelfDescribingJson>,
    tstamp: Timestamp
  ) => void;

  /**
   * Track an internal search event
   *
   * @param array terms Search terms
   * @param object filters Search filters
   * @param number totalResults Number of results
   * @param number pageResults Number of results displayed on page
   * @param array context Optional. Context relating to the event.
   * @param tstamp Opinal number or Timestamp object
   */
  trackSiteSearch: (
    terms: Array<string>,
    filters: Record<string, unknown>,
    totalResults: number,
    pageResults: number,
    context: Array<SelfDescribingJson>,
    tstamp: Timestamp
  ) => void;

  /**
   * Track a timing event (such as the time taken for a resource to load)
   *
   * @param string category Required.
   * @param string variable Required.
   * @param number timing Required.
   * @param string label Optional.
   * @param array context Optional. Context relating to the event.
   * @param tstamp Opinal number or Timestamp object
   */
  trackTiming: (
    category: string,
    variable: string,
    timing: number,
    label: string,
    context: Array<SelfDescribingJson>,
    tstamp: Timestamp
  ) => void;

  /**
   * Track a consent withdrawn action
   *
   * @param {boolean} all - Indicates user withdraws all consent regardless of context documents.
   * @param {string} [id] - Number associated with document.
   * @param {string} [version] - Document version number.
   * @param {string} [name] - Document name.
   * @param {string} [description] - Document description.
   * @param {array} [context] - Context relating to the event.
   * @param {number|Timestamp} [tstamp] - Number or Timestamp object.
   */
  trackConsentWithdrawn: (
    all: boolean,
    id: string,
    version: string,
    name: string,
    description: string,
    context: Array<SelfDescribingJson>,
    tstamp: Timestamp
  ) => void;

  /**
   * Track a consent granted action
   *
   * @param {string} id - ID number associated with document.
   * @param {string} version - Document version number.
   * @param {string} [name] - Document name.
   * @param {string} [description] - Document description.
   * @param {string} [expiry] - Date-time when consent document(s) expire.
   * @param {array} [context] - Context containing consent documents.
   * @param {Timestamp|number} [tstamp] - number or Timestamp object.
   */
  trackConsentGranted: (
    id: string,
    version: string,
    name: string,
    description: string,
    expiry: string,
    context: Array<SelfDescribingJson>,
    tstamp: Timestamp
  ) => void;

  /**
   * Track a GA Enhanced Ecommerce Action with all stored
   * Enhanced Ecommerce contexts
   *
   * @param string action
   * @param array context Optional. Context relating to the event.
   * @param tstamp Opinal number or Timestamp object
   */
  trackEnhancedEcommerceAction: (
    action?: string,
    context?: Array<SelfDescribingJson> | null,
    tstamp?: Timestamp | null
  ) => void;

  /**
   * Adds a GA Enhanced Ecommerce Action Context
   *
   * @param string id
   * @param string affiliation
   * @param number revenue
   * @param number tax
   * @param number shipping
   * @param string coupon
   * @param string list
   * @param integer step
   * @param string option
   * @param string currency
   */
  addEnhancedEcommerceActionContext: (
    id?: string,
    affiliation?: string,
    revenue?: number,
    tax?: number,
    shipping?: number,
    coupon?: string,
    list?: string,
    step?: number,
    option?: string,
    currency?: string
  ) => void;

  /**
   * Adds a GA Enhanced Ecommerce Impression Context
   *
   * @param string id
   * @param string name
   * @param string list
   * @param string brand
   * @param string category
   * @param string variant
   * @param integer position
   * @param number price
   * @param string currency
   */
  addEnhancedEcommerceImpressionContext: (
    id?: string,
    name?: string,
    list?: string,
    brand?: string,
    category?: string,
    variant?: string,
    position?: number,
    price?: number,
    currency?: string
  ) => void;

  /**
   * Adds a GA Enhanced Ecommerce Product Context
   *
   * @param string id
   * @param string name
   * @param string list
   * @param string brand
   * @param string category
   * @param string variant
   * @param number price
   * @param integer quantity
   * @param string coupon
   * @param integer position
   * @param string currency
   */
  addEnhancedEcommerceProductContext: (
    id?: string,
    name?: string,
    list?: string,
    brand?: string,
    category?: string,
    variant?: string,
    price?: number,
    quantity?: number,
    coupon?: string,
    position?: number,
    currency?: string
  ) => void;

  /**
   * Adds a GA Enhanced Ecommerce Promo Context
   *
   * @param string id
   * @param string name
   * @param string creative
   * @param string position
   * @param string currency
   */
  addEnhancedEcommercePromoContext: (
    id?: string,
    name?: string,
    creative?: string,
    position?: string,
    currency?: string
  ) => void;

  /**
   * All provided contexts will be sent with every event
   *
   * @param contexts Array<ContextPrimitive | ConditionalContextProvider>
   */
  addGlobalContexts: (contexts: Array<ConditionalContextProvider | ContextPrimitive>) => void;

  /**
   * All provided contexts will no longer be sent with every event
   *
   * @param contexts Array<ContextPrimitive | ConditionalContextProvider>
   */
  removeGlobalContexts: (contexts: Array<ConditionalContextProvider | ContextPrimitive>) => void;

  /**
   * Clear all global contexts that are sent with events
   */
  clearGlobalContexts: () => void;

  /**
   * Stop regenerating `pageViewId` (available from `web_page` context)
   */
  preservePageViewId: () => void;

  /**
   * Disables anonymous tracking if active (ie. tracker initialized with `anonymousTracking`)
   * For stateStorageStrategy override, uses supplied value first,
   * falls back to one defined in initial config, otherwise uses cookieAndLocalStorage.
   * @param {string} stateStorageStrategy - Override for state storage
   */
  disableAnonymousTracking: (stateStorageStrategy?: string) => void;

  /**
   * Enables anonymous tracking (ie. tracker initialized without `anonymousTracking`)
   */
  enableAnonymousTracking: (anonymousArgs?: AnonymousTrackingOptions) => void;

  /**
   * Clears all cookies and local storage containing user and session identifiers
   */
  clearUserData: () => void;
}
