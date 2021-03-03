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
import { DynamicContexts } from '@snowplow/tracker-core';
import { TrackerAndFormConfiguration, FormTrackingConfig, addFormListeners, configureFormTracking } from './helpers';

const _trackers: Record<string, TrackerAndFormConfiguration> = {};

/**
 * Enables automatic form tracking.
 * An event will be fired when a form field is changed or a form submitted.
 * This can be called multiple times: only forms not already tracked will be tracked.
 *
 * @param object config Configuration object determining which forms and fields to track.
 *                      Has two properties: "forms" and "fields"
 * @param array context Context for all form tracking events
 */
export function enableFormTracking(
  { options, context }: { options: FormTrackingConfig; context: DynamicContexts },
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      if (_trackers[t].tracker.sharedState.hasLoaded) {
        configureFormTracking(_trackers[t], options);
        addFormListeners(_trackers[t], context);
      } else {
        _trackers[t].tracker.sharedState.registeredOnLoadHandlers.push(function () {
          configureFormTracking(_trackers[t], options);
          addFormListeners(_trackers[t], context);
        });
      }
    }
  });
}

export const FormTrackingPlugin = (): BrowserPlugin => {
  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      _trackers[tracker.id] = { tracker: tracker };
    },
  };
};
