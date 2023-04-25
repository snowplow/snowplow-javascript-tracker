import { MediaPingInterval } from '../src/pingInterval';

describe('PingInterval', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.clearAllTimers();
  });

  it('should fire every 30 seconds', () => {
    let pings = 0;
    new MediaPingInterval(undefined, undefined, () => pings++);

    for (let i = 0; i < 60; i++) {
      jest.advanceTimersByTime(1000);
    }

    expect(pings).toBe(2);
  });

  it('should fire in a custom interval', () => {
    let pings = 0;
    new MediaPingInterval(5, undefined, () => pings++);

    for (let i = 0; i < 20; i++) {
      jest.advanceTimersByTime(1000);
    }

    expect(pings).toBe(4);
  });

  it('should stop firing after clear', () => {
    let pings = 0;
    const interval = new MediaPingInterval(undefined, undefined, () => pings++);

    for (let i = 0; i < 30; i++) {
      jest.advanceTimersByTime(1000);
    }

    interval.clear();

    for (let i = 0; i < 10; i++) {
      jest.advanceTimersByTime(1000);
    }

    expect(pings).toBe(1);
  });

  it('should stop firing ping events when paused', () => {
    let pings = 0;
    const interval = new MediaPingInterval(1, 3, () => pings++);
    interval.update({
      currentTime: 0,
      ended: false,
      loop: false,
      isLive: false,
      muted: false,
      paused: true,
      playbackRate: 1,
      volume: 100,
    });

    for (let i = 0; i < 30; i++) {
      jest.advanceTimersByTime(1000);
    }

    expect(pings).toBe(3);
  });
});
