import type { startMediaTracking, MediaEventType } from '@snowplow/browser-plugin-media';
import { LEGACY_EVENTS } from './options';

export type EventGroup = 'AllEvents' | 'DefaultEvents';
export type CapturableEvents = (MediaEventType | EventGroup | keyof typeof LEGACY_EVENTS)[];

type MediaTrackingConfiguration = Parameters<typeof startMediaTracking>[0];
type VideoLocation = YT.Player | HTMLIFrameElement | string;

/**
 * YouTubeTrackingPlugin configuration values.
 *
 * Similar to the base Media Tracking plugin configuration, but with handling for a custom `label` and specifying the player to track.
 */
export type YouTubeMediaTrackingConfiguration = Omit<MediaTrackingConfiguration, 'captureEvents' | 'player'> & {
  /**
   * The DOM ID for the element that hosts the YouTube video player to bind to.
   * You can also pass the DOM element or `YT.Player` instance directly.
   */
  video: VideoLocation;
  /**
   * List of events or event groups to include tracking for if possible.
   * Not all MediaEventType values are supported by the Player API and will be ignored.
   */
  captureEvents?: `${CapturableEvents[number]}`[];
  /**
   * This plugin generates the `player` data automatically; use this to specify a `label` for inclusion in that entity.
   */
  label?: string;
};

/**
 * YouTubeTrackingPlugin configuration values.
 *
 * v3 API compatible definition to ease migration.
 */
export type LegacyYouTubeMediaTrackingConfiguration = {
  /**
   * The DOM ID for the element that hosts the YouTube video player to bind to.
   * You can also pass the DOM element or `YT.Player` instance directly.
   */
  id: VideoLocation;
  /**
   * Media Tracking options configuration; most of these options will be passed to the base Media Tracking plugin.
   */
  options: Omit<MediaTrackingConfiguration, 'id' | 'captureEvents' | 'context' | 'timestamp' | 'player'> & {
    /**
     * This plugin generates the `player` data automatically; use this to specify a `label` for inclusion in that entity.
     */
    label?: string;
    /**
     * List of events or event groups to include tracking for if possible.
     * Not all MediaEventType values are supported by the Player API and will be ignored.
     */
    captureEvents?: `${CapturableEvents[number]}`[];
  };
} & Pick<MediaTrackingConfiguration, 'context' | 'timestamp'>;

export interface TrackingOptions<T extends YT.Player | HTMLIFrameElement | string = VideoLocation> {
  sessionId: string;
  video: T;
  config: Omit<YouTubeMediaTrackingConfiguration, 'video'>;
  player?: YT.Player;
  urlParameters?: UrlParameters;
  captureEvents: MediaEventType[];
  youtubeEvents: (keyof YT.Events)[];
  updateRate: number;
  boundaries: number[] | undefined;
}

export interface TrackedPlayer {
  player: YT.Player;
  conf: TrackingOptions;
  pollTracking: {
    prevTime: number;
    prevVolume: number;
    interval: ReturnType<typeof setInterval> | null;
  };
}

export interface UrlParameters {
  autoplay?: string;
  controls?: string;
  diablekb?: string;
  enablejsapi?: string;
  end?: string;
  fs?: string;
  iv_load_policy?: String;
  hl?: string;
  list?: string;
  listType?: string;
  loop?: string;
  modestbranding?: string;
  origin?: string;
  playlist?: string;
  playsinline?: string;
  rel?: string;
  start?: string;
  widget_referrer?: string;
}

/**
 * Some of the types can be found at https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/youtube/index.d.ts
 */
export interface YouTubeEntity {
  /**
   * An array of quality levels in which the current video is available
   */
  avaliableQualityLevels: string[];

  /**
   * An array of playback rates in which the current video is available
   **/
  avaliablePlaybackRates: number[];

  /**
   * If the video is cued
   **/
  cued: boolean;

  /**
   * The HTML id of the video element
   **/
  playerId: string;

  /**
   * This specifies whether the initial video will automatically start to play when the player loads.
   **/
  autoPlay: boolean;

  /**
   * If the player is buffering
   **/
  buffering: boolean;

  /**
   * Whether the video player controls are displayed
   **/
  controls: boolean;

  /**
   * A string of the latest error to occur, or null if no errors
   **/
  error?: 'INVALID_PARAMETER' | 'HTML5_PLAYER_ERROR' | 'NOT_FOUND' | 'EMBED_DISALLOWED';

  /**
   * The percentage of the video that the player shows as buffered
   **/
  loaded: number;

  /**
   * The origin domain of the embed
   **/
  origin?: string | null;

  /**
   * The quality level of the current video
   * Documented types come from the `SuggestedVideoQuality` enum. But from our experiences this is not dependable.
   */
  playbackQuality?: string;

  /**
   * An array of the video IDs in the playlist as they are currently ordered.
   **/
  playlist?: number[] | null;

  /**
   * The index of the playlist video that is currently playing
   **/
  playlistIndex?: number | null;

  /**
   * If the player hasn't started
   **/
  unstarted: boolean;

  /**
   * The YouTube embed URL of the media resource
   **/
  url: string;

  /**
   * The field-of-view of the view in degrees, as measured along the longer edge of the viewport
   **/
  fov?: number | null;

  /**
   * The clockwise or counterclockwise rotational angle of the view in degrees
   **/
  roll?: number | null;

  /**
   * The vertical angle of the view in degrees
   **/
  pitch?: number | null;

  /**
   * The horizontal angle of the view in degrees
   **/
  yaw?: number | null;
  [key: string]: unknown;
}
