import { Payload } from './payload';

export interface EventStoreIterator {
  /**
   * Retrieve the next event in the store
   */
  next: () => Promise<{ value: Payload | undefined; done: boolean }>;
}

/**
 * EventStore allows storing and retrieving events before they are sent to the collector
 */
export interface EventStore {
  /**
   * Count all events in the store
   */
  count: () => Promise<number>;
  /**
   * Add an event to the store
   */
  add: (payload: Payload) => Promise<void>;
  /**
   * Remove the first `count` events from the store
   */
  removeHead: (count: number) => Promise<void>;
  /**
   * Get an iterator over all events in the store
   */
  iterator: () => EventStoreIterator;
  /**
   * Retrieve all events in the store
   */
  getAll: () => Promise<Payload[]>;
}

export interface EventStoreConfiguration {
  /**
   * The maximum amount of events that will be buffered in the event store
   *
   * This is useful to ensure the Tracker doesn't fill the 5MB or 10MB available to
   * each website should the collector be unavailable due to lost connectivity.
   * Will drop old events once the limit is hit
   */
  maxSize?: number;
}

export interface InMemoryEventStoreConfiguration {
  /**
   * Initial events to add to the store
   */
  events?: Payload[];
}

export function newInMemoryEventStore({
  maxSize = 1000,
  events = [],
}: EventStoreConfiguration & InMemoryEventStoreConfiguration): EventStore {
  let store: Payload[] = [...events];

  return {
    count: () => Promise.resolve(store.length),
    add: (payload: Payload) => {
      store.push(payload);
      while (store.length > maxSize) {
        store.shift();
      }
      return Promise.resolve();
    },
    removeHead: (count: number) => {
      for (let i = 0; i < count; i++) {
        store.shift();
      }
      return Promise.resolve();
    },
    iterator: () => {
      let index = 0;
      return {
        next: () => {
          if (index < store.length) {
            return Promise.resolve({ value: store[index++], done: false });
          }
          return Promise.resolve({ value: undefined, done: true });
        },
      };
    },
    getAll: () => Promise.resolve(store),
  };
}
