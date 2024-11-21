import {
  ConditionalContextProvider,
  ContextPrimitive,
  CorePluginConfiguration,
  PageViewEvent,
  SelfDescribingJson,
  StructuredEvent,
} from '@snowplow/tracker-core';

/**
 * Configuration for the event store
 */
export interface EventStoreConfiguration {
  /**
   * The maximum amount of events that will be buffered in the event store
   *
   * Will drop events once the limit is hit
   * @defaultValue 1000
   */
  maxEventStoreSize?: number;

  /**
   * Whether to use the AsyncStorage library as the persistent event store for the event store
   * @defaultValue true
   */
  useAsyncStorageForEventStore?: boolean;
}

/**
 * Configuration for session tracking
 */
export interface SessionConfiguration {
  /**
   * The amount of time in seconds before the session id is updated while the app is in the foreground
   * @defaultValue 1800
   */
  foregroundSessionTimeout?: number;
  /**
   * The amount of time in seconds before the session id is updated while the app is in the background
   * @defaultValue 1800
   */
  backgroundSessionTimeout?: number;
}

/**
 * The configuration object for initialising the tracker
 */
export interface TrackerConfiguration {
  /** The namespace of the tracker */
  namespace: string;
  /** The application ID */
  appId?: string;
  /**
   * Whether unstructured events and custom contexts should be base64 encoded.
   * @defaultValue false
   **/
  encodeBase64?: boolean;
}

/**
 * Configuration of subject properties tracked with events
 */
export interface SubjectConfiguration {
  /**
   * Business-defined user ID for this user
   */
  userId?: string;
  /**
   * Override the network user id (UUIDv4) that is assigned by the collector and stored in cookies
   */
  networkUserId?: string;
  /**
   * The domain user id (DUID) is a generated identifier that is stored in a first party cookie on Web.
   * The React Native tracker does not assign it automatically.
   */
  domainUserId?: string;
  /**
   * The custom user-agent. It overrides the user-agent used by default.
   */
  useragent?: string;
  /**
   * Override the IP address of the device
   */
  ipAddress?: string;
  /**
   * The timezone label
   */
  timezone?: string;
  /**
   * The language set in the device
   */
  language?: string;
  /**
   * The screen resolution
   */
  screenResolution?: ScreenSize;
  /**
   * The screen viewport size
   */
  screenViewport?: ScreenSize;
  /**
   * Color depth (integer)
   */
  colorDepth?: number;
}

/**
 * Screen size in pixels
 */
export type ScreenSize = [number, number];

/**
 * Trigger for MessageNotification event
 */
export type Trigger = 'push' | 'location' | 'calendar' | 'timeInterval' | 'other';

/**
 * Attachment object that identify an attachment in the MessageNotification.
 */
export type MessageNotificationAttachmentProps = {
  identifier: string;
  type: string;
  url: string;
};

/**
 * MessageNotification event properties
 * schema: iglu:com.snowplowanalytics.mobile/message_notification/jsonschema/1-0-0
 */
export type MessageNotificationProps = {
  /**
   * The action associated with the notification.
   */
  action?: string;
  /*
   * Attachments added to the notification (they can be part of the data object).
   */
  attachments?: MessageNotificationAttachmentProps[];
  /**
   * The notification's body.
   */
  body: string;
  /*
   * Variable string values to be used in place of the format specifiers in bodyLocArgs to use to localize the body text to the user's current localization.
   */
  bodyLocArgs?: string[];
  /**
   * The key to the body string in the app's string resources to use to localize the body text to the user's current localization.
   */
  bodyLocKey?: string;
  /**
   * The category associated to the notification.
   */
  category?: string;
  /**
   * The application is notified of the delivery of the notification if it's in the foreground or background, the app will be woken up (iOS only).
   */
  contentAvailable?: boolean;
  /**
   * The group which this notification is part of.
   */
  group?: string;
  /**
   * The icon associated to the notification (Android only).
   */
  icon?: string;
  /**
   * The number of items this notification represent.
   */
  notificationCount?: number;
  /**
   * The time when the event of the notification occurred.
   */
  notificationTimestamp?: string;
  /**
   * The sound played when the device receives the notification.
   */
  sound?: string;
  /**
   * The notification's subtitle. (iOS only)
   */
  subtitle?: string;
  /**
   * An identifier similar to 'group' but usable for different purposes (Android only).
   */
  tag?: string;
  /**
   * An identifier similar to 'group' but usable for different purposes (iOS only).
   */
  threadIdentifier?: string;
  /**
   * The notification's title.
   */
  title: string;
  /**
   * Variable string values to be used in place of the format specifiers in titleLocArgs to use to localize the title text to the user's current localization.
   */
  titleLocArgs?: string[];
  /**
   * The key to the title string in the app's string resources to use to localize the title text to the user's current localization.
   */
  titleLocKey?: string;
  /**
   * The trigger that raised the notification message. Must be one of: push, location, calendar, timeInterval, other
   */
  trigger: Trigger;
};

