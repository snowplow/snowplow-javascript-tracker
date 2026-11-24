import { BrowserPlugin } from '@snowplow/browser-tracker-core';
import { LOG } from '@snowplow/tracker-core';
import { detectInstantClientAsync } from 'bot-signal/browser';
import { CLIENT_SIDE_BOT_DETECTION_SCHEMA } from './schemata';
import { BotDetectionContextData, BotKind } from './types';

export { BotDetectionContextData, BotKind } from './types';

// bot-signal automation kinds that exist in the schema's `kind` enum. Everything else
// (playwright, puppeteer, lightpanda, curl, python, ...) is reported as 'unknown',
// because the schema is closed (enum + additionalProperties: false).
const SCHEMA_KINDS: Record<string, BotKind> = { selenium: 'selenium', phantomjs: 'phantomjs' };

let contextData: BotDetectionContextData | undefined;
let detectionStarted = false;

/**
 * Runs bot-signal's instant (non-behavioral) checks once and attaches the result as the
 * standard Snowplow `client_side_bot_detection` entity, so no new schema is needed.
 * Events fired before detection resolves carry no context.
 */
export function BotSignalPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: () => {
      if (!detectionStarted) {
        detectionStarted = true;
        detectInstantClientAsync(window)
          .then((r) => {
            if (r.isLegitClient) {
              contextData = { bot: false, kind: null };
            } else {
              const kind = r.automation ? String(r.automation.kind) : '';
              contextData = { bot: true, kind: SCHEMA_KINDS[kind] || 'unknown' };
            }
          })
          .catch((err) => LOG.error('BotSignalPlugin: detection failed', err));
      }
    },
    contexts: () => (contextData ? [{ schema: CLIENT_SIDE_BOT_DETECTION_SCHEMA, data: contextData }] : []),
  };
}
