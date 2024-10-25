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

import test from 'ava';
import * as contexts from '../src/contexts';
import { payloadBuilder } from '../src/payload';
import { SelfDescribingJson } from '../src/core';

test('Identify context primitives', (t) => {
  const geolocationContext = {
    schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
    data: {
      latitude: 40.0,
      longitude: 55.1,
    },
  };

  function eventTypeContextGenerator(args?: contexts.ContextEvent) {
    const context: SelfDescribingJson = {
      schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
      data: {
        osType: 'ubuntu',
        osVersion: '2018.04',
        deviceManufacturer: 'ASUS',
        deviceModel: args ? String(args['eventType']) : '',
      },
    };
    return context;
  }

  t.true(contexts.isContextPrimitive(geolocationContext), 'A context primitive should be identified');
  t.true(contexts.isContextPrimitive(eventTypeContextGenerator), 'A context primitive should be identified');
});

test('Validating vendors', (t) => {
  // Vendor validation
  t.true(contexts.validateVendor('com.acme.marketing'), 'A valid vendor without wildcard is accepted');
  t.true(contexts.validateVendor('com.acme.*'), 'A valid vendor with wildcard is accepted');
  t.false(contexts.validateVendor('*.acme.*'), 'A vendor starting with asterisk is rejected');
  t.false(contexts.validateVendor('com.acme.*.marketing'), 'A vendor with asterisk out of order is rejected');
});

test('Identify rule sets', (t) => {
  const acceptRuleSet = {
    accept: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*'],
  };

  const rejectRuleSet = {
    reject: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/1-0-1'],
  };

  const bothRuleSet = {
    accept: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/1-*-1'],
    reject: ['iglu:com.snowplowanalytics.snowplow/some_event/jsonschema/1-*-*'],
  };

  const pageview_schema = 'iglu:com.snowplowanalytics.snowplow/pageview/jsonschema/1-0-1';

  t.true(contexts.isValidRule(acceptRuleSet.accept[0]), 'All rule elements are correctly identified as valid rules');
  t.true(contexts.isValidRuleSetArg(acceptRuleSet.accept), 'A rule set arg is correctly identified');
  t.true(contexts.isRuleSet(acceptRuleSet), 'An accept rule set is identified');
  t.true(contexts.isRuleSet(rejectRuleSet), 'A reject rule set is identified');
  t.true(contexts.isRuleSet(bothRuleSet), 'A rule set with both elements is identified');
  t.deepEqual(
    contexts.getSchemaParts(pageview_schema),
    ['com.snowplowanalytics.snowplow', 'pageview', '1', '0', '1'],
    'Gets correct parts for schema'
  );
  t.true(
    contexts.matchSchemaAgainstRule('iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*', pageview_schema),
    'Matches schema against wildcarded rule'
  );
  t.true(contexts.matchSchemaAgainstRuleSet(acceptRuleSet, pageview_schema), 'Accept rule set accepts matching schema');
  t.false(
    contexts.matchSchemaAgainstRuleSet(rejectRuleSet, pageview_schema),
    'Reject rule set rejects matching schema'
  );
});

test('Identify filter function', (t) => {
  const filterFunction = function (args?: contexts.ContextEvent) {
    return args?.eventType === 'ue';
  };

  t.true(contexts.isContextCallbackFunction(filterFunction), 'A valid filter function is identified');
});

test('Identify rule set provider', (t) => {
  const bothRuleSet = {
    accept: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*'],
    reject: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*'],
  };

  const geolocationContext = {
    schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
    data: {
      latitude: 40.0,
      longitude: 55.1,
    },
  };

  function eventTypeContextGenerator(args?: contexts.ContextEvent) {
    const context: SelfDescribingJson = {
      schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
      data: {
        osType: 'ubuntu',
        osVersion: '2018.04',
        deviceManufacturer: 'ASUS',
        deviceModel: args ? String(args['eventType']) : '',
      },
    };
    return context;
  }

  const ruleSetProvider = [bothRuleSet, [geolocationContext, eventTypeContextGenerator]];
  t.true(contexts.isRuleSetProvider(ruleSetProvider), 'Valid rule set provider is correctly identified');
});

test('Identify filter provider', (t) => {
  const filterFunction = function (args?: contexts.ContextEvent) {
    return args?.eventType === 'ue';
  };

  const geolocationContext = {
    schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
    data: {
      latitude: 40.0,
      longitude: 55.1,
    },
  };

  function eventTypeContextGenerator(args?: contexts.ContextEvent) {
    const context: SelfDescribingJson = {
      schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
      data: {
        osType: 'ubuntu',
        osVersion: '2018.04',
        deviceManufacturer: 'ASUS',
        deviceModel: args ? String(args['eventType']) : '',
      },
    };
    return context;
  }

  const filterProvider = [filterFunction, [geolocationContext, eventTypeContextGenerator]];
  t.true(contexts.isFilterProvider(filterProvider), 'A valid filter provider is identified');
});

