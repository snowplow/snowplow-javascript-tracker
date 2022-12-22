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

import { BrowserPlugin } from '@snowplow/browser-tracker-core';
import { Logger, LOG_LEVEL, Payload } from '@snowplow/tracker-core';

/**
 * The FocalMeter Plugin
 *
 * The plugin sends requests with the domain user ID to a Kantar endpoint used with the FocalMeter system.
 * A request is made when the first event with a new user ID is tracked.
 *
 * @param kantarEndpoint URL of the Kantar endpoint to send the requests to (including protocol)
 * @param logLevel Log message level
 * @returns The plugin
 */
export function FocalMeterPlugin(kantarEndpoint: string, logLevel: LOG_LEVEL = LOG_LEVEL.debug): BrowserPlugin {
  let LOG: Logger;
  let lastUserId: string | undefined;

  return {
    logger: (logger) => {
      LOG = logger;
      logger.setLogLevel(logLevel);
    },
    afterTrack: (payload: Payload) => {
      let newUserId = payload['duid'] as string;

      if (newUserId && newUserId != lastUserId) {
        lastUserId = newUserId;
        sendRequest(kantarEndpoint, newUserId, LOG);
      }
    },
  };
}

function sendRequest(url: string, userId: string, LOG: Logger) {
  let query = {
    vendor: 'snowplow',
    cs_fpid: userId,
    c12: 'not_set',
  };
  url +=
    '?' +
    Object.keys(query)
      .map((key) => key + '=' + (query as any)[key])
      .join('&');

  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.timeout = 5000;

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status >= 200) {
      if (xhr.status < 300) {
        LOG.debug(`ID sent to Kantar: ${userId}`);
      } else {
        LOG.error(`Kantar request failed: ${xhr.status}: ${xhr.statusText}`);
      }
    }
  };

  xhr.send();
}
