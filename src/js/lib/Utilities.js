/*
 * JavaScript tracker for Snowplow: Snowplow.js
 *
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright
 * 2012-2014 Snowplow Analytics Ltd. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
 *   names of their contributors may be used to endorse or promote products
 *   derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { cookie } from 'browser-cookie-lite'

/**
 * Cleans up the page title
 *
 * @param {String} title - page title to clean up
 * @returns {String} - cleaned up page title
 */
export const fixupTitle = title => {
    if (!isString(title)) {
        title = title.text || ''

        var tmp = document.getElementsByTagName('title')
        if (tmp && !isUndefined(tmp[0])) {
            title = tmp[0].text
        }
    }
    return title
}

/**
 * Extract hostname from URL
 *
 * @param {String} url - the url to extract the hostname from
 * @returns {String} - the hostname
 */
export const getHostName = url => {
    // scheme : // [username [: password] @] hostname [: port] [/ [path] [? query] [# fragment]]
    var e = new RegExp('^(?:(?:https?|ftp):)/*(?:[^@]+@)?([^:/#]+)'),
        matches = e.exec(url)

    return matches ? matches[1] : url
}

/**
 * Fix-up domain
 *
 * @param {String} domain - domain to fix up
 * @returns {String} - fixed up domain
 */
export const fixupDomain = domain => {
    var dl = domain.length

    // remove trailing '.'
    if (domain.charAt(--dl) === '.') {
        domain = domain.slice(0, dl)
    }
    // remove leading '*'
    if (domain.slice(0, 2) === '*.') {
        domain = domain.slice(1)
    }
    return domain
}

/**
 * Get page referrer. In the case of a single-page app,
 * if the URL changes without the page reloading, pass
 * in the old URL. It will be returned unless overriden
 * by a "refer(r)er" parameter in the querystring.
 *
 * @param {String} oldLocation  - optional.
 * @returns {String} - the referrer
 */
export const getReferrer = oldLocation => {
    var referrer = ''

    var fromQs =
        fromQuerystring('referrer', window.location.href) ||
        fromQuerystring('referer', window.location.href)

    // Short-circuit
    if (fromQs) {
        return fromQs
    }

    // In the case of a single-page app, return the old URL
    if (oldLocation) {
        return oldLocation
    }

    try {
        referrer = window.top.document.referrer
    } catch (e) {
        if (window.parent) {
            try {
                referrer = window.parent.document.referrer
            } catch (e2) {
                referrer = ''
            }
        }
    }
    if (referrer === '') {
        referrer = document.referrer
    }
    return referrer
}

/**
 * Cross-browser helper function to add event handler
 *
 * @param {HTMLElement} element - the element to add the event to
 * @param {eventType} eventType - the type of event to listen to
 * @param {Function} eventHandler - the function to attach
 * @param {Boolean} useCapture - set to true to enable "capture mode"
 * @returns {Boolean} - returns the result of adding the listner, should always be true.
 */
export const addEventListener = (
    element,
    eventType,
    eventHandler,
    useCapture
) => {
    if (element.addEventListener) {
        element.addEventListener(eventType, eventHandler, useCapture)
        return true
    }

    if (element.attachEvent) {
        return element.attachEvent('on' + eventType, eventHandler)
    }

    element['on' + eventType] = eventHandler
    return true
}

/**
 * Return value from name-value pair in querystring
 *
 * @param {String} field - query string field to get value from
 * @param {String} url - the url to get the query string from
 * @returns {String} - the value of the field in the query string
 */
export const fromQuerystring = (field, url) => {
    var match = new RegExp('^[^#]*[?&]' + field + '=([^&#]*)').exec(url)
    if (!match) {
        return null
    }
    return decodeURIComponent(match[1].replace(/\+/g, ' '))
}

