import type { Configuration } from './configuration';

export enum ElementStatus {
  INITIAL,
  CREATED,
  DESTROYED,
  EXPOSED,
  PENDING,
  OBSCURED,
}

/**
 * Keeps track of per-element stuff we need to keep track of.
 */
type ElementState = {
  /**
   * Last known state for this element. Used to decide if events should be triggered or not when it's otherwise ambiguous.
   */
  state: ElementStatus;
  /**
   * When the element was first seen/deemed "created"; for use in aggregate stats in future version.
   */
  createdTs: number;
  /**
   * Last time we evaluated this element for a state change. Used for a delta to calculate cumulative visible time.
   */
  lastObservationTs: number;
  /**
   * The above mentioned cumulative visible time.
   */
  elapsedVisibleMs: number;
  /**
   * The last position we saw of this element amongst the other matches we saw for this element.
   */
  lastPosition: number;
  /**
   * The other matches for this element's selector we last saw, of which the element is/was at `lastPosition`-1 position.
   */
  matches: Set<Configuration>;
};

/**
 * Bank of per-element state that needs to be stored.
 */
const elementsState =
  typeof WeakMap !== 'undefined' ? new WeakMap<Element, ElementState>() : new Map<Element, ElementState>();

/**
 * Obtain element state from `elementState`, creating with sane defaults if element is unknown.
 * @param target Element to obtain state for.
 * @param initial Initial state to include in the state if created.
 * @returns State for the target element.
 */
export function getState(target: Element, initial: Partial<ElementState> = {}): ElementState {
  if (elementsState.has(target)) {
    return elementsState.get(target)!;
  } else {
    const nowTs = performance.now();
    const state: ElementState = {
      state: ElementStatus.INITIAL,
      matches: new Set(),
      createdTs: nowTs + performance.timeOrigin,
      lastPosition: -1,
      lastObservationTs: nowTs,
      elapsedVisibleMs: 0,
      views: 0,
      ...initial,
    };
    elementsState.set(target, state);
    return state;
  }
}

