import { addTracker, SharedState, EventStore, BrowserTracker } from '@snowplow/browser-tracker-core';
import { newInMemoryEventStore } from '@snowplow/tracker-core';
import { WebViewPlugin } from '../src';
import { hasMobileInterface } from '../../../../../mirandawilson/snowplow-webview-tracker';

jest.mock('../../../../snowplow-webview-tracker');

describe('WebView plugin', () => {
  let idx = 1;
  let eventStore: EventStore;
  let tracker: BrowserTracker | null;

  let mockHasMobileInterface = hasMobileInterface as jest.Mock<boolean>;

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

    let events = await eventStore.getAllPayloads();
    expect(events).toHaveLength(0);
  });
});
