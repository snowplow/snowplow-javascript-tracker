import { buildPageView, Payload, trackerCore } from '@snowplow/tracker-core';
import { newPlatformContextPlugin } from '../../src/plugins/platform_context';
import { MOBILE_CONTEXT_SCHEMA } from '../../src/constants';
import { NativeModules } from 'react-native';
import { Dimensions } from 'react-native';

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
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 123.4567,
      height: 89.1234,
      scale: 0,
      fontScale: 0,
    });
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
    expect(payload?.co).toContain('"13"');
    expect(payload?.co).toContain('"sdk_gphone64_arm64"');
    expect(payload?.co).toContain('"Google"');
    expect(payload?.co).toContain('"Google"');
    expect(payload?.co).toContain('"en-GB"');
    expect(payload?.co).toContain('"123x89"');
  });

  it('truncates language to 8 characters', async () => {
    const sessionPlugin = await newPlatformContextPlugin({
      platformContextRetriever: {
        getLanguage: () => Promise.resolve('1234567890'),
      },
    });

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
    const entities = JSON.parse(payload?.co as string).data;
    const mobileContext = entities.find((entity: any) => entity.schema === MOBILE_CONTEXT_SCHEMA);
    expect(mobileContext?.data.language).toBe('12345678');
  });
});
