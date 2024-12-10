import { buildSelfDescribingEvent, CorePluginConfiguration, PayloadBuilder, TrackerCore } from '@snowplow/tracker-core';
import { DeepLinkConfiguration, DeepLinkReceivedProps, EventContext } from '../../types';
import { DEEP_LINK_ENTITY_SCHEMA, DEEP_LINK_RECEIVED_EVENT_SCHEMA, PAGE_REFERRER_PROPERTY, PAGE_URL_PROPERTY, SCREEN_VIEW_EVENT_SCHEMA } from '../../constants';
import { getUsefulSchema } from '../../utils';

interface DeepLinksPlugin extends CorePluginConfiguration {
  trackDeepLinkReceivedEvent: (argmap: DeepLinkReceivedProps, contexts?: EventContext[]) => void;
}

export function newDeepLinksPlugin(
  { deepLinkContext = true }: DeepLinkConfiguration,
  core: TrackerCore
): DeepLinksPlugin {
  let lastDeepLink: DeepLinkReceivedProps | undefined;

  const beforeTrack = (payloadBuilder: PayloadBuilder) => {
    const schema = getUsefulSchema(payloadBuilder);

    if (schema == SCREEN_VIEW_EVENT_SCHEMA && lastDeepLink) {
      const { url, referrer } = lastDeepLink;
      if (url) {
        payloadBuilder.add(PAGE_URL_PROPERTY, url);
      }
      if (referrer) {
        payloadBuilder.add(PAGE_REFERRER_PROPERTY, referrer);
      }

      if (deepLinkContext) {
        payloadBuilder.addContextEntity({
          schema: DEEP_LINK_ENTITY_SCHEMA,
          data: lastDeepLink,
        });
      }

      // Clear the last deep link since we only add it to the first screen view event
      lastDeepLink = undefined;
    }
  };

  const trackDeepLinkReceivedEvent = (argmap: DeepLinkReceivedProps, contexts?: EventContext[]) => {
    lastDeepLink = argmap;

    const payload = buildSelfDescribingEvent({
      event: {
        schema: DEEP_LINK_RECEIVED_EVENT_SCHEMA,
        data: argmap,
      },
    });

    // Add atomic event properties
    const { url, referrer } = argmap;
    if (url) {
      payload.add(PAGE_URL_PROPERTY, url);
    }
    if (referrer) {
      payload.add(PAGE_REFERRER_PROPERTY, referrer);
    }

    core.track(payload, contexts);
  };

  return {
    trackDeepLinkReceivedEvent,
    plugin: {
      beforeTrack,
    },
  };
}
