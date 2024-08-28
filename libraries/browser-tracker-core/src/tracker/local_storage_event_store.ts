import { EventStore, EventStoreConfiguration, newInMemoryEventStore, Payload } from '@snowplow/tracker-core';

export interface LocalStorageEventStoreConfigurationBase extends EventStoreConfiguration {
  /**
   * The maximum amount of events that will be buffered in local storage
   *
   * This is useful to ensure the Tracker doesn't fill the 5MB or 10MB available to
   * each website should the collector be unavailable due to lost connectivity.
   * Will drop events once the limit is hit
   * @defaultValue 1000
   */
  maxLocalStorageQueueSize?: number;

  /**
   * Whether to use localStorage at all
   * Default is true
   */
  useLocalStorage?: boolean;
}

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
