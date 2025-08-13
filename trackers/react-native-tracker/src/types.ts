import { BrowserPlugin, BrowserPluginConfiguration, Platform } from '@snowplow/browser-tracker-core';
import {
  ConditionalContextProvider,
  ContextPrimitive,
  PageViewEvent,
  SelfDescribingJson,
  StructuredEvent,
} from '@snowplow/tracker-core';

export interface AsyncStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
}

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

  /**
   * The Async storage implementation.
   * In environments where AsyncStorage is not available or where another kind of storage is used,
   * you can provide a custom implementation.
   *
   * @defaultValue AsyncStorage from `@react-native-async-storage/async-storage`
   * */
  asyncStorage?: AsyncStorage;
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
  /**
   * Whether session context is attached to tracked events.
   * @defaultValue true
   */
  sessionContext?: boolean;
}

/**
 * A callback to be used for the `onMessage` prop of a `WebView` component.
 */
export type WebViewMessageHandler = (message: { nativeEvent: { data: string } }) => void;

/**
 * Configuration for app lifecycle tracking
 */
export interface AppLifecycleConfiguration {
  /**
   * Whether to automatically track app lifecycle events (app foreground and background events).
   * Also adds a lifecycle context entity to all events.
   *
   * Foreground event schema: `iglu:com.snowplowanalytics.snowplow/application_foreground/jsonschema/1-0-0`
   * Background event schema: `iglu:com.snowplowanalytics.snowplow/application_background/jsonschema/1-0-0`
   * Context entity schema: `iglu:com.snowplowanalytics.mobile/application_lifecycle/jsonschema/1-0-0`
   *
   * @defaultValue true
   */
  lifecycleAutotracking?: boolean;
  /**
   * Whether to automatically track app install event on first run.
   *
   * Schema: `iglu:com.snowplowanalytics.mobile/application_install/jsonschema/1-0-0`
   *
   * @defaultValue false
   */
  installAutotracking?: boolean;
  /**
   * Version number of the application e.g 1.1.0 (semver or git commit hash).
   *
   * Entity schema if `appBuild` property is set: `iglu:com.snowplowanalytics.mobile/application/jsonschema/1-0-0`
   * Entity schema if `appBuild` property is not set: `iglu:com.snowplowanalytics.snowplow/application/jsonschema/1-0-0`
   */
  appVersion?: string;
  /**
   * Build name of the application e.g s9f2k2d or 1.1.0 beta
   *
   * Entity schema: `iglu:com.snowplowanalytics.mobile/application/jsonschema/1-0-0`
   */
  appBuild?: string;
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
  /**
   * Inject plugins which will be evaluated for each event
   * @defaultValue []
   */
  plugins?: BrowserPlugin[];
  /**
   * The device platform the tracker runs on.
   * @defaultValue 'mob'
   */
  devicePlatform?: Platform;
}

