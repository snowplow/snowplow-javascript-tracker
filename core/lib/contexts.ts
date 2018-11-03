import { PayloadData, isNonEmptyJson } from "./payload";
import { SelfDescribingJson } from "./core";
import { base64urldecode } from "./base64";
import isEqual = require('lodash/isEqual');
import has = require('lodash/has');
import get = require('lodash/get');
import isPlainObject = require('lodash/isPlainObject');
import every = require('lodash/every');
import compact = require('lodash/compact');
import map = require('lodash/map');

/**
 * Datatypes (some algebraic) for representing context types
 */
export type ContextGenerator = (payload: SelfDescribingJson, eventType: string, schema: string) => SelfDescribingJson;
export type ContextPrimitive = SelfDescribingJson | ContextGenerator;
export type ContextFilter = (payload: SelfDescribingJson, eventType: string, schema: string) => boolean;
export type FilterContextProvider = [ContextFilter, Array<ContextPrimitive> | ContextPrimitive];
export interface RuleSet {
    accept?: string[] | string;
    reject?: string[] | string;
}
export type PathContextProvider = [RuleSet, Array<ContextPrimitive> | ContextPrimitive];
export type ConditionalContextProvider = FilterContextProvider | PathContextProvider;

export function getSchemaParts(input: string): Array<string> | undefined {
    let re = new RegExp('^iglu:([a-zA-Z0-9-_.]+|\.)\/([a-zA-Z0-9-_]+|\.)\/([a-zA-Z0-9-_]+|\.)\/([0-9]+-[0-9]+-[0-9]+|\.)$');
    let matches = re.exec(input);
    if (matches !== null) {
        return matches.slice(1, 6);
    }
    return undefined;
}

export function isValidMatcher(input: any): boolean {
    let schemaParts = getSchemaParts(input);
    if (schemaParts) {
        return schemaParts.length === 4;
    }
    return false;
}

export function isStringArray(input: any): boolean {
    if (Array.isArray(input)) {
        return input.every(function(i){ return typeof i === 'string' });
    }
    return false;
}

export function isValidRuleSetArg(input: any): boolean{
    if (isStringArray(input)) {
        return input.every((i) => { return isValidMatcher(i) });
    } else if (typeof input === 'string') {
        return isValidMatcher(input);
    }
    return false;
}

export function isSelfDescribingJson(input: any) : boolean {
    if (isNonEmptyJson(input)) {
        if ('schema' in input && 'data' in input) {
            return (typeof(input.schema) === 'string' && typeof(input.data) === 'object');
        }
    }
    return false;
}

export function isEventJson(input: any) : boolean {
    if (isNonEmptyJson(input)) {
        if ('e' in input) {
            return (typeof(input.e) === 'string');
        }
    }
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
    if (typeof(input) === 'function') {
        return input.length === 3;
    }
    return false;
}

export function isContextFilter(input: any) : boolean {
    if (typeof(input) === 'function') {
        return input.length === 3;
    }
    return false;
}

export function isContextPrimitive(input: any) : boolean {
    return (isContextGenerator(input) || isSelfDescribingJson(input));
}

