import { EventStore, newInMemoryEventStore, Payload } from '@snowplow/tracker-core';
import { LocalStorageEventStoreConfigurationBase } from './types';

export interface LocalStorageEventStoreConfiguration extends LocalStorageEventStoreConfigurationBase {
  /**
   * The unique identifier for the event store
   */
  trackerId: string;
}

export interface LocalStorageEventStore extends EventStore {
  setUseLocalStorage: (localStorage: boolean) => void;
}

export function newLocalStorageEventStore({
  trackerId,
  maxLocalStorageQueueSize = 1000,
  useLocalStorage = true,
}: LocalStorageEventStoreConfiguration): LocalStorageEventStore {
  const queueName = `snowplowOutQueue_${trackerId}`;

  function newInMemoryEventStoreFromLocalStorage() {
    if (useLocalStorage) {
      const localStorageQueue = window.localStorage.getItem(queueName);
      const events: Payload[] = localStorageQueue ? JSON.parse(localStorageQueue) : [];
      return newInMemoryEventStore({ maxSize: maxLocalStorageQueueSize, events });
    } else {
      return newInMemoryEventStore({ maxSize: maxLocalStorageQueueSize });
    }
  }

  const { getAll, add, count, iterator, removeHead } = newInMemoryEventStoreFromLocalStorage();

  function sync(): Promise<void> {
    if (useLocalStorage) {
      return getAll().then((events) => {
        window.localStorage.setItem(queueName, JSON.stringify(events));
      });
    } else {
      return Promise.resolve();
    }
  }

  return {
    count,
    add: (payload: Payload) => {
      add(payload);
      return sync().then(count);
    },
    removeHead: (count: number) => {
      removeHead(count);
      return sync();
    },
    iterator,
    getAll,
    setUseLocalStorage: (use: boolean) => {
      useLocalStorage = use;
    },
  };
}
