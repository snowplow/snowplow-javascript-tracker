import { JSDOM } from 'jsdom';
import { trackerCore } from '@snowplow/tracker-core';
import { WebVitalsPlugin } from '../src';
import { BrowserTracker } from '@snowplow/browser-tracker-core';

declare var jsdom: JSDOM;

jsdom.window.webVitals = {};

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
});
