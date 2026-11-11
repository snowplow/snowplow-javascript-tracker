import { JSDOM } from 'jsdom';
import { trackerCore } from '@snowplow/tracker-core';
import { WebVitalsPlugin } from '../src';
import { BrowserTracker } from '@snowplow/browser-tracker-core';

declare var jsdom: JSDOM;

jsdom.window.webVitals = {};

const WEB_VITALS_SOURCE = 'https://unpkg.com/web-vitals@4.2.4/dist/web-vitals.iife.js';
const WEB_VITALS_INTEGRITY = 'sha384-mfknU/5RXdvBJDftA9q3VBj6BImlZ7kqzvO30nq+H3CQLXcV7d+MaWniRPhLaT4h';

describe('Web Vitals plugin', () => {
  function webVitalsCallback(callback: any) {
    callback({
      value: 0.01,
      navigationType: 'navigation',
    });
    return;
  }
  it('Returns values for Web Vitals properties', (done) => {
    Object.defineProperty(jsdom.window, 'PerformanceObserver', { value: jest.fn() });
    Object.defineProperty(jsdom.window.webVitals, 'onCLS', {
      value: webVitalsCallback,
    });
    Object.defineProperty(jsdom.window.webVitals, 'onLCP', {
      value: webVitalsCallback,
    });
    Object.defineProperty(jsdom.window.webVitals, 'onFCP', {
      value: webVitalsCallback,
    });
    Object.defineProperty(jsdom.window.webVitals, 'onFID', {
      value: webVitalsCallback,
    });
    Object.defineProperty(jsdom.window.webVitals, 'onINP', {
      value: webVitalsCallback,
    });
    Object.defineProperty(jsdom.window.webVitals, 'onTTFB', {
      value: webVitalsCallback,
    });

    const core = trackerCore({
      corePlugins: [],
      callback: (payloadBuilder) => {
        const [data, ...context] = payloadBuilder.getJson();
        expect(data.json.data).toMatchSnapshot();
        expect(context.map(({ json }) => json)).toMatchSnapshot('context');
        done();
      },
    });

    WebVitalsPlugin({
      loadWebVitalsScript: false,
      context: [{ schema: 'iglu:com.example/test/jsonschema/1-0-0', data: { ok: true } }],
    }).activateBrowserPlugin?.({ core } as BrowserTracker);
    const pagehideEvent = new PageTransitionEvent('pagehide');
    jsdom.window.dispatchEvent(pagehideEvent);
  });

  it('Defaults to an exact pinned version of the Web Vitals script, not a major-only range', () => {
    expect(WEB_VITALS_SOURCE).toMatch(/^https:\/\/unpkg\.com\/web-vitals@\d+\.\d+\.\d+\/dist\/web-vitals\.iife\.js$/);
  });

  it('Sets integrity and crossorigin attributes when loading the default Web Vitals source', () => {
    const core = trackerCore({ corePlugins: [] });

    WebVitalsPlugin({ loadWebVitalsScript: true }).activateBrowserPlugin?.({ core } as BrowserTracker);

    const script = document.head.querySelector(`script[src="${WEB_VITALS_SOURCE}"]`);
    expect(script?.getAttribute('integrity')).toBe(WEB_VITALS_INTEGRITY);
    expect(script?.getAttribute('crossorigin')).toBe('anonymous');
  });

  it('Does not set integrity or crossorigin attributes for a custom Web Vitals source', () => {
    const core = trackerCore({ corePlugins: [] });
    const customSource = 'https://example.com/custom-web-vitals.js';

    WebVitalsPlugin({ loadWebVitalsScript: true, webVitalsSource: customSource }).activateBrowserPlugin?.({
      core,
    } as BrowserTracker);

    const script = document.head.querySelector(`script[src="${customSource}"]`);
    expect(script?.hasAttribute('integrity')).toBe(false);
    expect(script?.hasAttribute('crossorigin')).toBe(false);
  });
});
