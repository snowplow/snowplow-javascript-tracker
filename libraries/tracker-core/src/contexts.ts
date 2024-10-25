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

import { PayloadBuilder, Payload, isNonEmptyJson } from './payload';
import { SelfDescribingJson } from './core';
import { CorePlugin } from './plugins';
import { LOG } from './logger';

/**
 * Argument for {@link ContextGenerator} and {@link ContextFilter} callback
 */
export interface ContextEvent {
  /** The event payload */
  event: Payload;
  /** The event type
   * @example 'page_view'
   */
  eventType: string;
  /** The event schema where one is available, or empty string
   * @example 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0'
   */
  eventSchema: string;
}

/**
 * A context generator is a user-supplied callback that is evaluated for each event
 * to allow an additional context to be dynamically attached to the event
 * @param args - - Object which contains the event information to help decide what should be included in the returned Context
 */
export type ContextGenerator = (args?: ContextEvent) => SelfDescribingJson | SelfDescribingJson[] | undefined;

/**
 * A context filter is a user-supplied callback that is evaluated for each event
 * to determine if the context associated with the filter should be attached to the event
 * @param args - - Object that contains: event, eventType, eventSchema
 */
export type ContextFilter = (args?: ContextEvent) => boolean;

/**
 * A context primitive is either a self-describing JSON or a context generator
 */
export type ContextPrimitive = SelfDescribingJson | ContextGenerator;

/**
 * A filter provider is a tuple that has two parts: a context filter and the context primitive(s)
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
 * A ruleset provider is aa tuple that has two parts: a ruleset and the context primitive(s)
 * If the ruleset allows the current event schema URI, the tracker will attach the context primitive(s)
 */
export type RuleSetProvider = [RuleSet, Array<ContextPrimitive> | ContextPrimitive];

/**
 * Conditional context providers are two element arrays used to decide when to attach contexts, where:
 * - the first element is some conditional criterion
 * - the second element is any number of context primitives
 */
export type ConditionalContextProvider = FilterProvider | RuleSetProvider;

/**
 * A Dynamic context is an array of Self Describing JSON contexts, or an array of callbacks which return Self Describing JSON contexts
 * The array can be a mix of both contexts and callbacks which generate contexts
 */
export type DynamicContext = Array<SelfDescribingJson | ((...params: any[]) => SelfDescribingJson | null)>;

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
   * @param contexts - An Array of either Conditional Contexts or Primitive Contexts
   */
  addGlobalContexts(
    contexts:
      | Array<ConditionalContextProvider | ContextPrimitive>
      | Record<string, ConditionalContextProvider | ContextPrimitive>
  ): void;

  /**
   * Removes all global contexts
   */
  clearGlobalContexts(): void;

  /**
   * Removes previously added global context, performs a deep comparison of the contexts or conditional contexts
   * @param contexts - An Array of either Condition Contexts or Primitive Contexts
   */
  removeGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive | string>): void;

  /**
   * Returns all applicable global contexts for a specified event
   * @param event - The event to check for applicable global contexts for
   */
  getApplicableContexts(event: PayloadBuilder): Array<SelfDescribingJson>;
}

/**
 * Contains helper functions to aid in the addition and removal of Global Contexts
 */
