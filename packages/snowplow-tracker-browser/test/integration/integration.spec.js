/* globals Buffer */
const describe = require('mocha').describe
const before = require('mocha').before
const after = require('mocha').after
const it = require('mocha').it
const assert = require('chai').assert
const jsBase64 = require('js-base64')
const lodash = require('lodash')
const url = require('url')
const jsdom = require('jsdom')
const JSDOM = jsdom.JSDOM
const { Script } = require('vm');
const decodeBase64 = jsBase64.Base64.fromBase64

/**
 * Expected amount of request for each browser
 * This must be increased when new tracking call added to
 * pages/integration-template.html
 */
const log = []

class MockImageLoader extends jsdom.ResourceLoader {
    fetch(incomingUrl) {
        var payload = url.parse(incomingUrl, true).query
        log.push(payload/*? $.ue*/)
        return Promise.resolve(Buffer.from('47494638396101000100800000dbdfef00000021f90401000000002c00000000010001000002024401003b', 'hex'))
    }
}

function pageViewsHaveDifferentIds() {
    var pageViews = lodash.filter(log, function(logLine) {
        return logLine.e === 'pv'
    })
    var contexts = lodash.map(pageViews, function(logLine) {
        var data = JSON.parse(decodeBase64(logLine.cx)).data
        return lodash.find(data, function(context) {
            return context.schema === 'iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0'
        })
    })
    var ids = lodash.map(contexts, function(wpContext) {
        return wpContext.data.id
    })

    return lodash.uniq(ids).length >= 2
}

/**
 * Check if expected payload exists in `log`
 */
function checkExistenceOfExpectedQuerystring(expected) {
    function compare(e, other) {
        // e === expected
        var result = lodash.map(e, function(v, k) {
            if (lodash.isFunction(v)) {
                return v(other[k])
            } else {
                return lodash.isEqual(v, other[k])
            }
        })
        return lodash.every(result)
    }

    function strip(logLine) {
        var expectedKeys = lodash.keys(expected)
        var stripped = lodash.pickBy(logLine, function(v, k) {
            return lodash.includes(expectedKeys, k)
        })
        if (lodash.keys(stripped).length !== expectedKeys.length) {
            return null
        } else {
            return stripped
        }
    }
    //console.log('----------log-----------')
    return lodash.some(log, function(logLine) {
        var stripped = strip(logLine)
        if (stripped == null) {
            return false
        } else {
            return lodash.isEqualWith(expected, stripped, compare)
        }
    })
}

const mockTag = function(p, l, o, w, i/*, n, g*/) {
    'p:nomunge, l:nomunge, o:nomunge, w:nomunge, i:nomunge, n:nomunge, g:nomunge'

    // Stop if the Snowplow namespace i already exists
    if (!p[i]) {
        // Initialise the 'GlobalSnowplowNamespace' array
        p['GlobalSnowplowNamespace'] = p['GlobalSnowplowNamespace'] || []

        // Add the new Snowplow namespace to the global array so sp.js can find it
        p['GlobalSnowplowNamespace'].push(i)

        // Create the Snowplow function
        p[i] = function() {
            (p[i].q = p[i].q || []).push(arguments)
        }

        // Initialise the asynchronous queue
        p[i].q = p[i].q || []

        // Create a new script element
        //n = l.createElement(o)

        // Get the first script on the page
        //g = l.getElementsByTagName(o)[0]

        // The new script should load asynchronously
        //n.async = 1

        // Load Snowplow
        //n.src = w

        // Insert the Snowplow script before every other script so it executes as soon as possible
        //g.parentNode.insertBefore(n, g)
    }
}

