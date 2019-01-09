/*
 * JavaScript tracker core for Snowplow: contexts.js
 *
 * Copyright (c) 2014-2018 Snowplow Analytics Ltd. All rights reserved.
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

import { PayloadData, isNonEmptyJson } from "./payload";
import { SelfDescribingJson } from "./core";
import { decode } from "universal-base64url";
import { isEqual, has, get, isPlainObject, every, compact, map } from 'lodash';

/**
 * Datatypes (some algebraic) for representing context types
 */

/**
 * A context generator is a callback that returns a self-describing JSON
 * @param {Object} args - Object that contains: event, eventType, eventSchema
 * @return {SelfDescribingJson} A self-describing JSON
 */
export type ContextGenerator = (args?: Object) => SelfDescribingJson;

/**
 * A context primitive is either a self-describing JSON or a context generator
 */
export type ContextPrimitive = SelfDescribingJson | ContextGenerator;

/**
 * A context filter is a user-supplied callback that is evaluated for each event
 * to determine if the context associated with the filter should be attached to the event
 */
export type ContextFilter = (args?: Object) => boolean;

/**
 * A filter provider is an array that has two parts: a context filter and context primitives
 * If the context filter evaluates to true, the tracker will attach the context primitive(s)
 */
export type FilterProvider = [ContextFilter, Array<ContextPrimitive> | ContextPrimitive];

/**
 * A ruleset has accept or reject properties that contain rules for matching Iglu schema URIs
 */
export interface RuleSet {
    accept?: string[] | string;
    reject?: string[] | string;
}

/**
 * A ruleset provider is an array that has two parts: a ruleset and context primitives
 * If the ruleset allows the current event schema URI, the tracker will attach the context primitive(s)
 */
export type RuleSetProvider = [RuleSet, Array<ContextPrimitive> | ContextPrimitive];

/**
 * Conditional context providers are two element arrays used to decide when to attach contexts, where:
 * - the first element is some conditional criterion
 * - the second element is any number of context primitives
 */
export type ConditionalContextProvider = FilterProvider | RuleSetProvider;

export function getSchemaParts(input: string): Array<string> | undefined {
    let re = new RegExp('^iglu:([a-zA-Z0-9-_\.]+)\/([a-zA-Z0-9-_]+)\/jsonschema\/([1-9][0-9]*)\-(0|[1-9][0-9]*)\-(0|[1-9][0-9]*)$');
    let matches = re.exec(input);
    if (matches !== null)
        return matches.slice(1, 6);
    return undefined;
}

export function validateVendorParts(parts: Array<string>): boolean {
    if (parts[0] === '*' || parts[1] === '*') {
        return false; // no wildcard in first or second part
    }
    if (parts.slice(2).length > 0) {
        let asterisk = false;
        for (let part of parts.slice(2)) {
            if (part === '*') // mark when we've found a wildcard
                asterisk = true;
            else if (asterisk) // invalid if alpha parts come after wildcard
                return false;
        }
        return true;
    } else if (parts.length == 2)
        return true;

    return false;
}

export function validateVendor(input: string): boolean {
    let parts = input.split('.');
    if (parts && parts.length > 1)
        return validateVendorParts(parts);
    return false;
}

export function getRuleParts(input: string): Array<string> | undefined {
    const re = new RegExp('^iglu:((?:(?:[a-zA-Z0-9-_]+|\\*)\.)+(?:[a-zA-Z0-9-_]+|\\*))\/([a-zA-Z0-9-_.]+|\\*)\/jsonschema\/([1-9][0-9]*|\\*)-(0|[1-9][0-9]*|\\*)-(0|[1-9][0-9]*|\\*)$');
    let matches = re.exec(input);
    if (matches !== null && validateVendor(matches[1]))
        return matches.slice(1,6);
    return undefined;
}

export function isValidRule(input: string): boolean {
    let ruleParts = getRuleParts(input);
    if (ruleParts) {
        let vendor = ruleParts[0];
        return ruleParts.length === 5 && validateVendor(vendor);
    }
    return false;
}

export function isStringArray(input: any): boolean {
    return Array.isArray(input) && input.every((x) => { return typeof x === 'string' });
}

