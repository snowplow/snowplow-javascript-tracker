import { AttributeList } from './types';

export type DataSelector =
  | ((element: Element) => Record<string, any>)
  | { attributes: string[] }
  | { properties: string[] }
  | { dataset: string[] }
  | { selector: boolean }
  | { content: Record<string, string | RegExp> }
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

  const knownKeys = ['match', 'content', 'selector', 'dataset', 'attributes', 'properties'] as const;
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

function evaluateDataSelector(element: HTMLElement | Element, path: string, selector: DataSelector): AttributeList {
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

  return result;
}
