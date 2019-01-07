const assert = require('assert')
const describe = require('mocha').describe
const beforeEach = require('mocha').beforeEach
const before = require('mocha').before
const afterEach = require('mocha').afterEach
const it = require('mocha').it
const JSDOM = require('jsdom').JSDOM
const sinon = require('sinon')

module.exports = (function() {

    describe('Detectors', function() {

        before(function(){
            delete this.testBrowser
            //This makes it easier to stub functions that exist in a browser and/or use real browser functions in tests
            this.testBrowser = new JSDOM('<html><body></body></html>', {
                url: 'https://example.org/',
                referrer: 'https://example.com/',
                contentType: 'text/html',
                storageQuota: 10000000
            })
        })
    
        beforeEach(function(){
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

        describe('localStorage', function(){
            
            it('should not detect localStorage if it does not exist', function(done) {
                const localStorageGetterStub = sinon.stub().returns(undefined)
                sinon.stub(this.testBrowser.window, 'localStorage').get(localStorageGetterStub)
                global.window = this.testBrowser.window
                const Detectors = require('../../src/js/lib/Detect')
                const isLocalStorageAccessible = Detectors.localStorageAccessible()        
                done(assert.strictEqual(isLocalStorageAccessible, false, 'localStorage is not accessible if its undefined'))                
            })
            
            it('should handle a security error when attempting to access localStorage', function(done) {
                const fakeAddRemove = sinon.fake()
                sinon.addBehavior('setItem', fakeAddRemove)
                sinon.addBehavior('removeItem', fakeAddRemove)
                const localStorageStub = sinon.stub(this.testBrowser.window, 'localStorage')
                const localStorageGetterStub = sinon.stub()
                    .onCall(0).throwsException(new Error())
                    .returns(localStorageStub)
                sinon.stub(this.testBrowser.window, 'localStorage').get(localStorageGetterStub)
                global.window = this.testBrowser.window
                const Detectors = require('../../src/js/lib/Detect')
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
                const Detectors = require('../../src/js/lib/Detect')
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
                const Detectors = require('../../src/js/lib/Detect')
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
                const Detectors = require('../../src/js/lib/Detect')
                const isLocalStorageAccessible = Detectors.localStorageAccessible()        
                done(assert.strictEqual(isLocalStorageAccessible, false, 'Removing an item failed, localStorage is not accessible'))                
            })

        })

        describe('sessionStorage', function(){
            it('should handle a security error when attempting to access sessionStorage', function(done) {
                const sessionStorageStub = sinon.stub(this.testBrowser.window, 'sessionStorage')
                const sessionStorageGetterStub = sinon.stub()
                    .onCall(0).throwsException(new Error())
                    .returns(sessionStorageStub)
                sinon.stub(this.testBrowser.window, 'sessionStorage').get(sessionStorageGetterStub)
                global.window = this.testBrowser.window
                const Detectors = require('../../src/js/lib/Detect')
                const hasSessionStorage = Detectors.hasSessionStorage()
                done(assert.strictEqual(hasSessionStorage, true, 'failed to handle an error when accessing sessionStorage'))                
            })

            it('should detect if sessionStorage exists', function(done) {
                const sessionStorageStub = sinon.stub(this.testBrowser.window, 'sessionStorage')
                const sessionStorageGetterStub = sinon.stub().returns(sessionStorageStub)
                sinon.stub(this.testBrowser.window, 'sessionStorage').get(sessionStorageGetterStub)
                global.window = this.testBrowser.window
                const Detectors = require('../../src/js/lib/Detect')
                const hasSessionStorage = Detectors.hasSessionStorage()
                done(assert.strictEqual(hasSessionStorage, true, 'session storage was not detected but it exists'))                
            })

            it('should detect if sessionStorage does not exist', function(done) {
                const sessionStorageGetterStub = sinon.stub().returns(undefined)
                sinon.stub(this.testBrowser.window, 'sessionStorage').get(sessionStorageGetterStub)
                global.window = this.testBrowser.window
                const Detectors = require('../../src/js/lib/Detect')
                const hasSessionStorage = Detectors.hasSessionStorage()
                done(assert.strictEqual(hasSessionStorage, false, 'session storage was detected but it does not exist'))                
            })

        })

        describe('cookies', function(){
            it('should detect when cookies are available', function(done) {
                this.skip();
               
                const Detectors = require('../../src/js/lib/Detect')
                const hasCookies = Detectors.hasCookies()
               

                assert(hasCookies, 'Detect cookie accessibility')
                done()
            })

            it('should detect when cookies are unavailable', function(done) {
                this.skip()
                //setupTestDOM('')
                const Detectors = require('../../src/js/lib/Detect')
                const hasCookies = Detectors.hasCookies()
                assert(hasCookies, 'Detect cookie accessibility')
                done()
            })


        })

        // it('Detect timezone', function() {
        //     return this.remote
        //         .get(require.toUrl('tests/pages/detectors.html'))
        //         .setFindTimeout(5000)
        //         .findByCssSelector('body.loaded')
        //         .findById('detectTimezone')
        //         .getVisibleText()
        //         .then(function(text) {
        //             assert.include(
        //                 ['UTC', 'America/Los_Angeles'],
        //                 text,
        //                 'Detect the timezone'
        //             )
        //         })
        // })

        // it('Browser features', function() {
        //     return this.remote
        //         .get(require.toUrl('tests/pages/detectors.html'))
        //         .setFindTimeout(5000)
        //         .findByCssSelector('body.loaded')
        //         .findById('detectBrowserFeatures')
        //         .getVisibleText()
        //         .then(function(text) {
        //             var features = JSON.parse(text)
        //             // The only features which are the same for all tested browsers
        //             assert.equal('1', features.java, 'Detect Java')
        //             assert.equal(24, features.cd, 'Detect color depth')
        //         })
        // })
    })
})()