const mockSnowplowRequests = function() {
    window.snowplow('newTracker', 'cf', '127.0.0.1:8181', {
        encodeBase64: true,
        appId: 'CFe23a',
        platform: 'mob',
        contexts: {
            webPage: true,
        },
    })
    // Add a global context
    var geolocationContext = {
        schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
        data: {
            latitude: 40.0,
            longitude: 55.1,
        },
    }
    function eventTypeContextGenerator(args) {
        var context = {}
        context['schema'] = 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1'
        context['data'] = {}
        context['data']['osType'] = 'ubuntu'
        context['data']['osVersion'] = '2018.04'
        context['data']['deviceManufacturer'] = 'ASUS'
        context['data']['deviceModel'] = String(args['eventType'])
        return context
    }
    // A filter that will only attach contexts to structured events
    function structuredEventFilter(args) {
        return args['eventType'] === 'se'
    }
    function erroneousContextGenerator() {
        return {}
    }
    window.snowplow('addGlobalContexts', [erroneousContextGenerator])
    window.snowplow('addGlobalContexts', [[structuredEventFilter, [eventTypeContextGenerator, geolocationContext]]])
    window.snowplow('setUserId', 'Malcolm')
    window.snowplow('trackPageView', 'My Title', [
        // Auto-set page title; add page context
        {
            schema: 'iglu:com.example_company/user/jsonschema/2-0-0',
            data: {
                userType: 'tester',
            },
        },
    ])

    // This should have different pageViewId in web_page context
    window.snowplow('trackPageView')
    window.snowplow('trackStructEvent', 'Mixes', 'Play', 'MRC/fabric-0503-mix', '', '0.0')
    window.snowplow(
        'trackUnstructEvent',
        {
            schema: 'iglu:com.acme_company/viewed_product/jsonschema/5-0-0',
            data: {
                productId: 'ASO01043',
            },
        },
        [],
        { type: 'ttm', value: 1477401868 }
    )
    var orderId = 'order-123'
    window.snowplow('addTrans', orderId, 'acme', '8000', '100', '50', 'phoenix', 'arizona', 'USA', 'JPY')

    // addItem might be called for each item in the shopping cart,
    // or not at all.
    window.snowplow('addItem', orderId, '1001', 'Blue t-shirt', 'clothing', '2000', '2', 'JPY')

    // trackTrans sends the transaction to Snowplow tracking servers.
    // Must be called last to commit the transaction.
    window.snowplow('trackTrans')

    var testAcceptRuleSet = {
        accept: ['iglu:com.acme_company/*/jsonschema/*-*-*'],
    }
    var testRejectRuleSet = {
        reject: ['iglu:com.acme_company/*/jsonschema/*-*-*'],
    }
    // test context rulesets
    window.snowplow('addGlobalContexts', [[testAcceptRuleSet, [eventTypeContextGenerator, geolocationContext]]])

    window.snowplow(
        'trackUnstructEvent',
        {
            schema: 'iglu:com.acme_company/viewed_product/jsonschema/5-0-0',
            data: {
                productId: 'ASO01042',
            },
        },
        [],
        { type: 'ttm', value: 1477401869 }
    )

    window.snowplow('removeGlobalContexts', [[testAcceptRuleSet, [eventTypeContextGenerator, geolocationContext]]])
    window.snowplow('addGlobalContexts', [[testRejectRuleSet, [eventTypeContextGenerator, geolocationContext]]])
    window.snowplow(
        'trackUnstructEvent',
        {
            schema: 'iglu:com.acme_company/viewed_product/jsonschema/5-0-0',
            data: {
                productId: 'ASO01041',
            },
        },
        [],
        { type: 'ttm', value: 1477401868 }
    )

    // track unhandled exception
    window.snowplow('enableErrorTracking')
    const s = new Script('function raiseException() { fakeObject.fakeThing() } window.setTimeout(raiseException, 1);')
           
    try{
        global.browser.runVMScript(s)
    } catch(e) {
        //we want to swallow this so that it doesn't show up in the test console.
    }
}


