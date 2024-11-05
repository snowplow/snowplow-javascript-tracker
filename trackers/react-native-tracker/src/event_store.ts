import { EventStore, newInMemoryEventStore, EventStorePayload } from '@snowplow/tracker-core';
import { EventStoreConfiguration, TrackerConfiguration } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function newReactNativeEventStore({
  namespace,
  maxEventStoreSize = 1000,
  useAsyncStorageForEventStore: useAsyncStorage = true,
}: EventStoreConfiguration & TrackerConfiguration): Promise<EventStore> {
  const queueName = `snowplow_${namespace}`;

  async function newInMemoryEventStoreForReactNative() {
    if (useAsyncStorage) {
      const data = await AsyncStorage.getItem(queueName);
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
      await AsyncStorage.setItem(queueName, JSON.stringify(events));
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
