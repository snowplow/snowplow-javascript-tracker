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
