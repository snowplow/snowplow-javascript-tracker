/*
 * JavaScript tracker for Snowplow: tracker.js
 *
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright
 * 2012-2016 Snowplow Analytics Ltd. All rights reserved.
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

import {
    addEventListener,
    attemptGetLocalStorage,
    attemptWriteLocalStorage,
    decorateQuerystring,
    findRootDomain,
    fixupDomain,
    fixupTitle,
    fixupUrl,
    fromQuerystring,
    getHostName,
    getReferrer,
    isValueInArray,
    pFloat,
    pInt,
    warn,
} from './Utilities'
import 'browser-cookie-lite'
import {
    detectSignature,
    detectTimezone,
    detectBrowserFeatures,
    detectViewport,
    detectDocumentSize,
} from './Detect'
import sha1 from 'sha1'
import FormTrackingManager from './FormTrackingManager'
import ErrorManager from './ErrorManager'
import OutQueueManager from './OutQueueManager'
import { trackerCore as coreConstructor } from '@snowplow/tracker-core'
import uuid from 'uuid'
import ConfigManager from './ConfigManager'
import LinkTrackingManager from './LinkTrackingManager'

// Symbols for private methods
const refreshUrl = Symbol('refreshUrl')
const linkDecorationHandler = Symbol('linkDecorationHandler')
const decorateLinks = Symbol('decorateLinks')
const ecommerceTransactionTemplate = Symbol('ecommerceTransactionTemplate')
const purify = Symbol('purify')
const getProtocolScheme = Symbol('getProtocolScheme')
const resolveRelativeReference = Symbol('resolveRelativeReference')
const sendRequest = Symbol('sendRequest')
const getSnowplowCookieName = Symbol('getSnowplowCookieName')
const getSnowplowCookieValue = Symbol('getSnowplowCookieValue')
const updateDomainHash = Symbol('updateDomainHash')
const activityHandler = Symbol('activityHandler')
const scrollHandler = Symbol('scrollHandler')
const getPageOffsets = Symbol('getPageOffsets')
const resetMaxScrolls = Symbol('resetMaxScrolls')
const cleanOffset = Symbol('cleanOffset')
const updateMaxScrolls = Symbol('updateMaxScrolls')
const setSessionCookie = Symbol('setSessionCookie')
const setDomainUserIdCookie = Symbol('setDomainUserIdCookie')
const setCookie = Symbol('setCookie')
const createNewDomainUserId = Symbol('createNewDomainUserId')
const initializeIdsAndCookies = Symbol('initializeIdsAndCookies')
const loadDomainUserIdCookie = Symbol('loadDomainUserIdCookie')
const addBrowserData = Symbol('addBrowserData')

const collectorUrlFromCfDist = Symbol('collectorUrlFromCfDist')

const asCollectorUrl = Symbol('asCollectorUrl')
const addCommonContexts = Symbol('addCommonContexts')
const resetPageView = Symbol('resetPageView')
const getPageViewId = Symbol('getPageViewId')

const getWebPageContext = Symbol('getWebPageContext')
const getPerformanceTimingContext = Symbol('getPerformanceTimingContext')

const getOptimizelyData = Symbol('getOptimizelyData')
const getOptimizelyXData = Symbol('getOptimizelyXData')
const getOptimizelySummary = Symbol('getOptimizelySummary')
const getOptimizelyXSummary = Symbol('getOptimizelyXSummary')
const getOptimizelyExperimentContexts = Symbol['getOptimizelyExperimentContexts']
const getOptimizelyStateContexts = Symbol('getOptimizelyStateContexts')
const getOptimizelyVariationContexts = Symbol('getOptimizelyVariationContexts')
const getOptimizelyVisitorContext = Symbol('getOptimizelyVisitorContext')
const getOptimizelyAudienceContexts = Symbol('getOptimizelyAudienceContexts')
const getOptimizelyDimensionContexts = Symbol('getOptimizelyDimensionContexts')
const getOptimizelySummaryContexts = Symbol('getOptimizelySummaryContexts')
const getOptimizelyXSummaryContexts = Symbol('getOptimizelyXSummaryContexts')

const getAugurIdentityLiteContext = Symbol('getAugurIdentityLiteContext')
const getParrableContext = Symbol('getParrableContext')

const newSession = Symbol('newSession')
const enableGeolocationContext = Symbol('enableGeolocationContext')
const getGaCookiesContext = Symbol('getGaCookiesContext')
const finalizeContexts = Symbol('finalizeContexts')
const logPageView = Symbol('logPageView')
const logPagePing = Symbol('logPagePing')
const logTransaction = Symbol('logTransaction')
const logTransactionItem = Symbol('logTransactionItem')
const prefixPropertyName = Symbol('prefixPropertyName')
const trackCallback = Symbol('trackCallback')

/**
 * Snowplow Tracker class
 * @class JavascriptTracker
 */
class JavascriptTracker {
    /**
     * Snowplow Tracker class constructor
     *
     * @param {String} functionName - global function name
     * @param {String} namespace - The namespace of the tracker object
     * @param {String} version - The current version of the JavaScript Tracker
     * @param {Object} mutSnowplowState - An object containing hasLoaded, registeredOnLoadHandlers, and expireDateTime
     * 									  Passed in by reference in case they are altered by snowplow.js
     * @param {TrackerConfiguration} argmap -  Optional dictionary of configuration options.
     * @returns {JavascriptTracker} - an isntance of the SnowplowTracker
     */
    constructor(functionName, namespace, version, mutSnowplowState, argmap) {
        this.configManager = new ConfigManager(argmap || {})
        const config = (this.config = this.configManager.config)
        const _this = this
        /************************************************************
         * * Private members
         * ************************************************************/

        // Debug - whether to raise errors to console and log to console
        // or silence all errors from public methods
        //this.debug = false

        // API functions of the tracker
        //this.apiMethods = {};

        // Safe methods (i.e. ones that won't raise errors)
        // These values should be guarded publicMethods
        //this.safeMethods = {};

        // The client-facing methods returned from tracker IIFE
        //this.returnMethods = {};

        this.mutSnowplowState = mutSnowplowState

        this.state = {
            documentAlias: document,
            windowAlias: window,
            navigatorAlias: navigator,
            get locationArray() {
                return fixupUrl(
                    this.documentAlias.domain,
                    this.windowAlias.location.href,
                    getReferrer()
                )
            },
            get domainAlias() {
                return fixupDomain(this.locationArray[0])
            },
            locationHrefAlias: '',
            referrerUrl: '',
            pagePingInterval: 20,
            customReferrer: '',
            requestMethod: 'GET',
            collectorUrl: '',
            customUrl: '',
            lastDocumentTitle: '',
            // get lastDocumentTitle() {
            //     return this.documentAlias.title
            // },
            lastConfigTitle: '',
            activityTrackingEnabled: false,
            minimumVisitTime: 0,
            heartBeatTimer: 0,
            //TODO: Should this be set to true by default?
            discardHashTag: false,
            cookiePath: '/',
            get dnt() {
                return (
                    this.navigatorAlias.doNotTrack ||
                    this.navigatorAlias.msDoNotTrack ||
                    this.windowAlias.doNotTrack
                )
            },
            get doNotTrack() {
                return (
                    config.respectDoNotTrack &&
                    (this.dnt === 'yes' ||
                        this.dnt === '1' ||
                        this.dnt === true)
                )
            },
            optOutCookie: false,
            countPreRendered: false,
            get documentCharset() {
                return (
                    this.documentAlias.characterSet ||
                    this.documentAlias.charset
                )
            },
            get forceSecureTracker() {
                return config.forceSecureTracker
            },
            get forceUnsecureTracker() {
                return !this.forceSecureTracker && config.forceUnsecureTracker
            },
            get browserLanguage() {
                return (
                    this.navigatorAlias.userLanguage ||
                    this.navigatorAlias.language
                )
            },
            get browserFeatures() {
                return detectBrowserFeatures(
                    config.stateStorageStrategy == 'cookie' ||
                        config.stateStorageStrategy == 'cookieAndLocalStorage',
                    _this[getSnowplowCookieName]('testcookie')
                )
            },
            get userFingerprint() {
                return config.userFingerprint === false
                    ? ''
                    : detectSignature(config.userFingerprintSeed)
            },
            trackerId: `${functionName}_${namespace}`,
            activityTrackingInstalled: false,
            lastActivityTime: null,
            lastEventTime: new Date().getTime(),
            minXOffset: 0,
            maxXOffset: 0,
            minYOffset: 0,
            maxYOffset: 0,
            hash: sha1,
            domainHash: null,
            domainUserId: null,
            memorizedSessionId: 1,
            businessUserId: null,
            ecommerceTransaction: _this[ecommerceTransactionTemplate](),
            geolocationContextAdded: false,
            commonContexts: [],
            enhancedEcommerceContexts: [],
            preservePageViewId: false,
            pageViewSent: false,
        }

        // Tracker core
        this.core = coreConstructor(true, payload => {
            this[addBrowserData](payload)
            this[sendRequest](payload, config.pageUnloadTimer)
        })

        // Manager for automatic link click tracking
        this.linkTrackingManager = new LinkTrackingManager(
            this.core,
            this.state.trackerId,
            this[addCommonContexts]
        )

        // Manager for automatic form tracking
        this.formTrackingManager = new FormTrackingManager(
            this.core,
            this.state.trackerId,
            this[addCommonContexts]
        )

        // Manager for tracking unhandled exceptions
        this.errorManager = new ErrorManager(this.core)

        // Manager for local storage queue
        this.outQueueManager = new OutQueueManager(
            functionName,
            namespace,
            mutSnowplowState,
            config.stateStorageStrategy == 'localStorage' ||
                config.stateStorageStrategy == 'cookieAndLocalStorage',
            config.post,
            config.bufferSize,
            config.maxPostBytes
        )

        if (config.discoverRootDomain) {
            config.cookieDomain = findRootDomain()
        }

        if (config.contexts.gaCookies) {
            this.state.commonContexts.push(this[getGaCookiesContext]())
        }

        if (config.contexts.geolocation) {
            this[enableGeolocationContext]()
        }

        // Enable base 64 encoding for self-describing events and custom contexts
        this.core.setBase64Encoding(config.encodeBase64)

        // Set up unchanging name-value pairs
        this.core.setTrackerVersion(version)
        this.core.setTrackerNamespace(namespace)
        this.core.setAppId(config.appId)
        this.core.setPlatform(config.platform)
        this.core.setTimezone(detectTimezone())
        this.core.addPayloadPair('lang', this.state.browserLanguage)
        this.core.addPayloadPair('cs', this.state.documentCharset)

        // Browser features. Cookies, color depth and resolution don't get prepended with f_ (because they're not optional features)
        const bf = this.state.browserFeatures
        Object.keys(bf).forEach(feature => {
            if (feature === 'res' || feature === 'cd' || feature === 'cookie') {
                this.core.addPayloadPair(feature, bf[feature])
            } else {
                this.core.addPayloadPair('f_' + feature, bf[feature])
            }
        })

        /*
         * Initialize tracker
         */
        this.state.locationHrefAlias = this.state.locationArray[1]
        this.state.referrerUrl = this.state.locationArray[2]

        this[updateDomainHash]()
        this[initializeIdsAndCookies]()

        if (config.crossDomainLinker) {
            this[decorateLinks](config.crossDomainLinker)
        }

        // Create guarded methods from apiMethods,
        // and set returnMethods to apiMethods or safeMethods depending on value of debug
        //safeMethods = productionize(apiMethods)
        //updateReturnMethods()
        //return returnMethods;
    }