export function isValidRuleSetArg(input: any): boolean {
    if (isStringArray(input))
        return input.every((x: string) => { return isValidRule(x) });
    else if (typeof input === 'string')
        return isValidRule(input);
    return false;
}

export function isSelfDescribingJson(input: any) : boolean {
    if (isNonEmptyJson(input))
        if ('schema' in input && 'data' in input)
            return (typeof(input.schema) === 'string' && typeof(input.data) === 'object');
    return false;
}

export function isEventJson(input: any) : boolean {
    if (isNonEmptyJson(input) && ('e' in input))
        return (typeof(input.e) === 'string');
    return false;
}

export function isRuleSet(input: any) : boolean {
    let ruleCount = 0;
    if (isPlainObject(input)) {
        if (has(input, 'accept')) {
            if (isValidRuleSetArg(input['accept'])) {
                ruleCount += 1;
            } else {
                return false;
            }
        }
        if (has(input, 'reject')) {
            if (isValidRuleSetArg(input['reject'])) {
                ruleCount += 1;
            } else {
                return false;
            }
        }
        // if either 'reject' or 'accept' or both exists,
        // we have a valid ruleset
        return ruleCount > 0 && ruleCount <= 2;
    }
    return false;
}

export function isContextGenerator(input: any) : boolean {
    return typeof(input) === 'function' && input.length <= 1;
}

export function isContextFilter(input: any) : boolean {
    return typeof(input) === 'function' && input.length <= 1;
}

export function isContextPrimitive(input: any) : boolean {
    return (isContextGenerator(input) || isSelfDescribingJson(input));
}

