/*
 * Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang
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
  dispatchToTrackersInCollection,
} from '@snowplow/browser-tracker-core';
import {
  resolveDynamicContext,
  DynamicContext,
  buildLinkClick,
  CommonEventProperties,
  LinkClickEvent,
} from '@snowplow/tracker-core';

interface LinkClickConfiguration {
  linkTrackingFilter?: (element: HTMLElement) => boolean;
  // Whether pseudo clicks are tracked
  linkTrackingPseudoClicks?: boolean | null | undefined;
  // Whether to track the  innerHTML of clicked links
  linkTrackingContent?: boolean | null | undefined;
  // The context attached to link click events
  linkTrackingContext?: DynamicContext | null | undefined;
  lastButton?: number | null;
  lastTarget?: EventTarget | null;
}

const _trackers: Record<string, BrowserTracker> = {};
const _configuration: Record<string, LinkClickConfiguration> = {};

/**
 * Link click tracking
 *
 * Will automatically tracking link clicks once enabled with 'enableLinkClickTracking'
 * or you can manually track link clicks with 'trackLinkClick'
 */
export function LinkClickTrackingPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      _trackers[tracker.id] = tracker;
    },
  };
}

/** The configuration for automatic link click tracking */
export interface LinkClickTrackingConfiguration {
  /** The filter options for the link click tracking */
  options?: FilterCriterion<HTMLElement> | null;
  /**
   * Captures middle click events in browsers that don't generate standard click
   * events for middle click actions
   */
  pseudoClicks?: boolean | null;
  /** Whether the content of the links should be tracked */
  trackContent?: boolean | null;
  /** The dyanmic context which will be evaluated for each link click event */
  context?: DynamicContext | null;
}

/**
 * Enable link click tracking
 *
 * @remarks
 * The default behaviour is to use actual click events. However, some browsers
 * (e.g., Firefox, Opera, and Konqueror) don't generate click events for the middle mouse button.
 *
 * To capture more "clicks", the pseudo click-handler uses mousedown + mouseup events.
 * This is not industry standard and is vulnerable to false positives (e.g., drag events).
 */
export function enableLinkClickTracking(
  configuration: LinkClickTrackingConfiguration = {},
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((id) => {
    if (_trackers[id]) {
      if (_trackers[id].sharedState.hasLoaded) {
        // the load event has already fired, add the click listeners now
        configureLinkClickTracking(configuration, id);
        addClickListeners(id);
      } else {
        // defer until page has loaded
        _trackers[id].sharedState.registeredOnLoadHandlers.push(function () {
          configureLinkClickTracking(configuration, id);
          addClickListeners(id);
        });
      }
    }
  });
}

/**
 * Add click event listeners to links which have been added to the page since the
 * last time enableLinkClickTracking or refreshLinkClickTracking was used
 *
 * @param trackers - The tracker identifiers which the have their link click state refreshed
 */
export function refreshLinkClickTracking(trackers: Array<string> = Object.keys(_trackers)) {
  trackers.forEach((id) => {
    if (_trackers[id]) {
      if (_trackers[id].sharedState.hasLoaded) {
        addClickListeners(id);
      } else {
        _trackers[id].sharedState.registeredOnLoadHandlers.push(function () {
          addClickListeners(id);
        });
      }
    }
  });
}

/**
 * Manually log a click
 *
 * @param event - The event information
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackLinkClick(
  event: LinkClickEvent & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildLinkClick(event), event.context, event.timestamp);
  });
}

/*
 * Process clicks
 */
function processClick(tracker: BrowserTracker, sourceElement: Element, context?: DynamicContext | null) {
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
      tracker.core.track(
        buildLinkClick({
          targetUrl: sourceHref,
          elementId,
          elementClasses,
          elementTarget,
          elementContent,
        }),
        resolveDynamicContext(context, sourceElement)
      );
    }
  }
}

/*
 * Return function to handle click event
 */
function getClickHandler(tracker: string, context?: DynamicContext | null): EventListenerOrEventListenerObject {
  return function (evt: Event) {
    var button, target;

    evt = evt || window.event;
    button = (evt as MouseEvent).which || (evt as MouseEvent).button;
    target = evt.target || evt.srcElement;

    // Using evt.type (added in IE4), we avoid defining separate handlers for mouseup and mousedown.
    if (evt.type === 'click') {
      if (target) {
        processClick(_trackers[tracker], target as Element, context);
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
        processClick(_trackers[tracker], target as Element, context);
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
  { options, pseudoClicks, trackContent, context }: LinkClickTrackingConfiguration = {},
  tracker: string
) {
  _configuration[tracker] = {
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
