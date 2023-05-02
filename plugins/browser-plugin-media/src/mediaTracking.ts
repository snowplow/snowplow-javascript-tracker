import { SelfDescribingJson } from '@snowplow/tracker-core';
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
} from './types';

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
  mediaPlayer: MediaPlayer = {
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
  /// Used to prevent tracking seek start events multiple times.
  private isSeeking = false;
  /// Context entities to attach to all events
  private customContext?: Array<SelfDescribingJson>;
  /// Optional list of event types to allow tracking and discard others.
  private captureEvents?: MediaEventType[];

  constructor(
    id: string,
    mediaPlayer?: MediaPlayerUpdate,
    session?: MediaSessionTracking,
    pingInterval?: MediaPingInterval,
    boundaries?: number[],
    captureEvents?: MediaEventType[],
    context?: Array<SelfDescribingJson>
  ) {
    this.id = id;
    this.updateMediaPlayer(undefined, mediaPlayer);
    this.session = session;
    this.pingInterval = pingInterval;
    this.boundaries = boundaries;
    this.captureEvents = captureEvents;
    this.customContext = context;
  }

  /**
   * Called when user calls `endMediaTracking()`.
   */
  stop() {
    this.pingInterval?.clear();
  }

  /**
   * Updates the internal state given the new event or new media player info and returns events to track.
   * @param eventType Type of the event tracked or undefined when only updating player properties.
   * @param mediaPlayer Updates to the media player stored entity.
   * @param ad Updates to the ad entity.
   * @param adBreak Updates to the ad break entity.
   * @returns List of events with entities to track.
   */
  update(
    event?: MediaEvent,
    mediaPlayer?: MediaPlayerUpdate,
    ad?: MediaAdUpdate,
    adBreak?: MediaPlayerAdBreakUpdate
  ): { event: SelfDescribingJson; context: SelfDescribingJson[] }[] {
    // update state
    this.updateMediaPlayer(event?.type, mediaPlayer);
    if (event !== undefined) {
      this.adTracking.updateForThisEvent(event.type, this.mediaPlayer, ad, adBreak);
    }
    this.session?.update(event?.type, this.mediaPlayer, this.adTracking.adBreak);
    this.pingInterval?.update(this.mediaPlayer);

    // build context entities
    let context = [buildMediaPlayerEntity(this.mediaPlayer)];
    if (this.session !== undefined) {
      context.push(this.session.getContext());
    }
    if (this.customContext !== undefined) {
      context = context.concat(this.customContext);
    }
    context = context.concat(this.adTracking.getContext());

    // build event types to track
    const eventsToTrack: MediaEvent[] = [];
    if (event !== undefined && this.shouldTrackEvent(event.type)) {
      eventsToTrack.push(event);
    }
    if (this.shouldSendPercentProgress()) {
      eventsToTrack.push({
        type: MediaEventType.PercentProgress,
        eventBody: {
          percentProgress: this.getPercentProgress(),
        },
      });
    }

    // update state for events after this one
    if (event !== undefined) {
      this.adTracking.updateForNextEvent(event.type);
    }

    return eventsToTrack.map((event) => {
      return {
        event: buildMediaPlayerEvent(event),
        context: context,
      };
    });
  }

  private updateMediaPlayer(eventType: MediaEventType | undefined, mediaPlayer: MediaPlayerUpdate | undefined) {
    if (mediaPlayer !== undefined) {
      this.mediaPlayer = {
        ...this.mediaPlayer,
        ...mediaPlayer,
      };
    }
    if (eventType == MediaEventType.Play) {
      this.mediaPlayer.paused = false;
    }
    if (eventType == MediaEventType.Pause) {
      this.mediaPlayer.paused = true;
    }
    if (eventType == MediaEventType.End) {
      this.mediaPlayer.paused = true;
      this.mediaPlayer.ended = true;
    }
  }

  private shouldSendPercentProgress(): boolean {
    const percentProgress = this.getPercentProgress();
    if (this.boundaries === undefined || percentProgress === undefined || this.mediaPlayer.paused) {
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
    return this.updateSeekingAndCheckIfShouldTrack(eventType) && this.allowedToCaptureEventType(eventType);
  }

  /** Prevents multiple seek start events to be tracked after each other without a seek end (happens when scrubbing). */
  private updateSeekingAndCheckIfShouldTrack(eventType: MediaEventType): boolean {
    if (eventType == MediaEventType.SeekStart) {
      if (this.isSeeking) {
        return false;
      }

      this.isSeeking = true;
    } else if (eventType == MediaEventType.SeekEnd) {
      this.isSeeking = false;
    }

    return true;
  }

  private allowedToCaptureEventType(eventType: MediaEventType): boolean {
    return this.captureEvents === undefined || this.captureEvents.includes(eventType);
  }

  private getPercentProgress(): number | undefined {
    if (
      this.mediaPlayer.duration === null ||
      this.mediaPlayer.duration === undefined ||
      this.mediaPlayer.duration == 0
    ) {
      return undefined;
    }
    return Math.floor(((this.mediaPlayer.currentTime ?? 0) / this.mediaPlayer.duration) * 100);
  }
}
