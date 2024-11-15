import {
  type BrowserPlugin,
  type BrowserTracker,
  dispatchToTrackersInCollection,
} from '@snowplow/browser-tracker-core';
import { type Logger, SelfDescribingJson, buildSelfDescribingEvent } from '@snowplow/tracker-core';

import { baseComponentGenerator } from './components';
import {
  checkConfig,
  type Configuration,
  ConfigurationState,
  type ContextProvider,
  type ElementConfiguration,
  Frequency,
} from './configuration';
import { buildContentTree, evaluateDataSelector, getElementDetails } from './data';
import { ElementStatus, elementsState, patchState } from './elementsState';
import { ComponentsEntity, ElementDetailsEntity, Entity, Events, Event } from './schemata';
import type { OneOrMany } from './types';
import { defineBoundaries, getMatchingElements, nodeIsElement } from './util';

type ElementTrackingConfiguration = {
  context?: ContextProvider;
  elements: OneOrMany<ElementConfiguration>;
};

type ElementTrackingDisable =
  | {
      elements: OneOrMany<ElementConfiguration['name']>;
    }
  | { elementIds: OneOrMany<NonNullable<ElementConfiguration['id']>> };

const trackers: Record<string, BrowserTracker> = {};
const configurations: Configuration[] = [];
const configurationsById: Record<string, Configuration> = {};

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
 * Element Tracking plugin to track the (dis)appearance and visibility of DOM elements.
 */
export function SnowplowElementTrackingPlugin({ ignoreNextPageView = true } = {}): BrowserPlugin {
  if (ignoreNextPageView) {
    Object.values(trackedThisPage).forEach((trackedThisPage) => {
      trackedThisPage.add('initial');
    });
  }

  return {
    activateBrowserPlugin(tracker) {
      trackers[tracker.id] = tracker;

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
    },
    afterTrack(payload) {
      if (payload['e'] === 'pv') {
        Object.values(trackedThisPage).forEach((trackedThisPage) => {
          if (trackedThisPage.has('initial')) {
            trackedThisPage.delete('initial');
          } else {
            trackedThisPage.clear();
          }
        });
      }
    },
    logger(logger) {
      LOG = logger;
    },
  };
}

/**
 * Starts element tracking for a single media content tracked in a media player.
 * The tracking instance is uniquely identified by a given ID.
 * All subsequent media track calls will be processed within this media tracking if given the same ID.
 *
 * @param config Configuration for setting up media tracking
 * @param trackers The tracker identifiers which ping events will be sent to
 */
export function startElementTracking(
  { elements = [], context }: ElementTrackingConfiguration,
  trackers?: Array<string>
): void {
  if (!mutationObserver || !intersectionObserver) {
    LOG?.error('ElementTracking plugin requires both MutationObserver and IntersectionObserver APIs');
    if (mutationObserver) mutationObserver.disconnect();
    if (intersectionObserver) intersectionObserver.disconnect();
    mutationObserver = intersectionObserver = false;
    return;
  }

  const configs = Array.isArray(elements) ? elements : [elements];

  configs.forEach((config) => {
    try {
      const contextMerger: ContextProvider = (element, config) => {
        const result: SelfDescribingJson[] = [];

        for (const contextSrc of [context, config.context]) {
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

      const valid = checkConfig(config, contextMerger, trackers);
      configurations.push(valid);
      if (valid.id) configurationsById[valid.id] = valid;
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
        elementsState.set(
          element,
          patchState({
            lastPosition: i,
          })
        );
        elementsState.get(element)?.matches.add(config);

        trackEvent(Events.ELEMENT_CREATE, config, element, { position: i + 1, matches: elements.length });

        if (intersectionObserver && (expose || obscure)) {
          intersectionObserver.observe(element);
        }
      });
    }
  });
}

