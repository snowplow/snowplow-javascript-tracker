import { LOG } from '@snowplow/tracker-core';
import { MetricType } from './types';

/**
 * Attach page listeners to collect the Web Vitals values
 * @param {() => void} callback
 */
export function attachWebVitalsPageListeners(callback: () => void) {
  // Safari does not fire "visibilitychange" on the tab close
  // So we have 2 options: lose Safari data, or lose LCP/CLS that depends on "visibilitychange" logic.
  // Current solution: if LCP/CLS supported, use `onHidden` otherwise, use `pagehide` to fire the callback in the end.
  //
  // More details: https://github.com/treosh/web-vitals-reporter/issues/3
  const supportedEntryTypes = (PerformanceObserver && PerformanceObserver.supportedEntryTypes) || [];
  const isLatestVisibilityChangeSupported = supportedEntryTypes.indexOf('layout-shift') !== -1;

  if (isLatestVisibilityChangeSupported) {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        callback();
        window.removeEventListener('visibilitychange', onVisibilityChange, true);
      }
    };
    window.addEventListener('visibilitychange', onVisibilityChange, true);
  } else {
    window.addEventListener('pagehide', callback, { capture: true, once: true });
  }
}

/**
 *
 * @param {string} webVitalsSource Web Vitals script source.
 * @returns {string} The script element of the Web Vitals script. Used for attaching listeners on it.
 */
export function createWebVitalsScript(webVitalsSource: string) {
  const webVitalsScript = document.createElement('script');
  webVitalsScript.setAttribute('src', webVitalsSource);
  webVitalsScript.setAttribute('async', '1');
  webVitalsScript.addEventListener('error', () => {
    LOG.error(`Failed to load ${webVitalsSource}`);
  });

  document.head.appendChild(webVitalsScript);
  return webVitalsScript;
}

/**
 *
 * Adds the Web Vitals measurements on the object used by the trackers to store metric properties.
 * @param {Record<string, unknown>} webVitalsObject
 * @return {void}
 */
export function webVitalsListener(webVitalsObject: Record<string, unknown>) {
  function addWebVitalsMeasurement(metricSchemaName: string): (arg: MetricType) => void {
    return (arg) => {
      webVitalsObject[metricSchemaName] = arg.value;
      webVitalsObject.navigationType = arg.navigationType;
    };
  }

  const webVitals = window.webVitals;
  if (!webVitals) {
    LOG.warn('The window.webVitals API is currently unavailable. web_vitals events will not be collected.');
    return;
  }

  webVitals.onCLS?.(addWebVitalsMeasurement('cls'));
  webVitals.onFID?.(addWebVitalsMeasurement('fid'));
  webVitals.onLCP?.(addWebVitalsMeasurement('lcp'));
  webVitals.onFCP?.(addWebVitalsMeasurement('fcp'));
  webVitals.onINP?.(addWebVitalsMeasurement('inp'));
  webVitals.onTTFB?.(addWebVitalsMeasurement('ttfb'));
}
