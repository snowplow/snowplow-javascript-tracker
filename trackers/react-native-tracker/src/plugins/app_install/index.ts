import type { CorePluginConfiguration, TrackerCore } from '@snowplow/tracker-core';
import { buildSelfDescribingEvent } from '@snowplow/tracker-core';
import { APPLICATION_INSTALL_EVENT_SCHEMA } from '../../constants';
import type { AppLifecycleConfiguration, AsyncStorage, TrackerConfiguration } from '../../types';

/**
 * Tracks an application install event on the first run of the app.
 * Stores the install event in AsyncStorage to prevent tracking on subsequent runs.
 *
 * Event schema: `iglu:com.snowplowanalytics.mobile/application_install/jsonschema/1-0-0`
 */
export function newAppInstallPlugin(
  {
    asyncStorage,
    namespace,
    installAutotracking = false,
  }: TrackerConfiguration & AppLifecycleConfiguration & { asyncStorage: AsyncStorage },
  core: TrackerCore
): CorePluginConfiguration {
  if (installAutotracking) {
    // Track install event on first run
    const key = `snowplow_${namespace}_install`;
    setTimeout(async () => {
      const installEvent = await asyncStorage.getItem(key);
      if (!installEvent) {
        core.track(
          buildSelfDescribingEvent({
            event: {
              schema: APPLICATION_INSTALL_EVENT_SCHEMA,
              data: {},
            },
          })
        );
        await asyncStorage.setItem(key, new Date().toISOString());
      }
    }, 0);
  }
  return {
    plugin: {},
  };
}
