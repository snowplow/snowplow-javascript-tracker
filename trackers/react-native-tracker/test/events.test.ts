import { Payload } from '@snowplow/tracker-core';
import { newTracker, ReactNativeTracker } from '../src';

describe('Events', () => {
  let tracker: ReactNativeTracker;
  let payloads: Payload[];

  beforeEach(async () => {
    payloads = [];
    tracker = await newTracker({ namespace: 'test', endpoint: 'http://localhost:9090' });
    tracker.addPlugin({
      plugin: {
        filter: (payload) => {
          payloads.push(payload);
          return false;
        },
      },
    });
  });

  it('tracks a page view event', () => {
    tracker.trackPageViewEvent({
      pageUrl: 'http://localhost:9090',
      pageTitle: 'Home',
    });

    expect(payloads.length).toBe(1);
    const [payload] = payloads;
    expect(payload?.e).toBe('pv');
    expect(payload?.url).toBe('http://localhost:9090');
    expect(payload?.page).toBe('Home');
  });

  it('tracks a structured event', () => {
    tracker.trackStructuredEvent({
      category: 'category',
      action: 'action',
      label: 'label',
      property: 'property',
      value: 1,
    });

    expect(payloads.length).toBe(1);
    const [payload] = payloads;
    expect(payload?.e).toBe('se');
    expect(payload?.se_ca).toBe('category');
    expect(payload?.se_ac).toBe('action');
    expect(payload?.se_la).toBe('label');
    expect(payload?.se_pr).toBe('property');
    expect(payload?.se_va).toBe('1');
  });

  it('tracks a timing event', () => {
    tracker.trackTimingEvent({
      category: 'category',
      variable: 'variable',
      timing: 1,
      label: 'label',
    });

    expect(payloads.length).toBe(1);
    const [payload] = payloads;
    expect(payload?.e).toBe('ue');
    const { ue_pr } = payload!;
    const event = JSON.parse(ue_pr as string);
    const { schema, data } = event.data;
    expect(schema).toContain('timing');
    expect(data.category).toBe('category');
    expect(data.variable).toBe('variable');
    expect(data.timing).toBe(1);
    expect(data.label).toBe('label');
  });

  it('tracks a message notification event', () => {
    tracker.trackMessageNotificationEvent({
      action: 'a',
      category: 'c',
      trigger: 'calendar',
      body: 'b',
      title: 't',
    });

    expect(payloads.length).toBe(1);
    const [payload] = payloads;
    expect(payload?.e).toBe('ue');
    const { ue_pr } = payload!;
    const event = JSON.parse(ue_pr as string);
    const { schema, data } = event.data;
    expect(schema).toContain('message_notification');
    expect(data.action).toBe('a');
    expect(data.category).toBe('c');
    expect(data.trigger).toBe('calendar');
    expect(data.body).toBe('b');
    expect(data.title).toBe('t');
  });

  it('tracks a self-describing event', () => {
    tracker.trackSelfDescribingEvent({
      schema: 'iglu:com.acme/event/jsonschema/1-0-0',
      data: {
        field: 'value',
      },
    });

    expect(payloads.length).toBe(1);
    const [payload] = payloads;
    expect(payload?.e).toBe('ue');
    const { ue_pr } = payload!;
    const event = JSON.parse(ue_pr as string);
    const { schema, data } = event.data;
    expect(schema).toBe('iglu:com.acme/event/jsonschema/1-0-0');
    expect(data.field).toBe('value');
  });

  it('tracks context entities with events', () => {
    tracker.trackPageViewEvent(
      {
        pageUrl: 'http://localhost:9090',
      },
      [
        {
          schema: 'iglu:com.acme/page/jsonschema/1-0-0',
          data: {
            field: 'value',
          },
        },
      ]
    );

    expect(payloads.length).toBe(1);
    const [payload] = payloads;
    expect(payload?.co).toBeDefined();
    const { co } = payload!;
    const context = JSON.parse(co as string);
    const [{ schema, data }] = context.data;
    expect(schema).toBe('iglu:com.acme/page/jsonschema/1-0-0');
    expect(data.field).toBe('value');
  });
});
