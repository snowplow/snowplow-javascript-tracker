import { CommonEventProperties, DynamicContext, SelfDescribingJson } from '@snowplow/tracker-core';

/** Type of media player event */
export enum MediaEventType {
  // Controlling the playback

  /** Media player event fired when the media tracking is successfully attached to the player and can track events. */
  Ready = 'ready',
  /** Media player event sent when the player changes state to playing from previously being paused. */
  Play = 'play',
  /** Media player event sent when the user pauses the playback. */
  Pause = 'pause',
  /** Media player event sent when playback stops when end of the media is reached or because no further data is available. */
  End = 'end',
  /** Media player event sent when a seek operation begins. */
  SeekStart = 'seek_start',
  /** Media player event sent when a seek operation completes. */
  SeekEnd = 'seek_end',

  // Changes in playback settings

  /** Media player event sent when the playback rate has changed. */
  PlaybackRateChange = 'playback_rate_change',
  /** Media player event sent when the volume has changed. */
  VolumeChange = 'volume_change',
  /** Media player event fired immediately after the browser switches into or out of full-screen mode. */
  FullscreenChange = 'fullscreen_change',
  /** Media player event fired immediately after the browser switches into or out of picture-in-picture mode. */
  PictureInPictureChange = 'picture_in_picture_change',

  // Tracking playback progress

  /** Media player event fired periodically during main content playback, regardless of other API events that have been sent. */
  Ping = 'ping',
  /** Media player event fired when a percentage boundary set in options.boundaries is reached */
  PercentProgress = 'percent_progress',

  // Ad events

  /** Media player event that signals the start of an ad break. */
  AdBreakStart = 'ad_break_start',
  /** Media player event that signals the end of an ad break. */
  AdBreakEnd = 'ad_break_end',
  /** Media player event that signals the start of an ad. */
  AdStart = 'ad_start',
  /** Media player event fired when a quartile of ad is reached after continuous ad playback at normal speed. */
  AdFirstQuartile = 'ad_first_quartile',
  /** Media player event fired when a midpoint of ad is reached after continuous ad playback at normal speed. */
  AdMidpoint = 'ad_midpoint',
  /** Media player event fired when a quartile of ad is reached after continuous ad playback at normal speed. */
  AdThirdQuartile = 'ad_third_quartile',
  /** Media player event that signals the ad creative was played to the end at normal speed. */
  AdComplete = 'ad_complete',
  /** Media player event fired when the user activated a skip control to skip the ad creative. */
  AdSkip = 'ad_skip',
  /** Media player event fired when the user clicked on the ad. */
  AdClick = 'ad_click',
  /** Media player event fired when the user clicked the pause control and stopped the ad creative. */
  AdPause = 'ad_pause',
  /** Media player event fired when the user resumed playing the ad creative after it had been stopped or paused. */
  AdResume = 'ad_resume',

  // Data quality events

  /** Media player event fired when the player goes into the buffering state and begins to buffer content. */
  BufferStart = 'buffer_start',
  /** Media player event fired when the the player finishes buffering content and resumes playback. */
  BufferEnd = 'buffer_end',
  /** Media player event tracked when the video playback quality changes automatically. */
  QualityChange = 'quality_change',
  /** Media player event tracked when the resource could not be loaded due to an error.  */
  Error = 'error',
}

/**
 * Configuration for filtering out repeated events of the same type tracked after each other.
 * By default, the seek start, seek end and volume change events are filtered out.
 */
export type FilterOutRepeatedEvents =
  | {
      /**
       * Whether to filter out seek start and end events tracked after each other.
       */
      seekEvents?: boolean;
      /**
       * Whether to filter out volume change events tracked after each other.
       */
      volumeChangeEvents?: boolean;
      /**
       * Timeout in milliseconds after which to send the events that are queued for filtering.
       * Defaults to 5000 ms.
       */
      flushTimeoutMs?: number;
    }
  | boolean;

export type MediaTrackingConfiguration = {
  /** Unique ID of the media tracking. The same ID will be used for media player session if enabled. */
  id: string;
  /** Attributes for the media player context entity */
  player?: MediaPlayerUpdate;
  /** Attributes for the media player session context entity or false to disable it. Enabled by default. */
  session?:
    | {
        /** Local date-time timestamp of when the session started. Automatically set to current time if not given. */
        startedAt?: Date;
      }
    | false;
  /** Configuration for sending ping events. Enabled by default.  */
  pings?:
    | {
        /** Interval in seconds for sending ping events. Defaults to 30s. */
        pingInterval?: number;
        /** Maximum number of consecutive ping events to send when playback is paused. Defaults to 1. */
        maxPausedPings?: number;
      }
    | boolean;
  /** Update page activity in order to keep sending page ping events while playing. Enabled by default. */
  updatePageActivityWhilePlaying?: boolean;
  /** Percentage boundaries when to send percent progress events. Disabled by default. */
  boundaries?: number[];
  /**
   * List of event types to allow tracking.
   * If not specified, all tracked events will be allowed and tracked.
   * Otherwise, tracked event types not present in the list will be discarded.
   */
  captureEvents?: MediaEventType[];
  /**
   * Whether to filter out repeated events of the same type tracked after each other.
   * Useful to filter out repeated seek and volume change events tracked when the user holds down the seek or volume control.
   * Only applies to seek and volume change events.
   * Defaults to true.
   */
  filterOutRepeatedEvents?: FilterOutRepeatedEvents;
};

