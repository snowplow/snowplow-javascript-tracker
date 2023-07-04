import { getMediaEventSchema } from './schemata';
import { FilterOutRepeatedEvents, MediaEventType, EventWithContext } from './types';

/**
 * This class filters out repeated events that are sent by the media player.
 * This applies to seek and volume change events.
 */
export class RepeatedEventFilter {
  private aggregateEventsWithOrder: { [schema: string]: boolean } = {};
  private eventsToAggregate: { [schema: string]: (() => void)[] } = {};
  private flushTimeout?: number;
  private flushTimeoutMs: number;

  constructor(configuration?: FilterOutRepeatedEvents) {
    let allFiltersEnabled = configuration === undefined || configuration === true;
    if (allFiltersEnabled || (typeof configuration === 'object' && configuration.seekEvents !== false)) {
      this.aggregateEventsWithOrder[getMediaEventSchema(MediaEventType.SeekStart)] = true;
      this.aggregateEventsWithOrder[getMediaEventSchema(MediaEventType.SeekEnd)] = false;
    }
    if (allFiltersEnabled || (typeof configuration === 'object' && configuration.volumeChangeEvents !== false)) {
      this.aggregateEventsWithOrder[getMediaEventSchema(MediaEventType.VolumeChange)] = false;
    }

    this.flushTimeoutMs = (typeof configuration === 'object' ? configuration.flushTimeoutMs : undefined) ?? 5000;

    Object.keys(this.aggregateEventsWithOrder).forEach((schema) => {
      this.eventsToAggregate[schema] = [];
    });
  }

  trackFilteredEvents(events: EventWithContext[], trackEvent: (event: EventWithContext) => void) {
    let startFlushTimeout = false;

    events.forEach(({ event, context }) => {
      if (this.eventsToAggregate[event.schema] !== undefined) {
        startFlushTimeout = true;
        this.eventsToAggregate[event.schema].push(() => trackEvent({ event, context }));
      } else {
        startFlushTimeout = false;
        // flush any events waiting
        this.flush();

        trackEvent({ event, context });
      }
    });

    if (startFlushTimeout && this.flushTimeout === undefined) {
      this.setFlushTimeout();
    }
  }

  flush() {
    this.clearFlushTimeout();

    Object.keys(this.eventsToAggregate).forEach((schema) => {
      let eventsToAggregate = this.eventsToAggregate[schema];
      if (eventsToAggregate.length > 0) {
        if (this.aggregateEventsWithOrder[schema]) {
          eventsToAggregate[0]();
        } else {
          eventsToAggregate[eventsToAggregate.length - 1]();
        }
        this.eventsToAggregate[schema] = [];
      }
    });
  }

  private clearFlushTimeout() {
    if (this.flushTimeout !== undefined) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = undefined;
    }
  }

  private setFlushTimeout() {
    this.clearFlushTimeout();
    this.flushTimeout = window.setTimeout(() => this.flush(), this.flushTimeoutMs);
  }
}
