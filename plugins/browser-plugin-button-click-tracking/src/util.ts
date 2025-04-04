import { CommonEventProperties } from '@snowplow/tracker-core';
import { ButtonClickEvent, Filter, FilterFunction } from './types';

/**
 * Convert any {@link Filter} or undefined into a {@link FilterFunction}
 *
 * @param filter - The filter to convert
 * @returns The filter function
 */
export function filterFunctionFromFilter(filter?: Filter): FilterFunction {
  // If a function is provided, return it as-is
  if (typeof filter === 'function') {
    return filter;
  }

  if (typeof filter === 'object') {
    // If an allowlist is provided, return a function which matches the allowlist
    if ('allowlist' in filter) {
      return (element) => {
        const classes = Array.from(element?.classList || []);
        return classes.some((className) => filter.allowlist.includes(className));
      };
    }

    // If a denylist is provided, return a function which matches the denylist
    if ('denylist' in filter) {
      return (element) => {
        const classes = Array.from(element?.classList || []);
        return !classes.some((className) => filter.denylist.includes(className));
      };
    }
  }

  // Return a function that will match all buttons if no filter is provided
  return () => true;
}

/**
 * Creates a {@link ButtonClickEvent} from a button element
 *
 * @param button - The button element to create the event from
 * @returns The button click event
 */
export function createEventFromButton(
  button: HTMLButtonElement | HTMLInputElement,
  defaultLabel?: string | ((element: HTMLElement) => string)
): ButtonClickEvent & CommonEventProperties {
  let ret = {} as ButtonClickEvent & CommonEventProperties;

  if (button.tagName === 'INPUT') {
    ret.label = button.dataset.spButtonLabel || button.value;
  } else {
    ret.label =
      button.dataset.spButtonLabel ||
      button.innerText ||
      (typeof defaultLabel === 'function' ? defaultLabel(button) : defaultLabel) ||
      '(empty)';
  }

  button.id && (ret.id = button.id);
  button.name && (ret.name = button.name);
  button.classList.length && (ret.classes = Array.from(button.classList));

  return ret;
}
