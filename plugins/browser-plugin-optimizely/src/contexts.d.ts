/**
 * Schema for an Optimizely experiment context (http://developers.optimizely.com/javascript/reference/#experiments)
 */
export interface Experiment {
  id?: string | null;
  code?: string | null;
  manual?: boolean | null;
  conditional?: boolean | null;
  name?: string | null;
  variationIds?: (string | null)[];
  [key: string]: unknown;
}

/**
 * Schema for an Optimizely summary context
 */
export interface OptimizelySummary {
  activeExperimentId?: string;
  variation?: string;
  conditional?: boolean;
  manual?: boolean;
  name?: string;
  [key: string]: unknown;
}

/**
 * Schema for an Optimizely state context (http://developers.optimizely.com/javascript/reference/#state)
 */
export interface State {
  experimentId?: string | null;
  isActive?: boolean | null;
  variationIndex?: number | null;
  variationId?: string | null;
  variationName?: string | null;
  [key: string]: unknown;
}

/**
 * Schema for an Optimizely variation context (http://developers.optimizely.com/javascript/reference/#variations)
 */
export interface Variation {
  id?: string | null;
  name?: string | null;
  code?: string | null;
  [key: string]: unknown;
}

/**
 * Schema for an Optimizely visitor_audience context
 */
export interface VisitorAudience {
  id?: string | null;
  isMember?: boolean | null;
  [key: string]: unknown;
}

/**
 * Schema for an Optimizely visitor_dimension context
 */
export interface VisitorDimension {
  id?: string | null;
  value?: string | null;
  [key: string]: unknown;
}

/**
 * Schema for an Optimizely visitor context (http://developers.optimizely.com/javascript/reference/#experiments)
 */
export interface Visitor {
  browser?: string | null;
  browserVersion?: string | null;
  device?: string | null;
  deviceType?: string | null;
  ip?: string | null;
  platformId?: string | null;
  platformVersion?: string | null;
  locationCity?: string | null;
  locationRegion?: string | null;
  locationCountry?: string | null;
  mobile?: boolean | null;
  mobileId?: string | null;
  referrer?: string | null;
  os?: string | null;
  [key: string]: unknown;
}
