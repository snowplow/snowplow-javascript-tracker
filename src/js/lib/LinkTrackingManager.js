/*
 * JavaScript tracker for Snowplow: LinkTrackingManager.js
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

// var lodash = require('./lib_managed/lodash'),
// 	helpers = require('./lib/helpers'),
// 	object = typeof exports !== 'undefined' ? exports : this;

import helpers from './Helpers'

// Symbols for private methods
const processClick = Symbol('processClick')
const getClickHandler = Symbol('getClickHandler')
const addClickListener = Symbol('addClickListener')

class LinkTrackingManager {
    /**
     * Object for handling automatic link tracking
     *
     * @param {Object} core - The tracker core
     * @param {String} trackerId - Unique identifier for the tracker instance, used to mark tracked links
     * @param {Function} contextAdder - Function to add common contexts like PerformanceTiming to all events
     * @returns {Object} - linkTrackingManager instance
     */
    constructor(core, trackerId, contextAdder) {
        this.core = core
        this.trackerId = trackerId
        this.contextAdder = contextAdder

        // Filter function used to determine whether clicks on a link should be tracked
        this.linkTrackingFilter = null

        // Whether pseudo clicks are tracked
        this.linkTrackingPseudoClicks = null

        // Whether to track the  innerHTML of clicked links
        this.linkTrackingContent = null

        // The context attached to link click events
        this.linkTrackingContext = null

        // Internal state of the pseudo click handler
        this.lastButton = null
        this.lastTarget = null
    }

    /**
     *
     * Private Methods
     *
     */

    /**
     * Process clicks
     *
     * @param {HTMLElement} sourceElement  - source element to process clicks on
     * @param {Object} context  - dynamic context
     */
    [processClick](sourceElement, context) {
        let parentElement,
            tag,
            elementId,
            elementClasses,
            elementTarget,
            elementContent

        while (
            (parentElement = sourceElement.parentNode) !== null &&
            !parentElement === undefined &&
            ((tag = sourceElement.tagName.toUpperCase()) !== 'A' &&
                tag !== 'AREA')
        ) {
            sourceElement = parentElement
        }

        if (!sourceElement.href === undefined) {
            // browsers, such as Safari, don't downcase hostname and href
            let originalSourceHostName =
                    sourceElement.hostname ||
                    helpers.getHostName(sourceElement.href),
                sourceHostName = originalSourceHostName.toLowerCase(),
                sourceHref = sourceElement.href.replace(
                    originalSourceHostName,
                    sourceHostName
                ),
                scriptProtocol = new RegExp(
                    '^(javascript|vbscript|jscript|mocha|livescript|ecmascript|mailto):',
                    'i'
                )

            // Ignore script pseudo-protocol links
            if (!scriptProtocol.test(sourceHref)) {
                elementId = sourceElement.id
                elementClasses = helpers.getCssClasses(sourceElement)
                elementTarget = sourceElement.target
                elementContent = this.linkTrackingContent
                    ? sourceElement.innerHTML
                    : null

                // decodeUrl %xx
                sourceHref = unescape(sourceHref)
                this.core.trackLinkClick(
                    sourceHref,
                    elementId,
                    elementClasses,
                    elementTarget,
                    elementContent,
                    this.contextAdder(
                        helpers.resolveDynamicContexts(context, sourceElement)
                    )
                )
            }
        }
    }

    /**
     * Return function to handle click event
     *
     * @param {OBject} - dynamic context
     * @returns {Function} - handler function for click event
     */
    [getClickHandler](context) {
        return evt => {
            var button, target

            evt = evt || window.event
            button = evt.which || evt.button
            target = evt.target || evt.srcElement

            // Using evt.type (added in IE4), we avoid defining separate handlers for mouseup and mousedown.
            if (evt.type === 'click') {
                if (target) {
                    this[processClick](target, context)
                }
            } else if (evt.type === 'mousedown') {
                if ((button === 1 || button === 2) && target) {
                    this.lastButton = button
                    this.lastTarget = target
                } else {
                    this.lastButton = this.lastTarget = null
                }
            } else if (evt.type === 'mouseup') {
                if (button === this.lastButton && target === this.lastTarget) {
                    this[processClick](target, context)
                }
                this.lastButton = this.lastTarget = null
            }
        }
    }

    /**
     * Add click listener to a DOM element
     *
     * @param {HTMLElement} element - HTMLElement to add listener too
     */
    [addClickListener](element) {
        if (this.linkTrackingPseudoClicks) {
            // for simplicity and performance, we ignore drag events
            helpers.addEventListener(
                element,
                'mouseup',
                this[getClickHandler](this.linkTrackingContext),
                false
            )
            helpers.addEventListener(
                element,
                'mousedown',
                this[getClickHandler](this.linkTrackingContext),
                false
            )
        } else {
            helpers.addEventListener(
                element,
                'click',
                this[getClickHandler](this.linkTrackingContext),
                false
            )
        }
    }

    /**
     *
     * Public Methods
     *
     */

    /**
     * Configures link click tracking: how to filter which links will be tracked,
     * whether to use pseudo click tracking, and what context to attach to link_click events
     *
     * @param {Object} criterion - criteria for filter
     * @param {Boolean} pseudoClicks - Should pseudo clicks be tracker?
     * @param {Boolean} trackContent - Track innerHTML of elements?
     * @param {Object} context - context to attach to click events
     */
    configureLinkClickTracking(criterion, pseudoClicks, trackContent, context) {
        this.linkTrackingContent = trackContent
        this.linkTrackingContext = context
        this.linkTrackingPseudoClicks = pseudoClicks
        this.linkTrackingFilter = helpers.getFilter(criterion, true)
    }

    /**
     * Add click handlers to anchor and AREA elements, except those to be ignored
     *
     */
    addClickListeners() {
        let linkElements = document.links,
            i

        for (i = 0; i < linkElements.length; i++) {
            // Add a listener to link elements which pass the filter and aren't already tracked
            if (
                this.linkTrackingFilter(linkElements[i]) &&
                !linkElements[i][this.trackerId]
            ) {
                this[addClickListener](linkElements[i])
                linkElements[i][this.trackerId] = true
            }
        }
    }
}

export default LinkTrackingManager
