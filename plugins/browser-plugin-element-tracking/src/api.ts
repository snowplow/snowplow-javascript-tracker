import {
  type BrowserPlugin,
  type BrowserTracker,
  dispatchToTrackersInCollection,
} from '@snowplow/browser-tracker-core';
import { type Logger, SelfDescribingJson, buildSelfDescribingEvent } from '@snowplow/tracker-core';

import { baseComponentGenerator } from './components';
import {
  ConfigurationState,
  checkConfig,
  createContextMerger,
  type Configuration,
  type ContextProvider,
  type ElementConfiguration,
} from './configuration';
import { buildContentTree, evaluateDataSelector, getElementDetails } from './data';
import { ElementStatus, aggregateStats, getState } from './elementsState';
import { ComponentsEntity, ElementDetailsEntity, Entity, Events, Event } from './schemata';
import { Frequency, type OneOrMany } from './types';
import { getMatchingElements, nodeIsElement, shouldTrackExpose } from './util';

/**
 * Parameters for startElementTracking.
 */
export type ElementTrackingConfiguration = {
  /**
   * Optional context generator or static contexts to apply/add to any events generated by this batch of element configurations.
   */
  context?: ContextProvider;
  /**
   * Single or array of element configurations to start tracking events for.
   */
  elements: OneOrMany<ElementConfiguration>;
};

/**
 * Parameters for endElementTracking.
 */
export type ElementTrackingDisable =
  | {
      /**
       * A list of configuration names to stop tracking. Configurations can share names so this may match multiple cases.
       * Configurations with no explicit name use their selector as their name.
       */
      elements: OneOrMany<ElementConfiguration['name']>;
    }
  | {
      /**
       * A list of configuration IDs to stop tracking. Only a single Configuration is allowed to exist per ID so this can be used to target specific instances.
       */
      elementIds: OneOrMany<NonNullable<ElementConfiguration['id']>>;
    }
  | {
      /**
       * Custom predicate to return if each Configuration should be removed (`true`) or kept (`false`).
       * @param configuration The filter function to decide if the Configuration should be removed or not.
       * @returns
       */
      filter: (configuration: Readonly<Configuration>) => boolean;
    };

const trackers: Record<string, BrowserTracker> = {};
const configurations: Configuration[] = [];

const WeakestSet = typeof WeakSet === 'undefined' ? Set : WeakSet;

const trackedThisPage: Record<Events, Set<Element | 'initial'>> = {
  [Events.ELEMENT_CREATE]: new Set(),
  [Events.ELEMENT_DESTROY]: new Set(),
  [Events.ELEMENT_EXPOSE]: new Set(),
  [Events.ELEMENT_OBSCURE]: new Set(),
};

const trackedElements: Record<Events, WeakSet<Element>> = {
  [Events.ELEMENT_CREATE]: new WeakestSet(),
  [Events.ELEMENT_DESTROY]: new WeakestSet(),
  [Events.ELEMENT_EXPOSE]: new WeakestSet(),
  [Events.ELEMENT_OBSCURE]: new WeakestSet(),
};

const trackedConfigs: Record<Events, WeakSet<Configuration>> = {
  [Events.ELEMENT_CREATE]: new WeakestSet(),
  [Events.ELEMENT_DESTROY]: new WeakestSet(),
  [Events.ELEMENT_EXPOSE]: new WeakestSet(),
  [Events.ELEMENT_OBSCURE]: new WeakestSet(),
};

let LOG: Logger | undefined = undefined;
let mutationObserver: MutationObserver | false = false;
let intersectionObserver: IntersectionObserver | false = false;

/**
 * Plugin for tracking the addition and removal of elements to a page and the visibility of those elements.
 * @param param0 Plugin configuration.
 * @param param0.ignoreNextPageView Only required when use per-pageview frequency configurations and the ordering vs the pageview event matters. Defaults to `true`, which means the next pageview event will be ignored and not count as resetting the per-pageview state; this is correct if you're calling startElementTracking before calling trackPageView.
 * @returns
 */
