var assert = require('assert')
var describe = require('mocha').describe
var beforeEach = require('mocha').beforeEach
var before = require('mocha').before
var after = require('mocha').after
var afterEach = require('mocha').afterEach
var it = require('mocha').it
var sinon = require('sinon')

describe('InQueue', function() {
    delete global.window
    delete global.navigator
    delete global.screen
    delete global.document

    const tracker = require('../mocks/tracker').default
    const InQueueManager = require('../../src/lib/InQueueManager').default
   
    before(function() {
        global.testValue = 0
    })

    after(function() {
        global.testValue = 0
        global.asyncQueue = null
    })

    beforeEach(function() {
        global.window = global.window || {}
    })

    afterEach(function() {})

    it('should create an async queue', function(done) {
        assert.equal(0, global.testValue, 'Testing variables start at 0')

        const queue = [['newTracker', 'firstTracker', 'firstEndpoint'], ['increaseAttribute', 5], ['setOutputToAttribute']]

        global.asyncQueue = new InQueueManager(tracker, 0, {}, queue, 'test_queue')

        assert.equal(typeof global.asyncQueue.push, 'function', 'async queue is created')

        assert.equal(global.testValue, 15, 'function originally stored in provided queue is executed when async queue is created')
        done()
    })

    it('should process functions added to the async queue after its created', function(done) {
        global.asyncQueue.push(['setAttribute', 7])
        global.asyncQueue.push(['setOutputToAttribute'])
        assert.equal(global.testValue, 7, 'Function added to asyncQueue after it becomes an AsyncQueueProxy is executed')
        done()
    })

    it('should create a second tracker and add both trackers\' attributes to output', function(done) {
        global.asyncQueue.push(['setCollectorUrl', 'secondEndpoint'])
        global.asyncQueue.push(['addAttributeToOutput'])
        assert.equal(global.testValue, 24, 'Backward compatibility: Create a tracker using the legacy setCollectorUrl method')
        done()
    })

    it('should be able to work with each tracker individually', function(done) {
        global.asyncQueue.push(['setAttribute:firstTracker', 2])
        global.asyncQueue.push(['setAttribute:sp', 3])
        global.asyncQueue.push(['addAttributeToOutput:firstTracker;sp'])
        assert.equal(global.testValue, 29, 'Set the attributes of the two trackers individually, then add both to output')
        done()
    })

    it('should execute a user-defined custom callback', function(done) {
        var callback = sinon.spy()
        global.asyncQueue.push([callback])
        assert(callback.called, 'Call a user defined callback')
        callback = null
        done()
    })
})
