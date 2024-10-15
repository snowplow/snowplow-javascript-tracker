import { type Logger } from '@snowplow/tracker-core';
import { MediaEventType } from '@snowplow/browser-plugin-media';

import { TrackingOptions, YouTubeMediaTrackingConfiguration } from './types';

const DEFAULT_BOUNDARIES = [10, 25, 50, 75];
const DEFAULT_UPDATE_RATE_MS = 500;

enum YTState {
  UNSTARTED = 'unstarted',
  ENDED = 'ended',
  PLAYING = 'playing',
  PAUSED = 'paused',
  BUFFERING = 'buffering',
  CUED = 'cued',
}

export const AllEvents: MediaEventType[] = (Object.keys(MediaEventType) as (keyof typeof MediaEventType)[]).map(
  (k) => MediaEventType[k]
);
export const DefaultEvents: MediaEventType[] = [
  MediaEventType.Ready,
  MediaEventType.Pause,
  MediaEventType.Play,
  MediaEventType.Ping,
  MediaEventType.End,
  MediaEventType.SeekStart,
  MediaEventType.SeekEnd,
  MediaEventType.VolumeChange,
  MediaEventType.QualityChange,
  MediaEventType.PlaybackRateChange,
  MediaEventType.PercentProgress,
];

export const LEGACY_EVENTS = {
  play: MediaEventType.Play,
  pause: MediaEventType.Pause,
  seek: MediaEventType.SeekEnd,
  volumechange: MediaEventType.VolumeChange,
  ended: MediaEventType.End,
  error: MediaEventType.Error,
  percentprogress: MediaEventType.PercentProgress,
  playbackratechange: MediaEventType.PlaybackRateChange,
  playbackqualitychange: MediaEventType.QualityChange,
} as const;

const CaptureEventToYouTubeEvent: Partial<Record<MediaEventType | YTState, keyof YT.Events>> = {
  [MediaEventType.PlaybackRateChange]: 'onPlaybackRateChange',
  [MediaEventType.QualityChange]: 'onPlaybackQualityChange',
  [MediaEventType.Error]: 'onError',
  [YTState.UNSTARTED]: 'onStateChange',
  [MediaEventType.End]: 'onStateChange',
  [YTState.ENDED]: 'onStateChange',
  [YTState.PLAYING]: 'onStateChange',
  [MediaEventType.Play]: 'onStateChange',
  [YTState.PAUSED]: 'onStateChange',
  [MediaEventType.Pause]: 'onStateChange',
  [YTState.BUFFERING]: 'onStateChange',
  [YTState.CUED]: 'onStateChange',
};

export function trackingOptionsParser(
  { video, ...options }: YouTubeMediaTrackingConfiguration,
  LOG?: Logger
): TrackingOptions {
  if (!video) throw Error('Property `id` is undefined');

  const { captureEvents = ['DefaultEvents'], boundaries, ...config } = options;

  let parsedEvents: TrackingOptions['captureEvents'] = [];
  for (const ev of captureEvents) {
    // If an event is an EventGroup, get the events from that group
    if (ev === 'AllEvents') {
      parsedEvents = AllEvents;
      break;
    } else if (ev === 'DefaultEvents') {
      parsedEvents.push(...DefaultEvents);
    } else if (ev in LEGACY_EVENTS) {
      parsedEvents.push(LEGACY_EVENTS[ev as keyof typeof LEGACY_EVENTS]);
    } else if (AllEvents.indexOf(ev as MediaEventType) !== -1) {
      parsedEvents.push(ev as MediaEventType);
    } else {
      LOG?.error(`'${ev}' is not a supported event`);
    }
  }

  // Check if any events in `conf.captureEvents` require a listener on a `YTPlayerEvent`
  // for them to fire
  const youtubeEvents: (keyof YT.Events)[] = [];
  for (const ev of parsedEvents) {
    if (CaptureEventToYouTubeEvent.hasOwnProperty(ev) && CaptureEventToYouTubeEvent[ev]) {
      youtubeEvents.push(CaptureEventToYouTubeEvent[ev]!);
    }
  }

  let progress: TrackingOptions['boundaries'] = undefined;
  // If "percentprogress" is in `captureEvents`, add the `progress` object
  // to the tracking options with the user-defined boundaries, or the default
  if (parsedEvents.indexOf(MediaEventType.PercentProgress) !== -1) {
    progress = boundaries || DEFAULT_BOUNDARIES;
    // We need to monitor state changes for 'percent_progress' events
    // as `progressHandler` uses these to set/reset timeouts
    if (youtubeEvents.indexOf('onStateChange') === -1) {
      youtubeEvents.push('onStateChange');
    }
  }

  return {
    sessionId: config.id,
    config,
    video,
    captureEvents: parsedEvents.filter((e, i, a) => a.indexOf(e) === i),
    youtubeEvents: youtubeEvents.filter((e, i, a) => a.indexOf(e) === i),
    boundaries: progress,
    updateRate: DEFAULT_UPDATE_RATE_MS,
  };
}
