/*
 * JavaScript tracker for Snowplow: links.js
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
 * Object for handling automatic link tracking
 *
 * @param object core The tracker core
 * @param string trackerId Unique identifier for the tracker instance, used to mark tracked links
 * @param function contextAdder Function to add common contexts like PerformanceTiming to all events
 * @return object linkTrackingManager instance
 */
object.getLinkTrackingManager = function (core, trackerId, contextAdder) {

	// Filter function used to determine whether clicks on a link should be tracked
	var linkTrackingFilter,

		// Whether pseudo clicks are tracked
		linkTrackingPseudoClicks,

		// Whether to track the  innerHTML of clicked links
		linkTrackingContent,

		// The context attached to link click events
		linkTrackingContext,

		// Internal state of the pseudo click handler
		lastButton,
		lastTarget;

	/*
	 * Process clicks
	 */
	function processClick(sourceElement, context) {

		var parentElement,
			tag,
			elementId,
			elementClasses,
			elementTarget,
			elementContent;

		while ((parentElement = sourceElement.parentNode) !== null &&
				!lodash.isUndefined(parentElement) && // buggy IE5.5
				((tag = sourceElement.tagName.toUpperCase()) !== 'A' && tag !== 'AREA')) {
			sourceElement = parentElement;
		}

		if (!lodash.isUndefined(sourceElement.href)) {
			// browsers, such as Safari, don't downcase hostname and href
			var originalSourceHostName = sourceElement.hostname || helpers.getHostName(sourceElement.href),
				sourceHostName = originalSourceHostName.toLowerCase(),
				sourceHref = sourceElement.href.replace(originalSourceHostName, sourceHostName),
				scriptProtocol = new RegExp('^(javascript|vbscript|jscript|mocha|livescript|ecmascript|mailto):', 'i');

			// Ignore script pseudo-protocol links
			if (!scriptProtocol.test(sourceHref)) {

				elementId = sourceElement.id;
				elementClasses = helpers.getCssClasses(sourceElement);
				elementTarget = sourceElement.target;
				elementContent = linkTrackingContent ? sourceElement.innerHTML : null;

				// decodeUrl %xx
				sourceHref = unescape(sourceHref);
				core.trackLinkClick(sourceHref, elementId, elementClasses, elementTarget, elementContent, contextAdder(context));
			}
		}
	}

	/*
	 * Return function to handle click event
	 */
	function getClickHandler(context) {
		return function (evt) {
			var button,
				target;

			evt = evt || window.event;
			button = evt.which || evt.button;
			target = evt.target || evt.srcElement;

			// Using evt.type (added in IE4), we avoid defining separate handlers for mouseup and mousedown.
			if (evt.type === 'click') {
				if (target) {
					processClick(target, context);
				}
			} else if (evt.type === 'mousedown') {
				if ((button === 1 || button === 2) && target) {
					lastButton = button;
					lastTarget = target;
				} else {
					lastButton = lastTarget = null;
				}
			} else if (evt.type === 'mouseup') {
				if (button === lastButton && target === lastTarget) {
					processClick(target, context);
				}
				lastButton = lastTarget = null;
			}
		};
	}

	/*
	 * Add click listener to a DOM element
	 */
	function addClickListener(element) {
		if (linkTrackingPseudoClicks) {
			// for simplicity and performance, we ignore drag events
			helpers.addEventListener(element, 'mouseup', getClickHandler(linkTrackingContext), false);
			helpers.addEventListener(element, 'mousedown', getClickHandler(linkTrackingContext), false);
		} else {
			helpers.addEventListener(element, 'click', getClickHandler(linkTrackingContext), false);
		}
	}

	return {

		/*
		 * Configures link click tracking: how to filter which links will be tracked,
		 * whether to use pseudo click tracking, and what context to attach to link_click events
		 */
		configureLinkClickTracking: function (criterion, pseudoClicks, trackContent, context) {
			linkTrackingContent = trackContent;
			linkTrackingContext = context;
			linkTrackingPseudoClicks = pseudoClicks;
			linkTrackingFilter = helpers.getFilter(criterion, true);
		},

		/*
		 * Add click handlers to anchor and AREA elements, except those to be ignored
		 */
		addClickListeners: function () {

			var linkElements = document.links,
				i;

			for (i = 0; i < linkElements.length; i++) {
				// Add a listener to link elements which pass the filter and aren't already tracked
				if (linkTrackingFilter(linkElements[i]) && !linkElements[i][trackerId]) {
					addClickListener(linkElements[i]);
					linkElements[i][trackerId] = true;
				}
			}
		}
	};
};
