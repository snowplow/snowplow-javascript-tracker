import { getMediaEventSchema } from './schemata';
import { FilterOutRepeatedEvents, MediaEventType, EventWithContext } from './types';

/**
 * This class filters out repeated events that are sent by the media player.
 * This applies to seek and volume change events.
 */
export class RepeatedEventFilter {
  private aggregateEventsWithOrder: { [schema: string]: boolean } = {};
  private eventsToAggregate: { [schema: string]: EventWithContext[] } = {};

  constructor(configuration?: FilterOutRepeatedEvents) {
    let allFiltersEnabled = configuration === undefined || configuration === true;
    if (allFiltersEnabled || (typeof configuration === 'object' && configuration.seekEvents !== false)) {
      this.aggregateEventsWithOrder[getMediaEventSchema(MediaEventType.SeekStart)] = true;
      this.aggregateEventsWithOrder[getMediaEventSchema(MediaEventType.SeekEnd)] = false;
    }
    if (allFiltersEnabled || (typeof configuration === 'object' && configuration.volumeChangeEvents !== false)) {
      this.aggregateEventsWithOrder[getMediaEventSchema(MediaEventType.VolumeChange)] = false;
    }

    Object.keys(this.aggregateEventsWithOrder).forEach((schema) => {
      this.eventsToAggregate[schema] = [];
    });
  }

  filterEventsToTrack(events: EventWithContext[]): EventWithContext[] {
    let eventsToTrack: EventWithContext[] = [];

    events.forEach(({ event, context }) => {
      if (this.eventsToAggregate[event.schema] !== undefined) {
        this.eventsToAggregate[event.schema].push({ event, context });
      } else {
        // flush any events waiting
        let flushed = this.flush();
        if (flushed.length > 0) {
          eventsToTrack = eventsToTrack.concat(flushed);
        }

        eventsToTrack.push({ event, context });
      }
    });

    return eventsToTrack;
  }

  flush(): EventWithContext[] {
    let flushed: EventWithContext[] = [];
    Object.keys(this.eventsToAggregate).forEach((schema) => {
      let eventsToAggregate = this.eventsToAggregate[schema];
      if (eventsToAggregate.length > 0) {
        if (this.aggregateEventsWithOrder[schema]) {
          flushed.push(eventsToAggregate[0]);
        } else {
          flushed.push(eventsToAggregate[eventsToAggregate.length - 1]);
        }
        this.eventsToAggregate[schema] = [];
      }
    });
    return flushed;
  }
}
