import { SEARCH_ERROR } from './constants';

export interface TextTrack {
  label: string;
  language: string;
  kind: string;
  mode: string;
}

export interface TrackedElement {
  timeoutId?: ReturnType<typeof setTimeout>;
  waitTime: number;
  retryCount: number;
  tracking: boolean;
}

export interface SearchResult {
  el?: HTMLAudioElement | HTMLVideoElement;
  err?: SEARCH_ERROR;
}

export interface EventDetail {
  boundary?: number;
}
interface TimeRange {
  start: number;
  end: number;
}
export interface MediaEntities {
  schema: string;
  data: MediaElement | VideoElement;
}

export interface VideoElement {
  /**
   * A boolean value that is true if the video should enter or leave picture-in-picture mode automatically when changing tab and/or application
   **/
  autoPictureInPicture?: boolean | null;

  /**
   * The disablePictureInPicture property will hint the user agent to not suggest the picture-in-picture to users or to request it automatically
   **/
  disablePictureInPicture?: boolean | null;

  /**
   * 'poster' HTML attribute, which specifies an image to show while no video data is available
   **/
  poster?: string | null;

  /**
   * A value indicating the intrinsic height of the resource in CSS pixels, or 0 if no media is available yet
   **/
  videoHeight: number;

  /**
   * A value indicating the intrinsic width of the resource in CSS pixels, or 0 if no media is available yet
   **/
  videoWidth: number;
  [key: string]: unknown;
}

export interface MediaElement {
  /**
   * If playback should automatically begin as soon as enough media is available to do so without interruption
   **/
  autoPlay: boolean;

  /**
   * An array of time ranges that have been buffered
   **/
  buffered: TimeRange[];

  /**
   * If the user agent should provide it's own set of controls
   **/
  controls: boolean;

  /**
   * CORS settings value of the media player
   **/
  crossOrigin?: string | null;

  /**
   * The absolute URL of the media resource
   **/
  currentSrc: string;

  /**
   * If audio is muted by default
   **/
  defaultMuted: boolean;

  /**
   * The default media playback rate of the player
   **/
  defaultPlaybackRate: number;

  /**
   * If the media element is allowed to have a remote playback UI
   **/
  disableRemotePlayback?: boolean | null;

  /**
   * An object of the latest error to occur, or null if no errors
   **/
  error?: object | null;

  /**
   * The media file format
   **/
  fileExtension: string | null;

  /**
   * If the video element is fullscreen
   **/
  fullscreen?: boolean | null;

  /**
   * If the media is a video element, or audio
   **/
  mediaType: 'AUDIO' | 'VIDEO';

  /**
   * The current state of the fetching of media over the network
   **/
  networkState: 'NETWORK_EMPTY' | 'NETWORK_IDLE' | 'NETWORK_LOADING' | 'NETWORK_NO_SOURCE';

  /**
   * If the video element is showing Picture-In-Picture
   **/
  pictureInPicture?: boolean | null;

  /**
   * An array of time ranges played
   **/
  played?: TimeRange[];

  /**
   * The HTML id of the element
   **/
  htmlId: string;

  /**
   * The 'preload' HTML attribute of the media
   **/
  preload: string;

  /**
   * The readiness of the media
   **/
  readyState: 'HAVE_NOTHING' | 'HAVE_METADATA' | 'HAVE_CURRENT_DATA' | 'HAVE_FUTURE_DATA' | 'HAVE_ENOUGH_DATA';

  /**
   * Seekable time range(s)
   **/
  seekable: TimeRange[];

  /**
   * If the media is in the process of seeking to a new position
   **/
  seeking: boolean;

  /**
   * The 'src' HTML attribute of the media element
   **/
  src: string;

  /**
   * An array of TextTrack objects on the media element
   **/
  textTracks?: TextTrack[];
  [key: string]: unknown;
}
