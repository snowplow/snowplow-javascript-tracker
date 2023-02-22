import { DynamicContext } from '@snowplow/tracker-core';

import { MediaPlayerEvent, YouTube } from './contexts';
import { SnowplowEvent } from './snowplowEvents';
import { YTPlayerEvent, YTState } from './constants';

export type EventGroup = (SnowplowEvent | YTPlayerEvent | YTState | string)[];

export interface TrackingOptions {
  mediaId: string;
  player?: YT.Player;
  urlParameters?: UrlParameters;
  captureEvents: EventGroup;
  youtubeEvents: YTPlayerEvent[];
  label?: string;
  updateRate?: number;
  progress?: {
    boundaries: number[];
    boundaryTimeoutIds: ReturnType<typeof setTimeout>[];
  };
  context?: DynamicContext | null;
}

export interface MediaTrackingOptions {
  boundaries?: number[];
  captureEvents?: EventGroup;
  label?: string;
  updateRate?: number;
}

export interface SnowplowYouTubeData {
  percent?: number;
  [key: string]: number | undefined;
}

export interface MediaEventData {
  schema: string;
  data: MediaPlayerEvent;
  context: MediaEntities[];
}

export interface MediaEntities {
  schema: string;
  data: YouTube | SnowplowYouTubeData | SnowplowMediaPlayer;
}

export interface SnowplowMediaPlayer {
  currentTime: number;
  duration: number;
  ended: boolean;
  loop: boolean;
  muted: boolean;
  paused: boolean;
  playbackRate: number;
  volume: number;
  percentProgress?: number;
  [key: string]: unknown;
}

export interface TrackedPlayer {
  player: YT.Player;
  conf: TrackingOptions;
  seekTracking: {
    prevTime: number;
    enabled: boolean;
  };
  volumeTracking: {
    prevVolume: number;
    enabled: boolean;
  };
}

export interface EventData {
  error?: string;
  percentThrough?: number;
}

export interface UrlParameters {
  autoplay?: String;
  controls?: String;
  diablekb?: String;
  enablejsapi?: String;
  end?: String;
  fs?: String;
  iv_load_policy?: String;
  hl?: String;
  list?: String;
  listType?: String;
  loop?: String;
  modestbranding?: String;
  origin?: String;
  playlist?: String;
  playsinline?: String;
  rel?: String;
  start?: String;
  widget_referrer?: String;
}

export interface YouTubeTrackingConfiguration {
  id: string;
  options?: MediaTrackingOptions;
  context?: DynamicContext | null;
}
