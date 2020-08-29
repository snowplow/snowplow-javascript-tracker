/*
 * JavaScript tracker core for Snowplow: core.ts
 *
 * Copyright (c) 2014-2020 Snowplow Analytics Ltd. All rights reserved.
 *
 * This program is licensed to you under the Apache License Version 2.0,
 * and you may not use this file except in compliance with the Apache License Version 2.0.
 * You may obtain a copy of the Apache License Version 2.0 at http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the Apache License Version 2.0 is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Apache License Version 2.0 for the specific language governing permissions and limitations there under.
 */

import { v4 } from 'uuid';

import { payloadBuilder, PayloadData, PayloadDictionary, isJson } from './payload';
import { globalContexts, ConditionalContextProvider, ContextPrimitive, GlobalContexts } from './contexts';

/**
 * Interface common for any Self-Describing JSON such as custom context or
 * Self-describing (ex-unstuctured) event
 */
export interface SelfDescribingJson extends Record<string, unknown> {
  schema: string;
  data: Record<string, unknown>;
}

/**
 * Algebraic datatype representing possible timestamp type choice
 */
export type Timestamp = TrueTimestamp | DeviceTimestamp | number;
export interface TrueTimestamp {
  readonly type: 'ttm';
  readonly value: number;
}
export interface DeviceTimestamp {
  readonly type: 'dtm';
  readonly value: number;
}

/**
 * Pair of timestamp type ready to be included to payload
 */
type TimestampPayload = TrueTimestamp | DeviceTimestamp;

/**
 * Transform optional/old-behavior number timestamp into`Timestamp` ADT
 *
 * @param tstamp optional number or timestamp object
 * @returns correct timestamp object
 */
function getTimestamp(tstamp?: Timestamp): TimestampPayload {
  if (tstamp == null) {
    return { type: 'dtm', value: new Date().getTime() };
  } else if (typeof tstamp === 'number') {
    return { type: 'dtm', value: tstamp };
  } else if (tstamp.type === 'ttm') {
    // We can return tstamp here, but this is safer fallback
    return { type: 'ttm', value: tstamp.value };
  } else {
    return { type: 'dtm', value: tstamp.value || new Date().getTime() };
  }
}

/**
 * Interface containing all Core functions
 */
export interface Core {
  /**
   * Set a persistent key-value pair to be added to every payload
   *
   * @param key Field name
   * @param value Field value
   */
  addPayloadPair: (key: string, value: string) => void;

  /**
   * Turn base 64 encoding on or off
   *
   * @param encode Whether to encode payload
   */
  setBase64Encoding(encode: boolean): void;

  /**
   * Merges a dictionary into payloadPairs
   *
   * @param dict Adds a new payload dictionary to the existing one
   */
  addPayloadDict(dict: PayloadDictionary): void;

  /**
   * Replace payloadPairs with a new dictionary
   *
   * @param dict Resets all current payload pairs with a new dictionary of pairs
   */
  resetPayloadPairs(dict: PayloadDictionary): void;

  /**
   * Set the tracker version
   *
   * @param version The version of the current tracker
   */
  setTrackerVersion(version: string): void;

  /**
   * Set the tracker namespace
   *
   * @param name The trackers namespace
   */
  setTrackerNamespace(name: string): void;

  /**
   * Set the application ID
   *
   * @param appId An application ID which identifies the current application
   */
  setAppId(appId: string): void;

  /**
   * Set the platform
   *
   * @param value A valid Snowplow platform value
   */
  setPlatform(value: string): void;

  /**
   * Set the user ID
   *
   * @param userId The custom user id
   */
  setUserId(userId: string): void;

  /**
   * Set the screen resolution
   *
   * @param width screen resolution width
   * @param height screen resolution height
   */
  setScreenResolution(width: string, height: string): void;

  /**
   * Set the viewport dimensions
   *
   * @param width viewport width
   * @param height viewport height
   */
  setViewport(width: string, height: string): void;

  /**
   * Set the color depth
   *
   * @param depth A color depth value as string
   */
  setColorDepth(depth: string): void;

  /**
   * Set the timezone
   *
   * @param timezone A timezone string
   */
  setTimezone(timezone: string): void;

  /**
   * Set the language
   *
   * @param lang A language string e.g. 'en-UK'
   */
  setLang(lang: string): void;

