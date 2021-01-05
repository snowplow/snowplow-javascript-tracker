/**
 * Schema for page performance, based on the window.performance.timing object (see https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html)
 */
export interface PerformanceTiming {
  [key: string]: number | undefined;
  navigationStart?: number;
  redirectStart?: number;
  redirectEnd?: number;
  fetchStart?: number;
  domainLookupStart?: number;
  domainLookupEnd?: number;
  connectStart?: number;
  secureConnectionStart?: number;
  connectEnd?: number;
  requestStart?: number;
  responseStart?: number;
  responseEnd?: number;
  unloadEventStart?: number;
  unloadEventEnd?: number;
  domLoading?: number;
  domInteractive?: number;
  domContentLoadedEventStart?: number;
  domContentLoadedEventEnd?: number;
  domComplete?: number;
  loadEventStart?: number;
  loadEventEnd?: number;
  msFirstPaint?: number;
  chromeFirstPaint?: number;
  requestEnd?: number;
  proxyStart?: number;
  proxyEnd?: number;
}
