import { addTracker, SharedState, EventStore, BrowserTracker } from '@snowplow/browser-tracker-core';
import { ScreenTrackingPlugin, trackScreenView } from '../src';
import { newInMemoryEventStore } from '@snowplow/tracker-core';
import { SCREEN_ENTITY_SCHEMA, SCREEN_VIEW_EVENT_SCHEMA } from '../src/schemata';

describe('ScreenTrackingPlugin', () => {
  let idx = 1;
  let eventStore: EventStore;
  let tracker: BrowserTracker | null;

  describe('Enabled screen context tracking', () => {
    beforeEach(() => {
      eventStore = newInMemoryEventStore({});
      const customFetch = async () => new Response(null, { status: 500 });
      tracker = addTracker(`sp${idx++}`, `sp${idx++}`, 'js-3.0.0', '', new SharedState(), {
        plugins: [ScreenTrackingPlugin()],
        eventStore,
        customFetch,
        contexts: { webPage: false },
      });
    });

    it('adds id and previous screen view references', async () => {
      trackScreenView({
        id: '1',
        name: 'Home',
      });

      let [{ ue_pr }] = await eventStore.getAllPayloads();
      let event = JSON.parse(ue_pr as string).data;
      expect(event.schema).toBe(SCREEN_VIEW_EVENT_SCHEMA);
      expect(event.data).toMatchObject({
        name: 'Home',
        id: '1',
      });

      trackScreenView({
        name: 'About',
      });

      [, , { ue_pr }] = await eventStore.getAllPayloads();
      event = JSON.parse(ue_pr as string).data;
      expect(event.schema).toBe(SCREEN_VIEW_EVENT_SCHEMA);
      expect(event.data).toMatchObject({
        name: 'About',
        id: expect.any(String),
        previousName: 'Home',
        previousId: '1',
      });
    });

    it('adds screen context entity to all events', async () => {
      trackScreenView({
        id: '1',
        name: 'Home',
      });

      let [{ co }] = await eventStore.getAllPayloads();
      let context = JSON.parse(co as string).data;
      expect(context).toEqual([
        {
          schema: SCREEN_ENTITY_SCHEMA,
          data: {
            name: 'Home',
            id: '1',
          },
        },
      ]);

      tracker?.trackPageView();

      [, { co }] = await eventStore.getAllPayloads();
      context = JSON.parse(co as string).data;
      expect(context).toEqual([
        {
          schema: SCREEN_ENTITY_SCHEMA,
          data: {
            name: 'Home',
            id: '1',
          },
        },
      ]);
    });
  });

  describe('Disabled screen context tracking', () => {
    beforeEach(() => {
      eventStore = newInMemoryEventStore({});
      const customFetch = async () => new Response(null, { status: 500 });
      tracker = addTracker(`sp${idx++}`, `sp${idx++}`, 'js-3.0.0', '', new SharedState(), {
        plugins: [ScreenTrackingPlugin({ screenContext: false })],
        eventStore,
        customFetch,
        contexts: { webPage: false },
      });
    });

    it('does not add screen context entity to events', async () => {
      trackScreenView({ name: 'Home' });

      let [{ co }] = await eventStore.getAllPayloads();
      expect(co).toBeUndefined();

      tracker?.trackPageView();

      [, { co }] = await eventStore.getAllPayloads();
      expect(co).toBeUndefined();
    });
  });
});
