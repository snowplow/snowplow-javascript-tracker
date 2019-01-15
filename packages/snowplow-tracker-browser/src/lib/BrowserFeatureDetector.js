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
import jstz from '@mmathias01/jstz'

class BrowserFeatureDetector {

    /**
     * Creates a new browser feature detector class. 
     * 
     * @param {*} window 
     * @param {*} navigator 
     * @param {*} screen 
     * @param {*} document 
     */
    constructor(window, navigator, screen, document) {
        this.windowAlias = window,
        this.navigatorAlias = navigator,
        this.screenAlias = screen,
        this.documentAlias = document
    }

    /**
     * Checks whether sessionStorage is available, in a way that
     * does not throw a SecurityError in Firefox if "always ask"
     * is enabled for cookies (https://github.com/snowplow/snowplow/issues/163).
     *
     * @returns {Boolean} - true if user agent supports sessionStorage
     */
    hasSessionStorage() {
        try {
            return !!this.windowAlias.sessionStorage
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
    hasLocalStorage() {
        try {
            return !!this.windowAlias.localStorage
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
    localStorageAccessible() {
        const testKeyValue = 'spt'
        if (!this.hasLocalStorage()) {
            return false
        }
        try {
            this.windowAlias.localStorage.setItem(testKeyValue, testKeyValue)
            this.windowAlias.localStorage.removeItem(testKeyValue)
            return true
        } catch (e) {
            return false
        }
    }

    /**
     * Does browser have cookies enabled (for this site)?
     *
     * @returns {Boolean} - true if the cookies are enabled
     */
    hasCookies(testCookieName) {
        var cookieName = testCookieName || 'testcookie'
        if (this.navigatorAlias.cookieEnabled === undefined) {
            cookie.cookie(cookieName, '1')
            return cookie.cookie(cookieName) === '1' ? '1' : '0'
        }

        return this.navigatorAlias.cookieEnabled ? '1' : '0'
    }

    /**
     * JS Implementation for browser fingerprint.
     * Does not require any external resources.
     * Based on https://github.com/carlo/jquery-browser-fingerprint
     *
     * @returns {number} 32-bit positive integer hash
     */
    detectSignature(hashSeed) {
        var fingerprint = [
            this.navigatorAlias.userAgent,
            [this.screenAlias.height, this.screenAlias.width, this.screenAlias.colorDepth].join(
                'x'
            ),
            new Date().getTimezoneOffset(),
            this.hasSessionStorage(),
            this.hasLocalStorage(),
        ]

        var plugins = []
        if (this.navigatorAlias.plugins) {
            for (var i = 0; i < this.navigatorAlias.plugins.length; i++) {
                if (this.navigatorAlias.plugins[i]) {
                    var mt = []
                    for (var j = 0; j < this.navigatorAlias.plugins[i].length; j++) {
                        mt.push([
                            this.navigatorAlias.plugins[i][j].type,
                            this.navigatorAlias.plugins[i][j].suffixes,
                        ])
                    }
                    plugins.push([
                        this.navigatorAlias.plugins[i].name +
                            '::' +
                            this.navigatorAlias.plugins[i].description,
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
    detectTimezone() {
        const tz = jstz.determine()
        return tz ? tz.name() : ''
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
    detectViewport() {
        let e = this.windowAlias,
            a = 'inner'
        if (!('innerWidth' in this.windowAlias)) {
            a = 'client'
            e = this.documentAlias.documentElement || this.documentAlias.body
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
    detectDocumentSize() {
        const de = this.documentAlias.documentElement, // Alias
            be = this.documentAlias.body,
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
    detectBrowserFeatures(useCookies, testCookieName) {
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

        if (this.navigatorAlias.mimeTypes && this.navigatorAlias.mimeTypes.length) {
            for (i in pluginMap) {
                if (Object.prototype.hasOwnProperty.call(pluginMap, i)) {
                    mimeType = this.navigatorAlias.mimeTypes[pluginMap[i]]
                    features[i] = mimeType && mimeType.enabledPlugin ? '1' : '0'
                }
            }
        }

        // Safari and Opera
        // IE6/IE7 navigator.javaEnabled can't be aliased, so test directly
        if (
            this.navigatorAlias.constructor === window.Navigator &&
            typeof this.navigatorAlias.javaEnabled !== undefined &&
            this.navigatorAlias.javaEnabled!==undefined &&
            this.navigatorAlias.javaEnabled()
        ) {
            features.java = '1'
        }

        // Firefox
        if (typeof this.navigatorAlias.GearsFactory == 'function') {
            features.gears = '1'
        }

        // Other browser features
        features.res = this.screenAlias.width + 'x' + this.screenAlias.height
        features.cd = this.screenAlias.colorDepth
        if (useCookies) {
            features.cookie = this.hasCookies(testCookieName)
        }

        return features
    }

}

export default BrowserFeatureDetector

// export default {
//     hasLocalStorage,
//     detectBrowserFeatures,
//     detectSignature,
//     detectTimezone,
//     detectViewport,
//     hasCookies,
//     detectDocumentSize,
//     hasSessionStorage,
//     localStorageAccessible,
//     navigatorAlias,
//     screenAlias,
//     windowAlias,
// }
