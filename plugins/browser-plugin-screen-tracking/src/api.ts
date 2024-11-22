import { BrowserPlugin, BrowserTracker, dispatchToTrackersInCollection } from '@snowplow/browser-tracker-core';
import { CommonEventProperties, Payload } from '@snowplow/tracker-core';
import {
  buildListItemViewEvent,
  buildScreenEndEvent,
  buildScreenEntity,
  buildScreenSummaryEntity,
  buildScreenViewEvent,
  buildScrollChangedEvent,
} from './core';
import {
  ListItemViewProps,
  ScreenProps,
  ScreenSummaryProps,
  ScreenTrackingConfiguration,
  ScreenViewProps,
  ScrollChangedProps,
} from './types';
import {
  BACKGROUND_EVENT_SCHEMA,
  FOREGROUND_EVENT_SCHEMA,
  LIST_ITEM_VIEW_EVENT_SCHEMA,
  SCREEN_END_EVENT_SCHEMA,
  SCREEN_VIEW_EVENT_SCHEMA,
  SCROLL_CHANGED_EVENT_SCHEMA,
} from './schemata';
import { getUsefulSchemaAndData } from './utils';
import { v4 as uuidv4 } from 'uuid';

const _trackers: Record<string, BrowserTracker> = {};

/**
 * Adds screen tracking
 */
export function ScreenTrackingPlugin({
  screenEngagementAutotracking = true,
  screenContext = true,
}: ScreenTrackingConfiguration = {}): BrowserPlugin {
  let trackerId: string;
  let screenEntity: ScreenProps | undefined;
  let screenSummary: ScreenSummaryProps | undefined;
  let lastUpdate: Date | undefined;
  let inForeground = true;

  // Update the screen summary foreground and background durations based on the time since the last update
  const updateScreenSummaryDurations = () => {
    if (screenSummary !== undefined && lastUpdate !== undefined) {
      const timeDiffSec = (new Date().getTime() - lastUpdate.getTime()) / 1000;
      if (inForeground) {
        screenSummary.foreground_sec += timeDiffSec;
      } else {
        screenSummary.background_sec = (screenSummary.background_sec ?? 0) + timeDiffSec;
      }
      lastUpdate = new Date();
    }
  };

  // Update the screen summary scroll values based on the current event
  const updateScreenSummaryScroll = (scrollChanged: ScrollChangedProps) => {
    if (screenSummary) {
      if (scrollChanged.yOffset !== undefined) {
        const maxYOffset = scrollChanged.yOffset + (scrollChanged.viewHeight ?? 0);
        screenSummary.max_y_offset = Math.max(maxYOffset, screenSummary.max_y_offset ?? maxYOffset);

        screenSummary.min_y_offset = Math.min(
          scrollChanged.yOffset,
          screenSummary.min_y_offset ?? scrollChanged.yOffset
        );
      }

      if (scrollChanged.xOffset !== undefined) {
        const maxXOffset = scrollChanged.xOffset + (scrollChanged.viewWidth ?? 0);
        screenSummary.max_x_offset = Math.max(maxXOffset, screenSummary.max_x_offset ?? maxXOffset);

        screenSummary.min_x_offset = Math.min(
          scrollChanged.xOffset,
          screenSummary.min_x_offset ?? scrollChanged.xOffset
        );
      }

      if (scrollChanged.contentHeight !== undefined) {
        screenSummary.content_height = Math.max(scrollChanged.contentHeight, screenSummary.content_height ?? 0);
      }

      if (scrollChanged.contentWidth !== undefined) {
        screenSummary.content_width = Math.max(scrollChanged.contentWidth, screenSummary.content_width ?? 0);
      }
    }
  };

  // Update the screen summary list items based on the current event
  const updateScreenSummaryListItems = (listItemView: ListItemViewProps) => {
    if (screenSummary) {
      screenSummary.last_item_index = Math.max(
        listItemView.index,
        screenSummary?.last_item_index ?? listItemView.index
      );
      if (listItemView.itemsCount !== undefined) {
        screenSummary.items_count = Math.max(
          listItemView.itemsCount,
          screenSummary.items_count ?? listItemView.itemsCount
        );
      }
      listItemView.index;
    }
  };

  // Update the current screen view state
  const updateScreenView = (screenView: ScreenViewProps) => {
    if (screenEntity && !screenView.previousId && !screenView.previousName) {
      screenView.previousId = screenEntity.id;
      screenView.previousName = screenEntity.name;
      screenView.previousType = screenEntity.type;
    }

    const { name, id, type } = screenView;
    if (name && id) {
      screenEntity = { name, id, type };
      screenSummary = { foreground_sec: 0 };
      lastUpdate = new Date();
    } else {
      screenEntity = undefined;
      screenSummary = undefined;
      lastUpdate = undefined;
    }
  };

  return {
    activateBrowserPlugin: (tracker) => {
      trackerId = tracker.id;
      _trackers[trackerId] = tracker;
    },

    beforeTrack: (payload) => {
      const schemaAndData = getUsefulSchemaAndData(payload);
      if (schemaAndData) {
        const { schema, data, eventPayload } = schemaAndData;

        // For screen view events, we need to update the current state,
        // and fill in missing previous references
        if (schema === SCREEN_VIEW_EVENT_SCHEMA) {
          const screenView = data as ScreenViewProps;
          updateScreenView(screenView);

          // Replace the event payload with the updated screen view
          payload.addJson('ue_px', 'ue_pr', {
            ...eventPayload,
            data: { schema, data: screenView },
          });
        }

        // For screen end events, we need to attach the screen summary entity
        // These events are skipped if there is no screen summary to attach.
        else if (schema === SCREEN_END_EVENT_SCHEMA) {
          if (screenSummary && screenEngagementAutotracking) {
            updateScreenSummaryDurations();
            payload.addContextEntity(buildScreenSummaryEntity(screenSummary));
          } else {
            payload.add('__filter__', true);
          }
        }

        // For foreground events, we need to attach the screen summary entity
        else if (schema == FOREGROUND_EVENT_SCHEMA && screenEngagementAutotracking) {
          updateScreenSummaryDurations();
          inForeground = true;
          if (screenSummary) {
            payload.addContextEntity(buildScreenSummaryEntity(screenSummary));
          }
        }

        // For background events, we need to attach the screen summary entity
        else if (schema == BACKGROUND_EVENT_SCHEMA && screenEngagementAutotracking) {
          updateScreenSummaryDurations();
          inForeground = false;
          if (screenSummary) {
            payload.addContextEntity(buildScreenSummaryEntity(screenSummary));
          }
        }

        // For list item view events, we need to update the current state for screen summary
        // These events are skipped if screenEngagementAutotracking is enabled.
        else if (schema == LIST_ITEM_VIEW_EVENT_SCHEMA && screenEngagementAutotracking) {
          const listItemView = data as ListItemViewProps;
          updateScreenSummaryListItems(listItemView);
          payload.add('__filter__', true);
        }

        // For scroll changed events, we need to update the current state for screen summary
        // These events are skipped if screenEngagementAutotracking is enabled.
        else if (schema == SCROLL_CHANGED_EVENT_SCHEMA && screenEngagementAutotracking) {
          const scrollChanged = data as ScrollChangedProps;
          updateScreenSummaryScroll(scrollChanged);
          payload.add('__filter__', true);
        }
      }

      // For all events, we need to attach the screen entity if screenContext is enabled
      if (screenEntity && screenContext) {
        payload.addContextEntity(buildScreenEntity(screenEntity));
      }
    },

    filter: (payload: Payload) => {
      // Skip events that have been filtered out in the beforeTrack hook
      return payload['__filter__'] === undefined;
    },
  };
}