  /**
   * Set the IP address
   *
   * @param ip An IP Address string
   */
  setIpAddress(ip: string): void;

  /**
   * Set the Useragent
   *
   * @param useragent A useragent string
   */
  setUseragent(useragent: string): void;

  /**
   * Log an unstructured event
   *
   * @deprecated use trackSelfDescribingEvent instead
   * @param properties Contains the properties and schema location for the event
   * @param context Custom contexts relating to the event
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackUnstructEvent: (
    properties: Record<string, unknown>,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ) => PayloadData;

  /**
   * Log an self-describing (previously unstruct) event
   *
   * @param properties Contains the properties and schema location for the event
   * @param context Custom contexts relating to the event
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackSelfDescribingEvent: (
    properties: Record<string, unknown>,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ) => PayloadData;

  /**
   * Log the page view / visit
   *
   * @param pageUrl Current page URL
   * @param pageTitle The user-defined page title to attach to this page view
   * @param referrer URL users came from
   * @param context Custom contexts relating to the event
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackPageView(
    pageUrl: string,
    pageTitle: string,
    referrer: string,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData;

  /**
   * Log that a user is still viewing a given page
   * by sending a page ping
   *
   * @param pageUrl Current page URL
   * @param pageTitle The page title to attach to this page ping
   * @param referrer URL users came from
   * @param minXOffset Minimum page x offset seen in the last ping period
   * @param maxXOffset Maximum page x offset seen in the last ping period
   * @param minYOffset Minimum page y offset seen in the last ping period
   * @param maxYOffset Maximum page y offset seen in the last ping period
   * @param context Custom contexts relating to the event
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackPagePing(
    pageUrl: string,
    pageTitle: string,
    referrer: string,
    minXOffset: number,
    maxXOffset: number,
    minYOffset: number,
    maxYOffset: number,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData;

  /**
   * Track a structured event
   *
   * @param category The name you supply for the group of objects you want to track
   * @param action A string that is uniquely paired with each category, and commonly used to define the type of user interaction for the web object
   * @param label An optional string to provide additional dimensions to the event data
   * @param property Describes the object or the action performed on it, e.g. quantity of item added to basket
   * @param value An integer that you can use to provide numerical data about the user event
   * @param context Custom contexts relating to the event
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackStructEvent(
    category: string,
    action: string,
    label: string,
    property: string,
    value?: number,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData;

  /**
   * Track an ecommerce transaction
   *
   * @param orderId Internal unique order id number for this transaction.
   * @param affiliation Partner or store affiliation.
   * @param totalValue Total amount of the transaction.
   * @param taxValue Tax amount of the transaction.
   * @param shipping Shipping charge for the transaction.
   * @param city City to associate with transaction.
   * @param state State to associate with transaction.
   * @param country Country to associate with transaction.
   * @param currency Currency to associate with this transaction.
   * @param context Context relating to the event.
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackEcommerceTransaction(
    orderId: string,
    affiliation: string,
    totalValue: string,
    taxValue?: string,
    shipping?: string,
    city?: string,
    state?: string,
    country?: string,
    currency?: string,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData;

  /**
   * Track an ecommerce transaction item
   *
   * @param orderId Required Order ID of the transaction to associate with item.
   * @param sku Item's SKU code.
   * @param name Product name.
   * @param category Product category.
   * @param price Product price.
   * @param quantity Purchase quantity.
   * @param currency Product price currency.
   * @param context Context relating to the event.
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackEcommerceTransactionItem(
    orderId: string,
    sku: string,
    name: string,
    category: string,
    price: string,
    quantity: string,
    currency?: string,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData;

  /**
   * Track a screen view unstructured event
   *
   * @param name The name of the screen
   * @param id The ID of the screen
   * @param context Contexts relating to the event
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackScreenView(
    name: string,
    id: string,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData;

  /**
   * Log the link or click with the server
   *
   * @param targetUrl
   * @param elementId
   * @param elementClasses
   * @param elementTarget
   * @param elementContent innerHTML of the link
   * @param context Custom contexts relating to the event
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackLinkClick(
    targetUrl: string,
    elementId: string,
    elementClasses: Array<string>,
    elementTarget: string,
    elementContent: string,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData;

  /**
   * Track an ad being served
   *
   * @param impressionId Identifier for a particular ad impression
   * @param costModel The cost model. 'cpa', 'cpc', or 'cpm'
   * @param cost Cost
   * @param targetUrl URL ad pointing to
   * @param bannerId Identifier for the ad banner displayed
   * @param zoneId Identifier for the ad zone
   * @param advertiserId Identifier for the advertiser
   * @param campaignId Identifier for the campaign which the banner belongs to
   * @param context Custom contexts relating to the event
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackAdImpression(
    impressionId: string,
    costModel: string,
    cost: number,
    targetUrl: string,
    bannerId: string,
    zoneId: string,
    advertiserId: string,
    campaignId: string,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData;

  /**
   * Track an ad being clicked
   *
   * @param targetUrl (required) The link's target URL
   * @param clickId Identifier for the ad click
   * @param costModel The cost model. 'cpa', 'cpc', or 'cpm'
   * @param cost Cost
   * @param bannerId Identifier for the ad banner displayed
   * @param zoneId Identifier for the ad zone
   * @param impressionId Identifier for a particular ad impression
   * @param advertiserId Identifier for the advertiser
   * @param campaignId Identifier for the campaign which the banner belongs to
   * @param context Custom contexts relating to the event
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackAdClick(
    targetUrl: string,
    clickId: string,
    costModel: string,
    cost: number,
    bannerId: string,
    zoneId: string,
    impressionId: string,
    advertiserId: string,
    campaignId: string,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData;

  /**
   * Track an ad conversion event
   *
   * @param conversionId Identifier for the ad conversion event
   * @param costModel The cost model. 'cpa', 'cpc', or 'cpm'
   * @param cost Cost
   * @param category The name you supply for the group of objects you want to track
   * @param action A string that is uniquely paired with each category
   * @param property Describes the object of the conversion or the action performed on it
   * @param initialValue Revenue attributable to the conversion at time of conversion
   * @param advertiserId Identifier for the advertiser
   * @param campaignId Identifier for the campaign which the banner belongs to
   * @param context Custom contexts relating to the event
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackAdConversion(
    conversionId: string,
    costModel: string,
    cost: number,
    category: string,
    action: string,
    property: string,
    initialValue: number,
    advertiserId: string,
    campaignId: string,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData;

  /**
   * Track a social event
   *
   * @param action Social action performed
   * @param network Social network
   * @param target Object of the social action e.g. the video liked, the tweet retweeted
   * @param context Custom contexts relating to the event
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackSocialInteraction(
    action: string,
    network: string,
    target: string,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData;

  /**
   * Track an add-to-cart event
   *
   * @param sku Item's SKU code.
   * @param name Product name.
   * @param category Product category.
   * @param unitPrice Product price.
   * @param quantity Quantity added.
   * @param currency Product price currency.
   * @param context Context relating to the event.
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackAddToCart(
    sku: string,
    name: string,
    category: string,
    unitPrice: string,
    quantity: string,
    currency?: string,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData;

  /**
   * Track a remove-from-cart event
   *
   * @param sku Item's SKU code.
   * @param name Product name.
   * @param category Product category.
   * @param unitPrice Product price.
   * @param quantity Quantity removed.
   * @param currency Product price currency.
   * @param context Context relating to the event.
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackRemoveFromCart(
    sku: string,
    name: string,
    category: string,
    unitPrice: string,
    quantity: string,
    currency?: string,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData;

  /**
   * Track the value of a form field changing or receiving focus
   *
   * @param schema The schema type of the event
   * @param formId The parent form ID
   * @param elementId ID of the changed element
   * @param nodeName "INPUT", "TEXTAREA", or "SELECT"
   * @param type Type of the changed element if its type is "INPUT"
   * @param elementClasses List of classes of the changed element
   * @param value The new value of the changed element
   * @param context Context relating to the event.
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackFormFocusOrChange(
    schema: string,
    formId: string,
    elementId: string,
    nodeName: string,
    type: string,
    elementClasses: Array<string>,
    value: string,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData;

  /**
   * Track a form submission event
   *
   * @param formId ID of the form
   * @param formClasses Classes of the form
   * @param elements Mutable elements within the form
   * @param context Context relating to the event.
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackFormSubmission(
    formId: string,
    formClasses: Array<string>,
    elements: Array<Record<string, unknown>>,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData;

  /**
   * Track an internal search event
   *
   * @param terms Search terms
   * @param filters Search filters
   * @param totalResults Number of results
   * @param pageResults Number of results displayed on page
   * @param context Context relating to the event.
   * @param tstamp Timestamp of the event
   * @return Payload
   */
  trackSiteSearch(
    terms: Array<string>,
    filters: Record<string, string | boolean>,
    totalResults: number,
    pageResults: number,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData;

  /**
   * Track a consent withdrawn event
   *
   * @param all Indicates user withdraws consent for all documents.
   * @param id ID number associated with document.
   * @param version Version number of document.
   * @param name Name of document.
   * @param description Description of document.
   * @param context Context relating to the event.
   * @param tstamp Timestamp of the event.
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackConsentWithdrawn(
    all: boolean,
    id?: string,
    version?: string,
    name?: string,
    description?: string,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData;

  /**
   * Track a consent granted event
   *
   * @param id ID number associated with document.
   * @param version Version number of document.
   * @param name Name of document.
   * @param description Description of document.
   * @param expiry Date-time when consent expires.
   * @param context Context relating to the event.
   * @param tstamp Timestamp of the event.
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  trackConsentGranted(
    id: string,
    version: string,
    name?: string,
    description?: string,
    expiry?: string,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData;

  /**
   * Adds contexts globally, contexts added here will be attached to all applicable events
   * @param contexts An array containing either contexts or a conditional contexts
   */
  addGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>): void;

