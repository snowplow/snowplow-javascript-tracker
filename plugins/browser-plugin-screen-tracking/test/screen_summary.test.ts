import { addTracker, SharedState, EventStore, BrowserTracker } from '@snowplow/browser-tracker-core';
import { ScreenTrackingPlugin, trackListItemView, trackScreenView, trackScrollChanged } from '../src';
import { buildSelfDescribingEvent, newInMemoryEventStore } from '@snowplow/tracker-core';
import { BACKGROUND_EVENT_SCHEMA, SCREEN_END_EVENT_SCHEMA, SCREEN_SUMMARY_ENTITY_SCHEMA, SCREEN_VIEW_EVENT_SCHEMA } from '../src/schemata';

describe('Screen summary tracking', () => {
  let idx = 1;
  let eventStore: EventStore;
  let tracker: BrowserTracker | null;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.clearAllTimers();
  });

  describe('Enabled screen engagement tracking', () => {
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

    it('adds a screen summary entity to screen end event', async () => {
      jest.setSystemTime(new Date('2022-04-17T00:00:00.000Z'));
      trackScreenView({ name: 'Home' });

      jest.setSystemTime(new Date('2022-04-17T00:00:15.000Z'));
      trackScreenView({ name: 'About' });

      const [, { ue_pr, co }] = await eventStore.getAllPayloads();
      const event = JSON.parse(ue_pr as string).data;
      expect(event.schema).toBe(SCREEN_END_EVENT_SCHEMA);

      const context = JSON.parse(co as string).data;
      const screenSummary = context.find((c: any) => c.schema === SCREEN_SUMMARY_ENTITY_SCHEMA);
      expect(screenSummary.data).toMatchObject({
        foreground_sec: 15,
      });

      jest.setSystemTime(new Date('2022-04-17T00:00:45.000Z'));
      trackScreenView({ name: 'Contact' });

      const [, , , { ue_pr: ue_pr2, co: co2 }] = await eventStore.getAllPayloads();
      const event2 = JSON.parse(ue_pr2 as string).data;
      expect(event2.schema).toBe(SCREEN_END_EVENT_SCHEMA);

      const context2 = JSON.parse(co2 as string).data;
      const screenSummary2 = context2.find((c: any) => c.schema === SCREEN_SUMMARY_ENTITY_SCHEMA);
      expect(screenSummary2.data).toMatchObject({
        foreground_sec: 30,
      });
    });

    it('tracks both background and foreground time', async () => {
      jest.setSystemTime(new Date('2022-04-17T00:00:00.000Z'));
      trackScreenView({ name: 'Home' });

      jest.setSystemTime(new Date('2022-04-17T00:00:15.000Z'));
      tracker?.core.track(
        buildSelfDescribingEvent({
          event: {
            schema: BACKGROUND_EVENT_SCHEMA,
            data: {},
          },
        })
      );

      jest.setSystemTime(new Date('2022-04-17T00:00:25.000Z'));
      trackScreenView({ name: 'About' });

      const [, { ue_pr, co }, { ue_pr: ue_pr2, co: co2 }] = await eventStore.getAllPayloads();

      const event = JSON.parse(ue_pr as string).data;
      expect(event.schema).toBe(BACKGROUND_EVENT_SCHEMA);

      const context = JSON.parse(co as string).data;
      const screenSummary = context.find((c: any) => c.schema === SCREEN_SUMMARY_ENTITY_SCHEMA);
      expect(screenSummary.data).toMatchObject({
        foreground_sec: 15,
      });

      const event2 = JSON.parse(ue_pr2 as string).data;
      expect(event2.schema).toBe(SCREEN_END_EVENT_SCHEMA);

      const context2 = JSON.parse(co2 as string).data;
      const screenSummary2 = context2.find((c: any) => c.schema === SCREEN_SUMMARY_ENTITY_SCHEMA);
      expect(screenSummary2.data).toMatchObject({
        foreground_sec: 15,
        background_sec: 10,
      });
    });

    it('adds scroll information to screen summary entity', async () => {
      trackScreenView({ name: 'Home' });

      trackScrollChanged({
        yOffset: 10,
        xOffset: 0,
        viewHeight: 1000,
        viewWidth: 100,
        contentHeight: 2000,
        contentWidth: 1000,
      });

      trackScrollChanged({
        yOffset: 500,
        xOffset: 10,
        viewHeight: 1000,
        viewWidth: 100,
        contentHeight: 2000,
        contentWidth: 1000,
      });

      trackScreenView({ name: 'About' });

      const payloads = await eventStore.getAllPayloads();
      expect(payloads.length).toBe(3);
      const [, { co }] = payloads;
      const context = JSON.parse(co as string).data;
      const screenSummary = context.find((c: any) => c.schema === SCREEN_SUMMARY_ENTITY_SCHEMA);
      expect(screenSummary.data).toMatchObject({
        min_x_offset: 0,
        max_x_offset: 10 + 100,
        min_y_offset: 10,
        max_y_offset: 500 + 1000,
        content_height: 2000,
        content_width: 1000,
      });
    });

    it('adds list item view information to screen summary entity', async () => {
      trackScreenView({ name: 'Home' });

      trackListItemView({
        index: 0,
        itemsCount: 10,
      });

      trackListItemView({
        index: 5,
        itemsCount: 10,
      });

      trackScreenView({ name: 'About' });

      const payloads = await eventStore.getAllPayloads();
      expect(payloads.length).toBe(3);
      const [, { co }] = payloads;
      const context = JSON.parse(co as string).data;
      const screenSummary = context.find((c: any) => c.schema === SCREEN_SUMMARY_ENTITY_SCHEMA);
      expect(screenSummary.data).toMatchObject({
        last_item_index: 5,
        items_count: 10,
      });
    });
  });

  describe('Disabled screen engagement tracking', () => {
    beforeEach(() => {
      eventStore = newInMemoryEventStore({});
      const customFetch = async () => new Response(null, { status: 500 });
      tracker = addTracker(`sp${idx++}`, `sp${idx++}`, 'js-3.0.0', '', new SharedState(), {
        plugins: [ScreenTrackingPlugin({ screenEngagementAutotracking: false })],
        eventStore,
        customFetch,
        contexts: { webPage: false },
      });
    });

    it('does not add a screen end event', async () => {
      jest.setSystemTime(new Date('2022-04-17T00:00:00.000Z'));
      trackScreenView({ name: 'Home' });

      jest.setSystemTime(new Date('2022-04-17T00:00:15.000Z'));
      trackScreenView({ name: 'About' });

      const payloads = await eventStore.getAllPayloads();
      expect(payloads.length).toBe(2);
      const [, { ue_pr }] = payloads;
      const event = JSON.parse(ue_pr as string).data;
      expect(event.schema).toBe(SCREEN_VIEW_EVENT_SCHEMA);
    });

    it('tracks scroll and list item view events', async () => {
      trackScreenView({ name: 'Home' });

      trackScrollChanged({
        yOffset: 10,
        xOffset: 0,
        viewHeight: 1000,
        viewWidth: 100,
        contentHeight: 2000,
        contentWidth: 1000,
      });

      trackListItemView({
        index: 0,
        itemsCount: 10,
      });

      trackScreenView({ name: 'About' });

      const payloads = await eventStore.getAllPayloads();
      expect(payloads.length).toBe(4);
    });
  });
});
