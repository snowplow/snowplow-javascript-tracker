export const YouTubeIFrameAPIURL = 'https://www.youtube.com/iframe_api';

// The payload a YouTube player event emits has no identifier of what event it is
// Some payloads can emit the same data
// i.e. onError and onPlaybackRateChange can both emit '{data: 2}'
export enum YTPlayerEvent {
  ONSTATECHANGE = 'onStateChange',
  ONPLAYBACKQUALITYCHANGE = 'onPlaybackQualityChange',
  ONERROR = 'onError',
  ONAPICHANGE = 'onApiChange',
  ONPLAYBACKRATECHANGE = 'onPlaybackRateChange',
}

export const YTStateEvent: Record<string, string> = {
  '-1': 'unstarted',
  '0': 'ended',
  '1': 'play',
  '2': 'pause',
  '3': 'buffering',
  '5': 'cued',
};

export const CaptureEventToYouTubeEvent: Record<string, YTPlayerEvent> = {
  playbackratechange: YTPlayerEvent.ONPLAYBACKRATECHANGE,
  playbackqualitychange: YTPlayerEvent.ONPLAYBACKQUALITYCHANGE,
  error: YTPlayerEvent.ONERROR,
  apichange: YTPlayerEvent.ONAPICHANGE,
};

// As every state event requires YTPlayerEvent.ONSTATECHANGE, they are added
// to CaptureEventToYouTubeEvent with the below loop
Object.keys(YTStateEvent).forEach((k) => (CaptureEventToYouTubeEvent[YTStateEvent[k]] = YTPlayerEvent.ONSTATECHANGE));

export enum YTState {
  UNSTARTED = 'unstarted',
  ENDED = 'ended',
  PLAYING = 'play',
  PAUSED = 'pause',
  BUFFERING = 'buffering',
  CUED = 'cued',
}

export const YTError: Record<number, string> = {
  2: 'INVALID_URL',
  5: 'HTML5_ERROR',
  100: 'VIDEO_NOT_FOUND',
  101: 'MISSING_EMBED_PERMISSION',
  150: 'MISSING_EMBED_PERMISSION',
};
