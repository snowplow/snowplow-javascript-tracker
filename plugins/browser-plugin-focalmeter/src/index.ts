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

import {
  attemptGetLocalStorage,
  BrowserPlugin,
  hasLocalStorage,
  BrowserTracker,
  attemptWriteLocalStorage,
} from '@snowplow/browser-tracker-core';
import { Logger, Payload } from '@snowplow/tracker-core';

/** FocalMeter plugin configuration */
export interface FocalMeterConfiguration {
  /** URL of the Kantar endpoint to send the requests to (including protocol) */
  kantarEndpoint: string;
  /** Whether to store information about the last submitted user ID in local storage to prevent sending it again on next load (defaults not to use local storage) */
  useLocalStorage?: boolean;
}

const _trackers: Record<string, BrowserTracker> = {};
const _configurations: Record<string, FocalMeterConfiguration> = {};

/**
 * The FocalMeter Plugin
 *
 * The plugin sends requests with the domain user ID to a Kantar endpoint used with the FocalMeter system.
 * A request is made when the first event with a new user ID is tracked.
 *
 * Call `enableFocalMeterIntegration()` to enable the integration with given configuration.
 */
export function FocalMeterPlugin(): BrowserPlugin {
  let LOG: Logger;
  let lastUserId: string | undefined | null;
  let trackerId: string;

  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      trackerId = tracker.id;
      _trackers[tracker.id] = tracker;
    },

    logger: (logger: Logger) => {
      LOG = logger;
    },

    afterTrack: (payload: Payload) => {
      if (!_configurations[trackerId]) {
        LOG.error('FocalMeter integration not enabled');
        return;
      }

      let newUserId = payload['duid'] as string;
      let { kantarEndpoint, useLocalStorage } = _configurations[trackerId];

      if (!lastUserId && useLocalStorage && hasLocalStorage()) {
        let key = getLocalStorageKey(trackerId);
        lastUserId = attemptGetLocalStorage(key);
      }

      if (newUserId && newUserId != lastUserId) {
        lastUserId = newUserId;

        sendRequest(kantarEndpoint, newUserId, LOG, () => {
          // only write in local storage if the request succeeded
          if (useLocalStorage && hasLocalStorage()) {
            let key = getLocalStorageKey(trackerId);
            attemptWriteLocalStorage(key, newUserId);
          }
        });
      }
    },
  };
}

/**
 * Enables the integration with Kantar FocalMeter.
 *
 * @param configuration - Configuration with the URL endpoint to send requests to
 * @param trackers - The tracker identifiers which should have the context enabled
 */
export function enableFocalMeterIntegration(
  configuration: FocalMeterConfiguration,
  trackers: Array<string> = Object.keys(_trackers)
): void {
  for (const id of trackers) {
    if (_trackers[id]) {
      _configurations[id] = configuration;
    }
  }
}

function getLocalStorageKey(trackerId: string): string {
  return `sp-fclmtr-${trackerId}`;
}

function sendRequest(url: string, userId: string, LOG: Logger, successCallback: () => void): void {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', getKantarURL(url, userId));
  xhr.timeout = 5000;

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status >= 200) {
      if (xhr.status < 300) {
        successCallback();
        LOG.debug(`ID sent to Kantar: ${userId}`);
      } else {
        LOG.error(`Kantar request failed: ${xhr.status}: ${xhr.statusText}`);
      }
    }
  };

  xhr.send();
}

function getKantarURL(url: string, userId: string): string {
  let query: Record<string, string> = {
    vendor: 'snowplow',
    cs_fpid: userId,
    c12: 'not_set',
  };
  return (
    url +
    '?' +
    Object.keys(query)
      .map((key) => key + '=' + query[key])
      .join('&')
  );
}
