export interface ScreenTrackingConfiguration {
  /**
   * Whether to enable tracking of the screen end event and the screen summary context entity.
   * Make sure that you have lifecycle autotracking enabled for screen summary to have complete information.
   * @default true
   */
  screenEngagementAutotracking?: boolean;

  /**
   * Whether to enable tracking of the screen context entity.
   * @default true
   */
  screenContext?: boolean;
}
/**
 * ScreenView event properties
 * schema: iglu:com.snowplowanalytics.mobile/screen_view/jsonschema/1-0-0
 */
export type ScreenViewProps = {
  /**
   * The name of the screen viewed
   */
  name: string;
  /**
   * The id(UUID) of screen that was viewed
   * Will be automatically generated if not provided
   */
  id?: string;
  /**
   * The type of screen that was viewed
   */
  type?: string;
  /**
   * The name of the previous screen that was viewed
   */
  previousName?: string;
  /**
   * The id(UUID) of the previous screen that was viewed
   */
  previousId?: string;
  /**
   * The type of the previous screen that was viewed
   */
  previousType?: string;
  /**
   * The type of transition that led to the screen being viewed
   */
  transitionType?: string;
};

/** Screen context entity properties. */
export type ScreenProps = {
  /** The name of the screen viewed. */
  name: string;
  /** The type of screen that was viewed e.g feed / carousel. */
  type?: string;
  /** An ID from the associated screenview event. */
  id: string;
  /** iOS specific: class name of the view controller. */
  viewController?: string;
  /** iOS specific: class name of the top level view controller. */
  topViewController?: string;
  /** Android specific: name of activity. */
  activity?: string;
  /** Android specific: name of fragment. */
  fragment?: string;
};

/**
 * Event tracked when a scroll view's scroll position changes.
 * If screen engagement tracking is enabled, the scroll changed events will be aggregated into a `screen_summary` entity.
 *
 * Schema: `iglu:com.snowplowanalytics.mobile/scroll_changed/jsonschema/1-0-0`
 */
export type ScrollChangedProps = {
  /**
   * Vertical scroll offset in pixels
   */
  yOffset?: number;
  /**
   * Horizontal scroll offset in pixels.
   */
  xOffset?: number;
  /**
   * The height of the scroll view in pixels
   */
  viewHeight?: number;
  /**
   * The width of the scroll view in pixels
   */
  viewWidth?: number;
  /**
   * The height of the content in the scroll view in pixels
   */
  contentHeight?: number;
  /**
   * The width of the content in the scroll view in pixels
   */
  contentWidth?: number;
};

/**
 * Event tracking the view of an item in a list.
 * If screen engagement tracking is enabled, the list item view events will be aggregated into a `screen_summary` entity.
 *
 * Schema: `iglu:com.snowplowanalytics.mobile/list_item_view/jsonschema/1-0-0`
 */
export type ListItemViewProps = {
  /**
   * Index of the item in the list
   */
  index: number;
  /**
   * Total number of items in the list
   */
  itemsCount?: number;
};

/** Schema for an entity tracked with foreground/background/screen_end events with summary statistics about the screen view */
export type ScreenSummaryProps = {
  /** Time in seconds spent on the current screen while the app was in foreground */
  foreground_sec: number;
  /** Time in seconds spent on the current screen while the app was in background */
  background_sec?: number;
  /** Index of the last viewed item in the list on the screen */
  last_item_index?: number;
  /** Total number of items in the list on the screen */
  items_count?: number;
  /** Minimum horizontal scroll offset on the scroll view in pixels */
  min_x_offset?: number;
  /** Maximum horizontal scroll offset on the scroll view in pixels */
  max_x_offset?: number;
  /** Minimum vertical scroll offset on the scroll view in pixels */
  min_y_offset?: number;
  /** Maximum vertical scroll offset on the scroll view in pixels */
  max_y_offset?: number;
  /** Width of the scroll view in pixels */
  content_width?: number;
  /** Height of the scroll view in pixels */
  content_height?: number;
};
