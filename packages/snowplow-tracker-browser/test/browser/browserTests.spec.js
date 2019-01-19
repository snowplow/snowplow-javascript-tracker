/* globals Buffer, __dirname, browser $*/
const describe = require('mocha').describe
//const beforeEach = require('mocha').beforeEach
const before = require('mocha').before
const after = require('mocha').after
//const afterEach = require('mocha').afterEach
const it = require('mocha').it
const assert = require('chai').assert
const jsBase64 = require('js-base64')
const lodash = require('lodash')
const Express = require('express')
const express = Express()
const path = require('path')
const url = require('url')
const integrationTestPage = require('../mocks/testPages').integrationTestPage
express.use(Express.static('../temp/'))
let server
/**
 * Expected amount of request for each browser
 * This must be increased when new tracking call added to
 * pages/integration-template.html
 */
var log = [] 

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

function someTestsFailed(suite) {
    return lodash.some(suite.tests, function(test) {
        return test.error !== null
    })
}

const setupMockCollector = () => {
    return new Promise((resolve, reject) => {

        express.get('/i', function (req, res) {
            //if (req.method === 'GET') {
            var payload = url.parse(req.url, true).query
            log.push(payload)
            //}
            res.status(200).type('gif').send(new Buffer.from('47494638396101000100800000dbdfef00000021f90401000000002c00000000010001000002024401003b', 'hex'))
        })

        express.use('/js', Express.static(path.join(__dirname, '../../dist/min')))
        
        express.get('/', function (req, res) {
            res.status(200).type('html').send(integrationTestPage)
        })

        try {
            server = express.listen(8081, () => {            
                resolve()
            })
        } catch(e) {
            reject(e)
        }
    })
}

const shutdownExpress = () => {
    return new Promise((resolve)=>{
        server.close(()=>{
            resolve()
        })
    })
}

const decodeBase64 = jsBase64.Base64.fromBase64

describe('Test that request_recorder logs meet expectations', function() {

    before(async function() {

        try {
            await setupMockCollector()
        } catch(e){
            throw(e)
        }
      
        await browser.url('http://127.0.0.1:8081/')
        await browser.pause(1000)
    })

    after(function() {
        //await global.browser.deleteSession()
        //shutdownExpress()
    })

    it('Check existence of page view in log', function() {
        //return browser.debug()
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
        this.skip()
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
        this.skip()
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