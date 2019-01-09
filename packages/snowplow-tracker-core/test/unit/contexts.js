/*
 * JavaScript tracker core for Snowplow: tests/integration.js
 *
 * Copyright (c) 2014-2016 Snowplow Analytics Ltd. All rights reserved.
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

/* globals eventType */
const assert = require('chai').assert
const describe = require('mocha').describe
const it = require('mocha').it

const contexts = require('../../src/contexts')
const payload = require('../../src/payload')

module.exports = (function() {
    describe('Context Tests', function() {
        
        it('Identify context primitives', function() {
            let geolocationContext = {
                schema:
                    'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
                data: {
                    latitude: 40.0,
                    longitude: 55.1,
                },
            }

            function eventTypeContextGenerator(args) {
                let context = {}
                context['schema'] =
                    'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1'
                context['data']['osType'] = 'ubuntu'
                context['data']['osVersion'] = '2018.04'
                context['data']['deviceManufacturer'] = 'ASUS'
                context['data']['deviceModel'] = String(args[eventType])
                return context
            }

            assert.isTrue(
                contexts.isContextPrimitive(geolocationContext),
                'A context primitive should be identified'
            )
            assert.isTrue(
                contexts.isContextPrimitive(eventTypeContextGenerator),
                'A context primitive should be identified'
            )
        })

        it('Validating vendors', function() {
            // Vendor validation
            assert.isTrue(
                contexts.validateVendor('com.acme.marketing'),
                'A valid vendor without wildcard is accepted'
            )
            assert.isTrue(
                contexts.validateVendor('com.acme.*'),
                'A valid vendor with wildcard is accepted'
            )
            assert.isFalse(
                contexts.validateVendor('*.acme.*'),
                'A vendor starting with asterisk is rejected'
            )
            assert.isFalse(
                contexts.validateVendor('com.acme.*.marketing'),
                'A vendor with asterisk out of order is rejected'
            )
        })

        it('Identify rule sets', function() {
            const acceptRuleSet = {
                accept: [
                    'iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*',
                ],
            }

            const rejectRuleSet = {
                reject: [
                    'iglu:com.snowplowanalytics.snowplow/*/jsonschema/1-0-1',
                ],
            }

            const bothRuleSet = {
                accept: [
                    'iglu:com.snowplowanalytics.snowplow/*/jsonschema/1-*-1',
                ],
                reject: [
                    'iglu:com.snowplowanalytics.snowplow/some_event/jsonschema/1-*-*',
                ],
            }

            const pageview_schema =
                'iglu:com.snowplowanalytics.snowplow/pageview/jsonschema/1-0-1'

            assert.isTrue(
                contexts.isValidRule(acceptRuleSet.accept[0]),
                'All rule elements are correctly identified as valid rules'
            )
            assert.isTrue(
                contexts.isValidRuleSetArg(acceptRuleSet.accept),
                'A rule set arg is correctly identified'
            )
            assert.isTrue(
                contexts.isRuleSet(acceptRuleSet),
                'An accept rule set is identified'
            )
            assert.isTrue(
                contexts.isRuleSet(rejectRuleSet),
                'A reject rule set is identified'
            )
            assert.isTrue(
                contexts.isRuleSet(bothRuleSet),
                'A rule set with both elements is identified'
            )
            assert.deepEqual(
                contexts.getSchemaParts(pageview_schema),
                [
                    'com.snowplowanalytics.snowplow',
                    'pageview',
                    '1',
                    '0',
                    '1',
                ],
                'Gets correct parts for schema'
            )
            assert.isTrue(
                contexts.matchSchemaAgainstRule(
                    'iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*',
                    pageview_schema
                ),
                'Matches schema against wildcarded rule'
            )
            assert.isTrue(
                contexts.matchSchemaAgainstRuleSet(
                    acceptRuleSet,
                    pageview_schema
                ),
                'Accept rule set accepts matching schema'
            )
            assert.isFalse(
                contexts.matchSchemaAgainstRuleSet(
                    rejectRuleSet,
                    pageview_schema
                ),
                'Reject rule set rejects matching schema'
            )
        })

        it('Identify filter function', function() {
            let filterFunction = function(args) {
                return args['eventType'] === 'ue'
            }

            assert.isTrue(
                contexts.isContextFilter(filterFunction),
                'A valid filter function is identified'
            )
        })

        it('Identify rule set provider', function() {
            let bothRuleSet = {
                accept: [
                    'iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*',
                ],
                reject: [
                    'iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*',
                ],
            }

            let geolocationContext = {
                schema:
                    'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
                data: {
                    latitude: 40.0,
                    longitude: 55.1,
                },
            }

            function eventTypeContextGenerator(args) {
                let context = {}
                context['schema'] =
                    'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1'
                context['data']['osType'] = 'ubuntu'
                context['data']['osVersion'] = '2018.04'
                context['data']['deviceManufacturer'] = 'ASUS'
                context['data']['deviceModel'] = String(args[eventType])
                return context
            }

            let ruleSetProvider = [
                bothRuleSet,
                [geolocationContext, eventTypeContextGenerator],
            ]
            assert.isTrue(
                contexts.isRuleSetProvider(ruleSetProvider),
                'Valid rule set provider is correctly identified'
            )
        })

        it('Identify filter provider', function() {
            let filterFunction = function(args) {
                return args['eventType'] === 'ue'
            }

            let geolocationContext = {
                schema:
                    'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
                data: {
                    latitude: 40.0,
                    longitude: 55.1,
                },
            }

            function eventTypeContextGenerator(args) {
                let context = {}
                context['schema'] =
                    'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1'
                context['data']['osType'] = 'ubuntu'
                context['data']['osVersion'] = '2018.04'
                context['data']['deviceManufacturer'] = 'ASUS'
                context['data']['deviceModel'] = String(args[eventType])
                return context
            }

            let filterProvider = [
                filterFunction,
                [geolocationContext, eventTypeContextGenerator],
            ]
            assert.isTrue(
                contexts.isFilterProvider(filterProvider),
                'A valid filter provider is identified'
            )
        })

        it('Add global contexts', function() {
            let geolocationContext = {
                schema:
                    'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
                data: {
                    latitude: 40.0,
                    longitude: 55.1,
                },
            }

            function eventTypeContextGenerator(args) {
                let context = {}
                context['schema'] =
                    'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1'
                context['data']['osType'] = 'ubuntu'
                context['data']['osVersion'] = '2018.04'
                context['data']['deviceManufacturer'] = 'ASUS'
                context['data']['deviceModel'] = String(args[eventType])
                return context
            }

            let bothRuleSet = {
                accept: [
                    'iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*',
                ],
                reject: [
                    'iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*',
                ],
            }

            let filterFunction = function(args) {
                return args['eventType'] === 'ue'
            }

            let filterProvider = [
                filterFunction,
                [geolocationContext, eventTypeContextGenerator],
            ]
            let ruleSetProvider = [
                bothRuleSet,
                [geolocationContext, eventTypeContextGenerator],
            ]

            let contextArray = [
                filterProvider,
                ruleSetProvider,
                geolocationContext,
                eventTypeContextGenerator,
            ]
            let module = contexts.contextModule()

            module.addGlobalContexts(contextArray)
            assert.strictEqual(
                module.getGlobalPrimitives().length,
                2,
                'Correct number of primitives added'
            )
            assert.strictEqual(
                module.getConditionalProviders().length,
                2,
                'Correct number of conditional providers added'
            )
        })

        it('Remove global contexts', function() {
            let geolocationContext = {
                schema:
                    'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
                data: {
                    latitude: 40.0,
                    longitude: 55.1,
                },
            }

            function eventTypeContextGenerator(args) {
                let context = {}
                context['schema'] =
                    'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1'
                context['data']['osType'] = 'ubuntu'
                context['data']['osVersion'] = '2018.04'
                context['data']['deviceManufacturer'] = 'ASUS'
                context['data']['deviceModel'] = String(args[eventType])
                return context
            }

            let bothRuleSet = {
                accept: [
                    'iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*',
                ],
                reject: [
                    'iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*',
                ],
            }

            let filterFunction = function(args) {
                return args['eventType'] === 'ue'
            }

            let filterProvider = [
                filterFunction,
                [geolocationContext, eventTypeContextGenerator],
            ]
            let ruleSetProvider = [
                bothRuleSet,
                [geolocationContext, eventTypeContextGenerator],
            ]
            let module = contexts.contextModule()

            module.addGlobalContexts([
                filterProvider,
                ruleSetProvider,
                geolocationContext,
                eventTypeContextGenerator,
            ])
            module.removeGlobalContexts([
                filterProvider,
                geolocationContext,
                eventTypeContextGenerator,
            ])
            assert.strictEqual(
                module.getGlobalPrimitives().length,
                0,
                'Correct number of primitives added'
            )
            assert.strictEqual(
                module.getConditionalProviders().length,
                1,
                'Correct number of conditional providers added'
            )
        })

        it('Clear global contexts', function() {
            let geolocationContext = {
                schema:
                    'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
                data: {
                    latitude: 40.0,
                    longitude: 55.1,
                },
            }

            function eventTypeContextGenerator(args) {
                let context = {}
                context['schema'] =
                    'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1'
                context['data']['osType'] = 'ubuntu'
                context['data']['osVersion'] = '2018.04'
                context['data']['deviceManufacturer'] = 'ASUS'
                context['data']['deviceModel'] = String(args[eventType])
                return context
            }

            let bothRuleSet = {
                accept: [
                    'iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*',
                ],
                reject: [
                    'iglu:com.snowplowanalytics.snowplow/*/jsonschema/*-*-*',
                ],
            }

            let filterFunction = function(args) {
                return args['eventType'] === 'ue'
            }

            let filterProvider = [
                filterFunction,
                [geolocationContext, eventTypeContextGenerator],
            ]
            let ruleSetProvider = [
                bothRuleSet,
                [geolocationContext, eventTypeContextGenerator],
            ]

            let contextArray = [
                filterProvider,
                ruleSetProvider,
                geolocationContext,
                eventTypeContextGenerator,
            ]
            let module = contexts.contextModule()
            module.addGlobalContexts(contextArray)
            module.clearGlobalContexts()
            assert.strictEqual(
                module.getGlobalPrimitives().length,
                0,
                'Correct number of primitives added'
            )
            assert.strictEqual(
                module.getConditionalProviders().length,
                0,
                'Correct number of conditional providers added'
            )
        })

        it('Get applicable contexts', function() {
            let geolocationContext = {
                schema:
                    'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
                data: {
                    latitude: 40.0,
                    longitude: 55.1,
                },
            }

            function eventTypeContextGenerator(args) {
                let context = {}
                context['schema'] =
                    'iglu:com.snowplowanalytics.snowplow/some_context/jsonschema/1-0-1'
                context['data'] = {}
                context['data']['osType'] = 'ubuntu'
                context['data']['osVersion'] = '2018.04'
                context['data']['deviceManufacturer'] = 'ASUS'
                context['data']['eventType'] = String(args['eventType'])
                return context
            }

            let unstructuredEventRuleset = {
                accept: ['iglu:com.acme_company/*/jsonschema/*-*-*'],
            }

            let filterFunction = function(args) {
                return args['eventType'] === 'ue'
            }

            let filterProvider = [
                filterFunction,
                [geolocationContext, eventTypeContextGenerator],
            ]
            let ruleSetProvider = [
                unstructuredEventRuleset,
                [geolocationContext, eventTypeContextGenerator],
            ]

            let eventJson = {
                e: 'ue',
                ue_px: {
                    schema:
                        'iglu:com.snowplowanalytics.snowplow/unstructured_event/jsonschema/1-0-0',
                    data: {
                        schema:
                            'iglu:com.acme_company/some_event/jsonschema/1-0-0',
                        data: {},
                    },
                },
            }
            let contextArray = [
                filterProvider,
                ruleSetProvider,
                geolocationContext,
                eventTypeContextGenerator,
            ]
            let module = contexts.contextModule()
            let event = payload.payloadBuilder(false)
            for (let property in eventJson) {
                if (eventJson.hasOwnProperty(property)) {
                    event.add(property, eventJson[property])
                }
            }

            module.addGlobalContexts(contextArray)
            assert.strictEqual(
                module.getApplicableContexts(event).length,
                6,
                'Correct number of contexts returned'
            )
        })

    })
})()