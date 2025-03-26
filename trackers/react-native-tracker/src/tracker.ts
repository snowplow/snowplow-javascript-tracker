import { trackerCore, PayloadBuilder, version, EmitterConfiguration, TrackerCore } from '@snowplow/tracker-core';

import { newEmitter } from '@snowplow/tracker-core';
import { newReactNativeEventStore } from './event_store';
import { newTrackEventFunctions } from './events';
import { newSubject } from './subject';
import {
  ScreenTrackingConfiguration,
  ScreenTrackingPlugin,
  trackListItemView,
  trackScreenView,
  trackScrollChanged,
} from '@snowplow/browser-plugin-screen-tracking';

import {
  DeepLinkConfiguration,
  AppLifecycleConfiguration,
  EventContext,
  EventStoreConfiguration,
  ListItemViewProps,
  PlatformContextConfiguration,
  ReactNativeTracker,
  ScreenViewProps,
  ScrollChangedProps,
  SessionConfiguration,
  SubjectConfiguration,
  TrackerConfiguration,
} from './types';
import { newSessionPlugin } from './plugins/session';
import { newDeepLinksPlugin } from './plugins/deep_links';
import { newPlugins } from './plugins';
import { newPlatformContextPlugin } from './plugins/platform_context';
import { newAppLifecyclePlugin } from './plugins/app_lifecycle';
import { newAppInstallPlugin } from './plugins/app_install';
import { newAppContextPlugin } from './plugins/app_context';
import DefaultAsyncStorage from '@react-native-async-storage/async-storage';

const initializedTrackers: Record<string, { tracker: ReactNativeTracker; core: TrackerCore }> = {};

type SetPropertiesAsNonNullable<Obj, Properties extends keyof Obj> = Omit<Obj, Properties> & {
  [K in Properties]-?: NonNullable<Obj[K]>;
};

type Configuration = TrackerConfiguration &
  EmitterConfiguration &
  SessionConfiguration &
  SubjectConfiguration &
  EventStoreConfiguration &
  ScreenTrackingConfiguration &
  PlatformContextConfiguration &
  DeepLinkConfiguration &
  AppLifecycleConfiguration;

type NormalizedConfiguration = SetPropertiesAsNonNullable<
  Configuration,
  'asyncStorage' | 'devicePlatform' | 'encodeBase64' | 'eventStore' | 'plugins'
>;

const normalizeTrackerConfiguration = async (configuration: Configuration): Promise<NormalizedConfiguration> => {
  const eventStore = configuration.eventStore ?? (await newReactNativeEventStore(configuration));
  const asyncStorage = configuration.asyncStorage ?? DefaultAsyncStorage;
  const plugins = configuration.plugins ?? [];
  const devicePlatform = configuration.devicePlatform ?? 'mob';
  const encodeBase64 = configuration.encodeBase64 ?? false;

  return {
    ...configuration,
    devicePlatform,
    encodeBase64,
    asyncStorage,
    eventStore,
    plugins,
  };
};

/**
 * Creates a new tracker instance with the given configuration
 * @param configuration - Configuration for the tracker
 * @returns Tracker instance
 */
