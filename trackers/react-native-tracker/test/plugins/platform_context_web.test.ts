import { buildPageView, Payload, trackerCore } from '@snowplow/tracker-core';
import { newPlatformContextPlugin } from '../../src/plugins/platform_context';
import { MOBILE_CONTEXT_SCHEMA } from '../../src/constants';
import { Platform } from 'react-native';

describe('PlatformContextPlugin on web', () => {
  let originalPlatformOS: string;

  beforeAll(() => {
    originalPlatformOS = Platform.OS;
    (Platform as any).OS = 'web';
  });

  afterAll(() => {
    (Platform as any).OS = originalPlatformOS;
  });

  it('returns no platform context entity when Platform.OS is web', async () => {
    const plugin = await newPlatformContextPlugin();

    const payloads: Payload[] = [];
    const tracker = trackerCore({
      corePlugins: [plugin.plugin],
      callback: (pb) => payloads.push(pb.build()),
      base64: false,
    });
    tracker.track(buildPageView({ pageUrl: 'http://localhost' }));

    expect(payloads.length).toBe(1);
    const [payload] = payloads;
    expect(payload?.co ?? '').not.toContain(MOBILE_CONTEXT_SCHEMA);
  });

  it('returns no platform context entity even after enablePlatformContext when Platform.OS is web', async () => {
    const plugin = await newPlatformContextPlugin({ platformContext: false });
    await plugin.enablePlatformContext();

    const payloads: Payload[] = [];
    const tracker = trackerCore({
      corePlugins: [plugin.plugin],
      callback: (pb) => payloads.push(pb.build()),
      base64: false,
    });
    tracker.track(buildPageView({ pageUrl: 'http://localhost' }));

    expect(payloads.length).toBe(1);
    const [payload] = payloads;
    expect(payload?.co ?? '').not.toContain(MOBILE_CONTEXT_SCHEMA);
  });

  it('returns no platform context entity after refreshPlatformContext when Platform.OS is web', async () => {
    const plugin = await newPlatformContextPlugin();
    await plugin.refreshPlatformContext();

    const payloads: Payload[] = [];
    const tracker = trackerCore({
      corePlugins: [plugin.plugin],
      callback: (pb) => payloads.push(pb.build()),
      base64: false,
    });
    tracker.track(buildPageView({ pageUrl: 'http://localhost' }));

    expect(payloads.length).toBe(1);
    const [payload] = payloads;
    expect(payload?.co ?? '').not.toContain(MOBILE_CONTEXT_SCHEMA);
  });
});
