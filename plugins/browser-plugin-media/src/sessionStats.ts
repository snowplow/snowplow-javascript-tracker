import {
  MediaAdBreakType,
  MediaPlayer,
  MediaAdBreak,
  MediaEventType,
  MediaSessionStats,
} from './types';

/** Internal type for representing the session updates */
type Log = {
  eventType: MediaEventType | undefined;
  time: number;
  contentTime: number;
  playbackRate?: number;
  paused: boolean;
  muted?: boolean;
  linearAd: boolean;
};

const adStartTypes = [MediaEventType.AdStart, MediaEventType.AdResume];
const adProgressTypes = [
  MediaEventType.AdClick,
  MediaEventType.AdFirstQuartile,
  MediaEventType.AdMidpoint,
  MediaEventType.AdThirdQuartile,
];
const adEndTypes = [MediaEventType.AdComplete, MediaEventType.AdSkip, MediaEventType.AdPause];
const bufferingEndTypes = [MediaEventType.BufferEnd, MediaEventType.Play];

/** Calculates the average playback rate based on measurements of the rate over partial durations */
class AveragePlaybackRateCalculator {
  private durationWithPlaybackRate = 0;
  private duration = 0;

  add(rate: number, duration: number) {
    this.durationWithPlaybackRate += rate * duration;
    this.duration += duration;
  }

  get(): number | undefined {
    return this.duration > 0 ? this.durationWithPlaybackRate / this.duration : undefined;
  }
}

/**
 * Calculates statistics in the media player session as events are tracked.
 */
export class MediaSessionTrackingStats {
  /// time for which ads were playing
  private adPlaybackDuration = 0;
  /// time for which the content was playing
  private playbackDuration = 0;
  /// time for which the content was playing on mute
  private playbackDurationMuted = 0;
  /// average playback rate calculator
  private avgPlaybackRate = new AveragePlaybackRateCalculator();
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
  update(eventType: MediaEventType | undefined, mediaPlayer: MediaPlayer, adBreak?: MediaAdBreak) {
    let log: Log = {
      time: new Date().getTime() / 1000,
      contentTime: mediaPlayer.currentTime,
      eventType: eventType,
      playbackRate: mediaPlayer.playbackRate,
      paused: mediaPlayer.paused,
      muted: mediaPlayer.muted,
      linearAd: (adBreak?.breakType ?? MediaAdBreakType.Linear) == MediaAdBreakType.Linear,
    };

    this.updateDurationStats(log);
    this.updateAdStats(log);
    this.updateBufferingStats(log);

    this.lastLog = log;
  }

  /// Produce part of the media session entity with the stats.
  toSessionContextEntity(): MediaSessionStats {
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
      avgPlaybackRate: this.round(this.avgPlaybackRate.get()),
      contentWatched: this.playedSeconds.size > 0 ? this.playedSeconds.size : undefined,
    };
  }

  private updateDurationStats(log: Log) {
    // if ad was playing until now and it was a linear ad, don't add the duration stats
    let wasPlayingAd = this.lastAdUpdateAt !== undefined;
    const shouldCountStats = (!wasPlayingAd || !log.linearAd) ?? true;
    if (!shouldCountStats) {
      return;
    }

    if (this.lastLog !== undefined) {
      // add the time diff since last event to duration stats
      let duration = log.time - this.lastLog.time;
      if (this.lastLog.paused) {
        this.pausedDuration += duration;
      } else {
        this.playbackDuration += duration;
        if (this.lastLog.playbackRate !== undefined) {
          this.avgPlaybackRate.add(this.lastLog.playbackRate, duration);
        }

        if (this.lastLog.muted) {
          this.playbackDurationMuted += duration;
        }

        if (!log.paused) {
          for (let i = Math.floor(this.lastLog.contentTime); i < log.contentTime; i++) {
            this.playedSeconds.add(i);
          }
        }
      }
    }
    if (!log.paused) {
      this.playedSeconds.add(Math.floor(log.contentTime));
    }
  }

  private updateAdStats(log: Log) {
    // only works with ad event types
    if (log.eventType === undefined) {
      return;
    }

    // count ad actions
    if (log.eventType == MediaEventType.AdBreakStart) {
      this.adBreaks++;
    } else if (log.eventType == MediaEventType.AdStart) {
      this.ads++;
    } else if (log.eventType == MediaEventType.AdSkip) {
      this.adsSkipped++;
    } else if (log.eventType == MediaEventType.AdClick) {
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
    if (log.eventType == MediaEventType.BufferStart) {
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

  private round(n: number | undefined): number | undefined {
    if (n === undefined) { return undefined; }
    return Math.round(n * 1000) / 1000;
  }
}