/**
 * Find dynamic context generating functions and merge their results into the static contexts
 * Combine an array of unchanging contexts with the result of a context-creating function
 * @param {(object|function(...*): ?object)[]} dynamicOrStaticContexts - Array of custom context Objects or custom context generating functions
 * @param {...any} callbackParameters - Parameters to pass to dynamic callbacks
 */
export const resolveDynamicContexts = (
    dynamicOrStaticContexts,
    ...callbackParameters
) => {
    //var params = Array.prototype.slice.call(arguments, 1);
    if (dynamicOrStaticContexts) {
        return dynamicOrStaticContexts.map(function(context) {
            if (typeof context === 'function') {
                try {
                    return context.apply(null, callbackParameters)
                } catch (e) {
                    warn('Exception thrown in dynamic context generator: ' + e)
                }
            } else {
                return context
            }
        })
    }
}

/**
 * Only log deprecation warnings if they won't cause an error
 *
 * @param {String} message - the warning message
 */
export const warn = message => {
    if (typeof window.console !== 'undefined') {
        window.console.warn('Snowplow: ' + message)
    }
}

/**
 * List the classes of a DOM element without using elt.classList (for compatibility with IE 9)
 *
 * @param {HTMLElement} element - The HTMLElement object to search
 * @returns {String[]} - an array of the classes on the element
 */
export const getCssClasses = element => {
   
    return element.className.match(/\S+/g) || []
}

/**
 * Check whether an element has at least one class from a given list
 *
 * @param {*} element - The HTMLElement object to search
 * @param {Object} classList - hashtable of class name strings to check
 * @returns {Boolean} - true if the element contains any of the classes in the array
 */
export const checkClass = (element, classList) => {
    let classes = getCssClasses(element),
        i

    for (i = 0; i < classes.length; i++) {
        if (classList[classes[i]]) {
            return true
        }
    }
    return false
}

/**
 * Convert a criterion object to a filter function
 *
 * @param {Object} criterion Either {whitelist: [array of allowable strings]}
 *                             or {blacklist: [array of allowable strings]}
 *                             or {filter: function (elt) {return whether to track the element}
 * @param {Boolean} byClass Whether to whitelist/blacklist based on an element's classes (for forms)
 *                        		or name attribute (for fields)
 * @returns {Function} - resultant filter function
 */
export const getFilter = function(criterion, byClass) {
    // If the criterion argument is not an object, add listeners to all elements
    if (isArray(criterion) || !isObject(criterion)) {
        return function() {
            return true
        }
    }

    if (criterion.hasOwnProperty('filter')) {
        return criterion.filter
    } else {
        var inclusive = criterion.hasOwnProperty('whitelist')
        var specifiedClasses = criterion.whitelist || criterion.blacklist
        if (!isArray(specifiedClasses)) {
            specifiedClasses = [specifiedClasses]
        }

        // Convert the array of classes to an object of the form {class1: true, class2: true, ...}
        var specifiedClassesSet = {}
        for (var i = 0; i < specifiedClasses.length; i++) {
            specifiedClassesSet[specifiedClasses[i]] = true
        }

        if (byClass) {
            return function(elt) {
                return checkClass(elt, specifiedClassesSet) === inclusive
            }
        } else {
            return function(elt) {
                return elt.name in specifiedClassesSet === inclusive
            }
        }
    }
}

/**
 * Convert a criterion object to a transform function
 *
 * @param {Object} criterion  - {transform: function (elt) {return the result of transform function applied to element}
 * @returns {Function} - the resultant transform function
 */
export const getTransform = criterion => {
    if (isObject(criterion) && criterion.hasOwnProperty('transform')) {
        return criterion.transform
    }

    return function(x) {
        return x
    }
}

/**
 * Add a name-value pair to the querystring of a URL
 *
 * @param {String} url -  URL to decorate
 * @param {String} name - Name of the querystring pair
 * @param {String} value  - Value of the querystring pair
 * @returns {String} - resultant url
 */
