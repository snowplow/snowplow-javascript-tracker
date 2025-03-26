import { EventStore, EventStorePayload, newInMemoryEventStore } from '@snowplow/tracker-core';
import { AsyncStorage, EventStoreConfiguration, TrackerConfiguration } from './types';

type Configuration = Omit<EventStoreConfiguration, 'asyncStorage'> &
  TrackerConfiguration & { asyncStorage: AsyncStorage };

export async function newReactNativeEventStore({
  namespace,
  maxEventStoreSize = 1000,
  useAsyncStorageForEventStore: useAsyncStorage = true,
  asyncStorage,
}: Configuration): Promise<EventStore> {
  const queueName = `snowplow_${namespace}`;

  async function newInMemoryEventStoreForReactNative() {
    if (useAsyncStorage) {
      const data = await asyncStorage.getItem(queueName);
      const events: EventStorePayload[] = data ? JSON.parse(data) : [];
      return newInMemoryEventStore({ maxSize: maxEventStoreSize, events });
    } else {
      return newInMemoryEventStore({ maxSize: maxEventStoreSize });
    }
  }

  const eventStore = await newInMemoryEventStoreForReactNative();

  const { getAll, getAllPayloads, add, count, iterator, removeHead } = eventStore;

  async function sync() {
    if (useAsyncStorage) {
      const events = await getAll();
      await asyncStorage.setItem(queueName, JSON.stringify(events));
    }
  }

  return {
    count,
    add: async (payload: EventStorePayload) => {
      await add(payload);
      await sync();
      return await count();
    },
    removeHead: async (n: number) => {
      removeHead(n);
      await sync();
    },
    iterator,
    getAll,
    getAllPayloads,
  };
}
