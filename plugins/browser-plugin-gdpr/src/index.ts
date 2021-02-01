import { Plugin } from '@snowplow/tracker-core';
import { warn, ApiPlugin, ApiMethods } from '@snowplow/browser-core';
import { Gdpr } from './contexts';

enum gdprBasis {
  consent = 'consent',
  contract = 'contract',
  legalObligation = 'legal_obligation',
  vitalInterests = 'vital_interests',
  publicTask = 'public_task',
  legitimateInterests = 'legitimate_interests',
}

type GdprBasis = keyof typeof gdprBasis;

interface GdprMethods extends ApiMethods {
  enableGdprContext: (
    basisForProcessing: GdprBasis,
    documentId?: string,
    documentVersion?: string,
    documentDescription?: string
  ) => void;
}

const GdprPlugin = (): Plugin & ApiPlugin<GdprMethods> => {
  let gdprBasisData: Gdpr;

  const enableGdprContext = (
    basisForProcessing: GdprBasis,
    documentId?: string,
    documentVersion?: string,
    documentDescription?: string
  ): void => {
    let basis = gdprBasis[basisForProcessing];

    if (!basis) {
      warn(
        'enableGdprContext: basisForProcessing must be one of: consent, contract, legalObligation, vitalInterests, publicTask, legitimateInterests'
      );
      return;
    } else {
      gdprBasisData = {
        basisForProcessing: basis,
        documentId: documentId ?? null,
        documentVersion: documentVersion ?? null,
        documentDescription: documentDescription ?? null,
      };
    }
  };

  /**
   * Creates a context from the window.performance.timing object
   *
   * @return object PerformanceTiming context
   */
  function getGdprContext() {
    if (gdprBasisData) {
      return [
        {
          schema: 'iglu:com.snowplowanalytics.snowplow/gdpr/jsonschema/1-0-0',
          data: gdprBasisData,
        },
      ];
    }

    return [];
  }

  return {
    contexts: () => getGdprContext(),
    apiMethods: {
      enableGdprContext,
    },
  };
};

export { GdprPlugin };
