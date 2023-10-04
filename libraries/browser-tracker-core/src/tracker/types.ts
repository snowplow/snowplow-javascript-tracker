import { BrowserPlugin } from '../plugins';
import {
  CommonEventProperties,
  SelfDescribingJson,
  TrackerCore,
  CorePluginConfiguration,
} from '@snowplow/tracker-core';
import { SharedState } from '../state';

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
/* The supported methods which events can be sent with */
export type EventMethod = 'post' | 'get' | 'beacon';

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
   * @defaultValue true
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
   * @defaultValue None
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
   * Sets the value of the withCredentials flag
   * on XMLHttpRequest (GET and POST) requests
   * @defaultValue true
   */
  withCredentials?: boolean;
  /**
   * How long until a session expires
   * @defaultValue 1800 (30 minutes)
   */
  sessionCookieTimeout?: number;
  /** The app id to send with each event */
  appId?: string;
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
   * The preferred technique to use to send events
   * @defaultValue post
   */
  eventMethod?: EventMethod;
  /**
   * The post path which events will be sent to
   * Ensure your collector is configured to accept events on this post path
   * @defaultValue '/com.snowplowanalytics.snowplow/tp2'
   */
  postPath?: string;
  /**
   * Should the Sent Timestamp be attached to events
   * @defaultValue true
   */
  useStm?: boolean;
  /**
   * The amount of events that should be buffered before sending
   * Recommended to leave as 1 to reduce change of losing events
   * @defaultValue 1
   */
  bufferSize?: number;
  /**
   * Configure the cross domain linker which will add user identifiers to
   * links on the callback
   */
  crossDomainLinker?: (elt: HTMLAnchorElement | HTMLAreaElement) => boolean;
  /**
   * The max size a POST request can be before the tracker will force send it
   * @defaultValue 40000
   */
  maxPostBytes?: number;
  /**
   * The max size a GET request (its complete URL) can be. Requests over this size will be tried as a POST request.
   * @defaultValue unlimited
   */
  maxGetBytes?: number;
  /**
   * Whether the tracker should attempt to figure out what the root
   * domain is to store cookies on
   *
   * This sets cookies to try to determine the root domain, and some cookies may
   * fail to save. This is expected behavior.
   * @defaultValue false
   */
  discoverRootDomain?: boolean;
  /**
   * The storage strategy which the tracker will use for storing user and session identifiers
   * and if local storage is allowed for buffering the events
   * @defaultValue cookieAndLocalStorage
   */
  stateStorageStrategy?: StateStorageStrategy;
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
   * Whether to reset the Activity Tracking counters on a new page view.
   * Disabling this leads to legacy behavior due to a "bug".
   * Recommended to leave enabled, particularly on SPAs.
   * @defaultValue true
   */
  resetActivityTrackingOnPageView?: boolean;
  /**
   * How long to wait before aborting requests to the collector
   * @defaultValue 5000 (milliseconds)
   */
  connectionTimeout?: number;
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
   * An object of key value pairs which represent headers to
   * attach when sending a POST request, only works for POST
   * @defaultValue `{}`
   */
  customHeaders?: Record<string, string>;
  /**
   * List of HTTP response status codes for which events sent to Collector should be retried in future requests.
   * Only non-success status codes are considered (greater or equal to 300).
   * The retry codes are only considered for GET and POST requests.
   * By default, the tracker retries on all non-success status codes except for 400, 401, 403, 410, and 422.
   */
  retryStatusCodes?: number[];
  /**
   * List of HTTP response status codes for which events sent to Collector should not be retried in future request.
   * Only non-success status codes are considered (greater or equal to 300).
   * The don't retry codes are only considered for GET and POST requests.
   * By default, the tracker retries on all non-success status codes except for 400, 401, 403, 410, and 422.
   */
  dontRetryStatusCodes?: number[];
  /**
   * Callback fired whenever the session identifier is updated.
   * @param updatedSession - On session update, the new session information plus the previous session id.
   */
  onSessionUpdateCallback?: (updatedSession: ClientSession) => void;
  /**
   * Id service full URL. This URL will be added to the queue and will be called using a GET method.
   * This option is there to allow the service URL to be called in order to set any required identifiers e.g. extra cookies.
   *
   * The request respects the `anonymousTracking` option, including the SP-Anonymous header if needed, and any additional custom headers from the customHeaders option.
   */
  idService?: string;
  /**
   * Whether to retry failed requests to the collector.
   *
   * Failed requests are requests that failed due to
   * [timeouts](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/timeout_event),
   * [network errors](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/error_event),
   * and [abort events](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/abort_event).
   *
   * Takes precedent over `retryStatusCodes` and `dontRetryStatusCodes`.
   *
   * @defaultValue true
   */
  retryFailedRequests?: boolean;
};

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
  getDomainSessionIndex: () => void;

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
  getCookieName: (basename: string) => void;

  /**
   * Get the current user ID (as set previously with setUserId()).
   *
   * @returns Business-defined user ID
   */
  getUserId: () => void;

  /**
   * Get visitor ID (from first party cookie)
   *
   * @returns Visitor ID (or null, if not yet known)
   */
  getDomainUserId: () => void;

  /**
   * Get the visitor information (from first party cookie)
   *
   * @returns The domain user information array
   */
  getDomainUserInfo: () => void;

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

/**
 * A collection of GET events which are sent to the collector.
 * This will be a collection of query strings.
 */
export type GetBatch = string[];

/**
 * A collection of POST events which are sent to the collector.
 * This will be a collection of JSON objects.
 */
export type PostBatch = Record<string, unknown>[];

/**
 * A collection of events which are sent to the collector.
 * This can either be a collection of query strings or JSON objects.
 */
export type EventBatch = GetBatch | PostBatch;

/**
 * The data that will be available to the `onRequestFailure` callback
 */
export type RequestFailure = {
  /** The batch of events that failed to send */
  events: EventBatch;
  /** The status code of the failed request */
  status?: number;
  /** The error message of the failed request */
  message?: string;
  /** Whether the tracker will retry the request */
  willRetry: boolean;
};
