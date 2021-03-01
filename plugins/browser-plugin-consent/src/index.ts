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

import { BrowserPlugin, BrowserTracker, warn } from '@snowplow/browser-core';
import { SelfDescribingJson, Timestamp } from '@snowplow/tracker-core';
import { Gdpr } from './contexts';

const _trackers: Record<string, { tracker: BrowserTracker; gdpr?: Gdpr }> = {};

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
  trackers: Array<string> = Object.keys(_trackers)
) {
  let basis = gdprBasis[basisForProcessing];

  if (!basis) {
    warn(
      'enableGdprContext: basisForProcessing must be one of: consent, contract, legalObligation, vitalInterests, publicTask, legitimateInterests'
    );
    return;
  } else {
    trackers.forEach((t) => {
      if (_trackers[t]) {
        _trackers[t].gdpr = {
          basisForProcessing: basis,
          documentId: documentId ?? null,
          documentVersion: documentVersion ?? null,
          documentDescription: documentDescription ?? null,
        };
      }
    });
  }
}

/**
 * Track a consent granted action
 *
 * @param {string} id - ID number associated with document.
 * @param {string} version - Document version number.
 * @param {string} [name] - Document name.
 * @param {string} [description] - Document description.
 * @param {string} [expiry] - Date-time when consent document(s) expire.
 * @param {array} [context] - Context containing consent documents.
 * @param {Timestamp|number} [tstamp] - number or Timestamp object.
 */
export const trackConsentGranted = function (
  {
    id,
    version,
    name,
    description,
    expiry,
    context,
    tstamp,
  }: {
    id: string;
    version: string;
    name: string;
    description: string;
    expiry: string;
    context: Array<SelfDescribingJson>;
    tstamp: Timestamp;
  },
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t].tracker.core.trackConsentGranted(id, version, name, description, expiry, context, tstamp);
    }
  });
};

/**
 * Track a consent withdrawn action
 *
 * @param {boolean} all - Indicates user withdraws all consent regardless of context documents.
 * @param {string} [id] - Number associated with document.
 * @param {string} [version] - Document version number.
 * @param {string} [name] - Document name.
 * @param {string} [description] - Document description.
 * @param {array} [context] - Context relating to the event.
 * @param {number|Timestamp} [tstamp] - Number or Timestamp object.
 */
export const trackConsentWithdrawn = function (
  {
    all,
    id,
    version,
    name,
    description,
    context,
    tstamp,
  }: {
    all: boolean;
    id?: string;
    version?: string;
    name?: string;
    description?: string;
    context?: Array<SelfDescribingJson>;
    tstamp?: Timestamp;
  },
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t].tracker.core.trackConsentWithdrawn(all, id, version, name, description, context, tstamp);
    }
  });
};

export function ConsentPlugin(): BrowserPlugin {
  let trackerId: string;

  return {
    activateBrowserPlugin: (tracker) => {
      trackerId = tracker.id;
      _trackers[tracker.id] = { tracker };
    },
    contexts: () => {
      const gdpr = _trackers[trackerId].gdpr;
      if (gdpr) {
        return [
          {
            schema: 'iglu:com.snowplowanalytics.snowplow/gdpr/jsonschema/1-0-0',
            data: gdpr,
          },
        ];
      }

      return [];
    },
  };
}
