import { MediaPlayer } from './types';

/** Manages the timer for firing the media ping events. */
export class MediaPingInterval {
  private interval?: ReturnType<typeof setInterval>;
  private paused?: boolean;
  private numPausedPings = 0;
  private maxPausedPings = 1;

  constructor(pingIntervalSeconds: number | undefined, maxPausedPings: number | undefined, trackPing: () => void) {
    if (maxPausedPings !== undefined) {
      this.maxPausedPings = maxPausedPings;
    }

    this.interval = setInterval(() => {
      if (!this.isPaused() || this.numPausedPings < this.maxPausedPings) {
        if (this.isPaused()) {
          this.numPausedPings++;
        }
        trackPing();
      }
    }, (pingIntervalSeconds ?? 30) * 1000);
  }

  update(player: MediaPlayer) {
    this.paused = player.paused;
    if (!this.paused) {
      this.numPausedPings = 0;
    }
  }

  clear() {
    if (this.interval !== undefined) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  private isPaused() {
    return this.paused === true;
  }
}
