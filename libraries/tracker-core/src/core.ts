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

import { v4 } from 'uuid';
import { payloadBuilder, PayloadBuilder, Payload, isJson } from './payload';
import {
  globalContexts,
  ConditionalContextProvider,
  ContextPrimitive,
  GlobalContexts,
  PluginContexts,
  pluginContexts,
} from './contexts';
import { CorePlugin } from './plugins';

/**
 * Interface common for any Self-Describing JSON such as custom context or
 * Self-describing (ex-unstuctured) event
 */
export type SelfDescribingJson<T extends Record<keyof T, unknown> = Record<string, unknown>> = {
  schema: string;
  data: T;
};
export type SelfDescribingJsonArray<T extends Record<keyof T, unknown> = Record<string, unknown>> = {
  schema: string;
  data: Array<T>;
};

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
 * @param timestamp optional number or timestamp object
 * @returns correct timestamp object
 */
function getTimestamp(timestamp?: Timestamp | null): TimestampPayload {
  if (timestamp == null) {
    return { type: 'dtm', value: new Date().getTime() };
  } else if (typeof timestamp === 'number') {
    return { type: 'dtm', value: timestamp };
  } else if (timestamp.type === 'ttm') {
    // We can return timestamp here, but this is safer fallback
    return { type: 'ttm', value: timestamp.value };
  } else {
    return { type: 'dtm', value: timestamp.value || new Date().getTime() };
  }
}

/**
 * Interface containing all Core functions
 */
export interface TrackerCore {
  /**
   * Call with a payload from a buildX function
   * Adds context and payloadPairs name-value pairs to the payload
   * Applies the callback to the built payload
   *
   * @param sb Payload
   * @param context Custom contexts relating to the event
   * @param timestamp Timestamp of the event
   * @param  A callback function triggered after event is tracked
   * @return Payload after the callback is applied
   */
  track: (
    sb: PayloadBuilder,
    context?: Array<SelfDescribingJson> | null,
    timestamp?: Timestamp | null
  ) => PayloadBuilder;

  /**
   * Set a persistent key-value pair to be added to every payload
   *
   * @param key Field name
   * @param value Field value
   */
  addPayloadPair: (key: string, value: string | number) => void;

  /**
   * Get current base64 encoding state
   */
  getBase64Encoding(): boolean;

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
  addPayloadDict(dict: Payload): void;

