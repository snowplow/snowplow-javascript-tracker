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
  addEventListener,
  dispatchToTrackersInCollection,
  getCssClasses,
  getFilterByClass,
  getHostName,
  flushPendingCookies,
  type BrowserPlugin,
  type BrowserTracker,
  type FilterCriterion,
} from '@snowplow/browser-tracker-core';

import {
  buildLinkClick,
  resolveDynamicContext,
  type CommonEventProperties,
  type DynamicContext,
  type LinkClickEvent,
  type Logger,
  type PayloadBuilder,
} from '@snowplow/tracker-core';

interface LinkClickConfiguration {
  linkTrackingFilter?: (element: HTMLElement) => boolean;
  // Whether pseudo clicks are tracked
  linkTrackingPseudoClicks?: boolean | null;
  // Whether to track the  innerHTML of clicked links
  linkTrackingContent?: boolean | null;
  // The context attached to link click events
  linkTrackingContext?: DynamicContext | null;
  lastButton?: number;
  lastTarget?: EventTarget;
}

type TrackableElement = HTMLAnchorElement | HTMLAreaElement;

const TRACKABLE_ELEMENTS = ['a', 'area']; // should be kept in sync with TrackableElement type
const TRACKABLE_ELEMENTS_SELECTOR = TRACKABLE_ELEMENTS.join(', ');
const ELEMENT_PROTOCOL_FILTER = /^(javascript|vbscript|jscript|mocha|livescript|ecmascript):/i;

const _trackers: Record<string, BrowserTracker> = {};
const _listeners: Record<string, EventListener> = {};
const _configuration: Record<string, LinkClickConfiguration> = {};
let _logger: Logger | undefined = undefined;

/**
 * Link click tracking.
 *
 * Will automatically track link clicks once enabled with `enableLinkClickTracking`
 * or you can manually track link clicks with `trackLinkClick`.
 *
 * @returns Plugin instance
 */
export function LinkClickTrackingPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      _trackers[tracker.id] = tracker;
    },
    logger: (logger: Logger) => {
      _logger = logger;
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
  pseudoClicks?: boolean;
  /** Whether the content of the links should be tracked */
  trackContent?: boolean;
  /** The dynamic context which will be evaluated for each link click event */
  context?: DynamicContext | null;
}

/**
 * Enable link click tracking.
 *
 * @remarks
 * The default behaviour is to use actual click events. However, some browsers
 * (e.g., Firefox, Opera, and Konqueror) don't generate click events for the middle mouse button.
 *
 * To capture more "clicks", the pseudo click-handler uses mousedown + mouseup events.
 * This is not industry standard and is vulnerable to false positives (e.g., drag events).
 *
 * @param configuration The link tracking configuration to use for the new click handlers
 * @param trackers List of tracker IDs that should track the click events
 */
export function enableLinkClickTracking(
  configuration: LinkClickTrackingConfiguration = {},
  trackers: Array<string> = Object.keys(_trackers)
) {
  // remove listeners in case pseudoclick support has been toggled, which may duplicate handlers
  disableLinkClickTracking(trackers);
  trackers.forEach((id) => {
    if (_trackers[id]) {
      configureLinkClickTracking(configuration, id);
      addClickListeners(id);
    }
  });
}

/**
 * Disable link click tracking.
 *
 * Removes all document-level click event handlers installed by the plugin for
 * provided tracker instances.
 *
 * @param trackers The tracker identifiers that will have their listeners removed
 */
export function disableLinkClickTracking(trackers: Array<string> = Object.keys(_trackers)) {
  trackers.forEach((id) => {
    if (_trackers[id] && _listeners[id]) {
      // remove all possible cases where the handler may have been attached
      window.removeEventListener('click', _listeners[id], true);
      window.removeEventListener('mouseup', _listeners[id], true);
      window.removeEventListener('mousedown', _listeners[id], true);
    }
  });
}

/**
 * Add click event listeners to links which have been added to the page since the
 * last time `enableLinkClickTracking` or `refreshLinkClickTracking` was called.
 *
 * @deprecated v4.0 moved to event delegation and this is no longer required
 * @param trackers The tracker identifiers which the have their link click state refreshed
 */
export function refreshLinkClickTracking(_trackers: Array<string> = []) {
  _logger?.warn('refreshLinkClickTracking is deprecated in v4 and has no effect');
}