export function globalContexts(): GlobalContexts {
  let globalPrimitives: Array<ContextPrimitive> = [];
  let conditionalProviders: Array<ConditionalContextProvider> = [];
  let namedPrimitives: Record<string, ContextPrimitive> = {};
  let namedConditionalProviders: Record<string, ConditionalContextProvider> = {};

  /**
   * Returns all applicable global contexts for a specified event
   * @param event - The event to check for applicable global contexts for
   * @returns An array of contexts
   */
  const assembleAllContexts = (event: PayloadBuilder): Array<SelfDescribingJson> => {
    const eventSchema = getUsefulSchema(event);
    const eventType = getEventType(event);
    const contexts: Array<SelfDescribingJson> = [];
    const generatedPrimitives = generatePrimitives(
      globalPrimitives.concat(Object.values(namedPrimitives)),
      event,
      eventType,
      eventSchema
    );
    contexts.push(...generatedPrimitives);

    const generatedConditionals = generateConditionals(
      conditionalProviders.concat(Object.values(namedConditionalProviders)),
      event,
      eventType,
      eventSchema
    );
    contexts.push(...generatedConditionals);

    return contexts;
  };

  return {
    getGlobalPrimitives(): Array<ContextPrimitive> {
      return globalPrimitives.concat(Object.values(namedPrimitives));
    },

    getConditionalProviders(): Array<ConditionalContextProvider> {
      return conditionalProviders.concat(Object.values(namedConditionalProviders));
    },

    addGlobalContexts(
      contexts:
        | Array<ConditionalContextProvider | ContextPrimitive>
        | Record<string, ConditionalContextProvider | ContextPrimitive>
    ): void {
      if (Array.isArray(contexts)) {
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
      } else {
        for (const [name, context] of Object.entries(contexts)) {
          if (isConditionalContextProvider(context)) {
            namedConditionalProviders[name] = context;
          } else if (isContextPrimitive(context)) {
            namedPrimitives[name] = context;
          }
        }
      }
    },

    clearGlobalContexts(): void {
      conditionalProviders = [];
      globalPrimitives = [];
      namedConditionalProviders = {};
      namedPrimitives = {};
    },

    removeGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive | string>): void {
      for (const context of contexts) {
        if (typeof context === 'string') {
          delete namedConditionalProviders[context];
          delete namedPrimitives[context];
        } else if (isConditionalContextProvider(context)) {
          conditionalProviders = conditionalProviders.filter((item) => !compareProvider(context, item));
        } else if (isContextPrimitive(context)) {
          globalPrimitives = globalPrimitives.filter((item) => !compareProvider(context, item));
        }
      }
    },

    getApplicableContexts(event: PayloadBuilder): Array<SelfDescribingJson> {
      return assembleAllContexts(event);
    },
  };
}

export interface PluginContexts {
  /**
   * Returns list of contexts from all active plugins
   */
  addPluginContexts: <T = Record<string, unknown>>(
    additionalContexts?: SelfDescribingJson<T>[] | null
  ) => SelfDescribingJson[];
}

export function pluginContexts(plugins: Array<CorePlugin>): PluginContexts {
  /**
   * Add common contexts to every event
   *
   * @param array - additionalContexts List of user-defined contexts
   * @returns userContexts combined with commonContexts
   */
  return {
    addPluginContexts: <T = Record<string, unknown>>(additionalContexts?: SelfDescribingJson<T>[] | null) => {
      const combinedContexts: SelfDescribingJson<T | Record<string, unknown>>[] = additionalContexts
        ? [...additionalContexts]
        : [];

      plugins.forEach((plugin) => {
        try {
          if (plugin.contexts) {
            combinedContexts.push(...plugin.contexts());
          }
        } catch (ex) {
          LOG.error('Error adding plugin contexts', ex);
        }
      });

      return combinedContexts as SelfDescribingJson[];
    },
  };
}

/**
 * Find dynamic context generating functions and return their results to be merged into the static contexts
 * Combine an array of unchanging contexts with the result of a context-creating function
 *
 * @param dynamicOrStaticContexts - Array of custom context Objects or custom context generating functions
 * @param Parameters - to pass to dynamic context callbacks
 * @returns An array of Self Describing JSON context
 */
export function resolveDynamicContext(
  dynamicOrStaticContexts?: DynamicContext | null,
  ...extraParams: any[]
): Array<SelfDescribingJson> {
  return (
    (dynamicOrStaticContexts
      ?.map(function (context) {
        if (typeof context === 'function') {
          try {
            return context(...extraParams);
          } catch (e) {
            //TODO: provide warning
            return undefined;
          }
        } else {
          return context;
        }
      })
      .filter(Boolean) as Array<SelfDescribingJson>) ?? []
  );
}

/**
 * Slices a schema into its composite parts. Useful for ruleset filtering.
 * @param input - A schema string
 * @returns The vendor, schema name, major, minor and patch information of a schema string
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
 * @param parts - Array of parts from a schema string
 * @returns Whether the vendor validation parts are a valid combination
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
 * @param input - Vendor part of a schema string
 * @returns Whether the vendor validation string is valid
 */
export function validateVendor(input: string): boolean {
  const parts = input.split('.');
  if (parts && parts.length > 1) return validateVendorParts(parts);
  return false;
}

/**
 * Checks for validity of input and returns all the sections of a schema string that are used to match rules in a ruleset
 * @param input - A Schema string
 * @returns The sections of a schema string that are used to match rules in a ruleset
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
 * @param input - A Schema string
 * @returns if there rule is valid
 */
export function isValidRule(input: string): boolean {
  const ruleParts = getRuleParts(input);
  if (ruleParts) {
    const vendor = ruleParts[0];
    return ruleParts.length === 5 && validateVendor(vendor);
  }
  return false;
}

