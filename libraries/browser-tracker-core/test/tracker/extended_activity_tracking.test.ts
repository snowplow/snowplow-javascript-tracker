import { createTracker } from '../helpers';
import { Payload } from '@snowplow/tracker-core';
import { ActivityCallbackData } from '../../src';

jest.useFakeTimers();

describe('Extended activity tracking', () => {
  const ACTIVITY_METRICS_SCHEMA = 'iglu:com.snowplowanalytics.snowplow/activity_metrics/jsonschema/1-0-0';

  beforeAll(() => {
    jest.spyOn(document, 'title', 'get').mockReturnValue('Test Page');
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  function getTrackedPayloads() {
    const payloads: Payload[] = [];
    const tracker = createTracker({
      plugins: [
        {
          afterTrack: (payload) => {
            payloads.push(payload);
          },
        },
      ],
    });
    return { tracker: tracker!, payloads };
  }

  function getPagePings(payloads: Payload[]) {
    return payloads.filter((p) => p.e === 'pp');
  }

  function getContextEntities(payload: Payload): Array<{ schema: string; data: unknown }> {
    const co = payload.co as string | undefined;
    if (!co) return [];
    return JSON.parse(co).data ?? [];
  }

  /**
   * The heartbeat check is `lastActivityTime + configHeartBeatTimer > now`.
   * Activity must happen strictly within the heartbeat window (not at its start).
   * We advance 1s, dispatch events (so lastActivityTime is now+1s), then advance the rest.
   */
  function simulateActivityInWindow(events: Event[], heartbeatMs: number) {
    jest.advanceTimersByTime(1000);
    events.forEach((e) => document.dispatchEvent(e));
    jest.advanceTimersByTime(heartbeatMs - 1000);
  }

  it('accumulates metrics from simulated DOM events', () => {
    const { tracker, payloads } = getTrackedPayloads();
    tracker.enableActivityTracking({
      minimumVisitLength: 0,
      heartbeatDelay: 10,
      extendedActivityTracking: true,
    });
    tracker.trackPageView();

    simulateActivityInWindow(
      [
        new MouseEvent('mousemove', { clientX: 0, clientY: 0 }),
        new MouseEvent('mousemove', { clientX: 3, clientY: 4 }),
        new MouseEvent('click'),
        new MouseEvent('click'),
        new KeyboardEvent('keydown'),
        new KeyboardEvent('keydown'),
        new KeyboardEvent('keydown'),
        new Event('touchstart'),
      ],
      10_000
    );

    const pings = getPagePings(payloads);
    expect(pings.length).toBe(1);

    const entities = getContextEntities(pings[0]);
    const metricsEntity = entities.find((e) => e.schema === ACTIVITY_METRICS_SCHEMA);
    expect(metricsEntity).toBeDefined();

    const data = metricsEntity!.data as Record<string, number>;
    expect(data.mouseDistance).toBe(5); // sqrt(9+16)=5
    expect(data.clicks).toBe(2);
    expect(data.keyPresses).toBe(3);
    expect(data.touches).toBe(1);
  });

  it('resets metrics after each ping', () => {
    const { tracker, payloads } = getTrackedPayloads();
    tracker.enableActivityTracking({
      minimumVisitLength: 0,
      heartbeatDelay: 10,
      extendedActivityTracking: true,
    });
    tracker.trackPageView();

    // First heartbeat
    simulateActivityInWindow([new MouseEvent('click'), new MouseEvent('click')], 10_000);

    // Second heartbeat
    simulateActivityInWindow([new MouseEvent('click')], 10_000);

    const pings = getPagePings(payloads);
    expect(pings.length).toBe(2);

    const data1 = getContextEntities(pings[0]).find((e) => e.schema === ACTIVITY_METRICS_SCHEMA)!.data as Record<
      string,
      number
    >;
    const data2 = getContextEntities(pings[1]).find((e) => e.schema === ACTIVITY_METRICS_SCHEMA)!.data as Record<
      string,
      number
    >;

    expect(data1.clicks).toBe(2);
    expect(data2.clicks).toBe(1);
  });

  it('does not attach entity when extendedActivityTracking is not set', () => {
    const { tracker, payloads } = getTrackedPayloads();
    tracker.enableActivityTracking({
      minimumVisitLength: 0,
      heartbeatDelay: 10,
    });
    tracker.trackPageView();

    simulateActivityInWindow([new MouseEvent('click')], 10_000);

    const pings = getPagePings(payloads);
    expect(pings.length).toBe(1);

    const entities = getContextEntities(pings[0]);
    const metricsEntity = entities.find((e) => e.schema === ACTIVITY_METRICS_SCHEMA);
    expect(metricsEntity).toBeUndefined();
  });

  it('calculates mouse distance as Euclidean sum', () => {
    const { tracker, payloads } = getTrackedPayloads();
    tracker.enableActivityTracking({
      minimumVisitLength: 0,
      heartbeatDelay: 10,
      extendedActivityTracking: true,
    });
    tracker.trackPageView();

    // Move from (0,0) to (3,4) then to (3,14)
    simulateActivityInWindow(
      [
        new MouseEvent('mousemove', { clientX: 0, clientY: 0 }),
        new MouseEvent('mousemove', { clientX: 3, clientY: 4 }), // distance 5
        new MouseEvent('mousemove', { clientX: 3, clientY: 14 }), // distance 10
      ],
      10_000
    );

    const pings = getPagePings(payloads);
    expect(pings.length).toBe(1);

    const data = getContextEntities(pings[0]).find((e) => e.schema === ACTIVITY_METRICS_SCHEMA)!.data as Record<
      string,
      number
    >;
    expect(data.mouseDistance).toBe(15); // 5 + 10
  });

  it('populates activityMetrics in callback data', () => {
    let callbackData: ActivityCallbackData | undefined;
    const tracker = createTracker({
      plugins: [{ afterTrack: () => {} }],
    });

    tracker!.enableActivityTrackingCallback({
      minimumVisitLength: 0,
      heartbeatDelay: 10,
      extendedActivityTracking: true,
      callback: (data) => {
        callbackData = data;
      },
    });
    tracker!.trackPageView();

    simulateActivityInWindow([new MouseEvent('click'), new MouseEvent('click')], 10_000);

    expect(callbackData).toBeDefined();
    expect(callbackData!.activityMetrics).toBeDefined();
    expect(callbackData!.activityMetrics!.clicks).toBe(2);
  });

  it('resets metrics on new trackPageView', () => {
    const { tracker, payloads } = getTrackedPayloads();
    tracker.enableActivityTracking({
      minimumVisitLength: 0,
      heartbeatDelay: 10,
      extendedActivityTracking: true,
    });
    tracker.trackPageView();

    // Accumulate some clicks (advance a bit so they register in heartbeat)
    jest.advanceTimersByTime(1000);
    document.dispatchEvent(new MouseEvent('click'));
    document.dispatchEvent(new MouseEvent('click'));

    // New page view resets metrics and restarts intervals
    tracker.trackPageView();

    // Only one new click after the new page view
    simulateActivityInWindow([new MouseEvent('click')], 10_000);

    const pings = getPagePings(payloads);
    expect(pings.length).toBe(1);

    const data = getContextEntities(pings[0]).find((e) => e.schema === ACTIVITY_METRICS_SCHEMA)!.data as Record<
      string,
      number
    >;
    expect(data.clicks).toBe(1);
  });

  it('first mousemove sets position but does not add distance', () => {
    const { tracker, payloads } = getTrackedPayloads();
    tracker.enableActivityTracking({
      minimumVisitLength: 0,
      heartbeatDelay: 10,
      extendedActivityTracking: true,
    });
    tracker.trackPageView();

    // Only one mousemove — should set position but not add distance
    simulateActivityInWindow([new MouseEvent('mousemove', { clientX: 100, clientY: 200 })], 10_000);

    const pings = getPagePings(payloads);
    expect(pings.length).toBe(1);

    const data = getContextEntities(pings[0]).find((e) => e.schema === ACTIVITY_METRICS_SCHEMA)!.data as Record<
      string,
      number
    >;
    expect(data.mouseDistance).toBe(0);
  });

  it('updatePageActivity does not fabricate metrics', () => {
    const { tracker, payloads } = getTrackedPayloads();
    tracker.enableActivityTracking({
      minimumVisitLength: 0,
      heartbeatDelay: 10,
      extendedActivityTracking: true,
    });
    tracker.trackPageView();

    // updatePageActivity without a real event — advance partially so heartbeat detects it
    jest.advanceTimersByTime(1000);
    tracker.updatePageActivity();
    jest.advanceTimersByTime(9000);

    const pings = getPagePings(payloads);
    expect(pings.length).toBe(1);

    const data = getContextEntities(pings[0]).find((e) => e.schema === ACTIVITY_METRICS_SCHEMA)!.data as Record<
      string,
      number
    >;
    expect(data.mouseDistance).toBe(0);
    expect(data.clicks).toBe(0);
    expect(data.keyPresses).toBe(0);
    expect(data.touches).toBe(0);
    expect(data.scrollDistance).toBe(0);
  });
});