  /**
   * Replace payloadPairs with a new dictionary
   *
   * @param dict Resets all current payload pairs with a new dictionary of pairs
   */
  resetPayloadPairs(dict: Payload): void;

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
 * @param base64 Whether to base 64 encode contexts and self describing event JSONs
 * @param callback Function applied to every payload dictionary object
 * @return Tracker core
 */
export function trackerCore(
  base64?: boolean,
  corePlugins?: Array<CorePlugin>,
  callback?: (PayloadData: PayloadBuilder) => void
): TrackerCore {
  let encodeBase64 = base64 ?? true,
    payloadPairs: Payload = {}; // Dictionary of key-value pairs which get added to every payload, e.g. tracker version

  const plugins = corePlugins ?? [],
    pluginContextsHelper: PluginContexts = pluginContexts(plugins),
    globalContextsHelper: GlobalContexts = globalContexts();

  /**
   * Wraps an array of custom contexts in a self-describing JSON
   *
   * @param contexts Array of custom context self-describing JSONs
   * @return Outer JSON
   */
  const completeContexts = (
    contexts?: Array<SelfDescribingJson>
  ): SelfDescribingJsonArray<SelfDescribingJson> | undefined => {
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
  const attachGlobalContexts = (
    sb: PayloadBuilder,
    contexts?: Array<SelfDescribingJson> | null
  ): Array<SelfDescribingJson> => {
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
   * @param timestamp Timestamp of the event
   * @return Payload after the callback is applied
   */
  const track = (
    sb: PayloadBuilder,
    context?: Array<SelfDescribingJson> | null,
    timestamp?: Timestamp | null
  ): PayloadBuilder => {
    sb.setBase64Encoding(encodeBase64);
    sb.addDict(payloadPairs);
    sb.add('eid', v4());
    const tstamp = getTimestamp(timestamp);
    sb.add(tstamp.type, tstamp.value.toString());
    const allContexts = attachGlobalContexts(sb, pluginContextsHelper.addPluginContexts(context));
    const wrappedContexts = completeContexts(allContexts);
    if (wrappedContexts !== undefined) {
      sb.addJson('cx', 'co', wrappedContexts);
    }

    plugins.forEach((plugin) => {
      try {
        if (plugin.beforeTrack) {
          plugin.beforeTrack(sb);
        }
      } catch (ex) {
        console.warn('Snowplow: error with plugin beforeTrack', ex);
      }
    });

    if (typeof callback === 'function') {
      callback(sb);
    }

    plugins.forEach((plugin) => {
      try {
        if (plugin.afterTrack) {
          plugin.afterTrack(sb.build());
        }
      } catch (ex) {
        console.warn('Snowplow: error with plugin ', ex);
      }
    });

    return sb;
  };

  /**
   * Set a persistent key-value pair to be added to every payload
   *
   * @param key Field name
   * @param value Field value
   */
  const addPayloadPair = (key: string, value: string | number): void => {
    payloadPairs[key] = value;
  };

  const core = {
    track,

    addPayloadPair,

    getBase64Encoding() {
      return encodeBase64;
    },

    setBase64Encoding(encode: boolean) {
      encodeBase64 = encode;
    },

    addPayloadDict(dict: Payload) {
      for (const key in dict) {
        if (Object.prototype.hasOwnProperty.call(dict, key)) {
          payloadPairs[key] = dict[key];
        }
      }
    },

    resetPayloadPairs(dict: Payload) {
      payloadPairs = isJson(dict) ? dict : {};
    },

    setTrackerVersion(version: string) {
      addPayloadPair('tv', version);
    },

    setTrackerNamespace(name: string) {
      addPayloadPair('tna', name);
    },

    setAppId(appId: string) {
      addPayloadPair('aid', appId);
    },

    setPlatform(value: string) {
      addPayloadPair('p', value);
    },

    setUserId(userId: string) {
      addPayloadPair('uid', userId);
    },

    setScreenResolution(width: string, height: string) {
      addPayloadPair('res', width + 'x' + height);
    },

    setViewport(width: string, height: string) {
      addPayloadPair('vp', width + 'x' + height);
    },

    setColorDepth(depth: string) {
      addPayloadPair('cd', depth);
    },

    setTimezone(timezone: string) {
      addPayloadPair('tz', timezone);
    },

    setLang(lang: string) {
      addPayloadPair('lang', lang);
    },

    setIpAddress(ip: string) {
      addPayloadPair('ip', ip);
    },

    setUseragent(useragent: string) {
      addPayloadPair('ua', useragent);
    },

    addGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>) {
      globalContextsHelper.addGlobalContexts(contexts);
    },

    clearGlobalContexts(): void {
      globalContextsHelper.clearGlobalContexts();
    },

    removeGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>) {
      globalContextsHelper.removeGlobalContexts(contexts);
    },
  };

  return core;
}

/**
 * Log a self-describing event
 *
 * @param properties Contains the properties and schema location for the event
 * @return Payload
 */
export function buildSelfDescribingEvent({ event }: { event: SelfDescribingJson }): PayloadBuilder {
  const sb = payloadBuilder();
  const ueJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0',
    data: event,
  };

  sb.add('e', 'ue');
  sb.addJson('ue_px', 'ue_pr', ueJson);

  return sb;
}

export function buildPageView({
  pageUrl,
  pageTitle,
  referrer,
}: {
  pageUrl: string | null;
  pageTitle: string | null;
  referrer: string | null;
  context?: Array<SelfDescribingJson> | null;
  timestamp?: Timestamp | null;
}): PayloadBuilder {
  const sb = payloadBuilder();
  sb.add('e', 'pv'); // 'pv' for Page View
  sb.add('url', pageUrl);
  sb.add('page', pageTitle);
  sb.add('refr', referrer);

  return sb;
}

export function buildPagePing({
  pageUrl,
  pageTitle,
  referrer,
  minXOffset,
  maxXOffset,
  minYOffset,
  maxYOffset,
}: {
  pageUrl: string;
  pageTitle: string;
  referrer: string;
  minXOffset: number;
  maxXOffset: number;
  minYOffset: number;
  maxYOffset: number;
}): PayloadBuilder {
  const sb = payloadBuilder();
  sb.add('e', 'pp'); // 'pp' for Page Ping
  sb.add('url', pageUrl);
  sb.add('page', pageTitle);
  sb.add('refr', referrer);
  sb.add('pp_mix', isNaN(minXOffset) ? null : minXOffset.toString());
  sb.add('pp_max', isNaN(maxXOffset) ? null : maxXOffset.toString());
  sb.add('pp_miy', isNaN(minYOffset) ? null : minYOffset.toString());
  sb.add('pp_may', isNaN(maxYOffset) ? null : maxYOffset.toString());

  return sb;
}

