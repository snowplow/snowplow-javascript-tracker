/*
 * JavaScript tracker core for Snowplow: core.js
 * 
 * Copyright (c) 2014 Snowplow Analytics Ltd. All rights reserved.
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

var payload = require('./payload.js');
var uuid = require('uuid');

/**
 * Create a tracker core object
 *
 * @param boolean base64 Whether to base 64 encode contexts and unstructured event JSONs
 * @param callback function Function applied to every payload dictionary object
 * @return object Tracker core
 */
function trackerCore(base64, callback) {

	// base 64 encoding should default to true
	if (typeof base64 === 'undefined') {
		base64 = true;
	}

	// Dictionary of key-value pairs which get added to every payload, e.g. tracker version
	var payloadPairs = {};

	/**
	 * Set a persistent key-value pair to be added to every payload
	 *
	 * @param string key Field name
	 * @param string value Field value
	 */
	function addPayloadPair(key, value) {
		payloadPairs[key] = value;
	}

	/**
	 * Returns a copy of a JSON with undefined and null properties removed
	 *
	 * @param object eventJson JSON to clean
	 * @return object A cleaned copy of eventJson
	 */
	function removeEmptyProperties(eventJson) {
		var ret = {};
		for (var k in eventJson) {
			if (eventJson[k] !== null && typeof eventJson[k] !== 'undefined') {
				ret[k] = eventJson[k];
			}
		}
		return ret;
	}

	/**
	 * Wraps an array of custom contexts in a self-describing JSON
	 *
	 * @param array contexts Array of custom context self-describing JSONs
	 * @return object Outer JSON
	 */
	function completeContexts(contexts) {
		if (contexts && contexts.length) {
			return {
				schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
				data: contexts
			};
		}
	}

	/**
	 * Gets called by every trackXXX method
	 * Adds context and payloadPairs name-value pairs to the payload
	 * Applies the callback to the built payload 
	 *
	 * @param sb object Payload
	 * @param array contexts Custom contexts relating to the event
	 * @param number tstamp Timestamp of the event
	 * @return object Payload after the callback is applied
	 */
	function track(sb, context, tstamp) {
		sb.addDict(payloadPairs);
		sb.add('eid', uuid.v4());
		sb.add('dtm', tstamp || new Date().getTime());
		if (context) {
			sb.addJson('cx', 'co', completeContexts(context));			
		}
		
		if (typeof callback === 'function') {
			callback(sb);
		}

		return sb;
	}

	/**
	 * Log an unstructured event
	 *
	 * @param object eventJson Contains the properties and schema location for the event
	 * @param array context Custom contexts relating to the event
	 * @param number tstamp Timestamp of the event	 
	 * @return object Payload
	 */
	function trackUnstructEvent(properties, context, tstamp) {
		var sb = payload.payloadBuilder(base64);
		var ueJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0',
			data: properties
		};

		sb.add('e', 'ue');
		sb.addJson('ue_px', 'ue_pr', ueJson);

		return track(sb, context, tstamp);
	}

	return {

		/**
		 * Turn base 64 encoding on or off
		 *
		 * @param boolean encode key Field name
		 */
		setBase64Encoding: function (encode) {
			base64 = encode;
		},

		addPayloadPair: addPayloadPair,
		
		/**
		 * Merges a dictionary into payloadPairs
		 *
		 * @param object dict Dictionary to add 
		 */
		addPayloadDict: function (dict) {
			for (var key in dict) {
				if (dict.hasOwnProperty(key)) {
					payloadPairs[key] = dict[key];
				}
			}
		},

		/**
		 * Replace payloadPairs with a new dictionary
		 *
		 * @param object dict New dictionary
		 */
		resetPayloadPairs: function (dict) {
			payloadPairs = payload.isJson(dict) ? dict : {};
		},

		/**
		 * Set the tracker version
		 *
		 * @param string version
		 */
		setTrackerVersion: function (version) {
			addPayloadPair('tv', version)
		},

		/**
		 * Set the tracker namespace
		 *
		 * @param string name
		 */
		setTrackerNamespace: function (name) {
			addPayloadPair('tna', name);
		},

		/**
		 * Set the application ID
		 *
		 * @param string appId
		 */
		setAppId: function (appId) {
			addPayloadPair('aid', appId)
		},

		/**
		 * Set the platform
		 *
		 * @param string value
		 */
		setPlatform: function (value) {
			addPayloadPair('p', value);
		},

		/**
		 * Set the user ID
		 *
		 * @param string userId
		 */
		setUserId: function (userId) {
			addPayloadPair('uid', userId);
		},

		/**
		 * Set the screen resolution
		 *
		 * @param number width
		 * @param number height
		 */
		setScreenResolution: function (width, height) {
			addPayloadPair('res', width + 'x' + height);
		},

		/**
		 * Set the viewport dimensions
		 *
		 * @param number width
		 * @param number height
		 */
		setViewport: function (width, height) {
			addPayloadPair('vp', width + 'x' + height);
		},

		/**
		 * Set the color depth
		 *
		 * @param number depth
		 */
		setColorDepth: function (depth) {
			addPayloadPair('cd', depth);
		},

		/**
		 * Set the timezone
		 *
		 * @param string timezone
		 */
		setTimezone: function (timezone) {
			addPayloadPair('tz', timezone);
		},

		/**
		 * Set the language
		 *
		 * @param string lang
		 */
		setLang: function (lang) {
			addPayloadPair('lang', lang);
		},

		/**
		 * Set the IP address
		 *
		 * @param string appId
		 */
		setIpAddress: function (ip) {
			addPayloadPair('ip', ip)
		},

		trackUnstructEvent: trackUnstructEvent,

		/**
		 * Log the page view / visit
		 *
		 * @param string customTitle The user-defined page title to attach to this page view
		 * @param array context Custom contexts relating to the event
		 * @param number tstamp Timestamp of the event
		 * @return object Payload
		 */
		trackPageView: function (pageUrl, pageTitle, referrer, context, tstamp) {
			var sb = payload.payloadBuilder(base64);
			sb.add('e', 'pv'); // 'pv' for Page View
			sb.add('url', pageUrl);
			sb.add('page', pageTitle);
			sb.add('refr', referrer);

			return track(sb, context, tstamp);
		},
		/**
		 * Log that a user is still viewing a given page
		 * by sending a page ping.
		 *
		 * @param string pageTitle The page title to attach to this page ping
		 * @param array context Custom contexts relating to the event
		 * @param number tstamp Timestamp of the event
		 * @return object Payload
		 */
		trackPagePing: function (pageUrl, pageTitle, referrer, context, tstamp) {
			var sb = payload.payloadBuilder(base64);
			sb.add('e', 'pp'); // 'pv' for Page View
			sb.add('url', pageUrl);
			sb.add('page', pageTitle);
			sb.add('refr', referrer);

			return track(sb, context, tstamp);
		},
		/**
		 * Track a structured event
		 *
		 * @param string category The name you supply for the group of objects you want to track
		 * @param string action A string that is uniquely paired with each category, and commonly used to define the type of user interaction for the web object
		 * @param string label (optional) An optional string to provide additional dimensions to the event data
		 * @param string property (optional) Describes the object or the action performed on it, e.g. quantity of item added to basket
		 * @param int|float|string value (optional) An integer that you can use to provide numerical data about the user event
		 * @param array Custom contexts relating to the event
		 * @param number tstamp Timestamp of the event
		 * @return object Payload
		 */
		trackStructEvent: function (category, action, label, property, value, context, tstamp) {
			var sb = payload.payloadBuilder(base64);
			sb.add('e', 'se'); // 'se' for Structured Event
			sb.add('se_ca', category);
			sb.add('se_ac', action);
			sb.add('se_la', label);
			sb.add('se_pr', property);
			sb.add('se_va', value);

			return track(sb, context, tstamp);
		},

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
		 * @param array context Optional. Context relating to the event.
		 * @param number tstamp Optional. Timestamp of the event
		 * @return object Payload
		 */
		trackEcommerceTransaction: function (orderId, affiliation, totalValue, taxValue, shipping, city, state, country, currency, context, tstamp) {
			var sb = payload.payloadBuilder(base64);
			sb.add('e', 'tr'); // 'tr' for Transaction
			sb.add("tr_id", orderId);
			sb.add("tr_af", affiliation);
			sb.add("tr_tt", totalValue);
			sb.add("tr_tx", taxValue);
			sb.add("tr_sh", shipping);
			sb.add("tr_ci", city);
			sb.add("tr_st", state);
			sb.add("tr_co", country);
			sb.add("tr_cu", currency);

			return track(sb, context, tstamp);
		},

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
		 * @param array context Optional. Context relating to the event.
		 * @param number tstamp Optional. Timestamp of the event
		 * @return object Payload
		 */
		trackEcommerceTransactionItem: function (orderId, sku, name, category, price, quantity, currency, context, tstamp) {
			var sb = payload.payloadBuilder(base64)
			sb.add("e", "ti"); // 'tr' for Transaction Item
			sb.add("ti_id", orderId);
			sb.add("ti_sk", sku);
			sb.add("ti_nm", name);
			sb.add("ti_ca", category);
			sb.add("ti_pr", price);
			sb.add("ti_qu", quantity);
			sb.add("ti_cu", currency);

			return track(sb, context, tstamp);
		},

		/**
		 * Track a screen view unstructured event
		 *
		 * @param string name The name of the screen
		 * @param string id The ID of the screen
		 * @param number tstamp Timestamp of the event
		 * @return object Payload
		 */
		trackScreenView: function (name, id, context, tstamp) {
			return trackUnstructEvent({
				schema: 'iglu:com.snowplowanalytics.snowplow/screen_view/jsonschema/1-0-0',
				data: removeEmptyProperties({
					name: name,
					id: id
				})
			}, context, tstamp);
		},

		/**
		 * Log the link or click with the server
		 *
		 * @param string elementId
		 * @param array elementClasses
		 * @param string elementTarget
		 * @param string targetUrl
		 * @param array context Custom contexts relating to the event
		 * @param number tstamp Timestamp of the event
		 * @return object Payload
		 */
		trackLinkClick:  function (targetUrl, elementId, elementClasses, elementTarget, context, tstamp) {
			var eventJson = {
				schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-0',
				data: removeEmptyProperties({
					targetUrl: targetUrl,
					elementId: elementId,
					elementClasses: elementClasses,
					elementTarget: elementTarget
				}),
			};

			return trackUnstructEvent(eventJson, context, tstamp);
		},

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
		 * @param array Custom contexts relating to the event
		 * @param number tstamp Timestamp of the event
		 * @return object Payload
		 */
		trackAdImpression: function(impressionId, costModel, cost, targetUrl, bannerId, zoneId, advertiserId, campaignId, context, tstamp) {
			var eventJson = {
				schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
				data: removeEmptyProperties({
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

			return trackUnstructEvent(eventJson, context, tstamp);
		},

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
		 * @param array Custom contexts relating to the event
		 * @param number tstamp Timestamp of the event
		 * @return object Payload
		 */
		trackAdClick: function (targetUrl, clickId, costModel, cost, bannerId, zoneId, impressionId, advertiserId, campaignId, context, tstamp) {
			var eventJson = {
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
					campaignId: campaignId
				})
			};

			return trackUnstructEvent(eventJson, context, tstamp);
		},

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
		 * @param array Custom contexts relating to the event
		 * @param number tstamp Timestamp of the event
		 * @return object Payload
		 */
		trackAdConversion: function (conversionId, costModel, cost, category, action, property, initialValue, advertiserId, campaignId, context, tstamp) {
			var eventJson = {
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
					campaignId: campaignId					
				})
			};

			return trackUnstructEvent(eventJson, context, tstamp);
		}
	};
}

module.exports = trackerCore;
