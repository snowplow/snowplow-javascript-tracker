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

import { PayloadData, PayloadDictionary, PayloadBuilder, isJson } from './payload';
import { GlobalContexts, ConditionalContextProvider, ContextPrimitive } from './contexts';

/**
 * Interface common for any Self-Describing JSON such as custom context or
 * Self-describing (ex-unstuctured) event
 */
export interface SelfDescribingJson extends Record<string, unknown> {
	schema: string
	data: Record<string, unknown>
}

/**
 * Algebraic datatype representing possible timestamp type choice
 */
export type Timestamp = TrueTimestamp | DeviceTimestamp | number;
export interface TrueTimestamp { readonly type: 'ttm'; readonly value: number }
export interface DeviceTimestamp { readonly type: 'dtm'; readonly value: number }

/**
 * Pair of timestamp type ready to be included to payload
 */
type TimestampPayload = TrueTimestamp | DeviceTimestamp

/**
 * Transform optional/old-behavior number timestamp into
 * `TrackerTimestamp` ADT
 *
 * @param tstamp optional number or timestamp object
 * @returns correct timestamp object
 */
function getTimestamp(tstamp?: Timestamp): TimestampPayload {
	if (tstamp == null) {
		return { type: 'dtm', value: new Date().getTime() }
	} else if (typeof tstamp === 'number') {
		return { type: 'dtm', value: tstamp }
	} else if (tstamp.type === 'ttm') {		// We can return tstamp here, but this is safer fallback
		return { type: 'ttm', value: tstamp.value }
	} else {
		return { type: 'dtm', value: (tstamp.value || new Date().getTime()) }
	}
}

/**
 * Create a tracker core object
 *
 * @param base64 Whether to base 64 encode contexts and unstructured event JSONs
 * @param callback Function applied to every payload dictionary object
 * @return Tracker core
 */
export class TrackerCore {
	private base64: boolean;
	private callback?: (PayloadData: PayloadData) => void;

	// Dictionary of key-value pairs which get added to every payload, e.g. tracker version
	private payloadPairs: PayloadDictionary = {};
	private globalContexts = new GlobalContexts();

	constructor(base64: boolean, callback?: (PayloadData: PayloadData) => void) {
		// base 64 encoding should default to true
		if (typeof base64 === 'undefined') {
			base64 = true;
		}
		
		this.base64 = base64;
		this.callback = callback;
	}

	/**
	 * Set a persistent key-value pair to be added to every payload
	 *
	 * @param key Field name
	 * @param value Field value
	 */
	addPayloadPair(key: string, value: string): void {
		this.payloadPairs[key] = value;
	}

	/**
	 * Turn base 64 encoding on or off
	 *
	 * @param encode Whether to encode payload
	 */
	setBase64Encoding(encode: boolean): void {
		this.base64 = encode;
	}

	/**
	 * Merges a dictionary into payloadPairs
	 *
	 * @param dict Dictionary to add
	 */
	addPayloadDict(dict: PayloadDictionary): void {
		for (const key in dict) {
			if (Object.prototype.hasOwnProperty.call(dict, key)) {
				this.payloadPairs[key] = dict[key];
			}
		}
	}

	/**
	 * Replace payloadPairs with a new dictionary
	 *
	 * @param dict object New dictionary
	 */
	resetPayloadPairs(dict: PayloadDictionary): void {
		this.payloadPairs = isJson(dict) ? dict : {};
	}

	/**
	 * Set the tracker version
	 *
	 * @param version string
	 */
	setTrackerVersion(version: string): void {
		this.addPayloadPair('tv', version);
	}

	/**
	 * Set the tracker namespace
	 *
	 * @param name string
	 */
	setTrackerNamespace(name: string): void {
		this.addPayloadPair('tna', name);
	}

	/**
	 * Set the application ID
	 *
	 * @param appId string
	 */
	setAppId(appId: string): void {
		this.addPayloadPair('aid', appId);
	}

	/**
	 * Set the platform
	 *
	 * @param value string
	 */
	setPlatform(value: string): void {
		this.addPayloadPair('p', value);
	}

