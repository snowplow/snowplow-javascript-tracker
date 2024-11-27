/**
 * Like `Required`, but any keys in `E` are optional instead of required.
 */
export type RequiredExcept<T, E extends keyof T> = {
  [P in Exclude<keyof T, E>]-?: Exclude<T[P], undefined>;
} & {
  [P in E]?: T[P];
};

/**
 * A thing, or an array of thing. Just a neater interface for the user writing configuration.
 */
export type OneOrMany<T> = T | T[];

/**
 * An attribute list details the results of running DataSelectors on an element.
 *
 * It's a list of key-value pairs along with a label for the source DataSelector to remove ambiguity.
 * The list of objects is chosen for BigQuery compat, as it doesn't really support arbitrary "map" types.
 */
export type AttributeList = {
  source: string;
  attribute: string;
  value: string;
}[];

/**
 * A DataSelector defines information to extract from an element.
 *
 * It can be a custom function returning arbitrary key/values as an object. Non-string values will be cast to string or cast to JSON strings. If exceptions are thrown, the error information is captured.
 * Alternatively there are several declarative options that can be specified as object properties.
 *
 * The properties allowed are:
 * - attributes: Return the values of a list of attributes of the element
 * - properties: Return the values of a list of property names of the element's DOM node; this is similar to attributes in some cases but different in others. E.g. `class` as an attribute needs to be `className` as a property; some attributes will reflect their initial value rather than what has been updated via JavaScript
 * - dataset: Return the values of a list of data-* attributes; uses the camelCase name rather than the kebab-case name of the attribute
 * - selector: Specify `true` to attach the CSS selector used to match the element; can be used to differentiate elements with the same `name`
 * - content: Provide an object mapping names to RegExp patterns to run on the element's text content. If it matches it is included. The first group in the pattern will be prioritized if specified.
 * - child_text: Provide an object mapping names to CSS selectors; the selectors are evaluated against the element and the first matching element's text content is the value.
 * - match: Logical operator for use when used as a condition; always evaluated last. Look at existing matches so far, comparing each key/value to the provided object. Alternatively supply a predicate function that determines if this matches or not. If there are no matches, discard any matches found to this point.
 */
export type DataSelector =
  | ((element: Element) => Record<string, any>)
  | { attributes: string[] }
  | { properties: string[] }
  | { dataset: string[] }
  | { selector: boolean }
  | { content: Record<string, string | RegExp> }
  | { child_text: Record<string, string> }
  | { match: Record<string, string | ((val: string) => boolean)> };

/**
 * When this type of event should actually be tracked after it has been detected.
 */
export enum Frequency {
  /**
   * Track this event every time it occurs; e.g. EXPOSE every time it scrolls into/out of view.
   */
  ALWAYS = 'always',
  /**
   * Track this event at most once per element that matches the selector for the lifetime of the plugin.
   */
  ELEMENT = 'element',
  /**
   * Only track the event the first time it occurs per configuration. Even if other elements would trigger the event, ignore them after the first time it occurs.
   */
  ONCE = 'once',
  /**
   * Never track this event, effectively disabling a configuration.
   */
  NEVER = 'never',
  /**
   * Track each event only once per element until the next pageview is seen, allowing it to be tracked again. Mostly useful for Single Page Applications.
   */
  PAGEVIEW = 'pageview',
}
