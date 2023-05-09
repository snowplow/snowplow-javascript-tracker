import { PERFORMANCE_NAVIGATION_TIMING_SCHEMA } from './schemata';

declare global {
  interface Window {
    mozPerformance: any;
    msPerformance: any;
    webkitPerformance: any;
  }
}

type PerformanceNavigationTimingContext = PerformanceNavigationTiming & {
  activationStart?: number;
  deliveryType?: string;
};

/**
 * Creates a context from the PerformanceNavigationTiming object
 *
 * @returns object PerformanceNavigationTiming context
 */
export function getPerformanceNavigationTimingContext() {
  const performanceAlias =
    window.performance || window.mozPerformance || window.msPerformance || window.webkitPerformance || {};

  if (performanceAlias.getEntriesByType) {
    const [performanceNavigationTiming] = performanceAlias.getEntriesByType('navigation') as [
      PerformanceNavigationTiming
    ];

    if (!performanceNavigationTiming) {
      return [];
    }

    return constructNavigationTimingContext(performanceNavigationTiming);
  }

  return [];
}

export function constructNavigationTimingContext(
  performanceNavigationTimingInstance: PerformanceNavigationTimingContext
) {
  const performanceNavigationKeys = [
    'entryType',
    'duration',
    'nextHopProtocol',
    'workerStart',
    'redirectStart',
    'redirectEnd',
    'fetchStart',
    'domainLookupStart',
    'domainLookupEnd',
    'connectStart',
    'secureConnectionStart',
    'connectEnd',
    'requestStart',
    'responseStart',
    'responseEnd',
    'transferSize',
    'encodedBodySize',
    'decodedBodySize',
    'serverTiming',
    'unloadEventStart',
    'unloadEventEnd',
    'domInteractive',
    'domContentLoadedEventStart',
    'domContentLoadedEventEnd',
    'domComplete',
    'loadEventStart',
    'loadEventEnd',
    'type',
    'redirectCount',
    'activationStart',
    'deliveryType',
  ] as const;

  const performanceContextData = performanceNavigationKeys.reduce((accum, key) => {
    const performanceValue = performanceNavigationTimingInstance[key];
    if (key === 'serverTiming' && Array.isArray(performanceValue)) {
      accum[key] = performanceValue.length
        ? performanceValue.map(({ description, duration, name }: PerformanceServerTiming) => ({
            description,
            duration,
            name,
          }))
        : undefined;
    } else if (performanceValue) {
      accum[key] = performanceValue;
    }

    return accum;
  }, {} as Record<typeof performanceNavigationKeys[number], unknown>);

  return [
    {
      schema: PERFORMANCE_NAVIGATION_TIMING_SCHEMA,
      data: performanceContextData,
    },
  ];
}