test('Add global contexts', (t) => {
  const geolocationContext = {
    schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
    data: {
      latitude: 40.0,
      longitude: 55.1,
    },
  };

  function eventTypeContextGenerator(args?: contexts.ContextEvent) {
    const context: SelfDescribingJson = {
      schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
      data: {
        osType: 'ubuntu',
        osVersion: '2018.04',
        deviceManufacturer: 'ASUS',
        deviceModel: args ? String(args['eventType']) : '',
      },
    };
    return context;
  }

  const bothRuleSet = {
    accept: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*'],
    reject: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*'],
  };

  const filterFunction = function (args?: contexts.ContextEvent) {
    return args?.eventType === 'ue';
  };

  const filterProvider: contexts.FilterProvider = [filterFunction, [geolocationContext, eventTypeContextGenerator]];
  const ruleSetProvider: contexts.RuleSetProvider = [bothRuleSet, [geolocationContext, eventTypeContextGenerator]];

  const contextArray = [filterProvider, ruleSetProvider, geolocationContext, eventTypeContextGenerator];
  const globalContexts = contexts.globalContexts();

  globalContexts.addGlobalContexts(contextArray);
  t.is(globalContexts.getGlobalPrimitives().length, 2, 'Correct number of primitives added');
  t.is(globalContexts.getConditionalProviders().length, 2, 'Correct number of conditional providers added');
});

test('Handle named global contexts', (t) => {
  const geolocationContext = {
    schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
    data: {
      latitude: 40.0,
      longitude: 55.1,
    },
  };

  function eventTypeContextGenerator(args?: contexts.ContextEvent) {
    const context: SelfDescribingJson = {
      schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
      data: {
        osType: 'ubuntu',
        osVersion: '2018.04',
        deviceManufacturer: 'ASUS',
        deviceModel: args ? String(args['eventType']) : '',
      },
    };
    return context;
  }

  const bothRuleSet = {
    accept: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*'],
    reject: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*'],
  };

  const filterFunction = function (args?: contexts.ContextEvent) {
    return args?.eventType === 'ue';
  };

  const filterProvider: contexts.FilterProvider = [filterFunction, [geolocationContext, eventTypeContextGenerator]];
  const ruleSetProvider: contexts.RuleSetProvider = [bothRuleSet, [geolocationContext, eventTypeContextGenerator]];

  const namedContexts = {
    filters: filterProvider,
    rules: ruleSetProvider,
    static: geolocationContext,
    generator: eventTypeContextGenerator,
  };
  const globalContexts = contexts.globalContexts();

  globalContexts.addGlobalContexts(namedContexts);
  t.is(globalContexts.getGlobalPrimitives().length, 2, 'Correct number of primitives added');
  t.is(globalContexts.getConditionalProviders().length, 2, 'Correct number of conditional providers added');

  globalContexts.removeGlobalContexts(['static', 'rules']);
  t.is(globalContexts.getGlobalPrimitives().length, 1, 'Correct number of primitives removed');
  t.is(globalContexts.getConditionalProviders().length, 1, 'Correct number of conditional providers removed');

  globalContexts.clearGlobalContexts();
  t.is(globalContexts.getGlobalPrimitives().length, 0, 'All primitives removed');
  t.is(globalContexts.getConditionalProviders().length, 0, 'All conditional providers removed');

  globalContexts.addGlobalContexts([geolocationContext]);
  globalContexts.addGlobalContexts({ geo: geolocationContext });
  t.is(globalContexts.getGlobalPrimitives().length, 2, 'Treats anonymous and named globals separately');

  const mutatedGeolocationContext = JSON.parse(JSON.stringify(geolocationContext));
  mutatedGeolocationContext.data.latitude = 30;

  globalContexts.addGlobalContexts({ geo: mutatedGeolocationContext });
  t.deepEqual(
    globalContexts.getGlobalPrimitives(),
    [geolocationContext, mutatedGeolocationContext],
    'Upserts named globals'
  );
});

test('Remove one of two global context primitives', (t) => {
  const geolocationContext = {
    schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
    data: {
      latitude: 40.0,
      longitude: 55.1,
    },
  };

  const webPageContext = {
    schema: 'iglu:org.schema/WebPage/jsonschema/1-0-0',
    data: {
      genre: 'test',
    },
  };

  const globalContexts = contexts.globalContexts();
  globalContexts.addGlobalContexts([geolocationContext, webPageContext]);
  globalContexts.removeGlobalContexts([geolocationContext]);
  t.deepEqual(globalContexts.getGlobalPrimitives(), [webPageContext]);
});

