import { addTracker, SharedState, EventStore, BrowserTracker } from '@snowplow/browser-tracker-core';
import { newInMemoryEventStore, buildSelfDescribingEvent } from '@snowplow/tracker-core';
import { WebViewPlugin } from '../src';
import { hasMobileInterface, trackWebViewEvent } from '@snowplow/webview-tracker';

jest.mock('@snowplow/webview-tracker');

describe('WebView plugin', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  let idx = 1;
  let eventStore: EventStore;
  let tracker: BrowserTracker | null;

  let mockHasMobileInterface = hasMobileInterface as jest.Mock<boolean>;
  let mockTrackWebViewEvent = trackWebViewEvent as jest.Mock<void>;

  it('Does not filter events if mobile interface not found', async () => {
    mockHasMobileInterface.mockImplementation(() => {
      return false;
    });

    eventStore = newInMemoryEventStore({});
    const customFetch = async () => new Response(null, { status: 500 });
    tracker = addTracker(`sp${idx++}`, `sp${idx++}`, 'js-4.0.0', '', new SharedState(), {
      plugins: [WebViewPlugin()],
      eventStore,
      customFetch,
    });

    tracker?.trackPageView();

    let events = await eventStore.getAllPayloads();
    expect(events).toHaveLength(1);
    expect(mockTrackWebViewEvent).not.toHaveBeenCalled();
  });

  it('Filters out the events if a mobile interface is present', async () => {
    mockHasMobileInterface.mockImplementation(() => {
      return true;
    });

    eventStore = newInMemoryEventStore({});
    const customFetch = async () => new Response(null, { status: 500 });
    tracker = addTracker(`sp${idx++}`, `sp${idx++}`, 'js-4.0.0', '', new SharedState(), {
      plugins: [WebViewPlugin()],
      eventStore,
      customFetch,
    });

    tracker?.trackPageView();
    tracker?.core.track(
      buildSelfDescribingEvent({
        event: {
          schema: 'iglu:com.snowplowanalytics.snowplow.media/play_event/jsonschema/1-0-0',
          data: {
            a: 'b',
          },
        },
      })
    );

    let events = await eventStore.getAllPayloads();
    expect(events).toHaveLength(0);
    expect(mockTrackWebViewEvent).toHaveBeenCalled();

    let calls = mockTrackWebViewEvent.mock.calls;
    // tracked two events
    expect(calls).toHaveLength(2);

    // page view event properties
    expect(calls[0][0]).toMatchObject({
      properties: {
        eventName: 'pv',
        trackerVersion: 'js-4.0.0',
        useragent: expect.any(String),
        pageUrl: expect.any(String),
      },
      context: [
        {
          schema: 'iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0',
          data: {
            id: expect.any(String),
          },
        },
      ],
    });

    // self-describing event properties
    expect(calls[1][0]).toMatchObject({
      properties: {
        eventName: 'ue',
        trackerVersion: 'js-4.0.0',
        useragent: expect.any(String),
        pageUrl: expect.any(String),
        pageTitle: undefined,
        referrer: undefined,
        category: undefined,
        action: undefined,
        label: undefined,
        property: undefined,
        value: undefined,
        pingXOffsetMin: undefined,
        pingXOffsetMax: undefined,
        pingYOffsetMin: undefined,
        pingYOffsetMax: undefined,
      },
      event: {
        schema: 'iglu:com.snowplowanalytics.snowplow.media/play_event/jsonschema/1-0-0',
        data: { a: 'b' },
      },
      context: [
        {
          schema: 'iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0',
          data: {
            id: expect.any(String),
          },
        },
      ],
    });

    // no tracker namespaces provided
    expect(calls[0][1]).toBeUndefined();
  });

  it('Decodes base64-encoded payloads', async () => {
    mockHasMobileInterface.mockImplementation(() => {
      return true;
    });

    eventStore = newInMemoryEventStore({});
    const customFetch = async () => new Response(null, { status: 500 });
    tracker = addTracker(`sp${idx++}`, `sp${idx++}`, 'js-4.0.0', '', new SharedState(), {
      plugins: [WebViewPlugin()],
      eventStore,
      customFetch,
    });

    tracker?.core.setBase64Encoding(true);

    tracker?.core.track(
      buildSelfDescribingEvent({
        event: {
          schema: 'iglu:com.snowplowanalytics.snowplow/example/jsonschema/1-0-0',
          data: {
            hello: 'world',
          },
        },
      })
    );

    let events = await eventStore.getAllPayloads();
    expect(events).toHaveLength(0);
    expect(mockTrackWebViewEvent).toHaveBeenCalled();

    let calls = mockTrackWebViewEvent.mock.calls;
    expect(calls).toHaveLength(1);

    // decoded event properties
    expect(calls[0][0]).toMatchObject({
      properties: {
        eventName: 'ue',
        trackerVersion: 'js-4.0.0',
        useragent: expect.any(String),
        pageUrl: expect.any(String),
      },
      event: {
        schema: 'iglu:com.snowplowanalytics.snowplow/example/jsonschema/1-0-0',
        data: { hello: 'world' },
      },
      context: [
        {
          schema: 'iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0',
          data: {
            id: expect.any(String),
          },
        },
      ],
    });
  });

  it('Passes a configured list of tracker namespaces', async () => {
    mockHasMobileInterface.mockImplementation(() => {
      return true;
    });

    eventStore = newInMemoryEventStore({});
    const customFetch = async () => new Response(null, { status: 500 });
    tracker = addTracker(`sp${idx++}`, `sp${idx++}`, 'js-4.0.0', '', new SharedState(), {
      plugins: [WebViewPlugin({ trackerNamespaces: ['sp1', 'sp2'] })],
      eventStore,
      customFetch,
    });

    tracker?.trackPageView();
    let calls = mockTrackWebViewEvent.mock.calls;
    expect(calls).toHaveLength(1);
    expect(calls[0][1]).toEqual(['sp1', 'sp2']);
  });
});
