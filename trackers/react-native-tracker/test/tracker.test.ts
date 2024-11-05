import { newTracker } from '../src';

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
    const payload = await request.json();
    expect(payload.data.length).toBe(1);

    const [event] = payload.data;
    expect(event.p).toBe('mob');
    expect(event.tv).toContain('rn-');
    expect(event.tna).toBe('test');
    expect(event.dtm).toBeDefined();
    expect(event.stm).toBeDefined();
    expect(event.aid).toBe('my-app');
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
      const payload = await request.json();
      expect(payload.data.length).toBe(1);

      const [event] = payload.data;
      expect(event.co).toBeDefined();
      const context = JSON.parse(event.co as string);
      expect(context.data.length).toBe(1);
      const [{ schema, data }] = context.data;

      expect(schema).toBe('iglu:com.acme/user/jsonschema/1-0-0');
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
      const payload = await request.json();
      expect(payload.data.length).toBe(1);

      const [event] = payload.data;
      expect(event.co).toBeUndefined();
    });
  });
});
