import { SelfDescribingJson } from '@snowplow/tracker-core';
import { buildMediaPlayerAdBreakEntity, buildMediaPlayerAdEntity } from './core';
import {
  MediaPlayer,
  MediaPlayerAd,
  MediaPlayerAdAttributes,
  MediaPlayerAdBreak,
  MediaPlayerAdBreakAttributes,
  MediaPlayerEventType,
} from './types';

const adDefaults = {
  percentProgress: 0,
};

/** Keeps track of the ad and ad break entities and updates them according to tracked events. */
export class MediaPlayerAdTracking {
  ad?: MediaPlayerAd;
  adBreak?: MediaPlayerAdBreak;
  podPosition = 0;

  updateForThisEvent(
    eventType: MediaPlayerEventType,
    mediaPlayer: MediaPlayer,
    ad?: MediaPlayerAdAttributes,
    adBreak?: MediaPlayerAdBreakAttributes
  ) {
    if (eventType == MediaPlayerEventType.AdStart) {
      this.ad = undefined;
      this.podPosition++;
    } else if (eventType == MediaPlayerEventType.AdBreakStart) {
      this.adBreak = undefined;
      this.podPosition = 0;
    }

    if (ad !== undefined) {
      let position = { podPosition: this.podPosition > 0 ? this.podPosition : undefined };
      if (this.ad !== undefined) {
        this.ad = { ...this.ad, ...position, ...ad };
      } else {
        this.ad = { ...adDefaults, ...position, ...ad };
      }
    }

    if (adBreak !== undefined) {
      let startTime = { startTime: mediaPlayer.currentTime };
      if (this.adBreak !== undefined) {
        this.adBreak = { ...startTime, ...this.adBreak, ...adBreak };
      } else {
        this.adBreak = { ...startTime, ...adBreak };
      }
    }

    if (this.ad !== undefined) {
      if (eventType == MediaPlayerEventType.AdFirstQuartile) {
        this.ad.percentProgress = 25;
      } else if (eventType == MediaPlayerEventType.AdMidpoint) {
        this.ad.percentProgress = 50;
      } else if (eventType == MediaPlayerEventType.AdThirdQuartile) {
        this.ad.percentProgress = 75;
      } else if (eventType == MediaPlayerEventType.AdComplete) {
        this.ad.percentProgress = 100;
      }
    }
  }

  updateForNextEvent(eventType: MediaPlayerEventType) {
    if (eventType == MediaPlayerEventType.AdBreakEnd) {
      this.adBreak = undefined;
      this.podPosition = 0;
    }

    if (eventType == MediaPlayerEventType.AdComplete || eventType == MediaPlayerEventType.AdSkip) {
      this.ad = undefined;
    }
  }

  getContext(): SelfDescribingJson[] {
    let context = [];
    if (this.ad !== undefined) {
      context.push(buildMediaPlayerAdEntity(this.ad));
    }
    if (this.adBreak !== undefined) {
      context.push(buildMediaPlayerAdBreakEntity(this.adBreak));
    }
    return context;
  }
}