/**
 * Manually log a click.
 *
 * @param event The event or element information
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackLinkClick(
  event: (LinkClickEvent | { element: TrackableElement; trackContent?: boolean }) & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    let payload: PayloadBuilder | undefined;
    if ('element' in event) {
      const includeContent = event.trackContent ?? _configuration[t.id]?.linkTrackingContent ?? false;
      payload = processClick(event.element, includeContent);
    } else {
      payload = buildLinkClick(event);
    }
    if (payload) t.core.track(payload, event.context, event.timestamp);
  });

  flushPendingCookies();
}

/**
 * Process a clicked element into a link_click event payload.
 * 
 * In case the href of the element is empty, "about:invalid" is used as the target URL.
 *
 * @param sourceElement The trackable element to be used to build the payload
 * @param includeContent Whether to include the element's contents in the payload
 * @returns A link_click SDE payload for the given element, or nothing if the element shouldn't be tracked
 */
function processClick(sourceElement: TrackableElement, includeContent: boolean = false) {
  let elementId, elementClasses, elementTarget, elementContent;

  const anchorElement = sourceElement;
  // browsers, such as Safari, don't downcase hostname and href
  const originalSourceHostName = anchorElement.hostname || getHostName(anchorElement.href);
  const targetUrl = anchorElement.href.replace(originalSourceHostName, (s) => s.toLowerCase());

  // Ignore script pseudo-protocol links
  if (!ELEMENT_PROTOCOL_FILTER.test(targetUrl)) {
    elementId = anchorElement.id;
    elementClasses = getCssClasses(anchorElement);
    elementTarget = anchorElement.target;
    elementContent = includeContent ? anchorElement.innerHTML : undefined;

    if (!targetUrl) {
      _logger?.warn('Link click target URL empty', anchorElement);
    }

    // decodeUrl %xx
    return buildLinkClick({
      targetUrl: targetUrl || 'about:invalid',
      elementId,
      elementClasses,
      elementTarget,
      elementContent,
    });
  }

  return;
}

/**
 * Find the nearest trackable element to the given element; this is Element.closest()
 * with a polyfill if required.
 *
 * @param target
 * @returns An element that may be used to track a link click event, or null if `target` has no eligible parent
 */
function findNearestEligibleElement(target: EventTarget | null): TrackableElement | null {
  if (target instanceof Element) {
    if (typeof target['closest'] === 'function') return target.closest(TRACKABLE_ELEMENTS_SELECTOR);
    let sourceElement: Element | null = target;

    while (sourceElement) {
      const tagName = sourceElement.tagName.toLowerCase();
      if (TRACKABLE_ELEMENTS.indexOf(tagName) !== -1) return sourceElement as TrackableElement;
      sourceElement = sourceElement.parentElement;
    }
  }

  return null;
}

/**
 * Handle a (pseudo)click event; decide if the click is for a valid, unfiltered,
 * element and track the click.
 *
 * @param tracker Tracker ID to generate the event for
 * @param evt The DOM click event itself
 */
function clickHandler(tracker: string, evt: MouseEvent | undefined): void {
  const context = _configuration[tracker].linkTrackingContext;
  const filter = _configuration[tracker].linkTrackingFilter;

  const event = evt || (window.event as MouseEvent);

  const button = event.which || event.button;

  const clicked = event.composed ? event.composedPath()[0] : event.target || event.srcElement;
  const target = findNearestEligibleElement(clicked);

  if (!target || target.href == null) return;
  if (filter && !filter(target)) return;

  // Using evt.type (added in IE4), we avoid defining separate handlers for mouseup and mousedown.
  if (event.type === 'click') {
    trackLinkClick({
      element: target,
      context: resolveDynamicContext(context, target),
    });
  } else if (event.type === 'mousedown') {
    if (button === 1 || button === 2) {
      _configuration[tracker].lastButton = button;
      _configuration[tracker].lastTarget = target;
    } else {
      delete _configuration[tracker].lastButton;
    }
  } else if (event.type === 'mouseup') {
    if (button === _configuration[tracker].lastButton && target === _configuration[tracker].lastTarget) {
      trackLinkClick({
        element: target,
        context: resolveDynamicContext(context, target),
      });
    }
    delete _configuration[tracker].lastButton;
    delete _configuration[tracker].lastTarget;
  }
}

/**
 * Update the link-tracking configuration for the given tracker ID.
 *
 * @param param0 The new link-tracking configuration
 * @param tracker The tracker ID to update configuration for
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

/**
 * Add (psuedo)click handlers to the window for the given tracker ID.
 *
 * @param trackerId Tracker ID to install a listener for
 */
function addClickListeners(trackerId: string) {
  // by re-using exact function references the browser will prevent dupes and allow removal
  _listeners[trackerId] = _listeners[trackerId] || clickHandler.bind(null, trackerId);

  if (_configuration[trackerId].linkTrackingPseudoClicks) {
    // for simplicity and performance, we ignore drag events
    addEventListener(window, 'mouseup', _listeners[trackerId], true);
    addEventListener(window, 'mousedown', _listeners[trackerId], true);
  } else {
    addEventListener(window, 'click', _listeners[trackerId], true);
  }
}
