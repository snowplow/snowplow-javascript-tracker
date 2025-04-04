import { DynamicContext } from '@snowplow/tracker-core';

/** A list of CSS classes that will have their clicks tracked */
export type AllowList = { allowlist: string[] };

/** A list of CSS classes that will _not_ have their clicks tracked */
export type DenyList = { denylist: string[] };

/** A function which determines whether a button click should be tracked */
export type FilterFunction = (element: HTMLElement) => boolean;

/** A filter for button click tracking */
export type Filter = AllowList | DenyList | FilterFunction;

/** The configuration for automatic button click tracking */
export interface ButtonClickTrackingConfiguration {
  /** The filter options for the button click tracking */
  filter?: Filter;
  /** The dynamic context which will be evaluated for each button click event */
  context?: DynamicContext;
  /** A default label to use if one can not be determined by the content or data attributes */
  defaultLabel?: string | ((element: HTMLElement) => string);
}

/**
 * A Button Click event
 *
 * Used when a user clicks on a <button> tag on a webpage
 * <input type="submit"> tags are intentionally not tracked by this event,
 * as this functionality is provided by the Form Tracking plugin
 * see: https://docs.snowplow.io/docs/collecting-data/collecting-from-own-applications/javascript-trackers/web-tracker/plugins/form-tracking/
 */
export interface ButtonClickEvent {
  /** The text on the button clicked
   *
   * This can be overridden by setting the `data-sp-button-label` attribute on the button:
   *
   * `<button data-sp-button-label="show-modal">Click Here!</button>`
   *
   * will result in `{ label: 'show-modal' }`
   */
  label: string;
  /** The ID of the button clicked, if present */
  id?: string;
  /** An array of class names from the button clicked */
  classes?: Array<string>;
  /** The name of the button, if present */
  name?: string;
}
