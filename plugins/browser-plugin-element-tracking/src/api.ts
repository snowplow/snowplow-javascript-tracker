import {
  type BrowserPlugin,
  type BrowserTracker,
  dispatchToTrackersInCollection,
} from '@snowplow/browser-tracker-core';
import { type Logger, buildSelfDescribingEvent } from '@snowplow/tracker-core';

import { checkConfig, type Configuration, ConfigurationState, type ElementConfiguration } from './configuration';
import { extractSelectorDetails } from './data';
import { ComponentsEntity, ElementContentEntity, Entities, Entity, Events, Event } from './schemata';
import type { OneOrMany } from './types';

type ElementTrackingConfiguration = {
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

let LOG: Logger | undefined = undefined;
let mutationObserver: MutationObserver | false = false;
let intersectionObserver: IntersectionObserver | false = false;

/**
 * Element Tracking plugin to track the (dis)appearance and visiblity of DOM elements.
 */
export function SnowplowElementTrackingPlugin(): BrowserPlugin {
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
export function startElementTracking({ elements = [] }: ElementTrackingConfiguration, trackers?: Array<string>): void {
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
      const valid = checkConfig(config, trackers);
      configurations.push(valid);
      if (valid.id) configurationsById[valid.id] = valid;
    } catch (e) {
      LOG?.error('Failed to process Element Tracking configuration', e, config);
    }
  });

  configurations.forEach((config) => {
    const { create, expose, obscure, selector, state } = config;
    if (state === ConfigurationState.INITIAL) {
      config.state = ConfigurationState.CONFIGURED;

      const elements = Array.from(document.querySelectorAll(selector));

      if (create && elements.length) {
        // elements exist, that's a create
        elements.forEach((element, i) =>
          trackEvent(Events.ELEMENT_CREATE, config, { element, position: i + 1, matches: elements.length })
        );
        config.state = ConfigurationState.CREATED;
      }

      if (intersectionObserver && (expose || obscure)) {
        elements.forEach((e) => intersectionObserver && intersectionObserver.observe(e));
      }
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

const componentGenerator = (...params: any[]): ComponentsEntity | null => {
  const elementParams = params.filter((arg) => arg instanceof Node && nodeIsElement(arg));

  if (!elementParams.length) return null;

  const components: string[] = [];

  elementParams.forEach((elem) => {
    configurations.forEach((config) => {
      if (!config.component) return;

      const ancestor = elem.closest(config.selector);
      if (ancestor !== null) components.push(config.name);
    });
  });

  return components.length
    ? {
        schema: Entities.COMPONENT_PARENTS,
        data: {
          component_list: components,
        },
      }
    : null;
};

export function getComponentListGenerator(fn?: (generator: typeof componentGenerator) => void) {
  if (fn) fn(componentGenerator);
  return componentGenerator;
}

function trackEvent<T extends Events>(
  schema: T,
  config: Configuration,
  options?: Partial<{
    element: Element | HTMLElement;
    boundingRect: DOMRect;
    position: number;
    matches: number;
  }>
): void {
  const { element, boundingRect, position, matches } = options ?? {};

  dispatchToTrackersInCollection(config.trackers, trackers, (tracker) => {
    const payload: Event<T> = {
      schema,
      data: {
        element_name: config.name,
      },
    };
    const event = buildSelfDescribingEvent({ event: payload });
    const context: Entity[] = [];

    if (element) {
      if (config.details) {
        const rect = boundingRect ?? element.getBoundingClientRect();
        context.push({
          schema: Entities.ELEMENT_DETAILS,
          data: {
            element_name: config.name,
            width: rect.width,
            height: rect.height,
            position_x: rect.x,
            position_y: rect.y,
            position,
            matches,
            attributes: extractSelectorDetails(element, config.selector, config.details),
          },
        });
      }

      if (config.contents.length) {
        context.push(...buildContentTree(config, element, position));
      }

      const components = componentGenerator(element);
      if (components) context.push(components);
    }

    if (config.aggregateStats) {
    }

    tracker.core.track(event, context);
  });
}

function mutationCallback(mutations: MutationRecord[]): void {
  mutations.forEach((record) => {
    if (record.type === 'attributes') {
      // TODO: what if existing node now matches selector?
    } else if (record.type === 'childList') {
      configurations.forEach((config) => {
        record.addedNodes.forEach((node) => {
          if (nodeIsElement(node) && node.matches(config.selector)) {
            if (config.create) trackEvent(Events.ELEMENT_CREATE, config, { element: node });

            config.state = ConfigurationState.CREATED;
            if (config.expose && intersectionObserver) intersectionObserver.observe(node);
          }
        });
        record.removedNodes.forEach((node) => {
          if (nodeIsElement(node) && node.matches(config.selector)) {
            if (config.obscure && config.state === ConfigurationState.EXPOSED)
              trackEvent(Events.ELEMENT_OBSCURE, config, { element: node });
            if (config.destroy) trackEvent(Events.ELEMENT_DESTROY, config, { element: node });
            config.state = ConfigurationState.DESTROYED;
          }
        });
      });
    }
  });
}

function intersectionCallback(entries: IntersectionObserverEntry[]): void {
  entries.forEach((entry) => {
    configurations.forEach((config) => {
      if (entry.target.matches(config.selector)) {
        const siblings = Array.from(document.querySelectorAll(config.selector));
        const position = siblings.findIndex((el) => el.isSameNode(entry.target)) + 1;

        if (entry.isIntersecting) {
          if (config.expose) {
            trackEvent(Events.ELEMENT_EXPOSE, config, {
              element: entry.target,
              boundingRect: entry.boundingClientRect,
              position,
              matches: siblings.length,
            });
          }
          config.state = ConfigurationState.EXPOSED;
        } else if (config.state !== ConfigurationState.DESTROYED) {
          if (config.obscure) {
            trackEvent(Events.ELEMENT_OBSCURE, config, {
              element: entry.target,
              boundingRect: entry.boundingClientRect,
              position,
              matches: siblings.length,
            });
          }

          config.state = ConfigurationState.OBSCURED;
        }
      }
    });
  });
}

function buildContentTree(config: Configuration, element: Element, parentPosition: number = 1): ElementContentEntity[] {
  const context: ElementContentEntity[] = [];
  if (element && config.contents.length) {
    config.contents.forEach((contentConfig) => {
      const contents = Array.from(element.querySelectorAll(contentConfig.selector));

      contents.forEach((contentElement, i) => {
        context.push({
          schema: Entities.ELEMENT_CONTENT,
          data: {
            name: contentConfig.name,
            parent_name: config.name,
            parent_position: parentPosition,
            position: i + 1,
            attributes: extractSelectorDetails(contentElement, contentConfig.selector, contentConfig.details),
          },
        });

        context.push(...buildContentTree(contentConfig, contentElement, i + 1));
      });
    });
  }

  return context;
}

function nodeIsElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}