/**
 * Check if a variable is an Array containing only strings
 * @param input - The variable to validate
 * @returns True if the input is an array containing only strings
 */
export function isStringArray(input: unknown): input is Array<string> {
  return (
    Array.isArray(input) &&
    input.every((x) => {
      return typeof x === 'string';
    })
  );
}

/**
 * Validates whether a rule set is an array of valid ruleset strings
 * @param input - The Array of rule set arguments
 * @returns True is the input is an array of valid rules
 */
export function isValidRuleSetArg(input: unknown): boolean {
  if (isStringArray(input))
    return input.every((x: string) => {
      return isValidRule(x);
    });
  else if (typeof input === 'string') return isValidRule(input);
  return false;
}

/**
 * Check if a variable is a valid, non-empty Self Describing JSON
 * @param input - The variable to validate
 * @returns True if a valid Self Describing JSON
 */
export function isSelfDescribingJson(input: unknown): input is SelfDescribingJson {
  const sdj = input as SelfDescribingJson;
  if (isNonEmptyJson(sdj))
    if ('schema' in sdj && 'data' in sdj) return typeof sdj.schema === 'string' && typeof sdj.data === 'object';
  return false;
}

/**
 * Validates if the input object contains the expected properties of a ruleset
 * @param input - The object containing a rule set
 * @returns True if a valid rule set
 */
