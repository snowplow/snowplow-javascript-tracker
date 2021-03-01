/*
 * Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import {
  getHostName,
  getCssClasses,
  addEventListener,
  getFilterByClass,
  FilterCriterion,
  BrowserPlugin,
  BrowserTracker,
} from '@snowplow/browser-core';
import { SelfDescribingJson, Timestamp, resolveDynamicContexts, DynamicContexts } from '@snowplow/tracker-core';

interface LinkClickConfiguration {
  tracker: BrowserTracker;
  linkTrackingFilter?: (element: HTMLElement) => boolean;
  // Whether pseudo clicks are tracked
  linkTrackingPseudoClicks?: boolean | null | undefined;
  // Whether to track the  innerHTML of clicked links
  linkTrackingContent?: boolean | null | undefined;
  // The context attached to link click events
  linkTrackingContext?: DynamicContexts | null | undefined;
  lastButton?: number | null;
  lastTarget?: EventTarget | null;
}

const _configuration: Record<string, LinkClickConfiguration> = {};

export const LinkClickTrackingPlugin = (): BrowserPlugin => {
  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      _configuration[tracker.id] = { tracker };
    },
  };
};

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
export function enableLinkClickTracking(
  {
    options,
    pseudoClicks,
    trackContent,
    context,
  }: {
    options?: FilterCriterion<HTMLElement> | null;
    pseudoClicks?: boolean | null;
    trackContent?: boolean | null;
    context?: DynamicContexts | null;
  } = {},
  trackers: Array<string> = Object.keys(_configuration)
) {
  trackers.forEach((id) => {
    if (_configuration[id]) {
      if (_configuration[id].tracker.sharedState.hasLoaded) {
        // the load event has already fired, add the click listeners now
        configureLinkClickTracking({ options, pseudoClicks, trackContent, context }, id);
        addClickListeners(id);
      } else {
        // defer until page has loaded
        _configuration[id].tracker.sharedState.registeredOnLoadHandlers.push(function () {
          configureLinkClickTracking({ options, pseudoClicks, trackContent, context }, id);
          addClickListeners(id);
        });
      }
    }
  });
}

/**
 * Add click event listeners to links which have been added to the page since the
 * last time enableLinkClickTracking or refreshLinkClickTracking was used
 */
export function refreshLinkClickTracking(trackers: Array<string> = Object.keys(_configuration)) {
  trackers.forEach((id) => {
    if (_configuration[id]) {
      if (_configuration[id].tracker.sharedState.hasLoaded) {
        addClickListeners(id);
      } else {
        _configuration[id].tracker.sharedState.registeredOnLoadHandlers.push(function () {
          addClickListeners(id);
        });
      }
    }
  });
}

/**
 * Manually log a click from your own code
 *
 * @param string targetUrl
 * @param string elementId
 * @param array elementClasses
 * @param string elementTarget
 * @param string elementContent innerHTML of the element
 * @param object Custom context relating to the event
 * @param tstamp number or Timestamp object
 */
export function trackLinkClick(
  {
    targetUrl,
    elementId,
    elementClasses,
    elementTarget,
    elementContent,
    context,
    tstamp,
  }: {
    targetUrl: string;
    elementId?: string;
    elementClasses?: Array<string>;
    elementTarget?: string;
    elementContent?: string;
    context?: SelfDescribingJson[];
    tstamp?: Timestamp;
  },
  trackers: Array<string> = Object.keys(_configuration)
) {
  trackers.forEach((id) => {
    if (_configuration[id]) {
      _configuration[id].tracker.core.trackLinkClick(
        targetUrl,
        elementId,
        elementClasses,
        elementTarget,
        elementContent,
        context,
        tstamp
      );
    }
  });
}

/*
 * Process clicks
 */
