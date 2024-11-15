import type { Configuration } from './configuration';

export enum ElementStatus {
  INITIAL,
  CREATED,
  DESTROYED,
  EXPOSED,
  PENDING,
  OBSCURED,
}

type ElementState = {
  state: ElementStatus;
  createdTs: number;
  lastObservationTs: number;
  elapsedVisibleMs: number;
  lastPosition: number;
  matches: Set<Configuration>;
};

export const elementsState =
  typeof WeakMap !== 'undefined' ? new WeakMap<Element, ElementState>() : new Map<Element, ElementState>();

export function patchState(updates: Partial<ElementState>, basis?: ElementState): ElementState {
  const nowTs = performance.now();
  return {
    state: ElementStatus.INITIAL,
    matches: new Set(),
    createdTs: nowTs + performance.timeOrigin,
    lastPosition: -1,
    lastObservationTs: nowTs,
    elapsedVisibleMs: 0,
    ...basis,
    ...(updates || {}),
  };
}