	/**
	 * Set the user ID
	 *
	 * @param userId string
	 */
	setUserId(userId: string): void {
		this.addPayloadPair('uid', userId);
	}

	/**
	 * Set the screen resolution
	 *
	 * @param width number
	 * @param height number
	 */
	setScreenResolution(width: string, height: string): void {
		this.addPayloadPair('res', width + 'x' + height);
	}

	/**
	 * Set the viewport dimensions
	 *
	 * @param width number
	 * @param height number
	 */
	setViewport(width: string, height: string): void {
		this.addPayloadPair('vp', width + 'x' + height);
	}

	/**
	 * Set the color depth
	 *
	 * @param depth number
	 */
	setColorDepth(depth: string): void {
		this.addPayloadPair('cd', depth);
	}

	/**
	 * Set the timezone
	 *
	 * @param timezone string
	 */
	setTimezone(timezone: string): void {
		this.addPayloadPair('tz', timezone);
	}

	/**
	 * Set the language
	 *
	 * @param lang string
	 */
	setLang(lang: string): void {
		this.addPayloadPair('lang', lang);
	}

	/**
	 * Set the IP address
	 *
	 * @param ip string
	 */
	setIpAddress(ip: string): void {
		this.addPayloadPair('ip', ip);
	}

	/**
	 * Set the Useragent
	 *
	 * @param useragent string
	 */
	setUseragent(useragent: string): void {
		this.addPayloadPair('ua', useragent);
	}

