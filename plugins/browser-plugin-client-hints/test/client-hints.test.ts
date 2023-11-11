import { buildLinkClick, trackerCore } from '@snowplow/tracker-core';
import { BrowserTracker } from '@snowplow/browser-tracker-core';
import { JSDOM } from 'jsdom';
import { setImmediate } from 'timers';
import { ClientHintsPlugin } from '../src';

declare var jsdom: JSDOM;

describe('Client Hints plugin', () => {
  const ctxSchema = 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0';
  const hintsSchema = 'iglu:org.ietf/http_client_hints/jsonschema/1-0-0';

  it('Attaches no context on undefined userAgentData', (done) => {
    const plugin = ClientHintsPlugin(false);
    const core = trackerCore({
      corePlugins: [plugin],
      callback: (payloadBuilder) => {
        const json = payloadBuilder.getJson().filter((e) => e.keyIfEncoded === 'cx');
        expect(json.length).toBe(0);
        done();
      },
    });

    plugin.activateBrowserPlugin?.({ core } as BrowserTracker);
    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('Attaches no context on invalid userAgentData(no mobile)', (done) => {
    const sampleUserAgentData = {
      brands: [
        {
          brand: 'Opera GX',
          version: '98',
        },
      ],
    } as any;

    Object.defineProperty(jsdom.window.navigator, 'userAgentData', {
      value: sampleUserAgentData,
      configurable: true,
    });

    const plugin = ClientHintsPlugin(false);
    const core = trackerCore({
      corePlugins: [plugin],
      callback: (payloadBuilder) => {
        const json = payloadBuilder.getJson().filter((e) => e.keyIfEncoded === 'cx');
        expect(json.length).toBe(0);
        done();
      },
    });

    plugin.activateBrowserPlugin?.({ core } as BrowserTracker);
    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('Attaches no context on invalid userAgentData(no brands)', (done) => {
    const sampleUserAgentData = {
      mobile: true,
    } as any;

    Object.defineProperty(jsdom.window.navigator, 'userAgentData', {
      value: sampleUserAgentData,
      configurable: true,
    });

    const plugin = ClientHintsPlugin(false);
    const core = trackerCore({
      corePlugins: [plugin],
      callback: (payloadBuilder) => {
        const json = payloadBuilder.getJson().filter((e) => e.keyIfEncoded === 'cx');
        expect(json.length).toBe(0);
        done();
      },
    });

    plugin.activateBrowserPlugin?.({ core } as BrowserTracker);
    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('Attaches no context on invalid userAgentData(no valid brands)', (done) => {
    const sampleUserAgentData = {
      mobile: false,
      brands: [
        {
          brand: 'Opera GX',
          version: 98,
        },
      ],
    } as any;

    Object.defineProperty(jsdom.window.navigator, 'userAgentData', {
      value: sampleUserAgentData,
      configurable: true,
    });

    const plugin = ClientHintsPlugin(true);
    const core = trackerCore({
      corePlugins: [plugin],
      callback: (payloadBuilder) => {
        const json = payloadBuilder.getJson().filter((e) => e.keyIfEncoded === 'cx');
        expect(json.length).toBe(0);
        done();
      },
    });

    plugin.activateBrowserPlugin?.({ core } as BrowserTracker);
    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('Attaches context on valid userAgentData properties', async () => {
    const highEntropyVals = {
      platform: 'PhoneOS',
      platformVersion: '10A',
      architecture: 'arm',
      model: 'X633GTM',
      uaFullVersion: '73.32.AGX.5',
    };
    const sampleUserAgentData = {
      brands: [
        {
          brand: 'Chromium',
          version: '119',
        },
        {
          brand: 'Not?A_Brand',
          version: '24',
        },
      ],
      mobile: false,
      getHighEntropyValues: (_: any) => Promise.resolve(highEntropyVals),
    };

    const expected = {
      schema: ctxSchema,
      data: [
        {
          schema: hintsSchema,
          data: Object.assign(
            {
              isMobile: false,
              brands: sampleUserAgentData.brands,
            },
            highEntropyVals
          ),
        },
      ],
    };

    Object.defineProperty(jsdom.window.navigator, 'userAgentData', {
      value: sampleUserAgentData,
      configurable: true,
    });

    const plugin = ClientHintsPlugin(true);
    const core = trackerCore({
      corePlugins: [plugin],
      callback: (payloadBuilder) => {
        const json = payloadBuilder.getJson().filter((e) => e.keyIfEncoded === 'cx');

        expect(json[0].json).toMatchObject(expected);
      },
    });

    plugin.activateBrowserPlugin?.({ core } as BrowserTracker);
    const flushPromises = () => Promise.resolve(setImmediate);
    await flushPromises();
    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });
});
