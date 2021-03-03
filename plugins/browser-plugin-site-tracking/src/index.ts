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

import { BrowserPlugin, BrowserTracker } from '@snowplow/browser-tracker-core';
import { SelfDescribingJson, Timestamp } from '@snowplow/tracker-core';

const _trackers: Record<string, BrowserTracker> = {};

export function SiteTrackingPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker) => {
      _trackers[tracker.id] = tracker;
    },
  };
}

/**
 * Track a social interaction event
 *
 * @param string action (required) Social action performed
 * @param string network (required) Social network
 * @param string target Object of the social action e.g. the video liked, the tweet retweeted
 * @param object Custom context relating to the event
 * @param tstamp number or Timestamp object
 */
export const trackSocialInteraction = function (
  {
    action,
    network,
    target,
    context,
    tstamp,
  }: { action: string; network: string; target: string; context: Array<SelfDescribingJson>; tstamp: Timestamp },
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t].core.trackSocialInteraction(action, network, target, context, tstamp);
    }
  });
};

/**
 * Track an internal search event
 *
 * @param array terms Search terms
 * @param object filters Search filters
 * @param number totalResults Number of results
 * @param number pageResults Number of results displayed on page
 * @param array context Optional. Context relating to the event.
 * @param tstamp Opinal number or Timestamp object
 */
export const trackSiteSearch = function (
  {
    terms,
    filters,
    totalResults,
    pageResults,
    context,
    tstamp,
  }: {
    terms: Array<string>;
    filters: Record<string, string | boolean>;
    totalResults: number;
    pageResults: number;
    context: Array<SelfDescribingJson>;
    tstamp: Timestamp;
  },
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t].core.trackSiteSearch(terms, filters, totalResults, pageResults, context, tstamp);
    }
  });
};

/**
 * Track a timing event (such as the time taken for a resource to load)
 *
 * @param string category Required.
 * @param string variable Required.
 * @param number timing Required.
 * @param string label Optional.
 * @param array context Optional. Context relating to the event.
 * @param tstamp Opinal number or Timestamp object
 */
export const trackTiming = function (
  {
    category,
    variable,
    timing,
    label,
    context,
    tstamp,
  }: {
    category: string;
    variable: string;
    timing: number;
    label: string;
    context: Array<SelfDescribingJson>;
    tstamp: Timestamp;
  },
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t].core.trackSelfDescribingEvent(
        {
          schema: 'iglu:com.snowplowanalytics.snowplow/timing/jsonschema/1-0-0',
          data: {
            category: category,
            variable: variable,
            timing: timing,
            label: label,
          },
        },
        context,
        tstamp
      );
    }
  });
};
