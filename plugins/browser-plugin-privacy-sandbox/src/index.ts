import { BrowserPlugin } from '@snowplow/browser-tracker-core';
import { PRIVACY_SANDBOX_TOPICS_SCHEMA } from './schemata';
import { LOG } from '@snowplow/tracker-core';
import { BrowsingTopicsOptions, PrivacySandboxTopic, Topic } from './types';

declare global {
  interface Document {
    /* Declare Feature Policy types https://developer.mozilla.org/en-US/docs/Web/API/FeaturePolicy */
    featurePolicy?: {
      allowsFeature: (feature: string, origin?: string) => boolean;
    };
    browsingTopics: (options: BrowsingTopicsOptions) => Promise<PrivacySandboxTopic[]>;
  }
}

/**
 * Adds Privacy Sandbox Topics context to events
 */
export function PrivacySandboxPlugin(): BrowserPlugin {
  let topics: Topic[] = [];

  return {
    activateBrowserPlugin: function () {
      const isTopicsApiAvailable =
        'browsingTopics' in document && document.featurePolicy?.allowsFeature('browsing-topics');

      if (isTopicsApiAvailable) {
        document
          .browsingTopics({ skipObservation: true })
          .then((availableTopics) => {
            topics = availableTopics.map(({ topic, version }) => ({
              topic,
              version,
            }));
          })
          .catch((err) => LOG.error(err));
      }
    },
    contexts: function () {
      return topics.length ? [{ schema: PRIVACY_SANDBOX_TOPICS_SCHEMA, data: { topics } }] : [];
    },
  };
}
