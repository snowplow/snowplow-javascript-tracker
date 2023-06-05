import { SelfDescribingJson } from '@snowplow/tracker-core';
import { buildMediaSessionEntity } from './core';
import { MediaSessionTrackingStats } from './sessionStats';
import { MediaAdBreak, MediaPlayer, MediaEventType } from './types';

/**
 * Manages the media player session that is optionally added as a context entity
 * in media tracking.
 */
export class MediaSessionTracking {
  /// Same as the ID of the media tracking.
  private id: string;
  private startedAt: Date;
  private pingInterval?: number;
  private stats = new MediaSessionTrackingStats();

  constructor(id: string, startedAt?: Date, pingInterval?: number) {
    this.id = id;
    this.pingInterval = pingInterval;
    this.startedAt = startedAt ?? new Date();
  }

  update(eventType: MediaEventType | undefined, player: MediaPlayer, adBreak?: MediaAdBreak) {
    this.stats.update(eventType, player, adBreak);
  }

  getContext(): SelfDescribingJson {
    return buildMediaSessionEntity({
      mediaSessionId: this.id,
      startedAt: this.startedAt,
      pingInterval: this.pingInterval,
      ...this.stats.toSessionContextEntity(),
    });
  }
}