    /**
     * Recalculate the domain, URL, and referrer
     **/
    [refreshUrl]() {
        // If this is a single-page app and the page URL has changed, then:
        //   - if the new URL's querystring contains a "refer(r)er" parameter, use it as the referrer
        //   - otherwise use the old URL as the referer

        //TODO: This might be able to be moved to a object literal function
        const _locationHrefAlias = this.state.locationHrefAlias
        if (this.state.locationArray[1] !== _locationHrefAlias) {
            this.state.ReferrerUrl = getReferrer(_locationHrefAlias)
        }

        this.state.locationHrefAlias = this.state.locationArray[1]
    }

    /**
     * Decorate the querystring of a single link
     *
     * @param event e The event targeting the link
     */
    [linkDecorationHandler](e) {
        const _timestamp = new Date().getTime()
        if (e.target.href) {
            e.target.href = decorateQuerystring(
                e.target.href,
                '_sp',
                `${this.state.domainUserId}.${_timestamp}`
            )
        }
    }

    /**
     * Enable querystring decoration for links pasing a filter
     * Whenever such a link is clicked on or navigated to via the keyboard,
     * add "_sp={{duid}}.{{timestamp}}" to its querystring
     *
     * @param crossDomainLinker Function used to determine which links to decorate
     */
    [decorateLinks](crossDomainLinker) {
        for (let i = 0; i < this.state.documentAlias.links.length; i++) {
            const elt = this.state.documentAlias.links[i]
            if (!elt.spDecorationEnabled && crossDomainLinker(elt)) {
                addEventListener(
                    elt,
                    'click',
                    e => {
                        this[linkDecorationHandler](e)
                    },
                    true
                )
                addEventListener(
                    elt,
                    'mousedown',
                    e => {
                        this[linkDecorationHandler](e)
                    },
                    true
                )

                // Don't add event listeners more than once
                elt.spDecorationEnabled = true
            }
        }
    }

    /*
     * Initializes an empty ecommerce
     * transaction and line items
     */
    [ecommerceTransactionTemplate]() {
        return {
            transaction: {},
            items: [],
        }
    }

