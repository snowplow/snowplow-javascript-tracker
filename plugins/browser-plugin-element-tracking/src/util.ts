import { Configuration } from './configuration';
import { Frequency } from './types';

/**
 * Parses custom boundaries config.
 * @param boundaryPixels Input format boundaries.
 * @returns Object describing the input boundary configuration.
 */
export function defineBoundaries(boundaryPixels: number | [number, number] | [number, number, number, number]) {
  let boundTop: number, boundRight: number, boundBottom: number, boundLeft: number;
  if (typeof boundaryPixels === 'number') {
    boundTop = boundRight = boundBottom = boundLeft = boundaryPixels;
  } else if (Array.isArray(boundaryPixels)) {
    if (boundaryPixels.length === 2) {
      boundTop = boundBottom = boundaryPixels[0];
      boundRight = boundLeft = boundaryPixels[1];
    } else if (boundaryPixels.length === 4) {
      [boundTop, boundRight, boundBottom, boundLeft] = boundaryPixels;
    } else {
      boundTop = boundRight = boundBottom = boundLeft = 0;
    }
  } else {
    boundTop = boundRight = boundBottom = boundLeft = 0;
  }

  return { boundTop, boundRight, boundBottom, boundLeft };
}

/**
 * Gets descendent elements of `target` (`document` by default) that match the selector info in `config`.
 * This is usually a wrapper around `querySelectorAll`, but accounts for shadow roots that can be specified in `config`.
 * @param config The configuration containing the selector and other details that influence how elements will be found.
 * @param target The root to start finding descendent elements from; defaults to `document`
 * @returns Array of elements within `target` that matched the configuration in `config`.
 */
export function getMatchingElements(config: Configuration, target: ParentNode = document) {
  const { selector, shadowOnly, shadowSelector } = config;
  const elements: Element[] = shadowOnly ? [] : Array.from(target.querySelectorAll(selector));

  if (shadowSelector) {
    Array.from(target.querySelectorAll(shadowSelector), (host) => {
      if (host.shadowRoot) {
        // these will have been skipped in the above check but should be included if we're recursing
        if (shadowOnly) elements.push(...Array.from(host.shadowRoot.querySelectorAll(selector)));
        // look for nested shadow elements
        elements.push(...getMatchingElements(config, host.shadowRoot));
      }
    });
  }

  return elements;
}

/**
 * Type guard to check that `Node` is an `Element`
 * @param node Node to check.
 * @returns If `node` is an Element.
 */
export function nodeIsElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}

/**
 * Evaluates whether the current intersection is eligible for firing an EXPOSE event against the given configuration.
 * Mostly this handles "disabled" config (when: never), minimum size/intersection checks and custom boundaries.
 */
export function shouldTrackExpose(config: Configuration, entry: IntersectionObserverEntry): boolean {
  if (config.expose.when === Frequency.NEVER) return false;
  if (!entry.isIntersecting) return false;

  const { boundaryPixels, minPercentage, minSize } = config.expose;

  const { boundTop, boundRight, boundBottom, boundLeft } = defineBoundaries(boundaryPixels);

  const { boundingClientRect } = entry;
  if (boundingClientRect.height * boundingClientRect.width < minSize) return false;

  const intersectionArea = entry.intersectionRect.height * entry.intersectionRect.width;
  const boundingHeight = entry.boundingClientRect.height + boundTop + boundBottom;
  const boundingWidth = entry.boundingClientRect.width + boundLeft + boundRight;
  const boundingArea = boundingHeight * boundingWidth;
  if (minPercentage > intersectionArea / boundingArea) return false;

  return true;
}
