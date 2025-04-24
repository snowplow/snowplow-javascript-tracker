import type { Configuration } from './configuration';
import { Entities, type ElementStatisticsEntity } from './schemata';

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
   * The pageview ID when we first observed this element.
   */
  originalPageViewId: string;
  /**
   * The last position we saw of this element amongst the other matches we saw for this element.
   */
  lastPosition: number;
  /**
   * The last non-0 size information available for this element.
   */
  lastKnownSize?: DOMRect;
  /**
   * The other matches for this element's selector we last saw, of which the element is/was at `lastPosition`-1 position.
   */
  matches: Set<Configuration>;
  /**
   * Smallest size dimensions seen so far for this element.
   */
  minSize?: [number, number];
  /**
   * Largest size dimensions seen so far for this element.
   */
  maxSize?: [number, number];
  /**
   * Largest vertical depth seen so far for this element, and the height the element was at that time.
   */
  maxDepth?: [number, number];
  /**
   * Number of times this element has entered viewport so far.
   */
  views: number;
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
      originalPageViewId: '',
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

const stateLabels: Record<ElementStatus, string> = {
  [ElementStatus.CREATED]: 'exists',
  [ElementStatus.DESTROYED]: 'destroyed',
  [ElementStatus.EXPOSED]: 'on screen',
  [ElementStatus.INITIAL]: 'unknown',
  [ElementStatus.OBSCURED]: 'off screen',
  [ElementStatus.PENDING]: 'awaiting time criteria',
};

const compareSize = (a: [number, number], b?: [number, number]) => {
  if (b === undefined) return 0;
  const asize = a[0] * a[1];
  const bsize = b[0] * b[1];
  return asize - bsize;
};

export function aggregateStats(
  element_name: string,
  target: Element,
  index: number,
  matches: number
): ElementStatisticsEntity {
  const state = getState(target);
  const stateLabel = stateLabels[state.state];

  const rect = target.getBoundingClientRect();
  const curSize: [number, number] = [rect.width, rect.height];
  const minSize = compareSize(curSize, state.minSize) <= 0 ? curSize : state.minSize!;
  const maxSize = compareSize(curSize, state.maxSize) < 0 ? state.maxSize! : curSize;

  const vpBottom = window.visualViewport
    ? window.visualViewport.height + window.visualViewport.pageTop
    : window.innerHeight + window.scrollY;
  const curDepth: [number, number] = [Math.min(vpBottom, rect.top + rect.height) - rect.top, rect.height];
  const maxDepth =
    state.maxDepth === undefined || state.maxDepth[1] === 0
      ? curDepth
      : curDepth[1] === 0
      ? state.maxDepth
      : curDepth[0] / curDepth[1] > state.maxDepth[0] / state.maxDepth[1]
      ? curDepth
      : state.maxDepth;

  Object.assign(state, { minSize, maxSize, maxDepth });

  return {
    schema: Entities.ELEMENT_STATISTICS,
    data: {
      element_name,
      element_index: index,
      element_matches: matches,
      current_state: stateLabel,
      min_size: minSize.join('x'),
      current_size: curSize.join('x'),
      max_size: maxSize.join('x'),
      y_depth_ratio: curDepth[1] === 0 ? null : curDepth[0] / curDepth[1],
      max_y_depth_ratio: maxDepth[1] === 0 ? null : maxDepth[0] / maxDepth[1],
      max_y_depth: maxDepth.join('/'),
      element_age_ms: Math.floor(performance.now() - (state.createdTs - performance.timeOrigin)),
      times_in_view: state.views,
      total_time_visible_ms: Math.floor(state.elapsedVisibleMs),
    },
  };
}