  /**
   * Removes all global contexts
   */
  clearGlobalContexts(): void;

  /**
   * Removes previously added global context, performs a deep comparison of the contexts or conditional contexts
   * @param contexts An array containing either contexts or a conditional contexts
   */
  removeGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>): void;
}

/**
 * Create a tracker core object
 *
 * @param base64 Whether to base 64 encode contexts and unstructured event JSONs
 * @param callback Function applied to every payload dictionary object
 * @return Tracker core
 */
export function trackerCore(base64: boolean, callback?: (PayloadData: PayloadData) => void): Core {
  const globalContextsHelper: GlobalContexts = globalContexts();

  // Dictionary of key-value pairs which get added to every payload, e.g. tracker version
  let payloadPairs: PayloadDictionary = {};

  // base 64 encoding should default to true
  if (typeof base64 === 'undefined') {
    base64 = true;
  }

  /**
   * Returns a copy of a JSON with undefined and null properties removed
   *
   * @param eventJson JSON object to clean
   * @param exemptFields Set of fields which should not be removed even if empty
   * @return A cleaned copy of eventJson
   */
  const removeEmptyProperties = (
    eventJson: PayloadDictionary,
    exemptFields?: { [key: string]: boolean }
  ): PayloadDictionary => {
    const ret: PayloadDictionary = {};
    exemptFields = exemptFields || {};
    for (const k in eventJson) {
      if (exemptFields[k] || (eventJson[k] !== null && typeof eventJson[k] !== 'undefined')) {
        ret[k] = eventJson[k];
      }
    }
    return ret;
  };

  /**
   * Wraps an array of custom contexts in a self-describing JSON
   *
   * @param contexts Array of custom context self-describing JSONs
   * @return Outer JSON
   */
  const completeContexts = (contexts?: Array<SelfDescribingJson>): Record<string, unknown> | undefined => {
    if (contexts && contexts.length) {
      return {
        schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
        data: contexts,
      };
    }
    return undefined;
  };

  /**
   * Adds all global contexts to a contexts array
   *
   * @param sb PayloadData
   * @param contexts Custom contexts relating to the event
   */
  const attachGlobalContexts = (sb: PayloadData, contexts?: Array<SelfDescribingJson>): Array<SelfDescribingJson> => {
    const applicableContexts: Array<SelfDescribingJson> = globalContextsHelper.getApplicableContexts(sb);
    const returnedContexts: Array<SelfDescribingJson> = [];
    if (contexts && contexts.length) {
      returnedContexts.push(...contexts);
    }
    if (applicableContexts && applicableContexts.length) {
      returnedContexts.push(...applicableContexts);
    }
    return returnedContexts;
  };

  /**
   * Gets called by every trackXXX method
   * Adds context and payloadPairs name-value pairs to the payload
   * Applies the callback to the built payload
   *
   * @param sb Payload
   * @param context Custom contexts relating to the event
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload after the callback is applied
   */
  const track = (
    sb: PayloadData,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData => {
    sb.addDict(payloadPairs);
    sb.add('eid', v4());
    const timestamp = getTimestamp(tstamp);
    sb.add(timestamp.type, timestamp.value.toString());
    const allContexts = attachGlobalContexts(sb, context);
    const wrappedContexts = completeContexts(allContexts);
    if (wrappedContexts !== undefined) {
      sb.addJson('cx', 'co', wrappedContexts);
    }

    if (typeof callback === 'function') {
      callback(sb);
    }

    try {
      afterTrack && afterTrack(sb.build());
    } catch (ex) {
      console.warn('Snowplow: error running custom callback');
    }

    return sb;
  };

  /**
   * Log an self-describing (previously unstruct) event
   *
   * @param properties Contains the properties and schema location for the event
   * @param context Custom contexts relating to the event
   * @param tstamp Timestamp of the event
   * @param afterTrack A callback function triggered after event is tracked
   * @return Payload
   */
  const trackSelfDescribingEvent = (
    properties: Record<string, unknown>,
    context?: Array<SelfDescribingJson>,
    tstamp?: Timestamp,
    afterTrack?: (Payload: PayloadDictionary) => void
  ): PayloadData => {
    const sb = payloadBuilder(base64);
    const ueJson = {
      schema: 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0',
      data: properties,
    };

    sb.add('e', 'ue');
    sb.addJson('ue_px', 'ue_pr', ueJson);

    return track(sb, context, tstamp, afterTrack);
  };

  /**
   * Set a persistent key-value pair to be added to every payload
   *
   * @param key Field name
   * @param value Field value
   */
  const addPayloadPair = (key: string, value: string): void => {
    payloadPairs[key] = value;
  };

  return {
    addPayloadPair,

    setBase64Encoding(encode: boolean): void {
      base64 = encode;
    },

    addPayloadDict(dict: PayloadDictionary): void {
      for (const key in dict) {
        if (Object.prototype.hasOwnProperty.call(dict, key)) {
          payloadPairs[key] = dict[key];
        }
      }
    },

    resetPayloadPairs(dict: PayloadDictionary): void {
      payloadPairs = isJson(dict) ? dict : {};
    },

    setTrackerVersion(version: string): void {
      addPayloadPair('tv', version);
    },

    setTrackerNamespace(name: string): void {
      addPayloadPair('tna', name);
    },

    setAppId(appId: string): void {
      addPayloadPair('aid', appId);
    },

    setPlatform(value: string): void {
      addPayloadPair('p', value);
    },

    setUserId(userId: string): void {
      addPayloadPair('uid', userId);
    },

    setScreenResolution(width: string, height: string): void {
      addPayloadPair('res', width + 'x' + height);
    },

    setViewport(width: string, height: string): void {
      addPayloadPair('vp', width + 'x' + height);
    },

    setColorDepth(depth: string): void {
      addPayloadPair('cd', depth);
    },

    setTimezone(timezone: string): void {
      addPayloadPair('tz', timezone);
    },

    setLang(lang: string): void {
      addPayloadPair('lang', lang);
    },

    setIpAddress(ip: string): void {
      addPayloadPair('ip', ip);
    },

    setUseragent(useragent: string): void {
      addPayloadPair('ua', useragent);
    },

    trackUnstructEvent: trackSelfDescribingEvent,

    trackSelfDescribingEvent,

    trackPageView(
      pageUrl: string,
      pageTitle: string,
      referrer: string,
      context?: Array<SelfDescribingJson>,
      tstamp?: Timestamp,
      afterTrack?: (Payload: PayloadDictionary) => void
    ): PayloadData {
      const sb = payloadBuilder(base64);
      sb.add('e', 'pv'); // 'pv' for Page View
      sb.add('url', pageUrl);
      sb.add('page', pageTitle);
      sb.add('refr', referrer);

      return track(sb, context, tstamp, afterTrack);
    },

    trackPagePing(
      pageUrl: string,
      pageTitle: string,
      referrer: string,
      minXOffset: number,
      maxXOffset: number,
      minYOffset: number,
      maxYOffset: number,
      context?: Array<SelfDescribingJson>,
      tstamp?: Timestamp,
      afterTrack?: (Payload: PayloadDictionary) => void
    ): PayloadData {
      const sb = payloadBuilder(base64);
      sb.add('e', 'pp'); // 'pp' for Page Ping
      sb.add('url', pageUrl);
      sb.add('page', pageTitle);
      sb.add('refr', referrer);
      sb.add('pp_mix', minXOffset.toString());
      sb.add('pp_max', maxXOffset.toString());
      sb.add('pp_miy', minYOffset.toString());
      sb.add('pp_may', maxYOffset.toString());

      return track(sb, context, tstamp, afterTrack);
    },

    trackStructEvent(
      category: string,
      action: string,
      label: string,
      property: string,
      value?: number,
      context?: Array<SelfDescribingJson>,
      tstamp?: Timestamp,
      afterTrack?: (Payload: PayloadDictionary) => void
    ): PayloadData {
      const sb = payloadBuilder(base64);
      sb.add('e', 'se'); // 'se' for Structured Event
      sb.add('se_ca', category);
      sb.add('se_ac', action);
      sb.add('se_la', label);
      sb.add('se_pr', property);
      sb.add('se_va', value == null ? undefined : value.toString());

      return track(sb, context, tstamp, afterTrack);
    },

    trackEcommerceTransaction(
      orderId: string,
      affiliation: string,
      totalValue: string,
      taxValue?: string,
      shipping?: string,
      city?: string,
      state?: string,
      country?: string,
      currency?: string,
      context?: Array<SelfDescribingJson>,
      tstamp?: Timestamp,
      afterTrack?: (Payload: PayloadDictionary) => void
    ): PayloadData {
      const sb = payloadBuilder(base64);
      sb.add('e', 'tr'); // 'tr' for Transaction
      sb.add('tr_id', orderId);
      sb.add('tr_af', affiliation);
      sb.add('tr_tt', totalValue);
      sb.add('tr_tx', taxValue);
      sb.add('tr_sh', shipping);
      sb.add('tr_ci', city);
      sb.add('tr_st', state);
      sb.add('tr_co', country);
      sb.add('tr_cu', currency);

      return track(sb, context, tstamp, afterTrack);
    },

    trackEcommerceTransactionItem(
      orderId: string,
      sku: string,
      name: string,
      category: string,
      price: string,
      quantity: string,
      currency?: string,
      context?: Array<SelfDescribingJson>,
      tstamp?: Timestamp,
      afterTrack?: (Payload: PayloadDictionary) => void
    ): PayloadData {
      const sb = payloadBuilder(base64);
      sb.add('e', 'ti'); // 'tr' for Transaction Item
      sb.add('ti_id', orderId);
      sb.add('ti_sk', sku);
      sb.add('ti_nm', name);
      sb.add('ti_ca', category);
      sb.add('ti_pr', price);
      sb.add('ti_qu', quantity);
      sb.add('ti_cu', currency);

      return track(sb, context, tstamp, afterTrack);
    },

    trackScreenView(
      name: string,
      id: string,
      context?: Array<SelfDescribingJson>,
      tstamp?: Timestamp,
      afterTrack?: (Payload: PayloadDictionary) => void
    ): PayloadData {
      return trackSelfDescribingEvent(
        {
          schema: 'iglu:com.snowplowanalytics.snowplow/screen_view/jsonschema/1-0-0',
          data: removeEmptyProperties({
            name: name,
            id: id,
          }),
        },
        context,
        tstamp,
        afterTrack
      );
    },

    trackLinkClick(
      targetUrl: string,
      elementId: string,
      elementClasses: Array<string>,
      elementTarget: string,
      elementContent: string,
      context?: Array<SelfDescribingJson>,
      tstamp?: Timestamp,
      afterTrack?: (Payload: PayloadDictionary) => void
    ): PayloadData {
      const eventJson = {
        schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
        data: removeEmptyProperties({
          targetUrl: targetUrl,
          elementId: elementId,
          elementClasses: elementClasses,
          elementTarget: elementTarget,
          elementContent: elementContent,
        }),
      };

      return trackSelfDescribingEvent(eventJson, context, tstamp, afterTrack);
    },

    trackAdImpression(
      impressionId: string,
      costModel: string,
      cost: number,
      targetUrl: string,
      bannerId: string,
      zoneId: string,
      advertiserId: string,
      campaignId: string,
      context?: Array<SelfDescribingJson>,
      tstamp?: Timestamp,
      afterTrack?: (Payload: PayloadDictionary) => void
    ): PayloadData {
      const eventJson = {
        schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
        data: removeEmptyProperties({
          impressionId: impressionId,
          costModel: costModel,
          cost: cost,
          targetUrl: targetUrl,
          bannerId: bannerId,
          zoneId: zoneId,
          advertiserId: advertiserId,
          campaignId: campaignId,
        }),
      };

      return trackSelfDescribingEvent(eventJson, context, tstamp, afterTrack);
    },

    trackAdClick(
      targetUrl: string,
      clickId: string,
      costModel: string,
      cost: number,
      bannerId: string,
      zoneId: string,
      impressionId: string,
      advertiserId: string,
      campaignId: string,
      context?: Array<SelfDescribingJson>,
      tstamp?: Timestamp,
      afterTrack?: (Payload: PayloadDictionary) => void
    ): PayloadData {
      const eventJson = {
        schema: 'iglu:com.snowplowanalytics.snowplow/ad_click/jsonschema/1-0-0',
        data: removeEmptyProperties({
          targetUrl: targetUrl,
          clickId: clickId,
          costModel: costModel,
          cost: cost,
          bannerId: bannerId,
          zoneId: zoneId,
          impressionId: impressionId,
          advertiserId: advertiserId,
          campaignId: campaignId,
        }),
      };

      return trackSelfDescribingEvent(eventJson, context, tstamp, afterTrack);
    },

    trackAdConversion(
      conversionId: string,
      costModel: string,
      cost: number,
      category: string,
      action: string,
      property: string,
      initialValue: number,
      advertiserId: string,
      campaignId: string,
      context?: Array<SelfDescribingJson>,
      tstamp?: Timestamp,
      afterTrack?: (Payload: PayloadDictionary) => void
    ): PayloadData {
      const eventJson = {
        schema: 'iglu:com.snowplowanalytics.snowplow/ad_conversion/jsonschema/1-0-0',
        data: removeEmptyProperties({
          conversionId: conversionId,
          costModel: costModel,
          cost: cost,
          category: category,
          action: action,
          property: property,
          initialValue: initialValue,
          advertiserId: advertiserId,
          campaignId: campaignId,
        }),
      };

      return trackSelfDescribingEvent(eventJson, context, tstamp, afterTrack);
    },

    trackSocialInteraction(
      action: string,
      network: string,
      target: string,
      context?: Array<SelfDescribingJson>,
      tstamp?: Timestamp,
      afterTrack?: (Payload: PayloadDictionary) => void
    ): PayloadData {
      const eventJson = {
        schema: 'iglu:com.snowplowanalytics.snowplow/social_interaction/jsonschema/1-0-0',
        data: removeEmptyProperties({
          action: action,
          network: network,
          target: target,
        }),
      };

      return trackSelfDescribingEvent(eventJson, context, tstamp, afterTrack);
    },

    trackAddToCart(
      sku: string,
      name: string,
      category: string,
      unitPrice: string,
      quantity: string,
      currency?: string,
      context?: Array<SelfDescribingJson>,
      tstamp?: Timestamp,
      afterTrack?: (Payload: PayloadDictionary) => void
    ): PayloadData {
      return trackSelfDescribingEvent(
        {
          schema: 'iglu:com.snowplowanalytics.snowplow/add_to_cart/jsonschema/1-0-0',
          data: removeEmptyProperties({
            sku: sku,
            name: name,
            category: category,
            unitPrice: unitPrice,
            quantity: quantity,
            currency: currency,
          }),
        },
        context,
        tstamp,
        afterTrack
      );
    },

    trackRemoveFromCart(
      sku: string,
      name: string,
      category: string,
      unitPrice: string,
      quantity: string,
      currency?: string,
      context?: Array<SelfDescribingJson>,
      tstamp?: Timestamp,
      afterTrack?: (Payload: PayloadDictionary) => void
    ): PayloadData {
      return trackSelfDescribingEvent(
        {
          schema: 'iglu:com.snowplowanalytics.snowplow/remove_from_cart/jsonschema/1-0-0',
          data: removeEmptyProperties({
            sku: sku,
            name: name,
            category: category,
            unitPrice: unitPrice,
            quantity: quantity,
            currency: currency,
          }),
        },
        context,
        tstamp,
        afterTrack
      );
    },

    trackFormFocusOrChange(
      schema: string,
      formId: string,
      elementId: string,
      nodeName: string,
      type: string,
      elementClasses: Array<string>,
      value: string,
      context?: Array<SelfDescribingJson>,
      tstamp?: Timestamp,
      afterTrack?: (Payload: PayloadDictionary) => void
    ): PayloadData {
      let event_schema = '';
      const event_data: PayloadDictionary = { formId, elementId, nodeName, elementClasses, value };
      if (schema === 'change_form') {
        event_schema = 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0';
        event_data.type = type;
      } else if (schema === 'focus_form') {
        event_schema = 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0';
        event_data.elementType = type;
      }
      return trackSelfDescribingEvent(
        {
          schema: event_schema,
          data: removeEmptyProperties(event_data, { value: true }),
        },
        context,
        tstamp,
        afterTrack
      );
    },

    trackFormSubmission(
      formId: string,
      formClasses: Array<string>,
      elements: Array<Record<string, unknown>>,
      context?: Array<SelfDescribingJson>,
      tstamp?: Timestamp,
      afterTrack?: (Payload: PayloadDictionary) => void
    ): PayloadData {
      return trackSelfDescribingEvent(
        {
          schema: 'iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0',
          data: removeEmptyProperties({
            formId: formId,
            formClasses: formClasses,
            elements: elements,
          }),
        },
        context,
        tstamp,
        afterTrack
      );
    },

    trackSiteSearch(
      terms: Array<string>,
      filters: Record<string, string | boolean>,
      totalResults: number,
      pageResults: number,
      context?: Array<SelfDescribingJson>,
      tstamp?: Timestamp,
      afterTrack?: (Payload: PayloadDictionary) => void
    ): PayloadData {
      return trackSelfDescribingEvent(
        {
          schema: 'iglu:com.snowplowanalytics.snowplow/site_search/jsonschema/1-0-0',
          data: removeEmptyProperties({
            terms: terms,
            filters: filters,
            totalResults: totalResults,
            pageResults: pageResults,
          }),
        },
        context,
        tstamp,
        afterTrack
      );
    },

    trackConsentWithdrawn(
      all: boolean,
      id?: string,
      version?: string,
      name?: string,
      description?: string,
      context?: Array<SelfDescribingJson>,
      tstamp?: Timestamp,
      afterTrack?: (Payload: PayloadDictionary) => void
    ): PayloadData {
      const documentJson = {
        schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
        data: removeEmptyProperties({
          id: id,
          version: version,
          name: name,
          description: description,
        }),
      };

      return trackSelfDescribingEvent(
        {
          schema: 'iglu:com.snowplowanalytics.snowplow/consent_withdrawn/jsonschema/1-0-0',
          data: removeEmptyProperties({
            all: all,
          }),
        },
        documentJson.data && context ? context.concat([documentJson]) : context,
        tstamp,
        afterTrack
      );
    },

    trackConsentGranted(
      id: string,
      version: string,
      name?: string,
      description?: string,
      expiry?: string,
      context?: Array<SelfDescribingJson>,
      tstamp?: Timestamp,
      afterTrack?: (Payload: PayloadDictionary) => void
    ): PayloadData {
      const documentJson = {
        schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
        data: removeEmptyProperties({
          id: id,
          version: version,
          name: name,
          description: description,
        }),
      };

      return trackSelfDescribingEvent(
        {
          schema: 'iglu:com.snowplowanalytics.snowplow/consent_granted/jsonschema/1-0-0',
          data: removeEmptyProperties({
            expiry: expiry,
          }),
        },
        context ? context.concat([documentJson]) : [documentJson],
        tstamp,
        afterTrack
      );
    },

    addGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>): void {
      globalContextsHelper.addGlobalContexts(contexts);
    },

    clearGlobalContexts(): void {
      globalContextsHelper.clearGlobalContexts();
    },

    removeGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>): void {
      globalContextsHelper.removeGlobalContexts(contexts);
    },
  };
}
