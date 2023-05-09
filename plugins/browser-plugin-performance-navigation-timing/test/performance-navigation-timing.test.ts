import { buildLinkClick, trackerCore } from '@snowplow/tracker-core';
import { JSDOM } from 'jsdom';
import { PerformanceNavigationTimingPlugin } from '../src';

declare var jsdom: JSDOM;

describe('Performance Navigation Timing plugin', () => {
  it('Returns values for Performance Navigation Timing properties', (done) => {
    const sampleNavigationTimingEntry = {
      name: 'https://web.dev/navigation-and-resource-timing/#wrapping-up',
      entryType: 'navigation',
      startTime: 0,
      duration: 1803.8000001907349,
      initiatorType: 'navigation',
      deliveryType: 'cache',
      nextHopProtocol: 'h2',
      renderBlockingStatus: 'blocking',
      workerStart: 1,
      redirectStart: 1,
      redirectEnd: 1,
      fetchStart: 18.200000286102295,
      domainLookupStart: 25.90000009536743,
      domainLookupEnd: 79,
      connectStart: 79,
      secureConnectionStart: 101.90000009536743,
      connectEnd: 236.09999990463257,
      requestStart: 236.09999990463257,
      responseStart: 376.7000002861023,
      responseEnd: 401.7000002861023,
      transferSize: 11773,
      encodedBodySize: 11473,
      decodedBodySize: 59833,
      responseStatus: 1,
      serverTiming: [
        {
          description: 'test',
          duration: 1900,
          name: 'ttfb_estimate',
        },
      ],
      unloadEventStart: 1,
      unloadEventEnd: 1,
      domInteractive: 1077.5,
      domContentLoadedEventStart: 1077.5999999046326,
      domContentLoadedEventEnd: 1078.2000002861023,
      domComplete: 1802.2000002861023,
      loadEventStart: 1803.7000002861023,
      loadEventEnd: 1803.8000001907349,
      type: 'reload',
      redirectCount: 1,
      activationStart: 203.8,
    };

    Object.defineProperty(jsdom.window.performance, 'getEntriesByType', {
      value: (entryType: string) => {
        if (entryType === 'navigation') {
          return [sampleNavigationTimingEntry];
        }
        return [];
      },
      configurable: true,
    });

    const core = trackerCore({
      corePlugins: [PerformanceNavigationTimingPlugin()],
      callback: (payloadBuilder) => {
        const json = payloadBuilder.getJson().filter((e) => e.keyIfEncoded === 'cx');
        expect(json[0].json).toMatchSnapshot();
        done();
      },
    });

    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('Returns values for Performance Navigation Timing properties removing empty or zero values', (done) => {
    const sampleNavigationTimingEntry = {
      name: 'https://web.dev/navigation-and-resource-timing/#wrapping-up',
      entryType: 'navigation',
      startTime: 0,
      duration: 1803.8000001907349,
      initiatorType: 'navigation',
      deliveryType: 'cache',
      nextHopProtocol: 'h2',
      renderBlockingStatus: 'blocking',
      workerStart: 0,
      redirectStart: 0,
      redirectEnd: 0,
      fetchStart: 18.200000286102295,
      domainLookupStart: 25.90000009536743,
      domainLookupEnd: 79,
      connectStart: 79,
      secureConnectionStart: 101.90000009536743,
      connectEnd: 236.09999990463257,
      requestStart: 236.09999990463257,
      responseStart: 376.7000002861023,
      responseEnd: 401.7000002861023,
      transferSize: 11773,
      encodedBodySize: 11473,
      decodedBodySize: 59833,
      responseStatus: 0,
      serverTiming: [],
      unloadEventStart: 1,
      unloadEventEnd: 1,
      domInteractive: 1077.5,
      domContentLoadedEventStart: 1077.5999999046326,
      domContentLoadedEventEnd: 1078.2000002861023,
      domComplete: 1802.2000002861023,
      loadEventStart: 1803.7000002861023,
      loadEventEnd: 1803.8000001907349,
      type: 'reload',
      redirectCount: 0,
      activationStart: 0,
    };

    Object.defineProperty(jsdom.window.performance, 'getEntriesByType', {
      value: (entryType: string) => {
        if (entryType === 'navigation') {
          return [sampleNavigationTimingEntry];
        }
        return [];
      },
      configurable: true,
    });

    const core = trackerCore({
      corePlugins: [PerformanceNavigationTimingPlugin()],
      callback: (payloadBuilder) => {
        const json = payloadBuilder.getJson().filter((e) => e.keyIfEncoded === 'cx');
        expect(json[0].json).toMatchSnapshot();
        done();
      },
    });

    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });
});
