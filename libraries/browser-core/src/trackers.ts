/*
 * Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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