export const decorateQuerystring = (url, name, value) => {
    var initialQsParams = name + '=' + value
    var hashSplit = url.split('#')
    var qsSplit = hashSplit[0].split('?')
    var beforeQuerystring = qsSplit.shift()
    // Necessary because a querystring may contain multiple question marks
    var querystring = qsSplit.join('?')
    if (!querystring) {
        querystring = initialQsParams
    } else {
        // Whether this is the first time the link has been decorated
        var initialDecoration = true
        var qsFields = querystring.split('&')
        for (var i = 0; i < qsFields.length; i++) {
            if (qsFields[i].substr(0, name.length + 1) === name + '=') {
                initialDecoration = false
                qsFields[i] = initialQsParams
                querystring = qsFields.join('&')
                break
            }
        }
        if (initialDecoration) {
            querystring = initialQsParams + '&' + querystring
        }
    }
    hashSplit[0] = beforeQuerystring + '?' + querystring
    return hashSplit.join('#')
}

/**
 * Attempt to get a value from localStorage
 *
 * @param {String} key - the key to read from localStorage
 * @returns {String|undefined} The value obtained from localStorage, or undefined if localStorage is inaccessible
 */
export const attemptGetLocalStorage = key => {
    try {
        return localStorage.getItem(key)
    } catch (e) {
        //The try is to prevent an error, but it is OK to swallow it here as that is expected behaviour
    }
}

/**
 * Attempt to write a value to localStorage
 *
 * @param {String} key - the key to write to in localStorage
 * @param {String} value - the value to write to localStorage
 * @returns {Boolean} true if the operation was successful
 */
export const attemptWriteLocalStorage = (key, value) => {
    try {
        localStorage.setItem(key, value)
        return true
    } catch (e) {
        return false
    }
}

/**
 * Finds the root domain. Attempts to use cookies, or defaults to the hostname
 *
 * @returns {String}  - the root domain of the page
 */
export const findRootDomain = () => {
    var cookiePrefix = '_sp_root_domain_test_'
    var cookieName = cookiePrefix + new Date().getTime()
    var cookieValue = '_test_value_' + new Date().getTime()

    var split = window.location.hostname.split('.')
    var position = split.length - 1
    while (position >= 0) {
        var currentDomain = split.slice(position, split.length).join('.')
        cookie.cookie(cookieName, cookieValue, 0, '/', currentDomain)
        if (cookie.cookie(cookieName) === cookieValue) {
            // Clean up created cookie(s)
            deleteCookie(cookieName, currentDomain)
            var cookieNames = getCookiesWithPrefix(cookiePrefix)
            for (var i = 0; i < cookieNames.length; i++) {
                deleteCookie(cookieNames[i], currentDomain)
            }

            return currentDomain
        }
        position -= 1
    }

    // Cookies cannot be read
    return window.location.hostname
}

/**
 * Checks whether a value is present within an array
 *
 * @param {any} val  - The value to check for
 * @param {Array} array - The array to check within
 * @returns {Boolean}  - Whether it exists
 */
export const isValueInArray = (val, array) => {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === val) {
            return true
        }
    }
    return false
}

/**
 * Deletes an arbitrary cookie by setting the expiration date to the past
 *
 * @param {String} cookieName -  The name of the cookie to delete
 * @param {String} domainName  - The domain the cookie is in
 */
export const deleteCookie = (cookieName, domainName) => {
    cookie.cookie(cookieName, '', -1, '/', domainName)
}

/**
 * Fetches the name of all cookies beginning with a certain prefix
 *
 * @param {String} cookiePrefix - The prefix to check for
 * @returns {Array} an array of the cookies that begin with the prefix
 */
export const getCookiesWithPrefix = function(cookiePrefix) {
    var cookies = document.cookie.split('; ')
    var cookieNames = []
    for (var i = 0; i < cookies.length; i++) {
        if (cookies[i].substring(0, cookiePrefix.length) === cookiePrefix) {
            cookieNames.push(cookies[i])
        }
    }
    return cookieNames
}