export function SnowplowElementTrackingPlugin({ ignoreNextPageView = true } = {}): BrowserPlugin {
  // book keeping for controlling behavior if activated before/after first pageview
  // used when tracking `when: pageview` frequency
  if (ignoreNextPageView) {
    Object.values(trackedThisPage).forEach((trackedThisPage) => {
      trackedThisPage.add('initial');
    });
  }

  return {
    activateBrowserPlugin(tracker) {
      trackers[tracker.id] = tracker;
      setupObservers();
    },
    afterTrack(payload) {
      if (payload['e'] === 'pv') {
        // re-set state for `when: pageview` frequency caps
        Object.values(trackedThisPage).forEach((trackedThisPage) => {
          // handle book-keeping from above
          if (trackedThisPage.has('initial')) {
            trackedThisPage.delete('initial');
          } else {
            trackedThisPage.clear();
          }
        });
      }
    },
    beforeTrack(payload) {
      const e = payload.getPayload()['e'];
      let eventName: string;

      if (e === 'pv') eventName = 'page_view';
      else if (e === 'pp') eventName = 'page_ping';
      else if (e === 'se') eventName = 'event';
      else if (e === 'tr') eventName = 'transaction';
      else if (e === 'ti') eventName = 'transaction_item';
      else if (e === 'ue') {
        const sdjData = payload.getJson();
        for (const sdjWithKey of sdjData) {
          if (sdjWithKey.keyIfEncoded === 'ue_px') {
            const schema = (sdjWithKey.json.data as SelfDescribingJson).schema;
            eventName = schema.split('/')[1];
          }
        }
      } else return;

      configurations.forEach((config) => {
        if (!config.includeStats.includes(eventName) && !config.includeStats.includes('*')) return;
        const elements = getMatchingElements(config);
        elements.forEach((elem, i, a) => {
          payload.addContextEntity(aggregateStats(config.name, elem, i + 1, a.length));
        });
      });
    },
    logger(logger) {
      LOG = logger;
    },
  };
}

function setupObservers() {
  if (!mutationObserver) {
    mutationObserver = typeof MutationObserver === 'function' && new MutationObserver(mutationCallback);
    if (mutationObserver)
      mutationObserver.observe(document.documentElement, {
        attributes: true,
        childList: true,
        subtree: true,
      });
  }
  intersectionObserver =
    intersectionObserver ||
    (typeof IntersectionObserver === 'function' && new IntersectionObserver(intersectionCallback));
}

/**
 * Start Element tracking for elements that match the given configuration(s).
 *
 * Invalid configurations will be ignored, but valid configurations in the same batch will still apply.
 *
 * You can call this multiple times with different batches of configurations. E.g. section-specific configs, different custom context, different tracker instance destinations.
 * Configurations supplied in multiple calls will not be deduped unless an `id` is provided and it collides with previous `id` values.
 *
 * @param param0 Element Tracking configuration options containing a batch of element configurations and optionally, custom context.
 * @param trackers A list of tracker instance names that should receive events generated by this batch of element configurations. If not provided, events go to all trackers the plugin has activated for.
 * @returns
 */
export function startElementTracking(
  { elements = [], context }: ElementTrackingConfiguration,
  trackers?: Array<string>
): void {
  const elementConfigs = Array.isArray(elements) ? elements : [elements];

  // may have stopped observers via `endElementTracking`
  if (elementConfigs.length) setupObservers();

  elementConfigs.forEach((config) => {
    try {
      const batchContext = createContextMerger(context, config.context);
      const valid = checkConfig(config, batchContext, !!intersectionObserver, !!mutationObserver, LOG, trackers);

      // upsert by id if provided
      if (valid.id) {
        const existing = configurations.findIndex(({ id }) => id === valid.id);
        if (existing > -1) {
          configurations[existing] = valid;
        } else configurations.push(valid);
      } else configurations.push(valid);
    } catch (e) {
      LOG?.error('Failed to process Element Tracking configuration', e, config);
    }
  });

  configurations.forEach((config) => {
    const { expose, obscure, state } = config;
    if (state === ConfigurationState.INITIAL) {
      config.state = ConfigurationState.CONFIGURED;

      const elements = getMatchingElements(config);

      elements.forEach((element, i) => {
        const state = getState(element);

        state.lastPosition = i;
        state.matches.add(config);

        trackEvent(Events.ELEMENT_CREATE, config, element, { position: i + 1, matches: elements.length });

        if (intersectionObserver && (expose.when !== Frequency.NEVER || obscure.when !== Frequency.NEVER)) {
          intersectionObserver.observe(element);
        }
      });
    }
  });
}

