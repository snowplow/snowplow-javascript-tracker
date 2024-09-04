/*
 * Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang
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

import { LOG } from '@snowplow/tracker-core';
import { SharedState } from './state';
import { Tracker } from './tracker';
import { BrowserTracker, TrackerConfiguration } from './tracker/types';
import { asyncCookieStorage } from './tracker/cookie_storage';

const namedTrackers: Record<string, BrowserTracker> = {};

/**
 * Dispatch function to all specified trackers
 *
 * @param trackers - An optional list of trackers to send the event to, or will send to all trackers
 * @param fn - The function which will run against each tracker
 */
export function dispatchToTrackers(trackers: Array<string> | undefined, fn: (t: BrowserTracker) => void) {
  try {
    getTrackers(trackers ?? allTrackerNames()).forEach(fn);
  } catch (ex) {
    LOG.error('Function failed', ex);
  }
}

/**
 * Dispatch function to all specified trackers from the supplied collection
 *
 * @param trackers - An optional list of trackers to send the event to, or will send to all trackers
 * @param trackerCollection - The collection which the trackers will be selected from
 * @param fn - The function which will run against each tracker
 */
export function dispatchToTrackersInCollection(
  trackers: Array<string> | undefined,
  trackerCollection: Record<string, BrowserTracker>,
  fn: (t: BrowserTracker) => void
) {
  try {
    getTrackersFromCollection(trackers ?? Object.keys(trackerCollection), trackerCollection).forEach(fn);
  } catch (ex) {
    LOG.error('Function failed', ex);
  }
}

/**
 * Checks if a tracker has been created for a particular identifier
 * @param trackerId - The unique identifier of the tracker
 */
export function trackerExists(trackerId: string) {
  return namedTrackers.hasOwnProperty(trackerId);
}

/**
 * Creates a Tracker and adds it to the internal collection
 * @param trackerId - The unique identifier of the tracker
 * @param namespace - The namespace of the tracker, tracked with each event as `tna`
 * @param version - The current version of the tracker library
 * @param endpoint - The endpoint to send events to
 * @param sharedState - The instance of shared state to use for this tracker
 * @param configuration - The configuration to use for this tracker instance
 */
export function addTracker(
  trackerId: string,
  namespace: string,
  version: string,
  endpoint: string,
  sharedState: SharedState,
  configuration?: TrackerConfiguration
) {
  if (!namedTrackers.hasOwnProperty(trackerId)) {
    namedTrackers[trackerId] = Tracker(trackerId, namespace, version, endpoint, sharedState, configuration);
    return namedTrackers[trackerId];
  }
  return null;
}

/**
 * Gets a single instance of the internal tracker object
 * @param trackerId - The unique identifier of the tracker
 * @returns The tracker instance, or null if not found
 */
export function getTracker(trackerId: string) {
  if (namedTrackers.hasOwnProperty(trackerId)) {
    return namedTrackers[trackerId];
  }

  LOG.warn(trackerId + ' not configured');
  return null;
}

/**
 * Gets an array of tracker instances based on the list of identifiers
 * @param trackerIds - An array of unique identifiers of the trackers
 * @returns The tracker instances, or empty list if none found
 */
export function getTrackers(trackerIds: Array<string>): Array<BrowserTracker> {
  return getTrackersFromCollection(trackerIds, namedTrackers);
}

/**
 * Gets all the trackers as a object, keyed by their unique identifiers
 */
export function allTrackers() {
  return namedTrackers;
}

/**
 * Returns all the unique tracker identifiers
 */
export function allTrackerNames() {
  return Object.keys(namedTrackers);
}

function getTrackersFromCollection(
  trackerIds: Array<string>,
  trackerCollection: Record<string, BrowserTracker>
): Array<BrowserTracker> {
  const trackers: Array<BrowserTracker> = [];
  for (const id of trackerIds) {
    if (trackerCollection.hasOwnProperty(id)) {
      trackers.push(trackerCollection[id]);
    } else {
      LOG.warn(id + ' not configured');
    }
  }
  return trackers;
}

/**
 * Write all pending cookies to the browser.
 * Useful if you track events just before the page is unloaded.
 * This call is not necessary if `synchronousCookieWrite` is set to `true`.
 */
export function flushPendingCookies() {
  asyncCookieStorage.flush();
}
