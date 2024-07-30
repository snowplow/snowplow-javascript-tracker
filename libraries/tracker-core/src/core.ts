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

import { v4 as uuid } from 'uuid';
import { payloadBuilder, PayloadBuilder, Payload, isJson, payloadJsonProcessor } from './payload';
import {
  globalContexts,
  ConditionalContextProvider,
  ContextPrimitive,
  GlobalContexts,
  PluginContexts,
  pluginContexts,
} from './contexts';
import { CorePlugin } from './plugins';
import { LOG } from './logger';

/**
 * Export interface for any Self-Describing JSON such as context or Self Describing events
 * @typeParam T - The type of the data object within a SelfDescribingJson
 */
export type SelfDescribingJson<T extends Record<keyof T, unknown> = Record<string, unknown>> = {
  /**
   * The schema string
   * @example 'iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0'
   */
  schema: string;
  /**
   * The data object which should conform to the supplied schema
   */
  data: T;
};

/**
 * Export interface for any Self-Describing JSON which has the data attribute as an array
 * @typeParam T - The type of the data object within the SelfDescribingJson data array
 */
export type SelfDescribingJsonArray<T extends Record<keyof T, unknown> = Record<string, unknown>> = {
  /**
   * The schema string
   * @example 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-1'
   */
  schema: string;
  /**
   * The data array which should conform to the supplied schema
   */
  data: Array<T>;
};

/**
 * Algebraic datatype representing possible timestamp type choice
 */
export type Timestamp = TrueTimestamp | DeviceTimestamp | number;

/**
 * A representation of a True Timestamp (ttm)
 */
export interface TrueTimestamp {
  readonly type: 'ttm';
  readonly value: number;
}

/**
 * A representation of a Device Timestamp (dtm)
 */
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
 * @param timestamp - optional number or timestamp object
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

/** Additional data points to set when tracking an event */
export interface CommonEventProperties<T = Record<string, unknown>> {
  /** Add context to an event by setting an Array of Self Describing JSON */
  context?: Array<SelfDescribingJson<T>> | null;
  /** Set the true timestamp or overwrite the device sent timestamp on an event */
  timestamp?: Timestamp | null;
}

/**
 * Export interface containing all Core functions
 */
export interface TrackerCore {
  /**
   * Call with a payload from a buildX function
   * Adds context and payloadPairs name-value pairs to the payload
   * Applies the callback to the built payload
   *
   * @param pb - Payload
   * @param context - Custom contexts relating to the event
   * @param timestamp - Timestamp of the event
   * @returns Payload after the callback is applied
   */
  track: (
    /** A PayloadBuilder created by one of the `buildX` functions */
    pb: PayloadBuilder,
    /** The additional contextual information related to the event */
    context?: Array<SelfDescribingJson> | null,
    /** Timestamp override */
    timestamp?: Timestamp | null
  ) => Payload;

  /**
   * Set a persistent key-value pair to be added to every payload
   *
   * @param key - Field name
   * @param value - Field value
   */
  addPayloadPair: (key: string, value: unknown) => void;

  /**
   * Get current base64 encoding state
   */
  getBase64Encoding(): boolean;

  /**
   * Turn base 64 encoding on or off
   *
   * @param encode - Whether to encode payload
   */
  setBase64Encoding(encode: boolean): void;

  /**
   * Merges a dictionary into payloadPairs
   *
   * @param dict - Adds a new payload dictionary to the existing one
   */
  addPayloadDict(dict: Payload): void;

  /**
   * Replace payloadPairs with a new dictionary
   *
   * @param dict - Resets all current payload pairs with a new dictionary of pairs
   */
  resetPayloadPairs(dict: Payload): void;

  /**
   * Set the tracker version
   *
   * @param version - The version of the current tracker
   */
  setTrackerVersion(version: string): void;

  /**
   * Set the tracker namespace
   *
   * @param name - The trackers namespace
   */
  setTrackerNamespace(name: string): void;

  /**
   * Set the application ID
   *
   * @param appId - An application ID which identifies the current application
   */
  setAppId(appId: string): void;

  /**
   * Set the platform
   *
   * @param value - A valid Snowplow platform value
   */
  setPlatform(value: string): void;

  /**
   * Set the user ID
   *
   * @param userId - The custom user id
   */
  setUserId(userId: string): void;

