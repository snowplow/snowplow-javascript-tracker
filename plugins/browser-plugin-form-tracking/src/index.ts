import { BrowserPlugin, BrowserTracker } from '@snowplow/browser-core';
import { DynamicContexts } from '@snowplow/tracker-core';
import { TrackerAndFormConfiguration, FormTrackingConfig, addFormListeners, configureFormTracking } from './helpers';

const _trackers: Record<string, TrackerAndFormConfiguration> = {};

/**
 * Enables automatic form tracking.
 * An event will be fired when a form field is changed or a form submitted.
 * This can be called multiple times: only forms not already tracked will be tracked.
 *
 * @param object config Configuration object determining which forms and fields to track.
 *                      Has two properties: "forms" and "fields"
 * @param array context Context for all form tracking events
 */
export function enableFormTracking(
  { options, context }: { options: FormTrackingConfig; context: DynamicContexts },
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      if (_trackers[t].tracker.sharedState.hasLoaded) {
        configureFormTracking(_trackers[t], options);
        addFormListeners(_trackers[t], context);
      } else {
        _trackers[t].tracker.sharedState.registeredOnLoadHandlers.push(function () {
          configureFormTracking(_trackers[t], options);
          addFormListeners(_trackers[t], context);
        });
      }
    }
  });
}

export const FormTrackingPlugin = (): BrowserPlugin => {
  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      _trackers[tracker.id] = { tracker: tracker };
    },
  };
};
