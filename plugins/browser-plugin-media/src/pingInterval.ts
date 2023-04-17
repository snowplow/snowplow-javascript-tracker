/** Manages the timer for firing the media ping events. */
export class PingInterval {
  private interval?: ReturnType<typeof setInterval>;

  constructor(pingIntervalSeconds: number | undefined, trackPing: () => void) {
    this.interval = setInterval(trackPing, (pingIntervalSeconds ?? 30) * 1000);
  }

  clear() {
    if (this.interval !== undefined) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }
}
