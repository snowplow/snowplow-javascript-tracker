import { getTracker, newTracker, removeAllTrackers, removeTracker } from '../src';
import { MOBILE_CONTEXT_SCHEMA } from '../src/constants';

function createMockFetch(status: number, requests: Request[]) {
  return async (input: Request) => {
    requests.push(input);
    let response = new Response(null, { status });
    return response;
  };
}

describe('Tracker', () => {
  let requests: Request[];
  let mockFetch: ReturnType<typeof createMockFetch>;

  beforeEach(async () => {
    requests = [];
    mockFetch = createMockFetch(200, requests);
  });

  it('creates a tracker with minimal config', async () => {
    expect(await newTracker({ namespace: 'test', endpoint: 'http://localhost:9090' })).toBeDefined();
  });

  it('retrieves an existing tracker', async () => {
    const tracker = await newTracker({ namespace: 'test', endpoint: 'http://localhost:9090' });
    expect(getTracker('test')).toBe(tracker);
    expect(getTracker('non-existent')).toBeUndefined();
  });

  it('removes a tracker', async () => {
    await newTracker({ namespace: 'test', endpoint: 'http://localhost:9090' });
    expect(getTracker('test')).toBeDefined();
    removeTracker('test');
    expect(getTracker('test')).toBeUndefined();
  });

  it('removes all trackers', async () => {
    await newTracker({ namespace: 'test', endpoint: 'http://localhost:9090' });
    expect(getTracker('test')).toBeDefined();
    removeAllTrackers();
    expect(getTracker('test')).toBeUndefined();
  });

  it('tracks a page view event with tracker properties', async () => {
    const tracker = await newTracker({
      namespace: 'test',
      appId: 'my-app',
      endpoint: 'http://localhost:9090',
      customFetch: mockFetch,
    });
    tracker.trackPageViewEvent({
      pageUrl: 'http://localhost:9090',
      pageTitle: 'Home',
    });
    await tracker.flush();
    expect(requests.length).toBe(1);

    const [request] = requests;
    const payload = await request?.json();
    expect(payload.data.length).toBe(1);

    const [event] = payload.data;
    expect(event.p).toBe('mob');
    expect(event.tv).toContain('rn-');
    expect(event.tna).toBe('test');
    expect(event.dtm).toBeDefined();
    expect(event.stm).toBeDefined();
    expect(event.aid).toBe('my-app');
  });

  it('tracks session along with events', async () => {
    const tracker = await newTracker({
      namespace: 'test',
      appId: 'my-app',
      endpoint: 'http://localhost:9090',
      customFetch: mockFetch,
    });
    tracker.trackPageViewEvent({
      pageUrl: 'http://localhost:9090',
      pageTitle: 'Home',
    });
    await tracker.flush();
    expect(requests.length).toBe(1);

    const [request] = requests;
    const payload = await request?.json();
    expect(payload.data.length).toBe(1);
    expect(payload.data[0].co).toContain('/client_session/');
    expect(payload.data[0].co).toContain(await tracker.getSessionId());
    expect(payload.data[0].co).toContain(await tracker.getSessionUserId());
    expect(await tracker.getSessionId()).toBeDefined();
    expect(await tracker.getSessionUserId()).toBeDefined();
  });

  it('attaches application context to events', async () => {
    const tracker = await newTracker({
      namespace: 'test',
      appId: 'my-app',
      appVersion: '1.0.1',
      endpoint: 'http://localhost:9090',
      customFetch: mockFetch,
    });
    tracker.trackPageViewEvent({
      pageUrl: 'http://localhost:9090',
      pageTitle: 'Home',
    });
    await tracker.flush();
    expect(requests.length).toBe(1);

    const [request] = requests;
    const payload = await request?.json();
    expect(payload.data.length).toBe(1);
    expect(payload.data[0].co).toContain('/application/');
    expect(payload.data[0].co).toContain('1.0.1');
  });

  it('tracks screen engagement events', async () => {
    const tracker = await newTracker({
      namespace: 'test',
      endpoint: 'http://localhost:9090',
      customFetch: mockFetch,
    });

    tracker.trackScreenViewEvent({
      name: 'Home',
    });
    await tracker.flush();
    expect(requests.length).toBe(1);

    const [request] = requests;
    const payload = await request?.json();
    expect(payload.data.length).toBe(1);
    expect(payload.data[0].ue_pr).toBeDefined();
    expect(payload.data[0].ue_pr).toContain('/screen_view/');
    expect(payload.data[0].co).toContain('/screen/');

    tracker.trackScrollChangedEvent({
      xOffset: 101,
    });
    tracker.trackListItemViewEvent({
      index: 1,
      itemsCount: 909,
    });
    tracker.trackScreenViewEvent({ name: 'About' });
    await tracker.flush();

    expect(requests.length).toBe(2);
    const [, secondRequest] = requests;
    const secondPayload = await secondRequest?.json();
    expect(secondPayload.data.length).toBe(2);
    const [screenEndEvent] = secondPayload.data;
    expect(screenEndEvent.ue_pr).toBeDefined();
    expect(screenEndEvent.ue_pr).toContain('screen_end');
    expect(screenEndEvent.co).toBeDefined();
    expect(screenEndEvent.co).toContain('screen_summary');
    expect(screenEndEvent.co).toContain('101');
    expect(screenEndEvent.co).toContain('909');
  });

  it('doesnt track screen engagement events if disabled', async () => {
    const tracker = await newTracker({
      namespace: 'test',
      endpoint: 'http://localhost:9090',
      customFetch: mockFetch,
      screenContext: false,
      screenEngagementAutotracking: false,
    });

    tracker.trackScreenViewEvent({
      name: 'Home',
    });
    tracker.trackScreenViewEvent({
      name: 'About',
    });
    await tracker.flush();
    expect(requests.length).toBe(1);

    const [request] = requests;

    const payload = await request?.json();
    expect(payload.data.length).toBe(2);

    const [screen1, screen2] = payload.data;
    expect(screen1.ue_pr).toBeDefined();
    expect(screen1.ue_pr).toContain('/screen_view/');
    expect(screen1.co ?? '').not.toContain('/screen/');

    expect(screen2.ue_pr).toBeDefined();
    expect(screen2.ue_pr).toContain('/screen_view/');
    expect(screen2.co ?? '').not.toContain('/screen/');
  });

  it('adds a tracker plugin', async () => {
    const tracker = await newTracker({
      namespace: 'test',
      endpoint: 'http://localhost:9090',
      customFetch: mockFetch,
    });

    let pluginCalled = false;
    tracker.addPlugin({
      plugin: {
        afterTrack: () => {
          pluginCalled = true;
        },
      },
    });

    tracker.trackPageViewEvent({
      pageUrl: 'http://localhost:9090',
      pageTitle: 'Home',
    });
    await tracker.flush();
    expect(pluginCalled).toBe(true);
  });

  it('tracks a platform context entity along with events unless disabled', async () => {
    jest.mock('react-native/Libraries/Utilities/Platform', () => ({
      OS: 'ios',
      Version: '18.0',
      constants: {
        osVersion: '18.0',
        systemName: 'iOS',
      },
      select: () => null,
    }));

    const tracker = await newTracker({
      namespace: 'test',
      endpoint: 'http://localhost:9090',
      customFetch: mockFetch,
    });

    tracker.trackPageViewEvent({
      pageUrl: 'http://localhost:9090',
      pageTitle: 'Home',
    });

    await tracker.flush();
    const [request] = requests;
    const payload = await request?.json();
    expect(payload.data.length).toBe(1);

    const [event] = payload.data;
    expect(event.co).toBeDefined();
    expect(event.co).toContain(MOBILE_CONTEXT_SCHEMA);

    tracker.disablePlatformContext();
    tracker.trackPageViewEvent({
      pageUrl: 'http://localhost:9090',
      pageTitle: 'Home',
    });

    await tracker.flush();
    const [, request2] = requests;
    const payload2 = await request2?.json();
    expect(payload2.data.length).toBe(1);

    const [event2] = payload2.data;
    expect(event2.co ?? '').not.toContain(MOBILE_CONTEXT_SCHEMA);
  });

  describe('Global contexts', () => {
    it('adds a global context', async () => {
      const tracker = await newTracker({
        namespace: 'test',
        endpoint: 'http://localhost:9090',
        customFetch: mockFetch,
      });

      tracker.addGlobalContexts([
        {
          schema: 'iglu:com.acme/user/jsonschema/1-0-0',
          data: {
            userType: 'tester',
          },
        },
      ]);

      tracker.trackPageViewEvent({
        pageUrl: 'http://localhost:9090',
        pageTitle: 'Home',
      });
      await tracker.flush();

      const [request] = requests;
      const payload = await request?.json();
      expect(payload.data.length).toBe(1);

      const [event] = payload.data;
      expect(event.co).toBeDefined();
      const context = JSON.parse(event.co as string);
      expect(context.data.length).toBeGreaterThanOrEqual(1);
      const { data } = context.data.find((c: any) => c.schema === 'iglu:com.acme/user/jsonschema/1-0-0');

      expect(data.userType).toBe('tester');
    });

    it('removes a global context', async () => {
      const tracker = await newTracker({
        namespace: 'test',
        endpoint: 'http://localhost:9090',
        customFetch: mockFetch,
      });

      const context = {
        schema: 'iglu:com.acme/user/jsonschema/1-0-0',
        data: {
          userType: 'tester',
        },
      };

      tracker.addGlobalContexts({ c1: context });
      tracker.removeGlobalContexts(['c1']);

      tracker.trackPageViewEvent({
        pageUrl: 'http://localhost:9090',
        pageTitle: 'Home',
      });
      await tracker.flush();

      const [request] = requests;
      const payload = await request?.json();
      expect(payload.data.length).toBe(1);

      const [event] = payload.data;
      expect(event.co ?? '').not.toContain(context.schema);
    });
  });
});
