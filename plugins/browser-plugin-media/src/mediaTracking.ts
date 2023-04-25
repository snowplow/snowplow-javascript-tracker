import { SelfDescribingJson } from '@snowplow/tracker-core';
import { MediaAdTracking } from './adTracking';
import { buildMediaPlayerEntity, buildMediaPlayerEvent } from './core';
import { MediaPingInterval } from './pingInterval';
import { MediaSessionTracking } from './sessionTracking';
import {
  MediaPlayer,
  MediaPlayerAdUpdate,
  MediaPlayerAdBreakUpdate,
  MediaPlayerUpdate,
  MediaPlayerEventType,
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
  /// Label sent in the media player event body.
  private label?: string;
  /// Percentage boundaries when to track percent progress events.
  private boundaries?: number[];
  /// List of boundaries for which percent progress events were already sent to avoid sending again.
  private sentBoundaries: number[] = [];
  /// State for the media player context entity that is updated as new events are tracked.
  private mediaPlayer: MediaPlayer = {
    currentTime: 0,
    paused: true,
    isLive: false,
    muted: true,
    ended: false,
    loop: false,
    playbackRate: 1,
    volume: 100,
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
  private captureEvents?: MediaPlayerEventType[]

  constructor(
    id: string,
    label?: string,
    mediaPlayer?: MediaPlayerUpdate,
    session?: MediaSessionTracking,
    pingInterval?: MediaPingInterval,
    boundaries?: number[],
    captureEvents?: MediaPlayerEventType[],
    context?: Array<SelfDescribingJson>
  ) {
    this.id = id;
    this.label = label;
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
    eventType?: MediaPlayerEventType,
    mediaPlayer?: MediaPlayerUpdate,
    ad?: MediaPlayerAdUpdate,
    adBreak?: MediaPlayerAdBreakUpdate
  ): { event: SelfDescribingJson; context: SelfDescribingJson[] }[] {
    // update state
    this.updateMediaPlayer(eventType, mediaPlayer);
    if (eventType !== undefined) {
      this.adTracking.updateForThisEvent(eventType, this.mediaPlayer, ad, adBreak);
    }
    this.session?.update(eventType, this.mediaPlayer, this.adTracking.adBreak);
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
    let eventTypesToTrack: MediaPlayerEventType[] = [];
    if (eventType !== undefined && this.shouldTrackEvent(eventType)) {
      eventTypesToTrack.push(eventType);
    }
    if (this.shouldSendPercentProgress()) {
      eventTypesToTrack.push(MediaPlayerEventType.PercentProgress);
    }

    // update state for events after this one
    if (eventType !== undefined) {
      this.adTracking.updateForNextEvent(eventType);
    }

    return eventTypesToTrack.map((eventType) => {
      return {
        event: buildMediaPlayerEvent(eventType, this.label),
        context: context,
      };
    });
  }

  private updateMediaPlayer(
    eventType: MediaPlayerEventType | undefined,
    mediaPlayer: MediaPlayerUpdate | undefined
  ) {
    if (mediaPlayer !== undefined) {
      this.mediaPlayer = {
        ...this.mediaPlayer,
        ...mediaPlayer,
      };
    }
    if (eventType == MediaPlayerEventType.Play) {
      this.mediaPlayer.paused = false;
    }
    if (eventType == MediaPlayerEventType.Pause) {
      this.mediaPlayer.paused = true;
    }
    if (eventType == MediaPlayerEventType.End) {
      this.mediaPlayer.paused = true;
      this.mediaPlayer.ended = true;
    }
    if (this.mediaPlayer.duration && this.mediaPlayer.duration > 0) {
      this.mediaPlayer.percentProgress = Math.floor((this.mediaPlayer.currentTime / this.mediaPlayer.duration) * 100);
    }
  }

  private shouldSendPercentProgress(): boolean {
    if (
      this.boundaries === undefined ||
      this.mediaPlayer.percentProgress === undefined ||
      this.mediaPlayer.percentProgress === null ||
      this.mediaPlayer.paused
    ) {
      return false;
    }

    let boundaries = this.boundaries.filter((b) => b <= (this.mediaPlayer.percentProgress ?? 0));
    if (boundaries.length == 0) {
      return false;
    }
    let boundary = Math.max.apply(null, boundaries);
    if (!this.sentBoundaries.includes(boundary)) {
      this.sentBoundaries.push(boundary);
      return true;
    }
    return false;
  }

  private shouldTrackEvent(eventType: MediaPlayerEventType) {
    if (eventType == MediaPlayerEventType.SeekStart) {
      if (this.isSeeking) {
        return false;
      }

      this.isSeeking = true;
    } else if (eventType == MediaPlayerEventType.SeekEnd) {
      this.isSeeking = false;
    }

    if (this.captureEvents !== undefined && !this.captureEvents.includes(eventType)) {
      return false;
    }

    return true;
  }
}