export async function newTracker(configuration: Configuration): Promise<ReactNativeTracker> {
  const normalizedConfiguration = await normalizeTrackerConfiguration(configuration);

  const { namespace, appId, encodeBase64 } = normalizedConfiguration;

  const emitter = newEmitter(normalizedConfiguration);
  const callback = (payload: PayloadBuilder): void => {
    emitter.input(payload.build());
  };

  const core = trackerCore({ base64: encodeBase64, callback });

  core.setPlatform(normalizedConfiguration.devicePlatform);
  core.setTrackerVersion('rn-' + version);
  core.setTrackerNamespace(namespace);
  if (appId) {
    core.setAppId(appId);
  }

  const { addPlugin } = newPlugins(namespace, core);

  const sessionPlugin = await newSessionPlugin(normalizedConfiguration);
  addPlugin(sessionPlugin);

  const deepLinksPlugin = newDeepLinksPlugin(normalizedConfiguration, core);
  addPlugin(deepLinksPlugin);

  const subject = newSubject(core, normalizedConfiguration);
  addPlugin(subject.subjectPlugin);

  const screenPlugin = ScreenTrackingPlugin(normalizedConfiguration);
  addPlugin({ plugin: screenPlugin });

  const platformContextPlugin = await newPlatformContextPlugin(normalizedConfiguration);
  addPlugin(platformContextPlugin);

  const lifecyclePlugin = await newAppLifecyclePlugin(normalizedConfiguration, core);
  addPlugin(lifecyclePlugin);

  const installPlugin = newAppInstallPlugin(normalizedConfiguration, core);
  addPlugin(installPlugin);

  const appContextPlugin = newAppContextPlugin(normalizedConfiguration);
  addPlugin(appContextPlugin);

  normalizedConfiguration.plugins.forEach((plugin) => addPlugin({ plugin }));

  const tracker: ReactNativeTracker = {
    ...newTrackEventFunctions(core),
    ...subject.properties,
    namespace,
    setAppId: core.setAppId,
    setPlatform: core.setPlatform,
    flush: emitter.flush,
    addGlobalContexts: core.addGlobalContexts,
    removeGlobalContexts: core.removeGlobalContexts,
    clearGlobalContexts: core.clearGlobalContexts,
    enablePlatformContext: platformContextPlugin.enablePlatformContext,
    disablePlatformContext: platformContextPlugin.disablePlatformContext,
    refreshPlatformContext: platformContextPlugin.refreshPlatformContext,
    getSessionId: sessionPlugin.getSessionId,
    getSessionIndex: sessionPlugin.getSessionIndex,
    getSessionUserId: sessionPlugin.getSessionUserId,
    getSessionState: sessionPlugin.getSessionState,
    addPlugin,
    trackScreenViewEvent: (argmap: ScreenViewProps, context?: EventContext[]) =>
      trackScreenView(
        {
          ...argmap,
          context,
        },
        [namespace]
      ),
    trackScrollChangedEvent: (argmap: ScrollChangedProps, context?: EventContext[]) =>
      trackScrollChanged(
        {
          ...argmap,
          context,
        },
        [namespace]
      ),
    trackListItemViewEvent: (argmap: ListItemViewProps, context?: EventContext[]) =>
      trackListItemView(
        {
          ...argmap,
          context,
        },
        [namespace]
      ),
    trackDeepLinkReceivedEvent: deepLinksPlugin.trackDeepLinkReceivedEvent,
    getIsInBackground: lifecyclePlugin.getIsInBackground,
    getBackgroundIndex: lifecyclePlugin.getBackgroundIndex,
    getForegroundIndex: lifecyclePlugin.getForegroundIndex,
  };
  initializedTrackers[namespace] = { tracker, core };

  return tracker;
}

/**
 * Retrieves an initialized tracker given its namespace
 * @param trackerNamespace - Tracker namespace
 * @returns Tracker instance if exists
 */
export function getTracker(trackerNamespace: string): ReactNativeTracker | undefined {
  return initializedTrackers[trackerNamespace]?.tracker;
}

/**
 * Retrieves all initialized trackers
 * @returns All initialized trackers
 */
export function getAllTrackers(): ReactNativeTracker[] {
  return Object.values(initializedTrackers).map(({ tracker }) => tracker);
}

/**
 * Internal function to retrieve the tracker core given its namespace
 * @param trackerNamespace - Tracker namespace
 * @returns Tracker core if exists
 */
export function getTrackerCore(trackerNamespace: string): TrackerCore | undefined {
  return initializedTrackers[trackerNamespace]?.core;
}

/**
 * Internal function to retrieve all initialized tracker cores
 * @returns All initialized tracker cores
 */
export function getAllTrackerCores(): TrackerCore[] {
  return Object.values(initializedTrackers).map(({ core }) => core);
}

/**
 * Removes a tracker given its namespace
 *
 * @param trackerNamespace - Tracker namespace
 */
export function removeTracker(trackerNamespace: string): void {
  if (initializedTrackers[trackerNamespace]) {
    initializedTrackers[trackerNamespace]?.core.deactivate();
    delete initializedTrackers[trackerNamespace];
  }
}

/**
 * Removes all initialized trackers
 *
 * @returns - A boolean promise
 */
export function removeAllTrackers(): void {
  Object.keys(initializedTrackers).forEach(removeTracker);
}