export enum PlatformContextProperty {
  /**
   * The carrier of the SIM inserted in the device.
   * Note: this property is not automatically assigned but can be assigned using the PlatformContextRetriever.
   */
  Carrier = 'carrier',
  /**
   * Type of network the device is connected to.
   * Note: this property is not automatically assigned but can be assigned using the PlatformContextRetriever.
   */
  NetworkType = 'networkType',
  /**
   * Radio access technology that the device is using.
   * Note: this property is not automatically assigned but can be assigned using the PlatformContextRetriever.
   */
  NetworkTechnology = 'networkTechnology',
  /**
   * Advertising identifier on iOS.
   * Note: this property is not automatically assigned but can be assigned using the PlatformContextRetriever.
   */
  AppleIdfa = 'appleIdfa',
  /**
   * UUID identifier for vendors on iOS.
   * Note: this property is not automatically assigned but can be assigned using the PlatformContextRetriever.
   */
  AppleIdfv = 'appleIdfv',
  /**
   * Total physical system memory in bytes.
   * Note: this property is not automatically assigned but can be assigned using the PlatformContextRetriever.
   */
  PhysicalMemory = 'physicalMemory',
  /**
   * Amount of memory in bytes available to the current app.
   * The property is not tracked in the current version of the tracker due to the tracker not being able to access the API, see the issue here: https://github.com/snowplow/snowplow-ios-tracker/issues/772
   * Note: this property is not automatically assigned but can be assigned using the PlatformContextRetriever.
   */
  AppAvailableMemory = 'appAvailableMemory',
  /**
   * Remaining battery level as an integer percentage of total battery capacity.
   * Note: this property is not automatically assigned but can be assigned using the PlatformContextRetriever.
   */
  BatteryLevel = 'batteryLevel',
  /**
   * Battery state for the device.
   * Note: this property is not automatically assigned but can be assigned using the PlatformContextRetriever.
   */
  BatteryState = 'batteryState',
  /** A Boolean indicating whether Low Power Mode is enabled. */
  LowPowerMode = 'lowPowerMode',
  /**
   * Bytes of storage remaining.
   * Note: This is not automatically assigned by the tracker as it may be considered as fingerprinting. You can assign it using the PlatformContextRetriever.
   */
  AvailableStorage = 'availableStorage',
  /**
   * Total size of storage in bytes.
   * Note: This is not automatically assigned by the tracker as it may be considered as fingerprinting. You can assign it using the PlatformContextRetriever.
   */
  TotalStorage = 'totalStorage',
  /**
   * A Boolean indicating whether the device orientation is portrait (either upright or upside down).
   * Note: This is not automatically assigned by the tracker as it may be considered as fingerprinting. You can assign it using the PlatformContextRetriever.
   */
  IsPortrait = 'isPortrait',
  /**
   * Screen resolution in pixels. Arrives in the form of WIDTHxHEIGHT (e.g., 1200x900). Doesn't change when device orientation changes.
   * Note: This is not automatically assigned by the tracker as it may be considered as fingerprinting. You can assign it using the PlatformContextRetriever.
   */
  Resolution = 'resolution',
  /**
   * Scale factor used to convert logical coordinates to device coordinates of the screen (uses UIScreen.scale on iOS).
   */
  Scale = 'scale',
  /**
   * System language currently used on the device (ISO 639).
   */
  Language = 'language',
  /**
   * Advertising identifier on Android.
   * Note: This is not automatically assigned by the tracker as it may be considered as fingerprinting. You can assign it using the PlatformContextRetriever.
   */
  AndroidIdfa = 'androidIdfa',
  /**
   * Available memory on the system in bytes (Android only).
   * Note: This is not automatically assigned by the tracker as it may be considered as fingerprinting. You can assign it using the PlatformContextRetriever.
   */
  SystemAvailableMemory = 'systemAvailableMemory',
  /**
   * Android vendor ID scoped to the set of apps published under the same Google Play developer account (see https://developer.android.com/training/articles/app-set-id).
   * Note: This is not automatically assigned by the tracker as it may be considered as fingerprinting. You can assign it using the PlatformContextRetriever.
   */
  AppSetId = 'appSetId',
  /**
   * Scope of the `appSetId`. Can be scoped to the app or to a developer account on an app store (all apps from the same developer on the same device will have the same ID).
   * Note: This is not automatically assigned by the tracker as it may be considered as fingerprinting. You can assign it using the PlatformContextRetriever.
   */
  AppSetIdScope = 'appSetIdScope',
}

/**
 * Overrides for the values for properties of the platform context.
 */
export interface PlatformContextRetriever {
  /** Operating system type (e.g., ios, tvos, watchos, osx, android) */
  getOsType?: () => Promise<string>;

  /** The current version of the operating system */
  getOsVersion?: () => Promise<string>;

  /** The end-user-visible name for the end product */
  getDeviceModel?: () => Promise<string>;

  /** The manufacturer of the product/hardware */
  getDeviceManufacturer?: () => Promise<string>;