test('Remove one of two global context generators', (t) => {
  function a(): undefined {
    return;
  }
  function b(): undefined {
    return;
  }

  const globalContexts = contexts.globalContexts();
  globalContexts.addGlobalContexts([a, b]);
  t.deepEqual(globalContexts.getGlobalPrimitives(), [a, b]);
  globalContexts.removeGlobalContexts([a]);
  t.deepEqual(globalContexts.getGlobalPrimitives(), [b]);
});

test('Remove one of two global context conditional providers', (t) => {
  const geolocationContext = {
    schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
    data: {
      latitude: 40.0,
      longitude: 55.1,
    },
  };

  function eventTypeContextGenerator(args?: contexts.ContextEvent) {
    const context: SelfDescribingJson = {
      schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
      data: {
        osType: 'ubuntu',
        osVersion: '2018.04',
        deviceManufacturer: 'ASUS',
        deviceModel: args ? String(args['eventType']) : '',
      },
    };
    return context;
  }

  const bothRuleSet = {
    accept: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*'],
    reject: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*'],
  };

  const filterFunction = function (args?: contexts.ContextEvent) {
    return args?.eventType === 'ue';
  };

  const filterProvider: contexts.FilterProvider = [filterFunction, [geolocationContext, eventTypeContextGenerator]];
  const ruleSetProvider: contexts.RuleSetProvider = [bothRuleSet, [geolocationContext, eventTypeContextGenerator]];
  const globalContexts = contexts.globalContexts();

  globalContexts.addGlobalContexts([filterProvider, ruleSetProvider]);
  globalContexts.removeGlobalContexts([filterProvider]);
  t.deepEqual(globalContexts.getConditionalProviders(), [ruleSetProvider]);
});

test('Remove global contexts', (t) => {
  const geolocationContext = {
    schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
    data: {
      latitude: 40.0,
      longitude: 55.1,
    },
  };

  function eventTypeContextGenerator(args?: contexts.ContextEvent) {
    const context: SelfDescribingJson = {
      schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
      data: {
        osType: 'ubuntu',
        osVersion: '2018.04',
        deviceManufacturer: 'ASUS',
        deviceModel: args ? String(args['eventType']) : '',
      },
    };
    return context;
  }

  const bothRuleSet = {
    accept: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*'],
    reject: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*'],
  };

  const filterFunction = function (args?: contexts.ContextEvent) {
    return args?.eventType === 'ue';
  };

  const filterProvider: contexts.FilterProvider = [filterFunction, [geolocationContext, eventTypeContextGenerator]];
  const ruleSetProvider: contexts.RuleSetProvider = [bothRuleSet, [geolocationContext, eventTypeContextGenerator]];
  const globalContexts = contexts.globalContexts();

  globalContexts.addGlobalContexts([filterProvider, ruleSetProvider, geolocationContext, eventTypeContextGenerator]);
  globalContexts.removeGlobalContexts([filterProvider, geolocationContext, eventTypeContextGenerator]);
  t.is(globalContexts.getGlobalPrimitives().length, 0, 'Correct number of primitives added');
  t.is(globalContexts.getConditionalProviders().length, 1, 'Correct number of conditional providers added');
});

test('Clear global contexts', (t) => {
  const geolocationContext = {
    schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
    data: {
      latitude: 40.0,
      longitude: 55.1,
    },
  };

  function eventTypeContextGenerator(args?: contexts.ContextEvent) {
    const context: SelfDescribingJson = {
      schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
      data: {
        osType: 'ubuntu',
        osVersion: '2018.04',
        deviceManufacturer: 'ASUS',
        deviceModel: args ? String(args['eventType']) : '',
      },
    };
    return context;
  }

  const bothRuleSet = {
    accept: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*'],
    reject: ['iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*'],
  };

  const filterFunction = function (args?: contexts.ContextEvent) {
    return args?.eventType === 'ue';
  };

  const filterProvider: contexts.FilterProvider = [filterFunction, [geolocationContext, eventTypeContextGenerator]];
  const ruleSetProvider: contexts.RuleSetProvider = [bothRuleSet, [geolocationContext, eventTypeContextGenerator]];

  const contextArray = [filterProvider, ruleSetProvider, geolocationContext, eventTypeContextGenerator];
  const globalContexts = contexts.globalContexts();
  globalContexts.addGlobalContexts(contextArray);
  globalContexts.clearGlobalContexts();
  t.is(globalContexts.getGlobalPrimitives().length, 0, 'Correct number of primitives added');
  t.is(globalContexts.getConditionalProviders().length, 0, 'Correct number of conditional providers added');
});

