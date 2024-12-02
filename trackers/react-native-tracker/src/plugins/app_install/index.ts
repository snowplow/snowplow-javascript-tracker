import { buildSelfDescribingEvent, CorePluginConfiguration, TrackerCore } from '@snowplow/tracker-core';
import { AppLifecycleConfiguration, TrackerConfiguration } from '../../types';
import { APPLICATION_INSTALL_EVENT_SCHEMA } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Tracks an application install event on the first run of the app.
 * Stores the install event in AsyncStorage to prevent tracking on subsequent runs.
 *
 * Event schema: `iglu:com.snowplowanalytics.mobile/application_install/jsonschema/1-0-0`
 */
export function newAppInstallPlugin(
  { namespace, installAutotracking = false }: TrackerConfiguration & AppLifecycleConfiguration,
  core: TrackerCore
): CorePluginConfiguration {
  if (installAutotracking) {
    // Track install event on first run
    const key = `snowplow_${namespace}_install`;
    setTimeout(async () => {
      const installEvent = await AsyncStorage.getItem(key);
      if (!installEvent) {
        core.track(
          buildSelfDescribingEvent({
            event: {
              schema: APPLICATION_INSTALL_EVENT_SCHEMA,
              data: {},
            },
          })
        );
        await AsyncStorage.setItem(key, new Date().toISOString());
      }
    }, 0);
  }
  return {
    plugin: {},
  };
}
