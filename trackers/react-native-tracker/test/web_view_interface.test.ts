import { getWebViewCallback, newTracker, removeTracker } from '../src';

function createMockFetch(status: number, requests: Request[]) {
  return async (input: Request) => {
    requests.push(input);
    let response = new Response(null, { status });
    return response;
  };
}

describe('WebView interface', () => {
  let requests: Request[];
  let mockFetch: ReturnType<typeof createMockFetch>;

  beforeEach(async () => {
    requests = [];
    mockFetch = createMockFetch(200, requests);
  });

  afterEach(() => {
    removeTracker('test');
  });

  it('tracks a page view event', async () => {
    const tracker = await newTracker({
      namespace: 'test',
      appId: 'my-app',
      endpoint: 'http://localhost:9090',
      customFetch: mockFetch,
    });

    const webViewInterface = getWebViewCallback();
    webViewInterface({
      nativeEvent: {
        data: JSON.stringify({
          command: 'trackPageView',
          event: {
            title: 'Home',
            url: 'http://localhost:9090',
            referrer: 'http://refr.com',
          },
        }),
      },
    });

    await tracker.flush();
    expect(requests.length).toBe(1);

    const [request] = requests;
    const payload = await request?.json();
    expect(payload.data.length).toBe(1);

    const [event] = payload.data;
    expect(event.e).toBe('pv');
    expect(event.url).toBe('http://localhost:9090');
    expect(event.refr).toBe('http://refr.com');
    expect(event.page).toBe('Home');
  });

  it('tracks a self-describing event', async () => {
    const tracker = await newTracker({
      namespace: 'test',
      appId: 'my-app',
      endpoint: 'http://localhost:9090',
      customFetch: mockFetch,
      encodeBase64: false,
    });

    const webViewInterface = getWebViewCallback();
    webViewInterface({
      nativeEvent: {
        data: JSON.stringify({
          command: 'trackSelfDescribingEvent',
          event: {
            schema: 'iglu:com.snowplowanalytics.snowplow/event/jsonschema/1-0-0',
            data: {
              key: 'value',
            },
          },
        }),
      },
    });

    await tracker.flush();
    expect(requests.length).toBe(1);

    const [request] = requests;
    const payload = await request?.json();
    expect(payload.data.length).toBe(1);

    const [event] = payload.data;
    const { e, ue_pr } = event;
    expect(e).toBe('ue');
    expect(ue_pr).toBeDefined();
    const { data } = JSON.parse(ue_pr);
    expect(data.schema).toBe('iglu:com.snowplowanalytics.snowplow/event/jsonschema/1-0-0');
    expect(data.data.key).toBe('value');
  });

  it('tracks a structured event', async () => {
    const tracker = await newTracker({
      namespace: 'test',
      appId: 'my-app',
      endpoint: 'http://localhost:9090',
      customFetch: mockFetch,
    });

    const webViewInterface = getWebViewCallback();
    webViewInterface({
      nativeEvent: {
        data: JSON.stringify({
          command: 'trackStructEvent',
          event: {
            category: 'category',
            action: 'action',
            label: 'label',
            property: 'property',
            value: 1,
          },
        }),
      },
    });

    await tracker.flush();
    expect(requests.length).toBe(1);

    const [request] = requests;
    const payload = await request?.json();
    expect(payload.data.length).toBe(1);

    const [event] = payload.data;
    const { e, se_ca, se_ac, se_la, se_pr, se_va } = event;
    expect(e).toBe('se');
    expect(se_ca).toBe('category');
    expect(se_ac).toBe('action');
    expect(se_la).toBe('label');
    expect(se_pr).toBe('property');
    expect(se_va).toBe('1');
  });

  it('tracks a screen view event', async () => {
    const tracker = await newTracker({
      namespace: 'test',
      appId: 'my-app',
      endpoint: 'http://localhost:9090',
      customFetch: mockFetch,
      encodeBase64: false,
    });

    const webViewInterface = getWebViewCallback();
    webViewInterface({
      nativeEvent: {
        data: JSON.stringify({
          command: 'trackScreenView',
          event: {
            name: 'Home',
            id: 'home',
          },
        }),
      },
    });

    await tracker.flush();
    expect(requests.length).toBe(1);

    const [request] = requests;
    const payload = await request?.json();
    expect(payload.data.length).toBe(1);

    const [event] = payload.data;
    expect(event.e).toBe('ue');
    expect(event.ue_pr).toBeDefined();
    const { data } = JSON.parse(event.ue_pr);
    expect(data.schema).toBe('iglu:com.snowplowanalytics.mobile/screen_view/jsonschema/1-0-0');
    expect(data.data.name).toBe('Home');
    expect(data.data.id).toBe('home');
  });

  describe('WebView event tracking', () => {

    it('tracks a page view event', async () => {
      const tracker = await newTracker({
        namespace: 'test',
        appId: 'my-app',
        endpoint: 'http://localhost:9090',
        customFetch: mockFetch,
      });
  
      const webViewInterface = getWebViewCallback();
      webViewInterface({
        nativeEvent: {
          data: JSON.stringify({
            command: 'trackWebViewEvent',
            event: {
              eventName: 'pv',
              pageTitle: 'Home',
              pageUrl: 'http://localhost:9090',
              referrer: 'http://refr.com',
            },
          }),
        },
      });
  
      await tracker.flush();
      expect(requests.length).toBe(1);
  
      const [request] = requests;
      const payload = await request?.json();
      expect(payload.data.length).toBe(1);
  
      const [event] = payload.data;
      expect(event.e).toBe('pv');
      expect(event.url).toBe('http://localhost:9090');
      expect(event.refr).toBe('http://refr.com');
      expect(event.page).toBe('Home');
    });

    it('tracks a self-describing event', async () => {
      const tracker = await newTracker({
        namespace: 'test',
        appId: 'my-app',
        endpoint: 'http://localhost:9090',
        customFetch: mockFetch,
        encodeBase64: false,
      });
  
      const webViewInterface = getWebViewCallback();
      webViewInterface({
        nativeEvent: {
          data: JSON.stringify({
            command: 'trackWebViewEvent',
            event: {
              selfDescribingEventData: {
                schema: 'iglu:com.snowplowanalytics.snowplow/event/jsonschema/1-0-0',
                data: {
                  key: 'value',
                },
              },
            },
          }),
        },
      });
  
      await tracker.flush();
      expect(requests.length).toBe(1);
  
      const [request] = requests;
      const payload = await request?.json();
      expect(payload.data.length).toBe(1);
  
      const [event] = payload.data;
      const { e, ue_pr } = event;
      expect(e).toBe('ue');
      expect(ue_pr).toBeDefined();
      const { data } = JSON.parse(ue_pr);
      expect(data.schema).toBe('iglu:com.snowplowanalytics.snowplow/event/jsonschema/1-0-0');
      expect(data.data.key).toBe('value');
    });

    it('tracks a structured event', async () => {
      const tracker = await newTracker({
        namespace: 'test',
        appId: 'my-app',
        endpoint: 'http://localhost:9090',
        customFetch: mockFetch,
      });
  
      const webViewInterface = getWebViewCallback();
      webViewInterface({
        nativeEvent: {
          data: JSON.stringify({
            command: 'trackWebViewEvent',
            event: {
              eventName: 'se',
              category: 'category',
              action: 'action',
              label: 'label',
              property: 'property',
              value: 1,
            },
          }),
        },
      });
  
      await tracker.flush();
      expect(requests.length).toBe(1);
  
      const [request] = requests;
      const payload = await request?.json();
      expect(payload.data.length).toBe(1);
  
      const [event] = payload.data;
      const { e, se_ca, se_ac, se_la, se_pr, se_va } = event;
      expect(e).toBe('se');
      expect(se_ca).toBe('category');
      expect(se_ac).toBe('action');
      expect(se_la).toBe('label');
      expect(se_pr).toBe('property');
      expect(se_va).toBe('1');
    });

    it('tracks a page ping event', async () => {
      const tracker = await newTracker({
        namespace: 'test',
        appId: 'my-app',
        endpoint: 'http://localhost:9090',
        customFetch: mockFetch,
      });
  
      const webViewInterface = getWebViewCallback();
      webViewInterface({
        nativeEvent: {
          data: JSON.stringify({
            command: 'trackWebViewEvent',
            event: {
              eventName: 'pp',
              pageTitle: 'Home',
              pageUrl: 'http://localhost:9090',
              referrer: 'http://refr.com',
              pingXOffsetMin: 1,
              pingXOffsetMax: 2,
              pingYOffsetMin: 3,
              pingYOffsetMax: 4,
            },
          }),
        },
      });
  
      await tracker.flush();
      expect(requests.length).toBe(1);
  
      const [request] = requests;
      const payload = await request?.json();
      expect(payload.data.length).toBe(1);
  
      const [event] = payload.data;
      expect(event.e).toBe('pp');
      expect(event.url).toBe('http://localhost:9090');
      expect(event.refr).toBe('http://refr.com');
      expect(event.page).toBe('Home');
      expect(event.pp_mix).toBe('1');
      expect(event.pp_max).toBe('2');
      expect(event.pp_miy).toBe('3');
      expect(event.pp_may).toBe('4');
    });
  });

  it('tracks tracker version and useragent', async () => {
    const tracker = await newTracker({
      namespace: 'test',
      appId: 'my-app',
      endpoint: 'http://localhost:9090',
      customFetch: mockFetch,
    });

    const webViewInterface = getWebViewCallback();
    webViewInterface({
      nativeEvent: {
        data: JSON.stringify({
          command: 'trackWebViewEvent',
          event: {
            eventName: 'pv',
            pageTitle: 'Home',
            pageUrl: 'http://localhost:9090',
            trackerVersion: 'wv-1.0.0',
            useragent: 'Mozilla/5.0',
          },
        }),
      },
    });

    await tracker.flush();
    expect(requests.length).toBe(1);

    const [request] = requests;
    const payload = await request?.json();
    expect(payload.data.length).toBe(1);

    const [event] = payload.data;
    expect(event.e).toBe('pv');
    expect(event.url).toBe('http://localhost:9090');
    expect(event.page).toBe('Home');
    expect(event.tv).toBe('wv-1.0.0');
    expect(event.ua).toBe('Mozilla/5.0');
  });
});
