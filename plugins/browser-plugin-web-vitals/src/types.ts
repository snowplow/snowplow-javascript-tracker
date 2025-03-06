import type { MetricType, Metric, onCLS, onLCP, onFID, onFCP, onINP, onTTFB } from 'web-vitals';

export interface WebVitals {
  onCLS?: typeof onCLS;
  onFID?: typeof onFID;
  onLCP?: typeof onLCP;
  onFCP?: typeof onFCP;
  onINP?: typeof onINP;
  onTTFB?: typeof onTTFB;
}

declare global {
  interface Window {
    webVitals?: WebVitals;
  }
}

export { Metric, MetricType };