export function isFilterProvider(input: any) : boolean {
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

export function isRuleSetProvider(input: any) : boolean {
    if (Array.isArray(input) && input.length === 2) {
        if (!isRuleSet(input[0]))
            return false;
        if (Array.isArray(input[1]))
            return every(input[1], isContextPrimitive);
        return isContextPrimitive(input[1]);
    }
    return false;
}

export function isConditionalContextProvider(input: any) : boolean {
    return isFilterProvider(input) || isRuleSetProvider(input);
}

export function matchSchemaAgainstRule(rule: string, schema: string) : boolean {
    if (!isValidRule(rule))
        return false;
    let ruleParts = getRuleParts(rule);
    let schemaParts = getSchemaParts(schema);
    if (ruleParts && schemaParts) {
        if (!matchVendor(ruleParts[0], schemaParts[0]))
            return false;
        for (let i=1; i<5; i++) {
            if (!matchPart(ruleParts[i], schemaParts[i]))
                return false;
        }
        return true; // if it hasn't failed, it passes
    }
    return false;
}

export function matchVendor(rule: string, vendor: string): boolean {
    // rule and vendor must have same number of elements
    let vendorParts = vendor.split('.');
    let ruleParts = rule.split('.');
    if (vendorParts && ruleParts) {
        if (vendorParts.length !== ruleParts.length)
            return false;
        for (let i=0; i<ruleParts.length; i++) {
            if (!matchPart(vendorParts[i], ruleParts[i]))
                return false;
        }
        return true;
    }
    return false;
}

export function matchPart(rule: string, schema: string): boolean {
    // parts should be the string nested between slashes in the URI: /example/
    return (rule && schema && rule === '*' || rule === schema);
}

export function matchSchemaAgainstRuleSet(ruleSet: RuleSet, schema: string) : boolean {
    let rejectCount = 0;
    let acceptCount = 0;
    let acceptRules = get(ruleSet, 'accept');
    if (Array.isArray(acceptRules)) {
        if ((ruleSet.accept as Array<string>).some((rule) => (matchSchemaAgainstRule(rule, schema)))) {
            acceptCount++;
        }
    } else if (typeof(acceptRules) === 'string') {
        if (matchSchemaAgainstRule(acceptRules, schema)) {
            acceptCount++;
        }
    }

    let rejectRules = get(ruleSet, 'reject');
    if (Array.isArray(rejectRules)) {
        if ((ruleSet.reject as Array<string>).some((rule) => (matchSchemaAgainstRule(rule, schema)))) {
            rejectCount++;
        }
    } else if (typeof(rejectRules) === 'string') {
        if (matchSchemaAgainstRule(rejectRules, schema)) {
            rejectCount++;
        }
    }

    if (acceptCount > 0 && rejectCount === 0) {
        return true;
    } else if (acceptCount === 0 && rejectCount > 0) {
        return false;
    }

    return false;
}

// Returns the "useful" schema, i.e. what would someone want to use to identify events.
// The idea being that you can determine the event type from 'e', so getting the schema from
// 'ue_px.schema'/'ue_pr.schema' would be redundant - it'll return the unstructured event schema.
// Instead the schema nested inside the unstructured event is more useful!
// This doesn't decode ue_px, it works because it's called by code that has already decoded it
export function getUsefulSchema(sb: SelfDescribingJson): string {
    if (typeof get(sb, 'ue_px.data.schema') === 'string')
        return get(sb, 'ue_px.data.schema');
    else if (typeof get(sb, 'ue_pr.data.schema') === 'string')
        return get(sb, 'ue_pr.data.schema');
    else if (typeof get(sb, 'schema') === 'string')
        return get(sb, 'schema');
    return '';
}

export function getDecodedEvent(sb: SelfDescribingJson): SelfDescribingJson {
    let decodedEvent : SelfDescribingJson = {...sb}; // spread operator, instantiates new object
    try {
        if (has(decodedEvent, 'ue_px')) {
          (decodedEvent as any)['ue_px'] = JSON.parse(decode(get(decodedEvent, ['ue_px'])));
        }
    } catch(e) {}
    return decodedEvent;
}

export function getEventType(sb: {}): string {
    return get(sb, 'e', '');
}

export function buildGenerator(generator: ContextGenerator,
                        event: SelfDescribingJson,
                        eventType: string,
                        eventSchema: string) : SelfDescribingJson | Array<SelfDescribingJson> | undefined {
    let contextGeneratorResult : SelfDescribingJson | Array<SelfDescribingJson> | undefined = undefined;
    try {
        // try to evaluate context generator
        let args = {
            event: event,
            eventType: eventType,
            eventSchema: eventSchema
        };
        contextGeneratorResult = generator(args);
        // determine if the produced result is a valid SDJ
        if (isSelfDescribingJson(contextGeneratorResult)) {
            return contextGeneratorResult;
        } else if (Array.isArray(contextGeneratorResult) && every(contextGeneratorResult, isSelfDescribingJson)) {
            return contextGeneratorResult;
        } else {
            return undefined;
        }
    } catch (error) {
        contextGeneratorResult = undefined;
    }
    return contextGeneratorResult;
}

export function normalizeToArray(input: any) : Array<any> {
    if (Array.isArray(input)) {
        return input;
    }
    return [input];
}

export function generatePrimitives(contextPrimitives: Array<ContextPrimitive> | ContextPrimitive,
                            event: SelfDescribingJson,
                            eventType: string,
                            eventSchema: string) : Array<SelfDescribingJson> {
    let normalizedInputs : Array<ContextPrimitive> = normalizeToArray(contextPrimitives);
    let partialEvaluate = (primitive: ContextPrimitive) => {
        let result = evaluatePrimitive(primitive, event, eventType, eventSchema);
        if (result && result.length !== 0) {
            return result;
        }
    };
    let generatedContexts = map(normalizedInputs, partialEvaluate);
    return ([] as SelfDescribingJson[]).concat(...compact(generatedContexts));
}

export function evaluatePrimitive(contextPrimitive: ContextPrimitive,
                           event: SelfDescribingJson,
                           eventType: string,
                           eventSchema: string) : Array<SelfDescribingJson> | undefined {
    if (isSelfDescribingJson(contextPrimitive)) {
        return [contextPrimitive as SelfDescribingJson];
    } else if (isContextGenerator(contextPrimitive)) {
        let generatorOutput = buildGenerator(contextPrimitive as ContextGenerator, event, eventType, eventSchema);
        if (isSelfDescribingJson(generatorOutput)) {
            return [generatorOutput as SelfDescribingJson];
        } else if (Array.isArray(generatorOutput)) {
            return generatorOutput;
        }
    }
    return undefined;
}

export function evaluateProvider(provider: ConditionalContextProvider,
                          event: SelfDescribingJson,
                          eventType: string,
                          eventSchema: string): Array<SelfDescribingJson> {
    if (isFilterProvider(provider)) {
        let filter : ContextFilter = (provider as FilterProvider)[0];
        let filterResult = false;
        try {
            let args = {
                event: event,
                eventType: eventType,
                eventSchema: eventSchema
            };
            filterResult = filter(args);
        } catch(error) {
            filterResult = false;
        }
        if (filterResult === true) {
            return generatePrimitives((provider as FilterProvider)[1], event, eventType, eventSchema);
        }
    } else if (isRuleSetProvider(provider)) {
        if (matchSchemaAgainstRuleSet((provider as RuleSetProvider)[0], eventSchema)) {
            return generatePrimitives((provider as RuleSetProvider)[1], event, eventType, eventSchema);
        }
    }
    return [];
}

export function generateConditionals(providers: Array<ConditionalContextProvider> | ConditionalContextProvider,
                              event: SelfDescribingJson,
                              eventType: string,
                              eventSchema: string) : Array<SelfDescribingJson> {
    let normalizedInput : Array<ConditionalContextProvider> = normalizeToArray(providers);
    let partialEvaluate = (provider: ConditionalContextProvider) => {
        let result = evaluateProvider(provider, event, eventType, eventSchema);
        if (result && result.length !== 0) {
            return result;
        }
    };
    let generatedContexts = map(normalizedInput, partialEvaluate);
    return ([] as SelfDescribingJson[]).concat(...compact(generatedContexts));
}

export function contextModule() {
    let globalPrimitives : Array<ContextPrimitive> = [];
    let conditionalProviders : Array<ConditionalContextProvider> = [];

    function assembleAllContexts(event: SelfDescribingJson) : Array<SelfDescribingJson> {
        let eventSchema = getUsefulSchema(event);
        let eventType = getEventType(event);
        let contexts : Array<SelfDescribingJson> = [];
        let generatedPrimitives = generatePrimitives(globalPrimitives, event, eventType, eventSchema);
        contexts.push(...generatedPrimitives);

        let generatedConditionals = generateConditionals(conditionalProviders, event, eventType, eventSchema);
        contexts.push(...generatedConditionals);

        return contexts;
    }

    return {
        getGlobalPrimitives: function () {
            return globalPrimitives;
        },

        getConditionalProviders: function () {
            return conditionalProviders;
        },

        addGlobalContexts: function (contexts: Array<any>) {
            let acceptedConditionalContexts : ConditionalContextProvider[] = [];
            let acceptedContextPrimitives : ContextPrimitive[] = [];
            for (let context of contexts) {
                if (isConditionalContextProvider(context)) {
                    acceptedConditionalContexts.push(context);
                } else if (isContextPrimitive(context)) {
                    acceptedContextPrimitives.push(context);
                }
            }
            globalPrimitives = globalPrimitives.concat(acceptedContextPrimitives);
            conditionalProviders = conditionalProviders.concat(acceptedConditionalContexts);
        },

        clearGlobalContexts: function () {
            conditionalProviders = [];
            globalPrimitives = [];
        },

        removeGlobalContexts: function (contexts: Array<any>) {
            for (let context of contexts) {
                if (isConditionalContextProvider(context)) {
                    conditionalProviders = conditionalProviders.filter(item => !isEqual(item, context));
                } else if (isContextPrimitive(context)) {
                    globalPrimitives = globalPrimitives.filter(item => !isEqual(item, context));
                } else {
                    // error message here?
                }
            }
        },

        getApplicableContexts: function (event: PayloadData) : Array<SelfDescribingJson> {
            const builtEvent = event.build();
            if (isEventJson(builtEvent)) {
                const decodedEvent = getDecodedEvent(builtEvent as SelfDescribingJson);
                return assembleAllContexts(decodedEvent);
            } else {
                return [];
            }
        }
    };
}
