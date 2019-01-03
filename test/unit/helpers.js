var assert = require('assert')
var describe = require('mocha').describe
var it = require('mocha').it

const utilities = require('../../src/js/lib/Utilities.js')

module.exports = (function () {
    describe('Helpers', function() {

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
            
            it('should decorate a URL with no querystring or fragment', function(){
                var url = 'http://www.example.com'
                var expected = 'http://www.example.com?_sp=a.b'
                var actual = utilities.decorateQuerystring(url, '_sp', 'a.b')
                assert.equal(actual, expected)
            })
            
            it('should decorate a URL with a fragment but no querystring',function() {
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
                var expected =
                    'http://www.example.com?_sp=a.b&test=working?&name=value'
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
                var url =
                    'http://www.example.com?test=working?&_sp=outdated?&?name=value#fragment?#?#'
                var expected =
                    'http://www.example.com?test=working?&_sp=a.b&?name=value#fragment?#?#'
                var actual = utilities.decorateQuerystring(url, '_sp', 'a.b')
                assert.equal(actual, expected)
            })



        })

        describe('Get CSS Classes', function(){

            it('should tokenize a DOM element\'s className field', function() {
                var element = {
                    className:
                        '   the  quick   brown_fox-jumps/over\nthe\t\tlazy   dog  ',
                }
                var expected = [
                    'the',
                    'quick',
                    'brown_fox-jumps/over',
                    'the',
                    'lazy',
                    'dog',
                ]
                var actual = utilities.getCssClasses(element)
                assert.deepEqual(actual, expected)
            })


        })

    })

})()