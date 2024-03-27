import { BrowserPlugin, BrowserTracker } from '@snowplow/browser-tracker-core';
import { integrations, AvailablePlugins } from './integrations';
import { createEventSpecificationContext } from './utils';

const _trackers: Record<string, BrowserTracker> = {};

type EventSpecificationsPluginOptions = {
  [k in AvailablePlugins]?: Record<string, string>;
};

const defaultPluginOptions = {};

export function EventSpecificationsPlugin(
  pluginOptions: EventSpecificationsPluginOptions = defaultPluginOptions
): BrowserPlugin {
  const options = { ...defaultPluginOptions, ...pluginOptions };
  const enabledIntegrations = Object.keys(integrations).filter(
    (integration) => options[integration as AvailablePlugins]
  );
  let trackerId: string;
  return {
    activateBrowserPlugin: (tracker) => {
      trackerId = tracker.id;
      _trackers[trackerId] = tracker;
    },
    beforeTrack(payloadBuilder) {
      enabledIntegrations.forEach((integrationKey) => {
        const matchedEvent = integrations[integrationKey as AvailablePlugins].detectMatchingEvent(payloadBuilder);
        if (!matchedEvent) {
          return;
        }
        const matchingPluginEventMap = options[integrationKey as AvailablePlugins];
        const matchingEventSpecificationId = matchingPluginEventMap && matchingPluginEventMap[matchedEvent];
        if (!matchingEventSpecificationId) {
          return;
        }
        payloadBuilder.addContextEntity(createEventSpecificationContext(matchingEventSpecificationId));
      });
    },
  };
}
