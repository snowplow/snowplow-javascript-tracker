import { buildPageView, Payload, trackerCore } from '@snowplow/tracker-core';
import { newPlatformContextPlugin } from '../../src/plugins/platform_context';
import { MOBILE_CONTEXT_SCHEMA } from '../../src/constants';
import { NativeModules } from 'react-native';

describe('PlatformContextPlugin on Android', () => {
  beforeAll(() => {
    jest.mock('react-native/Libraries/Utilities/Platform', () => ({
      OS: 'android',
      Version: 33,
      constants: {
        Brand: 'google',
        Manufacturer: 'Google',
        Model: 'sdk_gphone64_arm64',
        Release: '13',
        Version: 33,
      },
      select: () => null,
    }));
    NativeModules.I18nManager = {
      localeIdentifier: 'en-GB',
    };
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('adds platform context to events', async () => {
    const sessionPlugin = await newPlatformContextPlugin();

    const payloads: Payload[] = [];
    const tracker = trackerCore({
      corePlugins: [sessionPlugin.plugin],
      callback: (pb) => payloads.push(pb.build()),
      base64: false,
    });
    tracker.track(buildPageView({ pageUrl: 'http://localhost' }));

    expect(payloads.length).toBe(1);
    const [payload] = payloads;
    expect(payload?.co).toBeDefined();
    expect(payload?.co).toContain(MOBILE_CONTEXT_SCHEMA);
    expect(payload?.co).toContain('"33"');
    expect(payload?.co).toContain('"sdk_gphone64_arm64"');
    expect(payload?.co).toContain('"Google"');
    expect(payload?.co).toContain('"Google"');
    expect(payload?.co).toContain('"en-GB"');
  });
});
