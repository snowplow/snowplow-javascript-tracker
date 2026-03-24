import { BrowserPlugin } from '@snowplow/browser-tracker-core';
import { LOG } from '@snowplow/tracker-core';
import { load } from '@fingerprintjs/botd';
import { CLIENT_SIDE_BOT_DETECTION_SCHEMA } from './schemata';
import { BotDetectionContextData } from './types';

export { BotDetectionContextData, BotKind } from './types';

let contextData: BotDetectionContextData | undefined;
let detectionStarted = false;

export function BotDetectionPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: () => {
      if (!detectionStarted) {
        detectionStarted = true;
        load()
          .then((detector) => detector.detect())
          .then((result) => {
            contextData = result.bot ? { bot: true, kind: result.botKind } : { bot: false, kind: null };
          })
          .catch((err) => LOG.error('BotDetectionPlugin: BotD load/detect failed', err));
      }
    },
    contexts: () => {
      if (contextData) {
        return [{ schema: CLIENT_SIDE_BOT_DETECTION_SCHEMA, data: contextData }];
      }
      return [];
    },
  };
}