export function buildStructEvent({
  category,
  action,
  label,
  property,
  value,
}: {
  category: string;
  action: string;
  label?: string;
  property?: string;
  value?: number;
}): PayloadBuilder {
  const sb = payloadBuilder();
  sb.add('e', 'se'); // 'se' for Structured Event
  sb.add('se_ca', category);
  sb.add('se_ac', action);
  sb.add('se_la', label);
  sb.add('se_pr', property);
  sb.add('se_va', value == null ? undefined : value.toString());

  return sb;
}

export function buildEcommerceTransaction({
  orderId,
  total,
  affiliation,
  tax,
  shipping,
  city,
  state,
  country,
  currency,
}: {
  orderId: string;
  total: number;
  affiliation?: string;
  tax?: number;
  shipping?: number;
  city?: string;
  state?: string;
  country?: string;
  currency?: string;
}): PayloadBuilder {
  const sb = payloadBuilder();
  sb.add('e', 'tr'); // 'tr' for Transaction
  sb.add('tr_id', orderId);
  sb.add('tr_af', affiliation);
  sb.add('tr_tt', total);
  sb.add('tr_tx', tax);
  sb.add('tr_sh', shipping);
  sb.add('tr_ci', city);
  sb.add('tr_st', state);
  sb.add('tr_co', country);
  sb.add('tr_cu', currency);

  return sb;
}

export function buildEcommerceTransactionItem({
  orderId,
  sku,
  name,
  category,
  price,
  quantity,
  currency,
}: {
  orderId: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  currency?: string;
}): PayloadBuilder {
  const sb = payloadBuilder();
  sb.add('e', 'ti'); // 'tr' for Transaction Item
  sb.add('ti_id', orderId);
  sb.add('ti_sk', sku);
  sb.add('ti_nm', name);
  sb.add('ti_ca', category);
  sb.add('ti_pr', price);
  sb.add('ti_qu', quantity);
  sb.add('ti_cu', currency);

  return sb;
}

export function buildScreenView(event: { name: string; id: string }): PayloadBuilder {
  return buildSelfDescribingEvent({
    event: {
      schema: 'iglu:com.snowplowanalytics.snowplow/screen_view/jsonschema/1-0-0',
      data: removeEmptyProperties(event),
    },
  });
}

export function buildLinkClick(event: {
  targetUrl: string;
  elementId?: string;
  elementClasses?: Array<string>;
  elementTarget?: string;
  elementContent?: string;
}): PayloadBuilder {
  const eventJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
    data: removeEmptyProperties(event),
  };

  return buildSelfDescribingEvent({ event: eventJson });
}

export function buildAdImpression(event: {
  impressionId: string;
  costModel: string;
  cost: number;
  targetUrl: string;
  bannerId: string;
  zoneId: string;
  advertiserId: string;
  campaignId: string;
}): PayloadBuilder {
  const eventJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
    data: removeEmptyProperties(event),
  };

  return buildSelfDescribingEvent({ event: eventJson });
}

export function buildAdClick(event: {
  targetUrl: string;
  clickId: string;
  costModel: string;
  cost: number;
  bannerId: string;
  zoneId: string;
  impressionId: string;
  advertiserId: string;
  campaignId: string;
}): PayloadBuilder {
  const eventJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/ad_click/jsonschema/1-0-0',
    data: removeEmptyProperties(event),
  };

  return buildSelfDescribingEvent({ event: eventJson });
}

export function buildAdConversion(event: {
  conversionId: string;
  costModel: string;
  cost: number;
  category: string;
  action: string;
  property: string;
  initialValue: number;
  advertiserId: string;
  campaignId: string;
}): PayloadBuilder {
  const eventJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/ad_conversion/jsonschema/1-0-0',
    data: removeEmptyProperties(event),
  };

  return buildSelfDescribingEvent({ event: eventJson });
}