	/**
	 * Log an self-describing (previously unstruct) event
	 *
	 * @deprecated
	 * @param properties Contains the properties and schema location for the event
	 * @param context Custom contexts relating to the event
	 * @param tstamp TrackerTimestamp of the event
	 * @param function afterTrack A callback function triggered after event is tracked
	 * @return Payload
	 */
	trackUnstructEvent(properties: Record<string, unknown>, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {
		return this.trackSelfDescribingEvent(properties, context, tstamp, afterTrack);
	}

	/**
	 * Log an self-describing (previously unstruct) event
	 *
	 * @param properties Contains the properties and schema location for the event
	 * @param context Custom contexts relating to the event
	 * @param tstamp TrackerTimestamp of the event
	 * @param function afterTrack A callback function triggered after event is tracked
	 * @return Payload
	 */
	trackSelfDescribingEvent(properties: Record<string, unknown>, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {
		const sb = new PayloadBuilder(this.base64);
		const ueJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0',
			data: properties
		};

		sb.add('e', 'ue');
		sb.addJson('ue_px', 'ue_pr', ueJson);

		return this.track(sb, context, tstamp, afterTrack);
	}

	/**
	 * Log the page view / visit
	 *
	 * @param pageUrl Current page URL
	 * @param pageTitle The user-defined page title to attach to this page view
	 * @param referrer URL users came from
	 * @param context Custom contexts relating to the event
	 * @param tstamp TrackerTimestamp of the event
	 * @param function afterTrack A callback function triggered after event is tracked
	 * @return Payload
	 */
	trackPageView(
		pageUrl: string,
		pageTitle: string,
		referrer: string,
		context?: Array<SelfDescribingJson>,
		tstamp?: Timestamp,
		afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {

		const sb = new PayloadBuilder(this.base64);
		sb.add('e', 'pv'); // 'pv' for Page View
		sb.add('url', pageUrl);
		sb.add('page', pageTitle);
		sb.add('refr', referrer);

		return this.track(sb, context, tstamp, afterTrack);
	}
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
	 * @param tstamp TrackerTimestamp of the event
	 * @param function afterTrack A callback function triggered after event is tracked
	 * @return object Payload
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
		afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {

		const sb = new PayloadBuilder(this.base64);
		sb.add('e', 'pp'); // 'pp' for Page Ping
		sb.add('url', pageUrl);
		sb.add('page', pageTitle);
		sb.add('refr', referrer);
		sb.add('pp_mix', minXOffset.toString());
		sb.add('pp_max', maxXOffset.toString());
		sb.add('pp_miy', minYOffset.toString());
		sb.add('pp_may', maxYOffset.toString());

		return this.track(sb, context, tstamp, afterTrack);
	}
	/**
	 * Track a structured event
	 *
	 * @param category The name you supply for the group of objects you want to track
	 * @param action A string that is uniquely paired with each category, and commonly used to define the type of user interaction for the web object
	 * @param label (optional) An optional string to provide additional dimensions to the event data
	 * @param property (optional) Describes the object or the action performed on it, e.g. quantity of item added to basket
	 * @param value (optional) An integer that you can use to provide numerical data about the user event
	 * @param context Custom contexts relating to the event
	 * @param tstamp TrackerTimestamp of the event
	 * @param function afterTrack A callback function triggered after event is tracked
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
		afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {

		const sb = new PayloadBuilder(this.base64);
		sb.add('e', 'se'); // 'se' for Structured Event
		sb.add('se_ca', category);
		sb.add('se_ac', action);
		sb.add('se_la', label);
		sb.add('se_pr', property);
		sb.add('se_va', (value == null ? undefined : value.toString()));

		return this.track(sb, context, tstamp, afterTrack);
	}

	/**
	 * Track an ecommerce transaction
	 *
	 * @param orderId Required. Internal unique order id number for this transaction.
	 * @param affiliation Optional. Partner or store affiliation.
	 * @param totalValue Required. Total amount of the transaction.
	 * @param taxValue Optional. Tax amount of the transaction.
	 * @param shipping Optional. Shipping charge for the transaction.
	 * @param city Optional. City to associate with transaction.
	 * @param state Optional. State to associate with transaction.
	 * @param country Optional. Country to associate with transaction.
	 * @param currency Optional. Currency to associate with this transaction.
	 * @param context Optional. Context relating to the event.
	 * @param tstamp Optional. TrackerTimestamp of the event
	 * @param function afterTrack A callback function triggered after event is tracked
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
		afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {

		const sb = new PayloadBuilder(this.base64);
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

		return this.track(sb, context, tstamp, afterTrack);
	}

	/**
	 * Track an ecommerce transaction item
	 *
	 * @param orderId Required Order ID of the transaction to associate with item.
	 * @param sku Required. Item's SKU code.
	 * @param name Optional. Product name.
	 * @param category Optional. Product category.
	 * @param price Required. Product price.
	 * @param quantity Required. Purchase quantity.
	 * @param currency Optional. Product price currency.
	 * @param context Optional. Context relating to the event.
	 * @param tstamp Optional. TrackerTimestamp of the event
	 * @param function afterTrack A callback function triggered after event is tracked
	 * @return object Payload
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
		afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {

		const sb = new PayloadBuilder(this.base64);
		sb.add('e', 'ti'); // 'tr' for Transaction Item
		sb.add('ti_id', orderId);
		sb.add('ti_sk', sku);
		sb.add('ti_nm', name);
		sb.add('ti_ca', category);
		sb.add('ti_pr', price);
		sb.add('ti_qu', quantity);
		sb.add('ti_cu', currency);

		return this.track(sb, context, tstamp, afterTrack);
	}

	/**
	 * Track a screen view unstructured event
	 *
	 * @param name The name of the screen
	 * @param id The ID of the screen
	 * @param context Optional. Contexts relating to the event
	 * @param tstamp TrackerTimestamp of the event
	 * @param function afterTrack A callback function triggered after event is tracked
	 * @return Payload
	 */
	trackScreenView(
		name: string,
		id: string,
		context?: Array<SelfDescribingJson>,
		tstamp?: Timestamp,
		afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {

		return this.trackSelfDescribingEvent({
			schema: 'iglu:com.snowplowanalytics.snowplow/screen_view/jsonschema/1-0-0',
			data: this.removeEmptyProperties({
				name: name,
				id: id
			})
		}, context, tstamp, afterTrack);
	}

	/**
	 * Log the link or click with the server
	 *
	 * @param targetUrl
	 * @param elementId
	 * @param elementClasses
	 * @param elementTarget
	 * @param elementContent innerHTML of the link
	 * @param context Custom contexts relating to the event
	 * @param tstamp TrackerTimestamp of the event
	 * @param function afterTrack A callback function triggered after event is tracked
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
		afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {

		const eventJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
			data: this.removeEmptyProperties({
				targetUrl: targetUrl,
				elementId: elementId,
				elementClasses: elementClasses,
				elementTarget: elementTarget,
				elementContent: elementContent
			})
		};

		return this.trackSelfDescribingEvent(eventJson, context, tstamp, afterTrack);
	}

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
	 * @param tstamp TrackerTimestamp of the event
	 * @param function afterTrack A callback function triggered after event is tracked
	 * @return object Payload
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
		afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {

		const eventJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
			data: this.removeEmptyProperties({
				impressionId: impressionId,
				costModel: costModel,
				cost: cost,
				targetUrl: targetUrl,
				bannerId: bannerId,
				zoneId: zoneId,
				advertiserId: advertiserId,
				campaignId: campaignId
			})
		};

		return this.trackSelfDescribingEvent(eventJson, context, tstamp, afterTrack);
	}

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
	 * @param tstamp TrackerTimestamp of the event
	 * @param function afterTrack A callback function triggered after event is tracked
	 * @return object Payload
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
		afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {

		const eventJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/ad_click/jsonschema/1-0-0',
			data: this.removeEmptyProperties({
				targetUrl: targetUrl,
				clickId: clickId,
				costModel: costModel,
				cost: cost,
				bannerId: bannerId,
				zoneId: zoneId,
				impressionId: impressionId,
				advertiserId: advertiserId,
				campaignId: campaignId
			})
		};

		return this.trackSelfDescribingEvent(eventJson, context, tstamp, afterTrack);
	}

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
	 * @param tstamp TrackerTimestamp of the event
	 * @param function afterTrack A callback function triggered after event is tracked
	 * @return object Payload
	 *
	 * @todo make costModel enum
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
		afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {

		const eventJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/ad_conversion/jsonschema/1-0-0',
			data: this.removeEmptyProperties({
				conversionId: conversionId,
				costModel: costModel,
				cost: cost,
				category: category,
				action: action,
				property: property,
				initialValue: initialValue,
				advertiserId: advertiserId,
				campaignId: campaignId
			})
		};

		return this.trackSelfDescribingEvent(eventJson, context, tstamp, afterTrack);
	}

	/**
	 * Track a social event
	 *
	 * @param action Social action performed
	 * @param network Social network
	 * @param target Object of the social action e.g. the video liked, the tweet retweeted
	 * @param context Custom contexts relating to the event
	 * @param tstamp TrackerTimestamp of the event
	 * @param function afterTrack A callback function triggered after event is tracked
	 * @return Payload
	 */
	trackSocialInteraction(
		action: string,
		network: string,
		target: string,
		context?: Array<SelfDescribingJson>,
		tstamp?: Timestamp,
		afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {

		const eventJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/social_interaction/jsonschema/1-0-0',
			data: this.removeEmptyProperties({
				action: action,
				network: network,
				target: target
			})
		};

		return this.trackSelfDescribingEvent(eventJson, context, tstamp, afterTrack);
	}

	/**
	 * Track an add-to-cart event
	 *
	 * @param sku Required. Item's SKU code.
	 * @param name Optional. Product name.
	 * @param category Optional. Product category.
	 * @param unitPrice Optional. Product price.
	 * @param quantity Required. Quantity added.
	 * @param currency Optional. Product price currency.
	 * @param context Optional. Context relating to the event.
	 * @param tstamp Optional. TrackerTimestamp of the event
	 * @param function afterTrack A callback function triggered after event is tracked
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
		afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {
		return this.trackSelfDescribingEvent({
			schema: 'iglu:com.snowplowanalytics.snowplow/add_to_cart/jsonschema/1-0-0',
			data: this.removeEmptyProperties({
				sku: sku,
				name: name,
				category: category,
				unitPrice: unitPrice,
				quantity: quantity,
				currency: currency
			})
		}, context, tstamp, afterTrack);
	}

	/**
	 * Track a remove-from-cart event
	 *
	 * @param sku Required. Item's SKU code.
	 * @param name Optional. Product name.
	 * @param category Optional. Product category.
	 * @param unitPrice Optional. Product price.
	 * @param quantity Required. Quantity removed.
	 * @param currency Optional. Product price currency.
	 * @param context Optional. Context relating to the event.
	 * @param tstamp Optional. TrackerTimestamp of the event
	 * @param function afterTrack A callback function triggered after event is tracked
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
		afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {

		return this.trackSelfDescribingEvent({
			schema: 'iglu:com.snowplowanalytics.snowplow/remove_from_cart/jsonschema/1-0-0',
			data: this.removeEmptyProperties({
				sku: sku,
				name: name,
				category: category,
				unitPrice: unitPrice,
				quantity: quantity,
				currency: currency
			})
		}, context, tstamp, afterTrack);
	}

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
	 * @param context Optional. Context relating to the event.
	 * @param tstamp Optional. TrackerTimestamp of the event
	 * @param function afterTrack A callback function triggered after event is tracked
	 * @return Payload
	 *
	 * @todo make `nodeName` enum
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
		afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {

		let event_schema = '';
		const event_data: PayloadDictionary = {formId, elementId, nodeName, elementClasses, value};
		if (schema === 'change_form'){
			event_schema = 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0';
			event_data.type = type
		} else if (schema === 'focus_form') {
			event_schema = 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0';
			event_data.elementType = type
		}
		return this.trackSelfDescribingEvent({
			schema: event_schema,
			data: this.removeEmptyProperties(event_data, {value: true})
		}, context, tstamp, afterTrack);
	}

	/**
	 * Track a form submission event
	 *
	 * @param formId ID of the form
	 * @param formClasses Classes of the form
	 * @param elements Mutable elements within the form
	 * @param context Optional. Context relating to the event.
	 * @param tstamp Optional. TrackerTimestamp of the event
	 * @param function afterTrack A callback function triggered after event is tracked
	 * @return Payload
	 */
	trackFormSubmission(
		formId: string,
		formClasses: Array<string>,
		elements: Array<Record<string, unknown>>,
		context?: Array<SelfDescribingJson>,
		tstamp?: Timestamp,
		afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {

		return this.trackSelfDescribingEvent({
			schema: 'iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0',
			data: this.removeEmptyProperties({
				formId: formId,
				formClasses: formClasses,
				elements: elements
			})
		}, context, tstamp, afterTrack);
	}

	/**
	 * Track an internal search event
	 *
	 * @param terms Search terms
	 * @param filters Search filters
	 * @param totalResults Number of results
	 * @param pageResults Number of results displayed on page
	 * @param context Optional. Context relating to the event.
	 * @param tstamp Optional. TrackerTimestamp of the event
	 * @return Payload
	 */
	trackSiteSearch(
		terms: Array<string>,
		filters: Record<string, string | boolean>,
		totalResults: number,
		pageResults: number,
		context?: Array<SelfDescribingJson>,
		tstamp?: Timestamp,
		afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {

		return this.trackSelfDescribingEvent({
			schema: 'iglu:com.snowplowanalytics.snowplow/site_search/jsonschema/1-0-0',
			data: this.removeEmptyProperties({
				terms: terms,
				filters: filters,
				totalResults: totalResults,
				pageResults: pageResults
			})
		}, context, tstamp, afterTrack);
	}

	/**
	 * Track a consent withdrawn event
	 *
	 * @param {boolean} all - Indicates user withdraws consent for all documents.
	 * @param {string} [id] - ID number associated with document.
	 * @param {string} [version] - Version number of document.
	 * @param {string} [name] - Name of document.
	 * @param {string} [description] - Description of document.
	 * @param {Array<SelfDescribingJson>} [context] - Context relating to the event.
	 * @param {Timestamp} [tstamp] - TrackerTimestamp of the event.
	 * @param {function} [afterTrack] A callback function triggered after event is tracked
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
		afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {

		const documentJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
			data: this.removeEmptyProperties({
				id: id,
				version: version,
				name: name,
				description: description
			})
		};

		return this.trackSelfDescribingEvent({
			schema: 'iglu:com.snowplowanalytics.snowplow/consent_withdrawn/jsonschema/1-0-0',
			data: this.removeEmptyProperties({
				all: all
			})
		}, documentJson.data && context ? context.concat([documentJson]) : context, tstamp, afterTrack);
	}

	/**
	 * Track a consent granted event
	 *
	 * @param {string} id - ID number associated with document.
	 * @param {string} version - Version number of document.
	 * @param {string} [name] - Name of document.
	 * @param {string} [description] - Description of document.
	 * @param {string} [expiry] - Date-time when consent expires.
	 * @param {Array<SelfDescribingJson>} [context] - Context relating to the event.
	 * @param {Timestamp} [tstamp] - TrackerTimestamp of the event.
	 * @param {function} [afterTrack] A callback function triggered after event is tracked     
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
		afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {

		const documentJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
			data: this.removeEmptyProperties({
				id: id,
				version: version,
				name: name,
				description: description,
			})
		};

		return this.trackSelfDescribingEvent({
			schema: 'iglu:com.snowplowanalytics.snowplow/consent_granted/jsonschema/1-0-0',
			data: this.removeEmptyProperties({
				expiry: expiry,
			})
		}, context ? context.concat([documentJson]) : [documentJson], tstamp, afterTrack);
	}

	/**
	 * Adds contexts globally, contexts added here will be attached to all applicable events
	 * @param contexts An array containing either contexts or a conditional contexts
	 */
	addGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>): void {
		this.globalContexts.addGlobalContexts(contexts);
	}

	/**
	 * Removes all global contexts
	 */
	clearGlobalContexts(): void {
		this.globalContexts.clearGlobalContexts();
	}

	/**
	 * Removes previously added global context, performs a deep comparison of the contexts or conditional contexts
	 * @param contexts An array containing either contexts or a conditional contexts
	 */
	removeGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>): void {
		this.globalContexts.removeGlobalContexts(contexts);
	}

	/**
	 * Returns a copy of a JSON with undefined and null properties removed
	 *
	 * @param eventJson JSON object to clean
	 * @param exemptFields Set of fields which should not be removed even if empty
	 * @return A cleaned copy of eventJson
	 */
	private removeEmptyProperties(eventJson: PayloadDictionary, exemptFields?: { [key: string]: boolean}) {
		const ret: PayloadDictionary = {};
		exemptFields = exemptFields || {};
		for (const k in eventJson) {
			if (exemptFields[k] || (eventJson[k] !== null && typeof eventJson[k] !== 'undefined')) {
				ret[k] = eventJson[k];
			}
		}
		return ret;
	}

	/**
	 * Wraps an array of custom contexts in a self-describing JSON
	 *
	 * @param contexts Array of custom context self-describing JSONs
	 * @return Outer JSON
	 */
	private completeContexts(contexts?: Array<SelfDescribingJson>): Record<string, unknown> | undefined {
		if (contexts && contexts.length) {
			return {
				schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
				data: contexts
			};
		}
		return undefined;
	}

	/**
	 * Adds all global contexts to a contexts array
	 *
	 * @param sb PayloadData
	 * @param contexts Array<SelfDescribingJson>
	 */
	private attachGlobalContexts(sb: PayloadData,
								contexts?: Array<SelfDescribingJson>): Array<SelfDescribingJson> {
		const applicableContexts: Array<SelfDescribingJson> = this.globalContexts.getApplicableContexts(sb);
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
	 * @param sb Payload
	 * @param context Custom contexts relating to the event
	 * @param tstamp TrackerTimestamp of the event
	 * @param function afterTrack A callback function triggered after event is tracked
	 * @return Payload after the callback is applied
	 */
	private track(sb: PayloadData, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData {
		sb.addDict(this.payloadPairs);
		sb.add('eid', v4());
		const timestamp = getTimestamp(tstamp);
		sb.add(timestamp.type, timestamp.value.toString());
		const allContexts = this.attachGlobalContexts(sb, context);
		const wrappedContexts = this.completeContexts(allContexts);
		if (wrappedContexts !== undefined) {
			sb.addJson('cx', 'co', wrappedContexts);
		}

		if (typeof this.callback === 'function') {
			this.callback(sb);
		}

		try {
			afterTrack && afterTrack(sb.build());
		} catch (ex) {
			console.warn('Snowplow: error running custom callback')
		}

		return sb;
	}
}
