import { EventStore, EventStorePayload, newInMemoryEventStore } from '@snowplow/tracker-core';
import { getAppStorage } from './app_storage';
import { EventStoreConfiguration, TrackerConfiguration } from './types';

export async function newReactNativeEventStore({
  namespace,
  maxEventStoreSize = 1000,
  useAppStorageForEventStore = true,
}: EventStoreConfiguration & TrackerConfiguration): Promise<EventStore> {
  const queueName = `snowplow_${namespace}`;

  async function newInMemoryEventStoreForReactNative() {
    const appStorage = getAppStorage();

    if (useAppStorageForEventStore) {
      const data = await appStorage.getItem(queueName);
      const events: EventStorePayload[] = data ? JSON.parse(data) : [];
      return newInMemoryEventStore({ maxSize: maxEventStoreSize, events });
    } else {
      return newInMemoryEventStore({ maxSize: maxEventStoreSize });
    }
  }

  const eventStore = await newInMemoryEventStoreForReactNative();

  const { getAll, getAllPayloads, add, count, iterator, removeHead } = eventStore;

  async function sync() {
    const appStorage = getAppStorage();

    if (useAppStorageForEventStore) {
      const events = await getAll();
      await appStorage.setItem(queueName, JSON.stringify(events));
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
