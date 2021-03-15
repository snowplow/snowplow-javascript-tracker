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
  EventJson,
  EventJsonWithKeys,
  JsonProcessor,
  Logger,
  LOG_LEVEL,
  Payload,
  PayloadBuilder,
  payloadJsonProcessor,
} from '@snowplow/tracker-core';

/**
 * Adds advertisement tracking functions
 */
export function DebuggerPlugin(logLevel: LOG_LEVEL = LOG_LEVEL.debug): BrowserPlugin {
  let LOG: Logger;
  let tracker: BrowserTracker;

  function jsonInterceptor(encodeBase64: boolean): JsonProcessor {
    return (payloadBuilder: PayloadBuilder, jsonForProcessing: EventJson) => {
      if (jsonForProcessing.length) {
        for (const json of jsonForProcessing) {
          LOG.debug(`${tracker.id}: ${getJsonType(json)} JSON`, json[2]);
        }
      }
      return payloadJsonProcessor(encodeBase64)(payloadBuilder, jsonForProcessing);
    };
  }

  return {
    logger: (logger) => {
      LOG = logger;
      LOG.setLogLevel(logLevel);
    },
    activateBrowserPlugin: (t) => {
      tracker = t;
      LOG.debug(`${tracker.id}: Tracker Activated`);
    },
    beforeTrack: (payloadBuilder: PayloadBuilder) => {
      payloadBuilder.withJsonProcessor(jsonInterceptor(tracker.core.getBase64Encoding()));
      const payload = payloadBuilder.build();
      LOG.debug(`${tracker.id}: Tracking event`, payload['e']);
    },
    afterTrack: (payload: Payload) => {
      LOG.debug(`${tracker.id}: Tracked event`, payload);
    },
  };
}

function getJsonType(json: EventJsonWithKeys) {
  switch (json[0]) {
    case 'cx':
      return 'Context';
    case 'ue_px':
      return 'Unstructured event';
    default:
      return `${json[0]}, ${json[1]}`;
  }
}
