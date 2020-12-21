import { v4 } from 'uuid';
import isEqual from 'lodash/isEqual';
import has from 'lodash/has';
import get from 'lodash/get';
import every from 'lodash/every';
import compact from 'lodash/compact';
import map from 'lodash/map';
import isPlainObject from 'lodash/isPlainObject';

/*
 * Copyright (c) 2013 Kevin van Zonneveld (http://kvz.io)
 * and Contributors (http://phpjs.org/authors)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
function base64urldecode(data) {
    if (!data) {
        return data;
    }
    const padding = 4 - (data.length % 4);
    switch (padding) {
        case 2:
            data += '==';
            break;
        case 3:
            data += '=';
            break;
    }
    const b64Data = data.replace(/-/g, '+').replace(/_/g, '/');
    return base64decode(b64Data);
}
/**
 * Encode string as base64.
 * Any type can be passed, but will be stringified
 *
 * @param data string to encode
 * @returns base64-encoded string
 */
function base64encode(data) {
    // discuss at: http://phpjs.org/functions/base64_encode/
    // original by: Tyler Akins (http://rumkin.com)
    // improved by: Bayron Guevara
    // improved by: Thunder.m
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Rafał Kukawski (http://kukawski.pl)
    // bugfixed by: Pellentesque Malesuada
    // example 1: base64_encode('Kevin van Zonneveld');
    // returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
    // example 2: base64_encode('a');
    // returns 2: 'YQ=='
    // example 3: base64_encode('✓ à la mode');
    // returns 3: '4pyTIMOgIGxhIG1vZGU='
    const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0;
    const tmp_arr = [];
    if (!data) {
        return data;
    }
    data = unescape(encodeURIComponent(data));
    do {
        // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);
        bits = (o1 << 16) | (o2 << 8) | o3;
        h1 = (bits >> 18) & 0x3f;
        h2 = (bits >> 12) & 0x3f;
        h3 = (bits >> 6) & 0x3f;
        h4 = bits & 0x3f;
        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);
    const enc = tmp_arr.join('');
    const r = data.length % 3;
    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
}
function base64decode(encodedData) {
    //  discuss at: http://locutus.io/php/base64_decode/
    // original by: Tyler Akins (http://rumkin.com)
    // improved by: Thunder.m
    // improved by: Kevin van Zonneveld (http://kvz.io)
    // improved by: Kevin van Zonneveld (http://kvz.io)
    //    input by: Aman Gupta
    //    input by: Brett Zamir (http://brett-zamir.me)
    // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
    // bugfixed by: Pellentesque Malesuada
    // bugfixed by: Kevin van Zonneveld (http://kvz.io)
    // improved by: Indigo744
    //   example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==')
    //   returns 1: 'Kevin van Zonneveld'
    //   example 2: base64_decode('YQ==')
    //   returns 2: 'a'
    //   example 3: base64_decode('4pyTIMOgIGxhIG1vZGU=')
    //   returns 3: '✓ à la mode'
    // decodeUTF8string()
    // Internal function to decode properly UTF8 string
    // Adapted from Solution #1 at https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
    const decodeUTF8string = function (str) {
        // Going backwards: from bytestream, to percent-encoding, to original string.
        return decodeURIComponent(str
            .split('')
            .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
            .join(''));
    };
    const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, dec = '';
    const tmpArr = [];
    if (!encodedData) {
        return encodedData;
    }
    encodedData += '';
    do {
        // unpack four hexets into three octets using index points in b64
        h1 = b64.indexOf(encodedData.charAt(i++));
        h2 = b64.indexOf(encodedData.charAt(i++));
        h3 = b64.indexOf(encodedData.charAt(i++));
        h4 = b64.indexOf(encodedData.charAt(i++));
        bits = (h1 << 18) | (h2 << 12) | (h3 << 6) | h4;
        o1 = (bits >> 16) & 0xff;
        o2 = (bits >> 8) & 0xff;
        o3 = bits & 0xff;
        if (h3 === 64) {
            tmpArr[ac++] = String.fromCharCode(o1);
        }
        else if (h4 === 64) {
            tmpArr[ac++] = String.fromCharCode(o1, o2);
        }
        else {
            tmpArr[ac++] = String.fromCharCode(o1, o2, o3);
        }
    } while (i < encodedData.length);
    dec = tmpArr.join('');
    return decodeUTF8string(dec.replace(/\0+$/, ''));
}

/*
 * JavaScript tracker core for Snowplow: payload.ts
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
/**
 * Base64 encode data with URL and Filename Safe Alphabet (base64url)
 *
 * See: http://tools.ietf.org/html/rfc4648#page-7
 */
function base64urlencode(data) {
    if (!data) {
        return data;
    }
    const enc = base64encode(data);
    return enc.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
/**
 * Is property a non-empty JSON?
 */
function isNonEmptyJson(property) {
    if (!isJson(property)) {
        return false;
    }
    for (const key in property) {
        if (Object.prototype.hasOwnProperty.call(property, key)) {
            return true;
        }
    }
    return false;
}
/**
 * Is property a JSON?
 */
function isJson(property) {
    const record = property;
    return (typeof record !== 'undefined' &&
        record !== null &&
        (record.constructor === {}.constructor || record.constructor === [].constructor));
}
/**
 * A helper to build a Snowplow request string from an
 * an optional initial value plus a set of individual
 * name-value pairs, provided using the add method.
 *
 * @param base64Encode Whether or not JSONs should be Base64-URL-safe-encoded
 *
 * @return The request string builder, with add, addRaw and build methods
 */
function payloadBuilder(base64Encode) {
    const dict = {};
    const add = (key, value) => {
        if (value != null && value !== '') {
            // null also checks undefined
            dict[key] = value;
        }
    };
    const addDict = (dict) => {
        for (const key in dict) {
            if (Object.prototype.hasOwnProperty.call(dict, key)) {
                add(key, dict[key]);
            }
        }
    };
    const addJson = (keyIfEncoded, keyIfNotEncoded, json) => {
        if (json && isNonEmptyJson(json)) {
            const str = JSON.stringify(json);
            if (base64Encode) {
                add(keyIfEncoded, base64urlencode(str));
            }
            else {
                add(keyIfNotEncoded, str);
            }
        }
    };
    const build = () => {
        return dict;
    };
    return {
        add,
        addDict,
        addJson,
        build,
    };
}

/*
 * JavaScript tracker core for Snowplow: contexts.ts
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
/**
 * Contains helper functions to aid in the addition and removal of Global Contexts
 */
function globalContexts() {
    let globalPrimitives = [];
    let conditionalProviders = [];
    /**
     * Returns all applicable global contexts for a specified event
     * @param event The event to check for applicable global contexts for
     */
    const assembleAllContexts = (event) => {
        const eventSchema = getUsefulSchema(event);
        const eventType = getEventType(event);
        const contexts = [];
        const generatedPrimitives = generatePrimitives(globalPrimitives, event, eventType, eventSchema);
        contexts.push(...generatedPrimitives);
        const generatedConditionals = generateConditionals(conditionalProviders, event, eventType, eventSchema);
        contexts.push(...generatedConditionals);
        return contexts;
    };
    return {
        getGlobalPrimitives() {
            return globalPrimitives;
        },
        getConditionalProviders() {
            return conditionalProviders;
        },
        addGlobalContexts(contexts) {
            const acceptedConditionalContexts = [];
            const acceptedContextPrimitives = [];
            for (const context of contexts) {
                if (isConditionalContextProvider(context)) {
                    acceptedConditionalContexts.push(context);
                }
                else if (isContextPrimitive(context)) {
                    acceptedContextPrimitives.push(context);
                }
            }
            globalPrimitives = globalPrimitives.concat(acceptedContextPrimitives);
            conditionalProviders = conditionalProviders.concat(acceptedConditionalContexts);
        },
        clearGlobalContexts() {
            conditionalProviders = [];
            globalPrimitives = [];
        },
        removeGlobalContexts(contexts) {
            for (const context of contexts) {
                if (isConditionalContextProvider(context)) {
                    conditionalProviders = conditionalProviders.filter((item) => !isEqual(item, context));
                }
                else if (isContextPrimitive(context)) {
                    globalPrimitives = globalPrimitives.filter((item) => !isEqual(item, context));
                }
            }
        },
        getApplicableContexts(event) {
            const builtEvent = event.build();
            if (isEventJson(builtEvent)) {
                const decodedEvent = getDecodedEvent(builtEvent);
                return assembleAllContexts(decodedEvent);
            }
            else {
                return [];
            }
        },
    };
}
/**
 * Returns an array containing the parts of the specified schema
 * @param input A schema string
 */
function getSchemaParts(input) {
    const re = new RegExp('^iglu:([a-zA-Z0-9-_.]+)/([a-zA-Z0-9-_]+)/jsonschema/([1-9][0-9]*)-(0|[1-9][0-9]*)-(0|[1-9][0-9]*)$');
    const matches = re.exec(input);
    if (matches !== null)
        return matches.slice(1, 6);
    return undefined;
}
/**
 * Validates the vendor section of a schema string contains allowed wildcard values
 * @param parts Array of parts from a schema string
 */
function validateVendorParts(parts) {
    if (parts[0] === '*' || parts[1] === '*') {
        return false; // no wildcard in first or second part
    }
    if (parts.slice(2).length > 0) {
        let asterisk = false;
        for (const part of parts.slice(2)) {
            if (part === '*')
                // mark when we've found a wildcard
                asterisk = true;
            else if (asterisk)
                // invalid if alpha parts come after wildcard
                return false;
        }
        return true;
    }
    else if (parts.length == 2)
        return true;
    return false;
}
/**
 * Validates the vendor part of a schema string is valid for a rule set
 * @param input Vendor part of a schema string
 */
function validateVendor(input) {
    const parts = input.split('.');
    if (parts && parts.length > 1)
        return validateVendorParts(parts);
    return false;
}
/**
 * Returns all the sections of a schema string that are used to match rules in a ruleset
 * @param input A Schema string
 */
function getRuleParts(input) {
    const re = new RegExp('^iglu:((?:(?:[a-zA-Z0-9-_]+|\\*).)+(?:[a-zA-Z0-9-_]+|\\*))/([a-zA-Z0-9-_.]+|\\*)/jsonschema/([1-9][0-9]*|\\*)-(0|[1-9][0-9]*|\\*)-(0|[1-9][0-9]*|\\*)$');
    const matches = re.exec(input);
    if (matches !== null && validateVendor(matches[1]))
        return matches.slice(1, 6);
    return undefined;
}
/**
 * Ensures the rules specified in a schema string of a ruleset are valid
 * @param input A Schema string
 */
function isValidRule(input) {
    const ruleParts = getRuleParts(input);
    if (ruleParts) {
        const vendor = ruleParts[0];
        return ruleParts.length === 5 && validateVendor(vendor);
    }
    return false;
}
function isStringArray(input) {
    return (Array.isArray(input) &&
        input.every((x) => {
            return typeof x === 'string';
        }));
}
function isValidRuleSetArg(input) {
    if (isStringArray(input))
        return input.every((x) => {
            return isValidRule(x);
        });
    else if (typeof input === 'string')
        return isValidRule(input);
    return false;
}
function isSelfDescribingJson(input) {
    const sdj = input;
    if (isNonEmptyJson(sdj))
        if ('schema' in sdj && 'data' in sdj)
            return typeof sdj.schema === 'string' && typeof sdj.data === 'object';
    return false;
}
function isEventJson(input) {
    const payload = input;
    if (isNonEmptyJson(payload) && 'e' in payload)
        return typeof payload.e === 'string';
    return false;
}
function isRuleSet(input) {
    const ruleSet = input;
    let ruleCount = 0;
    if (isPlainObject(input)) {
        if (has(ruleSet, 'accept')) {
            if (isValidRuleSetArg(ruleSet['accept'])) {
                ruleCount += 1;
            }
            else {
                return false;
            }
        }
        if (has(ruleSet, 'reject')) {
            if (isValidRuleSetArg(ruleSet['reject'])) {
                ruleCount += 1;
            }
            else {
                return false;
            }
        }
        // if either 'reject' or 'accept' or both exists,
        // we have a valid ruleset
        return ruleCount > 0 && ruleCount <= 2;
    }
    return false;
}
function isContextGenerator(input) {
    return typeof input === 'function' && input.length <= 1;
}
function isContextFilter(input) {
    return typeof input === 'function' && input.length <= 1;
}
function isContextPrimitive(input) {
    return isContextGenerator(input) || isSelfDescribingJson(input);
}
function isFilterProvider(input) {
    if (Array.isArray(input)) {
        if (input.length === 2) {
            if (Array.isArray(input[1])) {
                return isContextFilter(input[0]) && every(input[1], isContextPrimitive);
            }
            return isContextFilter(input[0]) && isContextPrimitive(input[1]);
        }
    }
    return false;
}
function isRuleSetProvider(input) {
    if (Array.isArray(input) && input.length === 2) {
        if (!isRuleSet(input[0]))
            return false;
        if (Array.isArray(input[1]))
            return every(input[1], isContextPrimitive);
        return isContextPrimitive(input[1]);
    }
    return false;
}
function isConditionalContextProvider(input) {
    return isFilterProvider(input) || isRuleSetProvider(input);
}
function matchSchemaAgainstRuleSet(ruleSet, schema) {
    let rejectCount = 0;
    let acceptCount = 0;
    const acceptRules = get(ruleSet, 'accept');
    if (Array.isArray(acceptRules)) {
        if (ruleSet.accept.some((rule) => matchSchemaAgainstRule(rule, schema))) {
            acceptCount++;
        }
    }
    else if (typeof acceptRules === 'string') {
        if (matchSchemaAgainstRule(acceptRules, schema)) {
            acceptCount++;
        }
    }
    const rejectRules = get(ruleSet, 'reject');
    if (Array.isArray(rejectRules)) {
        if (ruleSet.reject.some((rule) => matchSchemaAgainstRule(rule, schema))) {
            rejectCount++;
        }
    }
    else if (typeof rejectRules === 'string') {
        if (matchSchemaAgainstRule(rejectRules, schema)) {
            rejectCount++;
        }
    }
    if (acceptCount > 0 && rejectCount === 0) {
        return true;
    }
    else if (acceptCount === 0 && rejectCount > 0) {
        return false;
    }
    return false;
}
function matchSchemaAgainstRule(rule, schema) {
    if (!isValidRule(rule))
        return false;
    const ruleParts = getRuleParts(rule);
    const schemaParts = getSchemaParts(schema);
    if (ruleParts && schemaParts) {
        if (!matchVendor(ruleParts[0], schemaParts[0]))
            return false;
        for (let i = 1; i < 5; i++) {
            if (!matchPart(ruleParts[i], schemaParts[i]))
                return false;
        }
        return true; // if it hasn't failed, it passes
    }
    return false;
}
function matchVendor(rule, vendor) {
    // rule and vendor must have same number of elements
    const vendorParts = vendor.split('.');
    const ruleParts = rule.split('.');
    if (vendorParts && ruleParts) {
        if (vendorParts.length !== ruleParts.length)
            return false;
        for (let i = 0; i < ruleParts.length; i++) {
            if (!matchPart(vendorParts[i], ruleParts[i]))
                return false;
        }
        return true;
    }
    return false;
}
function matchPart(rule, schema) {
    // parts should be the string nested between slashes in the URI: /example/
    return (rule && schema && rule === '*') || rule === schema;
}
// Returns the "useful" schema, i.e. what would someone want to use to identify events.
// The idea being that you can determine the event type from 'e', so getting the schema from
// 'ue_px.schema'/'ue_pr.schema' would be redundant - it'll return the unstruct_event schema.
// Instead the schema nested inside the unstruct_event is more useful!
// This doesn't decode ue_px, it works because it's called by code that has already decoded it
function getUsefulSchema(sb) {
    if (typeof get(sb, 'ue_px.data.schema') === 'string')
        return get(sb, 'ue_px.data.schema');
    else if (typeof get(sb, 'ue_pr.data.schema') === 'string')
        return get(sb, 'ue_pr.data.schema');
    else if (typeof get(sb, 'schema') === 'string')
        return get(sb, 'schema');
    return '';
}
function getDecodedEvent(sb) {
    const decodedEvent = { ...sb }; // spread operator, instantiates new object
    try {
        if (has(decodedEvent, 'ue_px')) {
            decodedEvent['ue_px'] = JSON.parse(base64urldecode(get(decodedEvent, ['ue_px'])));
        }
        return decodedEvent;
    }
    catch (e) {
        return decodedEvent;
    }
}
function getEventType(sb) {
    return get(sb, 'e', '');
}
function buildGenerator(generator, event, eventType, eventSchema) {
    let contextGeneratorResult = undefined;
    try {
        // try to evaluate context generator
        const args = {
            event: event,
            eventType: eventType,
            eventSchema: eventSchema,
        };
        contextGeneratorResult = generator(args);
        // determine if the produced result is a valid SDJ
        if (isSelfDescribingJson(contextGeneratorResult)) {
            return contextGeneratorResult;
        }
        else if (Array.isArray(contextGeneratorResult) && every(contextGeneratorResult, isSelfDescribingJson)) {
            return contextGeneratorResult;
        }
        else {
            return undefined;
        }
    }
    catch (error) {
        contextGeneratorResult = undefined;
    }
    return contextGeneratorResult;
}
function normalizeToArray(input) {
    if (Array.isArray(input)) {
        return input;
    }
    return Array.of(input);
}
function generatePrimitives(contextPrimitives, event, eventType, eventSchema) {
    const normalizedInputs = normalizeToArray(contextPrimitives);
    const partialEvaluate = (primitive) => {
        const result = evaluatePrimitive(primitive, event, eventType, eventSchema);
        if (result && result.length !== 0) {
            return result;
        }
        return undefined;
    };
    const generatedContexts = map(normalizedInputs, partialEvaluate);
    return [].concat(...compact(generatedContexts));
}
function evaluatePrimitive(contextPrimitive, event, eventType, eventSchema) {
    if (isSelfDescribingJson(contextPrimitive)) {
        return [contextPrimitive];
    }
    else if (isContextGenerator(contextPrimitive)) {
        const generatorOutput = buildGenerator(contextPrimitive, event, eventType, eventSchema);
        if (isSelfDescribingJson(generatorOutput)) {
            return [generatorOutput];
        }
        else if (Array.isArray(generatorOutput)) {
            return generatorOutput;
        }
    }
    return undefined;
}
function evaluateProvider(provider, event, eventType, eventSchema) {
    if (isFilterProvider(provider)) {
        const filter = provider[0];
        let filterResult = false;
        try {
            const args = {
                event: event,
                eventType: eventType,
                eventSchema: eventSchema,
            };
            filterResult = filter(args);
        }
        catch (error) {
            filterResult = false;
        }
        if (filterResult === true) {
            return generatePrimitives(provider[1], event, eventType, eventSchema);
        }
    }
    else if (isRuleSetProvider(provider)) {
        if (matchSchemaAgainstRuleSet(provider[0], eventSchema)) {
            return generatePrimitives(provider[1], event, eventType, eventSchema);
        }
    }
    return [];
}
function generateConditionals(providers, event, eventType, eventSchema) {
    const normalizedInput = normalizeToArray(providers);
    const partialEvaluate = (provider) => {
        const result = evaluateProvider(provider, event, eventType, eventSchema);
        if (result && result.length !== 0) {
            return result;
        }
        return undefined;
    };
    const generatedContexts = map(normalizedInput, partialEvaluate);
    return [].concat(...compact(generatedContexts));
}

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
/**
 * Transform optional/old-behavior number timestamp into`Timestamp` ADT
 *
 * @param tstamp optional number or timestamp object
 * @returns correct timestamp object
 */
function getTimestamp(tstamp) {
    if (tstamp == null) {
        return { type: 'dtm', value: new Date().getTime() };
    }
    else if (typeof tstamp === 'number') {
        return { type: 'dtm', value: tstamp };
    }
    else if (tstamp.type === 'ttm') {
        // We can return tstamp here, but this is safer fallback
        return { type: 'ttm', value: tstamp.value };
    }
    else {
        return { type: 'dtm', value: tstamp.value || new Date().getTime() };
    }
}
/**
 * Create a tracker core object
 *
 * @param base64 Whether to base 64 encode contexts and self describing event JSONs
 * @param callback Function applied to every payload dictionary object
 * @return Tracker core
 */
function trackerCore(base64, callback) {
    const globalContextsHelper = globalContexts();
    // Dictionary of key-value pairs which get added to every payload, e.g. tracker version
    let payloadPairs = {};
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
    const removeEmptyProperties = (eventJson, exemptFields) => {
        const ret = {};
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
    const completeContexts = (contexts) => {
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
    const attachGlobalContexts = (sb, contexts) => {
        const applicableContexts = globalContextsHelper.getApplicableContexts(sb);
        const returnedContexts = [];
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
    const track = (sb, context, tstamp, afterTrack) => {
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
        }
        catch (ex) {
            console.warn('Snowplow: error running custom callback');
        }
        return sb;
    };
    /**
     * Log a self-describing event
     *
     * @param properties Contains the properties and schema location for the event
     * @param context Custom contexts relating to the event
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    const trackSelfDescribingEvent = (properties, context, tstamp, afterTrack) => {
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
    const addPayloadPair = (key, value) => {
        payloadPairs[key] = value;
    };
    return {
        addPayloadPair,
        setBase64Encoding(encode) {
            base64 = encode;
        },
        addPayloadDict(dict) {
            for (const key in dict) {
                if (Object.prototype.hasOwnProperty.call(dict, key)) {
                    payloadPairs[key] = dict[key];
                }
            }
        },
        resetPayloadPairs(dict) {
            payloadPairs = isJson(dict) ? dict : {};
        },
        setTrackerVersion(version) {
            addPayloadPair('tv', version);
        },
        setTrackerNamespace(name) {
            addPayloadPair('tna', name);
        },
        setAppId(appId) {
            addPayloadPair('aid', appId);
        },
        setPlatform(value) {
            addPayloadPair('p', value);
        },
        setUserId(userId) {
            addPayloadPair('uid', userId);
        },
        setScreenResolution(width, height) {
            addPayloadPair('res', width + 'x' + height);
        },
        setViewport(width, height) {
            addPayloadPair('vp', width + 'x' + height);
        },
        setColorDepth(depth) {
            addPayloadPair('cd', depth);
        },
        setTimezone(timezone) {
            addPayloadPair('tz', timezone);
        },
        setLang(lang) {
            addPayloadPair('lang', lang);
        },
        setIpAddress(ip) {
            addPayloadPair('ip', ip);
        },
        setUseragent(useragent) {
            addPayloadPair('ua', useragent);
        },
        trackSelfDescribingEvent,
        trackPageView(pageUrl, pageTitle, referrer, context, tstamp, afterTrack) {
            const sb = payloadBuilder(base64);
            sb.add('e', 'pv'); // 'pv' for Page View
            sb.add('url', pageUrl);
            sb.add('page', pageTitle);
            sb.add('refr', referrer);
            return track(sb, context, tstamp, afterTrack);
        },
        trackPagePing(pageUrl, pageTitle, referrer, minXOffset, maxXOffset, minYOffset, maxYOffset, context, tstamp, afterTrack) {
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
        trackStructEvent(category, action, label, property, value, context, tstamp, afterTrack) {
            const sb = payloadBuilder(base64);
            sb.add('e', 'se'); // 'se' for Structured Event
            sb.add('se_ca', category);
            sb.add('se_ac', action);
            sb.add('se_la', label);
            sb.add('se_pr', property);
            sb.add('se_va', value == null ? undefined : value.toString());
            return track(sb, context, tstamp, afterTrack);
        },
        trackEcommerceTransaction(orderId, affiliation, totalValue, taxValue, shipping, city, state, country, currency, context, tstamp, afterTrack) {
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
        trackEcommerceTransactionItem(orderId, sku, name, category, price, quantity, currency, context, tstamp, afterTrack) {
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
        trackScreenView(name, id, context, tstamp, afterTrack) {
            return trackSelfDescribingEvent({
                schema: 'iglu:com.snowplowanalytics.snowplow/screen_view/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    name: name,
                    id: id,
                }),
            }, context, tstamp, afterTrack);
        },
        trackLinkClick(targetUrl, elementId, elementClasses, elementTarget, elementContent, context, tstamp, afterTrack) {
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
        trackAdImpression(impressionId, costModel, cost, targetUrl, bannerId, zoneId, advertiserId, campaignId, context, tstamp, afterTrack) {
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
        trackAdClick(targetUrl, clickId, costModel, cost, bannerId, zoneId, impressionId, advertiserId, campaignId, context, tstamp, afterTrack) {
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
        trackAdConversion(conversionId, costModel, cost, category, action, property, initialValue, advertiserId, campaignId, context, tstamp, afterTrack) {
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
        trackSocialInteraction(action, network, target, context, tstamp, afterTrack) {
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
        trackAddToCart(sku, name, category, unitPrice, quantity, currency, context, tstamp, afterTrack) {
            return trackSelfDescribingEvent({
                schema: 'iglu:com.snowplowanalytics.snowplow/add_to_cart/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    sku: sku,
                    name: name,
                    category: category,
                    unitPrice: unitPrice,
                    quantity: quantity,
                    currency: currency,
                }),
            }, context, tstamp, afterTrack);
        },
        trackRemoveFromCart(sku, name, category, unitPrice, quantity, currency, context, tstamp, afterTrack) {
            return trackSelfDescribingEvent({
                schema: 'iglu:com.snowplowanalytics.snowplow/remove_from_cart/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    sku: sku,
                    name: name,
                    category: category,
                    unitPrice: unitPrice,
                    quantity: quantity,
                    currency: currency,
                }),
            }, context, tstamp, afterTrack);
        },
        trackFormFocusOrChange(schema, formId, elementId, nodeName, type, elementClasses, value, context, tstamp, afterTrack) {
            let event_schema = '';
            const event_data = { formId, elementId, nodeName, elementClasses, value };
            if (schema === 'change_form') {
                event_schema = 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0';
                event_data.type = type;
            }
            else if (schema === 'focus_form') {
                event_schema = 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0';
                event_data.elementType = type;
            }
            return trackSelfDescribingEvent({
                schema: event_schema,
                data: removeEmptyProperties(event_data, { value: true }),
            }, context, tstamp, afterTrack);
        },
        trackFormSubmission(formId, formClasses, elements, context, tstamp, afterTrack) {
            return trackSelfDescribingEvent({
                schema: 'iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    formId: formId,
                    formClasses: formClasses,
                    elements: elements,
                }),
            }, context, tstamp, afterTrack);
        },
        trackSiteSearch(terms, filters, totalResults, pageResults, context, tstamp, afterTrack) {
            return trackSelfDescribingEvent({
                schema: 'iglu:com.snowplowanalytics.snowplow/site_search/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    terms: terms,
                    filters: filters,
                    totalResults: totalResults,
                    pageResults: pageResults,
                }),
            }, context, tstamp, afterTrack);
        },
        trackConsentWithdrawn(all, id, version, name, description, context, tstamp, afterTrack) {
            const documentJson = {
                schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    id: id,
                    version: version,
                    name: name,
                    description: description,
                }),
            };
            return trackSelfDescribingEvent({
                schema: 'iglu:com.snowplowanalytics.snowplow/consent_withdrawn/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    all: all,
                }),
            }, documentJson.data && context ? context.concat([documentJson]) : context, tstamp, afterTrack);
        },
        trackConsentGranted(id, version, name, description, expiry, context, tstamp, afterTrack) {
            const documentJson = {
                schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    id: id,
                    version: version,
                    name: name,
                    description: description,
                }),
            };
            return trackSelfDescribingEvent({
                schema: 'iglu:com.snowplowanalytics.snowplow/consent_granted/jsonschema/1-0-0',
                data: removeEmptyProperties({
                    expiry: expiry,
                }),
            }, context ? context.concat([documentJson]) : [documentJson], tstamp, afterTrack);
        },
        addGlobalContexts(contexts) {
            globalContextsHelper.addGlobalContexts(contexts);
        },
        clearGlobalContexts() {
            globalContextsHelper.clearGlobalContexts();
        },
        removeGlobalContexts(contexts) {
            globalContextsHelper.removeGlobalContexts(contexts);
        },
    };
}

export { trackerCore };
//# sourceMappingURL=index.js.map