/**
 * Track a screen view event.
 * If screen engagement tracking is enabled, will also track a `screen_end` event with the screen summary information of the previous screen view.
 * 
 * Schema: `iglu:com.snowplowanalytics.mobile/screen_view/jsonschema/1-0-0`
 *
 * @param props - The properties of the screen view event
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackScreenView(
  props: ScreenViewProps & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { context = [], timestamp, ...screenViewAttributes } = props;
  if (!screenViewAttributes.id) {
    screenViewAttributes.id = uuidv4();
  }

  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildScreenEndEvent(), context, timestamp);
    t.core.track(buildScreenViewEvent(screenViewAttributes), context, timestamp);
  });
}

/**
 * Event tracking the view of an item in a list.
 * If screen engagement tracking is enabled, the list item view events will be aggregated into a `screen_summary` entity.
 * 
 * Schema: `iglu:com.snowplowanalytics.mobile/list_item_view/jsonschema/1-0-0`
 *
 * @param props - The properties of the event
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackListItemView(
  props: ListItemViewProps & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { context = [], timestamp, ...listItemViewAttributes } = props;

  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildListItemViewEvent(listItemViewAttributes), context, timestamp);
  });
}

/**
 * Event tracked when a scroll view's scroll position changes.
 * If screen engagement tracking is enabled, the scroll changed events will be aggregated into a `screen_summary` entity.
 * 
 * Schema: `iglu:com.snowplowanalytics.mobile/scroll_changed/jsonschema/1-0-0`
 * 
 * @param props - The properties of the event
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackScrollChanged(
  props: ScrollChangedProps & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { context = [], timestamp, ...scrollChangedAttributes } = props;

  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildScrollChangedEvent(scrollChangedAttributes), context, timestamp);
  });
}
