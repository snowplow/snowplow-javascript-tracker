import { newEmitter, EmitterConfiguration } from '@snowplow/tracker-core';
import {
  newLocalStorageEventStore,
  LocalStorageEventStoreConfiguration,
  LocalStorageEventStore,
} from './local_storage_event_store';
import { Payload } from '@snowplow/tracker-core';
import { SharedState } from '../state';

export interface OutQueue {
  enqueueRequest: (request: Payload) => Promise<void>;
  executeQueue: () => Promise<void>;
  setUseLocalStorage: (localStorage: boolean) => void;
  setAnonymousTracking: (anonymous: boolean) => void;
  setCollectorUrl: (url: string) => void;
  setBufferSize: (bufferSize: number) => void;
}

export function newOutQueue(
  configuration: EmitterConfiguration & LocalStorageEventStoreConfiguration,
  sharedState: SharedState
): OutQueue {
  const eventStore = configuration.eventStore ?? newLocalStorageEventStore(configuration);
  configuration.eventStore = eventStore;
  const emitter = newEmitter(configuration);

  sharedState.bufferFlushers.push(emitter.flush);

  return {
    enqueueRequest: emitter.input,
    executeQueue: emitter.flush,
    setAnonymousTracking: emitter.setAnonymousTracking,
    setCollectorUrl: emitter.setCollectorUrl,
    setBufferSize: emitter.setBufferSize,
    setUseLocalStorage: (localStorage: boolean) => {
      if (eventStore.hasOwnProperty('setUseLocalStorage')) {
        const localStorageStore = eventStore as LocalStorageEventStore;
        localStorageStore.setUseLocalStorage(localStorage);
      }
    },
  };
}
