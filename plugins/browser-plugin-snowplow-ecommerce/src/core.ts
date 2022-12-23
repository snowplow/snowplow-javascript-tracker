import { buildSelfDescribingEvent } from '@snowplow/tracker-core';
import { ECOMMERCE_ACTION_SCHEMA } from './schemata';
import { Action } from './types';

/**
 * Build an Ecommerce Action Event
 * For tracking ecommerce actions
 *
 * @param event - Contains the properties for Cart related events
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildEcommerceActionEvent(event: Action) {
  return buildSelfDescribingEvent({
    event: {
      schema: ECOMMERCE_ACTION_SCHEMA,
      data: removeEmptyProperties({ ...event }),
    },
  });
}

/**
 * Returns a copy of a JSON with undefined and null properties removed
 *
 * @param event - Object to clean
 * @param exemptFields - Set of fields which should not be removed even if empty
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
