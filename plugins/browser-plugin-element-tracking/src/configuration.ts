import type { Logger, SelfDescribingJson } from '@snowplow/tracker-core';

import { isDataSelector } from './data';
import { type DataSelector, Frequency, type OneOrMany, type RequiredExcept } from './types';

export enum ConfigurationState {
  INITIAL,
  CONFIGURED,
}

/**
 * A dynamic context provider for events generated from the plugin.
 *
 * Can be a static list of Self Describing JSON entities, or a function that returns the same.
 * The function will receive the matching element, and matching element configuration as parameters.
 */
export type ContextProvider =
  | SelfDescribingJson[]
  | ((element: Element | HTMLElement | undefined, match: Configuration) => SelfDescribingJson[]);

/**
 * Options controlling when this type of event should occur.
 */
type BaseOptions = {
  /**
   * Frequency cap options for how often this should be tracked over the lifetime of the plugin.
   */
  when: `${Frequency}`;
  /**
   * A custom DataSelector defining if an element should trigger the event or not. If the DataSelector returns no result triplets, the event does not trigger. The `match` operation can be used here to do some logic against the other types of operators.
   */
  condition?: DataSelector;
};

/**
 * Additional options for controlling when an EXPOSE event should occur.
 */
type ExposeOptions = BaseOptions & {
  /**
   * For larger elements, only trigger if at least this proportion of the element is visible on screen; expects: 0.0 - 1.0; default: 0
   */
  minPercentage?: number;
  /**
   * Only trigger once the element has been in view for at least this many milliseconds. The time is measured cumulatively. After the threshold is met it will re-fire immediately.
   */
  minTimeMillis?: number;
  /**
   * Don't count this element as visible unless its area (height * width) is at least this many pixels. Useful to prohibit empty container elements being tracked as visible.
   */
  minSize?: number;
  /**
   * Add these dimensions (in pixels) to the element size when calculating minPercentage. Used to increase/decrease the size of the actual element before considering it visible.
   */
  boundaryPixels?: [number, number, number, number] | [number, number] | number;
};

/**
 * Input configuration format for describing a set of elements to be tracked with this plugin.
 */
export type ElementConfiguration = {
  /**
   * Logical name for elements matched by this configuration. This name will be used to describe any matching elements in event payloads and entities, and to associate the data between them.
   * If not provided, the `selector` is used as `name`.
   */
  name?: string;
  /**
   * Required. CSS selector to determine the set of elements that match this configuration.
   */
  selector: string;
  /**
   * If `selector` is intended for matching elements within custom elements or shadow DOM hosts, specify a selector for the shadow hosts here; this will be used to identify shadow-elements that match `selector` that would otherwise not be visible.
   */
  shadowSelector?: string;
  /**
   * If using `shadowSelector` to indicate `selector` matches elements in shadow hosts; use this to specify that only elements within shadow hosts matching `shadowSelector` should match; if `false` (default), elements outside shadow hosts (that are not necessarily children of `shadowSelector` hosts) will match the configuration also.
   */
  shadowOnly?: boolean;
  /**
   * Configure when, if ever, element create events should be triggered when detected for elements matching this configuration.
   * Defaults to `false`, which is shorthand for `{ when: 'never' }`.
   */
  create?: boolean | BaseOptions;
  /**
   * Configure when, if ever, element destroy events should be triggered when detected for elements matching this configuration.
   * Defaults to `false`, which is shorthand for `{ when: 'never' }`.
   */
  destroy?: boolean | BaseOptions;
  /**
   * Configure when, if ever, element expose events should be triggered when detected for elements matching this configuration.
   * Also specify additional criteria on relevant for expose events like minimum size or visibility time.
   * Defaults to `true`, which is shorthand for `{ when: 'always' }` and `0` for all other options.
   */
  expose?: boolean | ExposeOptions;
  /**
   * Configure when, if ever, element obscure events should be triggered when detected for elements matching this configuration.
   * Defaults to `false`, which is shorthand for `{ when: 'never' }`.
   */
  obscure?: boolean | BaseOptions;
  /**
   * Indicate that elements matching this configuration are "components"; their ancestry of other elements will be identified in the component_parents entity if this is set (using this configuration's `name`).
   */
  component?: boolean;
  /**
   * When events occur to elements matching this configuration, extract data from one or more DataSelectors and include them in `attributes` in the `element` entity that describes that element.
   */
  details?: OneOrMany<DataSelector>;
  /**
   * When events occur to elements matching this configuration, evaluate one or more nested configurations using the matching element as a root; the `name`, `selector`, `details`, and `contents` will be processed, with other options ignored. The resulting elements (and optionally their `details` will be included as entities on events for this element.)
   */
  contents?: OneOrMany<ElementConfiguration>;
  /**
   * Types of events that statistics for the element should be included on, if any. Should be the `event_name` value for events that should have the entity attached. E.g. `page_view`, `page_ping`, `expose_element`, `my_custom_event`.
   */
  includeStats?: OneOrMany<string>;
  /**
   * Provide custom context entities for events generated from this configuration.
   */
  context?: ContextProvider;
  /**
   * An optional ID for this configuration.
   * Calls to track configurations with a specific ID will override previous configurations with the same ID.
   * No impact on actual tracking or payloads.
   */
  id?: string;
};

