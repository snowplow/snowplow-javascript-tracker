import { YTState } from './constants';

export enum YTEvent {
  STATECHANGE = 'statechange',
  PLAYBACKQUALITYCHANGE = 'playbackqualitychange',
  ERROR = 'error',
  APICHANGE = 'apichange',
  PLAYBACKRATECHANGE = 'playbackratechange',
  READY = 'ready',
}

export const stateChangeEvents = [
  YTState.BUFFERING,
  YTState.CUED,
  YTState.ENDED,
  YTState.PAUSED,
  YTState.PLAYING,
  YTState.UNSTARTED,
];