export function isFilterContextProvider(input: any) : boolean {
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

export function isPathContextProvider(input: any) : boolean {
    if (Array.isArray(input) && input.length === 2) {
        if (Array.isArray(input[1])) {
            return isRuleSet(input[0]) && every(input[1], isContextPrimitive);
        }
        return isRuleSet(input[0]) && isContextPrimitive(input[1]);
    }
    return false;
}

export function isConditionalContextProvider(input: any) : boolean {
    return isFilterContextProvider(input) || isPathContextProvider(input);
}

export function matchSchemaAgainstRule(rule: string, schema: string) : boolean {
    let ruleParts = getSchemaParts(rule);
    let schemaParts = getSchemaParts(schema);
    if (ruleParts === undefined || schemaParts === undefined ||
        ruleParts.length !== 4 || schemaParts.length !== 4) {
        return false;
    }
    let matchCount = 0;
    for (let i = 0; i <= 3; i++) {
        if (ruleParts[0] === schemaParts[0] || ruleParts[0] === '.') {
            matchCount++;
        } else {
            return false;
        }
    }
    return matchCount === 4;
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
function getUsefulSchema(sb: SelfDescribingJson): string {
    if (typeof get(sb, 'ue_px.data.schema') === 'string') {
        return get(sb, 'ue_px.data.schema');
    } else if (typeof get(sb, 'ue_pr.data.schema') === 'string') {
        return get(sb, 'ue_pr.data.schema');
    } else if (typeof get(sb, 'schema') === 'string') {
        return get(sb, 'schema');
    }
    return '';
}

function getDecodedEvent(sb: SelfDescribingJson): SelfDescribingJson {
    let decodedEvent = {...sb}; // spread operator, instantiates new object
    if (has(decodedEvent, 'ue_px')) {
        decodedEvent['ue_px'] = JSON.parse(base64urldecode(get(decodedEvent, ['ue_px'])));
    }
    return decodedEvent;
}

function getEventType(sb: {}): string {
    return get(sb, 'e', '');
}

function buildGenerator(generator: ContextGenerator,
                        event: SelfDescribingJson,
                        eventType: string,
                        eventSchema: string) : SelfDescribingJson | Array<SelfDescribingJson> | undefined {
    let contextGeneratorResult : SelfDescribingJson | Array<SelfDescribingJson> | undefined = undefined;
    try {
        // try to evaluate context generator
        contextGeneratorResult = generator(event, eventType, eventSchema);
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

function normalizeToArray(input: any) : Array<any> {
    if (Array.isArray(input)) {
        return input;
    }
    return Array.of(input);
}

function generatePrimitives(contextPrimitives: Array<ContextPrimitive> | ContextPrimitive,
                            event: SelfDescribingJson,
                            eventType: string,
                            eventSchema: string) : Array<SelfDescribingJson> {
    let normalizedInputs : Array<ContextPrimitive> = normalizeToArray(contextPrimitives);
    let partialEvaluate = (primitive) => {
        let result = evaluatePrimitive(primitive, event, eventType, eventSchema);
        if (result && result.length !== 0) {
            return result;
        }
    };
    let generatedContexts = map(normalizedInputs, partialEvaluate);
    return [].concat(...compact(generatedContexts));
}

function evaluatePrimitive(contextPrimitive: ContextPrimitive,
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

function evaluateProvider(provider: ConditionalContextProvider,
                          event: SelfDescribingJson,
                          eventType: string,
                          eventSchema: string): Array<SelfDescribingJson> {
    if (isFilterContextProvider(provider)) {
        let filter : ContextFilter = (provider as FilterContextProvider)[0];
        let filterResult = false;
        try {
            filterResult = filter(event, eventType, eventSchema);
        } catch(error) {
            filterResult = false;
        }
        if (filterResult === true) {
            return generatePrimitives((provider as FilterContextProvider)[1], event, eventType, eventSchema);
        }
    } else if (isPathContextProvider(provider)) {
        if (matchSchemaAgainstRuleSet((provider as PathContextProvider)[0], eventSchema)) {
            return generatePrimitives((provider as PathContextProvider)[1], event, eventType, eventSchema);
        }
    }
    return [];
}

function generateConditionals(providers: Array<ConditionalContextProvider> | ConditionalContextProvider,
                              event: SelfDescribingJson,
                              eventType: string,
                              eventSchema: string) : Array<SelfDescribingJson> {
    let normalizedInput : Array<ConditionalContextProvider> = normalizeToArray(providers);
    let partialEvaluate = (provider) => {
        let result = evaluateProvider(provider, event, eventType, eventSchema);
        if (result && result.length !== 0) {
            return result;
        }
    };
    let generatedContexts = map(normalizedInput, partialEvaluate);
    return [].concat(...compact(generatedContexts));
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

        clearAllContexts: function () {
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
