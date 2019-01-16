const assert = require('assert')
const describe = require('mocha').describe
const it = require('mocha').it
const beforeEach = require('mocha').beforeEach
const JSDOM = require('jsdom').JSDOM
const before = require('mocha').before
const after = require('mocha').after

const utilities = require('../../src/lib/Utilities.js')

describe('Helpers', function() {
    describe('Proxy Handling', function() {
        beforeEach(function() {
            global.document = {
                links: [{ href: 'http://www.example.com/' }],
                body: {
                    children: [
                        {
                            children: [
                                {
                                    children: [
                                        {
                                            children: [
                                                {
                                                    children: [
                                                        {
                                                            children: [
                                                                {
                                                                    innerHTML: 'You have reached the cached page for',
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            }
        })

        it('should except in special cases changes nothing', function() {
            var initialLocationArray = ['normalhostname', 'href', 'http://referrer.com'],
                fixedupLocationArray = utilities.fixupUrl.apply(null, initialLocationArray),
                expectedLocationArray = fixedupLocationArray,
                i

            for (i = 0; i < 3; i++) {
                assert.strictEqual(fixedupLocationArray[i], expectedLocationArray[i])
            }
        })

        it('should get the URL for the untranslated page from the querystring and make the translated page the referrer', function() {
            var initialLocationArray = [
                    'translate.googleusercontent.com',
                    'http://translate.googleusercontent.com/translate?hl=en&sl=fr&u=http:www.francais.fr/path',
                    '',
                ],
                fixedupLocationArray = utilities.fixupUrl.apply(null, initialLocationArray),
                expectedLocationArray = [
                    'www.francais.fr',
                    'http:www.francais.fr/path',
                    'http://translate.googleusercontent.com/translate?hl=en&sl=fr&u=http:www.francais.fr/path',
                ],
                i

            for (i = 0; i < 3; i++) {
                assert.strictEqual(fixedupLocationArray[i], expectedLocationArray[i])
            }
        })

        it('should on a page cached by Bing, get the original URL from the first link', function() {
            var initialLocationArray = [
                    'cc.bingj.com',
                    'http://cc.bingj.com/cache.aspx?q=example.com&d=4870936571937837&mkt=en-GB&setlang=en-GB&w=QyOPD1fo3C2nC9sXMLmUUs81Jt78MYIp',
                    'http://referrer.com',
                ],
                fixedupLocationArray = utilities.fixupUrl.apply(null, initialLocationArray),
                expectedLocationArray = ['www.example.com', 'http://www.example.com/', 'http://referrer.com'],
                i

            for (i = 0; i < 3; i++) {
                assert.strictEqual(fixedupLocationArray[i], expectedLocationArray[i])
            }
        })

        it('should on a page cached by Google, get the original URL from the first link', function() {
            var initialLocationArray = [
                    'webcache.googleusercontent.com',
                    'http://webcache.googleusercontent.com/search?q=cache:http://example.com/#fragment',
                    'http://referrer.com',
                ],
                fixedupLocationArray = utilities.fixupUrl.apply(null, initialLocationArray),
                expectedLocationArray = ['www.example.com', 'http://www.example.com/', 'http://referrer.com'],
                i

            for (i = 0; i < 3; i++) {
                assert.strictEqual(fixedupLocationArray[i], expectedLocationArray[i])
            }
        })

        it('should detect ip addresses properly', function() {
            var ipAddress = '10.10.10.10'
            var notIpAddress = 'any.other.host.name'
            assert(utilities.isIpAddress(ipAddress))
            assert(!utilities.isIpAddress(notIpAddress))
        })

        it('should on a page cached by Yahoo, get the original URL from the first link', function() {
            var initialLocationArray = ['98.139.21.31', 'http://98.139.21.31/search/srpcache', 'http://referrer.com'],
                fixedupLocationArray = utilities.fixupUrl.apply(null, initialLocationArray),
                expectedLocationArray = ['www.example.com', 'http://www.example.com/', 'http://referrer.com'],
                i

            for (i = 0; i < 3; i++) {
                assert.strictEqual(fixedupLocationArray[i], expectedLocationArray[i])
            }
        })
    })

    describe('Get Query String Value', function() {
        it('should return null if the url doesnt have a querystring', function() {
            var url = 'http://www.example.com'
            var expected = null
            var actual = utilities.fromQuerystring('test', url)
            assert.equal(actual, expected)
        })

        it('should return null if the querystring does not contain the field', function() {
            var url = 'http://www.example.com?test=working?&_sp=outdated?&?name=value#fragment?#?#'
            var expected = null

            var actual = utilities.fromQuerystring('invalid', url)
            assert.equal(actual, expected)
        })

        it('should return the value if the querystring does contain the field', function() {
            var url = 'http://www.example.com?test=working'
            var expected = 'working'

            var actual = utilities.fromQuerystring('test', url)
            assert.equal(actual, expected)
        })
    })

    describe('Decorate Query String', function() {
        it('should decorate a URL with no querystring or fragment', function() {
            var url = 'http://www.example.com'
            var expected = 'http://www.example.com?_sp=a.b'
            var actual = utilities.decorateQuerystring(url, '_sp', 'a.b')
            assert.equal(actual, expected)
        })

        it('should decorate a URL with a fragment but no querystring', function() {
            var url = 'http://www.example.com#fragment'
            var expected = 'http://www.example.com?_sp=a.b#fragment'
            var actual = utilities.decorateQuerystring(url, '_sp', 'a.b')
            assert.equal(actual, expected)
        })

        it('should decorate a URL with an empty querystring', function() {
            var url = 'http://www.example.com?'
            var expected = 'http://www.example.com?_sp=a.b'
            var actual = utilities.decorateQuerystring(url, '_sp', 'a.b')
            assert.equal(actual, expected)
        })

        it('should decorate a URL with a nonempty querystring', function() {
            var url = 'http://www.example.com?name=value'
            var expected = 'http://www.example.com?_sp=a.b&name=value'
            var actual = utilities.decorateQuerystring(url, '_sp', 'a.b')
            assert.equal(actual, expected)
        })

        it('should override an existing field', function() {
            var url = 'http://www.example.com?_sp=outdated'
            var expected = 'http://www.example.com?_sp=a.b'
            var actual = utilities.decorateQuerystring(url, '_sp', 'a.b')
            assert.equal(actual, expected)
        })

        it('should decorate a URL whose querystring contains multiple question marks', function() {
            var url = 'http://www.example.com?test=working?&name=value'
            var expected = 'http://www.example.com?_sp=a.b&test=working?&name=value'
            var actual = utilities.decorateQuerystring(url, '_sp', 'a.b')
            assert.equal(actual, expected)
        })

        it('should override a field in a querystring containing a question mark', function() {
            var url = 'http://www.example.com?test=working?&_sp=outdated'
            var expected = 'http://www.example.com?test=working?&_sp=a.b'
            var actual = utilities.decorateQuerystring(url, '_sp', 'a.b')
            assert.equal(actual, expected)
        })

        it('should decorate a querystring with multiple ?s and #s', function() {
            var url = 'http://www.example.com?test=working?&_sp=outdated?&?name=value#fragment?#?#'
            var expected = 'http://www.example.com?test=working?&_sp=a.b&?name=value#fragment?#?#'
            var actual = utilities.decorateQuerystring(url, '_sp', 'a.b')
            assert.equal(actual, expected)
        })
    })

    describe('Get CSS Classes', function() {
        it('should tokenize a DOM element\'s className field', function() {
            var element = {
                className: '   the  quick   brown_fox-jumps/over\nthe\t\tlazy   dog  ',
            }
            var expected = ['the', 'quick', 'brown_fox-jumps/over', 'the', 'lazy', 'dog']
            var actual = utilities.getCssClasses(element)
            assert.deepEqual(actual, expected)
        })

        it('should return an empty array when there are no classes on an element', function() {
            var element = { className: '' }

            var expected = []
            var actual = utilities.getCssClasses(element)
            assert.deepEqual(actual, expected)
        })
    })

    describe('Resolve Dynamic Contexts', function() {
        it('Resolves context generators and static contexts', function() {
            var contextGenerator = function() {
                return {
                    schema: 'iglu:com.acme.marketing/some_event/jsonschema/1-0-0',
                    data: { test: 1 },
                }
            }
            var staticContext = {
                schema: 'iglu:com.acme.marketing/some_event/jsonschema/1-0-0',
                data: { test: 1 },
            }

            var expected = [contextGenerator(), staticContext]
            var actual = utilities.resolveDynamicContexts([contextGenerator, staticContext])
            assert.deepEqual(actual, expected)
        })

        it('Resolves context generators with arguments', function() {
            var contextGenerator = function(argOne, argTwo) {
                return {
                    schema: 'iglu:com.acme.marketing/some_event/jsonschema/1-0-0',
                    data: {
                        firstVal: argOne,
                        secondVal: argTwo,
                    },
                }
            }

            var expected = [
                {
                    schema: 'iglu:com.acme.marketing/some_event/jsonschema/1-0-0',
                    data: {
                        firstVal: 1,
                        secondVal: 2,
                    },
                },
            ]
            var actual = utilities.resolveDynamicContexts([contextGenerator], 1, 2)
            assert.deepEqual(actual, expected)
        })
    })

    describe('Browser Helpers', function() {
        before(function() {
            delete this.testBrowser
            //This makes it easier to stub functions that exist in a browser and/or use real browser functions in tests
            this.testBrowser = new JSDOM('<html><body><title>Helpers Tests</title><div id=click_me></div></body></html>', {
                url: 'https://example.org/?name=value&referrer=previous#fragment',
                referrer: 'https://example.com/',
                contentType: 'text/html',
                storageQuota: 10000000,
                runScripts: 'outside-only',
            })
        })

        after(function() {
            delete this.testBrowser
        })

        it('Get page title', function() {
            global.document = this.testBrowser.window.document
            global.window = this.testBrowser.window
            const detectedTitle = utilities.fixupTitle(0)
            assert.strictEqual(detectedTitle, 'Helpers Tests', 'Get the page title')
        })

        it('Get host name', function() {
            global.document = this.testBrowser.window.document
            global.window = this.testBrowser.window
            const detectedHostName = utilities.getHostName(this.testBrowser.window.location.href)
            assert.strictEqual(detectedHostName, 'example.org', 'Get the host name')
        })

        it('Get referrer from querystring', function() {
            global.document = this.testBrowser.window.document
            global.window = this.testBrowser.window
            const detectedReferrer = utilities.getReferrer()
            assert.strictEqual(detectedReferrer, 'previous', 'Get the referrer from the querystring')
        })

        it('Add event listener', function() {
            global.document = this.testBrowser.window.document
            global.window = this.testBrowser.window
            global.window.hasBeenClicked = false
            utilities.addEventListener(this.testBrowser.window.document.getElementById('click_me'), 'click', function() {
                window.hasBeenClicked = true
            })
            this.testBrowser.window.document.getElementById('click_me').click()

            assert.strictEqual(this.testBrowser.window.hasBeenClicked, true, 'Add a click event listener')
        })
    })
})