  /**
   * Set the screen resolution
   *
   * @param width - screen resolution width
   * @param height - screen resolution height
   */
  setScreenResolution(width: string, height: string): void;

  /**
   * Set the viewport dimensions
   *
   * @param width - viewport width
   * @param height - viewport height
   */
  setViewport(width: string, height: string): void;

  /**
   * Set the color depth
   *
   * @param depth - A color depth value as string
   */
  setColorDepth(depth: string): void;

  /**
   * Set the timezone
   *
   * @param timezone - A timezone string
   */
  setTimezone(timezone: string): void;

  /**
   * Set the language
   *
   * @param lang - A language string e.g. 'en-UK'
   */
  setLang(lang: string): void;

  /**
   * Set the IP address
   *
   * @param ip - An IP Address string
   */
  setIpAddress(ip: string): void;

  /**
   * Set the Useragent
   *
   * @param useragent - A useragent string
   */
  setUseragent(useragent: string): void;

  /**
   * Adds contexts globally, contexts added here will be attached to all applicable events
   * @param contexts - An array containing either contexts or a conditional contexts
   */
  addGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>): void;

  /**
   * Removes all global contexts
   */
  clearGlobalContexts(): void;

  /**
   * Removes previously added global context, performs a deep comparison of the contexts or conditional contexts
   * @param contexts - An array containing either contexts or a conditional contexts
   */
  removeGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>): void;

  /**
   * Add a plugin into the plugin collection after Core has already been initialised
   * @param configuration - The plugin to add
   */
  addPlugin(configuration: CorePluginConfiguration): void;
}

/**
 * The configuration object for the tracker core library
 */
export interface CoreConfiguration {
  /* Should payloads be base64 encoded when built */
  base64?: boolean;
  /* A list of all the plugins to include at load */
  corePlugins?: Array<CorePlugin>;
  /* The callback which will fire each time `track()` is called */
  callback?: (PayloadData: PayloadBuilder) => void;
}

/**
 * The configuration of the plugin to add
 */
export interface CorePluginConfiguration {
  /* The plugin to add */
  plugin: CorePlugin;
}

/**
 * Create a tracker core object
 *
 * @param base64 - Whether to base 64 encode contexts and self describing event JSONs
 * @param corePlugins - The core plugins to be processed with each event
 * @param callback - Function applied to every payload dictionary object
 * @returns Tracker core
 */