/**
 * Stop tracking events for the configurations with the given names or IDs, or satisfying a custom predicate.
 * If no parameters provided, removes all previous configurations.
 * All element configurations have names, if not provided the `name` is the `selector` which is required.
 *
 * No considerations are made for tracker instance destinations. Use IDs or filters if you need specific routing options.
 * @param remove Filter information for which element configurations should be removed. Omit to remove all configurations.
 */
export function endElementTracking(remove?: ElementTrackingDisable): void {
  if (!remove) {
    configurations.length = 0;
  } else {
    if ('elementIds' in remove) {
      const { elementIds } = remove;
      const idsToRemove = Array.isArray(elementIds) ? elementIds : [elementIds];

      const remaining = configurations.filter(({ id }) => {
        const shouldRemove = typeof id === 'string' && idsToRemove.includes(id);
        return !shouldRemove;
      });

      configurations.splice(0, configurations.length, ...remaining);
    }

    if ('elements' in remove) {
      const { elements } = remove;
      const elsToRemove = Array.isArray(elements) ? elements : [elements];

      const remaining = configurations.filter(({ name }) => elsToRemove.includes(name));

      configurations.splice(0, configurations.length, ...remaining);
    }

    if ('filter' in remove && typeof remove.filter === 'function') {
      const remaining = configurations.filter((config) => {
        try {
          return remove.filter(config) !== true;
        } catch (e) {
          return true;
        }
      });
      configurations.splice(0, configurations.length, ...remaining);
    }
  }

  if (!configurations.length) {
    if (intersectionObserver) intersectionObserver.disconnect();
    if (mutationObserver) mutationObserver.disconnect();
    mutationObserver = intersectionObserver = false;
  }
}

const componentGenerator = baseComponentGenerator.bind(null, false, configurations) as (
  ...args: any[]
) => ComponentsEntity | null;
const detailedComponentGenerator = baseComponentGenerator.bind(null, true, configurations) as (
  ...args: any[]
) => [ComponentsEntity, ...ElementDetailsEntity[]] | null;

/**
 * Obtain access to functions that can determine details about any configured `component`s and return `component_parents` context for given elements.
 *
 * It returns two generator functions:
 * - one returns a single `component_parents` entity, which lists the names of any defined components that are ancestors of the provided element
 * - the second returns multiple entities, including `component_parents` plus any element_details information about each matching component
 *
 * When called, the generators will examine all parameters in order looking for:
 * - an element to look for owning components of
 * - a string to use as the element_name in the component_parents entity
 *
 * The functions are suitable for use in Dynamic Context Generator functions used in other plugins such as Link and Form tracking.
 *
 * If a `cb` function is provided, it is called with the above generators as parameters that it can use in asynchronous situations (such as the JavaScript tracker).
 *
 * @param cb Callback function to receive the generator callbacks described above asynchronously.
 * @returns Array of callbacks described above.
 */
export function getComponentListGenerator(
  cb?: (basic: typeof componentGenerator, detailed: typeof detailedComponentGenerator) => void
): [typeof componentGenerator, typeof detailedComponentGenerator] {
  if (cb) cb(componentGenerator, detailedComponentGenerator);
  return [componentGenerator, detailedComponentGenerator];
}

/**
 * Do the thing!
 *
 * - Build the event payload for `schema`
 * - Evaluate whether we have been configured to actually send that event
 * - Evaluate frequency caps
 * - Build entity payloads
 * - Dispatch event to trackers
 *
 * The actual tracking is scheduled in a new task to yield back to the callers quickly, as they may need to be performant.
 * @param schema The type of event to generate/track.
 * @param config The configuration that matched and triggered this event to generate. This will include any criteria for the preventing the event to fire, and information for which entities are required.
 * @param element The element that is the subject of the event; used to generate entity information.
 * @param options Other details about the situation; like the bounding rect of the element, its number of siblings/etc. Some of these may be expensive to recalculate if needed, so you can provide them in advance if already available.
 * @returns
 */
