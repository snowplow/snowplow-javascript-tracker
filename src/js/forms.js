/*
 * JavaScript tracker for Snowplow: forms.js
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

var lodash = require('./lib_managed/lodash'),
	helpers = require('./lib/helpers'),
	object = typeof exports !== 'undefined' ? exports : this;

/**
 * Object for handling automatic form tracking
 *
 * @param object core The tracker core
 * @param string trackerId Unique identifier for the tracker instance, used to mark tracked elements
 * @param function contextAdder Function to add common contexts like PerformanceTiming to all events
 * @return object formTrackingManager instance
 */
object.getFormTrackingManager = function (core, trackerId, contextAdder) {

	// Tag names of mutable elements inside a form
	var innerElementTags = ['textarea', 'input', 'select'];

	// Used to mark elements with event listeners
	var trackingMarker = trackerId + 'form';

	// Filter to determine which forms should be tracked
	var formFilter = function () { return true };

	// Filter to determine which form fields should be tracked
	var fieldFilter = function () { return true };

	/*
	 * Get an identifier for a form, input, textarea, or select element
	 */
	function getFormElementName(elt) {
		return elt[lodash.find(['name', 'id', 'type', 'nodeName'], function (propName) {

			// If elt has a child whose name is "id", that element will be returned
			// instead of the actual id of elt unless we ensure that a string is returned
			return elt[propName] && typeof elt[propName] === 'string';
		})];
	}

	/*
	 * Identifies the parent form in which an element is contained
	 */
	function getParentFormName(elt) {
		while (elt && elt.nodeName && elt.nodeName.toUpperCase() !== 'HTML' && elt.nodeName.toUpperCase() !== 'FORM') {
			elt = elt.parentNode;
		}
		if (elt && elt.nodeName && elt.nodeName.toUpperCase() === 'FORM') {
			return getFormElementName(elt);
		}
	}

	/*
	 * Returns a list of the input, textarea, and select elements inside a form along with their values
	 */
	function getInnerFormElements(elt) {
		var innerElements = [];
		lodash.forEach(innerElementTags, function (tagname) {

			var trackedChildren = lodash.filter(elt.getElementsByTagName(tagname), function (child) {
				return child.hasOwnProperty(trackingMarker);
			});

			lodash.forEach(trackedChildren, function (child) {
				if (child.type === 'submit') {
					return;
				}
				var elementJson = {
					name: getFormElementName(child),
					value: child.value,
					nodeName: child.nodeName
				};
				if (child.type && child.nodeName.toUpperCase() === 'INPUT') {
					elementJson.type = child.type;
				}

				if ((child.type === 'checkbox' || child.type === 'radio') && !child.checked) {
					elementJson.value = null;
				}
				innerElements.push(elementJson);
			});
		});

		return innerElements;
	}

	/*
	 * Return function to handle form field change event
	 */
	function getFormChangeListener(context) {
		return function (e) {
			var elt = e.target;
			var type = (elt.nodeName && elt.nodeName.toUpperCase() === 'INPUT') ? elt.type : null;
			var value = (elt.type === 'checkbox' && !elt.checked) ? null : elt.value;
			core.trackFormChange(getParentFormName(elt), getFormElementName(elt), elt.nodeName, type, helpers.getCssClasses(elt), value, contextAdder(context));
		};
	}

	/*
	 * Return function to handle form submission event
	 */
	function getFormSubmissionListener(context) {
		return function (e) {
			var elt = e.target;
			var innerElements = getInnerFormElements(elt);
			core.trackFormSubmission(getFormElementName(elt), helpers.getCssClasses(elt), innerElements, contextAdder(context));
		};
	}

	return {

		/*
		 * Configures form tracking: which forms and fields will be tracked, and the context to attach
		 */
		configureFormTracking: function (config) {
			if (config) {
				formFilter = helpers.getFilter(config.forms, true);
				fieldFilter = helpers.getFilter(config.fields, false);
			}
		},

		/*
		 * Add submission event listeners to all form elements
		 * Add value change event listeners to all mutable inner form elements
		 */
		addFormListeners: function (context) {
			lodash.forEach(document.getElementsByTagName('form'), function (form) {
				if (formFilter(form) && !form[trackingMarker]) {

					lodash.forEach(innerElementTags, function (tagname) {
						lodash.forEach(form.getElementsByTagName(tagname), function (innerElement) {
							if (fieldFilter(innerElement) && !innerElement[trackingMarker]) {
								helpers.addEventListener(innerElement, 'change', getFormChangeListener(context), false);
								innerElement[trackingMarker] = true;
							}
						});
					});

					helpers.addEventListener(form, 'submit', getFormSubmissionListener(context));
					form[trackingMarker] = true;
				}
			});
		}
	};
};
