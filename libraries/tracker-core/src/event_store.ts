import { EventStorePayload } from './event_store_payload';
import { Payload } from './payload';

/**
 * Result of the next operation on an EventStoreIterator.
 */
export interface EventStoreIteratorNextResult {
  /**
   * The next event in the store, or undefined if there are no more events.
   */
  value: EventStorePayload | undefined;
  /**
   * True if there are no more events in the store.
   */
  done: boolean;
}

/**
 * EventStoreIterator allows iterating over all events in the store.
 */
export interface EventStoreIterator {
  /**
   * Retrieve the next event in the store
   */
  next: () => Promise<EventStoreIteratorNextResult>;
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
   * @returns the number of events in the store after adding
   */
  add: (payload: EventStorePayload) => Promise<number>;
  /**
   * Remove the first `count` events from the store
   */
  removeHead: (count: number) => Promise<void>;
  /**
   * Get an iterator over all events in the store
   */
  iterator: () => EventStoreIterator;
  /**
   * Retrieve all payloads including their meta configuration in the store
   */
  getAll: () => Promise<readonly EventStorePayload[]>;
  /**
   * Retrieve all pure payloads in the store
   */
  getAllPayloads: () => Promise<readonly Payload[]>;
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
  events?: EventStorePayload[];
}

export function newInMemoryEventStore({
  maxSize = 1000,
  events = [],
}: EventStoreConfiguration & InMemoryEventStoreConfiguration): EventStore {
  let store: EventStorePayload[] = [...events];

  const count = () => Promise.resolve(store.length);

  return {
    count,
    add: (payload: EventStorePayload) => {
      store.push(payload);
      while (store.length > maxSize) {
        store.shift();
      }
      return count();
    },
    removeHead: (count: number) => {
      for (let i = 0; i < count; i++) {
        store.shift();
      }
      return Promise.resolve();
    },
    iterator: () => {
      let index = 0;
      // copy the store to prevent mutation
      let events = [...store];
      return {
        next: () => {
          if (index < events.length) {
            return Promise.resolve({ value: events[index++], done: false });
          }
          return Promise.resolve({ value: undefined, done: true });
        },
      };
    },
    getAll: () => Promise.resolve([...store]),
    getAllPayloads: () => Promise.resolve(store.map((e) => e.payload)),
  };
}
