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

import { PayloadData, PayloadDictionary, isNonEmptyJson } from './payload';
import { SelfDescribingJson } from './core';
import { base64urldecode } from './base64';

// Must import lodash as submodules (https://github.com/rollup/rollup/wiki/Troubleshooting#tree-shaking-doesnt-seem-to-be-working)
import isEqual from 'lodash/isEqual';
import has from 'lodash/has';
import get from 'lodash/get';
import every from 'lodash/every';
import compact from 'lodash/compact';
import map from 'lodash/map';
import isPlainObject from 'lodash/isPlainObject';

/**
 * An interface for wrapping the Context Generator arguments
 */
export interface ContextGeneratorEvent {
  event: PayloadDictionary;
  eventType: string;
  eventSchema: string;
}

/**
 * A context generator is a callback that returns a self-describing JSON
 * @param args - Object that contains: event, eventType, eventSchema
 * @return A self-describing JSON
 */
export type ContextGenerator = (args?: ContextGeneratorEvent) => SelfDescribingJson;

/**
 * A context primitive is either a self-describing JSON or a context generator
 */
export type ContextPrimitive = SelfDescribingJson | ContextGenerator;

/**
 * An interface for wrapping the Filter arguments
 */
export interface ContextFilterEvent {
  event: PayloadDictionary;
  eventType: string;
  eventSchema: string;
}

/**
 * A context filter is a user-supplied callback that is evaluated for each event
 * to determine if the context associated with the filter should be attached to the event
 * @param args - Object that contains: event, eventType, eventSchema
 * @return A self-describing JSON
 */
export type ContextFilter = (args?: ContextFilterEvent) => boolean;

/**
 * A filter provider is an array that has two parts: a context filter and context primitives
 * If the context filter evaluates to true, the tracker will attach the context primitive(s)
 */
export type FilterProvider = [ContextFilter, Array<ContextPrimitive> | ContextPrimitive];

/**
 * A ruleset has accept or reject properties that contain rules for matching Iglu schema URIs
 */
export interface RuleSet {
  accept?: Array<string> | string;
  reject?: Array<string> | string;
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

export interface GlobalContexts {
  /**
   * Returns all Context Primitives
   */
  getGlobalPrimitives(): Array<ContextPrimitive>;

  /**
   * Returns all Conditional Contexts
   */
  getConditionalProviders(): Array<ConditionalContextProvider>;

  /**
   * Adds conditional or primitive global contexts
   * @param contexts An Array of either Conditional Contexts or Primitive Contexts
   */
  addGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>): void;

  /**
   * Removes all global contexts
   */
  clearGlobalContexts(): void;

  /**
   * Removes previously added global context, performs a deep comparison of the contexts or conditional contexts
   * @param contexts An Array of either Condition Contexts or Primitive Contexts
   */
  removeGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>): void;

  /**
   * Returns all applicable global contexts for a specified event
   * @param event The event to check for applicable global contexts for
   */
  getApplicableContexts(event: PayloadData): Array<SelfDescribingJson>;
}

/**
 * Contains helper functions to aid in the addition and removal of Global Contexts
 */