export function trackerCore(configuration: CoreConfiguration = {}): TrackerCore {
  function newCore(base64: boolean, corePlugins: Array<CorePlugin>, callback?: (PayloadData: PayloadBuilder) => void) {
    const pluginContextsHelper: PluginContexts = pluginContexts(corePlugins),
      globalContextsHelper: GlobalContexts = globalContexts();

    let encodeBase64 = base64,
      payloadPairs: Payload = {}; // Dictionary of key-value pairs which get added to every payload, e.g. tracker version

    /**
     * Wraps an array of custom contexts in a self-describing JSON
     *
     * @param contexts - Array of custom context self-describing JSONs
     * @returns Outer JSON
     */
    function completeContexts(
      contexts?: Array<SelfDescribingJson>
    ): SelfDescribingJsonArray<SelfDescribingJson> | undefined {
      if (contexts && contexts.length) {
        return {
          schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
          data: contexts,
        };
      }
      return undefined;
    }

    /**
     * Adds all global contexts to a contexts array
     *
     * @param pb - PayloadData
     * @param contexts - Custom contexts relating to the event
     */
    function attachGlobalContexts(
      pb: PayloadBuilder,
      contexts?: Array<SelfDescribingJson> | null
    ): Array<SelfDescribingJson> {
      const applicableContexts: Array<SelfDescribingJson> = globalContextsHelper.getApplicableContexts(pb);
      const returnedContexts: Array<SelfDescribingJson> = [];
      if (contexts && contexts.length) {
        returnedContexts.push(...contexts);
      }
      if (applicableContexts && applicableContexts.length) {
        returnedContexts.push(...applicableContexts);
      }
      return returnedContexts;
    }

    /**
     * Gets called by every trackXXX method
     * Adds context and payloadPairs name-value pairs to the payload
     * Applies the callback to the built payload
     *
     * @param pb - Payload
     * @param context - Custom contexts relating to the event
     * @param timestamp - Timestamp of the event
     * @returns Payload after the callback is applied
     */
    function track(
      pb: PayloadBuilder,
      context?: Array<SelfDescribingJson> | null,
      timestamp?: Timestamp | null
    ): Payload {
      pb.withJsonProcessor(payloadJsonProcessor(encodeBase64));
      pb.add('eid', uuid());
      pb.addDict(payloadPairs);
      const tstamp = getTimestamp(timestamp);
      pb.add(tstamp.type, tstamp.value.toString());
      const allContexts = attachGlobalContexts(pb, pluginContextsHelper.addPluginContexts(context));
      const wrappedContexts = completeContexts(allContexts);
      if (wrappedContexts !== undefined) {
        pb.addJson('cx', 'co', wrappedContexts);
      }

      corePlugins.forEach((plugin) => {
        try {
          if (plugin.beforeTrack) {
            plugin.beforeTrack(pb);
          }
        } catch (ex) {
          LOG.error('Plugin beforeTrack', ex);
        }
      });

      if (typeof callback === 'function') {
        callback(pb);
      }

      const finalPayload = pb.build();

      corePlugins.forEach((plugin) => {
        try {
          if (plugin.afterTrack) {
            plugin.afterTrack(finalPayload);
          }
        } catch (ex) {
          LOG.error('Plugin afterTrack', ex);
        }
      });

      return finalPayload;
    }

    /**
     * Set a persistent key-value pair to be added to every payload
     *
     * @param key - Field name
     * @param value - Field value
     */
    function addPayloadPair(key: string, value: unknown): void {
      payloadPairs[key] = value;
    }

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

  const { base64, corePlugins, callback } = configuration,
    plugins = corePlugins ?? [],
    partialCore = newCore(base64 ?? true, plugins, callback),
    core = {
      ...partialCore,
      addPlugin: (configuration: CorePluginConfiguration) => {
        const { plugin } = configuration;
        plugins.push(plugin);
        plugin.logger?.(LOG);
        plugin.activateCorePlugin?.(core);
      },
    };

  plugins?.forEach((plugin) => {
    plugin.logger?.(LOG);
    plugin.activateCorePlugin?.(core);
  });

  return core;
}

/**
 * A Self Describing Event
 * A custom event type, allowing for an event to be tracked using your own custom schema
 * and a data object which conforms to the supplied schema
 */
export interface SelfDescribingEvent {
  /** The Self Describing JSON which describes the event */
  event: SelfDescribingJson;
}

/**
 * Build a self-describing event
 * A custom event type, allowing for an event to be tracked using your own custom schema
 * and a data object which conforms to the supplied schema
 *
 * @param event - Contains the properties and schema location for the event
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildSelfDescribingEvent(event: SelfDescribingEvent): PayloadBuilder {
  const {
      event: { schema, data },
    } = event,
    pb = payloadBuilder();
  const ueJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0',
    data: { schema, data },
  };

  pb.add('e', 'ue');
  pb.addJson('ue_px', 'ue_pr', ueJson);

  return pb;
}

/**
 * A Page View Event
 * Represents a Page View, which is typically fired as soon as possible when a web page
 * is loaded within the users browser. Often also fired on "virtual page views" within
 * Single Page Applications (SPA).
 */
export interface PageViewEvent {
  /** The current URL visible in the users browser */
  pageUrl?: string | null;
  /** The current page title in the users browser */
  pageTitle?: string | null;
  /** The URL of the referring page */
  referrer?: string | null;
}

/**
 * Build a Page View Event
 * Represents a Page View, which is typically fired as soon as possible when a web page
 * is loaded within the users browser. Often also fired on "virtual page views" within
 * Single Page Applications (SPA).
 *
 * @param event - Contains the properties for the Page View event
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildPageView(event: PageViewEvent): PayloadBuilder {
  const { pageUrl, pageTitle, referrer } = event,
    pb = payloadBuilder();
  pb.add('e', 'pv'); // 'pv' for Page View
  pb.add('url', pageUrl);
  pb.add('page', pageTitle);
  pb.add('refr', referrer);

  return pb;
}

/**
 * A Page Ping Event
 * Fires when activity tracking is enabled in the browser.
 * Tracks same information as the last tracked Page View and includes scroll
 * information from the current page view
 */
export interface PagePingEvent extends PageViewEvent {
  /** The minimum X scroll position for the current page view */
  minXOffset?: number;
  /** The maximum X scroll position for the current page view */
  maxXOffset?: number;
  /** The minimum Y scroll position for the current page view */
  minYOffset?: number;
  /** The maximum Y scroll position for the current page view */
  maxYOffset?: number;
}

/**
 * Build a Page Ping Event
 * Fires when activity tracking is enabled in the browser.
 * Tracks same information as the last tracked Page View and includes scroll
 * information from the current page view
 *
 * @param event - Contains the properties for the Page Ping event
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildPagePing(event: PagePingEvent): PayloadBuilder {
  const { pageUrl, pageTitle, referrer, minXOffset, maxXOffset, minYOffset, maxYOffset } = event,
    pb = payloadBuilder();
  pb.add('e', 'pp'); // 'pp' for Page Ping
  pb.add('url', pageUrl);
  pb.add('page', pageTitle);
  pb.add('refr', referrer);
  if (minXOffset && !isNaN(Number(minXOffset))) pb.add('pp_mix', minXOffset.toString());
  if (maxXOffset && !isNaN(Number(maxXOffset))) pb.add('pp_max', maxXOffset.toString());
  if (minYOffset && !isNaN(Number(minYOffset))) pb.add('pp_miy', minYOffset.toString());
  if (maxYOffset && !isNaN(Number(maxYOffset))) pb.add('pp_may', maxYOffset.toString());

  return pb;
}

/**
 * A Structured Event
 * A classic style of event tracking, allows for easier movement between analytics
 * systems. A loosely typed event, creating a Self Describing event is preferred, but
 * useful for interoperability.
 */
export interface StructuredEvent {
  category: string;
  action: string;
  label?: string;
  property?: string;
  value?: number;
}

/**
 * Build a Structured Event
 * A classic style of event tracking, allows for easier movement between analytics
 * systems. A loosely typed event, creating a Self Describing event is preferred, but
 * useful for interoperability.
 *
 * @param event - Contains the properties for the Structured event
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildStructEvent(event: StructuredEvent): PayloadBuilder {
  const { category, action, label, property, value } = event,
    pb = payloadBuilder();
  pb.add('e', 'se'); // 'se' for Structured Event
  pb.add('se_ca', category);
  pb.add('se_ac', action);
  pb.add('se_la', label);
  pb.add('se_pr', property);
  pb.add('se_va', value == null ? undefined : value.toString());

  return pb;
}

/**
 * An Ecommerce Transaction Event
 * Allows for tracking common ecommerce events, this event is usually used when
 * a customer completes a transaction.
 */
export interface EcommerceTransactionEvent {
  /** An identifier for the order */
  orderId: string;
  /** The total value of the order  */
  total: number;
  /** Transaction affiliation (e.g. store where sale took place) */
  affiliation?: string;
  /** The amount of tax on the transaction */
  tax?: number;
  /** The amount of shipping costs for this transaction */
  shipping?: number;
  /** Delivery address, city */
  city?: string;
  /** Delivery address, state */
  state?: string;
  /** Delivery address, country */
  country?: string;
  /** Currency of the transaction */
  currency?: string;
}

/**
 * Build an Ecommerce Transaction Event
 * Allows for tracking common ecommerce events, this event is usually used when
 * a consumer completes a transaction.
 *
 * @param event - Contains the properties for the Ecommerce Transactoion event
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildEcommerceTransaction(event: EcommerceTransactionEvent): PayloadBuilder {
  const { orderId, total, affiliation, tax, shipping, city, state, country, currency } = event,
    pb = payloadBuilder();
  pb.add('e', 'tr'); // 'tr' for Transaction
  pb.add('tr_id', orderId);
  pb.add('tr_af', affiliation);
  pb.add('tr_tt', total);
  pb.add('tr_tx', tax);
  pb.add('tr_sh', shipping);
  pb.add('tr_ci', city);
  pb.add('tr_st', state);
  pb.add('tr_co', country);
  pb.add('tr_cu', currency);

  return pb;
}

/**
 * An Ecommerce Transaction Item
 * Related to the {@link EcommerceTransactionEvent}
 * Each Ecommerce Transaction may contain one or more EcommerceTransactionItem events
 */
export interface EcommerceTransactionItemEvent {
  /** An identifier for the order */
  orderId: string;
  /** A Product Stock Keeping Unit (SKU) */
  sku: string;
  /** The price of the product */
  price: number;
  /** The name of the product */
  name?: string;
  /** The category the product belongs to */
  category?: string;
  /** The quanity of this product within the transaction */
  quantity?: number;
  /** The currency of the product for the transaction */
  currency?: string;
}

/**
 * Build an Ecommerce Transaction Item Event
 * Related to the {@link buildEcommerceTransaction}
 * Each Ecommerce Transaction may contain one or more EcommerceTransactionItem events
 *
 * @param event - Contains the properties for the Ecommerce Transaction Item event
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildEcommerceTransactionItem(event: EcommerceTransactionItemEvent): PayloadBuilder {
  const { orderId, sku, price, name, category, quantity, currency } = event,
    pb = payloadBuilder();
  pb.add('e', 'ti'); // 'tr' for Transaction Item
  pb.add('ti_id', orderId);
  pb.add('ti_sk', sku);
  pb.add('ti_nm', name);
  pb.add('ti_ca', category);
  pb.add('ti_pr', price);
  pb.add('ti_qu', quantity);
  pb.add('ti_cu', currency);

  return pb;
}

/**
 * A Screen View Event
 * Similar to a Page View but less focused on typical web properties
 * Often used for mobile applications as the user is presented with
 * new views as they performance navigation events
 */
export interface ScreenViewEvent {
  /** The name of the screen */
  name?: string;
  /** The identifier of the screen */
  id?: string;
}

/**
 * Build a Scren View Event
 * Similar to a Page View but less focused on typical web properties
 * Often used for mobile applications as the user is presented with
 * new views as they performance navigation events
 *
 * @param event - Contains the properties for the Screen View event. One or more properties must be included.
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildScreenView(event: ScreenViewEvent): PayloadBuilder {
  const { name, id } = event;
  return buildSelfDescribingEvent({
    event: {
      schema: 'iglu:com.snowplowanalytics.snowplow/screen_view/jsonschema/1-0-0',
      data: removeEmptyProperties({ name, id }),
    },
  });
}

/**
 * A Link Click Event
 * Used when a user clicks on a link on a webpage, typically an anchor tag `<a>`
 */
export interface LinkClickEvent {
  /** The target URL of the link */
  targetUrl: string;
  /** The ID of the element clicked if present */
  elementId?: string;
  /** An array of class names from the element clicked */
  elementClasses?: Array<string>;
  /** The target value of the element if present */
  elementTarget?: string;
  /** The content of the element if present and enabled */
  elementContent?: string;
}

/**
 * Build a Link Click Event
 * Used when a user clicks on a link on a webpage, typically an anchor tag `<a>`
 *
 * @param event - Contains the properties for the Link Click event
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildLinkClick(event: LinkClickEvent): PayloadBuilder {
  const { targetUrl, elementId, elementClasses, elementTarget, elementContent } = event;
  const eventJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
    data: removeEmptyProperties({ targetUrl, elementId, elementClasses, elementTarget, elementContent }),
  };

  return buildSelfDescribingEvent({ event: eventJson });
}

/**
 * An Ad Impression Event
 * Used to track an advertisement impression
 *
 * @remarks
 * If you provide the cost field, you must also provide one of 'cpa', 'cpc', and 'cpm' for the costModel field.
 */
export interface AdImpressionEvent {
  /** Identifier for the particular impression instance */
  impressionId?: string;
  /** The cost model for the campaign */
  costModel?: 'cpa' | 'cpc' | 'cpm';
  /** Advertisement cost */
  cost?: number;
  /** The destination URL of the advertisement */
  targetUrl?: string;
  /** Identifier for the ad banner being displayed */
  bannerId?: string;
  /** Identifier for the zone where the ad banner is located */
  zoneId?: string;
  /** Identifier for the advertiser which the campaign belongs to */
  advertiserId?: string;
  /** Identifier for the advertiser which the campaign belongs to */
  campaignId?: string;
}

/**
 * Build a Ad Impression Event
 * Used to track an advertisement impression
 *
 * @remarks
 * If you provide the cost field, you must also provide one of 'cpa', 'cpc', and 'cpm' for the costModel field.
 *
 * @param event - Contains the properties for the Ad Impression event
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildAdImpression(event: AdImpressionEvent): PayloadBuilder {
  const { impressionId, costModel, cost, targetUrl, bannerId, zoneId, advertiserId, campaignId } = event;
  const eventJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
    data: removeEmptyProperties({
      impressionId,
      costModel,
      cost,
      targetUrl,
      bannerId,
      zoneId,
      advertiserId,
      campaignId,
    }),
  };

  return buildSelfDescribingEvent({ event: eventJson });
}

/**
 * An Ad Click Event
 * Used to track an advertisement click
 *
 * @remarks
 * If you provide the cost field, you must also provide one of 'cpa', 'cpc', and 'cpm' for the costModel field.
 */
export interface AdClickEvent {
  /** The destination URL of the advertisement */
  targetUrl: string;
  /**	Identifier for the particular click instance */
  clickId?: string;
  /** The cost model for the campaign */
  costModel?: 'cpa' | 'cpc' | 'cpm';
  /** Advertisement cost */
  cost?: number;
  /** Identifier for the ad banner being displayed */
  bannerId?: string;
  /** Identifier for the zone where the ad banner is located */
  zoneId?: string;
  /** Identifier for the particular impression instance */
  impressionId?: string;
  /** Identifier for the advertiser which the campaign belongs to */
  advertiserId?: string;
  /** Identifier for the advertiser which the campaign belongs to */
  campaignId?: string;
}

/**
 * Build a Ad Click Event
 * Used to track an advertisement click
 *
 * @remarks
 * If you provide the cost field, you must also provide one of 'cpa', 'cpc', and 'cpm' for the costModel field.
 *
 * @param event - Contains the properties for the Ad Click event
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildAdClick(event: AdClickEvent): PayloadBuilder {
  const { targetUrl, clickId, costModel, cost, bannerId, zoneId, impressionId, advertiserId, campaignId } = event;
  const eventJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/ad_click/jsonschema/1-0-0',
    data: removeEmptyProperties({
      targetUrl,
      clickId,
      costModel,
      cost,
      bannerId,
      zoneId,
      impressionId,
      advertiserId,
      campaignId,
    }),
  };

  return buildSelfDescribingEvent({ event: eventJson });
}

/**
 * An Ad Conversion Event
 * Used to track an advertisement click
 *
 * @remarks
 * If you provide the cost field, you must also provide one of 'cpa', 'cpc', and 'cpm' for the costModel field.
 */
export interface AdConversionEvent {
  /** Identifier for the particular conversion instance */
  conversionId?: string;
  /** The cost model for the campaign */
  costModel?: 'cpa' | 'cpc' | 'cpm';
  /** Advertisement cost */
  cost?: number;
  /**	Conversion category */
  category?: string;
  /** The type of user interaction e.g. 'purchase' */
  action?: string;
  /** Describes the object of the conversion */
  property?: string;
  /** How much the conversion is initially worth */
  initialValue?: number;
  /** Identifier for the advertiser which the campaign belongs to */
  advertiserId?: string;
  /** Identifier for the advertiser which the campaign belongs to */
  campaignId?: string;
}

/**
 * Build a Ad Conversion Event
 * Used to track an advertisement click
 *
 * @remarks
 * If you provide the cost field, you must also provide one of 'cpa', 'cpc', and 'cpm' for the costModel field.
 *
 * @param event - Contains the properties for the Ad Conversion event
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildAdConversion(event: AdConversionEvent): PayloadBuilder {
  const { conversionId, costModel, cost, category, action, property, initialValue, advertiserId, campaignId } = event;
  const eventJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/ad_conversion/jsonschema/1-0-0',
    data: removeEmptyProperties({
      conversionId,
      costModel,
      cost,
      category,
      action,
      property,
      initialValue,
      advertiserId,
      campaignId,
    }),
  };

  return buildSelfDescribingEvent({ event: eventJson });
}

/**
 * A Social Interaction Event
 * Social tracking will be used to track the way users interact
 * with Facebook, Twitter and Google + widgets
 * e.g. to capture “like this” or “tweet this” events.
 */
export interface SocialInteractionEvent {
  /** Social action performed */
  action: string;
  /** Social network */
  network: string;
  /** Object social action is performed on */
  target?: string;
}

/**
 * Build a Social Interaction Event
 * Social tracking will be used to track the way users interact
 * with Facebook, Twitter and Google + widgets
 * e.g. to capture “like this” or “tweet this” events.
 *
 * @param event - Contains the properties for the Social Interaction event
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildSocialInteraction(event: SocialInteractionEvent): PayloadBuilder {
  const { action, network, target } = event;
  const eventJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/social_interaction/jsonschema/1-0-0',
    data: removeEmptyProperties({ action, network, target }),
  };

  return buildSelfDescribingEvent({ event: eventJson });
}

/**
 * An Add To Cart Event
 * For tracking users adding items from a cart
 * on an ecommerce site.
 */
export interface AddToCartEvent {
  /** A Product Stock Keeping Unit (SKU) */
  sku: string;
  /** The number added to the cart */
  quantity: number;
  /** The name of the product */
  name?: string;
  /** The category of the product */
  category?: string;
  /** The price of the product */
  unitPrice?: number;
  /** The currency of the product */
  currency?: string;
}

/**
 * Build a Add To Cart Event
 * For tracking users adding items from a cart
 * on an ecommerce site.
 *
 * @param event - Contains the properties for the Add To Cart event
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildAddToCart(event: AddToCartEvent): PayloadBuilder {
  const { sku, quantity, name, category, unitPrice, currency } = event;
  return buildSelfDescribingEvent({
    event: {
      schema: 'iglu:com.snowplowanalytics.snowplow/add_to_cart/jsonschema/1-0-0',
      data: removeEmptyProperties({
        sku,
        quantity,
        name,
        category,
        unitPrice,
        currency,
      }),
    },
  });
}

/**
 * An Remove To Cart Event
 * For tracking users removing items from a cart
 * on an ecommerce site.
 */
export interface RemoveFromCartEvent {
  /** A Product Stock Keeping Unit (SKU) */
  sku: string;
  /** The number removed from the cart */
  quantity: number;
  /** The name of the product */
  name?: string;
  /** The category of the product */
  category?: string;
  /** The price of the product */
  unitPrice?: number;
  /** The currency of the product */
  currency?: string;
}

/**
 * Build a Remove From Cart Event
 * For tracking users removing items from a cart
 * on an ecommerce site.
 *
 * @param event - Contains the properties for the Remove From Cart event
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildRemoveFromCart(event: RemoveFromCartEvent): PayloadBuilder {
  const { sku, quantity, name, category, unitPrice, currency } = event;
  return buildSelfDescribingEvent({
    event: {
      schema: 'iglu:com.snowplowanalytics.snowplow/remove_from_cart/jsonschema/1-0-0',
      data: removeEmptyProperties({
        sku,
        quantity,
        name,
        category,
        unitPrice,
        currency,
      }),
    },
  });
}

/**
 * Represents either a Form Focus or Form Change event
 * When a user focuses on a form element or when a user makes a
 * change to a form element.
 */
export interface FormFocusOrChangeEvent {
  /** The schema which will be used for the event */
  schema: 'change_form' | 'focus_form';
  /** The ID of the form which the element belongs to */
  formId: string;
  /** The element ID which the user is interacting with */
  elementId: string;
  /** The name of the node ("INPUT", "TEXTAREA", "SELECT") */
  nodeName: string;
  /** The value of the element at the time of the event firing */
  value: string | null;
  /** The type of element (e.g. "datetime", "text", "radio", etc.) */
  type?: string | null;
  /** The class names on the element */
  elementClasses?: Array<string> | null;
}

/**
 * Build a Form Focus or Change Form Event based on schema property
 * When a user focuses on a form element or when a user makes a
 * change to a form element.
 *
 * @param event - Contains the properties for the Form Focus or Change Form event
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildFormFocusOrChange(event: FormFocusOrChangeEvent): PayloadBuilder {
  let event_schema = '';
  const { schema, formId, elementId, nodeName, elementClasses, value, type } = event;
  const event_data: Record<string, unknown> = { formId, elementId, nodeName, elementClasses, value };
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

/**
 * A representation of an element within a form
 */
export type FormElement = {
  /** The name of the element */
  name: string;
  /** The current value of the element */
  value: string | null;
  /** The name of the node ("INPUT", "TEXTAREA", "SELECT") */
  nodeName: string;
  /** The type of element (e.g. "datetime", "text", "radio", etc.) */
  type?: string | null;
};

/**
 * A Form Submission Event
 * Used to track when a user submits a form
 */
export interface FormSubmissionEvent {
  /** The ID of the form */
  formId: string;
  /** The class names on the form */
  formClasses?: Array<string>;
  /** The elements contained within the form */
  elements?: Array<FormElement>;
}

/**
 * Build a Form Submission Event
 * Used to track when a user submits a form
 *
 * @param event - Contains the properties for the Form Submission event
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildFormSubmission(event: FormSubmissionEvent): PayloadBuilder {
  const { formId, formClasses, elements } = event;
  return buildSelfDescribingEvent({
    event: {
      schema: 'iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0',
      data: removeEmptyProperties({ formId, formClasses, elements }),
    },
  });
}

/**
 * A Site Search Event
 * Used when a user performs a search action on a page
 */
export interface SiteSearchEvent {
  /** The terms of the search */
  terms: Array<string>;
  /** Any filters which have been applied to the search */
  filters?: Record<string, string | boolean>;
  /** The total number of results for this search */
  totalResults?: number;
  /** The number of visible results on the page */
  pageResults?: number;
}

/**
 * Build a Site Search Event
 * Used when a user performs a search action on a page
 *
 * @param event - Contains the properties for the Site Search event
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildSiteSearch(event: SiteSearchEvent): PayloadBuilder {
  const { terms, filters, totalResults, pageResults } = event;
  return buildSelfDescribingEvent({
    event: {
      schema: 'iglu:com.snowplowanalytics.snowplow/site_search/jsonschema/1-0-0',
      data: removeEmptyProperties({ terms, filters, totalResults, pageResults }),
    },
  });
}

/**
 * A Consent Withdrawn Event
 * Used for tracking when a user withdraws their consent
 */
export interface ConsentWithdrawnEvent {
  /** Specifies whether all consent should be withdrawn */
  all: boolean;
  /** Identifier for the document withdrawing consent */
  id?: string;
  /** Version of the document withdrawing consent */
  version?: string;
  /** Name of the document withdrawing consent */
  name?: string;
  /** Description of the document withdrawing consent */
  description?: string;
}

/**
 * Interface for returning a built event (PayloadBuilder) and context (Array of SelfDescribingJson).
 */
export interface EventPayloadAndContext {
  /** Tracker payload for the event data */
  event: PayloadBuilder;
  /** List of context entities to track along with the event */
  context: Array<SelfDescribingJson>;
}

/**
 * Build a Consent Withdrawn Event
 * Used for tracking when a user withdraws their consent
 *
 * @param event - Contains the properties for the Consent Withdrawn event
 * @returns An object containing the PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track} and a 'consent_document' context
 */
export function buildConsentWithdrawn(event: ConsentWithdrawnEvent): EventPayloadAndContext {
  const { all, id, version, name, description } = event;
  const documentJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
    data: removeEmptyProperties({ id, version, name, description }),
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

/**
 * A Consent Granted Event
 * Used for tracking when a user grants their consent
 */
export interface ConsentGrantedEvent {
  /** Identifier for the document granting consent */
  id: string;
  /** Version of the document granting consent */
  version: string;
  /** Name of the document granting consent */
  name?: string;
  /** Description of the document granting consent */
  description?: string;
  /** When the consent expires */
  expiry?: string;
}

/**
 * Build a Consent Granted Event
 * Used for tracking when a user grants their consent
 *
 * @param event - Contains the properties for the Consent Granted event
 * @returns An object containing the PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track} and a 'consent_document' context
 */
export function buildConsentGranted(event: ConsentGrantedEvent): EventPayloadAndContext {
  const { expiry, id, version, name, description } = event;
  const documentJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
    data: removeEmptyProperties({ id, version, name, description }),
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
 * @param event - JSON object to clean
 * @param exemptFields - Set of fields which should not be removed even if empty
 * @returns A cleaned copy of eventJson
 */
export function removeEmptyProperties(
  event: Record<string, unknown>,
  exemptFields: Record<string, boolean> = {}
): Record<string, unknown> {
  const ret: Record<string, unknown> = {};
  for (const k in event) {
    if (exemptFields[k] || (event[k] !== null && typeof event[k] !== 'undefined')) {
      ret[k] = event[k];
    }
  }
  return ret;
}