export type MediaTrackPlaybackRateChangeArguments = {
  /** Playback rate before the change (1 is normal) */
  previousRate?: number;
  /** Playback rate after the change (1 is normal) */
  newRate: number;
};

export type MediaTrackVolumeChangeArguments = {
  /** Volume percentage before the change. */
  previousVolume?: number;
  /** Volume percentage after the change. */
  newVolume: number;
};

export type MediaTrackFullscreenChangeArguments = {
  /** Whether the video element is fullscreen after the change. */
  fullscreen: boolean;
};

export type MediaTrackPictureInPictureChangeArguments = {
  /** Whether the video element is showing picture-in-picture after the change. */
  pictureInPicture: boolean;
};

export type MediaTrackAdPercentProgressArguments = {
  /** The percent of the way through the ad. */
  percentProgress?: number;
};

export type MediaTrackQualityChangeArguments = {
  /** Quality level before the change (e.g., 1080p). */
  previousQuality?: string;
  /** Quality level after the change (e.g., 1080p). */
  newQuality?: string;
  /** The current bitrate in bits per second. */
  bitrate?: number;
  /** The current number of frames per second. */
  framesPerSecond?: number;
  /** Whether the change was automatic or triggered by the user. */
  automatic?: boolean;
};

export type MediaTrackErrorArguments = {
  /** Error-identifying code for the playback issue. E.g. E522 */
  errorCode?: string;
  /** Name for the type of error that occurred in the playback. E.g. forbidden */
  errorName?: string;
  /** Longer description for the error occurred in the playback. */
  errorDescription?: string;
};

export type MediaTrackArguments = {
  /** ID of the media tracking */
  id: string;
  /** Attributes for the media player context entity */
  player?: MediaPlayerUpdate;
};

export type MediaTrackAdArguments = {
  /** Attributes for the media player ad context entity */
  ad?: MediaAdUpdate;
};

export type MediaTrackAdBreakArguments = {
  /** Attributes for the media player ad break context entity */
  adBreak?: MediaPlayerAdBreakUpdate;
};

export type MediaTrackSelfDescribingEventArguments = {
  /** Self-describing event */
  event: SelfDescribingJson;
};

/** Type for all media player events */
export interface MediaEvent {
  /** The event fired by the media player */
  type: MediaEventType;
  /** The custom media identifier given by the user */
  eventBody?: Record<string, unknown>;
}

/** Type of media content. */
export enum MediaType {
  /** Audio content. */
  Audio = 'audio',
  /** Video content. */
  Video = 'video',
}

/** Type/Schema for a context entity for media player events with information about the current state of the media player */
export interface MediaPlayer extends Record<string, unknown> {
  /** The current playback time position within the media in seconds */
  currentTime: number;
  /** A double-precision floating-point value indicating the duration of the media in seconds */
  duration?: number | null;
  /** If playback of the media has ended */
  ended: boolean;
  /** Whether the video element is fullscreen */
  fullscreen?: boolean;
  /** Whether the media is a live stream */
  livestream?: boolean;
  /** Human readable name given to tracked media content. */
  label?: string;
  /** If the video should restart after ending */
  loop?: boolean;
  /** Type of media content. */
  mediaType?: MediaType;
  /** If the media element is muted */
  muted?: boolean;
  /** If the media element is paused */
  paused: boolean;
  /** Whether the video element is showing picture-in-picture */
  pictureInPicture?: boolean;
  /** Type of the media player (e.g., com.youtube-youtube, com.vimeo-vimeo, org.whatwg-media_element) */
  playerType?: string;
  /** Playback rate (1 is normal) */
  playbackRate?: number;
  /** Quality level of the playback (e.g., 1080p). */
  quality?: string;
  /** Volume level */
  volume?: number;
}

/** Partial type/schema for a context entity for media player events with information about the current state of the media player */
export interface MediaPlayerUpdate {
  /** The current playback time position within the media in seconds */
  currentTime?: number;
  /** A double-precision floating-point value indicating the duration of the media in seconds */
  duration?: number | null;
  /** If playback of the media has ended */
  ended?: boolean;
  /** Whether the video element is fullscreen */
  fullscreen?: boolean;
  /** Whether the media is a live stream */
  livestream?: boolean;
  /** Human readable name given to tracked media content. */
  label?: string;
  /** If the video should restart after ending */
  loop?: boolean;
  /** Type of media content. */
  mediaType?: MediaType;
  /** If the media element is muted */
  muted?: boolean;
  /** If the media element is paused */
  paused?: boolean;
  /** Whether the video element is showing picture-in-picture */
  pictureInPicture?: boolean;
  /** Type of the media player (e.g., com.youtube-youtube, com.vimeo-vimeo, org.whatwg-media_element) */
  playerType?: string;
  /** Playback rate (1 is normal) */
  playbackRate?: number;
  /** Quality level of the playback (e.g., 1080p). */
  quality?: string;
  /** Volume level */
  volume?: number;
}

