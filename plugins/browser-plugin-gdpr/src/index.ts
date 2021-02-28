import { BrowserPlugin, warn } from '@snowplow/browser-core';
import { Gdpr } from './contexts';

const trackerContexts: Record<string, Gdpr> = {};

enum gdprBasis {
  consent = 'consent',
  contract = 'contract',
  legalObligation = 'legal_obligation',
  vitalInterests = 'vital_interests',
  publicTask = 'public_task',
  legitimateInterests = 'legitimate_interests',
}

type GdprBasis = keyof typeof gdprBasis;

export function enableGdprContext(
  {
    basisForProcessing,
    documentId,
    documentVersion,
    documentDescription,
  }: {
    basisForProcessing: GdprBasis;
    documentId?: string;
    documentVersion?: string;
    documentDescription?: string;
  },
  trackers: Array<string> = Object.keys(trackerContexts)
) {
  let basis = gdprBasis[basisForProcessing];

  if (!basis) {
    warn(
      'enableGdprContext: basisForProcessing must be one of: consent, contract, legalObligation, vitalInterests, publicTask, legitimateInterests'
    );
    return;
  } else {
    trackers.forEach((t) => {
      trackerContexts[t] = {
        basisForProcessing: basis,
        documentId: documentId ?? null,
        documentVersion: documentVersion ?? null,
        documentDescription: documentDescription ?? null,
      };
    });
  }
}

export function GdprPlugin(): BrowserPlugin {
  let trackerId: string;
  /**
   * Creates a context from the window.performance.timing object
   *
   * @return object PerformanceTiming context
   */
  function getGdprContext() {
    if (trackerContexts[trackerId]) {
      return [
        {
          schema: 'iglu:com.snowplowanalytics.snowplow/gdpr/jsonschema/1-0-0',
          data: trackerContexts[trackerId],
        },
      ];
    }

    return [];
  }

  return {
    activateBrowserPlugin: (t) => (trackerId = t.id),
    contexts: () => getGdprContext(),
  };
}
