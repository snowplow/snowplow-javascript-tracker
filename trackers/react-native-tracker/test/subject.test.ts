import { CorePluginConfiguration, Payload } from '@snowplow/tracker-core';
import { newTracker, ReactNativeTracker } from '../src';

describe('Subject', () => {
  let tracker: ReactNativeTracker;
  let payloads: Payload[];
  const plugin: CorePluginConfiguration = {
    plugin: {
      filter: (payload) => {
        payloads.push(payload);
        return false;
      },
    },
  };

  beforeEach(() => {
    payloads = [];
  });

  describe('Subject configuration', () => {
    beforeEach(async () => {
      tracker = await newTracker({
        namespace: 'test',
        endpoint: 'http://localhost:9090',
        userId: 'user-id',
        networkUserId: 'network-user-id',
        domainUserId: 'domain-user-id',
        useragent: 'user-agent',
        ipAddress: 'ip-address',
        timezone: 'timezone',
        language: 'sk',
        screenResolution: [1920, 1080],
        colorDepth: 24,
        screenViewport: [1200, 800],
      });
      tracker.addPlugin(plugin);
    });

    it('adds the subject props from configuration', async () => {
      tracker.trackPageViewEvent({ pageUrl: 'http://localhost:9090', pageTitle: 'Home' });

      expect(payloads.length).toBe(1);
      const [payload] = payloads;
      expect(payload?.uid).toBe('user-id');
      expect(payload?.nuid).toBe('network-user-id');
      expect(payload?.duid).toBe('domain-user-id');
      expect(payload?.ua).toBe('user-agent');
      expect(payload?.ip).toBe('ip-address');
      expect(payload?.tz).toBe('timezone');
      expect(payload?.lang).toBe('sk');
      expect(payload?.res).toBe('1920x1080');
      expect(payload?.cd).toBe('24');
      expect(payload?.vp).toBe('1200x800');
    });
  });

  describe('Subject methods', () => {
    beforeEach(async () => {
      tracker = await newTracker({ namespace: 'test', endpoint: 'http://localhost:9090' });
      tracker.addPlugin(plugin);
    });

    it('sets the user id', () => {
      tracker.setUserId('user-id');
      tracker.trackPageViewEvent({ pageUrl: 'http://localhost:9090', pageTitle: 'Home' });

      expect(payloads.length).toBe(1);
      const [payload] = payloads;
      expect(payload?.uid).toBe('user-id');
    });

    it('sets the network user id', () => {
      tracker.setNetworkUserId('network-user-id');
      tracker.trackPageViewEvent({ pageUrl: 'http://localhost:9090', pageTitle: 'Home' });

      expect(payloads.length).toBe(1);
      const [payload] = payloads;
      expect(payload?.nuid).toBe('network-user-id');
    });

    it('sets the domain user id', () => {
      tracker.setDomainUserId('domain-user-id');
      tracker.trackPageViewEvent({ pageUrl: 'http://localhost:9090', pageTitle: 'Home' });

      expect(payloads.length).toBe(1);
      const [payload] = payloads;
      expect(payload?.duid).toBe('domain-user-id');
    });

    it('sets the screen resolution', () => {
      tracker.setScreenResolution([1920, 1080]);
      tracker.trackPageViewEvent({ pageUrl: 'http://localhost:9090', pageTitle: 'Home' });

      expect(payloads.length).toBe(1);
      const [payload] = payloads;
      expect(payload?.res).toBe('1920x1080');
    });

    it('sets the color depth', () => {
      tracker.setColorDepth(24);
      tracker.trackPageViewEvent({ pageUrl: 'http://localhost:9090', pageTitle: 'Home' });

      expect(payloads.length).toBe(1);
      const [payload] = payloads;
      expect(payload?.cd).toBe('24');
    });

    it('sets the screen viewport', () => {
      tracker.setScreenViewport([1200, 800]);
      tracker.trackPageViewEvent({ pageUrl: 'http://localhost:9090', pageTitle: 'Home' });

      expect(payloads.length).toBe(1);
      const [payload] = payloads;
      expect(payload?.vp).toBe('1200x800');
    });

    it('sets the subject data', () => {
      tracker.setSubjectData({
        networkUserId: 'network-user-id',
        domainUserId: 'domain-user-id',
        userId: 'user-id',
        useragent: 'user-agent',
        ipAddress: 'ip-address',
        timezone: 'timezone',
      });
      tracker.trackPageViewEvent({ pageUrl: 'http://localhost:9090', pageTitle: 'Home' });

      expect(payloads.length).toBe(1);
      const [payload] = payloads;
      expect(payload?.nuid).toBe('network-user-id');
      expect(payload?.duid).toBe('domain-user-id');
      expect(payload?.uid).toBe('user-id');
      expect(payload?.ua).toBe('user-agent');
      expect(payload?.ip).toBe('ip-address');
      expect(payload?.tz).toBe('timezone');
    });
  });
});