function processClick(tracker: BrowserTracker, sourceElement: Element, context?: DynamicContexts | null) {
  let parentElement, tag, elementId, elementClasses, elementTarget, elementContent;

  while (
    (parentElement = sourceElement.parentElement) !== null &&
    parentElement != null &&
    (tag = sourceElement.tagName.toUpperCase()) !== 'A' &&
    tag !== 'AREA'
  ) {
    sourceElement = parentElement;
  }

  const anchorElement = <HTMLAnchorElement>sourceElement;
  if (anchorElement.href != null) {
    // browsers, such as Safari, don't downcase hostname and href
    var originalSourceHostName = anchorElement.hostname || getHostName(anchorElement.href),
      sourceHostName = originalSourceHostName.toLowerCase(),
      sourceHref = anchorElement.href.replace(originalSourceHostName, sourceHostName),
      scriptProtocol = new RegExp('^(javascript|vbscript|jscript|mocha|livescript|ecmascript|mailto):', 'i');

    // Ignore script pseudo-protocol links
    if (!scriptProtocol.test(sourceHref)) {
      elementId = anchorElement.id;
      elementClasses = getCssClasses(anchorElement);
      elementTarget = anchorElement.target;
      elementContent = _configuration[tracker.id].linkTrackingContent ? anchorElement.innerHTML : undefined;

      // decodeUrl %xx
      sourceHref = unescape(sourceHref);
      tracker.core.trackLinkClick(
        sourceHref,
        elementId,
        elementClasses,
        elementTarget,
        elementContent,
        resolveDynamicContexts(context, sourceElement)
      );
    }
  }
}

/*
 * Return function to handle click event
 */
function getClickHandler(tracker: string, context?: DynamicContexts | null): EventListenerOrEventListenerObject {
  return function (evt: Event) {
    var button, target;

    evt = evt || window.event;
    button = (evt as MouseEvent).which || (evt as MouseEvent).button;
    target = evt.target || evt.srcElement;

    // Using evt.type (added in IE4), we avoid defining separate handlers for mouseup and mousedown.
    if (evt.type === 'click') {
      if (target) {
        processClick(_configuration[tracker].tracker, target as Element, context);
      }
    } else if (evt.type === 'mousedown') {
      if ((button === 1 || button === 2) && target) {
        _configuration[tracker].lastButton = button;
        _configuration[tracker].lastTarget = target;
      } else {
        _configuration[tracker].lastButton = _configuration[tracker].lastTarget = null;
      }
    } else if (evt.type === 'mouseup') {
      if (button === _configuration[tracker].lastButton && target === _configuration[tracker].lastTarget) {
        processClick(_configuration[tracker].tracker, target as Element, context);
      }
      _configuration[tracker].lastButton = _configuration[tracker].lastTarget = null;
    }
  };
}

/*
 * Add click listener to a DOM element
 */
function addClickListener(tracker: string, element: HTMLAnchorElement | HTMLAreaElement) {
  if (_configuration[tracker].linkTrackingPseudoClicks) {
    // for simplicity and performance, we ignore drag events
    addEventListener(element, 'mouseup', getClickHandler(tracker, _configuration[tracker].linkTrackingContext), false);
    addEventListener(
      element,
      'mousedown',
      getClickHandler(tracker, _configuration[tracker].linkTrackingContext),
      false
    );
  } else {
    addEventListener(element, 'click', getClickHandler(tracker, _configuration[tracker].linkTrackingContext), false);
  }
}

/*
 * Configures link click tracking: how to filter which links will be tracked,
 * whether to use pseudo click tracking, and what context to attach to link_click events
 */
function configureLinkClickTracking(
  {
    options,
    pseudoClicks,
    trackContent,
    context,
  }: {
    options?: FilterCriterion<HTMLElement> | null;
    pseudoClicks?: boolean | null;
    trackContent?: boolean | null;
    context?: DynamicContexts | null;
  } = {},
  tracker: string
) {
  _configuration[tracker] = {
    tracker: _configuration[tracker].tracker,
    linkTrackingContent: trackContent,
    linkTrackingContext: context,
    linkTrackingPseudoClicks: pseudoClicks,
    linkTrackingFilter: getFilterByClass(options),
  };
}

/*
 * Add click handlers to anchor and AREA elements, except those to be ignored
 */
function addClickListeners(trackerId: string) {
  var linkElements = document.links,
    i;

  for (i = 0; i < linkElements.length; i++) {
    // Add a listener to link elements which pass the filter and aren't already tracked
    if (_configuration[trackerId].linkTrackingFilter?.(linkElements[i]) && !(linkElements[i] as any)[trackerId]) {
      addClickListener(trackerId, linkElements[i]);
      (linkElements[i] as any)[trackerId] = true;
    }
  }
}
