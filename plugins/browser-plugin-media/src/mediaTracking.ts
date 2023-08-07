import { LOG, SelfDescribingJson } from '@snowplow/tracker-core';
import { MediaAdTracking } from './adTracking';
import { buildMediaPlayerEntity, buildMediaPlayerEvent } from './core';
import { MediaPingInterval } from './pingInterval';
import { MediaSessionTracking } from './sessionTracking';
import {
  MediaPlayer,
  MediaAdUpdate,
  MediaPlayerAdBreakUpdate,
  MediaPlayerUpdate,
  MediaEventType,
  MediaEvent,
  EventWithContext,
  FilterOutRepeatedEvents,
} from './types';
import { RepeatedEventFilter } from './repeatedEventFilter';

/**
 * Manages the state and built-in entities for a media tracking that starts when a user
 * call `startMediaTracking` and ends with `endMediaTracking`.
 *
 * It updates the internal state for each tracked event and returns context entities with
 * properties updated based on the internal state.
 */
export class MediaTracking {
  /// ID of the media tracking that is used to refer to it by the user.
  id: string;
  /// Percentage boundaries when to track percent progress events.
  private boundaries?: number[];
  /// List of boundaries for which percent progress events were already sent to avoid sending again.
  private sentBoundaries: number[] = [];
  /// State for the media player context entity that is updated as new events are tracked.
  player: MediaPlayer = {
    currentTime: 0,
    paused: true,
    ended: false,
  };

  /// Used to add media player session entity.
  private session?: MediaSessionTracking;
  /// Tracks ping events independently but stored here to stop when media tracking stops.
  private pingInterval?: MediaPingInterval;
  /// Manages ad entities.
  private adTracking = new MediaAdTracking();
  /// Context entities to attach to all events
  private customContext?: Array<SelfDescribingJson>;
  /// Optional list of event types to allow tracking and discard others.
  private captureEvents?: MediaEventType[];
  // Whether to update page activity when playing media. Enabled by default.
  private updatePageActivityWhilePlaying?: boolean;
  /// Filters out repeated events based on the configuration.
  private repeatedEventFilter: RepeatedEventFilter;

  constructor(
    id: string,
    player?: MediaPlayerUpdate,
    session?: MediaSessionTracking,
    pingInterval?: MediaPingInterval,
    boundaries?: number[],
    captureEvents?: MediaEventType[],
    updatePageActivityWhilePlaying?: boolean,
    filterRepeatedEvents?: FilterOutRepeatedEvents,
    context?: Array<SelfDescribingJson>
  ) {
    this.id = id;
    this.updatePlayer(player);
    this.session = session;
    this.pingInterval = pingInterval;
    this.boundaries = boundaries;
    this.captureEvents = captureEvents;
    this.updatePageActivityWhilePlaying = updatePageActivityWhilePlaying;
    this.customContext = context;
    this.repeatedEventFilter = new RepeatedEventFilter(filterRepeatedEvents);

    // validate event names in the captureEvents list
    captureEvents?.forEach((eventType) => {
      if (!Object.values(MediaEventType).includes(eventType)) {
        LOG.warn('Unknown media event ' + eventType);
      }
    });
  }

  /**
   * Called when user calls `endMediaTracking()`.
   */
  flushAndStop() {
    this.pingInterval?.clear();
    this.repeatedEventFilter.flush();
  }

  /**
   * Updates the internal state given the new event or new media player info and returns events to track.
   * @param eventType Type of the event tracked or undefined when only updating player properties.
   * @param player Updates to the media player stored entity.
   * @param ad Updates to the ad entity.
   * @param adBreak Updates to the ad break entity.
   * @returns List of events with entities to track.
   */
  update(
    trackEvent: (event: EventWithContext) => void,
    mediaEvent?: MediaEvent,
    customEvent?: SelfDescribingJson,
    player?: MediaPlayerUpdate,
    ad?: MediaAdUpdate,
    adBreak?: MediaPlayerAdBreakUpdate
  ) {
    // update state
    this.updatePlayer(player);
    if (mediaEvent !== undefined) {
      this.adTracking.updateForThisEvent(mediaEvent.type, this.player, ad, adBreak);
    }
    this.session?.update(mediaEvent?.type, this.player, this.adTracking.adBreak);
    this.pingInterval?.update(this.player);

    // build context entities
    let context = [buildMediaPlayerEntity(this.player)];
    if (this.session !== undefined) {
      context.push(this.session.getContext());
    }
    if (this.customContext) {
      context = context.concat(this.customContext);
    }
    context = context.concat(this.adTracking.getContext());

    // build event types to track
    const mediaEventsToTrack: MediaEvent[] = [];
    if (mediaEvent !== undefined && this.shouldTrackEvent(mediaEvent.type)) {
      mediaEventsToTrack.push(mediaEvent);
    }
    if (this.shouldSendPercentProgress()) {
      mediaEventsToTrack.push({
        type: MediaEventType.PercentProgress,
        eventBody: { percentProgress: this.getPercentProgress() },
      });
    }

    // update state for events after this one
    if (mediaEvent !== undefined) {
      this.adTracking.updateForNextEvent(mediaEvent.type);
    }

    const eventsToTrack = mediaEventsToTrack.map((event) => {
      return { event: buildMediaPlayerEvent(event), context: context };
    });
    if (customEvent !== undefined) {
      eventsToTrack.push({ event: customEvent, context: context });
    }

    this.repeatedEventFilter.trackFilteredEvents(eventsToTrack, trackEvent);
  }

  shouldUpdatePageActivity(): boolean {
    return (this.updatePageActivityWhilePlaying ?? true) && !this.player.paused;
  }

  private updatePlayer(player?: MediaPlayerUpdate) {
    if (player !== undefined) {
      this.player = {
        ...this.player,
        ...player,
      };
    }
  }

  private shouldSendPercentProgress(): boolean {
    const percentProgress = this.getPercentProgress();
    if (this.boundaries === undefined || percentProgress === undefined || this.player.paused) {
      return false;
    }

    let boundaries = this.boundaries.filter((b) => b <= (percentProgress ?? 0));
    if (boundaries.length == 0) {
      return false;
    }
    let boundary = Math.max(...boundaries);
    if (!this.sentBoundaries.includes(boundary)) {
      this.sentBoundaries.push(boundary);
      return true;
    }
    return false;
  }

  private shouldTrackEvent(eventType: MediaEventType): boolean {
    return this.captureEvents === undefined || this.captureEvents.includes(eventType);
  }

  private getPercentProgress(): number | undefined {
    if (this.player.duration === null || this.player.duration === undefined || this.player.duration == 0) {
      return undefined;
    }
    return Math.floor(((this.player.currentTime ?? 0) / this.player.duration) * 100);
  }
}
