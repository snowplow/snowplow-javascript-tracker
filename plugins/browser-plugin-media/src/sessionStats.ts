import {
  MediaPlayerAdBreakType,
  MediaPlayer,
  MediaPlayerAdBreak,
  MediaPlayerEventType,
  MediaPlayerSessionStats,
} from './types';

/** Internal type for representing the session updates */
type Log = {
  eventType: MediaPlayerEventType | undefined;
  time: number;
  contentTime: number;
  playbackRate: number;
  paused: boolean;
  muted: boolean;
  linearAd: boolean;
};

const adStartTypes = [MediaPlayerEventType.AdStart, MediaPlayerEventType.AdResume];
const adProgressTypes = [
  MediaPlayerEventType.AdClick,
  MediaPlayerEventType.AdFirstQuartile,
  MediaPlayerEventType.AdMidpoint,
  MediaPlayerEventType.AdThirdQuartile,
];
const adEndTypes = [MediaPlayerEventType.AdComplete, MediaPlayerEventType.AdSkip, MediaPlayerEventType.AdPause];
const bufferingEndTypes = [MediaPlayerEventType.BufferEnd, MediaPlayerEventType.Play];

/**
 * Calculates statistics in the media player session as events are tracked.
 */
export class MediaPlayerSessionStatsUpdater {
  /// time for which ads were playing
  private adPlaybackDuration = 0;
  /// time for which the content was playing
  private playbackDuration = 0;
  /// time for which the content was playing on mute
  private playbackDurationMuted = 0;
  /// playback duration multiplied by the playback rate to enable calculating the avg playback rate
  private playbackDurationWithPlaybackRate = 0;
  /// time for which the playback was paused
  private pausedDuration = 0;
  /// number of ads
  private ads = 0;
  /// number of ad breaks
  private adBreaks = 0;
  /// number of ad skip events
  private adsSkipped = 0;
  /// number of ad click events
  private adsClicked = 0;
  /// sum of time durations between the buffer start event and end of buffering
  private bufferingDuration = 0;
  /// set of seconds in content time that were played used to calculate the content watched duration
  private playedSeconds = new Set();

  private lastAdUpdateAt: number | undefined;
  private bufferingStartedAt: number | undefined;
  private bufferingStartTime: number | undefined;
  private lastLog: Log | undefined;

  /// Update stats given a new event.
  update(eventType: MediaPlayerEventType | undefined, mediaPlayer: MediaPlayer, adBreak?: MediaPlayerAdBreak) {
    let log = {
      time: new Date().getTime() / 1000,
      contentTime: mediaPlayer.currentTime,
      eventType: eventType,
      playbackRate: mediaPlayer.playbackRate,
      paused: mediaPlayer.paused,
      muted: mediaPlayer.muted,
      linearAd: (adBreak?.breakType ?? MediaPlayerAdBreakType.Linear) == MediaPlayerAdBreakType.Linear,
    };

    this.updateDurationStats(log);
    this.updateAdStats(log);
    this.updateBufferingStats(log);

    this.lastLog = log;
  }

  /// Produce part of the media session entity with the stats.
  toSessionContextEntity(): MediaPlayerSessionStats {
    const avgPlaybackRate =
      this.playbackDuration > 0 ? this.playbackDurationWithPlaybackRate / this.playbackDuration : 1;
    return {
      timePaused: this.pausedDuration > 0 ? this.round(this.pausedDuration) : undefined,
      timePlayed: this.playbackDuration > 0 ? this.round(this.playbackDuration) : undefined,
      timePlayedMuted: this.playbackDurationMuted > 0 ? this.round(this.playbackDurationMuted) : undefined,
      timeSpentAds: this.adPlaybackDuration > 0 ? this.round(this.adPlaybackDuration) : undefined,
      timeBuffering: this.bufferingDuration > 0 ? this.round(this.bufferingDuration) : undefined,
      ads: this.ads > 0 ? this.ads : undefined,
      adBreaks: this.adBreaks > 0 ? this.adBreaks : undefined,
      adsSkipped: this.adsSkipped > 0 ? this.adsSkipped : undefined,
      adsClicked: this.adsClicked > 0 ? this.adsClicked : undefined,
      avgPlaybackRate: avgPlaybackRate != 1 ? this.round(avgPlaybackRate) : undefined,
      contentWatched: this.playedSeconds.size > 0 ? this.playedSeconds.size : undefined,
    };
  }

  private updateDurationStats(log: Log) {
    // if ad was playing until now and it was a linear ad, don't add the duration stats
    let wasPlayingAd = this.lastAdUpdateAt !== undefined;
    const shouldCountStats = (!wasPlayingAd || !log.linearAd) ?? true;
    if (shouldCountStats && this.lastLog !== undefined) {
      // add the time diff since last event to duration stats
      let duration = log.time - this.lastLog.time;
      if (this.lastLog.paused) {
        this.pausedDuration += duration;
      } else {
        this.playbackDuration += duration;
        this.playbackDurationWithPlaybackRate += duration * log.playbackRate;

        if (this.lastLog.muted) {
          this.playbackDurationMuted += duration;
        }

        for (let i = Math.floor(this.lastLog.contentTime); i < log.contentTime; i++) {
          this.playedSeconds.add(i);
        }
      }
    }
  }

  private updateAdStats(log: Log) {
    // only works with ad event types
    if (log.eventType === undefined) {
      return;
    }

    // count ad actions
    if (log.eventType == MediaPlayerEventType.AdBreakStart) {
      this.adBreaks++;
    } else if (log.eventType == MediaPlayerEventType.AdStart) {
      this.ads++;
    } else if (log.eventType == MediaPlayerEventType.AdSkip) {
      this.adsSkipped++;
    } else if (log.eventType == MediaPlayerEventType.AdClick) {
      this.adsClicked++;
    }

    // update ad playback duration
    if (this.lastAdUpdateAt === undefined) {
      if (adStartTypes.includes(log.eventType)) {
        this.lastAdUpdateAt = log.time;
      }
    } else if (adProgressTypes.includes(log.eventType)) {
      this.adPlaybackDuration += log.time - this.lastAdUpdateAt;
      this.lastAdUpdateAt = log.time;
    } else if (adEndTypes.includes(log.eventType)) {
      this.adPlaybackDuration += log.time - this.lastAdUpdateAt;
      this.lastAdUpdateAt = undefined;
    }
  }

  private updateBufferingStats(log: Log) {
    if (log.eventType == MediaPlayerEventType.BufferStart) {
      this.bufferingStartedAt = log.time;
      this.bufferingStartTime = log.contentTime;
    } else if (this.bufferingStartedAt !== undefined) {
      // Either the playback moved or BufferEnd or Play events were tracked
      if (
        (log.contentTime != this.bufferingStartTime && !log.paused) ||
        (log.eventType !== undefined && bufferingEndTypes.includes(log.eventType))
      ) {
        this.bufferingDuration += log.time - this.bufferingStartedAt;
        this.bufferingStartedAt = undefined;
        this.bufferingStartTime = undefined;
      } else {
        this.bufferingDuration += log.time - this.bufferingStartedAt;
        this.bufferingStartedAt = log.time;
      }
    }
  }

  private round(n: number) {
    return Math.round(n * 1000) / 1000;
  }
}