  /** The carrier of the SIM inserted in the device */
  getCarrier?: () => Promise<string | undefined>;

  /** Type of network the device is connected to */
  getNetworkType?: () => Promise<'mobile' | 'wifi' | 'offline' | undefined>;

  /** Radio access technology that the device is using */
  getNetworkTechnology?: () => Promise<string | undefined>;

  /** Advertising identifier on iOS (UUID formatted string) */
  getAppleIdfa?: () => Promise<string | undefined>;

  /** UUID identifier for vendors on iOS */
  getAppleIdfv?: () => Promise<string | undefined>;

  /** Bytes of storage remaining */
  getAvailableStorage?: () => Promise<number | undefined>;

  /** Total size of storage in bytes */
  getTotalStorage?: () => Promise<number | undefined>;

  /** Total physical system memory in bytes */
  getPhysicalMemory?: () => Promise<number | undefined>;

  /** Amount of memory in bytes available to the current app */
  getAppAvailableMemory?: () => Promise<number | undefined>;

  /** Remaining battery level as an integer percentage of total battery capacity */
  getBatteryLevel?: () => Promise<number | undefined>;

  /** Battery state for the device */
  getBatteryState?: () => Promise<'unplugged' | 'charging' | 'full' | undefined>;

  /** A Boolean indicating whether Low Power Mode is enabled */
  getLowPowerMode?: () => Promise<boolean | undefined>;

  /** A Boolean indicating whether the device orientation is portrait (either upright or upside down) */
  isPortrait?: () => Promise<boolean | undefined>;

  /** Screen resolution in pixels. Arrives in the form of WIDTHxHEIGHT (e.g., 1200x900). Doesn't change when device orientation changes */
  getResolution?: () => Promise<string | undefined>;

  /** Scale factor used to convert logical coordinates to device coordinates of the screen (uses UIScreen.scale on iOS) */
  getScale?: () => Promise<number | undefined>;

  /** System language currently used on the device (ISO 639) */
  getLanguage?: () => Promise<string | undefined>;

  /** Advertising identifier on Android. */
  getAndroidIdfa?: () => Promise<string | undefined>;

  /** Available memory on the system in bytes (Android only). */
  getSystemAvailableMemory?: () => Promise<number | undefined>;

  /** Android vendor ID scoped to the set of apps published under the same Google Play developer account (see https://developer.android.com/training/articles/app-set-id). */
  getAppSetId?: () => Promise<string | undefined>;

  /** Scope of the `appSetId`. Can be scoped to the app or to a developer account on an app store (all apps from the same developer on the same device will have the same ID). */
  getAppSetIdScope?: () => Promise<string | undefined>;
}

export interface PlatformContextConfiguration {
  /**
   * Whether to track the mobile context with information about the device.
   * Note: Only some properties (osType, osVersion, deviceManufacturer, deviceModel, resolution, language, scale) will be tracked by default. Other properties can be assigned using the PlatformContextRetriever.
   * @defaultValue true
   */
  platformContext?: boolean;

  /**
   * List of properties of the platform context to track. If not passed and `platformContext` is enabled, all available properties will be tracked.
   * The required `osType`, `osVersion`, `deviceManufacturer`, and `deviceModel` properties will be tracked in the entity regardless of this setting.
   */
  platformContextProperties?: PlatformContextProperty[];

  /**
   * Set of callbacks to be used to retrieve properties of the platform context.
   * Overrides the tracker implementation for setting the properties.
   */
  platformContextRetriever?: PlatformContextRetriever;
}

/**
 * Configuration for deep link tracking
 */
