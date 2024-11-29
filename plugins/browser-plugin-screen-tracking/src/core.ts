import { buildSelfDescribingEvent } from '@snowplow/tracker-core';
import { LIST_ITEM_VIEW_EVENT_SCHEMA, SCREEN_END_EVENT_SCHEMA, SCREEN_ENTITY_SCHEMA, SCREEN_SUMMARY_ENTITY_SCHEMA, SCREEN_VIEW_EVENT_SCHEMA, SCROLL_CHANGED_EVENT_SCHEMA } from './schemata';
import { ListItemViewProps, ScreenProps, ScreenSummaryProps, ScreenViewProps, ScrollChangedProps } from './types';

export function buildScreenViewEvent(event: ScreenViewProps) {
  return buildSelfDescribingEvent({
    event: {
      schema: SCREEN_VIEW_EVENT_SCHEMA,
      data: removeEmptyProperties({ ...event }),
    },
  });
}

export function buildScreenEndEvent() {
  return buildSelfDescribingEvent({
    event: {
      schema: SCREEN_END_EVENT_SCHEMA,
      data: {},
    },
  });
}

export function buildListItemViewEvent(event: ListItemViewProps) {
  return buildSelfDescribingEvent({
    event: {
      schema: LIST_ITEM_VIEW_EVENT_SCHEMA,
      data: removeEmptyProperties({ ...event }),
    },
  });
}

export function buildScrollChangedEvent(event: ScrollChangedProps) {
  return buildSelfDescribingEvent({
    event: {
      schema: SCROLL_CHANGED_EVENT_SCHEMA,
      data: removeEmptyProperties({ ...event }),
    },
  });
}

export function buildScreenEntity(entity: ScreenProps) {
  return {
    schema: SCREEN_ENTITY_SCHEMA,
    data: removeEmptyProperties({ ...entity }),
  };
}

export function buildScreenSummaryEntity(entity: ScreenSummaryProps) {
  return {
    schema: SCREEN_SUMMARY_ENTITY_SCHEMA,
    data: removeEmptyProperties({ ...entity }),
  };
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
