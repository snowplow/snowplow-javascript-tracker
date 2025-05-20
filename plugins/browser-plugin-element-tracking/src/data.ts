import { SelfDescribingJson } from '@snowplow/tracker-core';
import type { Configuration } from './configuration';
import { getState } from './elementsState';
import { ElementContentEntity, ElementDetailsEntity, Entities } from './schemata';
import { AttributeList, type DataSelector } from './types';
import { getMatchingElements } from './util';

/**
 * Type guard to determine if `val` is a valid `DataSelector` function or descriptor
 */
export function isDataSelector(val: unknown): val is DataSelector {
  if (val == null) return false;
  if (typeof val === 'function') return true;

  type KeysOf<T> = T extends Function ? never : keyof T;
  type AllOf<K, T extends readonly any[]> = Exclude<K, T[number]> extends never
    ? Exclude<T[number], K> extends never
      ? T
      : Exclude<T[number], K>
    : Exclude<K, T[number]>;

  const knownKeys = ['match', 'content', 'selector', 'dataset', 'attributes', 'properties', 'child_text'] as const;
  const selectorKeys: AllOf<KeysOf<DataSelector>, typeof knownKeys> = knownKeys; // type error if we add a new selector without updating knownKeys

  if (typeof val === 'object') return selectorKeys.some((key) => key in val);
  return false;
}

/**
 * Combine the results of an array of DataSelectors
 * @param element Element to select data from
 * @param path The CSS path used to select `element`, which may be requested by the `selector`
 * @param selectors The list of DataSelectors to evaluate
 * @returns Flattened list of results found processing the element.
 */
export function extractSelectorDetails(element: Element, path: string, selectors: DataSelector[]): AttributeList {
  return selectors.reduce((attributes: AttributeList, selector) => {
    const result = evaluateDataSelector(element, path, selector);

    if (result.length) {
      return attributes.concat(result);
    } else if ('match' in selector) return [];

    return attributes;
  }, []);
}

/**
 * Combine the results of an array of DataSelectors
 * @param element Element to select data from
 * @param path The CSS path used to select `element`, which may be requested by the `selector` DataSelector type
 * @param selector The single DataSelector to evaluate
 * @returns Selector results; list of key/value/source triplets that were extracted from the element
 */
