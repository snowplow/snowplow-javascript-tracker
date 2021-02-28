import { warn } from './helpers';
import { BrowserTracker } from './tracker/types';

const groupedTrackers: Record<string, Record<string, BrowserTracker>> = {};
const namedTrackers: Record<string, BrowserTracker> = {};

export function addTracker(name: string, tracker: BrowserTracker): void;
export function addTracker(name: string, tracker: BrowserTracker, group: string): void;
export function addTracker(name: string, tracker: BrowserTracker, group = 'snowplow') {
  if (!groupedTrackers.hasOwnProperty(group)) {
    groupedTrackers[group] = {};
  }

  if (!groupedTrackers[group].hasOwnProperty(name)) {
    groupedTrackers[group][name] = tracker;
    namedTrackers[name] = tracker;
  } else {
    warn(name + ' already exists.');
  }
}

export function getTracker(name: string) {
  if (namedTrackers.hasOwnProperty(name)) {
    return namedTrackers[name];
  }

  warn(name + ' not configured');
  return null;
}

export function getTrackers(names: Array<string>): Array<BrowserTracker> {
  const trackers: Array<BrowserTracker> = [];
  for (const key in namedTrackers) {
    if (names.indexOf(key) > -1) {
      trackers.push(namedTrackers[key]);
    }
  }
  return trackers;
}

export function allTrackers() {
  return Object.keys(namedTrackers).map((k) => namedTrackers[k]);
}

export function allTrackerNames() {
  return Object.keys(namedTrackers);
}

export function allTrackersForGroup(group = 'snowplow') {
  if (!groupedTrackers.hasOwnProperty(group)) {
    return [];
  }

  return Object.keys(groupedTrackers[group]).map((k) => groupedTrackers[group][k]);
}
