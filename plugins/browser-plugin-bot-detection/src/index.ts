import { BrowserPlugin } from '@snowplow/browser-tracker-core';
import { LOG } from '@snowplow/tracker-core';
import { collect, detect, sources } from '@fingerprintjs/botd';
import { CLIENT_SIDE_BOT_DETECTION_SCHEMA } from './schemata';
import { activeDetectors } from './detectors';
import { BotDetectionContextData } from './types';

export { BotDetectionContextData, BotKind } from './types';

let contextData: BotDetectionContextData | undefined;
let detectionStarted = false;

export function BotDetectionPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: () => {
      if (!detectionStarted) {
        detectionStarted = true;
        // Equivalent to BotD's `load().then((d) => d.detect())`,
        // but with our own detector set (see `./detectors`)
        collect(sources)
          .then((components) => detect(components, activeDetectors)[1])
          .then((result) => {
            contextData = result.bot ? { bot: true, kind: result.botKind } : { bot: false, kind: null };
          })
          .catch((err) => LOG.error('BotDetectionPlugin: BotD collect/detect failed', err));
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
