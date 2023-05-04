import { SelfDescribingJson } from '@snowplow/tracker-core';
import { buildMediaAdBreakEntity, buildMediaAdEntity } from './core';
import { MediaPlayer, MediaAd, MediaAdUpdate, MediaAdBreak, MediaPlayerAdBreakUpdate, MediaEventType } from './types';

/** Keeps track of the ad and ad break entities and updates them according to tracked events. */
export class MediaAdTracking {
  ad?: MediaAd;
  adBreak?: MediaAdBreak;
  podPosition = 0;

  updateForThisEvent(
    eventType: MediaEventType,
    player: MediaPlayer,
    ad?: MediaAdUpdate,
    adBreak?: MediaPlayerAdBreakUpdate
  ) {
    if (eventType == MediaEventType.AdStart) {
      this.ad = undefined;
      this.podPosition++;
    } else if (eventType == MediaEventType.AdBreakStart) {
      this.adBreak = undefined;
      this.podPosition = 0;
    }

    if (ad !== undefined) {
      let position = { podPosition: this.podPosition > 0 ? this.podPosition : undefined };
      if (this.ad !== undefined) {
        this.ad = { ...this.ad, ...position, ...ad };
      } else {
        this.ad = { ...position, ...ad };
      }
    }

    if (adBreak !== undefined) {
      let startTime = { startTime: player.currentTime };
      if (this.adBreak !== undefined) {
        this.adBreak = { ...startTime, ...this.adBreak, ...adBreak };
      } else {
        this.adBreak = { ...startTime, ...adBreak };
      }
    }
  }

  updateForNextEvent(eventType: MediaEventType) {
    if (eventType == MediaEventType.AdBreakEnd) {
      this.adBreak = undefined;
      this.podPosition = 0;
    }

    if (eventType == MediaEventType.AdComplete || eventType == MediaEventType.AdSkip) {
      this.ad = undefined;
    }
  }

  getContext(): SelfDescribingJson[] {
    let context = [];
    if (this.ad !== undefined) {
      context.push(buildMediaAdEntity(this.ad));
    }
    if (this.adBreak !== undefined) {
      context.push(buildMediaAdBreakEntity(this.adBreak));
    }
    return context;
  }
}
