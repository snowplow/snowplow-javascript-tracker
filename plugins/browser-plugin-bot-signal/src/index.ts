import { BrowserPlugin } from '@snowplow/browser-tracker-core';
import { LOG } from '@snowplow/tracker-core';
import { detectInstantClientAsync } from 'bot-signal/browser';
import { CLIENT_SIDE_BOT_DETECTION_SCHEMA, CLIENT_SIDE_BOT_SIGNAL_PILOT_SCHEMA } from './schemata';
import { BotDetectionContextData, BotKind, BotSignalPilotContextData } from './types';

export { BotDetectionContextData, BotKind, BotSignalPilotContextData } from './types';

export interface BotSignalPluginOptions {
  /**
   * 'standard' (default): the Snowplow `client_side_bot_detection` 1-0-0 entity (`bot`, `kind`), no new schema.
   * 'pilot': a custom entity that also carries the score and fired signal ids. Needs its schema
   * (`schema/client_side_bot_signal_pilot.json`) registered in Iglu before use, or events fail validation.
   */
  mode?: 'standard' | 'pilot';
}

// bot-signal automation kinds that exist in the standard schema's `kind` enum. Everything else
// (playwright, puppeteer, lightpanda, curl, python, ...) is reported as 'unknown',
// because that schema is closed (enum + additionalProperties: false).
function toSchemaKind(raw: string | null): BotKind {
  switch (raw) {
    case 'selenium':
      return 'selenium';
    case 'phantomjs':
      return 'phantomjs';
    case 'nightmare':
      return 'nightmarejs';
    default:
      return 'unknown';
  }
}

let context: { schema: string; data: Record<string, unknown> } | undefined;
let detectionStarted = false;

/**
 * Runs bot-signal's instant (non-behavioral) checks once and attaches the result to every event
 * after it resolves. Events fired before then carry no context.
 */
export function BotSignalPlugin(options: BotSignalPluginOptions = {}): BrowserPlugin {
  const pilot = options.mode === 'pilot';
  return {
    activateBrowserPlugin: () => {
      if (!detectionStarted) {
        detectionStarted = true;
        detectInstantClientAsync(window as unknown as Parameters<typeof detectInstantClientAsync>[0])
          .then((r) => {
            const rawKind = r.automation && r.automation.kind ? String(r.automation.kind) : null;
            if (pilot) {
              const data: BotSignalPilotContextData = {
                bot: !r.isLegitClient,
                score: r.suspicionScore,
                kind: rawKind,
                signals: (r.signals || []).filter((s) => s.triggered).map((s) => s.id),
              };
              context = { schema: CLIENT_SIDE_BOT_SIGNAL_PILOT_SCHEMA, data };
            } else {
              const data: BotDetectionContextData = r.isLegitClient
                ? { bot: false, kind: null }
                : { bot: true, kind: toSchemaKind(rawKind) };
              context = { schema: CLIENT_SIDE_BOT_DETECTION_SCHEMA, data };
            }
          })
          .catch((err) => LOG.error('BotSignalPlugin: detection failed', err));
      }
    },
    contexts: () => (context ? [context] : []),
  };
}