export function isRuleSet(input: unknown): input is Record<string, unknown> {
  const ruleSet = input as Record<string, unknown>;
  let ruleCount = 0;
  if (input != null && typeof input === 'object' && !Array.isArray(input)) {
    if (Object.prototype.hasOwnProperty.call(ruleSet, 'accept')) {
      if (isValidRuleSetArg(ruleSet['accept'])) {
        ruleCount += 1;
      } else {
        return false;
      }
    }
    if (Object.prototype.hasOwnProperty.call(ruleSet, 'reject')) {
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

/**
 * Validates if the function can be a valid context generator function
 * @param input - The function to be validated
 */
export function isContextCallbackFunction(input: unknown): boolean {
  return typeof input === 'function' && input.length <= 1;
}

/**
 * Validates if the function can be a valid context primitive function or self describing json
 * @param input - The function or orbject to be validated
 * @returns True if either a Context Generator or Self Describing JSON
 */
export function isContextPrimitive(input: unknown): input is ContextPrimitive {
  return isContextCallbackFunction(input) || isSelfDescribingJson(input);
}

/**
 * Validates if an array is a valid shape to be a Filter Provider
 * @param input - The Array of Context filter callbacks
 */
export function isFilterProvider(input: unknown): boolean {
  if (Array.isArray(input)) {
    if (input.length === 2) {
      if (Array.isArray(input[1])) {
        return isContextCallbackFunction(input[0]) && input[1].every(isContextPrimitive);
      }
      return isContextCallbackFunction(input[0]) && isContextPrimitive(input[1]);
    }
  }
  return false;
}

/**
 * Validates if an array is a valid shape to be an array of rule sets
 * @param input - The Array of Rule Sets
 */
export function isRuleSetProvider(input: unknown): boolean {
  if (Array.isArray(input) && input.length === 2) {
    if (!isRuleSet(input[0])) return false;
    if (Array.isArray(input[1])) return input[1].every(isContextPrimitive);
    return isContextPrimitive(input[1]);
  }
  return false;
}

/**
 * Checks if an input array is either a filter provider or a rule set provider
 * @param input - An array of filter providers or rule set providers
 * @returns Whether the array is a valid {@link ConditionalContextProvider}
 */
export function isConditionalContextProvider(input: unknown): input is ConditionalContextProvider {
  return isFilterProvider(input) || isRuleSetProvider(input);
}

/**
 * Checks if a given schema matches any rules within the provided rule set
 * @param ruleSet - The rule set containing rules to match schema against
 * @param schema - The schema to be matched against the rule set
 */
export function matchSchemaAgainstRuleSet(ruleSet: RuleSet, schema: string): boolean {
  let rejectCount = 0;
  let acceptCount = 0;
  const acceptRules = ruleSet['accept'];
  if (Array.isArray(acceptRules)) {
    if ((ruleSet.accept as Array<string>).some((rule) => matchSchemaAgainstRule(rule, schema))) {
      acceptCount++;
    }
  } else if (typeof acceptRules === 'string') {
    if (matchSchemaAgainstRule(acceptRules, schema)) {
      acceptCount++;
    }
  }

  const rejectRules = ruleSet['reject'];
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

/**
 * Checks if a given schema matches a specific rule from a rule set
 * @param rule - The rule to match schema against
 * @param schema - The schema to be matched against the rule
 */
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
// For some events this is the 'e' property but for unstructured events, this is the
// 'schema' from the 'ue_px' field.
function getUsefulSchema(sb: PayloadBuilder): string {
  let eventJson = sb.getJson();
  for (const json of eventJson) {
    if (json.keyIfEncoded === 'ue_px' && typeof json.json['data'] === 'object') {
      const schema = (json.json['data'] as Record<string, unknown>)['schema'];
      if (typeof schema == 'string') {
        return schema;
      }
    }
  }
  return '';
}

function getEventType(payloadBuilder: PayloadBuilder): string {
  const eventType = payloadBuilder.getPayload()['e'];
  return typeof eventType === 'string' ? eventType : '';
}

function buildGenerator(
  generator: ContextGenerator,
  event: PayloadBuilder,
  eventType: string,
  eventSchema: string
): SelfDescribingJson | Array<SelfDescribingJson> | undefined {
  let contextGeneratorResult: SelfDescribingJson | Array<SelfDescribingJson> | undefined = undefined;
  try {
    // try to evaluate context generator
    const args = {
      event: event.getPayload(),
      eventType: eventType,
      eventSchema: eventSchema,
    };
    contextGeneratorResult = generator(args);
    // determine if the produced result is a valid SDJ
    if (Array.isArray(contextGeneratorResult) && contextGeneratorResult.every(isSelfDescribingJson)) {
      return contextGeneratorResult;
    } else if (isSelfDescribingJson(contextGeneratorResult)) {
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
  event: PayloadBuilder,
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
  const generatedContexts = normalizedInputs.map(partialEvaluate);
  return ([] as Array<SelfDescribingJson>).concat(
    ...(generatedContexts.filter((c) => c != null && c.filter(Boolean)) as Array<Array<SelfDescribingJson>>)
  );
}

function evaluatePrimitive(
  contextPrimitive: ContextPrimitive,
  event: PayloadBuilder,
  eventType: string,
  eventSchema: string
): Array<SelfDescribingJson> | undefined {
  if (isSelfDescribingJson(contextPrimitive)) {
    return [contextPrimitive as SelfDescribingJson];
  } else if (isContextCallbackFunction(contextPrimitive)) {
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
  event: PayloadBuilder,
  eventType: string,
  eventSchema: string
): Array<SelfDescribingJson> {
  if (isFilterProvider(provider)) {
    const filter: ContextFilter = (provider as FilterProvider)[0];
    let filterResult = false;
    try {
      const args = {
        event: event.getPayload(),
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

function compareProviderPart(
  a: ContextFilter | RuleSet | ContextPrimitive,
  b: ContextFilter | RuleSet | ContextPrimitive
): boolean {
  if (typeof a === 'function') return a === b;
  return JSON.stringify(a) === JSON.stringify(b);
}

function compareProvider(
  a: ConditionalContextProvider | ContextPrimitive,
  b: ConditionalContextProvider | ContextPrimitive
): boolean {
  if (isConditionalContextProvider(a)) {
    if (!isConditionalContextProvider(b)) return false;
    const [ruleA, primitivesA] = a;
    const [ruleB, primitivesB] = b;

    if (!compareProviderPart(ruleA, ruleB)) return false;
    if (Array.isArray(primitivesA)) {
      if (!Array.isArray(primitivesB)) return false;
      if (primitivesA.length !== primitivesB.length) return false;
      return primitivesA.reduce<boolean>((matches, a, i) => matches && compareProviderPart(a, primitivesB[i]), true);
    } else {
      if (Array.isArray(primitivesB)) return false;
      return compareProviderPart(primitivesA, primitivesB);
    }
  } else if (isContextPrimitive(a)) {
    if (!isContextPrimitive(b)) return false;
    return compareProviderPart(a, b);
  }

  return false;
}

function generateConditionals(
  providers: Array<ConditionalContextProvider> | ConditionalContextProvider,
  event: PayloadBuilder,
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
  const generatedContexts = normalizedInput.map(partialEvaluate);
  return ([] as Array<SelfDescribingJson>).concat(
    ...(generatedContexts.filter((c) => c != null && c.filter(Boolean)) as Array<Array<SelfDescribingJson>>)
  );
}
