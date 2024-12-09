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

const initializedTrackers: Record<string, { tracker: ReactNativeTracker; core: TrackerCore }> = {};

/**
 * Creates a new tracker instance with the given configuration
 * @param configuration - Configuration for the tracker
 * @returns Tracker instance
 */
export async function newTracker(
  configuration: TrackerConfiguration &
    EmitterConfiguration &
    SessionConfiguration &
    SubjectConfiguration &
    EventStoreConfiguration &
    ScreenTrackingConfiguration &
    PlatformContextConfiguration &
    DeepLinkConfiguration
): Promise<ReactNativeTracker> {
  const { namespace, appId, encodeBase64 = false } = configuration;
  if (configuration.eventStore === undefined) {
    configuration.eventStore = await newReactNativeEventStore(configuration);
  }

  const emitter = newEmitter(configuration);
  const callback = (payload: PayloadBuilder): void => {
    emitter.input(payload.build());
  };

  const core = trackerCore({ base64: encodeBase64, callback });

  core.setPlatform('mob'); // default platform
  core.setTrackerVersion('rn-' + version);
  core.setTrackerNamespace(namespace);
  if (appId) {
    core.setAppId(appId);
  }

  const { addPlugin } = newPlugins(namespace, core);

  const sessionPlugin = await newSessionPlugin(configuration);
  addPlugin(sessionPlugin);

  const deepLinksPlugin = await newDeepLinksPlugin(configuration, core);
  addPlugin(deepLinksPlugin);

  const subject = newSubject(core, configuration);
  addPlugin(subject.subjectPlugin);

  const screenPlugin = ScreenTrackingPlugin(configuration);
  addPlugin({ plugin: screenPlugin });

  const platformContextPlugin = await newPlatformContextPlugin(configuration);
  addPlugin(platformContextPlugin);

  (configuration.plugins ?? []).forEach((plugin) => addPlugin({ plugin }));

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
