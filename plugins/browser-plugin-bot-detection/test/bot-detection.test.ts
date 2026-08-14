import { buildLinkClick, trackerCore } from '@snowplow/tracker-core';
import { BrowserTracker } from '@snowplow/browser-tracker-core';
import { setImmediate } from 'timers';

const flushPromises = () => new Promise(setImmediate);

let mockDetectResult: any = { bot: false };
let mockCollectReject: Error | null = null;
let mockDetectThrow: Error | null = null;

jest.mock('@fingerprintjs/botd', () => ({
  ...jest.requireActual('@fingerprintjs/botd'),
  collect: () => {
    if (mockCollectReject) {
      return Promise.reject(mockCollectReject);
    }
    return Promise.resolve({});
  },
  detect: () => {
    if (mockDetectThrow) {
      throw mockDetectThrow;
    }
    return [{}, mockDetectResult];
  },
}));

describe('BotDetectionPlugin', () => {
  beforeEach(() => {
    jest.resetModules();
    mockDetectResult = { bot: false };
    mockCollectReject = null;
    mockDetectThrow = null;
  });

  it('attaches bot context when a bot is detected', async () => {
    mockDetectResult = { bot: true, botKind: 'selenium' };

    const { BotDetectionPlugin } = require('../src');
    const plugin = BotDetectionPlugin();

    const core = trackerCore({
      corePlugins: [plugin],
      callback: (payloadBuilder) => {
        const json = payloadBuilder.getJson().filter((e) => e.keyIfEncoded === 'cx');
        const contexts = json[0]?.json;
        expect(contexts).toEqual({
          schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
          data: [
            {
              schema: 'iglu:com.snowplowanalytics.snowplow/client_side_bot_detection/jsonschema/1-0-0',
              data: { bot: true, kind: 'selenium' },
            },
          ],
        });
      },
    });

    plugin.activateBrowserPlugin?.({ core } as BrowserTracker);
    await flushPromises();

    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('attaches no-bot context when no bot is detected', async () => {
    mockDetectResult = { bot: false };

    const { BotDetectionPlugin } = require('../src');
    const plugin = BotDetectionPlugin();

    const core = trackerCore({
      corePlugins: [plugin],
      callback: (payloadBuilder) => {
        const json = payloadBuilder.getJson().filter((e) => e.keyIfEncoded === 'cx');
        const contexts = json[0]?.json;
        expect(contexts).toEqual({
          schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
          data: [
            {
              schema: 'iglu:com.snowplowanalytics.snowplow/client_side_bot_detection/jsonschema/1-0-0',
              data: { bot: false, kind: null },
            },
          ],
        });
      },
    });

    plugin.activateBrowserPlugin?.({ core } as BrowserTracker);
    await flushPromises();

    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('returns empty contexts while detection is pending', () => {
    const { BotDetectionPlugin } = require('../src');
    const plugin = BotDetectionPlugin();

    const core = trackerCore({
      corePlugins: [plugin],
      callback: (payloadBuilder) => {
        const json = payloadBuilder.getJson().filter((e) => e.keyIfEncoded === 'cx');
        expect(json).toHaveLength(0);
      },
    });

    plugin.activateBrowserPlugin?.({ core } as BrowserTracker);
    // Do NOT await — detection is still pending
    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('returns empty contexts when collect() fails', async () => {
    mockCollectReject = new Error('collect failed');

    const { BotDetectionPlugin } = require('../src');
    const plugin = BotDetectionPlugin();

    const core = trackerCore({
      corePlugins: [plugin],
      callback: (payloadBuilder) => {
        const json = payloadBuilder.getJson().filter((e) => e.keyIfEncoded === 'cx');
        expect(json).toHaveLength(0);
      },
    });

    plugin.activateBrowserPlugin?.({ core } as BrowserTracker);
    await flushPromises();

    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('returns empty contexts when detect() fails', async () => {
    mockDetectThrow = new Error('detect failed');

    const { BotDetectionPlugin } = require('../src');
    const plugin = BotDetectionPlugin();

    const core = trackerCore({
      corePlugins: [plugin],
      callback: (payloadBuilder) => {
        const json = payloadBuilder.getJson().filter((e) => e.keyIfEncoded === 'cx');
        expect(json).toHaveLength(0);
      },
    });

    plugin.activateBrowserPlugin?.({ core } as BrowserTracker);
    await flushPromises();

    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });
});
