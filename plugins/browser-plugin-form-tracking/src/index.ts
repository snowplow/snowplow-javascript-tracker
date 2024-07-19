import type { BrowserPlugin, BrowserTracker } from '@snowplow/browser-tracker-core';
import { addFormListeners, removeFormListeners, type FormTrackingConfiguration } from './helpers';

export { type FormTrackingConfiguration } from './helpers';

const _trackers: Record<string, BrowserTracker> = {};

/**
 * A plugin which enables automatic form focus, change, and submit tracking
 */
export function FormTrackingPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      _trackers[tracker.id] = tracker;
    },
  };
}

/**
 * Enables automatic form tracking.
 *
 * An event will be fired when a form field is changed or a form submitted.
 * This can be called multiple times: previous listeners will be removed and replaced with any updated configuration.
 *
 * @param configuration - The form tracking configuration
 * @param trackers - The tracker identifiers which the events will be sent to
 */
export function enableFormTracking(
  configuration: FormTrackingConfiguration = {},
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      removeFormListeners(_trackers[t]);
      addFormListeners(_trackers[t], configuration);
    }
  });
}

/**
 * Disables automatic form tracking.
 *
 * All page-level listeners for the given trackers will be removed.
 *
 * @param trackers - The tracker identifiers which the events will be sent to
 */
export function disableFormTracking(trackers: Array<string> = Object.keys(_trackers)) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      removeFormListeners(_trackers[t]);
    }
  });
}