export interface DeepLinkConfiguration {
  /**
   * Whether to track the deep link context entity with information from the deep link received event on the first screen view event.
   * @defaultValue true
   */
  deepLinkContext?: boolean;
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
 * Properties for a structured event.
 * A classic style of event tracking, allows for easier movement between analytics systems.
 * Self-describing events are preferred for their schema validation.
 */
export type StructuredProps = StructuredEvent;

/**
 * Interface for any self-describing JSON such as context entities or self-describing events
 * @typeParam T - The type of the data object within a SelfDescribingJson
 */
export type SelfDescribing<T = Record<string, unknown>> = SelfDescribingJson<T>;

/**
 * The ReactNativeTracker type
 */
export type ReactNativeTracker = {
  /**
   * The namespace of the tracker
   */
  namespace: string;
  /**
   * Tracks a self-describing event
   *
   * @param argmap - The self-describing event properties
   * @param contexts - The array of event contexts
   * @typeParam TData - The type of the data object within the SelfDescribing object
   */
  readonly trackSelfDescribingEvent: <T extends Record<string, unknown> = Record<string, unknown>>(
    argmap: SelfDescribing<T>,
    contexts?: EventContext[]
  ) => void;

  /**
   * Tracks a screen-view event
   *
   * @param argmap - The screen-view event's properties
   * @param contexts - The array of event contexts
   */
  readonly trackScreenViewEvent: (argmap: ScreenViewProps, contexts?: EventContext[]) => void;

  /**
   * Tracks a scroll changed event
   *
   * @param argmap - The scroll changed event's properties
   * @param contexts - The array of event contexts
   */
  readonly trackScrollChangedEvent: (argmap: ScrollChangedProps, contexts?: EventContext[]) => void;

  /**
   * Tracks a list item view event
   *
   * @param argmap - The list item view event's properties
   * @param contexts - The array of event contexts
   */
  readonly trackListItemViewEvent: (argmap: ListItemViewProps, contexts?: EventContext[]) => void;

  /**
   * Tracks a structured event
   *
   * @param argmap - The structured event properties
   * @param contexts - The array of event contexts
   */
  readonly trackStructuredEvent: (argmap: StructuredProps, contexts?: EventContext[]) => void;

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

  /**
   * Tracks a deep link received event
   *
   * @param argmap - The deep link received event properties
   * @param contexts - The array of event contexts
   */
  readonly trackDeepLinkReceivedEvent: (argmap: DeepLinkReceivedProps, contexts?: EventContext[]) => void;

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
  addPlugin(configuration: BrowserPluginConfiguration): void;

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
   */
  readonly getSessionUserId: () => Promise<string | undefined>;

  /**
   * Gets the identifier for the session
   */
  readonly getSessionId: () => Promise<string | undefined>;

  /**
   * Gets the index of the current session for this user
   */
  readonly getSessionIndex: () => Promise<number | undefined>;

  /**
   * Gets the current session state
   */
  readonly getSessionState: () => Promise<SessionState | undefined>;

  /**
   * Gets whether the app is currently in background state
   */
  readonly getIsInBackground: () => boolean | undefined;

  /**
   * Gets the number of background transitions in the current session
   */
  readonly getBackgroundIndex: () => number | undefined;

  /**
   * Gets the number of foreground transitions in the current session.
   */
  readonly getForegroundIndex: () => number | undefined;

  /**
   * Enables tracking the platform context with information about the device.
   * Note: Only some properties (osType, osVersion, deviceManufacturer, deviceModel, resolution, language, scale) will be tracked by default. Other properties can be assigned using the PlatformContextRetriever.
   */
  readonly enablePlatformContext: () => Promise<void>;

  /**
   * Disables tracking the platform context with information about the device.
   */
  readonly disablePlatformContext: () => void;

  /**
   * Refreshes the platform context with the latest values.
   */
  readonly refreshPlatformContext: () => Promise<void>;
};

export {
  version,
  PageViewEvent,
  FormFocusOrChangeEvent,
  Timestamp,
  PayloadBuilder,
  Payload,
  CorePlugin,
  CoreConfiguration,
  ContextGenerator,
  ContextFilter,
  EventPayloadAndContext,
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