/**
 * Parsed valid version of `ElementConfiguration`.
 * Removes some ambiguities allowed in that type that are there for a more pleasant configuration API.
 */
export type Configuration = Omit<
  RequiredExcept<ElementConfiguration, 'id' | 'shadowSelector'>,
  'create' | 'destroy' | 'expose' | 'obscure' | 'details' | 'includeStats' | 'contents'
> & {
  trackers?: string[];
  create: BaseOptions;
  destroy: BaseOptions;
  expose: RequiredExcept<ExposeOptions, 'condition'>;
  obscure: BaseOptions;
  state: ConfigurationState;
  details: DataSelector[];
  includeStats: string[];
  contents: Configuration[];
  context: Extract<ContextProvider, Function>;
};

const DEFAULT_FREQUENCY_OPTIONS: BaseOptions = { when: 'always' };

const emptyProvider: ContextProvider = () => [];

/**
 * Create a new ContextProvider that will merge the given `context` into that generated by the plugin or other configuration itself.
 * @param context An existing ContextProvider to merge with future unknown context.
 * @returns New ContextProvider function that will produce the results of merging its own context with the provided `context`.
 */
export function createContextMerger(batchContext?: ContextProvider, configContext?: ContextProvider): ContextProvider {
  return function contextMerger(element, config) {
    const result: SelfDescribingJson[] = [];

    for (const contextSrc of [batchContext, configContext]) {
      if (contextSrc) {
        if (typeof contextSrc === 'function') {
          if (contextSrc !== contextMerger) result.push(...contextSrc(element, config));
        } else {
          result.push(...contextSrc);
        }
      }
    }

    return result;
  };
}

/**
 * Parse and validate a given `ElementConfiguration`, returning a more concrete `Configuration` if successful.
 * @param config Input configuration to evaluate.
 * @param contextProvider The context provider to embed into the configuration; this will handle merging any batch-level context into configuration-level context.
 * @param trackers A list of trackers the resulting configuration should send events to, if specified.
 * @returns Validated Configuration.
 */