export function evaluateDataSelector(
  element: HTMLElement | Element,
  path: string,
  selector: DataSelector
): AttributeList {
  const result: AttributeList = [];

  type DataSelectorType<T = DataSelector> = (T extends T ? keyof T : never) | 'callback';
  let source: DataSelectorType = 'callback';

  if (typeof selector === 'function') {
    try {
      const discovered = selector(element);
      for (const attribute in discovered) {
        if (typeof attribute === 'string' && discovered.hasOwnProperty(attribute)) {
          const value =
            typeof discovered[attribute] === 'object'
              ? JSON.stringify(discovered[attribute])
              : String(discovered[attribute]);
          result.push({ source, attribute, value });
        }
      }
    } catch (e) {
      const value = e instanceof Error ? e.message || e.name : String(e);
      result.push({ source: 'error', attribute: 'message', value });
    }

    return result;
  }

  source = 'attributes';
  if (source in selector && Array.isArray(selector[source])) {
    selector[source].forEach((attribute) => {
      const value = element.getAttribute(attribute);

      if (value !== null) {
        result.push({ source, attribute, value });
      }
    });
  }

  source = 'properties';
  if (source in selector && Array.isArray(selector[source])) {
    selector[source].forEach((attribute) => {
      const value = (element as any)[attribute];

      if (typeof value !== 'object' && typeof value !== 'undefined') {
        result.push({ source, attribute, value: String(value) });
      }
    });
  }

  source = 'dataset';
  if (source in selector && Array.isArray(selector[source])) {
    selector[source].forEach((attribute) => {
      if ('dataset' in element) {
        const value = element.dataset[attribute];

        if (typeof value !== 'undefined') {
          result.push({ source, attribute, value: String(value) });
        }
      }
    });
  }

  source = 'child_text';
  if (source in selector && typeof selector[source] === 'object' && selector[source]) {
    Object.entries(selector[source]).forEach(([attribute, selector]) => {
      try {
        const child = element.querySelector(selector) || element.shadowRoot?.querySelector(selector);
        if (child && child.textContent) result.push({ source, attribute, value: child.textContent });
      } catch (e) {}
    });
  }

  source = 'content';
  if (source in selector && typeof selector[source] === 'object' && selector[source]) {
    Object.entries(selector[source]).forEach(([attribute, pattern]) => {
      if (!(pattern instanceof RegExp))
        try {
          pattern = new RegExp(pattern);
        } catch (e) {
          return;
        }

      const innerText = element.textContent || element.shadowRoot?.textContent;
      if (innerText) {
        try {
          const match = pattern.exec(innerText);
          if (match) {
            result.push({ source, attribute, value: match.length > 1 ? match[1] : match[0] });
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
  }

  source = 'selector';
  if (source in selector && selector[source]) {
    result.push({ source, attribute: source, value: path });
  }

  source = 'match';
  if (source in selector && selector[source]) {
    const condition = selector[source];

    for (const [attribute, value] of Object.entries(condition)) {
      if (
        !result.some(
          (r) => r.attribute === attribute && (typeof value === 'function' ? value(r.value) : r.value === value)
        )
      )
        return [];
    }
  }

  return result;
}

/**
 * Builds a flat list of `element_content` entities describing the matched element and any child configuration matches.
 * @param config A root/branch element configuration with nested `contents` configurations.
 * @param element The element that matched `config` that will be (and have its children) described.
 * @param parentPosition The position of this element amongst its matching sibling elements. Used to de-flatten the tree at analysis time.
 * @returns A list of `element_content` entities describing the elements and its content, and the same of its children.
 */
export function buildContentTree(
  config: Configuration,
  element: Element,
  parentPosition: number = 1
): (ElementContentEntity | SelfDescribingJson)[] {
  const context: (ElementContentEntity | SelfDescribingJson)[] = [];

  if (element && config.contents.length) {
    config.contents.forEach((contentConfig) => {
      const contents = getMatchingElements(contentConfig, element);

      contents.forEach((contentElement, i) => {
        const entity: ElementContentEntity = {
          schema: Entities.ELEMENT_CONTENT,
          data: {
            parent_name: config.name,
            parent_index: parentPosition,
            element_name: contentConfig.name,
            element_index: i + 1,
            attributes: extractSelectorDetails(contentElement, contentConfig.selector, contentConfig.details),
          },
        };

        context.push(entity);
        context.push(...contentConfig.context(contentElement, contentConfig));
        context.push(...buildContentTree(contentConfig, contentElement, i + 1));
      });
    });
  }

  return context;
}

/**
 * Builds an `element` entity.
 * @param config Configuration describing any additional data that should be included in the entity.
 * @param element The element this entity will describe.
 * @param rect The position/dimension information of the element.
 * @param position Which match this element is amongst those that match the Configuration's selector.
 * @param matches The total number, including this one, of elements that matched the Configuration selector.
 * @param usePreviousForEmpty Whether to use the previously seen size instead of the current one. Useful if the node no longer exists (e.g. destroyed). Will only apply if the new size is 0.
 * @returns The Element entity SDJ.
 */
export function getElementDetails(
  config: Configuration,
  element: Element,
  rect: DOMRect = element.getBoundingClientRect(),
  position?: number,
  matches?: number,
  usePreviousForEmpty: boolean = false
): ElementDetailsEntity {
  const state = getState(element);

  if (usePreviousForEmpty && state.lastKnownSize && (rect.height === 0 || rect.width === 0)) {
    rect = state.lastKnownSize;
  }

  state.lastKnownSize = rect;

  return {
    schema: Entities.ELEMENT_DETAILS,
    data: {
      element_name: config.name,
      width: rect.width,
      height: rect.height,
      position_x: rect.x,
      position_y: rect.y,
      doc_position_x: rect.x + window.scrollX,
      doc_position_y: rect.y + window.scrollY,
      element_index: position,
      element_matches: matches,
      originating_page_view: state.originalPageViewId,
      attributes: extractSelectorDetails(element, config.selector, config.details),
    },
  };
}