/**
 * Test whether a string is an IP address
 *
 * @param {String} string - The string to test
 * @returns {Boolean} - true if the string is an IP address
 */
export const isIpAddress = string => 
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(string)


/**
 * If the hostname is an IP address, look for text indicating that the page is cached by Yahoo
 *
 * @param {String} hostName  - host name to check
 * @returns {Boolean} - true if the page is cached by Yahoo
 */
export const isYahooCachedPage = hostName => {
    let initialDivText, cachedIndicator
    if (isIpAddress(hostName)) {
        try {
            initialDivText =
                document.body.children[0].children[0].children[0].children[0]
                    .children[0].children[0].innerHTML
            cachedIndicator = 'You have reached the cached page for'
            return (
                initialDivText.slice(0, cachedIndicator.length) ===
                cachedIndicator
            )
        } catch (e) {
            return false
        }
    }
}

/**
 * Extract parameter from URL
 *
 * @param {String} url - url to extract the parameter from
 * @param {String} name - name of the parameter to extract
 * @returns {String} - string value of the extracted parameter
 */
export const getParameter = (url, name) => {
    // scheme : // [username [: password] @] hostname [: port] [/ [path] [? query] [# fragment]]
    var e = new RegExp('^(?:https?|ftp)(?::/*(?:[^?]+))([?][^#]+)'),
        matches = e.exec(url),
        result = fromQuerystring(name, matches[1])

    return result
}

/**
 * Fix-up URL when page rendered from search engine cache or translated page.
 *
 * @param {String} hostName - the host name of the server
 * @param {String} href - the href of the page
 * @param {String} referrer - the referrer of the page
 */
export const fixupUrl = (hostName, href, referrer) => {
    //TODO: it would be nice to generalise this and/or move into the ETL phase.

    const _host = isYahooCachedPage(hostName) ? 'yahoo' : hostName

    switch (_host) {
    case 'translate.googleusercontent.com':
        if (referrer === '') {
            referrer = href
        }
        href = getParameter(href, 'u')
        hostName = getHostName(href)
        break

    case 'cc.bingj.com':
    case 'webcache.googleusercontent.com':
    case 'yahoo':
        href = document.links[0].href
        hostName = getHostName(href)
        break
    }

    return [hostName, href, referrer]
}

/**
 * Parses an object and returns either the
 * integer or undefined.
 *
 * @param {any} obj - The object to parse
 * @returns {Number|undefined} - the result of the parse operation
 */
export const pInt = function(obj) {
    var result = parseInt(obj)
    return isNaN(result) ? undefined : result
}

/**
 * Parses an object and returns either the
 * number or undefined.
 *
 * @param {any} obj -  The object to parse
 * @returns {Number|undefined} the result of the parse operation
 */
export const pFloat = function(obj) {
    var result = parseFloat(obj)
    return isNaN(result) ? undefined : result
}

export const isFunction = function(toTest) {
    return typeof toTest == 'function'
}

export const isString = function(toTest) {
    return typeof toTest == 'string'
}

export const isUndefined = function(toTest) {
    return toTest === undefined
}

export const isArray = function(toTest) {
    return Array.isArray(toTest)
}

export const isObject = function(toTest) {
    var testedType = typeof toTest
    return testedType != null && (testedType == 'object' || testedType == 'function')
}

const helpers = {
    addEventListener,
    attemptGetLocalStorage,
    attemptWriteLocalStorage,
    decorateQuerystring,
    deleteCookie,
    findRootDomain,
    fixupDomain,
    fixupTitle,
    fixupUrl,
    fromQuerystring,
    getCookiesWithPrefix,
    getCssClasses,
    getFilter,
    getHostName,
    getParameter,
    getReferrer,
    getTransform,
    isArray,
    isFunction,
    isIpAddress,
    isObject,
    isString,
    isUndefined,
    isValueInArray,
    isYahooCachedPage,
    parseFloat,
    parseInt,
    resolveDynamicContexts,
    warn,
}
export default helpers
