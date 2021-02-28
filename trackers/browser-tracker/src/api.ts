import {
  ActivityCallback,
  allTrackerNames,
  AnonymousTrackingOptions,
  BrowserTracker,
  getTrackers,
  StateStorageStrategy,
} from '@snowplow/browser-core';
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
export const trackAdImpression = function (
  {
    impressionId,
    costModel,
    cost,
    targetUrl,
    bannerId,
    zoneId,
    advertiserId,
    campaignId,
    context,
    tstamp,
  }: {
    impressionId: string;
    costModel: string;
    cost: number;
    targetUrl: string;
    bannerId: string;
    zoneId: string;
    advertiserId: string;
    campaignId: string;
    context: Array<SelfDescribingJson>;
    tstamp: Timestamp;
  },
  trackers?: Array<string>
) {
  dispatch(trackers, (t) => {
    t.core.trackAdImpression(
      impressionId,
      costModel,
      cost,
      targetUrl,
      bannerId,
      zoneId,
      advertiserId,
      campaignId,
      context,
      tstamp
    );
  });
};

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
export const trackAdClick = function (
  {
    targetUrl,
    clickId,
    costModel,
    cost,
    bannerId,
    zoneId,
    impressionId,
    advertiserId,
    campaignId,
    context,
    tstamp,
  }: {
    targetUrl: string;
    clickId: string;
    costModel: string;
    cost: number;
    bannerId: string;
    zoneId: string;
    impressionId: string;
    advertiserId: string;
    campaignId: string;
    context: Array<SelfDescribingJson>;
    tstamp: Timestamp;
  },
  trackers?: Array<string>
) {
  dispatch(trackers, (t) => {
    t.core.trackAdClick(
      targetUrl,
      clickId,
      costModel,
      cost,
      bannerId,
      zoneId,
      impressionId,
      advertiserId,
      campaignId,
      context,
      tstamp
    );
  });
};

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
export const trackAdConversion = function (
  {
    conversionId,
    costModel,
    cost,
    category,
    action,
    property,
    initialValue,
    advertiserId,
    campaignId,
    context,
    tstamp,
  }: {
    conversionId: string;
    costModel: string;
    cost: number;
    category: string;
    action: string;
    property: string;
    initialValue: number;
    advertiserId: string;
    campaignId: string;
    context: Array<SelfDescribingJson>;
    tstamp: Timestamp;
  },
  trackers?: Array<string>
) {
  dispatch(trackers, (t) => {
    t.core.trackAdConversion(
      conversionId,
      costModel,
      cost,
      category,
      action,
      property,
      initialValue,
      advertiserId,
      campaignId,
      context,
      tstamp
    );
  });
};

/**
 * Track a social interaction event
 *
 * @param string action (required) Social action performed
 * @param string network (required) Social network
 * @param string target Object of the social action e.g. the video liked, the tweet retweeted
 * @param object Custom context relating to the event
 * @param tstamp number or Timestamp object
 */
export const trackSocialInteraction = function (
  {
    action,
    network,
    target,
    context,
    tstamp,
  }: { action: string; network: string; target: string; context: Array<SelfDescribingJson>; tstamp: Timestamp },
  trackers?: Array<string>
) {
  dispatch(trackers, (t) => {
    t.core.trackSocialInteraction(action, network, target, context, tstamp);
  });
};

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
export const trackAddToCart = function (
  {
    sku,
    name,
    category,
    unitPrice,
    quantity,
    currency,
    context,
    tstamp,
  }: {
    sku: string;
    name: string;
    category: string;
    unitPrice: string;
    quantity: string;
    currency: string | undefined;
    context: Array<SelfDescribingJson>;
    tstamp: Timestamp;
  },
  trackers?: Array<string>
) {
  dispatch(trackers, (t) => {
    t.core.trackAddToCart(sku, name, category, unitPrice, quantity, currency, context, tstamp);
  });
};

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
export const trackRemoveFromCart = function (
  {
    sku,
    name,
    category,
    unitPrice,
    quantity,
    currency,
    context,
    tstamp,
  }: {
    sku: string;
    name: string;
    category: string;
    unitPrice: string;
    quantity: string;
    currency: string | undefined;
    context: Array<SelfDescribingJson>;
    tstamp: Timestamp;
  },
  trackers?: Array<string>
) {
  dispatch(trackers, (t) => {
    t.core.trackRemoveFromCart(sku, name, category, unitPrice, quantity, currency, context, tstamp);
  });
};

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
export const trackSiteSearch = function (
  {
    terms,
    filters,
    totalResults,
    pageResults,
    context,
    tstamp,
  }: {
    terms: Array<string>;
    filters: Record<string, string | boolean>;
    totalResults: number;
    pageResults: number;
    context: Array<SelfDescribingJson>;
    tstamp: Timestamp;
  },
  trackers?: Array<string>
) {
  dispatch(trackers, (t) => {
    t.core.trackSiteSearch(terms, filters, totalResults, pageResults, context, tstamp);
  });
};

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
export const trackTiming = function (
  {
    category,
    variable,
    timing,
    label,
    context,
    tstamp,
  }: {
    category: string;
    variable: string;
    timing: number;
    label: string;
    context: Array<SelfDescribingJson>;
    tstamp: Timestamp;
  },
  trackers?: Array<string>
) {
  trackSelfDescribingEvent(
    {
      event: {
        schema: 'iglu:com.snowplowanalytics.snowplow/timing/jsonschema/1-0-0',
        data: {
          category: category,
          variable: variable,
          timing: timing,
          label: label,
        },
      },
      context,
      tstamp,
    },
    trackers
  );
};

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
export const trackConsentGranted = (
  {
    id,
    version,
    name,
    description,
    expiry,
    context,
    tstamp,
  }: {
    id: string;
    version: string;
    name: string;
    description: string;
    expiry: string;
    context: Array<SelfDescribingJson>;
    tstamp: Timestamp;
  },
  trackers?: Array<string>
) => {
  dispatch(trackers, (t) => {
    t.core.trackConsentGranted(id, version, name, description, expiry, context, tstamp);
  });
};

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
export const trackConsentWithdrawn = function (
  {
    all,
    id,
    version,
    name,
    description,
    context,
    tstamp,
  }: {
    all: boolean;
    id?: string;
    version?: string;
    name?: string;
    description?: string;
    context?: Array<SelfDescribingJson>;
    tstamp?: Timestamp;
  },
  trackers?: Array<string>
) {
  dispatch(trackers, (t) => {
    t.core.trackConsentWithdrawn(all, id, version, name, description, context, tstamp);
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
