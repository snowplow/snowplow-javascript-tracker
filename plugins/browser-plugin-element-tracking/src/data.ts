import type { Configuration } from './configuration';
import { ElementContentEntity, ElementDetailsEntity, Entities } from './schemata';
import { AttributeList } from './types';

export type DataSelector =
  | ((element: Element) => Record<string, any>)
  | { attributes: string[] }
  | { properties: string[] }
  | { dataset: string[] }
  | { selector: boolean }
  | { content: Record<string, string | RegExp> }
  | { child_text: Record<string, string> }
  | { match: Record<string, string> };

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

export function extractSelectorDetails(element: Element, path: string, selectors: DataSelector[]): AttributeList {
  return selectors.reduce((attributes: AttributeList, selector) => {
    const result = evaluateDataSelector(element, path, selector);

    if (result.length) {
      return attributes.concat(result);
    }

    return attributes;
  }, []);
}

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
        const child = element.querySelector(selector);
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

      if (element.textContent) {
        try {
          const match = pattern.exec(element.textContent);
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
      if (!result.some((r) => r.attribute === attribute && r.value === value)) return [];
    }
  }

  return result;
}

export function buildContentTree(
  config: Configuration,
  element: Element,
  parentPosition: number = 1
): ElementContentEntity[] {
  const context: ElementContentEntity[] = [];
  if (element && config.contents.length) {
    config.contents.forEach((contentConfig) => {
      const contents = Array.from(element.querySelectorAll(contentConfig.selector));

      contents.forEach((contentElement, i) => {
        context.push({
          schema: Entities.ELEMENT_CONTENT,
          data: {
            element_name: contentConfig.name,
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

export function getElementDetails(
  config: Configuration,
  element: Element,
  rect: DOMRect = element.getBoundingClientRect(),
  position?: number,
  matches?: number
): ElementDetailsEntity {
  return {
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
  };
}
