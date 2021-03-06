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
import {
  buildSelfDescribingEvent,
  buildSiteSearch,
  buildSocialInteraction,
  CommonEventProperties,
  SiteSearchEvent,
  SocialInteractionEvent,
} from '@snowplow/tracker-core';

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
 * @param event The event information
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackSocialInteraction(
  event: SocialInteractionEvent & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t].core.track(buildSocialInteraction(event), event.context, event.timestamp);
    }
  });
}

/**
 * Track an internal search event
 *
 * @param event The event information
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackSiteSearch(
  event: SiteSearchEvent & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t].core.track(buildSiteSearch(event), event.context, event.timestamp);
    }
  });
}

/** A Timing Event */
export interface TimingEvent {
  /** Category of the timing event */
  category: string;
  /** The variable being timed */
  variable: string;
  /** The timing result */
  timing: number;
  /** An additional label */
  label?: string;
}

/**
 * Track a timing event (such as the time taken for a resource to load)
 *
 * @param event The event information
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackTiming(
  event: TimingEvent & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { category, variable, timing, label, context, timestamp } = event;
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t].core.track(
        buildSelfDescribingEvent({
          event: {
            schema: 'iglu:com.snowplowanalytics.snowplow/timing/jsonschema/1-0-0',
            data: {
              category,
              variable,
              timing,
              label,
            },
          },
        }),
        context,
        timestamp
      );
    }
  });
}