describe('Integration', async function() {
    describe('Test that request_recorder logs meet expectations', async function() {
        
        before(async function() {
            const resourceLoader = new MockImageLoader({
                proxy: 'http://127.0.0.1:9001',
                strictSSL: false
            })
    
            const browser = new JSDOM('<html><body></body></html>', {
                url: 'http://example.org/',
                referrer: 'http://example.com/',
                //domain:'example.com',
                contentType: 'text/html',
                storageQuota: 10000000,
                pretendToBeVisual: true,
                resources: resourceLoader,
                runScripts: 'outside-only'
            })
    
            global.browser = browser
            global.window = browser.window
            global.navigator = browser.window.navigator
            global.screen = browser.window.screen
            global.document = browser.window.document
            global.document.domain = 'example.com'
            global.window.onerror = function(e){
                return true
            }

            mockTag(window, document, 'script', '//d1fc8wv8zag5ca.cloudfront.net/2/sp.js', 'snowplow')
            require('../../src/init')
            mockSnowplowRequests()
        })
    
        after(async function(){
            delete global.window
            delete global.navigator
            delete global.screen
            delete global.document
            delete global.browser
        })
    
        it('Check existence of page view in log', function() {
            return assert.isTrue(
                checkExistenceOfExpectedQuerystring({
                    e: 'pv',
                    p: 'mob',
                    aid: 'CFe23a',
                    uid: 'Malcolm',
                    page: 'My Title',
                    cx: function(cx) {
                        var contexts = JSON.parse(decodeBase64(cx)).data
                        return lodash.some(
                            contexts,
                            lodash.matches({
                                schema: 'iglu:com.example_company/user/jsonschema/2-0-0',
                                data: {
                                    userType: 'tester',
                                },
                            })
                        )
                    },
                }),
                'A page view should be detected'
            )
        })
    
        it('Check nonexistence of nonexistent event types in log', function() {
            assert.isFalse(
                checkExistenceOfExpectedQuerystring({
                    e: 'ad',
                }),
                'No nonexistent event type should be detected'
            )
        })
    
        it('Check a structured event was sent', function() {
            assert.isTrue(
                checkExistenceOfExpectedQuerystring({
                    e: 'se',
                    se_ca: 'Mixes',
                    se_ac: 'Play',
                    se_la: 'MRC/fabric-0503-mix',
                    se_va: '0.0',
                }),
                'A structured event should be detected'
            )
        })
    
        it('Check an unstructured event with true timestamp was sent', function() {
            assert.isTrue(
                checkExistenceOfExpectedQuerystring({
                    e: 'ue',
                    ue_px:
                        'eyJzY2hlbWEiOiJpZ2x1OmNvbS5zbm93cGxvd2FuYWx5dGljcy5zbm93cGxvdy91bnN0cnVjdF9ldmVudC9qc29uc2NoZW1hLzEtMC0wIiwiZGF0YSI6eyJzY2hlbWEiOiJpZ2x1OmNvbS5hY21lX2NvbXBhbnkvdmlld2VkX3Byb2R1Y3QvanNvbnNjaGVtYS81LTAtMCIsImRhdGEiOnsicHJvZHVjdElkIjoiQVNPMDEwNDMifX19',
                    ttm: '1477401868',
                }),
                'An unstructured event should be detected'
            )
        })
    
        it('Check a transaction event was sent', function() {
            assert.isTrue(
                checkExistenceOfExpectedQuerystring({
                    e: 'tr',
                    tr_id: 'order-123',
                    tr_af: 'acme',
                    tr_tt: '8000',
                    tr_tx: '100',
                    tr_ci: 'phoenix',
                    tr_st: 'arizona',
                    tr_co: 'USA',
                    tr_cu: 'JPY',
                }),
                'A transaction event should be detected'
            )
        })
    
        it('Check a transaction item event was sent', function() {
            assert.isTrue(
                checkExistenceOfExpectedQuerystring({
                    e: 'ti',
                    ti_id: 'order-123',
                    ti_sk: '1001',
                    ti_nm: 'Blue t-shirt',
                    ti_ca: 'clothing',
                    ti_pr: '2000',
                    ti_qu: '2',
                    ti_cu: 'JPY',
                }),
                'A transaction item event should be detected'
            )
        })
    
        it('Check an unhandled exception was sent', function() {
         
            assert.isTrue(
                checkExistenceOfExpectedQuerystring({
                    ue_px: function(ue) {
                        var event = JSON.parse(decodeBase64(ue)).data
    
                        // We cannot test more because implementations vary much in old browsers (FF27,IE9)
                        return (
                            event.schema === 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1' &&
                            event.data.programmingLanguage === 'JAVASCRIPT' &&
                            event.data.message != null
                        )
                    },
                })
            )
        })
    
        it('Check pageViewId is regenerated for each trackPageView', function() {
            assert.isTrue(pageViewsHaveDifferentIds())
        })
    
        it('Check global contexts are for structured events', function() {
            assert.isTrue(
                checkExistenceOfExpectedQuerystring({
                    e: 'se',
                    cx: function(cx) {
                        var contexts = JSON.parse(decodeBase64(cx)).data
                        return (
                            2 ===
                            lodash.size(
                                lodash.filter(
                                    contexts,
                                    lodash.overSome(
                                        lodash.matches({
                                            schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
                                            data: {
                                                osType: 'ubuntu',
                                            },
                                        }),
                                        lodash.matches({
                                            schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
                                            data: {
                                                latitude: 40.0,
                                                longitude: 55.1,
                                            },
                                        })
                                    )
                                )
                            )
                        )
                    },
                })
            )
        })
    
        it('Check an unstructured event with global context from accept ruleset', function() {
            assert.isTrue(
                checkExistenceOfExpectedQuerystring({
                    e: 'ue',
                    ue_px: function(ue_px) {
                        var event = JSON.parse(decodeBase64(ue_px)).data
                        return lodash.isMatch(event, {
                            schema: 'iglu:com.acme_company/viewed_product/jsonschema/5-0-0',
                            data: {
                                productId: 'ASO01042',
                            },
                        })
                    },
                    cx: function(cx) {
                        var contexts = JSON.parse(decodeBase64(cx)).data
                        return (
                            2 ===
                            lodash.size(
                                lodash.filter(
                                    contexts,
                                    lodash.overSome(
                                        lodash.matches({
                                            schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
                                            data: {
                                                osType: 'ubuntu',
                                            },
                                        }),
                                        lodash.matches({
                                            schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
                                            data: {
                                                latitude: 40.0,
                                                longitude: 55.1,
                                            },
                                        })
                                    )
                                )
                            )
                        )
                    },
                }),
                'An unstructured event with global contexts should be detected'
            )
        })
    
        it('Check an unstructured event missing global context from reject ruleset', function() {
            assert.isTrue(
                checkExistenceOfExpectedQuerystring({
                    e: 'ue',
                    ue_px: function(ue_px) {
                        var event = JSON.parse(decodeBase64(ue_px)).data
                        return lodash.isMatch(event, {
                            schema: 'iglu:com.acme_company/viewed_product/jsonschema/5-0-0',
                            data: {
                                productId: 'ASO01041',
                            },
                        })
                    },
                    cx: function(cx) {
                        var contexts = JSON.parse(decodeBase64(cx)).data
                        return (
                            0 ===
                            lodash.size(
                                lodash.filter(
                                    contexts,
                                    lodash.overSome(
                                        lodash.matches({
                                            schema: 'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-1',
                                            data: {
                                                osType: 'ubuntu',
                                            },
                                        }),
                                        lodash.matches({
                                            schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
                                            data: {
                                                latitude: 40.0,
                                                longitude: 55.1,
                                            },
                                        })
                                    )
                                )
                            )
                        )
                    },
                }),
                'An unstructured event without global contexts should be detected'
            )
        })
    })
})