export function buildSocialInteraction(event: { action: string; network: string; target: string }): PayloadBuilder {
  const eventJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/social_interaction/jsonschema/1-0-0',
    data: removeEmptyProperties(event),
  };

  return buildSelfDescribingEvent({ event: eventJson });
}

export function buildAddToCart(event: {
  sku: string;
  name: string;
  category: string;
  unitPrice: string;
  quantity: string;
  currency?: string;
}): PayloadBuilder {
  return buildSelfDescribingEvent({
    event: {
      schema: 'iglu:com.snowplowanalytics.snowplow/add_to_cart/jsonschema/1-0-0',
      data: removeEmptyProperties(event),
    },
  });
}

export function buildRemoveFromCart(event: {
  sku: string;
  name: string;
  category: string;
  unitPrice: string;
  quantity: string;
  currency?: string;
}): PayloadBuilder {
  return buildSelfDescribingEvent({
    event: {
      schema: 'iglu:com.snowplowanalytics.snowplow/remove_from_cart/jsonschema/1-0-0',
      data: removeEmptyProperties(event),
    },
  });
}

export function buildFormFocusOrChange({
  schema,
  formId,
  elementId,
  nodeName,
  type,
  elementClasses,
  value,
}: {
  schema: 'change_form' | 'focus_form';
  formId: string;
  elementId: string;
  nodeName: string;
  type: string | null;
  elementClasses: Array<string> | null;
  value: string | null;
}): PayloadBuilder {
  let event_schema = '';
  const event_data: Payload = { formId, elementId, nodeName, elementClasses, value };
  if (schema === 'change_form') {
    event_schema = 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0';
    event_data.type = type;
  } else if (schema === 'focus_form') {
    event_schema = 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0';
    event_data.elementType = type;
  }
  return buildSelfDescribingEvent({
    event: {
      schema: event_schema,
      data: removeEmptyProperties(event_data, { value: true }),
    },
  });
}

export function buildFormSubmission(event: {
  formId: string;
  formClasses: Array<string>;
  elements: Array<{ name: string; value: string | null; nodeName: string; type?: string }>;
}): PayloadBuilder {
  return buildSelfDescribingEvent({
    event: {
      schema: 'iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0',
      data: removeEmptyProperties(event),
    },
  });
}

export function buildSiteSearch(event: {
  terms: Array<string>;
  filters: Record<string, string | boolean>;
  totalResults: number;
  pageResults: number;
}): PayloadBuilder {
  return buildSelfDescribingEvent({
    event: {
      schema: 'iglu:com.snowplowanalytics.snowplow/site_search/jsonschema/1-0-0',
      data: removeEmptyProperties(event),
    },
  });
}

export function buildConsentWithdrawn(event: {
  all: boolean;
  id?: string;
  version?: string;
  name?: string;
  description?: string;
}) {
  const { all, ...rest } = event;
  const documentJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
    data: removeEmptyProperties(rest),
  };

  return {
    event: buildSelfDescribingEvent({
      event: {
        schema: 'iglu:com.snowplowanalytics.snowplow/consent_withdrawn/jsonschema/1-0-0',
        data: removeEmptyProperties({
          all: all,
        }),
      },
    }),
    context: [documentJson],
  };
}

export function buildConsentGranted(event: {
  id: string;
  version: string;
  name?: string;
  description?: string;
  expiry?: string;
}) {
  const { expiry, ...rest } = event;
  const documentJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
    data: removeEmptyProperties(rest),
  };

  return {
    event: buildSelfDescribingEvent({
      event: {
        schema: 'iglu:com.snowplowanalytics.snowplow/consent_granted/jsonschema/1-0-0',
        data: removeEmptyProperties({
          expiry: expiry,
        }),
      },
    }),
    context: [documentJson],
  };
}

/**
 * Returns a copy of a JSON with undefined and null properties removed
 *
 * @param eventJson JSON object to clean
 * @param exemptFields Set of fields which should not be removed even if empty
 * @return A cleaned copy of eventJson
 */
function removeEmptyProperties(eventJson: Record<string, any>, exemptFields: { [key: string]: boolean } = {}): Payload {
  const ret: Payload = {};
  for (const k in eventJson) {
    if (exemptFields[k] || (eventJson[k] !== null && typeof eventJson[k] !== 'undefined')) {
      ret[k] = eventJson[k];
    }
  }
  return ret;
}