export function globalContexts(): GlobalContexts {
  let globalPrimitives: Array<ContextPrimitive> = [];
  let conditionalProviders: Array<ConditionalContextProvider> = [];

  /**
   * Returns all applicable global contexts for a specified event
   * @param event The event to check for applicable global contexts for
   */
  const assembleAllContexts = (event: PayloadDictionary): Array<SelfDescribingJson> => {
    const eventSchema = getUsefulSchema(event);
    const eventType = getEventType(event);
    const contexts: Array<SelfDescribingJson> = [];
    const generatedPrimitives = generatePrimitives(globalPrimitives, event, eventType, eventSchema);
    contexts.push(...generatedPrimitives);

    const generatedConditionals = generateConditionals(conditionalProviders, event, eventType, eventSchema);
    contexts.push(...generatedConditionals);

    return contexts;
  };

  return {
    getGlobalPrimitives(): Array<ContextPrimitive> {
      return globalPrimitives;
    },

    getConditionalProviders(): Array<ConditionalContextProvider> {
      return conditionalProviders;
    },

    addGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>): void {
      const acceptedConditionalContexts: ConditionalContextProvider[] = [];
      const acceptedContextPrimitives: ContextPrimitive[] = [];
      for (const context of contexts) {
        if (isConditionalContextProvider(context)) {
          acceptedConditionalContexts.push(context);
        } else if (isContextPrimitive(context)) {
          acceptedContextPrimitives.push(context);
        }
      }
      globalPrimitives = globalPrimitives.concat(acceptedContextPrimitives);
      conditionalProviders = conditionalProviders.concat(acceptedConditionalContexts);
    },

    clearGlobalContexts(): void {
      conditionalProviders = [];
      globalPrimitives = [];
    },

    removeGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>): void {
      for (const context of contexts) {
        if (isConditionalContextProvider(context)) {
          conditionalProviders = conditionalProviders.filter((item) => !isEqual(item, context));
        } else if (isContextPrimitive(context)) {
          globalPrimitives = globalPrimitives.filter((item) => !isEqual(item, context));
        }
      }
    },

    getApplicableContexts(event: PayloadData): Array<SelfDescribingJson> {
      const builtEvent = event.build();
      if (isEventJson(builtEvent)) {
        const decodedEvent = getDecodedEvent(builtEvent);
        return assembleAllContexts(decodedEvent);
      } else {
        return [];
      }
    },
  };
}

/**
 * Returns an array containing the parts of the specified schema
 * @param input A schema string
 */
export function getSchemaParts(input: string): Array<string> | undefined {
  const re = new RegExp(
    '^iglu:([a-zA-Z0-9-_.]+)/([a-zA-Z0-9-_]+)/jsonschema/([1-9][0-9]*)-(0|[1-9][0-9]*)-(0|[1-9][0-9]*)$'
  );
  const matches = re.exec(input);
  if (matches !== null) return matches.slice(1, 6);
  return undefined;
}

/**
 * Validates the vendor section of a schema string contains allowed wildcard values
 * @param parts Array of parts from a schema string
 */
export function validateVendorParts(parts: Array<string>): boolean {
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
  } else if (parts.length == 2) return true;

  return false;
}

/**
 * Validates the vendor part of a schema string is valid for a rule set
 * @param input Vendor part of a schema string
 */
export function validateVendor(input: string): boolean {
  const parts = input.split('.');
  if (parts && parts.length > 1) return validateVendorParts(parts);
  return false;
}

/**
 * Returns all the sections of a schema string that are used to match rules in a ruleset
 * @param input A Schema string
 */
export function getRuleParts(input: string): Array<string> | undefined {
  const re = new RegExp(
    '^iglu:((?:(?:[a-zA-Z0-9-_]+|\\*).)+(?:[a-zA-Z0-9-_]+|\\*))/([a-zA-Z0-9-_.]+|\\*)/jsonschema/([1-9][0-9]*|\\*)-(0|[1-9][0-9]*|\\*)-(0|[1-9][0-9]*|\\*)$'
  );
  const matches = re.exec(input);
  if (matches !== null && validateVendor(matches[1])) return matches.slice(1, 6);
  return undefined;
}

/**
 * Ensures the rules specified in a schema string of a ruleset are valid
 * @param input A Schema string
 */
export function isValidRule(input: string): boolean {
  const ruleParts = getRuleParts(input);
  if (ruleParts) {
    const vendor = ruleParts[0];
    return ruleParts.length === 5 && validateVendor(vendor);
  }
  return false;
}

export function isStringArray(input: unknown): input is Array<string> {
  return (
    Array.isArray(input) &&
    input.every((x) => {
      return typeof x === 'string';
    })
  );
}

export function isValidRuleSetArg(input: unknown): boolean {
  if (isStringArray(input))
    return input.every((x: string) => {
      return isValidRule(x);
    });
  else if (typeof input === 'string') return isValidRule(input);
  return false;
}

export function isSelfDescribingJson(input: unknown): input is SelfDescribingJson {
  const sdj = input as SelfDescribingJson;
  if (isNonEmptyJson(sdj))
    if ('schema' in sdj && 'data' in sdj) return typeof sdj.schema === 'string' && typeof sdj.data === 'object';
  return false;
}

