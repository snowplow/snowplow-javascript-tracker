import { PingInterval } from '../src/pingInterval';

describe('PingInterval', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.clearAllTimers();
  });

  it('should fire every 30 seconds', () => {
    let pings = 0;
    new PingInterval(undefined, () => pings++);

    for (let i = 0; i < 60; i++) {
      jest.advanceTimersByTime(1000);
    }

    expect(pings).toBe(2);
  });

  it('should fire in a custom interval', () => {
    let pings = 0;
    new PingInterval(5, () => pings++);

    for (let i = 0; i < 20; i++) {
      jest.advanceTimersByTime(1000);
    }

    expect(pings).toBe(4);
  });

  it('should stop firing after clear', () => {
    let pings = 0;
    const interval = new PingInterval(undefined, () => pings++);

    for (let i = 0; i < 30; i++) {
      jest.advanceTimersByTime(1000);
    }

    interval.clear();

    for (let i = 0; i < 10; i++) {
      jest.advanceTimersByTime(1000);
    }

    expect(pings).toBe(1);
  });
});