    /*
     * Removes hash tag from the URL
     *
     * URLs are purified before being recorded in the cookie,
     * or before being sent as GET parameters
     */
    [purify](url) {
        return this.state.discardHashTag ? url.replace(/#.*/, '') : url
    }

    /*
     * Extract scheme/protocol from URL
     */
    [getProtocolScheme](url) {
        const matches = /^([a-z]+):/.exec(url)
        return matches ? matches[1] : null
    }

    /*
     * Resolve relative reference
     *
     * Note: not as described in rfc3986 section 5.2
     */
    [resolveRelativeReference](baseUrl, url) {
        let protocol = this[getProtocolScheme](url),
            i

        if (protocol) {
            return url
        }

        if (url.slice(0, 1) === '/') {
            return `${this[getProtocolScheme](baseUrl)}://${getHostName(
                baseUrl
            )}${url}`
        }

        baseUrl = this[purify](baseUrl)
        if ((i = baseUrl.indexOf('?')) >= 0) {
            baseUrl = baseUrl.slice(0, i)
        }

        if ((i = baseUrl.lastIndexOf('/')) !== baseUrl.length - 1) {
            baseUrl = baseUrl.slice(0, i + 1)
        }

        return `${baseUrl}${url}`
    }

    /*
     * Send request
     */
    [sendRequest](request, delay) {
        var now = new Date()

        // Set to true if Opt-out cookie is defined
        let toOptoutByCookie
        if (this.state.optOutCookie) {
            toOptoutByCookie = !!window.cookie(this.state.optOutCookie)
        } else {
            toOptoutByCookie = false
        }

        if (!(this.config.doNotTrack || toOptoutByCookie)) {
            this.outQueueManager.enqueueRequest(
                request.build(),
                this.config.collectorUrl
            )
            this.mutSnowplowState.expireDateTime = now.getTime() + delay
        }
    }

    /*
     * Get cookie name with prefix and domain hash
     */
    [getSnowplowCookieName](baseName) {
        return `${this.config.cookieName}${baseName}.${this.state.domainHash}`
    }

    /*
     * Cookie getter.
     */
    [getSnowplowCookieValue](cookieName) {
        var fullName = this[getSnowplowCookieName](cookieName)
        if (this.config.stateStorageStrategy == 'localStorage') {
            return attemptGetLocalStorage(fullName)
        } else if (
            this.config.stateStorageStrategy == 'cookie' ||
            this.config.stateStorageStrategy == 'cookieAndLocalStorage'
        ) {
            return window.cookie(fullName)
        }
    }

    /*
     * Update domain hash
     */
    [updateDomainHash]() {
        this[refreshUrl]()
        this.state.domainHash = this.state
            .hash(
                (this.config.cookieDomain || this.state.domainAlias) +
                    (this.state.cookiePath || '/')
            )
            .slice(0, 4) // 4 hexits = 16 bits
    }

    /*
     * Process all "activity" events.
     * For performance, this function must have low overhead.
     */
    [activityHandler]() {
        var now = new Date()
        this.state.lastActivityTime = now.getTime()
    }

    /*
     * Process all "scroll" events.
     */
    [scrollHandler]() {
        this[updateMaxScrolls]()
        this[activityHandler]()
    }

    /*
     * Returns [pageXOffset, pageYOffset].
     * Adapts code taken from: http://www.javascriptkit.com/javatutors/static2.shtml
     */
    [getPageOffsets]() {
        var iebody =
            this.state.documentAlias.compatMode &&
            this.state.documentAlias.compatMode !== 'BackCompat'
                ? this.state.documentAlias.documentElement
                : this.state.documentAlias.body
        return [
            iebody.scrollLeft || this.state.windowAlias.pageXOffset,
            iebody.scrollTop || this.state.windowAlias.pageYOffset,
        ]
    }

    /*
     * Quick initialization/reset of max scroll levels
     */
    [resetMaxScrolls]() {
        const offsets = this[getPageOffsets]()

        const x = offsets[0],
            y = offsets[1]
        this.state.minXOffset = x
        this.state.maxXOffset = x

        this.state.minYOffset = y
        this.state.maxYOffset = y
    }

    /*
     * Check the max scroll levels, updating as necessary
     */
    [updateMaxScrolls]() {
        var offsets = this[getPageOffsets]()

        const x = offsets[0],
            y = offsets[1]
        if (x < this.state.minXOffset) {
            this.state.minXOffset = x
        } else if (x > this.state.maxXOffset) {
            this.state.maxXOffset = x
        }

        if (y < this.state.minYOffset) {
            this.state.minYOffset = y
        } else if (y > this.state.maxYOffset) {
            this.state.maxYOffset = y
        }
    }

    /*
     * Prevents offsets from being decimal or NaN
     * See https://github.com/snowplow/snowplow-javascript-tracker/issues/324
     * TODO: the NaN check should be moved into the core
     */
    [cleanOffset](offset) {
        const rounded = Math.round(offset)
        if (!isNaN(rounded)) {
            return rounded
        }
    }

    /*
     * Sets or renews the session cookie
     */
    [setSessionCookie]() {
        const cookieName = this[getSnowplowCookieName]('ses')
        const cookieValue = '*'
        this[setCookie](
            cookieName,
            cookieValue,
            this.config.sessionCookieTimeout
        )
    }

    /*
     * Sets the Visitor ID cookie: either the first time loadDomainUserIdCookie is called
     * or when there is a new visit or a new page view
     */
    [setDomainUserIdCookie](
        _domainUserId,
        createTs,
        visitCount,
        nowTs,
        lastVisitTs,
        sessionId
    ) {
        var cookieName = this[getSnowplowCookieName]('id')
        var cookieValue =
            _domainUserId +
            '.' +
            createTs +
            '.' +
            visitCount +
            '.' +
            nowTs +
            '.' +
            lastVisitTs +
            '.' +
            sessionId
        this[setCookie](
            cookieName,
            cookieValue,
            this.config.sessionCookieTimeout
        )
    }

    /*
     * Sets a cookie based on the storage strategy:
     * - if 'localStorage': attemps to write to local storage
     * - if 'cookie': writes to cookies
     * - otherwise: no-op
     */
    [setCookie](name, value, timeout) {
        if (this.config.stateStorageStrategy == 'localStorage') {
            attemptWriteLocalStorage(name, value)
        } else if (
            this.config.stateStorageStrategy == 'cookie' ||
            this.config.stateStorageStrategy == 'cookieAndLocalStorage'
        ) {
            window.cookie(
                name,
                value,
                timeout,
                this.config.cookiePath,
                this.config.cookieDomain
            )
        }
    }

    /**
     * Generate a pseudo-unique ID to fingerprint this user
     */
    [createNewDomainUserId]() {
        return uuid.v4()
    }

    /*
     * Load the domain user ID and the session ID
     * Set the cookies (if cookies are enabled)
     */
    [initializeIdsAndCookies]() {
        const sesCookieSet =
            this.config.stateStorageStrategy != 'none' &&
            !!this[getSnowplowCookieValue]('ses')
        const idCookieComponents = this[loadDomainUserIdCookie]()

        if (idCookieComponents[1]) {
            this.state.domainUserId = idCookieComponents[1]
        } else {
            this.state.domainUserId = this[createNewDomainUserId]()
            idCookieComponents[1] = this.state.domainUserId
        }

        this.state.memorizedSessionId = idCookieComponents[6]

        if (!sesCookieSet) {
            // Increment the session ID
            idCookieComponents[3]++
            // Create a new sessionId
            this.state.memorizedSessionId = uuid.v4()
            idCookieComponents[6] = this.state.memorizedSessionId
            // Set lastVisitTs to currentVisitTs
            idCookieComponents[5] = idCookieComponents[4]
        }

        if (this.config.stateStorageStrategy != 'none') {
            this[setSessionCookie]()
            // Update currentVisitTs
            idCookieComponents[4] = Math.round(new Date().getTime() / 1000)
            idCookieComponents.shift()
            this[setDomainUserIdCookie].apply(this, idCookieComponents)
        }
    }

    /*
     * Load visitor ID cookie
     */
    [loadDomainUserIdCookie]() {
        if (this.config.stateStorageStrategy == 'none') {
            return []
        }
        const now = new Date(),
            nowTs = Math.round(now.getTime() / 1000),
            id = this[getSnowplowCookieValue]('id')
        let tmpContainer

        if (id) {
            tmpContainer = id.split('.')
            // cookies enabled
            tmpContainer.unshift('0')
        } else {
            tmpContainer = [
                // cookies disabled
                '1',
                // Domain user ID
                this.state.domainUserId,
                // Creation timestamp - seconds since Unix epoch
                nowTs,
                // visitCount - 0 = no previous visit
                0,
                // Current visit timestamp
                nowTs,
                // Last visit timestamp - blank meaning no previous visit
                '',
            ]
        }

        if (!tmpContainer[6]) {
            // session id
            tmpContainer[6] = uuid.v4()
        }

        return tmpContainer
    }

    /*
     * Attaches common web fields to every request
     * (resolution, url, referrer, etc.)
     * Also sets the required cookies.
     */
    [addBrowserData](sb) {
        var nowTs = Math.round(new Date().getTime() / 1000),
            idname = this[getSnowplowCookieName]('id'),
            sesname = this[getSnowplowCookieName]('ses'),
            ses = this[getSnowplowCookieValue]('ses'),
            id = this[loadDomainUserIdCookie](),
            cookiesDisabled = id[0],
            _domainUserId = id[1], // We could use the global (domainUserId) but this is better etiquette
            createTs = id[2],
            visitCount = id[3],
            currentVisitTs = id[4],
            lastVisitTs = id[5],
            sessionIdFromCookie = id[6]

        let toOptoutByCookie
        if (this.state.optOutCookie) {
            toOptoutByCookie = !!window.cookie(this.state.optOutCookie)
        } else {
            toOptoutByCookie = false
        }

        if (
            (this.config.doNotTrack || toOptoutByCookie) &&
            this.config.stateStorageStrategy != 'none'
        ) {
            if (this.config.stateStorageStrategy == 'localStorage') {
                attemptWriteLocalStorage(idname, '')
                attemptWriteLocalStorage(sesname, '')
            } else if (
                this.config.stateStorageStrategy == 'cookie' ||
                this.config.stateStorageStrategy == 'cookieAndLocalStorage'
            ) {
                window.cookie(
                    idname,
                    '',
                    -1,
                    this.config.cookiePath,
                    this.config.cookieDomain
                )
                window.cookie(
                    sesname,
                    '',
                    -1,
                    this.config.cookiePath,
                    this.config.cookieDomain
                )
            }
            return
        }

        // If cookies are enabled, base visit count and session ID on the cookies
        if (cookiesDisabled === '0') {
            this.state.memorizedSessionId = sessionIdFromCookie

            // New session?
            if (!ses && this.config.stateStorageStrategy != 'none') {
                // New session (aka new visit)
                visitCount++
                // Update the last visit timestamp
                lastVisitTs = currentVisitTs
                // Regenerate the session ID
                this.state.memorizedSessionId = uuid.v4()
            }

            this.state.memorizedVisitCount = visitCount

            // Otherwise, a new session starts if configSessionCookieTimeout seconds have passed since the last event
        } else {
            if (
                new Date().getTime() - this.state.lastEventTime >
                this.config.sessionCookieTimeout * 1000
            ) {
                this.state.memorizedSessionId = uuid.v4()
                this.state.memorizedVisitCount++
            }
        }

        // Build out the rest of the request
        sb.add('vp', detectViewport())
        sb.add('ds', detectDocumentSize())
        sb.add('vid', this.state.memorizedVisitCount)
        sb.add('sid', this.state.memorizedSessionId)
        sb.add('duid', _domainUserId) // Set to our local variable
        sb.add('fp', this.state.userFingerprint)
        sb.add('uid', this.state.businessUserId)

        this[refreshUrl]()

        sb.add(
            'refr',
            this[purify](this.config.customReferrer || this.state.referrerUrl)
        )

        // Add the page URL last as it may take us over the IE limit (and we don't always need it)
        sb.add(
            'url',
            this[purify](
                this.config.customReferrer || this.state.locationHrefAlias
            )
        )

        // Update cookies
        if (this.config.stateStorageStrategy != 'none') {
            this[setDomainUserIdCookie](
                _domainUserId,
                createTs,
                this.state.memorizedVisitCount,
                nowTs,
                lastVisitTs,
                this.state.memorizedSessionId
            )
            this[setSessionCookie]()
        }

        this.state.lastEventTime = new Date().getTime()
    }

    /**
     * Builds a collector URL from a CloudFront distribution.
     * We don't bother to support custom CNAMEs because Amazon CloudFront doesn't support that for SSL.
     *
     * @param string account The account ID to build the tracker URL from
     *
     * @return string The URL on which the collector is hosted
     */
    [collectorUrlFromCfDist](distSubdomain) {
        return this[asCollectorUrl](distSubdomain + '.cloudfront.net')
    }

    /**
     * Adds the protocol in front of our collector URL, and i to the end
     *
     * @param string rawUrl The collector URL without protocol
     *
     * @return string collectorUrl The tracker URL with protocol
     */
    [asCollectorUrl](rawUrl) {
        if (this.state.forceSecureTracker) {
            return `https://${rawUrl}`
        }
        if (this.state.forceUnsecureTracker) {
            return `http://${rawUrl}`
        }
        return (
            ('https:' === this.state.documentAlias.location.protocol
                ? 'https'
                : 'http') + `://${rawUrl}`
        )
    }

    /**
     * Add common contexts to every event
     * TODO: move this functionality into the core
     *
     * @param array userContexts List of user-defined contexts
     * @return userContexts combined with commonContexts
     */
    [addCommonContexts](userContexts) {
        var combinedContexts = this.state.commonContexts.concat(
            userContexts || []
        )

        if (this.config.contexts.webPage) {
            combinedContexts.push(this[getWebPageContext]())
        }

        // Add PerformanceTiming Context
        if (this.config.contexts.performanceTiming) {
            const performanceTimingContext = this[getPerformanceTimingContext]()
            if (performanceTimingContext) {
                combinedContexts.push(performanceTimingContext)
            }
        }

        // Add Optimizely Contexts
        if (this.state.windowAlias.optimizely) {
            if (this.config.contexts.optimizelySummary) {
                const activeExperiments = this[getOptimizelySummaryContexts]()
                activeExperiments.forEach(function(e) {
                    combinedContexts.push(e)
                })
            }

            if (this.config.contexts.optimizelyXSummary) {
                const activeExperiments = this[getOptimizelyXSummaryContexts]()
                activeExperiments.forEach(function(e) {
                    combinedContexts.push(e)
                })
            }

            if (this.config.contexts.optimizelyExperiments) {
                const experimentContexts = this[
                    getOptimizelyExperimentContexts
                ]()
                experimentContexts.forEach(function(e) {
                    combinedContexts.push(e)
                })
                // for (var i = 0; i < experimentContexts.length; i++) {
                //     combinedContexts.push(experimentContexts[i])
                // }
            }

            if (this.config.contexts.optimizelyStates) {
                const stateContexts = this[getOptimizelyStateContexts]()
                stateContexts.forEach(function(e) {
                    combinedContexts.push(e)
                })
                // for (var i = 0; i < stateContexts.length; i++) {
                //     combinedContexts.push(stateContexts[i])
                // }
            }

            if (this.config.contexts.optimizelyVariations) {
                const variationContexts = this[getOptimizelyVariationContexts]()
                variationContexts.forEach(function(e) {
                    combinedContexts.push(e)
                })
                // for (var i = 0; i < variationContexts.length; i++) {
                //     combinedContexts.push(variationContexts[i])
                // }
            }

            if (this.config.contexts.optimizelyVisitor) {
                const optimizelyVisitorContext = getOptimizelyVisitorContext()
                if (optimizelyVisitorContext) {
                    combinedContexts.push(optimizelyVisitorContext)
                }
            }

            if (this.config.contexts.optimizelyAudiences) {
                const audienceContexts = getOptimizelyAudienceContexts()
                for (var i = 0; i < audienceContexts.length; i++) {
                    combinedContexts.push(audienceContexts[i])
                }
            }

            if (this.config.contexts.optimizelyDimensions) {
                var dimensionContexts = getOptimizelyDimensionContexts()
                dimensionContexts.forEach(function(e) {
                    combinedContexts.push(e)
                })
                // for (var i = 0; i < dimensionContexts.length; i++) {
                //     combinedContexts.push(dimensionContexts[i])
                // }
            }
        }

        // Add Augur Context
        if (this.config.contexts.augurIdentityLite) {
            const augurIdentityLiteContext = this[getAugurIdentityLiteContext]()
            if (augurIdentityLiteContext) {
                combinedContexts.push(augurIdentityLiteContext)
            }
        }

        //Add Parrable Context
        if (this.config.contexts.parrable) {
            var parrableContext = this[getParrableContext]()
            if (parrableContext) {
                combinedContexts.push(parrableContext)
            }
        }
        return combinedContexts
    }

    /**
     * Initialize new `pageViewId` if it shouldn't be preserved.
     * Should be called when `trackPageView` is invoked
     */
    [resetPageView]() {
        if (
            !this.state.preservePageViewId ||
            this.mutSnowplowState.pageViewId == null
        ) {
            this.mutSnowplowState.pageViewId = uuid.v4()
        }
    }

    /**
     * Safe function to get `pageViewId`.
     * Generates it if it wasn't initialized by other tracker
     */
    [getPageViewId]() {
        if (this.mutSnowplowState.pageViewId == null) {
            this.mutSnowplowState.pageViewId = uuid.v4()
        }
        return this.mutSnowplowState.pageViewId
    }

    /**
     * Put together a web page context with a unique UUID for the page view
     *
     * @return object web_page context
     */
    [getWebPageContext]() {
        return {
            schema:
                'iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0',
            data: {
                id: this[getPageViewId](),
            },
        }
    }

    /**
     * Creates a context from the window.performance.timing object
     *
     * @return object PerformanceTiming context
     */
    [getPerformanceTimingContext]() {
        var allowedKeys = [
            'navigationStart',
            'redirectStart',
            'redirectEnd',
            'fetchStart',
            'domainLookupStart',
            'domainLookupEnd',
            'connectStart',
            'secureConnectionStart',
            'connectEnd',
            'requestStart',
            'responseStart',
            'responseEnd',
            'unloadEventStart',
            'unloadEventEnd',
            'domLoading',
            'domInteractive',
            'domContentLoadedEventStart',
            'domContentLoadedEventEnd',
            'domComplete',
            'loadEventStart',
            'loadEventEnd',
            'msFirstPaint',
            'chromeFirstPaint',
            'requestEnd',
            'proxyStart',
            'proxyEnd',
        ]
        const performance =
            this.state.windowAlias.performance ||
            this.state.windowAlias.mozPerformance ||
            this.state.windowAlias.msPerformance ||
            this.state.windowAlias.webkitPerformance
        if (performance) {
            // On Safari, the fields we are interested in are on the prototype chain of
            // performance.timing so we cannot copy them using lodash.clone
            let performanceTiming = {}
            for (var field in performance.timing) {
                if (
                    isValueInArray(field, allowedKeys) &&
                    performance.timing[field] !== null
                ) {
                    performanceTiming[field] = performance.timing[field]
                }
            }

            // Old Chrome versions add an unwanted requestEnd field
            delete performanceTiming.requestEnd

            // Add the Chrome firstPaintTime to the performance if it exists
            if (
                this.state.windowAlias.chrome &&
                this.state.windowAlias.chrome.loadTimes &&
                typeof this.state.windowAlias.chrome.loadTimes()
                    .firstPaintTime === 'number'
            ) {
                performanceTiming.chromeFirstPaint = Math.round(
                    this.state.windowAlias.chrome.loadTimes().firstPaintTime *
                        1000
                )
            }

            return {
                schema: 'iglu:org.w3/PerformanceTiming/jsonschema/1-0-0',
                data: performanceTiming,
            }
        }
    }

    /**
     * Check that *both* optimizely and optimizely.data exist and return
     * optimizely.data.property
     *
     * @param property optimizely data property
     * @param snd optional nested property
     */
    [getOptimizelyData](property, snd) {
        var data
        if (
            this.state.windowAlias.optimizely &&
            this.state.windowAlias.optimizely.data
        ) {
            data = this.state.windowAlias.optimizely.data[property]
            if (typeof snd !== 'undefined' && data !== undefined) {
                data = data[snd]
            }
        }
        return data
    }

    /**
     * Check that *both* optimizely and optimizely.data exist
     *
     * @param property optimizely data property
     * @param snd optional nested property
     */
    [getOptimizelyXData](property, snd) {
        var data
        if (this.state.windowAlias.optimizely) {
            data = this.state.windowAlias.optimizely.get(property)
            if (typeof snd !== 'undefined' && data !== undefined) {
                data = data[snd]
            }
        }
        return data
    }

    /**
     * Get data for Optimizely "lite" contexts - active experiments on current page
     *
     * @returns Array content of lite optimizely lite context
     */
    [getOptimizelySummary]() {
        var state = this[getOptimizelyData]('state')
        var experiments = this[getOptimizelyData]('experiments')

        return (state && experiments && state.activeExperiments).map(function(
            activeExperiment
        ) {
            var current = experiments[activeExperiment]
            return {
                activeExperimentId: activeExperiment.toString(),
                // User can be only in one variation (don't know why is this array)
                variation: state.variationIdsMap[
                    activeExperiment
                ][0].toString(),
                conditional: current && current.conditional,
                manual: current && current.manual,
                name: current && current.name,
            }
        })
    }

    /**
     * Get data for OptimizelyX contexts - active experiments on current page
     *
     * @returns Array content of lite optimizely lite context
     */
    [getOptimizelyXSummary]() {
        const state = this[getOptimizelyXData]('state')
        const experiment_ids = state.getActiveExperimentIds()
        //const experiments = this[getOptimizelyXData]('data', 'experiments')
        const visitor = this[getOptimizelyXData]('visitor')

        return experiment_ids.map(activeExperiment => {
            const variation = state.getVariationMap()[activeExperiment]
            const variationName = variation.name
            const variationId = variation.id
            const visitorId = visitor.visitorId
            return {
                experimentId: pInt(activeExperiment),
                variationName: variationName,
                variation: pInt(variationId),
                visitorId: visitorId,
            }
        })
    }

    /**
     * Creates a context from the window['optimizely'].data.experiments object
     *
     * @return Array Experiment contexts
     */
    [getOptimizelyExperimentContexts]() {
        const experiments = this[getOptimizelyData]('experiments')
        if (experiments) {
            var contexts = []

            for (var key in experiments) {
                if (experiments.hasOwnProperty(key)) {
                    var context = {}
                    context.id = key
                    var experiment = experiments[key]
                    context.code = experiment.code
                    context.manual = experiment.manual
                    context.conditional = experiment.conditional
                    context.name = experiment.name
                    context.variationIds = experiment.variation_ids

                    contexts.push({
                        schema:
                            'iglu:com.optimizely/experiment/jsonschema/1-0-0',
                        data: context,
                    })
                }
            }
            return contexts
        }
        return []
    }

    /**
     * Creates a context from the window['optimizely'].data.state object
     *
     * @return Array State contexts
     */
    [getOptimizelyStateContexts]() {
        var experimentIds = []
        var experiments = this[getOptimizelyData]('experiments')
        if (experiments) {
            for (var key in experiments) {
                if (experiments.hasOwnProperty(key)) {
                    experimentIds.push(key)
                }
            }
        }

        var state = this[getOptimizelyData]('state')
        if (state) {
            var contexts = []
            var activeExperiments = state.activeExperiments || []

            for (var i = 0; i < experimentIds.length; i++) {
                var experimentId = experimentIds[i]
                var context = {}
                context.experimentId = experimentId
                context.isActive = isValueInArray(
                    experimentIds[i],
                    activeExperiments
                )
                var variationMap = state.variationMap || {}
                context.variationIndex = variationMap[experimentId]
                var variationNamesMap = state.variationNamesMap || {}
                context.variationName = variationNamesMap[experimentId]
                var variationIdsMap = state.variationIdsMap || {}
                if (
                    variationIdsMap[experimentId] &&
                    variationIdsMap[experimentId].length === 1
                ) {
                    context.variationId = variationIdsMap[experimentId][0]
                }

                contexts.push({
                    schema: 'iglu:com.optimizely/state/jsonschema/1-0-0',
                    data: context,
                })
            }
            return contexts
        }
        return []
    }

    /**
     * Creates a context from the window['optimizely'].data.variations object
     *
     * @return Array Variation contexts
     */
    [getOptimizelyVariationContexts]() {
        var variations = this[getOptimizelyData]('variations')
        if (variations) {
            var contexts = []

            for (var key in variations) {
                if (variations.hasOwnProperty(key)) {
                    var context = {}
                    context.id = key
                    var variation = variations[key]
                    context.name = variation.name
                    context.code = variation.code

                    contexts.push({
                        schema:
                            'iglu:com.optimizely/variation/jsonschema/1-0-0',
                        data: context,
                    })
                }
            }
            return contexts
        }
        return []
    }

    /**
     * Creates a context from the window['optimizely'].data.visitor object
     *
     * @return object Visitor context
     */
    [getOptimizelyVisitorContext]() {
        var visitor = this[getOptimizelyData]('visitor')
        if (visitor) {
            var context = {}
            context.browser = visitor.browser
            context.browserVersion = visitor.browserVersion
            context.device = visitor.device
            context.deviceType = visitor.deviceType
            context.ip = visitor.ip
            var platform = visitor.platform || {}
            context.platformId = platform.id
            context.platformVersion = platform.version
            var location = visitor.location || {}
            context.locationCity = location.city
            context.locationRegion = location.region
            context.locationCountry = location.country
            context.mobile = visitor.mobile
            context.mobileId = visitor.mobileId
            context.referrer = visitor.referrer
            context.os = visitor.os

            return {
                schema: 'iglu:com.optimizely/visitor/jsonschema/1-0-0',
                data: context,
            }
        }
    }

    /**
     * Creates a context from the window['optimizely'].data.visitor.audiences object
     *
     * @return Array VisitorAudience contexts
     */
    [getOptimizelyAudienceContexts]() {
        var audienceIds = this[getOptimizelyData]('visitor', 'audiences')
        if (audienceIds) {
            var contexts = []

            for (var key in audienceIds) {
                if (audienceIds.hasOwnProperty(key)) {
                    var context = { id: key, isMember: audienceIds[key] }

                    contexts.push({
                        schema:
                            'iglu:com.optimizely/visitor_audience/jsonschema/1-0-0',
                        data: context,
                    })
                }
            }
            return contexts
        }
        return []
    }

    /**
     * Creates a context from the window['optimizely'].data.visitor.dimensions object
     *
     * @return Array VisitorDimension contexts
     */
    [getOptimizelyDimensionContexts]() {
        var dimensionIds = this[getOptimizelyData]('visitor', 'dimensions')
        if (dimensionIds) {
            var contexts = []

            for (var key in dimensionIds) {
                if (dimensionIds.hasOwnProperty(key)) {
                    var context = { id: key, value: dimensionIds[key] }

                    contexts.push({
                        schema:
                            'iglu:com.optimizely/visitor_dimension/jsonschema/1-0-0',
                        data: context,
                    })
                }
            }
            return contexts
        }
        return []
    }

    /**
     * Creates an Optimizely lite context containing only data required to join
     * event to experiment data
     *
     * @returns Array of custom contexts
     */
    [getOptimizelySummaryContexts]() {
        return this[getOptimizelySummary]().map(experiment => {
            return {
                schema:
                    'iglu:com.optimizely.snowplow/optimizely_summary/jsonschema/1-0-0',
                data: experiment,
            }
        })
    }

    /**
     * Creates an OptimizelyX context containing only data required to join
     * event to experiment data
     *
     * @returns Array of custom contexts
     */
    [getOptimizelyXSummaryContexts]() {
        return this[getOptimizelyXSummary]().map(experiment => {
            return {
                schema:
                    'iglu:com.optimizely.optimizelyx/summary/jsonschema/1-0-0',
                data: experiment,
            }
        })
    }

    /**
     * Creates a context from the window['augur'] object
     *
     * @return object The IdentityLite context
     */
    [getAugurIdentityLiteContext]() {
        var augur = this.state.windowAlias.augur
        if (augur) {
            var context = { consumer: {}, device: {} }
            var consumer = augur.consumer || {}
            context.consumer.UUID = consumer.UID
            var device = augur.device || {}
            context.device.ID = device.ID
            context.device.isBot = device.isBot
            context.device.isProxied = device.isProxied
            context.device.isTor = device.isTor
            var fingerprint = device.fingerprint || {}
            context.device.isIncognito = fingerprint.browserHasIncognitoEnabled

            return {
                schema: 'iglu:io.augur.snowplow/identity_lite/jsonschema/1-0-0',
                data: context,
            }
        }
    }

    /**
     * Creates a context from the window['_hawk'] object
     *
     * @return object The Parrable context
     */
    [getParrableContext]() {
        var parrable = window['_hawk']
        if (parrable) {
            var context = { encryptedId: null, optout: null }
            context['encryptedId'] = parrable.browserid
            var regex = new RegExp(
                    '(?:^|;)\\s?' +
                        '_parrable_hawk_optout'.replace(
                            /([.*+?^=!:${}()|[\]/\\])/g,
                            '\\$1'
                        ) +
                        '=(.*?)(?:;|$)',
                    'i'
                ),
                match = document.cookie.match(regex)
            context['optout'] =
                match && decodeURIComponent(match[1])
                    ? match && decodeURIComponent(match[1])
                    : 'false'
            return {
                schema: 'iglu:com.parrable/encrypted_payload/jsonschema/1-0-0',
                data: context,
            }
        }
    }

    /**
     * Expires current session and starts a new session.
     */
    [newSession]() {
        // If cookies are enabled, base visit count and session ID on the cookies
        var nowTs = Math.round(new Date().getTime() / 1000),
            //ses = this[getSnowplowCookieValue]('ses'),
            id = this[loadDomainUserIdCookie](),
            cookiesDisabled = id[0],
            _domainUserId = id[1], // We could use the global (domainUserId) but this is better etiquette
            createTs = id[2],
            visitCount = id[3],
            currentVisitTs = id[4],
            lastVisitTs = id[5],
            sessionIdFromCookie = id[6]

        // When cookies are enabled
        if (cookiesDisabled === '0') {
            this.state.memorizedSessionId = sessionIdFromCookie

            // When cookie/local storage is enabled - make a new session
            if (this.stateStorageStrategy != 'none') {
                // New session (aka new visit)
                visitCount++
                // Update the last visit timestamp
                lastVisitTs = currentVisitTs
                // Regenerate the session ID
                this.state.memorizedSessionId = uuid.v4()
            }

            this.state.memorizedVisitCount = visitCount

            // Create a new session cookie
            setSessionCookie()
        } else {
            this.state.memorizedSessionId = uuid.v4()
            this.state.memorizedVisitCount++
        }

        // Update cookies
        if (this.config.stateStorageStrategy != 'none') {
            setDomainUserIdCookie(
                _domainUserId,
                createTs,
                this.state.memorizedVisitCount,
                nowTs,
                lastVisitTs,
                this.state.memorizedSessionId
            )
            setSessionCookie()
        }

        this.state.lastEventTime = new Date().getTime()
    }

    /**
     * Attempts to create a context using the geolocation API and add it to commonContexts
     */
    [enableGeolocationContext]() {
        if (
            !this.state.geolocationContextAdded &&
            this.state.navigatorAlias.geolocation &&
            this.state.navigatorAlias.geolocation.getCurrentPosition
        ) {
            this.state.geolocationContextAdded = true
            this.state.navigatorAlias.geolocation.getCurrentPosition(
                position => {
                    var coords = position.coords
                    var geolocationContext = {
                        schema:
                            'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
                        data: {
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                            latitudeLongitudeAccuracy: coords.accuracy,
                            altitude: coords.altitude,
                            altitudeAccuracy: coords.altitudeAccuracy,
                            bearing: coords.heading,
                            speed: coords.speed,
                            timestamp: Math.round(position.timestamp),
                        },
                    }
                    this.state.commonContexts.push(geolocationContext)
                }
            )
        }
    }

    /**
     * Creates a context containing the values of the cookies set by GA
     *
     * @return object GA cookies context
     */
    [getGaCookiesContext]() {
        const gaCookieData = {}
        const gaCookies = [
            '__utma',
            '__utmb',
            '__utmc',
            '__utmv',
            '__utmz',
            '_ga',
        ]
        gaCookies.forEach(function(cookieType) {
            var value = window.cookie(cookieType)
            if (value) {
                gaCookieData[cookieType] = value
            }
        })
        return {
            schema: 'iglu:com.google.analytics/cookies/jsonschema/1-0-0',
            data: gaCookieData,
        }
    }

    /**
     * Combine an array of unchanging contexts with the result of a context-creating function
     *
     * @param staticContexts Array of custom contexts
     * @param contextCallback Function returning an array of contexts
     */
    [finalizeContexts](staticContexts, contextCallback) {
        return (staticContexts || []).concat(
            contextCallback ? contextCallback() : []
        )
    }

    /**
     * Log the page view / visit
     *
     * @param customTitle string The user-defined page title to attach to this page view
     * @param context object Custom context relating to the event
     * @param contextCallback Function returning an array of contexts
     * @param tstamp number
     */
    [logPageView](customTitle, context, contextCallback, tstamp) {
        //TODO: This function is a monster and probably should be refactored.
        this[refreshUrl]()
        if (this.state.pageViewSent) {
            // Do not reset pageViewId if previous events were not page_view
            this[resetPageView]()
        }
        this.state.pageViewSent = true

        // So we know what document.title was at the time of trackPageView
        this.state.lastDocumentTitle = this.state.documentAlias.title
        this.state.lastConfigTitle = customTitle

        // Fixup page title
        var pageTitle = fixupTitle(
            this.state.lastConfigTitle || this.state.lastDocumentTitle
        )

        // Log page view
        this.core.trackPageView(
            this[purify](this.config.customUrl || this.state.locationHrefAlias),
            pageTitle,
            this[purify](this.state.customReferrer || this.state.referrerUrl),
            this[addCommonContexts](
                this[finalizeContexts](context, contextCallback)
            ),
            tstamp
        )

        // Send ping (to log that user has stayed on page)
        var now = new Date()

        if (
            this.state.activityTrackingEnabled &&
            !this.state.activityTrackingInstalled
        ) {
            this.state.activityTrackingInstalled = true

            // Add mousewheel event handler, detect passive event listeners for performance
            var detectPassiveEvents = {
                update: function update() {
                    if (
                        typeof window !== 'undefined' &&
                        typeof window.addEventListener === 'function'
                    ) {
                        var passive = false
                        var options = Object.defineProperty({}, 'passive', {
                            get: function() {
                                return (passive = true)
                            },
                        })
                        // note: have to set and remove a no-op listener instead of null
                        // (which was used previously), becasue Edge v15 throws an error
                        // when providing a null callback.
                        // https://github.com/rafrex/detect-passive-events/pull/3
                        var noop = function noop() {}
                        window.addEventListener(
                            'testPassiveEventSupport',
                            noop,
                            options
                        )
                        window.removeEventListener(
                            'testPassiveEventSupport',
                            noop,
                            options
                        )
                        detectPassiveEvents.hasSupport = passive
                    }
                },
            }
            detectPassiveEvents.update()

            // Detect available wheel event
            var wheelEvent =
                'onwheel' in document.createElement('div')
                    ? 'wheel' // Modern browsers support "wheel"
                    : document.onmousewheel !== undefined
                        ? 'mousewheel' // Webkit and IE support at least "mousewheel"
                        : 'DOMMouseScroll' // let's assume that remaining browsers are older Firefox

            if (
                Object.prototype.hasOwnProperty.call(
                    detectPassiveEvents,
                    'hasSupport'
                )
            ) {
                addEventListener(
                    this.state.documentAlias,
                    wheelEvent,
                    () => {
                        this[activityHandler]
                    },
                    { passive: true }
                )
            } else {
                addEventListener(this.state.documentAlias, wheelEvent, () => {
                    this[activityHandler]
                })
            }

            // Capture our initial scroll points
            this[resetMaxScrolls]()

            // Add event handlers; cross-browser compatibility here varies significantly
            // @see http://quirksmode.org/dom/events
            addEventListener(this.state.documentAlias, 'click', () => {
                this[activityHandler]
            })
            addEventListener(this.state.documentAlias, 'mouseup', () => {
                this[activityHandler]
            })
            addEventListener(this.state.documentAlias, 'mousedown', () => {
                this[activityHandler]
            })
            addEventListener(this.state.documentAlias, 'mousemove', () => {
                this[activityHandler]
            })
            addEventListener(this.state.windowAlias, 'scroll', () => {
                this[scrollHandler]
            }) // Will updateMaxScrolls() for us
            addEventListener(this.state.documentAlias, 'keypress', () => {
                this[activityHandler]
            })
            addEventListener(this.state.documentAlias, 'keydown', () => {
                this[activityHandler]
            })
            addEventListener(this.state.documentAlias, 'keyup', () => {
                this[activityHandler]
            })
            addEventListener(this.state.windowAlias, 'resize', () => {
                this[activityHandler]
            })
            addEventListener(this.state.windowAlias, 'focus', () => {
                this[activityHandler]
            })
            addEventListener(this.state.windowAlias, 'blur', () => {
                this[activityHandler]
            })

            // Periodic check for activity.
            this.state.lastActivityTime = now.getTime()
            clearInterval(this.state.pagePingInterval)
            this.state.pagePingInterval = setInterval(() => {
                var now = new Date()

                // There was activity during the heart beat period;
                // on average, this is going to overstate the visitDuration by configHeartBeatTimer/2
                if (
                    this.state.lastActivityTime + this.config.heartBeatTimer >
                    now.getTime()
                ) {
                    // Send ping if minimum visit time has elapsed
                    if (this.state.minimumVisitTime < now.getTime()) {
                        this[logPagePing](
                            this[finalizeContexts](context, contextCallback)
                        ) // Grab the min/max globals
                    }
                }
            }, this.config.heartBeatTimer)
        }
    }

    /**
     * Log that a user is still viewing a given page
     * by sending a page ping.
     * Not part of the public API - only called from
     * logPageView() above.
     *
     * @param context object Custom context relating to the event
     */
    [logPagePing](context) {
        this[refreshUrl]()
        var newDocumentTitle = this.state.documentAlias.title
        if (newDocumentTitle !== this.state.lastDocumentTitle) {
            this.state.lastDocumentTitle = newDocumentTitle
            this.state.lastConfigTitle = null
        }
        this.core.trackPagePing(
            this[purify](this.config.customUrl || this.state.locationHrefAlias),
            fixupTitle(
                this.state.lastConfigTitle || this.state.lastDocumentTitle
            ),
            this[purify](this.config.customReferrer || this.config.referrerUrl),
            this[cleanOffset](this.state.minXOffset),
            this[cleanOffset](this.state.maxXOffset),
            this[cleanOffset](this.state.minYOffset),
            this[cleanOffset](this.state.maxYOffset),
            this[addCommonContexts](context)
        )
        this[resetMaxScrolls]()
    }

    /**
     * Log ecommerce transaction metadata
     *
     * @param string orderId
     * @param string affiliation
     * @param string total
     * @param string tax
     * @param string shipping
     * @param string city
     * @param string state
     * @param string country
     * @param string currency The currency the total/tax/shipping are expressed in
     * @param object context Custom context relating to the event
     * @param tstamp number or Timestamp object
     */
    [logTransaction](
        orderId,
        affiliation,
        total,
        tax,
        shipping,
        city,
        state,
        country,
        currency,
        context,
        tstamp
    ) {
        this.core.trackEcommerceTransaction(
            orderId,
            affiliation,
            total,
            tax,
            shipping,
            city,
            state,
            country,
            currency,
            this[addCommonContexts](context),
            tstamp
        )
    }

    /**
     * Log ecommerce transaction item
     *
     * @param string orderId
     * @param string sku
     * @param string name
     * @param string category
     * @param string price
     * @param string quantity
     * @param string currency The currency the price is expressed in
     * @param object context Custom context relating to the event
     */
    [logTransactionItem](
        orderId,
        sku,
        name,
        category,
        price,
        quantity,
        currency,
        context,
        tstamp
    ) {
        this.core.trackEcommerceTransactionItem(
            orderId,
            sku,
            name,
            category,
            price,
            quantity,
            currency,
            this[addCommonContexts](context),
            tstamp
        )
    }

    /**
     * Construct a browser prefix
     *
     * E.g: (moz, hidden) -> mozHidden
     */
    [prefixPropertyName](prefix, propertyName) {
        if (prefix !== '') {
            return (
                prefix +
                propertyName.charAt(0).toUpperCase() +
                propertyName.slice(1)
            )
        }

        return propertyName
    }

    /**
     * Check for pre-rendered web pages, and log the page view/link
     * according to the configuration and/or visibility
     *
     * @see http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/PageVisibility/Overview.html
     */
    [trackCallback](callback) {
        var isPreRendered,
            i,
            // Chrome 13, IE10, FF10
            prefixes = ['', 'webkit', 'ms', 'moz'],
            prefix

        // If configPrerendered == true - we'll never set `isPreRendered` to true and fire immediately,
        // otherwise we need to check if this is just prerendered
        if (!this.config.countPreRendered) {
            // true by default

            for (i = 0; i < prefixes.length; i++) {
                prefix = prefixes[i]

                // does this browser support the page visibility API? (drop this check along with IE9 and iOS6)
                if (
                    this.state.documentAlias[
                        this[prefixPropertyName](prefix, 'hidden')
                    ]
                ) {
                    // if pre-rendered, then defer callback until page visibility changes
                    if (
                        this.state.documentAlias[
                            this[prefixPropertyName](prefix, 'visibilityState')
                        ] === 'prerender'
                    ) {
                        isPreRendered = true
                    }
                    break
                } else if (
                    this.state.documentAlias[
                        this[prefixPropertyName](prefix, 'hidden')
                    ] === false
                ) {
                    break
                }
            }
        }

        const eventHandler = () => {
            this.state.documentAlias.removeEventListener(
                prefix + 'visibilitychange',
                eventHandler,
                false
            )
            callback()
        }

        // Implies configCountPreRendered = false
        if (isPreRendered) {
            // note: the event name doesn't follow the same naming convention as vendor properties
            addEventListener(
                this.state.documentAlias,
                prefix + 'visibilitychange',
                eventHandler
            )
            return
        }

        // configCountPreRendered === true || isPreRendered === false
        callback()
    }

    /**
     * Get the domain session index also known as current memorized visit count.
     *
     * @return int Domain session index
     */
    getDomainSessionIndex() {
        return this.state.memorizedVisitCount
    }

    /**
     * Get the page view ID as generated or provided by mutSnowplowState.pageViewId.
     *
     * @return string Page view ID
     */
    getPageViewId() {
        return this[getPageViewId]()
    }

    /**
     * Expires current session and starts a new session.
     */
    newSession() {
        this[newSession]()
    }

    /**
     * Get the cookie name as cookieName + basename + . + domain.
     *
     * @return string Cookie name
     */
    getCookieName(basename) {
        return this[getSnowplowCookieName](basename)
    }

    /**
     * Get the current user ID (as set previously
     * with setUserId()).
     *
     * @return string Business-defined user ID
     */
    getUserId() {
        return this.state.businessUserId
    }

    /**
     * Get visitor ID (from first party cookie)
     *
     * @return string Visitor ID in hexits (or null, if not yet known)
     */
    getDomainUserId() {
        return this[loadDomainUserIdCookie]()[1]
    }

    /**
     * Get the visitor information (from first party cookie)
     *
     * @return array
     */
    getDomainUserInfo() {
        return this[loadDomainUserIdCookie]()
    }

    /**
     * Get the user fingerprint
     *
     * @return string The user fingerprint
     */
    getUserFingerprint() {
        return this.state.userFingerprint
    }

    /**
     * Specify the app ID
     *
     * @param int|string appId
     */
    setAppId(appId) {
        warn(
            'setAppId is deprecated. Instead add an "appId" field to the argmap argument of newTracker.'
        )
        this.core.setAppId(appId)
    }

    /**
     * Override referrer
     *
     * @param string url
     */
    setReferrerUrl(url) {
        this.config.customReferrer = url
    }

    /**
     * Override url
     *
     * @param string url
     */
    setCustomUrl(url) {
        this[refreshUrl]()
        this.config.customUrl = this[resolveRelativeReference](
            this.state.locationHrefAlias,
            url
        )
    }

    /**
     * Override document.title
     *
     * @param string title
     */
    setDocumentTitle(title) {
        // So we know what document.title was at the time of trackPageView
        this.state.lastDocumentTitle = this.state.documentAlias.title
        this.state.lastConfigTitle = title
    }

    /**
     * Strip hash tag (or anchor) from URL
     *
     * @param bool enableFilter
     */
    discardHashTag(enableFilter) {
        this.state.discardHashTag = enableFilter
    }

    /**
     * Set first-party cookie name prefix
     *
     * @param string cookieName
     */
    setCookieNamePrefix(cookieNamePrefix) {
        warn(
            'setCookieNamePrefix is deprecated. Instead add a "cookieName" field to the argmap argument of newTracker.'
        )
        this.config.cookieName = cookieNamePrefix
    }

    /**
     * Set first-party cookie domain
     *
     * @param string domain
     */
    setCookieDomain(domain) {
        warn(
            'setCookieDomain is deprecated. Instead add a "cookieDomain" field to the argmap argument of newTracker.'
        )
        this.config.cookieDomain = fixupDomain(domain)
        this[updateDomainHash]()
    }

    /**
     * Set first-party cookie path
     *
     * @param string domain
     */
    setCookiePath(path) {
        this.state.cookiePath = path
        this[updateDomainHash]()
    }

    /**
     * Set visitor cookie timeout (in seconds)
     *
     * @param int timeout
     */
    setVisitorCookieTimeout(timeout) {
        this.config.sessionCookieTimeout = timeout
    }

    /**
     * Set session cookie timeout (in seconds)
     *
     * @param int timeout
     */
    setSessionCookieTimeout(timeout) {
        warn(
            'setSessionCookieTimeout is deprecated. Instead add a "sessionCookieTimeout" field to the argmap argument of newTracker.'
        )
        this.config.sessionCookieTimeout = timeout
    }

    /**
     * @param number seed The seed used for MurmurHash3
     */
    setUserFingerprintSeed(seed) {
        warn(
            'setUserFingerprintSeed is deprecated. Instead add a "userFingerprintSeed" field to the argmap argument of newTracker.'
        )
        this.config.userFingerprintSeed = seed
        this.state.userFingerprint = detectSignature(
            this.config.userFingerprintSeed
        )
    }

    /**
     * Enable/disable user fingerprinting. User fingerprinting is enabled by default.
     * @param bool enable If false, turn off user fingerprinting
     */
    enableUserFingerprint(enable) {
        warn(
            'enableUserFingerprintSeed is deprecated. Instead add a "userFingerprint" field to the argmap argument of newTracker.'
        )
        if (!enable) {
            this.config.userFingerprint = false
            this.state.userFingerprint = ''
        }
    }

    /**
     * Prevent tracking if user's browser has Do Not Track feature enabled,
     * where tracking is:
     * 1) Sending events to a collector
     * 2) Setting first-party cookies
     * @param bool enable If true and Do Not Track feature enabled, don't track.
     */
    respectDoNotTrack(enable) {
        warn(
            'This usage of respectDoNotTrack is deprecated. Instead add a "respectDoNotTrack" field to the argmap argument of newTracker.'
        )
        var dnt =
            this.state.navigatorAlias.doNotTrack ||
            this.state.navigatorAlias.msDoNotTrack

        this.config.doNotTrack = enable && (dnt === 'yes' || dnt === '1')
    }

    /**
     * Enable querystring decoration for links pasing a filter
     *
     * @param function crossDomainLinker Function used to determine which links to decorate
     */
    crossDomainLinker(crossDomainLinkerCriterion) {
        this[decorateLinks](crossDomainLinkerCriterion)
    }

    /**
     * Install link tracker
     *
     * The default behaviour is to use actual click events. However, some browsers
     * (e.g., Firefox, Opera, and Konqueror) don't generate click events for the middle mouse button.
     *
     * To capture more "clicks", the pseudo click-handler uses mousedown + mouseup events.
     * This is not industry standard and is vulnerable to false positives (e.g., drag events).
     *
     * There is a Safari/Chrome/Webkit bug that prevents tracking requests from being sent
     * by either click handler.  The workaround is to set a target attribute (which can't
     * be "_self", "_top", or "_parent").
     *
     * @see https://bugs.webkit.org/show_bug.cgi?id=54783
     *
     * @param object criterion Criterion by which it will be decided whether a link will be tracked
     * @param bool pseudoClicks If true, use pseudo click-handler (mousedown+mouseup)
     * @param bool trackContent Whether to track the innerHTML of the link element
     * @param array context Context for all link click events
     */
    enableLinkClickTracking(criterion, pseudoClicks, trackContent, context) {
        if (this.mutSnowplowState.hasLoaded) {
            // the load event has already fired, add the click listeners now
            this.linkTrackingManager.configureLinkClickTracking(
                criterion,
                pseudoClicks,
                trackContent,
                context
            )
            LinkTrackingManager.addClickListeners()
        } else {
            // defer until page has loaded
            this.mutSnowplowState.registeredOnLoadHandlers.push(() => {
                this.linkTrackingManager.configureLinkClickTracking(
                    criterion,
                    pseudoClicks,
                    trackContent,
                    context
                )
                this.linkTrackingManager.addClickListeners()
            })
        }
    }

    /**
     * Add click event listeners to links which have been added to the page since the
     * last time enableLinkClickTracking or refreshLinkClickTracking was used
     */
    refreshLinkClickTracking() {
        if (this.mutSnowplowState.hasLoaded) {
            this.linkTrackingManager.addClickListeners()
        } else {
            this.mutSnowplowState.registeredOnLoadHandlers.push(function() {
                this.linkTrackingManager.addClickListeners()
            })
        }
    }

    /**
     * Enables page activity tracking (sends page
     * pings to the Collector regularly).
     *
     * @param int minimumVisitLength Seconds to wait before sending first page ping
     * @param int heartBeatDelay Seconds to wait between pings
     */
    enableActivityTracking(minimumVisitLength, heartBeatDelay) {
        if (
            minimumVisitLength === pInt(minimumVisitLength, 10) &&
            heartBeatDelay === pInt(heartBeatDelay, 10)
        ) {
            this.state.activityTrackingEnabled = true
            this.config.minimumVisitTime =
                new Date().getTime() + minimumVisitLength * 1000
            this.config.heartBeatTimer = heartBeatDelay * 1000
        } else {
            warn(
                'Activity tracking not enabled, please provide integer values ' +
                    'for minimumVisitLength and heartBeatDelay.'
            )
        }
    }

    /**
     * Triggers the activityHandler manually to allow external user defined
     * activity. i.e. While watching a video
     */
    updatePageActivity() {
        this[activityHandler]()
    }

    /**
     * Enables automatic form tracking.
     * An event will be fired when a form field is changed or a form submitted.
     * This can be called multiple times: only forms not already tracked will be tracked.
     *
     * @param object config Configuration object determining which forms and fields to track.
     *                      Has two properties: "forms" and "fields"
     * @param array context Context for all form tracking events
     */
    enableFormTracking(config, context) {
        if (this.mutSnowplowState.hasLoaded) {
            this.formTrackingManager.configureFormTracking(config)
            this.formTrackingManager.addFormListeners(context)
        } else {
            this.mutSnowplowState.registeredOnLoadHandlers.push(() => {
                this.formTrackingManager.configureFormTracking(config)
                this.formTrackingManager.addFormListeners(context)
            })
        }
    }

    /**
     * Frame buster
     */
    killFrame() {
        if (
            this.state.windowAlias.location !==
            this.state.windowAlias.top.location
        ) {
            this.state.windowAlias.top.location = this.state.windowAlias.location
        }
    }

    /**
     * Redirect if browsing offline (aka file: buster)
     *
     * @param string url Redirect to this URL
     */
    redirectFile(url) {
        if (this.state.windowAlias.location.protocol === 'file:') {
            this.state.windowAlias.location = url
        }
    }

    /**
     * Sets the opt out cookie.
     *
     * @param string name of the opt out cookie
     */
    setOptOutCookie(name) {
        this.config.optOutCookie = name
    }

    /**
     * Count sites in pre-rendered state
     *
     * @param bool enable If true, track when in pre-rendered state
     */
    setCountPreRendered(enable) {
        this.config.countPreRendered = enable
    }

    /**
     * Set the business-defined user ID for this user.
     *
     * @param string userId The business-defined user ID
     */
    setUserId(userId) {
        this.state.businessUserId = userId
    }

    /**
     * Alias for setUserId.
     *
     * @param string userId The business-defined user ID
     */
    identifyUser(userId) {
        this.setUserId(userId)
    }

    /**
     * Set the business-defined user ID for this user using the location querystring.
     *
     * @param string queryName Name of a querystring name-value pair
     */
    setUserIdFromLocation(querystringField) {
        this[refreshUrl]()
        this.state.businessUserId = fromQuerystring(
            querystringField,
            this.state.locationHrefAlias
        )
    }

    /**
     * Set the business-defined user ID for this user using the referrer querystring.
     *
     * @param string queryName Name of a querystring name-value pair
     */
    setUserIdFromReferrer(querystringField) {
        refreshUrl()
        this.state.businessUserId = fromQuerystring(
            querystringField,
            this.config.referrerUrl
        )
    }

    /**
     * Set the business-defined user ID for this user to the value of a cookie.
     *
     * @param string cookieName Name of the cookie whose value will be assigned to businessUserId
     */
    setUserIdFromCookie(cookieName) {
        this.state.businessUserId = window.cookie(cookieName)
    }

    /**
     * Configure this tracker to log to a CloudFront collector.
     *
     * @param string distSubdomain The subdomain on your CloudFront collector's distribution
     */
    setCollectorCf(distSubdomain) {
        this.config.collectorUrl = this[collectorUrlFromCfDist](distSubdomain)
    }

    /**
     *
     * Specify the Snowplow collector URL. No need to include HTTP
     * or HTTPS - we will add this.
     *
     * @param string rawUrl The collector URL minus protocol and /i
     */
    setCollectorUrl(rawUrl) {
        this.config.collectorUrl = this[asCollectorUrl](rawUrl)
    }

    /**
     * Specify the platform
     *
     * @param string platform Overrides the default tracking platform
     */
    setPlatform(platform) {
        warn(
            'setPlatform is deprecated. Instead add a "platform" field to the argmap argument of newTracker.'
        )
        this.core.setPlatform(platform)
    }

    /**
     *
     * Enable Base64 encoding for self-describing event payload
     *
     * @param bool enabled A boolean value indicating if the Base64 encoding for self-describing events should be enabled or not
     */
    encodeBase64(enabled) {
        warn(
            'This usage of encodeBase64 is deprecated. Instead add an "encodeBase64" field to the argmap argument of newTracker.'
        )
        this.core.setBase64Encoding(enabled)
    }

    /**
     * Send all events in the outQueue
     * Use only when sending POSTs with a bufferSize of at least 2
     */
    flushBuffer() {
        this.outQueueManager.executeQueue()
    }

    /**
     * Add the geolocation context to all events
     */
    enableGeolocationContext() {
        this[enableGeolocationContext]()
    }
    /**
     * Log visit to this page
     *
     * @param string customTitle
     * @param object Custom context relating to the event
     * @param object contextCallback Function returning an array of contexts
     * @param tstamp number or Timestamp object
     */
    trackPageView(customTitle, context, contextCallback, tstamp) {
        this[trackCallback](() => {
            this[logPageView](customTitle, context, contextCallback, tstamp)
        })
    }

    /**
     * Track a structured event happening on this page.
     *
     * Replaces trackEvent, making clear that the type
     * of event being tracked is a structured one.
     *
     * @param string category The name you supply for the group of objects you want to track
     * @param string action A string that is uniquely paired with each category, and commonly used to define the type of user interaction for the web object
     * @param string label (optional) An optional string to provide additional dimensions to the event data
     * @param string property (optional) Describes the object or the action performed on it, e.g. quantity of item added to basket
     * @param int|float|string value (optional) An integer that you can use to provide numerical data about the user event
     * @param object Custom context relating to the event
     * @param tstamp number or Timestamp object
     */
    trackStructEvent(
        category,
        action,
        label,
        property,
        value,
        context,
        tstamp
    ) {
        this[trackCallback](() => {
            this.core.trackStructEvent(
                category,
                action,
                label,
                property,
                value,
                this[addCommonContexts](context),
                tstamp
            )
        })
    }

    /**
     * Track a self-describing event (previously unstructured event) happening on this page.
     *
     * @param object eventJson Contains the properties and schema location for the event
     * @param object context Custom context relating to the event
     * @param tstamp number or Timestamp object
     */
    trackSelfDescribingEvent(eventJson, context, tstamp) {
        this[trackCallback](() => {
            this.core.trackSelfDescribingEvent(
                eventJson,
                this[addCommonContexts](context),
                tstamp
            )
        })
    }

    /**
     * Alias for `trackSelfDescribingEvent`, left for compatibility
     */
    trackUnstructEvent(eventJson, context, tstamp) {
        this[trackCallback](() => {
            this.core.trackSelfDescribingEvent(
                eventJson,
                this[addCommonContexts](context),
                tstamp
            )
        })
    }

    /**
     * Track an ecommerce transaction
     *
     * @param string orderId Required. Internal unique order id number for this transaction.
     * @param string affiliation Optional. Partner or store affiliation.
     * @param string total Required. Total amount of the transaction.
     * @param string tax Optional. Tax amount of the transaction.
     * @param string shipping Optional. Shipping charge for the transaction.
     * @param string city Optional. City to associate with transaction.
     * @param string state Optional. State to associate with transaction.
     * @param string country Optional. Country to associate with transaction.
     * @param string currency Optional. Currency to associate with this transaction.
     * @param object context Optional. Context relating to the event.
     * @param tstamp number or Timestamp object
     */
    addTrans(
        orderId,
        affiliation,
        total,
        tax,
        shipping,
        city,
        state,
        country,
        currency,
        context,
        tstamp
    ) {
        this.state.ecommerceTransaction.transaction = {
            orderId: orderId,
            affiliation: affiliation,
            total: total,
            tax: tax,
            shipping: shipping,
            city: city,
            state: state,
            country: country,
            currency: currency,
            context: context,
            tstamp: tstamp,
        }
    }

    /**
     * Track an ecommerce transaction item
     *
     * @param string orderId Required Order ID of the transaction to associate with item.
     * @param string sku Required. Item's SKU code.
     * @param string name Optional. Product name.
     * @param string category Optional. Product category.
     * @param string price Required. Product price.
     * @param string quantity Required. Purchase quantity.
     * @param string currency Optional. Product price currency.
     * @param object context Optional. Context relating to the event.
     * @param tstamp number or Timestamp object
     */
    addItem(
        orderId,
        sku,
        name,
        category,
        price,
        quantity,
        currency,
        context,
        tstamp
    ) {
        this.state.ecommerceTransaction.items.push({
            orderId: orderId,
            sku: sku,
            name: name,
            category: category,
            price: price,
            quantity: quantity,
            currency: currency,
            context: context,
            tstamp: tstamp,
        })
    }

    /**
     * Commit the ecommerce transaction
     *
     * This call will send the data specified with addTrans,
     * addItem methods to the tracking server.
     */
    trackTrans() {
        this[trackCallback](() => {
            this[logTransaction](
                this.state.ecommerceTransaction.transaction.orderId,
                this.state.ecommerceTransaction.transaction.affiliation,
                this.state.ecommerceTransaction.transaction.total,
                this.state.ecommerceTransaction.transaction.tax,
                this.state.ecommerceTransaction.transaction.shipping,
                this.state.ecommerceTransaction.transaction.city,
                this.state.ecommerceTransaction.transaction.state,
                this.state.ecommerceTransaction.transaction.country,
                this.state.ecommerceTransaction.transaction.currency,
                this.state.ecommerceTransaction.transaction.context,
                this.state.ecommerceTransaction.transaction.tstamp
            )
            for (
                var i = 0;
                i < this.state.ecommerceTransaction.items.length;
                i++
            ) {
                var item = this.state.ecommerceTransaction.items[i]
                this[logTransactionItem](
                    item.orderId,
                    item.sku,
                    item.name,
                    item.category,
                    item.price,
                    item.quantity,
                    item.currency,
                    item.context,
                    item.tstamp
                )
            }

            this.state.ecommerceTransaction = this[
                ecommerceTransactionTemplate
            ]()
        })
    }

    /**
     * Manually log a click from your own code
     *
     * @param string elementId
     * @param array elementClasses
     * @param string elementTarget
     * @param string targetUrl
     * @param string elementContent innerHTML of the element
     * @param object Custom context relating to the event
     * @param tstamp number or Timestamp object
     */
    // TODO: break this into trackLink(destUrl) and trackDownload(destUrl)
    trackLinkClick(
        targetUrl,
        elementId,
        elementClasses,
        elementTarget,
        elementContent,
        context,
        tstamp
    ) {
        this[trackCallback](() => {
            this.core.trackLinkClick(
                targetUrl,
                elementId,
                elementClasses,
                elementTarget,
                elementContent,
                this[addCommonContexts](context),
                tstamp
            )
        })
    }

    /**
     * Track an ad being served
     *
     * @param string impressionId Identifier for a particular ad impression
     * @param string costModel The cost model. 'cpa', 'cpc', or 'cpm'
     * @param number cost Cost
     * @param string bannerId Identifier for the ad banner displayed
     * @param string zoneId Identifier for the ad zone
     * @param string advertiserId Identifier for the advertiser
     * @param string campaignId Identifier for the campaign which the banner belongs to
     * @param object Custom context relating to the event
     * @param tstamp number or Timestamp object
     */
    trackAdImpression(
        impressionId,
        costModel,
        cost,
        targetUrl,
        bannerId,
        zoneId,
        advertiserId,
        campaignId,
        context,
        tstamp
    ) {
        this[trackCallback](() => {
            this.core.trackAdImpression(
                impressionId,
                costModel,
                cost,
                targetUrl,
                bannerId,
                zoneId,
                advertiserId,
                campaignId,
                this[addCommonContexts](context),
                tstamp
            )
        })
    }

    /**
     * Track an ad being clicked
     *
     * @param string clickId Identifier for the ad click
     * @param string costModel The cost model. 'cpa', 'cpc', or 'cpm'
     * @param number cost Cost
     * @param string targetUrl (required) The link's target URL
     * @param string bannerId Identifier for the ad banner displayed
     * @param string zoneId Identifier for the ad zone
     * @param string impressionId Identifier for a particular ad impression
     * @param string advertiserId Identifier for the advertiser
     * @param string campaignId Identifier for the campaign which the banner belongs to
     * @param object Custom context relating to the event
     * @param tstamp number or Timestamp object
     */
    trackAdClick(
        targetUrl,
        clickId,
        costModel,
        cost,
        bannerId,
        zoneId,
        impressionId,
        advertiserId,
        campaignId,
        context,
        tstamp
    ) {
        this[trackCallback](() => {
            this.core.trackAdClick(
                targetUrl,
                clickId,
                costModel,
                cost,
                bannerId,
                zoneId,
                impressionId,
                advertiserId,
                campaignId,
                this[addCommonContexts](context),
                tstamp
            )
        })
    }

    /**
     * Track an ad conversion event
     *
     * @param string conversionId Identifier for the ad conversion event
     * @param number cost Cost
     * @param string category The name you supply for the group of objects you want to track
     * @param string action A string that is uniquely paired with each category
     * @param string property Describes the object of the conversion or the action performed on it
     * @param number initialValue Revenue attributable to the conversion at time of conversion
     * @param string advertiserId Identifier for the advertiser
     * @param string costModel The cost model. 'cpa', 'cpc', or 'cpm'
     * @param string campaignId Identifier for the campaign which the banner belongs to
     * @param object Custom context relating to the event
     * @param tstamp number or Timestamp object
     */
    trackAdConversion(
        conversionId,
        costModel,
        cost,
        category,
        action,
        property,
        initialValue,
        advertiserId,
        campaignId,
        context,
        tstamp
    ) {
        this[trackCallback](() => {
            this.core.trackAdConversion(
                conversionId,
                costModel,
                cost,
                category,
                action,
                property,
                initialValue,
                advertiserId,
                campaignId,
                this[addCommonContexts](context),
                tstamp
            )
        })
    }

    /**
     * Track a social interaction event
     *
     * @param string action (required) Social action performed
     * @param string network (required) Social network
     * @param string target Object of the social action e.g. the video liked, the tweet retweeted
     * @param object Custom context relating to the event
     * @param tstamp number or Timestamp object
     */
    trackSocialInteraction(action, network, target, context, tstamp) {
        this[trackCallback](() => {
            this.core.trackSocialInteraction(
                action,
                network,
                target,
                this[addCommonContexts](context),
                tstamp
            )
        })
    }

    /**
     * Track an add-to-cart event
     *
     * @param string sku Required. Item's SKU code.
     * @param string name Optional. Product name.
     * @param string category Optional. Product category.
     * @param string unitPrice Optional. Product price.
     * @param string quantity Required. Quantity added.
     * @param string currency Optional. Product price currency.
     * @param array context Optional. Context relating to the event.
     * @param tstamp number or Timestamp object
     */
    trackAddToCart(
        sku,
        name,
        category,
        unitPrice,
        quantity,
        currency,
        context,
        tstamp
    ) {
        this[trackCallback](() => {
            this.core.trackAddToCart(
                sku,
                name,
                category,
                unitPrice,
                quantity,
                currency,
                this[addCommonContexts](context),
                tstamp
            )
        })
    }

    /**
     * Track a remove-from-cart event
     *
     * @param string sku Required. Item's SKU code.
     * @param string name Optional. Product name.
     * @param string category Optional. Product category.
     * @param string unitPrice Optional. Product price.
     * @param string quantity Required. Quantity removed.
     * @param string currency Optional. Product price currency.
     * @param array context Optional. Context relating to the event.
     * @param tstamp Opinal number or Timestamp object
     */
    trackRemoveFromCart(
        sku,
        name,
        category,
        unitPrice,
        quantity,
        currency,
        context,
        tstamp
    ) {
        this[trackCallback](() => {
            this.core.trackRemoveFromCart(
                sku,
                name,
                category,
                unitPrice,
                quantity,
                currency,
                this[addCommonContexts](context),
                tstamp
            )
        })
    }

    /**
     * Track an internal search event
     *
     * @param array terms Search terms
     * @param object filters Search filters
     * @param number totalResults Number of results
     * @param number pageResults Number of results displayed on page
     * @param array context Optional. Context relating to the event.
     * @param tstamp Opinal number or Timestamp object
     */
    trackSiteSearch(
        terms,
        filters,
        totalResults,
        pageResults,
        context,
        tstamp
    ) {
        this[trackCallback](() => {
            this.core.trackSiteSearch(
                terms,
                filters,
                totalResults,
                pageResults,
                this[addCommonContexts](context),
                tstamp
            )
        })
    }

    /**
     * Track a timing event (such as the time taken for a resource to load)
     *
     * @param string category Required.
     * @param string variable Required.
     * @param number timing Required.
     * @param string label Optional.
     * @param array context Optional. Context relating to the event.
     * @param tstamp Opinal number or Timestamp object
     */
    trackTiming(category, variable, timing, label, context, tstamp) {
        this[trackCallback](() => {
            this.core.trackSelfDescribingEvent(
                {
                    schema:
                        'iglu:com.snowplowanalytics.snowplow/timing/jsonschema/1-0-0',
                    data: {
                        category: category,
                        variable: variable,
                        timing: timing,
                        label: label,
                    },
                },
                this[addCommonContexts](context),
                tstamp
            )
        })
    }

    /**
     * Track a consent withdrawn action
     *
     * @param {boolean} all - Indicates user withdraws all consent regardless of context documents.
     * @param {string} [id] - Number associated with document.
     * @param {string} [version] - Document version number.
     * @param {string} [name] - Document name.
     * @param {string} [description] - Document description.
     * @param {array} [context] - Context relating to the event.
     * @param {number|Timestamp} [tstamp] - Number or Timestamp object.
     */
    trackConsentWithdrawn(
        all,
        id,
        version,
        name,
        description,
        context,
        tstamp
    ) {
        this[trackCallback](() => {
            this.core.trackConsentWithdrawn(
                all,
                id,
                version,
                name,
                description,
                this[addCommonContexts](context),
                tstamp
            )
        })
    }

    /**
     * Track a consent granted action
     *
     * @param {string} id - ID number associated with document.
     * @param {string} version - Document version number.
     * @param {string} [name] - Document name.
     * @param {string} [description] - Document description.
     * @param {string} [expiry] - Date-time when consent document(s) expire.
     * @param {array} [context] - Context containing consent documents.
     * @param {Timestamp|number} [tstamp] - number or Timestamp object.
     */
    trackConsentGranted(
        id,
        version,
        name,
        description,
        expiry,
        context,
        tstamp
    ) {
        this[trackCallback](() => {
            this.core.trackConsentGranted(
                id,
                version,
                name,
                description,
                expiry,
                this[addCommonContexts](context),
                tstamp
            )
        })
    }

    /**
     * Track a GA Enhanced Ecommerce Action with all stored
     * Enhanced Ecommerce contexts
     *
     * @param string action
     * @param array context Optional. Context relating to the event.
     * @param tstamp Opinal number or Timestamp object
     */
    trackEnhancedEcommerceAction(action, context, tstamp) {
        var combinedEnhancedEcommerceContexts = this.state.enhancedEcommerceContexts.concat(
            context || []
        )
        this.state.enhancedEcommerceContexts.length = 0

        this[trackCallback](() => {
            this.core.trackSelfDescribingEvent(
                {
                    schema:
                        'iglu:com.google.analytics.enhanced-ecommerce/action/jsonschema/1-0-0',
                    data: {
                        action: action,
                    },
                },
                this[addCommonContexts](combinedEnhancedEcommerceContexts),
                tstamp
            )
        })
    }

    /**
     * Adds a GA Enhanced Ecommerce Action Context
     *
     * @param string id
     * @param string affiliation
     * @param number revenue
     * @param number tax
     * @param number shipping
     * @param string coupon
     * @param string list
     * @param integer step
     * @param string option
     * @param string currency
     */
    addEnhancedEcommerceActionContext(
        id,
        affiliation,
        revenue,
        tax,
        shipping,
        coupon,
        list,
        step,
        option,
        currency
    ) {
        this.state.enhancedEcommerceContexts.push({
            schema:
                'iglu:com.google.analytics.enhanced-ecommerce/actionFieldObject/jsonschema/1-0-0',
            data: {
                id: id,
                affiliation: affiliation,
                revenue: pFloat(revenue),
                tax: pFloat(tax),
                shipping: pFloat(shipping),
                coupon: coupon,
                list: list,
                step: pInt(step),
                option: option,
                currency: currency,
            },
        })
    }

    /**
     * Adds a GA Enhanced Ecommerce Impression Context
     *
     * @param string id
     * @param string name
     * @param string list
     * @param string brand
     * @param string category
     * @param string variant
     * @param integer position
     * @param number price
     * @param string currency
     */
    addEnhancedEcommerceImpressionContext(
        id,
        name,
        list,
        brand,
        category,
        variant,
        position,
        price,
        currency
    ) {
        this.state.enhancedEcommerceContexts.push({
            schema:
                'iglu:com.google.analytics.enhanced-ecommerce/impressionFieldObject/jsonschema/1-0-0',
            data: {
                id: id,
                name: name,
                list: list,
                brand: brand,
                category: category,
                variant: variant,
                position: pInt(position),
                price: pFloat(price),
                currency: currency,
            },
        })
    }

    /**
     * Adds a GA Enhanced Ecommerce Product Context
     *
     * @param string id
     * @param string name
     * @param string list
     * @param string brand
     * @param string category
     * @param string variant
     * @param number price
     * @param integer quantity
     * @param string coupon
     * @param integer position
     * @param string currency
     */
    addEnhancedEcommerceProductContext(
        id,
        name,
        list,
        brand,
        category,
        variant,
        price,
        quantity,
        coupon,
        position,
        currency
    ) {
        this.state.enhancedEcommerceContexts.push({
            schema:
                'iglu:com.google.analytics.enhanced-ecommerce/productFieldObject/jsonschema/1-0-0',
            data: {
                id: id,
                name: name,
                list: list,
                brand: brand,
                category: category,
                variant: variant,
                price: pFloat(price),
                quantity: pInt(quantity),
                coupon: coupon,
                position: pInt(position),
                currency: currency,
            },
        })
    }

    /**
     * Adds a GA Enhanced Ecommerce Promo Context
     *
     * @param string id
     * @param string name
     * @param string creative
     * @param string position
     * @param string currency
     */
    addEnhancedEcommercePromoContext(id, name, creative, position, currency) {
        this.state.enhancedEcommerceContexts.push({
            schema:
                'iglu:com.google.analytics.enhanced-ecommerce/promoFieldObject/jsonschema/1-0-0',
            data: {
                id: id,
                name: name,
                creative: creative,
                position: position,
                currency: currency,
            },
        })
    }

    /**
     * Enable tracking of unhandled exceptions with custom contexts
     *
     * @param filter Function ErrorEvent => Bool to check whether error should be tracker
     * @param contextsAdder Function ErrorEvent => Array<Context> to add custom contexts with
     *		             internal state based on particular error
     */
    enableErrorTracking(filter, contextsAdder) {
        this.errorManager.enableErrorTracking(
            filter,
            contextsAdder,
            this[addCommonContexts]()
        )
    }

    /**
     * Track unhandled exception.
     * This method supposed to be used inside try/catch block
     *
     * @param message string Message appeared in console
     * @param filename string Source file (not used)
     * @param lineno number Line number
     * @param colno number Column number (not used)
     * @param error Error error object (not present in all browsers)
     * @param contexts Array of custom contexts
     */
    trackError(message, filename, lineno, colno, error, contexts) {
        var enrichedContexts = addCommonContexts(contexts)
        this.errorManager.trackError(
            message,
            filename,
            lineno,
            colno,
            error,
            enrichedContexts
        )
    }

    /**
     * Stop regenerating `pageViewId` (available from `web_page` context)
     */
    preservePageViewId() {
        this.state.preservePageViewId = true
    }

    setDebug(isDebug) {
        this.state.debug = Boolean(isDebug).valueOf()
        //updateReturnMethods()
    }
}

export default JavascriptTracker