export function isEventJson(input: unknown): input is PayloadDictionary {
  const payload = input as PayloadDictionary;
  if (isNonEmptyJson(payload) && 'e' in payload) return typeof payload.e === 'string';
  return false;
}

export function isRuleSet(input: unknown): input is Record<string, unknown> {
  const ruleSet = input as Record<string, unknown>;
  let ruleCount = 0;
  if (isPlainObject(input)) {
    if (has(ruleSet, 'accept')) {
      if (isValidRuleSetArg(ruleSet['accept'])) {
        ruleCount += 1;
      } else {
        return false;
      }
    }
    if (has(ruleSet, 'reject')) {
      if (isValidRuleSetArg(ruleSet['reject'])) {
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

export function isContextGenerator(input: unknown): boolean {
  return typeof input === 'function' && input.length <= 1;
}

export function isContextFilter(input: unknown): boolean {
  return typeof input === 'function' && input.length <= 1;
}

export function isContextPrimitive(input: unknown): input is ContextPrimitive {
  return isContextGenerator(input) || isSelfDescribingJson(input);
}

export function isFilterProvider(input: unknown): boolean {
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

export function isRuleSetProvider(input: unknown): boolean {
  if (Array.isArray(input) && input.length === 2) {
    if (!isRuleSet(input[0])) return false;
    if (Array.isArray(input[1])) return every(input[1], isContextPrimitive);
    return isContextPrimitive(input[1]);
  }
  return false;
}

export function isConditionalContextProvider(input: unknown): input is ConditionalContextProvider {
  return isFilterProvider(input) || isRuleSetProvider(input);
}

export function matchSchemaAgainstRuleSet(ruleSet: RuleSet, schema: string): boolean {
  let rejectCount = 0;
  let acceptCount = 0;
  const acceptRules = get(ruleSet, 'accept');
  if (Array.isArray(acceptRules)) {
    if ((ruleSet.accept as Array<string>).some((rule) => matchSchemaAgainstRule(rule, schema))) {
      acceptCount++;
    }
  } else if (typeof acceptRules === 'string') {
    if (matchSchemaAgainstRule(acceptRules, schema)) {
      acceptCount++;
    }
  }

  const rejectRules = get(ruleSet, 'reject');
  if (Array.isArray(rejectRules)) {
    if ((ruleSet.reject as Array<string>).some((rule) => matchSchemaAgainstRule(rule, schema))) {
      rejectCount++;
    }
  } else if (typeof rejectRules === 'string') {
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

export function matchSchemaAgainstRule(rule: string, schema: string): boolean {
  if (!isValidRule(rule)) return false;
  const ruleParts = getRuleParts(rule);
  const schemaParts = getSchemaParts(schema);
  if (ruleParts && schemaParts) {
    if (!matchVendor(ruleParts[0], schemaParts[0])) return false;
    for (let i = 1; i < 5; i++) {
      if (!matchPart(ruleParts[i], schemaParts[i])) return false;
    }
    return true; // if it hasn't failed, it passes
  }
  return false;
}

function matchVendor(rule: string, vendor: string): boolean {
  // rule and vendor must have same number of elements
  const vendorParts = vendor.split('.');
  const ruleParts = rule.split('.');
  if (vendorParts && ruleParts) {
    if (vendorParts.length !== ruleParts.length) return false;
    for (let i = 0; i < ruleParts.length; i++) {
      if (!matchPart(vendorParts[i], ruleParts[i])) return false;
    }
    return true;
  }
  return false;
}

function matchPart(rule: string, schema: string): boolean {
  // parts should be the string nested between slashes in the URI: /example/
  return (rule && schema && rule === '*') || rule === schema;
}

// Returns the "useful" schema, i.e. what would someone want to use to identify events.
// The idea being that you can determine the event type from 'e', so getting the schema from
// 'ue_px.schema'/'ue_pr.schema' would be redundant - it'll return the unstructured event schema.
// Instead the schema nested inside the unstructured event is more useful!
// This doesn't decode ue_px, it works because it's called by code that has already decoded it
function getUsefulSchema(sb: PayloadDictionary): string {
  if (typeof get(sb, 'ue_px.data.schema') === 'string') return get(sb, 'ue_px.data.schema') as string;
  else if (typeof get(sb, 'ue_pr.data.schema') === 'string') return get(sb, 'ue_pr.data.schema') as string;
  else if (typeof get(sb, 'schema') === 'string') return get(sb, 'schema') as string;
  return '';
}

function getDecodedEvent(sb: PayloadDictionary): PayloadDictionary {
  const decodedEvent = { ...sb }; // spread operator, instantiates new object
  try {
    if (has(decodedEvent, 'ue_px')) {
      decodedEvent['ue_px'] = JSON.parse(base64urldecode(get(decodedEvent, ['ue_px']) as string));
    }
    return decodedEvent;
  } catch (e) {
    return decodedEvent;
  }
}

function getEventType(sb: Record<string, unknown>): string {
  return get(sb, 'e', '') as string;
}

function buildGenerator(
  generator: ContextGenerator,
  event: PayloadDictionary,
  eventType: string,
  eventSchema: string
): SelfDescribingJson | Array<SelfDescribingJson> | undefined {
  let contextGeneratorResult: SelfDescribingJson | Array<SelfDescribingJson> | undefined = undefined;
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

function normalizeToArray<T>(input: Array<T> | T): Array<T> {
  if (Array.isArray(input)) {
    return input;
  }
  return Array.of(input);
}

function generatePrimitives(
  contextPrimitives: Array<ContextPrimitive> | ContextPrimitive,
  event: PayloadDictionary,
  eventType: string,
  eventSchema: string
): Array<SelfDescribingJson> {
  const normalizedInputs: Array<ContextPrimitive> = normalizeToArray(contextPrimitives);
  const partialEvaluate = (primitive: ContextPrimitive) => {
    const result = evaluatePrimitive(primitive, event, eventType, eventSchema);
    if (result && result.length !== 0) {
      return result;
    }
    return undefined;
  };
  const generatedContexts = map(normalizedInputs, partialEvaluate);
  return ([] as Array<SelfDescribingJson>).concat(...compact(generatedContexts));
}

function evaluatePrimitive(
  contextPrimitive: ContextPrimitive,
  event: PayloadDictionary,
  eventType: string,
  eventSchema: string
): Array<SelfDescribingJson> | undefined {
  if (isSelfDescribingJson(contextPrimitive)) {
    return [contextPrimitive as SelfDescribingJson];
  } else if (isContextGenerator(contextPrimitive)) {
    const generatorOutput = buildGenerator(contextPrimitive as ContextGenerator, event, eventType, eventSchema);
    if (isSelfDescribingJson(generatorOutput)) {
      return [generatorOutput as SelfDescribingJson];
    } else if (Array.isArray(generatorOutput)) {
      return generatorOutput;
    }
  }
  return undefined;
}

function evaluateProvider(
  provider: ConditionalContextProvider,
  event: PayloadDictionary,
  eventType: string,
  eventSchema: string
): Array<SelfDescribingJson> {
  if (isFilterProvider(provider)) {
    const filter: ContextFilter = (provider as FilterProvider)[0];
    let filterResult = false;
    try {
      const args = {
        event: event,
        eventType: eventType,
        eventSchema: eventSchema,
      };
      filterResult = filter(args);
    } catch (error) {
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

function generateConditionals(
  providers: Array<ConditionalContextProvider> | ConditionalContextProvider,
  event: PayloadDictionary,
  eventType: string,
  eventSchema: string
): Array<SelfDescribingJson> {
  const normalizedInput: Array<ConditionalContextProvider> = normalizeToArray(providers);
  const partialEvaluate = (provider: ConditionalContextProvider) => {
    const result = evaluateProvider(provider, event, eventType, eventSchema);
    if (result && result.length !== 0) {
      return result;
    }
    return undefined;
  };
  const generatedContexts = map(normalizedInput, partialEvaluate);
  return ([] as Array<SelfDescribingJson>).concat(...compact(generatedContexts));
}