/**
 * EventContext type
 */
export type EventContext = SelfDescribingJson;

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

/**
 * Timing event properties
 */
export type TimingProps = {
  /**
   * The timing category
   */
  category: string;
  /**
   * The timing variable
   */
  variable: string;
  /**
   * The time
   */
  timing: number;
  /**
   * The timing label
   */
  label?: string;
};

/**
 * DeepLinkReceived event properties
 * schema: iglu:com.snowplowanalytics.mobile/deep_link_received/jsonschema/1-0-0
 */
export type DeepLinkReceivedProps = {
  /**
   * URL in the received deep-link.
   */
  url: string;
  /**
   * Referrer URL, source of this deep-link.
   */
  referrer?: string;
};

/**
 * Current session state that is tracked in events.
 */
export interface SessionState {
  /**
   * An identifier for the user of the session
   */
  userId: string;
  /**
   * An identifier for the session
   */
  sessionId: string;
  /**
   * The index of the current session for this user
   */
  sessionIndex: number;
  /**
   * Optional index of the current event in the session
   */
  eventIndex?: number;
  /**
   * The previous session identifier for this user
   */
  previousSessionId?: string;
  /**
   * The mechanism that the session information has been stored on the device
   */
  storageMechanism: string;
  /**
   * The optional identifier of the first event for this session
   */
  firstEventId?: string;
  /**
   * Optional date-time timestamp of when the first event in the session was tracked
   */
  firstEventTimestamp?: string;
}

/**
 * The ReactNativeTracker type
 */
