import { BrowserPlugin, BrowserTracker } from '@snowplow/browser-tracker-core';
import { addFormListeners, FormTrackingConfiguration } from './helpers';

export { FormTrackingConfiguration } from './helpers';

const _trackers: Record<string, BrowserTracker> = {};

/**
 * A plugin which enabled automatic form tracking
 */
export function FormTrackingPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      _trackers[tracker.id] = tracker;
    },
  };
}

/**
 * Enables automatic form tracking
 * An event will be fired when a form field is changed or a form submitted.
 * This can be called multiple times: only forms not already tracked will be tracked.
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
      if (_trackers[t].sharedState.hasLoaded) {
        addFormListeners(_trackers[t], configuration);
      } else {
        _trackers[t].sharedState.registeredOnLoadHandlers.push(function () {
          addFormListeners(_trackers[t], configuration);
        });
      }
    }
  });
}
