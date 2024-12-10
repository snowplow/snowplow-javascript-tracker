import {
  DEEP_LINK_ENTITY_SCHEMA,
  DEEP_LINK_RECEIVED_EVENT_SCHEMA,
  SCREEN_VIEW_EVENT_SCHEMA,
} from '../../src/constants';
import { newDeepLinksPlugin } from '../../src/plugins/deep_links';
import { buildSelfDescribingEvent, Payload, trackerCore } from '@snowplow/tracker-core';

describe('Deep Link plugin', () => {
  it('adds the url and refr properties on the deep link event', () => {
    const payloads: Payload[] = [];
    const tracker = trackerCore({
      callback: (pb) => payloads.push(pb.build()),
      base64: false,
    });
    const deepLinksPlugin = newDeepLinksPlugin({}, tracker);
    tracker.addPlugin(deepLinksPlugin);

    deepLinksPlugin.trackDeepLinkReceivedEvent({
      url: 'http://url.com',
      referrer: 'http://referrer.com',
    });

    expect(payloads.length).toBe(1);
    const [{ url, refr, ue_pr }] = payloads as any;
    expect(url).toBe('http://url.com');
    expect(refr).toBe('http://referrer.com');

    const { data } = JSON.parse(ue_pr);
    expect(data.schema).toBe(DEEP_LINK_RECEIVED_EVENT_SCHEMA);
    expect(data.data.url).toBe('http://url.com');
    expect(data.data.referrer).toBe('http://referrer.com');
  });

  it('adds the deep link context to the first screen view event', () => {
    const payloads: Payload[] = [];
    const tracker = trackerCore({
      callback: (pb) => payloads.push(pb.build()),
      base64: false,
    });
    const deepLinksPlugin = newDeepLinksPlugin({}, tracker);
    tracker.addPlugin(deepLinksPlugin);

    deepLinksPlugin.trackDeepLinkReceivedEvent({
      url: 'http://url.com',
      referrer: 'http://referrer.com',
    });
    tracker.track(
      buildSelfDescribingEvent({
        event: {
          schema: SCREEN_VIEW_EVENT_SCHEMA,
          data: {},
        },
      })
    );
    tracker.track(
      buildSelfDescribingEvent({
        event: {
          schema: SCREEN_VIEW_EVENT_SCHEMA,
          data: {},
        },
      })
    );

    expect(payloads.length).toBe(3);
    const [, { url, refr, co }, { co: co2 }] = payloads as any;
    expect(url).toBe('http://url.com');
    expect(refr).toBe('http://referrer.com');
    expect(co).not.toBeUndefined();
    const entities = JSON.parse(co).data;
    const deepLinkEntity = entities.find((entity: any) => entity.schema === DEEP_LINK_ENTITY_SCHEMA);
    expect(deepLinkEntity).not.toBeUndefined();
    expect(deepLinkEntity.data.url).toBe('http://url.com');
    expect(deepLinkEntity.data.referrer).toBe('http://referrer.com');

    expect(co2 ?? '').not.toContain(DEEP_LINK_ENTITY_SCHEMA);
  });

  it('does not add the deep link entity if disabled', () => {
    const payloads: Payload[] = [];
    const tracker = trackerCore({
      callback: (pb) => payloads.push(pb.build()),
      base64: false,
    });
    const deepLinksPlugin = newDeepLinksPlugin({ deepLinkContext: false }, tracker);
    tracker.addPlugin(deepLinksPlugin);

    deepLinksPlugin.trackDeepLinkReceivedEvent({
      url: 'http://url.com',
      referrer: 'http://referrer.com',
    });
    tracker.track(
      buildSelfDescribingEvent({
        event: {
          schema: SCREEN_VIEW_EVENT_SCHEMA,
          data: {},
        },
      })
    );

    expect(payloads.length).toBe(2);
    const [, { url, refr, co }] = payloads as any;
    expect(url).toBe('http://url.com');
    expect(refr).toBe('http://referrer.com');
    expect(co ?? '').not.toContain(DEEP_LINK_ENTITY_SCHEMA);
  });
});
