Ddd;

/*
 * JavaScript tracker for Snowplow: init.js
 *
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright
 * 2012-2020 Snowplow Analytics Ltd. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 *
 * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
 * names of their contributors may be used to endorse or promote products
 * derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// Snowplow Asynchronous Queue

/*
 * Get the name of the global input function
 */

import { Tracker } from './tracker';
import { SharedState } from './shared_state';
import { version } from './version';
import { warn } from './lib/helpers';
import pickBy from 'lodash/pickBy';
import includes from 'lodash/includes';

const groups = {};

/**
 * Initiate a new tracker
 *
 * @param string name
 * @param string endpoint in the form collector.mysite.com
 * @param object argmap contains the initialisation options of the JavaScript tracker
 * @param string trackerGroup used to group multiple trackers and shared state together
 */
export const newTracker = (name, endpoint, argmap = {}, trackerGroup = 'snowplow') => {
  if (!groups.hasOwnProperty(trackerGroup)) {
    groups[trackerGroup] = { state: new SharedState(), trackers: {} };
  }

  const trackerDictionary = groups[trackerGroup].trackers;
  const state = groups[trackerGroup].state;

  if (!trackerDictionary.hasOwnProperty(name)) {
    trackerDictionary[name] = new Tracker(trackerGroup, name, version, state, argmap);
    trackerDictionary[name].setCollectorUrl(endpoint);
  } else {
    warn('Tracker namespace ' + name + ' already exists.');
  }

  return trackerDictionary[name];
};

export const getTracker = (namespace, trackerGroup = 'snowplow') => {
  if (groups.hasOwnProperty(trackerGroup) && groups[trackerGroup].trackers.hasOwnProperty(namespace)) {
    return groups[trackerGroup].trackers[namespace];
  }

  warn('Warning: No tracker configured');
  return null;
};

export const getTrackers = (namespaces, trackerGroup = 'snowplow') => {
  if (groups.hasOwnProperty(trackerGroup)) {
    return pickBy(groups[trackerGroup].trackers, (_, key) => {
      return includes(namespaces, key);
    });
  }

  warn('Warning: No trackers configured');
  return {};
};

export const allTrackers = (trackerGroup = 'snowplow') => {
  if (groups.hasOwnProperty(trackerGroup)) {
    return groups[trackerGroup].trackers;
  }

  warn('Warning: No trackers configured');
  return {};
};
