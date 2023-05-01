import type { ReportCallback, Metric, WebVitalsGlobal, onCLS, onLCP, onFID, onFCP, onINP, onTTFB } from 'web-vitals';

export interface WebVitals extends WebVitalsGlobal {
  onCLS: typeof onCLS;
  onFID: typeof onFID;
  onLCP: typeof onLCP;
  onFCP: typeof onFCP;
  onINP: typeof onINP;
  onTTFB: typeof onTTFB;
}

export { Metric, ReportCallback };
