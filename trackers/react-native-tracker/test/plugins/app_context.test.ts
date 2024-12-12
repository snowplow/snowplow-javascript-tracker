import { APPLICATION_CONTEXT_SCHEMA, MOBILE_APPLICATION_CONTEXT_SCHEMA } from '../../src/constants';
import { newAppContextPlugin } from '../../src/plugins/app_context';
import { buildPageView, Payload, trackerCore } from '@snowplow/tracker-core';

describe('Application context plugin', () => {
  it('attaches mobile application context to events if both version and build passed', async () => {
    const appContext = await newAppContextPlugin({
      appBuild: '19',
      appVersion: '1.0.1',
    });

    const payloads: Payload[] = [];
    const tracker = trackerCore({
      corePlugins: [appContext.plugin],
      callback: (pb) => payloads.push(pb.build()),
      base64: false,
    });

    tracker.track(buildPageView({ pageUrl: 'http://localhost' }));

    expect(payloads.length).toBe(1);
    expect(JSON.parse(payloads[0]?.co as string).data).toEqual([
      {
        schema: MOBILE_APPLICATION_CONTEXT_SCHEMA,
        data: {
          version: '1.0.1',
          build: '19',
        },
      },
    ]);
  });

  it('attaches application context to events if only version passed', async () => {
    const appContext = await newAppContextPlugin({
      appVersion: '1.0.1',
    });

    const payloads: Payload[] = [];
    const tracker = trackerCore({
      corePlugins: [appContext.plugin],
      callback: (pb) => payloads.push(pb.build()),
      base64: false,
    });

    tracker.track(buildPageView({ pageUrl: 'http://localhost' }));

    expect(payloads.length).toBe(1);
    expect(JSON.parse(payloads[0]?.co as string).data).toEqual([
      {
        schema: APPLICATION_CONTEXT_SCHEMA,
        data: {
          version: '1.0.1',
        },
      },
    ]);
  });

  it('doesnt attach any application context to events if version not passed', async () => {
    const appContext = await newAppContextPlugin({
      appBuild: '19',
    });

    const payloads: Payload[] = [];
    const tracker = trackerCore({
      corePlugins: [appContext.plugin],
      callback: (pb) => payloads.push(pb.build()),
      base64: false,
    });

    tracker.track(buildPageView({ pageUrl: 'http://localhost' }));

    expect(payloads.length).toBe(1);
    expect((payloads[0]?.co as string) ?? '').not.toContain(MOBILE_APPLICATION_CONTEXT_SCHEMA);
    expect((payloads[0]?.co as string) ?? '').not.toContain(APPLICATION_CONTEXT_SCHEMA);
  });
});
