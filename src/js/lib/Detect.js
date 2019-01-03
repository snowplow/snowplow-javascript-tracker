/*
 * JavaScript tracker for Snowplow: detectors.js
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

import cookie from 'browser-cookie-lite'
import { v3 as murmurhash3_32_gc } from 'murmurhash'
import jstz from 'jstimezonedetect'

const tz = jstz.determine(),
    windowAlias = window,
    navigatorAlias = navigator,
    screenAlias = screen,
    documentAlias = document

/**
 * Checks whether sessionStorage is available, in a way that
 * does not throw a SecurityError in Firefox if "always ask"
 * is enabled for cookies (https://github.com/snowplow/snowplow/issues/163).
 *
 * @returns {Boolean} - true if user agent supports sessionStorage
 */
export const hasSessionStorage = () => {
    try {
        return !!windowAlias.sessionStorage
    } catch (e) {
        return true // SecurityError when referencing it means it exists
    }
}

/**
 * Checks whether localStorage is available, in a way that
 * does not throw a SecurityError in Firefox if "always ask"
 * is enabled for cookies (https://github.com/snowplow/snowplow/issues/163).
 *
 * @returns {Boolean} - true if user agent supports localStorage
 */
export const hasLocalStorage = () => {
    try {
        return !!windowAlias.localStorage
    } catch (e) {
        return true // SecurityError when referencing it means it exists
    }
}

/**
 * Checks whether localStorage is accessible
 * sets and removes an item to handle private IOS5 browsing
 * (http://git.io/jFB2Xw)
 *
 * @returns {Boolean} - true if localStorage is accessible
 */
export const localStorageAccessible = () => {
    var mod = 'modernizr'
    if (!hasLocalStorage()) {
        return false
    }
    try {
        windowAlias.localStorage.setItem(mod, mod)
        windowAlias.localStorage.removeItem(mod)
        return true
    } catch (e) {
        return false
    }
}

/**
 * Does browser have cookies enabled (for this site)?
 *
 * @returns {Boolran} - true if the cookies are enabled
 */
export const hasCookies = testCookieName => {
    var cookieName = testCookieName || 'testcookie'

    if (navigatorAlias.cookieEnabled === undefined) {
        cookie.cookie(cookieName, '1')
        return cookie.cookie(cookieName) === '1' ? '1' : '0'
    }

    return navigatorAlias.cookieEnabled ? '1' : '0'
}

/**
 * JS Implementation for browser fingerprint.
 * Does not require any external resources.
 * Based on https://github.com/carlo/jquery-browser-fingerprint
 *
 * @returns {number} 32-bit positive integer hash
 */
export const detectSignature = hashSeed => {
    var fingerprint = [
        navigatorAlias.userAgent,
        [screenAlias.height, screenAlias.width, screenAlias.colorDepth].join(
            'x'
        ),
        new Date().getTimezoneOffset(),
        hasSessionStorage(),
        hasLocalStorage(),
    ]

    var plugins = []
    if (navigatorAlias.plugins) {
        for (var i = 0; i < navigatorAlias.plugins.length; i++) {
            if (navigatorAlias.plugins[i]) {
                var mt = []
                for (var j = 0; j < navigatorAlias.plugins[i].length; j++) {
                    mt.push([
                        navigatorAlias.plugins[i][j].type,
                        navigatorAlias.plugins[i][j].suffixes,
                    ])
                }
                plugins.push([
                    navigatorAlias.plugins[i].name +
                        '::' +
                        navigatorAlias.plugins[i].description,
                    mt.join('~'),
                ])
            }
        }
    }
    return murmurhash3_32_gc(
        fingerprint.join('###') + '###' + plugins.sort().join(';'),
        hashSeed
    )
}

/**
 * Returns visitor timezone
 *
 * @returns {String} - the visitors timezone
 */
export const detectTimezone = () => {
    tz ? tz.name() : ''
}

/**
 * Gets the current viewport.
 *
 * Code based on:
 * - http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
 * - http://responsejs.com/labs/dimensions/
 *
 * @returns {String|null} - the current viewport in the format width x height or null
 */
export const detectViewport = () => {
    let e = windowAlias,
        a = 'inner'
    if (!('innerWidth' in windowAlias)) {
        a = 'client'
        e = documentAlias.documentElement || documentAlias.body
    }
    const width = e[a + 'Width']
    const height = e[a + 'Height']
    if (width >= 0 && height >= 0) {
        return `${width}x${height}`
    } else {
        return null
    }
}

/**
 * Gets the dimensions of the current
 * document.
 *
 * Code based on:
 * - http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
 *
 * @returns {String} - the current document size in the format width x height or empty string
 */
export const detectDocumentSize = () => {
    const de = documentAlias.documentElement, // Alias
        be = documentAlias.body,
        // document.body may not have rendered, so check whether be.offsetHeight is null
        bodyHeight = be ? Math.max(be.offsetHeight, be.scrollHeight) : 0
    const w = Math.max(de.clientWidth, de.offsetWidth, de.scrollWidth)
    const h = Math.max(
        de.clientHeight,
        de.offsetHeight,
        de.scrollHeight,
        bodyHeight
    )
    return isNaN(w) || isNaN(h) ? '' : `${w}x${h}`
}

/**
 * Returns browser features (plugins, resolution, cookies)
 *
 * @param {Boolean} useCookies - Whether to test for cookies
 * @param {String} testCookieName - Name to use for the test cookie
 * @returns {Object} - object containing browser features
 */
export const detectBrowserFeatures = (useCookies, testCookieName) => {
    let i, mimeType
    const pluginMap = {
            // document types
            pdf: 'application/pdf',

            // media players
            qt: 'video/quicktime',
            realp: 'audio/x-pn-realaudio-plugin',
            wma: 'application/x-mplayer2',

            // interactive multimedia
            dir: 'application/x-director',
            fla: 'application/x-shockwave-flash',

            // RIA
            java: 'application/x-java-vm',
            gears: 'application/x-googlegears',
            ag: 'application/x-silverlight',
        },
        features = {}

    // General plugin detection
    if (navigatorAlias.mimeTypes && navigatorAlias.mimeTypes.length) {
        for (i in pluginMap) {
            if (Object.prototype.hasOwnProperty.call(pluginMap, i)) {
                mimeType = navigatorAlias.mimeTypes[pluginMap[i]]
                features[i] = mimeType && mimeType.enabledPlugin ? '1' : '0'
            }
        }
    }

    // Safari and Opera
    // IE6/IE7 navigator.javaEnabled can't be aliased, so test directly
    if (
        navigatorAlias.constructor === window.Navigator &&
        typeof navigatorAlias.javaEnabled !== undefined &&
        navigatorAlias.javaEnabled!==undefined &&
        navigatorAlias.javaEnabled()
    ) {
        features.java = '1'
    }

    // Firefox
    if (typeof windowAlias.GearsFactory == 'function') {
        features.gears = '1'
    }

    // Other browser features
    features.res = screenAlias.width + 'x' + screenAlias.height
    features.cd = screenAlias.colorDepth
    if (useCookies) {
        features.cookie = hasCookies(testCookieName)
    }

    return features
}

export default {
    hasLocalStorage,
    detectBrowserFeatures,
    detectSignature,
    detectTimezone,
    detectViewport,
    hasCookies,
    detectDocumentSize,
    hasSessionStorage,
    localStorageAccessible,
    navigatorAlias,
    screenAlias,
    windowAlias,
}
