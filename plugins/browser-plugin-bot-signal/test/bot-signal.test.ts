import { buildLinkClick, trackerCore } from '@snowplow/tracker-core';
import { BrowserTracker } from '@snowplow/browser-tracker-core';
import { setImmediate } from 'timers';

const flushPromises = () => new Promise(setImmediate);

let mockResult: any;
let mockReject: Error | null = null;

jest.mock('bot-signal/browser', () => ({
  detectInstantClientAsync: () => (mockReject ? Promise.reject(mockReject) : Promise.resolve(mockResult)),
}));

const SCHEMA = 'iglu:com.flipto/client_side_bot_signal/jsonschema/1-0-0';

function run(expectCx: (cx: any) => void) {
  const { BotSignalPlugin } = require('../src');
  const plugin = BotSignalPlugin();
  const core = trackerCore({
    corePlugins: [plugin],
    callback: (pb) => expectCx(pb.getJson().filter((e) => e.keyIfEncoded === 'cx')[0]?.json),
  });
  plugin.activateBrowserPlugin?.({ core } as BrowserTracker);
  return core;
}

describe('BotSignalPlugin', () => {
  beforeEach(() => {
    jest.resetModules();
    mockReject = null;
    mockResult = { isLegitClient: true, suspicionScore: 0, signals: [], automation: { kind: null } };
  });

  it('attaches a bot context with the fired signals', async () => {
    mockResult = {
      isLegitClient: false,
      suspicionScore: 0.9,
      signals: [
        { id: 'webdriver', weight: 1, triggered: true },
        { id: 'plugins', weight: 0.2, triggered: false },
      ],
      automation: { kind: 'playwright' },
    };
    const core = run((cx) =>
      expect(cx.data).toEqual([
        { schema: SCHEMA, data: { bot: true, score: 0.9, kind: 'playwright', signals: ['webdriver'] } },
      ])
    );
    await flushPromises();
    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('attaches a no-bot context for a legit client', async () => {
    const core = run((cx) =>
      expect(cx.data).toEqual([{ schema: SCHEMA, data: { bot: false, score: 0, kind: null, signals: [] } }])
    );
    await flushPromises();
    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('attaches nothing while detection is pending', () => {
    const core = run((cx) => expect(cx).toBeUndefined());
    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('attaches nothing when detection rejects', async () => {
    mockReject = new Error('boom');
    const core = run((cx) => expect(cx).toBeUndefined());
    await flushPromises();
    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });
});
