import { PayloadBuilder } from '@snowplow/tracker-core';
import { snowplowMediaPluginIntegration } from './snowplow-media-plugin';

export type AvailablePlugins = 'SnowplowMediaPlugin';

export type Integration = {
  /**
   * Find a matching event for the integration with a plugin and an event specification id map.
   * The returned string should match what we expect as key coming from the configuration object on this specific plugin integration.
   */
  detectMatchingEvent: (payloadBuilder: PayloadBuilder) => string | undefined;
};

export const integrations: Record<AvailablePlugins, Integration> = {
  SnowplowMediaPlugin: snowplowMediaPluginIntegration,
} as const;
