/*
 * JavaScript tracker for Snowplow: FormTrackingManager.js
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

import {
    getCssClasses,
    resolveDynamicContexts,
    getFilter,
    getTransform,
    addEventListener,
} from './Helpers'

// Symbols for private methods
const getFormElementName = Symbol('getFormElementName')
const getParentFormName = Symbol('getParentFormName')
const getInnerFormElements = Symbol('getInnerFormElements')
const getFormChangeListener = Symbol('getFormChangeListener')
const getFormSubmissionListener = Symbol('getFormSubmissionListener')

/**
 * @class FormTrackingManager
 */
class FormTrackingManager {
    /**
     * Object for handling automatic form tracking
     *
     * @param {Object} core - The tracker core
     * @param {String} trackerId - Unique identifier for the tracker instance, used to mark tracked elements
     * @param {Function} contextAdder - Function to add common contexts like PerformanceTiming to all events
     * @returns {FormTrackingManager} - FormTrackingManager instance
     */
    constructor(core, trackerId, contextAdder) {
        this.core = core
        this.trackerId = trackerId
        this.contextAdder = contextAdder
        this.innerElementTags = ['textarea', 'input', 'select']
        this.propNames = ['name', 'id', 'type', 'nodeName']
        this.trackingMarker = `${trackerId}form`

        /**
         * Filter to determine which forms should be tracked
         */
        this.formFilter = () => {
            true
        }

        /**
         * Filter to determine which form fields should be tracked
         */
        this.fieldFilter = () => {
            true
        }

        /**
         *  Default function applied to all elements, optionally overridden by transform field
         *
         * @param {any} x
         */
        this.fieldTransform = x => {
            x
        }
    }

    /**
     *
     * Private Methods
     *
     */

    /**
     * Get an identifier for a form, input, textarea, or select element
     *
     * @param {HTMLElement} elt - HTMLElement to identify
     * @returns {String} - the identifier
     */
    [getFormElementName](elt) {
        return elt[
            this.propNames.find(propName => {
                // If elt has a child whose name is "id", that element will be returned
                // instead of the actual id of elt unless we ensure that a string is returned
                return elt[propName] && typeof elt[propName] === 'string'
            })
        ]
    }

    /**
     * Identifies the parent form in which an element is contained
     *
     * @param {HTMLElement} elt - HTMLElement to check
     * @returns {String} - the identifier
     */
    [getParentFormName](elt) {
        while (
            elt &&
            elt.nodeName &&
            elt.nodeName.toUpperCase() !== 'HTML' &&
            elt.nodeName.toUpperCase() !== 'FORM'
        ) {
            elt = elt.parentNode
        }
        if (elt && elt.nodeName && elt.nodeName.toUpperCase() === 'FORM') {
            return this[getFormElementName](elt)
        }
    }

    /**
     * Returns a list of the input, textarea, and select elements inside a form along with their values
     *
     * @param {HTMLElement} elt - parent HTMLElement to get form inputs for
     * @returns {HTMLElement[]} - Array of HTMLElements contained in the parent
     */
    [getInnerFormElements](elt) {
        var innerElements = []
        this.innerElementTags.forEach(tagname => {
            const trackedChildren = elt
                .getElementsByTagName(tagname)
                .filter(child => {
                    return child.hasOwnProperty(this.trackingMarker)
                })

            trackedChildren.forEach(child => {
                if (child.type === 'submit') {
                    return
                }
                var elementJson = {
                    name: this[getFormElementName](child),
                    value: child.value,
                    nodeName: child.nodeName,
                }
                if (child.type && child.nodeName.toUpperCase() === 'INPUT') {
                    elementJson.type = child.type
                }

                if (
                    (child.type === 'checkbox' || child.type === 'radio') &&
                    !child.checked
                ) {
                    elementJson.value = null
                }
                innerElements.push(elementJson)
            })
        })

        return innerElements
    }

    /**
     * Return function to handle form field change event
     *
     * @param {Object} context - dynamic context object
     * @returns {Function} - the handler for the field change event
     */
    [getFormChangeListener](context) {
        return e => {
            var elt = e.target
            var type =
                elt.nodeName && elt.nodeName.toUpperCase() === 'INPUT'
                    ? elt.type
                    : null
            var value =
                elt.type === 'checkbox' && !elt.checked
                    ? null
                    : this.fieldTransform(elt.value)
            this.core.trackFormChange(
                this[getParentFormName](elt),
                this[getFormElementName](elt),
                elt.nodeName,
                type,
                getCssClasses(elt),
                value,
                this.contextAdder(
                    resolveDynamicContexts(context, elt, type, value)
                )
            )
        }
    }

    /**
     * Return function to handle form submission event
     *
     * @param {Object} context  - dynamic context object
     * @returns {Function} - the handler for the form submission event
     */
    [getFormSubmissionListener](context) {
        return e => {
            var elt = e.target
            var innerElements = this[getInnerFormElements](elt)
            innerElements.forEach(innerElement => {
                innerElement.value = this.fieldTransform(innerElement.value)
            })
            this.core.trackFormSubmission(
                this[getFormElementName](elt),
                getCssClasses(elt),
                innerElements,
                this.contextAdder(
                    resolveDynamicContexts(context, elt, innerElements)
                )
            )
        }
    }

    /**
     *
     * Public Methods
     *
     */

    /**
     * Configures form tracking: which forms and fields will be tracked, and the context to attach
     * @param {Object} config - the configuration options object
     */
    configureFormTracking(config) {
        if (config) {
            this.formFilter = getFilter(config.forms, true)
            this.fieldFilter = getFilter(config.fields, false)
            this.fieldTransform = getTransform(config.fields)
        }
    }
    
    /**
     * Add submission event listeners to all form elements
     * Add value change event listeners to all mutable inner form elements
     *
     * @param {Object} context - dynamic context object
     */
    addFormListeners(context) {
        Array.prototype.forEach.call(
            document.getElementsByTagName('form'),
            form => {
                window.console.log(form)
                window.console.log(this.innerElementTags)
                window.console.log(this.formFilter)
                window.console.log(this.formFilter(form))
                if (this.formFilter(form) && !form[this.trackingMarker]) {
                    this.innerElementTags.forEach(tagname => {
                        window.console.log(tagname)
                        Array.prototype.forEach.call(
                            form.getElementsByTagName(tagname),
                            innerElement => {
                                window.console.log(innerElement)
                                if (
                                    this.fieldFilter(innerElement) &&
                                    !innerElement[this.trackingMarker] &&
                                    innerElement.type.toLowerCase() !==
                                        'password'
                                ) {
                                    addEventListener(
                                        innerElement,
                                        'change',
                                        this[getFormChangeListener](context),
                                        false
                                    )
                                    innerElement[this.trackingMarker] = true
                                }
                            }
                        )
                    })
                    addEventListener(
                        form,
                        'submit',
                        this[getFormSubmissionListener](context)
                    )
                    form[this.trackingMarker] = true
                }
            }
        )
    }
}

export default FormTrackingManager
