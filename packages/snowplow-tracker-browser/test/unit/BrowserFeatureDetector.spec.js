const assert = require('assert')
const describe = require('mocha').describe
const beforeEach = require('mocha').beforeEach
const before = require('mocha').before
const after = require('mocha').after
const afterEach = require('mocha').afterEach
const it = require('mocha').it
const JSDOM = require('jsdom').JSDOM
const sinon = require('sinon')

describe('Detectors', function() {
    const BrowserFeatureDetector = require('../../src/lib/BrowserFeatureDetector').default

    before(function() {
        delete this.testBrowser
        //This makes it easier to stub functions that exist in a browser and/or use real browser functions in tests
        this.testBrowser = new JSDOM('<html><body></body></html>', {
            url: 'https://example.org/',
            referrer: 'https://example.com/',
            contentType: 'text/html',
            storageQuota: 10000000,
        })
    })

    after(function() {
        delete this.testBrowser
    })

    beforeEach(function() {
        global.window = {}
        global.navigator = {}
        global.screen = {}
        global.document = {}
    })

    afterEach(function() {
        delete global.window
        delete global.navigator
        delete global.screen
        delete global.document
        sinon.restore()
    })

    describe('localStorage', function() {
        it('should not detect localStorage if it does not exist', function(done) {
            const localStorageGetterStub = sinon.stub().returns(undefined)
            sinon.stub(this.testBrowser.window, 'localStorage').get(localStorageGetterStub)
            global.window = this.testBrowser.window
            const Detectors = new BrowserFeatureDetector(this.testBrowser.window)
            const isLocalStorageAccessible = Detectors.localStorageAccessible()
            done(assert.strictEqual(isLocalStorageAccessible, false, 'localStorage is not accessible if its undefined'))
        })

        it('should handle a security error when attempting to access localStorage', function(done) {
            const fakeAddRemove = sinon.fake()
            sinon.addBehavior('setItem', fakeAddRemove)
            sinon.addBehavior('removeItem', fakeAddRemove)
            const localStorageStub = sinon.stub(this.testBrowser.window, 'localStorage')
            const localStorageGetterStub = sinon
                .stub()
                .onCall(0)
                .throwsException(new Error())
                .returns(localStorageStub)
            sinon.stub(this.testBrowser.window, 'localStorage').get(localStorageGetterStub)
            global.window = this.testBrowser.window
            const Detectors = new BrowserFeatureDetector(this.testBrowser.window)
            const isLocalStorageAccessible = Detectors.localStorageAccessible()
            done(assert.strictEqual(isLocalStorageAccessible, true, 'failed to handle an error when accessing localStorage'))
        })

        it('should handle not getting an error when attempting to access localStorage', function(done) {
            const fakeAddRemove = sinon.fake()
            sinon.addBehavior('setItem', fakeAddRemove)
            sinon.addBehavior('removeItem', fakeAddRemove)
            const localStorageStub = sinon.stub(this.testBrowser.window, 'localStorage')
            const localStorageGetterStub = sinon.stub().returns(localStorageStub)
            sinon.stub(this.testBrowser.window, 'localStorage').get(localStorageGetterStub)
            global.window = this.testBrowser.window
            const Detectors = new BrowserFeatureDetector(this.testBrowser.window)
            const isLocalStorageAccessible = Detectors.localStorageAccessible()
            done(assert.strictEqual(isLocalStorageAccessible, true, 'failed to detect localStorage when there was no error'))
        })

        it('should not detect localStorage if setting an item fails', function(done) {
            const fakeAdd = sinon.fake.throws(new Error())
            const fakeRemove = sinon.fake()
            sinon.addBehavior('setItem', fakeAdd)
            sinon.addBehavior('removeItem', fakeRemove)
            const localStorageStub = sinon.stub(this.testBrowser.window, 'localStorage')
            const localStorageGetterStub = sinon.stub().returns(localStorageStub)
            sinon.stub(this.testBrowser.window, 'localStorage').get(localStorageGetterStub)
            global.window = this.testBrowser.window
            const Detectors = new BrowserFeatureDetector(this.testBrowser.window)
            const isLocalStorageAccessible = Detectors.localStorageAccessible()
            done(assert.strictEqual(isLocalStorageAccessible, false, 'Setting an item failed, localStorage is not accessible'))
        })

        it('should not detect localStorage if removing an item fails', function(done) {
            const fakeAdd = sinon.fake()
            const fakeRemove = sinon.fake.throws(new Error())
            sinon.addBehavior('setItem', fakeAdd)
            sinon.addBehavior('removeItem', fakeRemove)
            const localStorageStub = sinon.stub(this.testBrowser.window, 'localStorage')
            const localStorageGetterStub = sinon.stub().returns(localStorageStub)
            sinon.stub(this.testBrowser.window, 'localStorage').get(localStorageGetterStub)
            global.window = this.testBrowser.window
            const Detectors = new BrowserFeatureDetector(this.testBrowser.window)
            const isLocalStorageAccessible = Detectors.localStorageAccessible()
            done(assert.strictEqual(isLocalStorageAccessible, false, 'Removing an item failed, localStorage is not accessible'))
        })
    })

    describe('sessionStorage', function() {
        it('should handle a security error when attempting to access sessionStorage', function(done) {
            const sessionStorageStub = sinon.stub(this.testBrowser.window, 'sessionStorage')
            const sessionStorageGetterStub = sinon
                .stub()
                .onCall(0)
                .throwsException(new Error())
                .returns(sessionStorageStub)
            sinon.stub(this.testBrowser.window, 'sessionStorage').get(sessionStorageGetterStub)
            global.window = this.testBrowser.window
            const Detectors = new BrowserFeatureDetector(this.testBrowser.window)
            const hasSessionStorage = Detectors.hasSessionStorage()
            done(assert.strictEqual(hasSessionStorage, true, 'failed to handle an error when accessing sessionStorage'))
        })

        it('should detect if sessionStorage exists', function(done) {
            const sessionStorageStub = sinon.stub(this.testBrowser.window, 'sessionStorage')
            const sessionStorageGetterStub = sinon.stub().returns(sessionStorageStub)
            sinon.stub(this.testBrowser.window, 'sessionStorage').get(sessionStorageGetterStub)
            global.window = this.testBrowser.window
            const Detectors = new BrowserFeatureDetector(this.testBrowser.window)
            const hasSessionStorage = Detectors.hasSessionStorage()
            done(assert.strictEqual(hasSessionStorage, true, 'session storage was not detected but it exists'))
        })

        it('should detect if sessionStorage does not exist', function(done) {
            const sessionStorageGetterStub = sinon.stub().returns(undefined)
            sinon.stub(this.testBrowser.window, 'sessionStorage').get(sessionStorageGetterStub)
            global.window = this.testBrowser.window
            const Detectors = new BrowserFeatureDetector(this.testBrowser.window)
            const hasSessionStorage = Detectors.hasSessionStorage()
            done(assert.strictEqual(hasSessionStorage, false, 'session storage was detected but it does not exist'))
        })
    })

    describe('Cookies', function() {
        it('should detect when cookies are available', function(done) {
            const mockDocument = { cookie: '' }
            const Detectors = new BrowserFeatureDetector({}, {}, {}, mockDocument)
            const hasCookies = Detectors.hasCookies()

            assert.equal(hasCookies, 1, 'Detect cookie accessibility')
            done()
        })

        it('should detect when cookies are unavailable', function(done) {
          
            const mockDocument = { cookie: '' }
            sinon.stub(mockDocument, 'cookie').get(() => {
                return ''
            })

            sinon.stub(mockDocument, 'cookie').set(() => {
                return ''
            })
            
            global.document = mockDocument
            const Detectors = new BrowserFeatureDetector({}, {}, {}, mockDocument)

            const hasCookies = Detectors.hasCookies() /*?*/
            assert.equal(hasCookies, 0, 'Detect cookie accessibility')
            delete global.document
            done()
        })
    })

    describe('Time Zone', function() {
        it('should detect the time zone', function() {
            const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
            const Detectors = new BrowserFeatureDetector({}, {}, {}, {})
            const detectedTimeZone = Detectors.detectTimezone()
            assert.equal(localTimeZone, detectedTimeZone, 'time zone should match the timezone of the test machine')
        })
    })

    describe('Browser features', function() {
        it('should detect browser features appropriately', function(done) {
            const mockScreen = {
                height: 1080,
                width: 1920,
                colorDepth: 24,
            }

            let mockMimeTypes = {
                'application/x-java-vm': { enabledPlugin: true },
                length: 1,
            }

            const mockNavigator = { mimeTypes: mockMimeTypes }

            const Detectors = new BrowserFeatureDetector({}, mockNavigator, mockScreen, {})
            const detectedFeatures = Detectors.detectBrowserFeatures() /*?*/

            assert.equal('1', detectedFeatures.java, 'Detect a feature that exists')
            assert.equal('0', detectedFeatures.fla, 'Detect a feature that does not exist')
            done()
        })

        it('should detect all desired features', function(done) {
            //currently we can't really test this without poluting the global scope.
            const mockScreen = {
                height: 1080,
                width: 1920,
                colorDepth: 24,
            }

            const mockMimeTypes = {
                // document types
                'application/pdf': { enabledPlugin: true },

                // media players
                'video/quicktime': { enabledPlugin: true },
                'audio/x-pn-realaudio-plugin': { enabledPlugin: true },
                'application/x-mplayer2': { enabledPlugin: true },

                // interactive multimedia
                'application/x-director': { enabledPlugin: true },
                'application/x-shockwave-flash': { enabledPlugin: true },

                // RIA
                'application/x-java-vm': { enabledPlugin: true },
                'application/x-googlegears': { enabledPlugin: true },
                'application/x-silverlight': { enabledPlugin: true },
                length: 9,
            }

            const mockNavigator = { mimeTypes: mockMimeTypes }
            const Detectors = new BrowserFeatureDetector({}, mockNavigator, mockScreen, {})
            const detectedFeatures = Detectors.detectBrowserFeatures()

            assert.equal('1', detectedFeatures.pdf, 'Detect PDF feature')
            assert.equal('1', detectedFeatures.qt, 'Detect quicktime feature')
            assert.equal('1', detectedFeatures.realp, 'Detect Real Player')
            assert.equal('1', detectedFeatures.wma, 'Detect Windows Media Player')
            assert.equal('1', detectedFeatures.dir, 'Detect Shockwave Director')
            assert.equal('1', detectedFeatures.java, 'Detect Java')
            assert.equal('1', detectedFeatures.gears, 'Detect Google Gears')
            assert.equal('1', detectedFeatures.ag, 'Detect Silverlight')
            assert.equal('1920x1080', detectedFeatures.res, 'Detect screen resolution')
            assert.equal('24', detectedFeatures.cd, 'Detect color depth')
            done()
        })
    })
})
