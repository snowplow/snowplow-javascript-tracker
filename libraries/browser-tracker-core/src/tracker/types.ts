import { BrowserPlugin } from '../plugins';
import {
  CommonEventProperties,
  SelfDescribingJson,
  TrackerCore,
  CorePluginConfiguration,
} from '@snowplow/tracker-core';
import { SharedState } from '../state';
import { EmitterConfigurationBase, EventStoreConfiguration } from '@snowplow/tracker-core';

type RequireAtLeastOne<T> = { [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>> }[keyof T];

/* Available built-in contexts */
export type BuiltInContexts =
  | RequireAtLeastOne<{
      /* Toggles the web_page context */
      webPage: boolean;
      /* Toggles the session context */
      session: boolean;
      /* Toggles the browser context */
      browser: boolean;
    }>
  | Record<string, never>;

/* Configuration for Anonymous Tracking */
export type AnonymousTrackingOptions = boolean | { withSessionTracking?: boolean; withServerAnonymisation?: boolean };
/* Available configurations for different storage strategies */
export type StateStorageStrategy = 'cookieAndLocalStorage' | 'cookie' | 'localStorage' | 'none';
/* The supported platform values */
export type Platform = 'web' | 'mob' | 'pc' | 'srv' | 'app' | 'tv' | 'cnsl' | 'iot';
/* The supported Cookie SameSite values */
export type CookieSameSite = 'None' | 'Lax' | 'Strict';

/* Available configuration for the extended cross domain linker */
export type ExtendedCrossDomainLinkerAttributes = {
  userId?: boolean;
  sessionId?: boolean;
  sourceId?: boolean;
  sourcePlatform?: boolean;
  /**
   * Allow for the collection of the link text when a cross-domain link is clicked. Can also accept a callback for customizing information collection.
   */
  reason?: boolean | ((evt: Event) => string);
};

export type ExtendedCrossDomainLinkerOptions = boolean | ExtendedCrossDomainLinkerAttributes;

/* Setting for the `preservePageViewIdForUrl` configuration that decides how to preserve the pageViewId on URL changes. */
export type PreservePageViewIdForUrl = boolean | 'full' | 'pathname' | 'pathnameAndSearch';

export interface LocalStorageEventStoreConfigurationBase extends EventStoreConfiguration {
  /**
   * The maximum amount of events that will be buffered in local storage
   *
   * This is useful to ensure the Tracker doesn't fill the 5MB or 10MB available to
   * each website should the collector be unavailable due to lost connectivity.
   * Will drop events once the limit is hit
   * @defaultValue 1000
   */
  maxLocalStorageQueueSize?: number;

  /**
   * Whether to use localStorage at all
   * Default is true
   */
  useLocalStorage?: boolean;
}

/**
 * The configuration object for initialising the tracker
 * @example
 * ```
 * newTracker('sp1', 'collector.my-website.com', {
 *  appId: 'my-app-id',
 *  platform: 'web',
 *  plugins: [ PerformanceTimingPlugin(), AdTrackingPlugin() ],
 *  stateStorageStrategy: 'cookieAndLocalStorage'
 * });
 * ```
 */
export type TrackerConfiguration = {
  /**
   * Should event properties be base64 encoded where supported
   * @defaultValue false unless {@link EmitterConfigurationBase.eventMethod | eventMethod} is `get`
   */
  encodeBase64?: boolean;
  /**
   * The domain all cookies will be set on
   * @defaultValue The current domain
   */
  cookieDomain?: string;
  /**
   * The name of the _sp_.id cookie, will rename the _sp_ section
   * @defaultValue _sp_
   */
  cookieName?: string;
  /**
   * The SameSite value for the cookie
   * {@link https://snowplowanalytics.com/blog/2020/09/07/pipeline-configuration-for-complete-and-accurate-data/}
   * @defaultValue Lax
   */
  cookieSameSite?: CookieSameSite;
  /**
   * Set the Secure flag on the cookie
   * @defaultValue true
   */
  cookieSecure?: boolean;
  /**
   * How long the cookie will be set for
   * @defaultValue 63072000 (2 years)
   */
  cookieLifetime?: number;
  /**
   * How long until a session expires
   * @defaultValue 1800 (30 minutes)
   */
  sessionCookieTimeout?: number;
  /** The app id to send with each event */
  appId?: string;
  /**
   * Version of the application tracked as a context entity with all events.
   * Can be a semver-like structure (e.g 1.1.0) or a Git commit SHA hash.
   * Entity schema: iglu:com.snowplowanalytics.snowplow/application/jsonschema/1-0-0
   */
  appVersion?: string;
  /**
   * The platform the event is being sent from
   * @defaultValue web
   */
  platform?: Platform;
  /**
   * Whether the doNotTracK flag should be respected
   * @defaultValue false
   */
  respectDoNotTrack?: boolean;
  /**
   * Configure the cross domain linker which will add user identifiers to
   * links on the callback
   */
  crossDomainLinker?: (elt: HTMLAnchorElement | HTMLAreaElement) => boolean;
  /**
   * Configure the cross domain linker to use the extended format, allowing for
   * more user/session information to pass to the cross domain navigation.
   */
  useExtendedCrossDomainLinker?: ExtendedCrossDomainLinkerOptions;
  /**
   * Whether the tracker should attempt to figure out what the root
   * domain is to store cookies on
   *
   * This sets cookies to try to determine the root domain, and some cookies may
   * fail to save. This is expected behavior.
   * @defaultValue true
   */
  discoverRootDomain?: boolean;
  /**
   * The storage strategy which the tracker will use for storing user and session identifiers
   * and if local storage is allowed for buffering the events
   * @defaultValue cookieAndLocalStorage
   */
  stateStorageStrategy?: StateStorageStrategy;
  /**
   * Whether to reset the Activity Tracking counters on a new page view.
   * Disabling this leads to legacy behavior due to a "bug".
   * Recommended to leave enabled, particularly on SPAs.
   * @defaultValue true
   */
  resetActivityTrackingOnPageView?: boolean;
  /**
   * Configuration for Anonymous Tracking
   * @defaultValue false
   */
  anonymousTracking?: AnonymousTrackingOptions;
  /**
   * Use to configure built in contexts
   * @defaultValue `{ webPage: true, session: false, browser: false }`
   */
  contexts?: BuiltInContexts;
  /**
   * Inject plugins which will be evaluated for each event
   * @defaultValue []
   */
  plugins?: Array<BrowserPlugin>;
  /**
   * Callback fired whenever the session identifier is updated.
   * @param updatedSession - On session update, the new session information plus the previous session id.
   */
  onSessionUpdateCallback?: (updatedSession: ClientSession) => void;

  /**
   * Decide how the `pageViewId` should be preserved based on the URL.
   * If set to `false`, the `pageViewId` will be regenerated on the second and each following page view event (first page view doesn't change the page view ID since tracker initialization).
   * If set to `true` or `'full'`, the `pageViewId` will be kept the same for all page views with that exact URL (even for events tracked before the page view event).
   * If set to `'pathname'`, the `pageViewId` will be kept the same for all page views with the same pathname (search params or fragment may change).
   * If set to `'pathnameAndSearch'`, the `pageViewId` will be kept the same for all page views with the same pathname and search params (fragment may change).
   * If `preservePageViewId` is enabled, the `preservePageViewIdForUrl` setting is ignored.
   * Defaults to `false`.
   */
  preservePageViewIdForUrl?: PreservePageViewIdForUrl;

  /**
   * Whether to write the cookies synchronously.
   * This can be useful for testing purposes to ensure that the cookies are written before the test continues.
   * It also has the benefit of making sure that the cookie is correctly set before session information is used in events.
   * The downside is that it is slower and blocks the main thread.
   * @defaultValue false
   */
  synchronousCookieWrite?: boolean;
} & EmitterConfigurationBase &
  LocalStorageEventStoreConfigurationBase;

/**
 * The data which is passed to the Activity Tracking callback
 */
export type ActivityCallbackData = {
  /**
   * All context for the activity tracking
   * Often generated by the page view events context callback
   */
  context: Array<SelfDescribingJson>;
  /** The current page view id */
  pageViewId: string;
  /** The minimum X scroll position for the current page view */
  minXOffset: number;
  /** The maximum X scroll position for the current page view */
  minYOffset: number;
  /** The minimum Y scroll position for the current page view */
  maxXOffset: number;
  /** The maximum Y scroll position for the current page view */
  maxYOffset: number;
};

/** The callback for enableActivityTrackingCallback */
export type ActivityCallback = (data: ActivityCallbackData) => void;

/**
 * The base configuration for activity tracking
 */
export interface ActivityTrackingConfiguration {
  /** The minimum time that must have elapsed before first heartbeat */
  minimumVisitLength: number;
  /** The interval at which the callback will be fired */
  heartbeatDelay: number;
}

/**
 * The callback for enableActivityTrackingCallback
 */
export interface ActivityTrackingConfigurationCallback {
  /** The callback to fire based on heart beat */
  callback: ActivityCallback;
}

/**
 * A Page View event
 * Used for tracking a page view
 */
export interface PageViewEvent {
  /** Override the page title */
  title?: string | null;
  /** A callback which will fire on the page view and each subsequent activity tracking event for this page view */
  contextCallback?: (() => Array<SelfDescribingJson>) | null;
}

/**
 * The configuration that can be changed when disabling anonymous tracking
 */
export interface DisableAnonymousTrackingConfiguration {
  /* Available configurations for different storage strategies */
  stateStorageStrategy?: StateStorageStrategy;
}

/**
 * The configuration that can be changed when enabling anonymous tracking
 */
export interface EnableAnonymousTrackingConfiguration {
  /* Configuration for Anonymous Tracking */
  options?: AnonymousTrackingOptions;
  /* Available configurations for different storage strategies */
  stateStorageStrategy?: StateStorageStrategy;
}

/**
 * The configuration that can be changed when enabling anonymous tracking
 */
export interface ClearUserDataConfiguration {
  /* Store session information in memory for subsequent events */
  preserveSession: boolean;
  /* Store user information in memory for subsequent events */
  preserveUser: boolean;
}

/**
 * The configuration that can be changed when flushing the buffer
 */
export interface FlushBufferConfiguration {
  /* The size of the buffer after this flush */
  newBufferSize?: number;
}

/**
 * The configuration of the plugin to add
 */
export interface BrowserPluginConfiguration extends CorePluginConfiguration {
  /* The plugin to add */
  plugin: BrowserPlugin;
}

/**
 * The format of state elements stored in the `id` cookie.
 */
export type ParsedIdCookie = [
  cookieDisabled: string,
  domainUserId: string,
  cookieCreateTs: number,
  visitCount: number,
  nowTs: number,
  lastVisitTs: number | undefined,
  sessionId: string,
  previousSessionId: string,
  firstEventId: string,
  firstEventTs: number | undefined,
  eventIndex: number
];

/**
 * The Browser Tracker
 */
export interface BrowserTracker {
  /** The unique identifier of this tracker */
  id: string;
  /** The tracker namespace */
  namespace: string;
  /** The instance of the core library which this tracker has initialised */
  core: TrackerCore;
  /** The instance of shared state this tracker is using */
  sharedState: SharedState;

  /**
   * Get the domain session index also known as current memorized visit count.
   *
   * @returns Domain session index
   */
  getDomainSessionIndex: () => number;

  /**
   * Get the current page view ID
   *
   * @returns Page view ID
   */
  getPageViewId: () => string;

  /**
   * Get the current browser tab ID
   *
   * @returns Browser tab ID
   */
  getTabId: () => string | null;

  /**
   * Get the cookie name as cookieNamePrefix + basename + . + domain.
   *
   * @returns Cookie name
   */
  getCookieName: (basename: string) => string;

  /**
   * Get the current user ID (as set previously with setUserId()).
   *
   * @returns Business-defined user ID
   */
  getUserId: () => string | null | undefined;

  /**
   * Get visitor ID (from first party cookie)
   *
   * @returns Visitor ID (or null, if not yet known)
   */
  getDomainUserId: () => string;

  /**
   * Get the visitor information (from first party cookie)
   *
   * @returns The domain user information array
   */
  getDomainUserInfo: () => ParsedIdCookie;

  /**
   * Override referrer
   *
   * @param url - the custom referrer
   */
  setReferrerUrl: (url: string) => void;

  /**
   * Override url
   *
   * @param url - The custom url
   */
  setCustomUrl: (url: string) => void;

  /**
   * Override document.title
   *
   * @param title - The document title
   */
  setDocumentTitle: (title: string) => void;

  /**
   * Strip hash tag (or anchor) from URL
   *
   * @param enableFilter - whether to enable this feature
   */
  discardHashTag: (enableFilter: boolean) => void;

  /**
   * Strip braces from URL
   *
   * @param enableFilter - whether to enable this feature
   */
  discardBrace: (enableFilter: boolean) => void;

  /**
   * Set first-party cookie path
   *
   * @param path - The path for cookies
   */
  setCookiePath: (path: string) => void;

  /**
   * Set visitor cookie timeout (in seconds)
   *
   * @param timeout - The timeout for the user identifier cookie
   */
  setVisitorCookieTimeout: (timeout: number) => void;

  /**
   * Expires current session and starts a new session.
   */
  newSession: () => void;

  /**
   * Enable querystring decoration for links passing a filter
   *
   * @param crossDomainLinkerCriterion - Function used to determine which links to decorate
   */
  crossDomainLinker: (crossDomainLinkerCriterion: (elt: HTMLAnchorElement | HTMLAreaElement) => boolean) => void;

  /**
   * Enables page activity tracking (sends page
   * pings to the Collector regularly).
   *
   * @param configuration - The activity tracking configuration
   */
  enableActivityTracking: (configuration: ActivityTrackingConfiguration) => void;

  /**
   * Enables page activity tracking (replaces collector ping with callback).
   *
   * @param configuration - The activity tracking configuration
   */
  enableActivityTrackingCallback: (
    configuration: ActivityTrackingConfiguration & ActivityTrackingConfigurationCallback
  ) => void;

  /**
   * Disables page activity tracking.
   */
  disableActivityTracking: () => void;

  /**
   * Disables page activity tracking callback.
   */
  disableActivityTrackingCallback: () => void;

  /**
   * Triggers the activityHandler manually to allow external user defined
   * activity. i.e. While watching a video
   */
  updatePageActivity: () => void;

  /**
   * Sets the opt out cookie.
   *
   * @param name - of the opt out cookie
   */
  setOptOutCookie: (name?: string | null) => void;

  /**
   * Set the business-defined user ID for this user.
   *
   * @param userId - The business-defined user ID
   */
  setUserId: (userId?: string | null) => void;

  /**
   * Set the business-defined user ID for this user using the location querystring.
   *
   * @param querystringField - Name of a querystring name-value pair
   */
  setUserIdFromLocation: (querystringField: string) => void;

  /**
   * Set the business-defined user ID for this user using the referrer querystring.
   *
   * @param querystringField - Name of a querystring name-value pair
   */
  setUserIdFromReferrer: (querystringField: string) => void;

  /**
   * Set the business-defined user ID for this user to the value of a cookie.
   *
   * @param cookieName - Name of the cookie whose value will be assigned to businessUserId
   */
  setUserIdFromCookie: (cookieName: string) => void;

  /**
   * Specify the Snowplow collector URL. Specific http or https to force it
   * or leave it off to match the website protocol.
   *
   * @param collectorUrl - The collector URL, with or without protocol
   */
  setCollectorUrl: (collectorUrl: string) => void;

  /**
   * Alter buffer size
   * Can be useful if you want to stop batching requests to ensure events start
   * sending closer to event creation
   *
   * @param newBufferSize - The new buffer size that will be used for all future tracking
   */
  setBufferSize: (newBufferSize: number) => void;

  /**
   * Send all events in the outQueue
   * Only need to use this when sending events with a bufferSize of at least 2
   *
   * @param configuration - The configuration to use following flushing the buffer
   */
  flushBuffer: (configuration?: FlushBufferConfiguration) => void;

  /**
   * Stop regenerating `pageViewId` (available from `web_page` context)
   */
  preservePageViewId: () => void;

  /**
   * Decide how the `pageViewId` should be preserved based on the URL.
   * If set to `false`, the `pageViewId` will be regenerated on the second and each following page view event (first page view doesn't change the page view ID since tracker initialization).
   * If set to `true` or `'full'`, the `pageViewId` will be kept the same for all page views with that exact URL (even for events tracked before the page view event).
   * If set to `'pathname'`, the `pageViewId` will be kept the same for all page views with the same pathname (search params or fragment may change).
   * If set to `'pathnameAndSearch'`, the `pageViewId` will be kept the same for all page views with the same pathname and search params (fragment may change).
   * If `preservePageViewId` is enabled, the `preservePageViewIdForUrl` setting is ignored.
   * Defaults to `false`.
   */
  preservePageViewIdForUrl: (preserve: PreservePageViewIdForUrl) => void;

  /**
   * Log visit to this page
   *
   * @param event - The Page View Event properties
   */
  trackPageView: (event?: PageViewEvent & CommonEventProperties) => void;

  /**
   * Disables anonymous tracking if active (ie. tracker initialized with `anonymousTracking`)
   * For stateStorageStrategy override, uses supplied value first,
   * falls back to one defined in initial config, otherwise uses cookieAndLocalStorage.
   *
   * @param configuration - The configuration to use following disabling anonymous tracking
   */
  disableAnonymousTracking: (configuration?: DisableAnonymousTrackingConfiguration) => void;

  /**
   * Enables anonymous tracking (ie. tracker initialized without `anonymousTracking`)
   *
   * @param configuration - The configuration to use following activating anonymous tracking
   */
  enableAnonymousTracking: (configuration?: EnableAnonymousTrackingConfiguration) => void;

  /**
   * Clears all cookies and local storage containing user and session identifiers
   */
  clearUserData: (configuration?: ClearUserDataConfiguration) => void;

  /**
   * Add a plugin into the plugin collection after Tracker has already been initialised
   * @param configuration - The plugin to add
   */
  addPlugin: (configuration: BrowserPluginConfiguration) => void;
}

/**
 * Schema for client client session context entity
 */
export interface ClientSession extends Record<string, unknown> {
  /**
   * An identifier for the user of the session (same as domain_userid)
   */
  userId: string;

  /**
   * An identifier for the session (same as domain_sessionid)
   */
  sessionId: string;

  /**
   * The index of the current session for this user (same as domain_sessionidx)
   */
  sessionIndex: number;

  /**
   * Index of the current event in the session
   */
  eventIndex: number;

  /**
   * The previous session identifier for this user
   */
  previousSessionId: string | null;

  /**
   * The mechanism that the session information has been stored on the device
   */
  storageMechanism: string;

  /**
   * Identifier of the first event for this session
   */
  firstEventId: string | null;

  /**
   * Date-time timestamp of when the first event in the session was tracked
   */
  firstEventTimestamp: string | null;
}

export {
  RequestFailure,
  EventBatch,
  EventMethod,
  EventStore,
  EventStoreIterator,
  EventStorePayload,
  EventStoreConfiguration,
  Payload,
} from '@snowplow/tracker-core';
