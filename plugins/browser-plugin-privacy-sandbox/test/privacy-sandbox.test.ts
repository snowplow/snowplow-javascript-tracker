import { buildLinkClick, trackerCore } from '@snowplow/tracker-core';
import { JSDOM } from 'jsdom';
import { PrivacySandboxPlugin } from '../src';
import { BrowserTracker } from '@snowplow/browser-tracker-core';
import { setImmediate } from 'timers';

declare var jsdom: JSDOM;

describe('Privacy Sandbox plugin', () => {
  it('Returns values for Privacy Sandbox properties', async () => {
    const sampleTopicEntry = {
      topic: 1,
      taxonomyVersion: '1',
      version: 'chrome.1:1:1',
      modelVersion: '1',
      configurationVersion: '1',
    };

    Object.defineProperties(jsdom.window.document, {
      browsingTopics: {
        value: () => {
          return Promise.resolve([sampleTopicEntry]);
        },
        configurable: true,
      },
      featurePolicy: {
        value: {
          allowsFeature: (feature: string) => feature === 'browsing-topics',
        },
        configurable: true,
      },
    });

    const plugin = PrivacySandboxPlugin();

    const core = trackerCore({
      corePlugins: [plugin],
      callback: (payloadBuilder) => {
        const json = payloadBuilder.getJson().filter((e) => e.keyIfEncoded === 'cx');
        expect(json[0].json).toMatchSnapshot();
      },
    });

    plugin.activateBrowserPlugin?.({ core } as BrowserTracker);

    const flushPromises = () => new Promise(setImmediate);
    await flushPromises();

    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('Returns no values when feature policy "browsing-topics" is off', async () => {
    const sampleTopicEntry = {
      topic: 1,
      taxonomyVersion: '1',
      version: 'chrome.1:1:1',
      modelVersion: '1',
      configurationVersion: '1',
    };

    Object.defineProperties(jsdom.window.document, {
      browsingTopics: {
        value: () => {
          return Promise.resolve([sampleTopicEntry]);
        },
        configurable: true,
      },
      featurePolicy: {
        value: {
          allowsFeature: function (feature: string) {
            if (feature === 'browsing-topics') {
              return false;
            }
            return true;
          },
        },
        configurable: true,
      },
    });

    const plugin = PrivacySandboxPlugin();

    const core = trackerCore({
      corePlugins: [plugin],
      callback: (payloadBuilder) => {
        const json = payloadBuilder.getJson().filter((e) => e.keyIfEncoded === 'cx');
        expect(json[0]?.json).toMatchSnapshot();
      },
    });

    plugin.activateBrowserPlugin?.({ core } as BrowserTracker);

    const flushPromises = () => new Promise(setImmediate);
    await flushPromises();

    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });
});