function trackEvent<T extends Events>(
  schema: T,
  config: Configuration,
  element: Element | HTMLElement,
  options?: Partial<{
    boundingRect: DOMRect;
    position: number;
    matches: number;
  }>
): void {
  const { boundingRect, position, matches } = options ?? {};

  // core payload
  const payload: Event<T> = {
    schema,
    data: {
      element_name: config.name,
    },
  };

  // check custom conditions
  const conditions = {
    [Events.ELEMENT_CREATE]: config.create.condition,
    [Events.ELEMENT_DESTROY]: config.destroy.condition,
    [Events.ELEMENT_EXPOSE]: config.expose.condition,
    [Events.ELEMENT_OBSCURE]: config.obscure.condition,
  };

  if (conditions[schema]) {
    if (!evaluateDataSelector(element, config.selector, conditions[schema]!).length) return;
  }

  // check frequency caps
  const frequencies = {
    [Events.ELEMENT_CREATE]: config.create.when,
    [Events.ELEMENT_DESTROY]: config.destroy.when,
    [Events.ELEMENT_EXPOSE]: config.expose.when,
    [Events.ELEMENT_OBSCURE]: config.obscure.when,
  };

  switch (frequencies[schema]) {
    case Frequency.NEVER:
      return; // abort
    case Frequency.ALWAYS:
      break; // continue
    case Frequency.ONCE:
      if (trackedConfigs[schema].has(config)) return; // once / once per config
      trackedConfigs[schema].add(config);
      break;
    case Frequency.ELEMENT:
      if (trackedElements[schema].has(element)) return; // once per element
      trackedElements[schema].add(element);
      break;
    case Frequency.PAGEVIEW:
      if (trackedThisPage[schema].has(element)) return; // once per pageview
      trackedThisPage[schema].add(element);
      break;
  }

  // build entities
  const context: (Entity | SelfDescribingJson)[] = [];

  context.push(...(config.context(element, config) as Entity[]));

  if (config.details) {
    context.push(getElementDetails(config, element, boundingRect, position, matches));
  }

  if (config.contents.length) {
    context.push(...buildContentTree(config, element, position));
  }

  const components = detailedComponentGenerator(config.name, element);
  if (components) context.push(...components);

  // track the event
  setTimeout(dispatchToTrackersInCollection, 0, config.trackers, trackers, (tracker: BrowserTracker) => {
    const event = buildSelfDescribingEvent({ event: payload });
    tracker.core.track(event, context);
  });
}

/**
 * Handle some boilerplate/book-keeping to track an element as CREATEd.
 * Saves use duplicating this logic many times in `mutationCallback`.
 */
function handleCreate(nowTs: number, config: Configuration, node: Node | Element) {
  if (nodeIsElement(node) && node.matches(config.selector)) {
    const state = getState(node);
    state.state = ElementStatus.CREATED;
    state.createdTs = nowTs;
    state.matches.add(config);
    trackEvent(Events.ELEMENT_CREATE, config, node);
    if (config.expose.when !== Frequency.NEVER && intersectionObserver) intersectionObserver.observe(node);
  }
}

/**
 * Handler for the mutation observer.
 * Checks for two mutation types:
 *   attributes: for existing nodes in the document that may mutate into matching a config when they didn't previously (or vice-versa)
 *   childList: for node adds/removals, to find new elements added dynamically to the page that may match configurations
 *
 * For the former, we need to keep track of if we've matched each element against a config before to determine if it's mutated away or not; not matching now isn't enough enough information to know if it previously matched.
 * If we determine a matching element has been DESTROYed, we stop observing it for intersections.
 * On the other hand, if a CREATE was determined, start observing intersections if that's requested in the configuration.
 */