export type ReactNativeTracker = {
  /**
   * Tracks a self-describing event
   *
   * @param argmap - The self-describing event properties
   * @param contexts - The array of event contexts
   * @typeParam TData - The type of the data object within the SelfDescribing object
   */
  readonly trackSelfDescribingEvent: <T extends Record<string, unknown> = Record<string, unknown>>(
    argmap: SelfDescribingJson<T>,
    contexts?: EventContext[]
  ) => void;

  // TODO:
  // /**
  //  * Tracks a screen-view event
  //  *
  //  * @param argmap - The screen-view event's properties
  //  * @param contexts - The array of event contexts
  //  */
  // readonly trackScreenViewEvent: (argmap: ScreenViewProps, contexts?: EventContext[]) => string | undefined;

  // TODO:
  // /**
  //  * Tracks a scroll changed event
  //  *
  //  * @param argmap - The scroll changed event's properties
  //  * @param contexts - The array of event contexts
  //  */
  // readonly trackScrollChangedEvent: (argmap: ScrollChangedProps, contexts?: EventContext[]) => string | undefined;

  // TODO:
  // /**
  //  * Tracks a list item view event
  //  *
  //  * @param argmap - The list item view event's properties
  //  * @param contexts - The array of event contexts
  //  */
  // readonly trackListItemViewEvent: (argmap: ListItemViewProps, contexts?: EventContext[]) => string | undefined;

  /**
   * Tracks a structured event
   *
   * @param argmap - The structured event properties
   * @param contexts - The array of event contexts
   */
  readonly trackStructuredEvent: (argmap: StructuredEvent, contexts?: EventContext[]) => void;

  /**
   * Tracks a page-view event
   *
   * @param argmap - The page-view event properties
   * @param contexts - The array of event contexts
   */
  readonly trackPageViewEvent: (argmap: PageViewEvent, contexts?: EventContext[]) => void;

  /**
   * Tracks a timing event
   *
   * @param argmap - The timing event properties
   * @param contexts - The array of event contexts
   */
  readonly trackTimingEvent: (argmap: TimingProps, contexts?: EventContext[]) => void;

  // TODO:
  // /**
  //  * Tracks a deep link received event
  //  *
  //  * @param argmap - The deep link received event properties
  //  * @param contexts - The array of event contexts
  //  */
  // readonly trackDeepLinkReceivedEvent: (argmap: DeepLinkReceivedProps, contexts?: EventContext[]) => void;

  /**
   * Tracks a message notification event
   *
   * @param argmap - The message notification event properties
   * @param contexts - The array of event contexts
   */
  readonly trackMessageNotificationEvent: (argmap: MessageNotificationProps, contexts?: EventContext[]) => void;

  /**
   * Adds contexts globally, contexts added here will be attached to all applicable events
   * @param contexts - An array containing either contexts or a conditional contexts
   */
  addGlobalContexts(
    contexts:
      | Array<ConditionalContextProvider | ContextPrimitive>
      | Record<string, ConditionalContextProvider | ContextPrimitive>
  ): void;

  /**
   * Removes all global contexts
   */
  clearGlobalContexts(): void;

  /**
   * Removes previously added global context, performs a deep comparison of the contexts or conditional contexts
   * @param contexts - An array containing either contexts or a conditional contexts
   */
  removeGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive | string>): void;

  /**
   * Add a plugin into the plugin collection after Core has already been initialised
   * @param configuration - The plugin to add
   */
  addPlugin(configuration: CorePluginConfiguration): void;

  /**
   * Calls flush on all emitters in order to send all queued events to the collector
   * @returns Promise<void> - Promise that resolves when all emitters have flushed
   */
  flush: () => Promise<void>;

  /**
   * Set the application ID
   *
   * @param appId - An application ID which identifies the current application
   */
  readonly setAppId: (appId: string) => void;

  /**
   * Set the platform
   *
   * @param value - A valid Snowplow platform value
   */
  readonly setPlatform: (value: string) => void;

  /**
   * Sets the business-defined user ID for this user
   *
   * @param newUid - The new userId
   */
  readonly setUserId: (newUid: string) => void;

  /**
   * Override the network user id (UUIDv4) that is assigned by the collector and stored in cookies
   *
   * @param newNuid - The new networkUserId
   */
  readonly setNetworkUserId: (newNuid: string | undefined) => void;

  /**
   * The domain user id (DUID) is a generated identifier that is stored in a first party cookie on Web.
   * The React Native tracker does not assign it automatically.
   *
   * @param newDuid - The new domainUserId
   */
  readonly setDomainUserId: (newDuid: string | undefined) => void;

  /**
   * Override the IP address of the device
   *
   * @param newIp - The new ipAddress
   */
  readonly setIpAddress: (newIp: string) => void;

  /**
   * The custom user-agent. It overrides the user-agent used by default.
   *
   * @param newUagent - The new useragent
   */
  readonly setUseragent: (newUagent: string) => void;

  /**
   * Sets the timezone of the tracker subject
   *
   * @param newTz - The new timezone
   */
  readonly setTimezone: (newTz: string) => void;

  /**
   * Sets the language of the tracker subject
   *
   * @param newLang - The new language
   */
  readonly setLanguage: (newLang: string) => void;

  /**
   * Sets the screenResolution of the tracker subject
   *
   * @param newRes - The new screenResolution
   */
  readonly setScreenResolution: (newRes: ScreenSize) => void;

  /**
   * Sets the screenViewport of the tracker subject
   *
   * @param newView - The new screenViewport
   */
  readonly setScreenViewport: (newView: ScreenSize) => void;

  /**
   * Sets the colorDepth of the tracker subject
   *
   * @param newColorD - The new colorDepth
   */
  readonly setColorDepth: (newLang: number) => void;

  /**
   * Sets subject data
   *
   * @param config - The new subject data
   */
  readonly setSubjectData: (config: SubjectConfiguration) => void;

  /**
   * Gets the identifier for the user of the session
   *
   * @returns {Promise<string | undefined>}
   */
  readonly getSessionUserId: () => Promise<string | undefined>;

  /**
   * Gets the identifier for the session
   *
   * @returns {Promise<string | undefined>}
   */
  readonly getSessionId: () => Promise<string | undefined>;

  /**
   * Gets the index of the current session for this user
   *
   * @returns {Promise<number | undefined>}
   */
  readonly getSessionIndex: () => Promise<number | undefined>;

  /**
   * Gets the current session state
   *
   * @returns {Promise<SessionState | undefined>}
   */
  readonly getSessionState: () => Promise<SessionState | undefined>;

  // TODO:
  // /**
  //  * Gets whether the app is currently in background state
  //  *
  //  * @returns {Promise<boolean | undefined>}
  //  */
  // readonly getIsInBackground: () => Promise<boolean | undefined>;

  // TODO:
  // /**
  //  * Gets the number of background transitions in the current session
  //  *
  //  * @returns {Promise<number | undefined>}
  //  */
  // readonly getBackgroundIndex: () => Promise<number | undefined>;

  // TODO:
  // /**
  //  * Gets the number of foreground transitions in the current session.
  //  *
  //  * @returns {Promise<number | undefined>}
  //  */
  // readonly getForegroundIndex: () => Promise<number | undefined>;
};

export {
  version,
  PageViewEvent,
  StructuredEvent,
  FormFocusOrChangeEvent,
  SelfDescribingJson,
  Timestamp,
  PayloadBuilder,
  Payload,
  CorePlugin,
  CoreConfiguration,
  ContextGenerator,
  ContextFilter,
  EventPayloadAndContext,
  EventStore,
  EventStoreIterator,
  EventStorePayload,
  TrackerCore,
  Logger,
  EmitterConfiguration,
  EmitterConfigurationBase,
  EventJson,
  JsonProcessor,
  TrueTimestamp,
  DeviceTimestamp,
  EventMethod,
  RequestFailure,
  EventBatch,
  EventJsonWithKeys,
  LOG_LEVEL,
  ConditionalContextProvider,
  ContextPrimitive,
  CorePluginConfiguration,
  Emitter,
  FilterProvider,
  RuleSetProvider,
  RuleSet,
} from '@snowplow/tracker-core';