export function endElementTracking(remove?: ElementTrackingDisable, trackers?: Array<string>): void {
  if (!remove) {
    configurations.length = 0;
  }

  if (remove && 'elementIds' in remove) {
    const { elementIds } = remove;
    const idsToRemove = Array.isArray(elementIds) ? elementIds : [elementIds];

    const remaining = configurations.filter((config) => {
      const { id } = config;

      const targeted = typeof id === undefined || !idsToRemove.includes(id!);
      // TODO(jethron): remove for specific trackers
      return targeted && !trackers;
    });
    configurations.splice(0, configurations.length, ...remaining);
  }

  if (remove && 'elements' in remove) {
    const { elements } = remove;
    const elsToRemove = Array.isArray(elements) ? elements : [elements];

    const remaining = configurations.filter((config) => {
      const { name } = config;
      const targeted = typeof name === undefined || !elsToRemove.includes(name);
      // TODO(jethron): remove for specific trackers
      return targeted && !trackers;
    });
    configurations.splice(0, configurations.length, ...remaining);
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

export function getComponentListGenerator(
  cb?: (basic: typeof componentGenerator, detailed: typeof detailedComponentGenerator) => void
): [typeof componentGenerator, typeof detailedComponentGenerator] {
  if (cb) cb(componentGenerator, detailedComponentGenerator);
  return [componentGenerator, detailedComponentGenerator];
}

function shouldTrackExpose(config: Configuration, entry: IntersectionObserverEntry): boolean {
  if (config.expose.when === Frequency.NEVER) return false;
  if (!entry.isIntersecting) return false;

  const { boundaryPixels, minPercentage, minSize } = config.expose;

  const { boundTop, boundRight, boundBottom, boundLeft } = defineBoundaries(boundaryPixels);

  const { intersectionRatio, boundingClientRect } = entry;
  if (boundingClientRect.height * boundingClientRect.width < minSize) return false;
  if (!(boundTop + boundRight + boundBottom + boundLeft)) {
    if (minPercentage > intersectionRatio) return false;
  } else {
    const intersectionArea = entry.intersectionRect.height * entry.intersectionRect.width;
    const boundingHeight = entry.boundingClientRect.height + boundTop + boundBottom;
    const boundingWidth = entry.boundingClientRect.width + boundLeft + boundRight;
    const boundingArea = boundingHeight * boundingWidth;
    if (boundingArea && minPercentage > intersectionArea / boundingArea) return false;
  }

  return true;
}

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
  const event = buildSelfDescribingEvent({ event: payload });

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
  const context: Entity[] = [];

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
  setTimeout(dispatchToTrackersInCollection, 0, config.trackers, trackers, (tracker: BrowserTracker) =>
    tracker.core.track(event, context)
  );
}

function handleCreate(nowTs: number, config: Configuration, node: Node | Element) {
  if (nodeIsElement(node) && node.matches(config.selector)) {
    elementsState.set(
      node,
      patchState({
        state: ElementStatus.CREATED,
        createdTs: nowTs,
      })
    );
    elementsState.get(node)?.matches.add(config);
    trackEvent(Events.ELEMENT_CREATE, config, node);
    if (config.expose.when !== Frequency.NEVER && intersectionObserver) intersectionObserver.observe(node);
  }
}

function mutationCallback(mutations: MutationRecord[]): void {
  const nowTs = performance.now() - performance.timeOrigin;
  mutations.forEach((record) => {
    configurations.forEach((config) => {
      const createFn = handleCreate.bind(null, nowTs, config);

      if (record.type === 'attributes') {
        if (nodeIsElement(record.target)) {
          const element = record.target;
          const prevState = elementsState.get(element);

          if (prevState) {
            if (!element.matches(config.selector)) {
              if (prevState.matches.has(config)) {
                if (prevState.state === ElementStatus.EXPOSED) trackEvent(Events.ELEMENT_OBSCURE, config, element);
                trackEvent(Events.ELEMENT_DESTROY, config, element);
                prevState.matches.delete(config);
                if (intersectionObserver) intersectionObserver.unobserve(element);
                elementsState.set(element, patchState({ state: ElementStatus.DESTROYED }, prevState));
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
        record.addedNodes.forEach(createFn);
        record.removedNodes.forEach((node) => {
          if (nodeIsElement(node) && node.matches(config.selector)) {
            const state = elementsState.get(node) ?? patchState({});
            if (state.state === ElementStatus.EXPOSED) trackEvent(Events.ELEMENT_OBSCURE, config, node);
            trackEvent(Events.ELEMENT_DESTROY, config, node);
            if (intersectionObserver) intersectionObserver.unobserve(node);
            elementsState.set(node, patchState({ state: ElementStatus.DESTROYED }, state));
          }
        });
      }
    });
  });
}

function intersectionCallback(entries: IntersectionObserverEntry[], observer: IntersectionObserver): void {
  entries.forEach((entry) => {
    const state = elementsState.get(entry.target) ?? patchState({});
    configurations.forEach((config) => {
      if (entry.target.matches(config.selector)) {
        const siblings = getMatchingElements(config);
        const position = siblings.findIndex((el) => el.isSameNode(entry.target)) + 1;
        if (entry.isIntersecting) {
          const elapsedVisibleMs = [ElementStatus.PENDING, ElementStatus.EXPOSED].includes(state.state)
            ? state.elapsedVisibleMs + (entry.time - state.lastObservationTs)
            : state.elapsedVisibleMs;
          elementsState.set(
            entry.target,
            patchState(
              {
                state: ElementStatus.PENDING,
                lastObservationTs: entry.time,
                elapsedVisibleMs,
              },
              state
            )
          );

          if (shouldTrackExpose(config, entry)) {
            if (config.expose.minTimeMillis <= state.elapsedVisibleMs) {
              elementsState.set(
                entry.target,
                patchState(
                  {
                    state: ElementStatus.EXPOSED,
                    lastObservationTs: entry.time,
                    elapsedVisibleMs,
                  },
                  state
                )
              );
              trackEvent(Events.ELEMENT_EXPOSE, config, entry.target, {
                boundingRect: entry.boundingClientRect,
                position,
                matches: siblings.length,
              });
            } else {
              requestAnimationFrame(() => {
                // check visibility time next frame
                observer.unobserve(entry.target); // observe is no-op for already observed elements
                observer.observe(entry.target);
              });
            }
          }
        } else if (state.state !== ElementStatus.DESTROYED) {
          if (state.state === ElementStatus.EXPOSED) {
            trackEvent(Events.ELEMENT_OBSCURE, config, entry.target, {
              boundingRect: entry.boundingClientRect,
              position,
              matches: siblings.length,
            });
          }

          elementsState.set(
            entry.target,
            patchState(
              {
                state: ElementStatus.OBSCURED,
                lastObservationTs: entry.time,
              },
              state
            )
          );
        }
      }
    });
  });
}
