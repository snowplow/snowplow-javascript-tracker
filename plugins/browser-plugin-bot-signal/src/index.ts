import { BrowserPlugin } from '@snowplow/browser-tracker-core';
import { LOG } from '@snowplow/tracker-core';
import { detectInstantClientAsync } from 'bot-signal/browser';
import { CLIENT_SIDE_BOT_SIGNAL_SCHEMA } from './schemata';
import { BotSignalContextData } from './types';

export { BotSignalContextData } from './types';

let contextData: BotSignalContextData | undefined;
let detectionStarted = false;

/**
 * Runs bot-signal's instant (non-behavioral) checks once and attaches the
 * result to every event after it resolves. Events fired before then carry no context.
 */
export function BotSignalPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: () => {
      if (!detectionStarted) {
        detectionStarted = true;
        detectInstantClientAsync(window)
          .then((r) => {
            const kind = r.automation ? r.automation.kind : null;
            contextData = {
              bot: !r.isLegitClient,
              score: r.suspicionScore,
              kind: kind ? String(kind) : null,
              signals: (r.signals || []).filter((s) => s.triggered).map((s) => s.id),
            };
          })
          .catch((err) => LOG.error('BotSignalPlugin: detection failed', err));
      }
    },
    contexts: () => (contextData ? [{ schema: CLIENT_SIDE_BOT_SIGNAL_SCHEMA, data: contextData }] : []),
  };
}
