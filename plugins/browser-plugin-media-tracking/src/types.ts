import { MediaContext, MediaElement, MediaPlayer, MediaPlayerEvent, VideoElement } from './contexts';
import { SnowplowMediaEvent } from './snowplowEvents';
import { MediaEvent, TextTrackEvent, DocumentEvent, VideoEvent } from './mediaEvents';

export type EventGroup = (DocumentEvent | MediaEvent | SnowplowMediaEvent | TextTrackEvent | VideoEvent | string)[];

export type MediaEventType = DocumentEvent | MediaEvent | SnowplowMediaEvent | TextTrackEvent | VideoEvent;

export type HTMLMediaElement = HTMLAudioElement | HTMLVideoElement;

export type HTMLVideoFormat = 'mp4' | 'ogg' | 'webm';

// All Video formats can be used as Audio as well
export type HTMLAudioFormat = 'aac' | 'aacp' | 'caf' | 'flac' | 'mp3' | 'wav' | HTMLVideoFormat;

export interface RecievedTrackingOptions {
  percentBoundries?: number[];
  captureEvents: EventGroup | string[];
  mediaLabel?: string;
  percentTimeoutIds?: any[];
}

export interface TrackingOptions {
  mediaId: string;
  captureEvents: EventGroup;
  mediaLabel?: string;
  boundry?: {
    percentBoundries: number[];
    percentTimeoutIds: any[];
  };
  volumeChangeTimeout?: any;
}

export interface SnowplowData {
  percent?: number;
  file_extension: HTMLAudioFormat | HTMLVideoFormat;
  fullscreen: boolean;
  [key: string]: boolean | number | string | undefined;
}

export interface MediaEventData {
  schema: string;
  data: MediaPlayerEvent;
  context: MediaEntities[];
}

export interface MediaEntities {
  schema: string;
  data: MediaElement | VideoElement | SnowplowData | MediaContext | MediaPlayer;
}

export interface TextTrackObject {
  label: string;
  language: string;
  kind: string;
  mode: string;
}
