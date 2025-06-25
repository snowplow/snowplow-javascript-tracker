import { buildPageView, Payload, trackerCore } from '@snowplow/tracker-core';
import { newPlatformContextPlugin } from '../../src/plugins/platform_context';
import { NativeModules } from 'react-native';
import { MOBILE_CONTEXT_SCHEMA } from '../../src/constants';
import { Dimensions } from 'react-native';

describe('PlatformContextPlugin on iOS', () => {
  beforeAll(() => {
    jest.mock('react-native/Libraries/Utilities/Platform', () => ({
      OS: 'ios',
      Version: '18.0',
      constants: {
        forceTouchAvailable: false,
        interfaceIdiom: 'phone',
        isMacCatalyst: false,
        isTesting: false,
        osVersion: '18.0',
        systemName: 'iOS',
      },
      isMacCatalyst: false,
      isPad: false,
      isTV: false,
      isVision: false,
      select: () => null,
    }));
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 123.4567,
      height: 89.1234,
      scale: 0,
      fontScale: 0,
    });
    NativeModules.SettingsManager = {
      settings: {
        AppleLanguages: ['en-GB'],
      },
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
    expect(payload?.co).toContain('"iOS"');
    expect(payload?.co).toContain('"18.0"');
    expect(payload?.co).toContain('"en-GB"');
    expect(payload?.co).toContain('"123x89"');
  });

  it('does not add platform context to events if disabled', async () => {
    const sessionPlugin = await newPlatformContextPlugin({ platformContext: false });

    const payloads: Payload[] = [];
    const tracker = trackerCore({
      corePlugins: [sessionPlugin.plugin],
      callback: (pb) => payloads.push(pb.build()),
      base64: false,
    });
    tracker.track(buildPageView({ pageUrl: 'http://localhost' }));

    expect(payloads.length).toBe(1);
    const [payload] = payloads;
    expect(payload?.co ?? '').not.toContain(MOBILE_CONTEXT_SCHEMA);
  });

  it('skips properties not enabled', async () => {
    const sessionPlugin = await newPlatformContextPlugin({ platformContextProperties: [] });

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
    expect(payload?.co).toContain('"iOS"');
    expect(payload?.co).not.toContain('"en-GB"');
  });

  it('overrides properties using the retriever', async () => {
    const sessionPlugin = await newPlatformContextPlugin({
      platformContextRetriever: {
        getOsType: () => Promise.resolve('Android'),
        getOsVersion: () => Promise.resolve('11.0'),
        getDeviceModel: () => Promise.resolve('Galaxy S21'),
        getDeviceManufacturer: () => Promise.resolve('Samsung'),
        getCarrier: () => Promise.resolve('Vodafone'),
        getNetworkType: () => Promise.resolve('wifi'),
        getNetworkTechnology: () => Promise.resolve('5G'),
        getAppleIdfa: () => Promise.resolve('my-idfa'),
        getAppleIdfv: () => Promise.resolve('my-idfv'),
        getAvailableStorage: () => Promise.resolve(1000000000),
        getTotalStorage: () => Promise.resolve(2000000000),
        getPhysicalMemory: () => Promise.resolve(8000000000),
        getAppAvailableMemory: () => Promise.resolve(2000000000),
        getBatteryLevel: () => Promise.resolve(50),
        getBatteryState: () => Promise.resolve('full'),
        getLowPowerMode: () => Promise.resolve(false),
        isPortrait: () => Promise.resolve(true),
        getResolution: () => Promise.resolve('1920x1080'),
        getScale: () => Promise.resolve(2),
        getLanguage: () => Promise.resolve('en-US'),
        getAndroidIdfa: () => Promise.resolve('my-android-idfa'),
        getSystemAvailableMemory: () => Promise.resolve(2000000000),
        getAppSetId: () => Promise.resolve('my-app-set'),
        getAppSetIdScope: () => Promise.resolve('my-app-set-scope'),
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
    expect(mobileContext).toBeDefined();
    expect(mobileContext.data).toMatchObject({
      osType: 'Android',
      osVersion: '11.0',
      deviceModel: 'Galaxy S21',
      deviceManufacturer: 'Samsung',
      carrier: 'Vodafone',
      networkType: 'wifi',
      networkTechnology: '5G',
      appleIdfa: 'my-idfa',
      appleIdfv: 'my-idfv',
      availableStorage: 1000000000,
      totalStorage: 2000000000,
      physicalMemory: 8000000000,
      appAvailableMemory: 2000000000,
      batteryLevel: 50,
      batteryState: 'full',
      lowPowerMode: false,
      isPortrait: true,
      resolution: '1920x1080',
      scale: 2,
      language: 'en-US',
      androidIdfa: 'my-android-idfa',
      systemAvailableMemory: 2000000000,
      appSetId: 'my-app-set',
      appSetIdScope: 'my-app-set-scope',
    });
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