function mutationCallback(mutations: MutationRecord[]): void {
  const nowTs = performance.now() - performance.timeOrigin;
  mutations.forEach((record) => {
    configurations.forEach((config) => {
      const createFn = handleCreate.bind(null, nowTs, config);

      if (record.type === 'attributes') {
        if (nodeIsElement(record.target)) {
          const element = record.target;
          const prevState = getState(element);

          if (prevState.state !== ElementStatus.INITIAL) {
            if (!element.matches(config.selector)) {
              if (prevState.matches.has(config)) {
                if (prevState.state === ElementStatus.EXPOSED) trackEvent(Events.ELEMENT_OBSCURE, config, element);
                trackEvent(Events.ELEMENT_DESTROY, config, element);
                prevState.matches.delete(config);
                if (intersectionObserver) intersectionObserver.unobserve(element);
                prevState.state = ElementStatus.DESTROYED;
              }
            } else {
              if (!prevState.matches.has(config)) {
                createFn(element);
              }
            }
          } else {
            createFn(element);
          }
        }
      } else if (record.type === 'childList') {
        const matches = getMatchingElements(config);
        record.addedNodes.forEach((node) => {
          matches.filter((m) => node.contains(m)).forEach(createFn);
        });
        record.removedNodes.forEach((node) => {
          if (nodeIsElement(node)) {
            const removals = node.matches(config.selector) ? [node] : [];
            removals.push(...getMatchingElements(config, node));
            removals.forEach((node) => {
              const state = getState(node);
              if (state.state === ElementStatus.EXPOSED) trackEvent(Events.ELEMENT_OBSCURE, config, node);
              trackEvent(Events.ELEMENT_DESTROY, config, node);
              if (intersectionObserver) intersectionObserver.unobserve(node);
              state.state = ElementStatus.DESTROYED;
            });
          }
        });
      }
    });
  });
}

/**
 * Handler for the intersection observer.
 * Called when there are intersection updates, and when an element is first observed (the latter when new configs are added, or the mutation observer tries to evaluate visibility).
 *
 * Each entry is for a specific element, so we need to find if the element matches a config.
 * With a config match we can determine if we need to fire EXPOSE/OBSCURE events for that element.
 * For intersections, we first put it in a PENDING state in case we need to account for minimum time conditions.
 * If time and other conditions are met, we can track the EXPOSE.
 * Otherwise, we schedule an unobserve/reobserve in the next animation frame to update time in view, which will repeat until the time condition is met. This feels expensive, but seems to be OK since the layout should all be pretty freshly calculated at these points so it's actually pretty light.
 * If no longer visible, consider tracking OBSCURE (unless it was DESTROYED, which would already have tried OBSCURE).
 */
function intersectionCallback(entries: IntersectionObserverEntry[], observer: IntersectionObserver): void {
  entries.forEach((entry) => {
    let frameRequest: number | undefined = undefined;
    const state = getState(entry.target, { lastObservationTs: entry.time });
    configurations.forEach((config) => {
      if (entry.target.matches(config.selector)) {
        const siblings = getMatchingElements(config);
        const position = siblings.findIndex((el) => el.isSameNode(entry.target)) + 1;

        if (entry.isIntersecting) {
          if (state.state !== ElementStatus.EXPOSED && state.state !== ElementStatus.PENDING) {
            Object.assign(state, {
              state: ElementStatus.PENDING,
              lastObservationTs: entry.time,
              views: state.views + 1,
            });
          }

          if (state.state === ElementStatus.PENDING) {
            // check configured criteria, if any
            if (shouldTrackExpose(config, entry)) {
              // check time criteria
              if (config.expose.minTimeMillis <= state.elapsedVisibleMs) {
                state.state = ElementStatus.EXPOSED;
                trackEvent(Events.ELEMENT_EXPOSE, config, entry.target, {
                  boundingRect: entry.boundingClientRect,
                  position,
                  matches: siblings.length,
                });
              }
            }
          }

          if (state.state === ElementStatus.PENDING || state.state === ElementStatus.EXPOSED) {
            const elapsedVisibleMs = state.elapsedVisibleMs + (entry.time - state.lastObservationTs);
            Object.assign(state, {
              lastObservationTs: entry.time,
              elapsedVisibleMs,
            });

            // check visibility time next frame
            if (!frameRequest) {
              frameRequest = requestAnimationFrame(() => {
                observer.unobserve(entry.target); // observe is no-op for already observed elements
                observer.observe(entry.target); // for non-observed elements, it immediately generates an entry of current state
              });
            }
          }
        } else {
          if (state.state === ElementStatus.EXPOSED) {
            trackEvent(Events.ELEMENT_OBSCURE, config, entry.target, {
              boundingRect: entry.boundingClientRect,
              position,
              matches: siblings.length,
            });
          }

          Object.assign(state, {
            state: state.state === ElementStatus.DESTROYED ? ElementStatus.DESTROYED : ElementStatus.OBSCURED,
            lastObservationTs: entry.time,
          });
        }
      }
    });
  });
}
