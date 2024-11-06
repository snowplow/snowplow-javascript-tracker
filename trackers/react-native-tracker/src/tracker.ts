import { trackerCore, PayloadBuilder, version, EmitterConfiguration } from '@snowplow/tracker-core';

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

  return {
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
}
