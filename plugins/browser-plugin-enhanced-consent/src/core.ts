import { buildSelfDescribingEvent } from '@snowplow/tracker-core';
import { CONSENT_SCHEMA, CMP_VISIBLE_SCHEMA } from './schemata';
import { CmpVisible, Consent } from './types';
/**
 * Build a Consent Action Event
 * for tracking consent actions
 *
 * @param event - Contains properties of Consent action events
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */

export function buildConsentEvent(event: Consent) {
  return buildSelfDescribingEvent({
    event: {
      schema: CONSENT_SCHEMA,
      data: removeEmptyProperties({ ...event }),
    },
  });
}

/**
 * Build a CMP Visible Event
 * for tracking loadtime of CMP banner
 *
 * @param event - Contains properties of CMP Visible events
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */

export function buildCmpVisibleEvent(event: CmpVisible) {
  return buildSelfDescribingEvent({
    event: {
      schema: CMP_VISIBLE_SCHEMA,
      data: removeEmptyProperties({ ...event }),
    },
  });
}

/**
 * Returns a copy of a JSON with undefined and null properties removed
 *
 * @param event - Object to clean
 * @returns A cleaned copy of eventJson
 */
function removeEmptyProperties(event: Record<string, unknown>): Record<string, unknown> {
  const ret: Record<string, unknown> = {};
  for (const k in event) {
    if (event[k] !== null && typeof event[k] !== 'undefined') {
      ret[k] = event[k];
    }
  }
  return ret;
}
