"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var payload_1 = require("./payload");
var base64url_1 = require("base64url");
var isEqual = require("lodash/isEqual");
var has = require("lodash/has");
var get = require("lodash/get");
var isPlainObject = require("lodash/isPlainObject");
var every = require("lodash/every");
var compact = require("lodash/compact");
var map = require("lodash/map");
function getSchemaParts(input) {
    var re = new RegExp('^iglu:([a-zA-Z0-9-_\.]+)\/([a-zA-Z0-9-_]+)\/jsonschema\/([1-9][0-9]*)\-(0|[1-9][0-9]*)\-(0|[1-9][0-9]*)$');
    var matches = re.exec(input);
    if (matches !== null)
        return matches.slice(1, 6);
    return undefined;
}
exports.getSchemaParts = getSchemaParts;
function validateVendorParts(parts) {
    if (parts[0] === '*' || parts[1] === '*') {
        return false;
    }
    if (parts.slice(2).length > 0) {
        var asterisk = false;
        for (var _i = 0, _a = parts.slice(2); _i < _a.length; _i++) {
            var part = _a[_i];
            if (part === '*')
                asterisk = true;
            else if (asterisk)
                return false;
        }
        return true;
    }
    else if (parts.length == 2)
        return true;
    return false;
}
exports.validateVendorParts = validateVendorParts;
function validateVendor(input) {
    var parts = input.split('.');
    if (parts && parts.length > 1)
        return validateVendorParts(parts);
    return false;
}
exports.validateVendor = validateVendor;
function getRuleParts(input) {
    var re = new RegExp('^iglu:((?:(?:[a-zA-Z0-9-_]+|\\*)\.)+(?:[a-zA-Z0-9-_]+|\\*))\/([a-zA-Z0-9-_.]+|\\*)\/jsonschema\/([1-9][0-9]*|\\*)-(0|[1-9][0-9]*|\\*)-(0|[1-9][0-9]*|\\*)$');
    var matches = re.exec(input);
    if (matches !== null && validateVendor(matches[1]))
        return matches.slice(1, 6);
    return undefined;
}
exports.getRuleParts = getRuleParts;
function isValidRule(input) {
    var ruleParts = getRuleParts(input);
    if (ruleParts) {
        var vendor = ruleParts[0];
        return ruleParts.length === 5 && validateVendor(vendor);
    }
    return false;
}
exports.isValidRule = isValidRule;
function isStringArray(input) {
    return Array.isArray(input) && input.every(function (x) { return typeof x === 'string'; });
}
exports.isStringArray = isStringArray;
function isValidRuleSetArg(input) {
    if (isStringArray(input))
        return input.every(function (x) { return isValidRule(x); });
    else if (typeof input === 'string')
        return isValidRule(input);
    return false;
}
exports.isValidRuleSetArg = isValidRuleSetArg;
function isSelfDescribingJson(input) {
    if (payload_1.isNonEmptyJson(input))
        if ('schema' in input && 'data' in input)
            return (typeof (input.schema) === 'string' && typeof (input.data) === 'object');
    return false;
}
exports.isSelfDescribingJson = isSelfDescribingJson;
function isEventJson(input) {
    if (payload_1.isNonEmptyJson(input) && ('e' in input))
        return (typeof (input.e) === 'string');
    return false;
}
exports.isEventJson = isEventJson;
function isRuleSet(input) {
    var ruleCount = 0;
    if (isPlainObject(input)) {
        if (has(input, 'accept')) {
            if (isValidRuleSetArg(input['accept'])) {
                ruleCount += 1;
            }
            else {
                return false;
            }
        }
        if (has(input, 'reject')) {
            if (isValidRuleSetArg(input['reject'])) {
                ruleCount += 1;
            }
            else {
                return false;
            }
        }
        return ruleCount > 0 && ruleCount <= 2;
    }
    return false;
}
exports.isRuleSet = isRuleSet;
function isContextGenerator(input) {
    return typeof (input) === 'function' && input.length <= 1;
}
exports.isContextGenerator = isContextGenerator;
function isContextFilter(input) {
    return typeof (input) === 'function' && input.length <= 1;
}
exports.isContextFilter = isContextFilter;
function isContextPrimitive(input) {
    return (isContextGenerator(input) || isSelfDescribingJson(input));
}
exports.isContextPrimitive = isContextPrimitive;
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
exports.isFilterProvider = isFilterProvider;
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
exports.isRuleSetProvider = isRuleSetProvider;
function isConditionalContextProvider(input) {
    return isFilterProvider(input) || isRuleSetProvider(input);
}
exports.isConditionalContextProvider = isConditionalContextProvider;
function matchSchemaAgainstRule(rule, schema) {
    if (!isValidRule(rule))
        return false;
    var ruleParts = getRuleParts(rule);
    var schemaParts = getSchemaParts(schema);
    if (ruleParts && schemaParts) {
        if (!matchVendor(ruleParts[0], schemaParts[0]))
            return false;
        for (var i = 1; i < 5; i++) {
            if (!matchPart(ruleParts[i], schemaParts[i]))
                return false;
        }
        return true;
    }
    return false;
}
exports.matchSchemaAgainstRule = matchSchemaAgainstRule;
function matchVendor(rule, vendor) {
    var vendorParts = vendor.split('.');
    var ruleParts = rule.split('.');
    if (vendorParts && ruleParts) {
        if (vendorParts.length !== ruleParts.length)
            return false;
        for (var i = 0; i < ruleParts.length; i++) {
            if (!matchPart(vendorParts[i], ruleParts[i]))
                return false;
        }
        return true;
    }
    return false;
}
exports.matchVendor = matchVendor;
function matchPart(rule, schema) {
    return (rule && schema && rule === '*' || rule === schema);
}
exports.matchPart = matchPart;
function matchSchemaAgainstRuleSet(ruleSet, schema) {
    var rejectCount = 0;
    var acceptCount = 0;
    var acceptRules = get(ruleSet, 'accept');
    if (Array.isArray(acceptRules)) {
        if (ruleSet.accept.some(function (rule) { return (matchSchemaAgainstRule(rule, schema)); })) {
            acceptCount++;
        }
    }
    else if (typeof (acceptRules) === 'string') {
        if (matchSchemaAgainstRule(acceptRules, schema)) {
            acceptCount++;
        }
    }
    var rejectRules = get(ruleSet, 'reject');
    if (Array.isArray(rejectRules)) {
        if (ruleSet.reject.some(function (rule) { return (matchSchemaAgainstRule(rule, schema)); })) {
            rejectCount++;
        }
    }
    else if (typeof (rejectRules) === 'string') {
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
exports.matchSchemaAgainstRuleSet = matchSchemaAgainstRuleSet;
function getUsefulSchema(sb) {
    if (typeof get(sb, 'ue_px.data.schema') === 'string')
        return get(sb, 'ue_px.data.schema');
    else if (typeof get(sb, 'ue_pr.data.schema') === 'string')
        return get(sb, 'ue_pr.data.schema');
    else if (typeof get(sb, 'schema') === 'string')
        return get(sb, 'schema');
    return '';
}
exports.getUsefulSchema = getUsefulSchema;
function getDecodedEvent(sb) {
    var decodedEvent = __assign({}, sb);
    try {
        if (has(decodedEvent, 'ue_px')) {
            decodedEvent['ue_px'] = JSON.parse(base64url_1.default.decode(get(decodedEvent, ['ue_px'])));
        }
    }
    catch (e) { }
    return decodedEvent;
}
exports.getDecodedEvent = getDecodedEvent;
function getEventType(sb) {
    return get(sb, 'e', '');
}
exports.getEventType = getEventType;
function buildGenerator(generator, event, eventType, eventSchema) {
    var contextGeneratorResult = undefined;
    try {
        var args = {
            event: event,
            eventType: eventType,
            eventSchema: eventSchema
        };
        contextGeneratorResult = generator(args);
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
exports.buildGenerator = buildGenerator;
function normalizeToArray(input) {
    if (Array.isArray(input)) {
        return input;
    }
    return Array.of(input);
}
exports.normalizeToArray = normalizeToArray;
function generatePrimitives(contextPrimitives, event, eventType, eventSchema) {
    var normalizedInputs = normalizeToArray(contextPrimitives);
    var partialEvaluate = function (primitive) {
        var result = evaluatePrimitive(primitive, event, eventType, eventSchema);
        if (result && result.length !== 0) {
            return result;
        }
    };
    var generatedContexts = map(normalizedInputs, partialEvaluate);
    return [].concat.apply([], compact(generatedContexts));
}
exports.generatePrimitives = generatePrimitives;
function evaluatePrimitive(contextPrimitive, event, eventType, eventSchema) {
    if (isSelfDescribingJson(contextPrimitive)) {
        return [contextPrimitive];
    }
    else if (isContextGenerator(contextPrimitive)) {
        var generatorOutput = buildGenerator(contextPrimitive, event, eventType, eventSchema);
        if (isSelfDescribingJson(generatorOutput)) {
            return [generatorOutput];
        }
        else if (Array.isArray(generatorOutput)) {
            return generatorOutput;
        }
    }
    return undefined;
}
exports.evaluatePrimitive = evaluatePrimitive;
function evaluateProvider(provider, event, eventType, eventSchema) {
    if (isFilterProvider(provider)) {
        var filter = provider[0];
        var filterResult = false;
        try {
            var args = {
                event: event,
                eventType: eventType,
                eventSchema: eventSchema
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
exports.evaluateProvider = evaluateProvider;
function generateConditionals(providers, event, eventType, eventSchema) {
    var normalizedInput = normalizeToArray(providers);
    var partialEvaluate = function (provider) {
        var result = evaluateProvider(provider, event, eventType, eventSchema);
        if (result && result.length !== 0) {
            return result;
        }
    };
    var generatedContexts = map(normalizedInput, partialEvaluate);
    return [].concat.apply([], compact(generatedContexts));
}
exports.generateConditionals = generateConditionals;
function contextModule() {
    var globalPrimitives = [];
    var conditionalProviders = [];
    function assembleAllContexts(event) {
        var eventSchema = getUsefulSchema(event);
        var eventType = getEventType(event);
        var contexts = [];
        var generatedPrimitives = generatePrimitives(globalPrimitives, event, eventType, eventSchema);
        contexts.push.apply(contexts, generatedPrimitives);
        var generatedConditionals = generateConditionals(conditionalProviders, event, eventType, eventSchema);
        contexts.push.apply(contexts, generatedConditionals);
        return contexts;
    }
    return {
        getGlobalPrimitives: function () {
            return globalPrimitives;
        },
        getConditionalProviders: function () {
            return conditionalProviders;
        },
        addGlobalContexts: function (contexts) {
            var acceptedConditionalContexts = [];
            var acceptedContextPrimitives = [];
            for (var _i = 0, contexts_1 = contexts; _i < contexts_1.length; _i++) {
                var context = contexts_1[_i];
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
        clearGlobalContexts: function () {
            conditionalProviders = [];
            globalPrimitives = [];
        },
        removeGlobalContexts: function (contexts) {
            var _loop_1 = function (context) {
                if (isConditionalContextProvider(context)) {
                    conditionalProviders = conditionalProviders.filter(function (item) { return !isEqual(item, context); });
                }
                else if (isContextPrimitive(context)) {
                    globalPrimitives = globalPrimitives.filter(function (item) { return !isEqual(item, context); });
                }
                else {
                }
            };
            for (var _i = 0, contexts_2 = contexts; _i < contexts_2.length; _i++) {
                var context = contexts_2[_i];
                _loop_1(context);
            }
        },
        getApplicableContexts: function (event) {
            var builtEvent = event.build();
            if (isEventJson(builtEvent)) {
                var decodedEvent = getDecodedEvent(builtEvent);
                return assembleAllContexts(decodedEvent);
            }
            else {
                return [];
            }
        }
    };
}
exports.contextModule = contextModule;
//# sourceMappingURL=contexts.js.map