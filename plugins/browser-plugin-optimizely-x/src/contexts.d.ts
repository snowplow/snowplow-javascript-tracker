/**
 * Schema for an Optimizely X summary context
 */
export interface OptimizelyxSummary {
  experimentId?: number | null;
  variationName?: string | null;
  variation?: number | null;
  visitorId?: string | null;
  [key: string]: unknown;
}
