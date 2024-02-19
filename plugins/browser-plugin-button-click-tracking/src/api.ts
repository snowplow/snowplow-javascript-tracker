import { BrowserPlugin, BrowserTracker, dispatchToTrackersInCollection } from '@snowplow/browser-tracker-core';
import { DynamicContext, CommonEventProperties, resolveDynamicContext } from '@snowplow/tracker-core';

import { createEventFromButton, filterFunctionFromFilter } from './util';
import { buildButtonClick } from './core';
import { ButtonClickEvent, ButtonClickTrackingConfiguration, FilterFunction } from './types';

const _trackers: Record<string, BrowserTracker> = {};

// The event listeners added to the document, for each tracker
// This allows them to be removed with `removeEventListener` if button click tracking is disabled
const _listeners: Record<string, (event: MouseEvent) => void> = {};

/**
 * Button click tracking
 *
 * Will automatically tracking button clicks once enabled with 'enableButtonClickTracking'
 * or you can manually track button clicks with 'trackButtonClick'
 */
export function ButtonClickTrackingPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      _trackers[tracker.id] = tracker;
    },
  };
}

/**
 * Manually log a click
 *
 * @param event - The event information
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackButtonClick(
  event: ButtonClickEvent & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildButtonClick(event), event.context, event.timestamp);
  });
}

/**
 * Enable automatic click tracking for all `<button>` and `<input type="button">` elements on the page
 *
 * @param configuration  - The configuration for automatic button click tracking
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function enableButtonClickTracking(
  configuration: ButtonClickTrackingConfiguration = {},
  trackers: Array<string> = Object.keys(_trackers)
) {
  // Ensure that click tracking uses the latest configuration
  // In the case of `enableButtonClickTracking` being called multiple times in a row
  disableButtonClickTracking();

  trackers.forEach((trackerId) => {
    // Store the configuration for this tracker, if it doesn't already exist
    // This allows us to enable click tracking for a tracker if it has been disabled
    _listeners[trackerId] = (event: MouseEvent) => {
      eventHandler(event, trackerId, filterFunctionFromFilter(configuration.filter), configuration.context);
    };

    const addClickListener = () => {
      document.addEventListener('click', _listeners[trackerId]);
    };

    if (_trackers[trackerId]?.sharedState.hasLoaded) {
      // the load event has already fired, add the click listeners now
      addClickListener();
    } else {
      // defer until page has loaded
      _trackers[trackerId]?.sharedState.registeredOnLoadHandlers.push(addClickListener);
    }
  });
}

/**
 * Disable automatic click tracking for all `<button>` and `<input type="button">` elements on the page
 *
 * Can be re-enabled with {@link enableButtonClickTracking}
 */
export function disableButtonClickTracking() {
  for (const trackerId in _trackers) {
    if (_listeners[trackerId]) {
      document.removeEventListener('click', _listeners[trackerId]);
    }
  }
}

/**
 * Handle a click event
 *
 * @param event - The click event
 * @param trackerId - The tracker identifier which the event will be sent to
 * @param filter - The filter function to use for button click tracking
 * @param context - The dynamic context which will be evaluated for each button click event
 */
function eventHandler(event: MouseEvent, trackerId: string, filter: FilterFunction, context?: DynamicContext) {
  let elem = event.target as HTMLElement | null;
  while (elem) {
    if (elem instanceof HTMLButtonElement || (elem instanceof HTMLInputElement && elem.type === 'button')) {
      if (filter(elem)) {
        const buttonClickEvent = createEventFromButton(elem);
        buttonClickEvent.context = resolveDynamicContext(context, buttonClickEvent);
        trackButtonClick(buttonClickEvent, [trackerId]);
      }
      // presume nested buttons aren't a thing
      return;
    }

    elem = elem.parentElement;
  }
}
