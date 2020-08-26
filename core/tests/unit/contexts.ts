/*
 * JavaScript tracker core for Snowplow: tests/integration.js
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

import test from 'ava'
import * as contexts from '../../src/contexts'
import { payloadBuilder, PayloadDictionary } from '../../src/payload';
import { SelfDescribingJson } from '../../src/core';

test('Identify context primitives', t => {
	const geolocationContext = {
		schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
		data: {
			'latitude': 40.0,
			'longitude' : 55.1
		}
	};

	function eventTypeContextGenerator(args?: contexts.ContextGeneratorEvent) {
		const context: SelfDescribingJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
			data: {
				osType: 'ubuntu',
				osVersion: '2018.04',
				deviceManufacturer: 'ASUS',
				deviceModel: args ? String(args['eventType']) : ''
			}
		}
		return context;
	}

	t.true(contexts.isContextPrimitive(geolocationContext), 'A context primitive should be identified');
	t.true(contexts.isContextPrimitive(eventTypeContextGenerator), 'A context primitive should be identified');
});

test('Validating vendors', t => {
	// Vendor validation
	t.true(contexts.validateVendor('com.acme.marketing'), 'A valid vendor without wildcard is accepted');
	t.true(contexts.validateVendor('com.acme.*'), 'A valid vendor with wildcard is accepted');
	t.false(contexts.validateVendor('*.acme.*'), 'A vendor starting with asterisk is rejected');
	t.false(contexts.validateVendor('com.acme.*.marketing'), 'A vendor with asterisk out of order is rejected');
});

test('Identify rule sets', t => {
	const acceptRuleSet = {
		accept: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*']
	};

	const rejectRuleSet = {
		reject: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/1-0-1']
	};

	const bothRuleSet = {
		accept: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/1-*-1'],
		reject: ['iglu:com.snowplowanalytics.snowplow/some_event/jsonschema/1-*-*']
	};

	const pageview_schema = 'iglu:com.snowplowanalytics.snowplow/pageview/jsonschema/1-0-1';

	t.true(contexts.isValidRule(acceptRuleSet.accept[0]), 'All rule elements are correctly identified as valid rules');
	t.true(contexts.isValidRuleSetArg(acceptRuleSet.accept), 'A rule set arg is correctly identified');
	t.true(contexts.isRuleSet(acceptRuleSet), 'An accept rule set is identified');
	t.true(contexts.isRuleSet(rejectRuleSet), 'A reject rule set is identified');
	t.true(contexts.isRuleSet(bothRuleSet), 'A rule set with both elements is identified');
	t.deepEqual(contexts.getSchemaParts(pageview_schema), ['com.snowplowanalytics.snowplow', 'pageview', '1', '0', '1'], 'Gets correct parts for schema');
	t.true(contexts.matchSchemaAgainstRule('iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*', pageview_schema), 'Matches schema against wildcarded rule');
	t.true(contexts.matchSchemaAgainstRuleSet(acceptRuleSet, pageview_schema), 'Accept rule set accepts matching schema');
	t.false(contexts.matchSchemaAgainstRuleSet(rejectRuleSet, pageview_schema), 'Reject rule set rejects matching schema');
});

test('Identify filter function', t => {
	const filterFunction = function (args?: contexts.ContextFilterEvent) {
		return args?.eventType === 'ue';
	};

	t.true(contexts.isContextFilter(filterFunction), 'A valid filter function is identified');
});

test('Identify rule set provider', t => {
	const bothRuleSet = {
		accept: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*'],
		reject: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*']
	};

	const geolocationContext = {
		schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
		data: {
			'latitude': 40.0,
			'longitude' : 55.1
		}
	};

	function eventTypeContextGenerator(args?: contexts.ContextGeneratorEvent) {
		const context: SelfDescribingJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
			data: {
				osType: 'ubuntu',
				osVersion: '2018.04',
				deviceManufacturer: 'ASUS',
				deviceModel: args ? String(args['eventType']) : ''
			}
		}
		return context;
	}

	const ruleSetProvider = [bothRuleSet, [geolocationContext, eventTypeContextGenerator]];
	t.true(contexts.isRuleSetProvider(ruleSetProvider), 'Valid rule set provider is correctly identified');
});

test('Identify filter provider', t => {
	const filterFunction = function (args?: contexts.ContextFilterEvent) {
		return args?.eventType === 'ue';
	};

	const geolocationContext = {
		schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
		data: {
			'latitude': 40.0,
			'longitude' : 55.1
		}
	};

	function eventTypeContextGenerator(args?: contexts.ContextGeneratorEvent) {
		const context: SelfDescribingJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
			data: {
				osType: 'ubuntu',
				osVersion: '2018.04',
				deviceManufacturer: 'ASUS',
				deviceModel: args ? String(args['eventType']) : ''
			}
		}
		return context;
	}

	const filterProvider = [filterFunction, [geolocationContext, eventTypeContextGenerator]];
	t.true(contexts.isFilterProvider(filterProvider), 'A valid filter provider is identified');
});

test('Add global contexts', t => {
	const geolocationContext = {
		schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
		data: {
			'latitude': 40.0,
			'longitude' : 55.1
		}
	};

	function eventTypeContextGenerator(args?: contexts.ContextGeneratorEvent) {
		const context: SelfDescribingJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
			data: {
				osType: 'ubuntu',
				osVersion: '2018.04',
				deviceManufacturer: 'ASUS',
				deviceModel: args ? String(args['eventType']) : ''
			}
		}
		return context;
	}

	const bothRuleSet = {
		accept: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*'],
		reject: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*']
	};

	const filterFunction = function (args?: contexts.ContextFilterEvent) {
		return args?.eventType === 'ue';
	};

	const filterProvider: contexts.FilterProvider = [filterFunction, [geolocationContext, eventTypeContextGenerator]];
	const ruleSetProvider: contexts.RuleSetProvider = [bothRuleSet, [geolocationContext, eventTypeContextGenerator]];

	const contextArray = [filterProvider, ruleSetProvider, geolocationContext, eventTypeContextGenerator];
	const globalContexts = contexts.globalContexts();

	globalContexts.addGlobalContexts(contextArray);
	t.is(globalContexts.getGlobalPrimitives().length, 2,
		'Correct number of primitives added');
	t.is(globalContexts.getConditionalProviders().length, 2,
		'Correct number of conditional providers added');
});

test('Remove global contexts', t => {
	const geolocationContext = {
		schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
		data: {
			'latitude': 40.0,
			'longitude' : 55.1
		}
	};

	function eventTypeContextGenerator(args?: contexts.ContextGeneratorEvent) {
		const context: SelfDescribingJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
			data: {
				osType: 'ubuntu',
				osVersion: '2018.04',
				deviceManufacturer: 'ASUS',
				deviceModel: args ? String(args['eventType']) : ''
			}
		}
		return context;
	}

	const bothRuleSet = {
		accept: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*'],
		reject: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*']
	};

	const filterFunction = function (args?: contexts.ContextFilterEvent) {
		return args?.eventType === 'ue';
	};

	const filterProvider: contexts.FilterProvider = [filterFunction, [geolocationContext, eventTypeContextGenerator]];
	const ruleSetProvider: contexts.RuleSetProvider = [bothRuleSet, [geolocationContext, eventTypeContextGenerator]];
	const globalContexts = contexts.globalContexts();

	globalContexts.addGlobalContexts([filterProvider, ruleSetProvider, geolocationContext, eventTypeContextGenerator]);
	globalContexts.removeGlobalContexts([filterProvider, geolocationContext, eventTypeContextGenerator]);
	t.is(globalContexts.getGlobalPrimitives().length, 0,
		'Correct number of primitives added');
	t.is(globalContexts.getConditionalProviders().length, 1,
		'Correct number of conditional providers added');
});

test('Clear global contexts', t => {
	const geolocationContext = {
		schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
		data: {
			'latitude': 40.0,
			'longitude' : 55.1
		}
	};

	function eventTypeContextGenerator(args?: contexts.ContextGeneratorEvent) {
		const context: SelfDescribingJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
			data: {
				osType: 'ubuntu',
				osVersion: '2018.04',
				deviceManufacturer: 'ASUS',
				deviceModel: args ? String(args['eventType']) : ''
			}
		}
		return context;
	}

	const bothRuleSet = {
		accept: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*'],
		reject: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*']
	};

	const filterFunction = function (args?: contexts.ContextFilterEvent) {
		return args?.eventType === 'ue';
	};

	const filterProvider: contexts.FilterProvider = [filterFunction, [geolocationContext, eventTypeContextGenerator]];
	const ruleSetProvider: contexts.RuleSetProvider = [bothRuleSet, [geolocationContext, eventTypeContextGenerator]];

	const contextArray = [filterProvider, ruleSetProvider, geolocationContext, eventTypeContextGenerator];
	const globalContexts = contexts.globalContexts();
	globalContexts.addGlobalContexts(contextArray);
	globalContexts.clearGlobalContexts();
	t.is(globalContexts.getGlobalPrimitives().length, 0,
		'Correct number of primitives added');
	t.is(globalContexts.getConditionalProviders().length, 0,
		'Correct number of conditional providers added');
});

test('Get applicable contexts', t => {
	const geolocationContext = {
		schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
		data: {
			'latitude': 40.0,
			'longitude' : 55.1
		}
	};

	function eventTypeContextGenerator(args?: contexts.ContextGeneratorEvent) {
		const context: SelfDescribingJson = {
			schema: 'iglu:com.snowplowanalytics.snowplow/some_context/jsonschema/1-0-1',
			data: {
				osType: 'ubuntu',
				osVersion: '2018.04',
				deviceManufacturer: 'ASUS',
				eventType: args ? String(args['eventType']) : ''
			}
		}
		return context;
	}

	const unstructuredEventRuleset = {
		accept: ['iglu:com.acme_company/*/jsonschema/*-*-*']
	};

	const filterFunction = function (args?: contexts.ContextFilterEvent) {
		return args?.eventType === 'ue';
	};

	const filterProvider: contexts.FilterProvider = [filterFunction, [geolocationContext, eventTypeContextGenerator]];
	const ruleSetProvider: contexts.RuleSetProvider = [unstructuredEventRuleset, [geolocationContext, eventTypeContextGenerator]];

	const eventJson: PayloadDictionary = {
		e: 'ue',
		ue_px: {
			schema: 'iglu:com.snowplowanalytics.snowplow/unstructured_event/jsonschema/1-0-0',
			data: {
				schema: 'iglu:com.acme_company/some_event/jsonschema/1-0-0',
				data: {}
			}
		}
	};
	const contextArray = [filterProvider, ruleSetProvider, geolocationContext, eventTypeContextGenerator];
	const globalContexts = contexts.globalContexts();
	const event = payloadBuilder(false);
	for (const property in eventJson) {
		if (Object.prototype.hasOwnProperty.call(eventJson, property)) {
			event.add(property, eventJson[property] as string);
		}
	}

	globalContexts.addGlobalContexts(contextArray);
	t.is(globalContexts.getApplicableContexts(event).length, 6);
});