import { trackerCore, PayloadBuilder, version, EmitterConfiguration, TrackerCore } from '@snowplow/tracker-core';

import { newEmitter } from '@snowplow/tracker-core';
import { newReactNativeEventStore } from './event_store';
import { newTrackEventFunctions } from './events';
import { newSubject } from './subject';

import {
  EventStoreConfiguration,
  ReactNativeTracker,
  SessionConfiguration,
  SubjectConfiguration,
  TrackerConfiguration,
} from './types';

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
    EventStoreConfiguration
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
  const subject = newSubject(core, configuration);
  core.addPlugin(subject.subjectPlugin);

  core.setPlatform('mob'); // default platform
  core.setTrackerVersion('rn-' + version);
  core.setTrackerNamespace(namespace);
  if (appId) {
    core.setAppId(appId);
  }

  const tracker = {
    ...newTrackEventFunctions(core),
    ...subject.properties,
    setAppId: core.setAppId,
    setPlatform: core.setPlatform,
    flush: emitter.flush,
    addGlobalContexts: core.addGlobalContexts,
    removeGlobalContexts: core.removeGlobalContexts,
    clearGlobalContexts: core.clearGlobalContexts,
    addPlugin: core.addPlugin,
  };
  initializedTrackers[namespace] = { tracker, core };
  return tracker;
}

/**
 * Retrieves an initialized tracker given its namespace
 * @param trackerNamespace Tracker namespace
 * @returns Tracker instance if exists
 */
export function getTracker(trackerNamespace: string): ReactNativeTracker | undefined {
  return initializedTrackers[trackerNamespace]?.tracker;
}

/**
 * Removes a tracker given its namespace
 *
 * @param trackerNamespace {string}
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