export function checkConfig(
  config: ElementConfiguration,
  contextProvider: ContextProvider,
  intersectionPossible: boolean,
  mutationPossible: boolean,
  logger?: Logger,
  trackers?: string[]
): Configuration {
  const { selector, name = selector, shadowSelector, shadowOnly = false, id, component = false } = config;

  // essential configs
  if (typeof name !== 'string' || !name) throw new Error(`Invalid element name value: ${name}`);
  if (typeof selector !== 'string' || !selector) throw new Error(`Invalid element selector value: ${selector}`);

  // these will throw if selectors invalid
  document.querySelector(selector);
  if (shadowSelector) document.querySelector(shadowSelector);

  // event type frequencies & options
  const { create = false, destroy = false, expose = true, obscure = false } = config;

  // simple event configs
  const [validCreate, validDestroy, validObscure] = [create, destroy, obscure].map((input) => {
    if (!input) return { when: Frequency.NEVER };
    if (typeof input === 'object') {
      const { when = 'always', condition } = input;

      if (condition && !isDataSelector(condition)) throw new Error('Invalid data selector provided for condition');

      if (when.toUpperCase() in Frequency) {
        return {
          when: when.toLowerCase() as Frequency,
          condition,
        };
      } else {
        throw new Error(`Unknown tracking frequency: ${when}`);
      }
    }
    return DEFAULT_FREQUENCY_OPTIONS;
  });

  if ((validCreate.when !== Frequency.NEVER || validDestroy.when !== Frequency.NEVER) && !mutationPossible)
    logger?.warn('MutationObserver API unavailable but required for events in configuration:', config);

  let validExpose: RequiredExcept<ExposeOptions, 'condition'> | null = null;

  // expose has custom options and is more complex
  if (expose && typeof expose === 'object') {
    const {
      when = 'always',
      condition,
      boundaryPixels = 0,
      minPercentage = 0,
      minSize = 0,
      minTimeMillis = 0,
    } = expose;

    if (condition && !isDataSelector(condition)) throw new Error('Invalid data selector provided for condition');
    if (
      (typeof boundaryPixels !== 'number' && !Array.isArray(boundaryPixels)) ||
      typeof minPercentage !== 'number' ||
      typeof minSize !== 'number' ||
      typeof minTimeMillis !== 'number'
    )
      throw new Error('Invalid expose options provided');

    if (when.toUpperCase() in Frequency) {
      validExpose = {
        when: when.toLowerCase() as Frequency,
        condition,
        boundaryPixels,
        minPercentage,
        minSize,
        minTimeMillis,
      };
    } else {
      throw new Error(`Unknown tracking frequency: ${when}`);
    }
  } else if (expose) {
    validExpose = {
      ...DEFAULT_FREQUENCY_OPTIONS,
      boundaryPixels: 0,
      minPercentage: 0,
      minSize: 0,
      minTimeMillis: 0,
    };
  } else {
    validExpose = {
      when: Frequency.NEVER,
      boundaryPixels: 0,
      minPercentage: 0,
      minSize: 0,
      minTimeMillis: 0,
    };
  }

  if ((validExpose.when !== Frequency.NEVER || validObscure.when !== Frequency.NEVER) && !intersectionPossible)
    logger?.warn('IntersectionObserver API unavailable but required for events in configuration:', config);

  // normalize to arrays (scalars allowed in input for convenience)
  let { details = [], contents = [], includeStats = [] } = config;

  if (!Array.isArray(details)) details = details == null ? [] : [details];
  if (!Array.isArray(contents)) contents = contents == null ? [] : [contents];
  if (!Array.isArray(includeStats)) includeStats = includeStats == null ? [] : [includeStats];

  if (details.length !== details.filter(isDataSelector).length)
    throw new Error('Invalid DataSelector given for details');

  return {
    name,
    selector,
    id,
    shadowSelector,
    shadowOnly,
    create: validCreate,
    destroy: validDestroy,
    expose: validExpose,
    obscure: validObscure,
    component: !!component,
    details,
    includeStats,
    contents: contents.map((inner) =>
      checkConfig(inner, inner.context ?? emptyProvider, intersectionPossible, mutationPossible, logger, trackers)
    ),
    context: typeof contextProvider === 'function' ? contextProvider : () => contextProvider,
    trackers,
    state: ConfigurationState.INITIAL,
  };
}
