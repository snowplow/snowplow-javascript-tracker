var assert = require('assert')
var describe = require('mocha').describe
var beforeEach = require('mocha').beforeEach
//var afterEach = require('mocha').afterEach
var it = require('mocha').it

const utilities = require('../../src/js/lib/Utilities')

module.exports = (function() {

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
                                                                innerHTML:
                                                                    'You have reached the cached page for',
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

    describe('Proxy Handling', function() {
        it('should except in special cases changes nothing', function() {
            var initialLocationArray = [
                    'normalhostname',
                    'href',
                    'http://referrer.com',
                ],
                fixedupLocationArray = utilities.fixupUrl.apply(
                    null,
                    initialLocationArray
                ),
                expectedLocationArray = fixedupLocationArray,
                i

            for (i = 0; i < 3; i++) {
                assert.strictEqual(
                    fixedupLocationArray[i],
                    expectedLocationArray[i]                    
                )
            }
        })

        it('should get the URL for the untranslated page from the querystring and make the translated page the referrer', function() {
            var initialLocationArray = [
                    'translate.googleusercontent.com',
                    'http://translate.googleusercontent.com/translate?hl=en&sl=fr&u=http:www.francais.fr/path',
                    '',
                ],
                fixedupLocationArray = utilities.fixupUrl.apply(
                    null,
                    initialLocationArray
                ),
                expectedLocationArray = [
                    'www.francais.fr',
                    'http:www.francais.fr/path',
                    'http://translate.googleusercontent.com/translate?hl=en&sl=fr&u=http:www.francais.fr/path',
                ],
                i

            for (i = 0; i < 3; i++) {
                assert.strictEqual(
                    fixedupLocationArray[i],
                    expectedLocationArray[i]                    
                )
            }
        })

        it('should on a page cached by Bing, get the original URL from the first link', function() {
            var initialLocationArray = [
                    'cc.bingj.com',
                    'http://cc.bingj.com/cache.aspx?q=example.com&d=4870936571937837&mkt=en-GB&setlang=en-GB&w=QyOPD1fo3C2nC9sXMLmUUs81Jt78MYIp',
                    'http://referrer.com',
                ],
                fixedupLocationArray = utilities.fixupUrl.apply(
                    null,
                    initialLocationArray
                ),
                expectedLocationArray = [
                    'www.example.com',
                    'http://www.example.com/',
                    'http://referrer.com',
                ],
                i

            for (i = 0; i < 3; i++) {
                assert.strictEqual(
                    fixedupLocationArray[i],
                    expectedLocationArray[i]                    
                )
            }
        })

        it('should on a page cached by Google, get the original URL from the first link', function() {
            var initialLocationArray = [
                    'webcache.googleusercontent.com',
                    'http://webcache.googleusercontent.com/search?q=cache:http://example.com/#fragment',
                    'http://referrer.com',
                ],
                fixedupLocationArray = utilities.fixupUrl.apply(
                    null,
                    initialLocationArray
                ),
                expectedLocationArray = [
                    'www.example.com',
                    'http://www.example.com/',
                    'http://referrer.com',
                ],
                i

            for (i = 0; i < 3; i++) {
                assert.strictEqual(
                    fixedupLocationArray[i],
                    expectedLocationArray[i]                    
                )
            }
        })

        it('should detect ip addresses properly', function() {
            var ipAddress = '10.10.10.10'
            var notIpAddress = 'any.other.host.name'
            assert(utilities.isIpAddress(ipAddress))
            assert(!utilities.isIpAddress(notIpAddress))
        })

        it('should on a page cached by Yahoo, get the original URL from the first link', function() {
            var initialLocationArray = [
                    '98.139.21.31',
                    'http://98.139.21.31/search/srpcache',
                    'http://referrer.com',
                ],
                fixedupLocationArray = utilities.fixupUrl.apply(
                    null,
                    initialLocationArray
                ),
                expectedLocationArray = [
                    'www.example.com',
                    'http://www.example.com/',
                    'http://referrer.com',
                ],
                i

            for (i = 0; i < 3; i++) {
                assert.strictEqual(
                    fixedupLocationArray[i],
                    expectedLocationArray[i]                   
                )
            }
        })
    })
})()
