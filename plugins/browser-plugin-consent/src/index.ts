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

import { BrowserPlugin, BrowserTracker, dispatchToTrackersInCollection } from '@snowplow/browser-tracker-core';
import {
  buildConsentGranted,
  buildConsentWithdrawn,
  CommonEventProperties,
  ConsentGrantedEvent,
  ConsentWithdrawnEvent,
  Logger,
} from '@snowplow/tracker-core';
import { Gdpr } from './contexts';

export { ConsentGrantedEvent, ConsentWithdrawnEvent };

export enum gdprBasis {
  consent = 'consent',
  contract = 'contract',
  legalObligation = 'legal_obligation',
  vitalInterests = 'vital_interests',
  publicTask = 'public_task',
  legitimateInterests = 'legitimate_interests',
}

export type GdprBasis = keyof typeof gdprBasis;

/** The Configuration for the GDPR Context */
export interface GdprContextConfiguration {
  /** The basis for why the document will be processed */
  basisForProcessing: GdprBasis;
  /** An identifier for the document */
  documentId?: string;
  /** The version of the document */
  documentVersion?: string;
  /** A descrtiption of the document */
  documentDescription?: string;
}

const _trackers: Record<string, BrowserTracker> = {};
const _context: Record<string, Gdpr> = {};
let LOG: Logger;

/**
 * The Consent Plugin
 *
 * Adds Consent Granted and Withdrawn events
 * and the ability to add the GDPR context to events
 */
export function ConsentPlugin(): BrowserPlugin {
  let trackerId: string;

  return {
    activateBrowserPlugin: (tracker) => {
      trackerId = tracker.id;
      _trackers[tracker.id] = tracker;
    },
    contexts: () => {
      if (_context[trackerId]) {
        return [
          {
            schema: 'iglu:com.snowplowanalytics.snowplow/gdpr/jsonschema/1-0-0',
            data: _context[trackerId],
          },
        ];
      }

      return [];
    },
    logger: (logger) => {
      LOG = logger;
    },
  };
}

/**
 * Enable the GDPR context for each event
 * @param configuration - the configuration for the GDPR context
 * @param trackers - The tracker identifiers which should have the GDPR context enabled
 */
export function enableGdprContext(
  configuration: GdprContextConfiguration,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { basisForProcessing, documentId, documentVersion, documentDescription } = configuration;
  let basis = gdprBasis[basisForProcessing];

  if (!basis) {
    LOG.warn(
      'enableGdprContext: basisForProcessing must be one of: consent, contract, legalObligation, vitalInterests, publicTask, legitimateInterests'
    );
    return;
  } else {
    trackers.forEach((t) => {
      if (_trackers[t]) {
        _context[t] = {
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
 * @param event - The event information
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackConsentGranted(
  event: ConsentGrantedEvent & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    const builtEvent = buildConsentGranted(event);
    t.core.track(
      builtEvent.event,
      event.context ? event.context.concat(builtEvent.context) : builtEvent.context,
      event.timestamp
    );
  });
}

/**
 * Track a consent withdrawn action
 *
 * @param event - The event information
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackConsentWithdrawn(
  event: ConsentWithdrawnEvent & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    const builtEvent = buildConsentWithdrawn(event);
    t.core.track(
      builtEvent.event,
      event.context ? event.context.concat(builtEvent.context) : builtEvent.context,
      event.timestamp
    );
  });
}
