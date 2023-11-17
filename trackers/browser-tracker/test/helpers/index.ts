import { SharedState, TrackerConfiguration, addTracker } from '@snowplow/browser-tracker-core';

export function createTracker(configuration?: TrackerConfiguration) {
  const id = 'sp-' + Math.random();
  return addTracker(id, id, '', '', new SharedState(), configuration);
}
