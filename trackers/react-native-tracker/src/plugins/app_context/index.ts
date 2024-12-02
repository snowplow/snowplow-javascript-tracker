import { CorePluginConfiguration, SelfDescribingJson } from '@snowplow/tracker-core';
import { AppLifecycleConfiguration } from '../../types';
import { APPLICATION_CONTEXT_SCHEMA, MOBILE_APPLICATION_CONTEXT_SCHEMA } from '../../constants';

/**
 * Tracks the application context entity with information about the app version.
 * If appBuild is provided, a mobile application context is tracked, otherwise the Web equivalent is tracked.
 * 
 * Entity schema if `appBuild` property is set: `iglu:com.snowplowanalytics.mobile/application/jsonschema/1-0-0`
 * Entity schema if `appBuild` property is not set: `iglu:com.snowplowanalytics.snowplow/application/jsonschema/1-0-0`
 */
export function newAppContextPlugin({ appVersion, appBuild }: AppLifecycleConfiguration): CorePluginConfiguration {
  const contexts = () => {
    let entities: SelfDescribingJson[] = [];

    if (appVersion) {
      // Add application context to all events
      if (appBuild) {
        entities.push({
          schema: MOBILE_APPLICATION_CONTEXT_SCHEMA,
          data: {
            version: appVersion,
            build: appBuild,
          },
        });
      } else {
        entities.push({
          schema: APPLICATION_CONTEXT_SCHEMA,
          data: {
            version: appVersion,
          },
        });
      }
    }

    return entities;
  };

  return {
    plugin: {
      contexts,
    },
  };
}
