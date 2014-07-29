/*
 * JavaScript tracker core for Snowplow: core.js
 * 
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright 
 * 2012-2014 Snowplow Analytics Ltd. All rights reserved. 
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

var payload = require('./payload.js');

function trackerCore(base64) {

	// Dictionary of key-value pairs which get added to every payload, e.g. tracker version
	var state = {};

	/**
	 * Set a persistent key-value pair to be added to every payload
	 *
	 * @param string key Field name
	 * @param string value Field value
	 */
	 function setState(key, value) {
	 	state[key] = value;
	 }

	/**
	 * Replace state with a new dictionary
	 *
	 * @param object newState New dictionary
	 */
	function resetState(newState) {
		state = payload.isJson(newState) ? newState : {};
	}

	function completeContexts(contexts) {
		if (contexts && contexts.length) {
			return {
				schema: 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0',
				data: contexts
			};
		}
	}

	/**
	 * Log an unstructured event
	 *
	 * @param object eventJson Contains the properties and schema location for the event
	 * @param object context Custom context relating to the event
	 */
	function trackUnstructEvent(properties, context) {
		var sb = payload.payloadBuilder(base64);

		var ueJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0',
			data: properties
		};

		sb.addJson('ue_px', 'ue_pr', ueJson);
		sb.addDict(state);

		return sb;
	}

	/**
	 * Track a structured event
	 *
	 * @param string category The name you supply for the group of objects you want to track
	 * @param string action A string that is uniquely paired with each category, and commonly used to define the type of user interaction for the web object
	 * @param string label (optional) An optional string to provide additional dimensions to the event data
	 * @param string property (optional) Describes the object or the action performed on it, e.g. quantity of item added to basket
	 * @param int|float|string value (optional) An integer that you can use to provide numerical data about the user event
	 * @param object Custom context relating to the event
	 */
	function trackStructEvent(category, action, label, property, value, context) {
		var sb = payload.payloadBuilder(base64);
		sb.add('e', 'se'); // 'se' for Structured Event
		sb.add('se_ca', category);
		sb.add('se_ac', action)
		sb.add('se_la', label);
		sb.add('se_pr', property);
		sb.add('se_va', value);
		
		sb.addDict(state);

		return sb;
	}

	/**
	 * Track a screen view unstructured event
	 *
	 * @param string name The name of the screen
	 * @param string id The ID of the screen
	 */
	function trackScreenView(name, id, context) {
		var innerJson = {
			name: name
		};

		if (id) {
			innerJson['id'] = id
		}

		return trackUnstructEvent({
			schema: 'iglu:com.snowplowanalytics.snowplow/screen_view/1-0-0',
			data: innerJson
		});
	}

	/**
	 * Log the page view / visit
	 *
	 * @param string customTitle The user-defined page title to attach to this page view
	 * @param object context Custom context relating to the event
	 */
	function trackPageView(pageUrl, pageTitle, referrer, context) {
		var sb = payload.payloadBuilder(base64);
		sb.add('e', 'pv'); // 'pv' for Page View
		sb.add('url', pageUrl);
		sb.add('page', pageTitle);
		sb.add('refr', referrer);
		sb.addDict(state);
		sb.addJson('cx', 'co', completeContexts(context));

		return sb;
	}

	/**
	 * Log that a user is still viewing a given page
	 * by sending a page ping.
	 *
	 * @param string pageTitle The page title to attach to this page ping
	 * @param object context Custom context relating to the event
	 */
	function trackPagePing(pageUrl, pageTitle, referrer, context) {
		var sb = payload.payloadBuilder(base64);
		sb.add('e', 'pp'); // 'pv' for Page View
		sb.add('url', pageUrl);
		sb.add('page', pageTitle);
		sb.add('refr', referrer);
		sb.addDict(state);

		return sb;
	}

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
	 */
	function trackEcommerceTransaction(orderId, totalValue, affiliation, taxValue, shipping, city, state, country, currency, items, context) {
		var sb = payload.payloadBuilder(base64);
		sb.add('e', 'tr'); // 'tr' for Transaction
		sb.add("tr_id", orderId)
		sb.add("tr_tt", totalValue)
		sb.add("tr_af", affiliation)
		sb.add("tr_tx", taxValue)
		sb.add("tr_sh", shipping)
		sb.add("tr_ci", city)
		sb.add("tr_st", state)
		sb.add("tr_co", country)
		sb.add("tr_cu", currency)
		sb.addDict(state);

		return sb;
	}

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
	 */
	function trackEcommerceTransactionItem(orderId, sku, price, quantity, name, category, currency, context) {
		var sb = payload.payloadBuilder(base64)
		sb.add("e", "ti") // 'tr' for Transaction Item
		sb.add("ti_id", orderId)
		sb.add("ti_sk", sku)
		sb.add("ti_nm", name)
		sb.add("ti_ca", category)
		sb.add("ti_pr", price)
		sb.add("ti_qu", quantity)
		sb.add("ti_cu", currency)

		return sb;
	}


	/**
	 * Log the link or click with the server
	 *
	 * @param string elementId
	 * @param array elementClasses
	 * @param string elementTarget
	 * @param string targetUrl
	 * @param object context Custom context relating to the event
	 */
	function trackLinkClick(targetUrl, elementId, elementClasses, elementTarget, context) {
		var eventJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/link_click/1-0-0',
			data: {
				targetUrl: targetUrl,
				elementId: elementId,
				elementClasses: elementClasses,
				elementTarget: elementTarget
			},
		};

		return trackUnstructEvent(eventJson, context);
	}

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
	 */
	function trackAdImpression(impressionId, costModel, cost, targetUrl, bannerId, zoneId, advertiserId, campaignId, context) {
		var eventJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
			data: {
				impressionId: impressionId,
				costModel: costModel,						
				cost: cost,
				bannerId: bannerId,
				targetUrl: targetUrl,
				zoneId: zoneId,
				advertiserId: advertiserId,
				campaignId: campaignId
			}
		};

		return trackUnstructEvent(eventJson, context);
	}

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
	 */
	function trackAdClick(targetUrl, clickId, costModel, cost, bannerId, zoneId, impressionId, advertiserId, campaignId, context) {
		var eventJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/ad_click/jsonschema/1-0-0',
			data: {
				targetUrl: targetUrl,					
				clickId: clickId,
				costModel: costModel,					
				cost: cost,
				bannerId: bannerId,
				zoneId: zoneId,
				impressionId: impressionId,
				advertiserId: advertiserId,
				campaignId: campaignId
			}
		};

		trackUnstructEvent(eventJson, context);
	}

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
	 */
	function trackAdConversion(conversionId, costModel, cost, category, action, property, initialValue, advertiserId, campaignId, context) {
		var eventJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/ad_conversion/jsonschema/1-0-0',
			data: {
				conversionId: conversionId,
				costModel: costModel,					
				cost: cost,
				category: category,
				action: action,
				property: property,
				initialValue: initialValue,
				advertiserId: advertiserId,
				campaignId: campaignId					
			}
		};

		trackUnstructEvent(eventJson, context);
	}

	return {
		setState: setState,
		resetState: resetState,
		trackUnstructEvent: trackUnstructEvent,
		trackStructEvent: trackStructEvent,
		trackPageView: trackPageView,
		trackPagePing: trackPagePing,
		trackEcommerceTransaction: trackEcommerceTransaction,
		trackEcommerceTransactionItem: trackEcommerceTransactionItem,
		trackAdImpression: trackAdImpression,
		trackAdClick: trackAdClick,
		trackAdConversion: trackAdConversion
	};
}
