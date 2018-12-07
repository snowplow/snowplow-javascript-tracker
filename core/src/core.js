"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uuid = require("uuid");
var payload = require("./payload");
var contexts_1 = require("./contexts");
function getTimestamp(tstamp) {
    if (tstamp == null) {
        return { type: 'dtm', value: new Date().getTime() };
    }
    else if (typeof tstamp === 'number') {
        return { type: 'dtm', value: tstamp };
    }
    else if (tstamp.type === 'ttm') {
        return { type: 'ttm', value: tstamp.value };
    }
    else {
        return { type: 'dtm', value: (tstamp.value || new Date().getTime()) };
    }
}
function trackerCore(base64, callback) {
    if (typeof base64 === 'undefined') {
        base64 = true;
    }
    var payloadPairs = {};
    var contextModule = contexts_1.contextModule();
    function getAllContexts(event) {
        return contextModule.getApplicableContexts(event);
    }
    function addPayloadPair(key, value) {
        payloadPairs[key] = value;
    }
    function removeEmptyProperties(eventJson, exemptFields) {
        var ret = {};
        exemptFields = exemptFields || {};
        for (var k in eventJson) {
            if (exemptFields[k] || (eventJson[k] !== null && typeof eventJson[k] !== 'undefined')) {
                ret[k] = eventJson[k];
            }
        }
        return ret;
    }
    function completeContexts(contexts) {
        if (contexts && contexts.length) {
            return {
                schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
                data: contexts
            };
        }
    }
    function attachGlobalContexts(sb, contexts) {
        var globalContexts = getAllContexts(sb);
        var returnedContexts = [];
        if (contexts && contexts.length) {
            returnedContexts.push.apply(returnedContexts, contexts);
        }
        if (globalContexts && globalContexts.length) {
            returnedContexts.push.apply(returnedContexts, globalContexts);
        }
        return returnedContexts;
    }
    function track(sb, context, tstamp) {
        sb.addDict(payloadPairs);
        sb.add('eid', uuid.v4());
        var timestamp = getTimestamp(tstamp);
        sb.add(timestamp.type, timestamp.value.toString());
        var allContexts = attachGlobalContexts(sb, context);
        var wrappedContexts = completeContexts(allContexts);
        if (wrappedContexts !== undefined) {
            sb.addJson('cx', 'co', wrappedContexts);
        }
        if (typeof callback === 'function') {
            callback(sb);
        }
        return sb;
    }
    function trackSelfDescribingEvent(properties, context, tstamp) {
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
        setBase64Encoding: function (encode) {
            base64 = encode;
        },
        addPayloadPair: addPayloadPair,
        addPayloadDict: function (dict) {
            for (var key in dict) {
                if (dict.hasOwnProperty(key)) {
                    payloadPairs[key] = dict[key];
                }
            }
        },
        resetPayloadPairs: function (dict) {
            payloadPairs = payload.isJson(dict) ? dict : {};
        },
        setTrackerVersion: function (version) {
            addPayloadPair('tv', version);
        },
        setTrackerNamespace: function (name) {
            addPayloadPair('tna', name);
        },
        setAppId: function (appId) {
            addPayloadPair('aid', appId);
        },
        setPlatform: function (value) {
            addPayloadPair('p', value);
        },
        setUserId: function (userId) {
            addPayloadPair('uid', userId);
        },
        setScreenResolution: function (width, height) {
            addPayloadPair('res', width + 'x' + height);
        },
        setViewport: function (width, height) {
            addPayloadPair('vp', width + 'x' + height);
        },
        setColorDepth: function (depth) {
            addPayloadPair('cd', depth);
        },
        setTimezone: function (timezone) {
            addPayloadPair('tz', timezone);
        },
        setLang: function (lang) {
            addPayloadPair('lang', lang);
        },
        setIpAddress: function (ip) {
            addPayloadPair('ip', ip);
        },
        trackUnstructEvent: trackSelfDescribingEvent,
        trackSelfDescribingEvent: trackSelfDescribingEvent,
        trackPageView: function (pageUrl, pageTitle, referrer, context, tstamp) {
            var sb = payload.payloadBuilder(base64);
            sb.add('e', 'pv');
            sb.add('url', pageUrl);
            sb.add('page', pageTitle);
            sb.add('refr', referrer);
            return track(sb, context, tstamp);
        },
        trackPagePing: function (pageUrl, pageTitle, referrer, minXOffset, maxXOffset, minYOffset, maxYOffset, context, tstamp) {
            var sb = payload.payloadBuilder(base64);
            sb.add('e', 'pp');
            sb.add('url', pageUrl);
            sb.add('page', pageTitle);
            sb.add('refr', referrer);
            sb.add('pp_mix', minXOffset.toString());
            sb.add('pp_max', maxXOffset.toString());
            sb.add('pp_miy', minYOffset.toString());
            sb.add('pp_may', maxYOffset.toString());
            return track(sb, context, tstamp);
        },
        trackStructEvent: function (category, action, label, property, value, context, tstamp) {
            var sb = payload.payloadBuilder(base64);
            sb.add('e', 'se');
            sb.add('se_ca', category);
            sb.add('se_ac', action);
            sb.add('se_la', label);
            sb.add('se_pr', property);
            sb.add('se_va', (value == null ? undefined : value.toString()));
            return track(sb, context, tstamp);
        },
        trackEcommerceTransaction: function (orderId, affiliation, totalValue, taxValue, shipping, city, state, country, currency, context, tstamp) {
            var sb = payload.payloadBuilder(base64);
            sb.add('e', 'tr');
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
        trackEcommerceTransactionItem: function (orderId, sku, name, category, price, quantity, currency, context, tstamp) {
            var sb = payload.payloadBuilder(base64);
            sb.add("e", "ti");
            sb.add("ti_id", orderId);
            sb.add("ti_sk", sku);
            sb.add("ti_nm", name);
            sb.add("ti_ca", category);
            sb.add("ti_pr", price);
            sb.add("ti_qu", quantity);
            sb.add("ti_cu", currency);
            return track(sb, context, tstamp);
        },
        trackScreenView: function (name, id, context, tstamp) {
            return trackSelfDescribingEvent({
                schema: 'iglu:com.snowplowanalytics.snowplow/screen_view/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    name: name,
                    id: id
                })
            }, context, tstamp);
        },
        trackLinkClick: function (targetUrl, elementId, elementClasses, elementTarget, elementContent, context, tstamp) {
            var eventJson = {
                schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
                data: removeEmptyProperties({
                    targetUrl: targetUrl,
                    elementId: elementId,
                    elementClasses: elementClasses,
                    elementTarget: elementTarget,
                    elementContent: elementContent
                })
            };
            return trackSelfDescribingEvent(eventJson, context, tstamp);
        },
        trackAdImpression: function (impressionId, costModel, cost, targetUrl, bannerId, zoneId, advertiserId, campaignId, context, tstamp) {
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
            return trackSelfDescribingEvent(eventJson, context, tstamp);
        },
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
            return trackSelfDescribingEvent(eventJson, context, tstamp);
        },
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
            return trackSelfDescribingEvent(eventJson, context, tstamp);
        },
        trackSocialInteraction: function (action, network, target, context, tstamp) {
            var eventJson = {
                schema: 'iglu:com.snowplowanalytics.snowplow/social_interaction/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    action: action,
                    network: network,
                    target: target
                })
            };
            return trackSelfDescribingEvent(eventJson, context, tstamp);
        },
        trackAddToCart: function (sku, name, category, unitPrice, quantity, currency, context, tstamp) {
            return trackSelfDescribingEvent({
                schema: 'iglu:com.snowplowanalytics.snowplow/add_to_cart/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    sku: sku,
                    name: name,
                    category: category,
                    unitPrice: unitPrice,
                    quantity: quantity,
                    currency: currency
                })
            }, context, tstamp);
        },
        trackRemoveFromCart: function (sku, name, category, unitPrice, quantity, currency, context, tstamp) {
            return trackSelfDescribingEvent({
                schema: 'iglu:com.snowplowanalytics.snowplow/remove_from_cart/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    sku: sku,
                    name: name,
                    category: category,
                    unitPrice: unitPrice,
                    quantity: quantity,
                    currency: currency
                })
            }, context, tstamp);
        },
        trackFormFocusOrChange: function (schema, formId, elementId, nodeName, type, elementClasses, value, context, tstamp) {
            var event_schema = '';
            if (schema === 'change_form') {
                event_schema = 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0';
            }
            else if (schema === 'focus_form') {
                event_schema = 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0';
            }
            return trackSelfDescribingEvent({
                schema: event_schema,
                data: removeEmptyProperties({
                    formId: formId,
                    elementId: elementId,
                    nodeName: nodeName,
                    type: type,
                    elementClasses: elementClasses,
                    value: value
                }, { value: true })
            }, context, tstamp);
        },
        trackFormSubmission: function (formId, formClasses, elements, context, tstamp) {
            return trackSelfDescribingEvent({
                schema: 'iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    formId: formId,
                    formClasses: formClasses,
                    elements: elements
                })
            }, context, tstamp);
        },
        trackSiteSearch: function (terms, filters, totalResults, pageResults, context, tstamp) {
            return trackSelfDescribingEvent({
                schema: 'iglu:com.snowplowanalytics.snowplow/site_search/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    terms: terms,
                    filters: filters,
                    totalResults: totalResults,
                    pageResults: pageResults
                })
            }, context, tstamp);
        },
        trackConsentWithdrawn: function (all, id, version, name, description, context, tstamp) {
            var documentJson = {
                schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    id: id,
                    version: version,
                    name: name,
                    description: description
                })
            };
            return trackSelfDescribingEvent({
                schema: 'iglu:com.snowplowanalytics.snowplow/consent_withdrawn/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    all: all
                })
            }, documentJson.data && context ? context.concat([documentJson]) : context, tstamp);
        },
        trackConsentGranted: function (id, version, name, description, expiry, context, tstamp) {
            var documentJson = {
                schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    id: id,
                    version: version,
                    name: name,
                    description: description,
                })
            };
            return trackSelfDescribingEvent({
                schema: 'iglu:com.snowplowanalytics.snowplow/consent_granted/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    expiry: expiry,
                })
            }, context ? context.concat([documentJson]) : [documentJson], tstamp);
        },
        addGlobalContexts: function (contexts) {
            contextModule.addGlobalContexts(contexts);
        },
        clearGlobalContexts: function () {
            contextModule.clearGlobalContexts();
        },
        removeGlobalContexts: function (contexts) {
            contextModule.removeGlobalContexts(contexts);
        }
    };
}
exports.trackerCore = trackerCore;
//# sourceMappingURL=core.js.map