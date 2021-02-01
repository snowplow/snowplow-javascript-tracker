import { Plugin } from '@snowplow/tracker-core';
import { PerformanceTiming } from './contexts';

declare global {
  interface Window {
    mozPerformance: any;
    msPerformance: any;
    webkitPerformance: any;
  }
}

const PerformanceTimingPlugin = (): Plugin => {
  const windowAlias = window;

  /**
   * Creates a context from the window.performance.timing object
   *
   * @return object PerformanceTiming context
   */
  function getPerformanceTimingContext() {
    var performance =
      windowAlias.performance ||
      windowAlias.mozPerformance ||
      windowAlias.msPerformance ||
      windowAlias.webkitPerformance;

    if (performance) {
      const performanceTiming: PerformanceTiming = {
        navigationStart: performance.timing.navigationStart,
        redirectStart: performance.timing.redirectStart,
        redirectEnd: performance.timing.redirectEnd,
        fetchStart: performance.timing.fetchStart,
        domainLookupStart: performance.timing.domainLookupStart,
        domainLookupEnd: performance.timing.domainLookupEnd,
        connectStart: performance.timing.connectStart,
        secureConnectionStart: performance.timing.secureConnectionStart,
        connectEnd: performance.timing.connectEnd,
        requestStart: performance.timing.requestStart,
        responseStart: performance.timing.responseStart,
        responseEnd: performance.timing.responseEnd,
        unloadEventStart: performance.timing.unloadEventStart,
        unloadEventEnd: performance.timing.unloadEventEnd,
        domLoading: performance.timing.domLoading,
        domInteractive: performance.timing.domInteractive,
        domContentLoadedEventStart: performance.timing.domContentLoadedEventStart,
        domContentLoadedEventEnd: performance.timing.domContentLoadedEventEnd,
        domComplete: performance.timing.domComplete,
        loadEventStart: performance.timing.loadEventStart,
        loadEventEnd: performance.timing.loadEventEnd,
        msFirstPaint: (<any>performance.timing).msFirstPaint,
        chromeFirstPaint: (<any>performance.timing).chromeFirstPaint,
        requestEnd: (<any>performance.timing).requestEnd,
        proxyStart: (<any>performance.timing).proxyStart,
        proxyEnd: (<any>performance.timing).proxyEnd,
      };

      return [
        {
          schema: 'iglu:org.w3/PerformanceTiming/jsonschema/1-0-0',
          data: performanceTiming,
        },
      ];
    }

    return [];
  }

  return {
    contexts: () => getPerformanceTimingContext(),
  };
};

export { PerformanceTimingPlugin };
