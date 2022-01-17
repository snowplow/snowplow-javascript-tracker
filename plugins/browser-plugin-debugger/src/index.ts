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
  version,
  getSchemaParts,
  SelfDescribingJson,
} from '@snowplow/tracker-core';
import randomcolor from 'randomcolor';

/**
 * Adds advertisement tracking functions
 */
export function DebuggerPlugin(logLevel: LOG_LEVEL = LOG_LEVEL.debug): BrowserPlugin {
  let LOG: Logger;
  let tracker: BrowserTracker;
  let eventColour: string;

  const colours = {
    event: () => `color: White; background: ${eventColour}; font-weight: bold; padding: 1px 4px; border-radius: 2px;`,
    snowplowPurple: 'color: White; background: #6638B8; font-weight: bold; padding: 1px 4px; border-radius: 2px;',
    activated: 'color: White; background: #9E62DD; font-weight: bold; padding: 1px 4px; border-radius: 2px;',
    payload: 'color: White; background: #3748B8; font-weight: bold; padding: 1px 4px; border-radius: 2px;',
    json: 'color: White; background: #388AB8; font-weight: bold; padding: 1px 4px; border-radius: 2px;',
    schema: 'color: White; background: #268047; font-weight: bold; padding: 1px 4px; border-radius: 2px;',
    schemaVersion: 'color: White; background: #80265F; font-weight: bold; padding: 1px 4px; border-radius: 2px;',
  };

  const debug = (style: string, message: string, extra?: [string, ...unknown[]]) => {
    const [extraMessage, ...rest] = extra ?? [''];
    LOG.debug(
      `v${version} %c${tracker.namespace}%c %c%s` + extraMessage,
      colours.snowplowPurple,
      '',
      style,
      message,
      ...rest
    );
  };

  function jsonInterceptor(encodeBase64: boolean): JsonProcessor {
    const log = (json: EventJsonWithKeys, data: SelfDescribingJson) => {
      const schemaParts = getSchemaParts(data['schema']);
      debug(colours.event(), 'Event', [
        '%c%s%c%s%c%s\n%o',
        colours.json,
        `${getJsonType(json)}: ${schemaParts ? schemaParts[1] : 'Unknown Schema'}`,
        colours.schemaVersion,
        schemaParts ? `Version: ${schemaParts[2]}-${schemaParts[3]}-${schemaParts[4]}` : 'Unknown Schema Version',
        colours.schema,
        schemaParts ? `Vendor: ${schemaParts[0]}` : 'Unknown Vendor',
        data['data'],
      ]);
    };

    return (payloadBuilder: PayloadBuilder, jsonForProcessing: EventJson) => {
      if (jsonForProcessing.length) {
        for (const json of jsonForProcessing) {
          const data = json.json['data'] as SelfDescribingJson;
          if (Array.isArray(data)) {
            data.forEach((d) => {
              log(json, d);
            });
          } else {
            log(json, data);
          }
        }
      }
      return payloadJsonProcessor(encodeBase64)(payloadBuilder, jsonForProcessing);
    };
  }

  return {
    logger: (logger) => {
      LOG = logger;
      logger.setLogLevel(logLevel);
    },
    activateBrowserPlugin: (t) => {
      tracker = t;
      debug(colours.activated, 'Tracker Activated');
    },
    beforeTrack: (payloadBuilder: PayloadBuilder) => {
      eventColour = randomcolor({ luminosity: 'dark' });
      payloadBuilder.withJsonProcessor(jsonInterceptor(tracker.core.getBase64Encoding()));
      debug(colours.event(), 'Event', ['%c%s', colours.snowplowPurple, getEventType(payloadBuilder)]);
      payloadBuilder.build();
    },
    afterTrack: (payload: Payload) => {
      debug(colours.event(), 'Event', ['%c%s\n%o', colours.payload, 'Payload', payload]);
    },
  };
}

function getJsonType(json: EventJsonWithKeys) {
  switch (json.keyIfEncoded) {
    case 'cx':
      return 'Context';
    case 'ue_px':
      return 'Self Describing';
    default:
      return `${json.keyIfEncoded}, ${json.keyIfNotEncoded}`;
  }
}

function getEventType(payloadBuilder: PayloadBuilder) {
  const payload = payloadBuilder.getPayload();
  switch (payload['e']) {
    case 'pv':
      return 'Page View';
    case 'pp':
      return 'Page Ping';
    case 'tr':
      return 'Ecommerce Transaction';
    case 'ti':
      return 'Ecommerce Transaction Item';
    case 'se':
      return 'Structured Event';
    case 'ue':
      return 'Self Describing';
    default:
      return typeof payload['e'] === 'string' ? payload['e'] : 'Invalid';
  }
}
