import { BROWSER_CONTEXT_SCHEMA } from '../../src/tracker/schemata';
import { createTracker } from '../helpers';

const UUID_REGEX = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

describe('Browser context:', () => {
  let navigatorSpy: jest.SpyInstance;

  // JSDOM values observed are based on:
  // https://github.com/jsdom/jsdom/blob/04f6c13f4a4d387c7fc979b8f62c6f68d8a0c639/lib/jsdom/living/window/Screen-impl.js
  // https://github.com/jsdom/jsdom/blob/a5204dfb3853120c0460dd0ad89237acfaf650ca/lib/jsdom/browser/Window.js
  // https://github.com/jsdom/jsdom/tree/04f6c13f4a4d387c7fc979b8f62c6f68d8a0c639/lib/jsdom/living/navigator
  beforeEach(() => {
    // We mock the hardwareConcurrency explicitly as it may vary between test environments
    navigatorSpy = jest.spyOn(window.navigator, 'hardwareConcurrency', 'get');
    navigatorSpy.mockReturnValue(1);
  });

  afterEach(() => {
    navigatorSpy.mockRestore();
  });

  it('Adds the browser context entity when `contexts: { browser: true }` is passed', (done) => {
    const tracker = createTracker({
      encodeBase64: false,
      contexts: { browser: true },
      plugins: [
        {
          afterTrack: (payload) => {
            const { data: payloadData } = JSON.parse(payload.co as string);
            const browserContext = payloadData.find((context: any) => context.schema.match(BROWSER_CONTEXT_SCHEMA));
            expect(browserContext).toBeTruthy();
            expect(browserContext.data.tabId).toMatch(UUID_REGEX);
            // We remove tabId before the snapshot to make it more straightforward
            delete browserContext.data.tabId;
            expect(browserContext.data).toMatchSnapshot();
            done();
          },
        },
      ],
    });

    tracker?.trackPageView();
  });

  it('Does not send the browser context entity by default', (done) => {
    const tracker = createTracker({
      encodeBase64: false,
      plugins: [
        {
          afterTrack: (payload) => {
            const { data: payloadData } = JSON.parse(payload.co as string);
            const browserContext = payloadData.find((context: any) => context.schema.match(BROWSER_CONTEXT_SCHEMA));
            expect(browserContext).toBeUndefined();
            done();
          },
        },
      ],
    });

    tracker?.trackPageView();
  });
});