test('Get applicable contexts', (t) => {
  const geolocationContext = {
    schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
    data: {
      latitude: 40.0,
      longitude: 55.1,
    },
  };

  function eventTypeContextGenerator(args?: contexts.ContextEvent) {
    const context: SelfDescribingJson = {
      schema: 'iglu:com.snowplowanalytics.snowplow/some_context/jsonschema/1-0-1',
      data: {
        osType: 'ubuntu',
        osVersion: '2018.04',
        deviceManufacturer: 'ASUS',
        eventType: args ? String(args['eventType']) : '',
      },
    };
    return context;
  }

  const selfDescribingEventRuleset = {
    accept: ['iglu:com.acme_company/*/jsonschema/*-*-*'],
  };

  const filterFunction = function (args?: contexts.ContextEvent) {
    return args?.eventType === 'ue';
  };

  const filterProvider: contexts.FilterProvider = [filterFunction, [geolocationContext, eventTypeContextGenerator]];
  const ruleSetProvider: contexts.RuleSetProvider = [
    selfDescribingEventRuleset,
    [geolocationContext, eventTypeContextGenerator],
  ];

  const contextArray = [filterProvider, ruleSetProvider, geolocationContext, eventTypeContextGenerator];
  const globalContexts = contexts.globalContexts();
  const event = payloadBuilder();
  event.add('e', 'ue');
  event.addJson('ue_px', 'ue_pr', {
    schema: 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0',
    data: {
      schema: 'iglu:com.acme_company/some_event/jsonschema/1-0-0',
      data: {},
    },
  });

  globalContexts.addGlobalContexts(contextArray);
  t.is(globalContexts.getApplicableContexts(event).length, 6);
});

test('Resolves context generators and static contexts', (t) => {
  const contextGenerator = () => {
    return {
      schema: 'iglu:com.acme.marketing/some_event/jsonschema/1-0-0',
      data: { test: 1 },
    };
  };
  const staticContext = {
    schema: 'iglu:com.acme.marketing/some_event/jsonschema/1-0-0',
    data: { test: 1 },
  };
  const expected = [contextGenerator(), staticContext];
  const actual = contexts.resolveDynamicContext([contextGenerator, staticContext]);
  t.deepEqual(actual, expected);
});

test('Resolves context generators with arguments', (t) => {
  const contextGenerator = (argOne: string, argTwo: string) => ({
    schema: 'iglu:com.acme.marketing/some_event/jsonschema/1-0-0',
    data: {
      firstVal: argOne,
      secondVal: argTwo,
    },
  });
  const expected = [
    {
      schema: 'iglu:com.acme.marketing/some_event/jsonschema/1-0-0',
      data: {
        firstVal: 1,
        secondVal: 2,
      },
    },
  ];
  const actual = contexts.resolveDynamicContext([contextGenerator], 1, 2);
  t.deepEqual(actual, expected);
});

test('Context generators which return empty are ignored', (t) => {
  const contextGenerator = () => null;
  const staticContext = {
    schema: 'iglu:com.acme.marketing/some_event/jsonschema/1-0-0',
    data: { test: 1 },
  };
  const expected = [staticContext];
  const actual = contexts.resolveDynamicContext([contextGenerator, staticContext]);
  t.deepEqual(actual, expected);
});

test('Plugins context should be combined with the passed context', (t) => {
  const initialContextArray = [
    {
      schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
      data: {
        latitude: 40.0,
        longitude: 55.1,
      },
    },
  ];

  const webPageContext = {
    schema: 'iglu:org.schema/WebPage/jsonschema/1-0-0',
    data: {
      genre: 'test',
    },
  };

  const webPagePlugin = {
    contexts: () => {
      return [webPageContext];
    },
  };

  const pluginContexts = contexts.pluginContexts([webPagePlugin]);
  const result = pluginContexts.addPluginContexts(initialContextArray);

  t.is(result.length, 2);
  t.deepEqual(result, [...initialContextArray, webPageContext]);
});

test('Do not mutate context when adding plugin context', (t) => {
  const initialContextArray = [
    {
      schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
      data: {
        latitude: 40.0,
        longitude: 55.1,
      },
    },
  ];

  const webPageContext = {
    schema: 'iglu:org.schema/WebPage/jsonschema/1-0-0',
    data: {
      genre: 'test',
    },
  };

  const webPagePlugin = {
    contexts: () => {
      return [webPageContext];
    },
  };

  const pluginContexts = contexts.pluginContexts([webPagePlugin]);
  pluginContexts.addPluginContexts(initialContextArray);

  t.is(initialContextArray.length, 1);
  t.deepEqual(initialContextArray, [
    {
      schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
      data: {
        latitude: 40.0,
        longitude: 55.1,
      },
    },
  ]);
});