/** Partial type/schema for a context entity for media player events that tracks a session of a single media player usage */
export interface MediaSession extends Record<string, unknown> {
  /** An identifier for the media session that is kept while the media content is played in the media player. Does not reset automatically. */
  mediaSessionId: string;
  /** Date-time timestamp of when the session started */
  startedAt?: Date;
  /** Interval (seconds) in which the ping events will be sent */
  pingInterval?: number;
}

/** Partial type/schema for a context entity for media player events that tracks a session of a single media player usage */
export interface MediaSessionStats {
  /** Total seconds user spent with paused content (excluding linear ads) */
  timePaused?: number;
  /** Total seconds user spent playing content (excluding linear ads) */
  timePlayed?: number;
  /** Total seconds user spent playing content on mute (excluding linear ads) */
  timePlayedMuted?: number;
  /** Total seconds of the content played. Each part of the content played is counted once (i.e., counts rewinding or rewatching the same content only once). Playback rate does not affect this value. */
  contentWatched?: number;
  /** Total seconds that ads played during the session */
  timeSpentAds?: number;
  /** Total seconds that playback was buffering during the session */
  timeBuffering?: number;
  /** Number of ads played */
  ads?: number;
  /** Number of ads that the user clicked on */
  adsClicked?: number;
  /** Number of ads that the user skipped */
  adsSkipped?: number;
  /** Number of ad breaks played */
  adBreaks?: number;
  /** Average playback rate (1 is normal speed) */
  avgPlaybackRate?: number;
}

/** Partial type/schema for a context entity with information about the currently played ad */
export interface MediaAdUpdate {
  /** Friendly name of the ad */
  name?: string;
  /** Unique identifier for the ad */
  adId: string;
  /** The ID of the ad creative */
  creativeId?: string;
  /** The position of the ad within the ad break, starting with 1 */
  podPosition?: number;
  /** Length of the video ad in seconds */
  duration?: number;
  /** Indicating whether skip controls are made available to the end user */
  skippable?: boolean;
}

/** Type/Schema for a context entity with information about the currently played ad */
export interface MediaAd extends Record<string, unknown> {
  /** Friendly name of the ad */
  name?: string;
  /** Unique identifier for the ad */
  adId: string;
  /** The ID of the ad creative */
  creativeId?: string;
  /** The position of the ad within the ad break, starting with 1 */
  podPosition?: number;
  /** Length of the video ad in seconds */
  duration?: number;
  /** Indicating whether skip controls are made available to the end user */
  skippable?: boolean;
}

/** Type of ads within the break */
export enum MediaAdBreakType {
  /** Take full control of the video for a period of time. */
  Linear = 'linear',
  /** Run concurrently to the video. */
  NonLinear = 'nonlinear',
  /** Accompany the video but placed outside the player. */
  Companion = 'companion',
}

/** Type/Schema for a context entity, shared with all media_player_ad events belonging to the ad break */
export interface MediaAdBreak extends Record<string, unknown> {
  /** Ad break name (e.g., pre-roll, mid-roll, and post-roll) */
  name?: string;
  /** An identifier for the ad break */
  breakId: string;
  /** Playback time in seconds at the start of the ad break. */
  startTime: number;
  /**
   * Type of ads within the break:
   * - linear (take full control of the video for a period of time),
   * - nonlinear (run concurrently to the video),
   * - companion (accompany the video but placed outside the player)
   */
  breakType?: MediaAdBreakType;
  /** The number of ads to be played within the ad break */
  podSize?: number;
}

/** Partial type/schema for a context entity, shared with all media_player_ad events belonging to the ad break */
export interface MediaPlayerAdBreakUpdate {
  /** Ad break name (e.g., pre-roll, mid-roll, and post-roll) */
  name?: string;
  /** An identifier for the ad break */
  breakId: string;
  /** Playback time in seconds at the start of the ad break. */
  startTime?: number;
  /**
   * Type of ads within the break:
   * - linear (take full control of the video for a period of time),
   * - nonlinear (run concurrently to the video),
   * - companion (accompany the video but placed outside the player)
   */
  breakType?: MediaAdBreakType;
  /** The number of ads to be played within the ad break */
  podSize?: number;
}

export interface CommonMediaEventProperties extends Omit<CommonEventProperties, 'context'> {
  /** Add context entities to an event by setting an Array of Self Describing JSON */
  context?: DynamicContext;
}

export interface EventWithContext extends CommonEventProperties {
  event: SelfDescribingJson;
}
