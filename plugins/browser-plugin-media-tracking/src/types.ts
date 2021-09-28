import { MediaElement, MediaPlayerEvent, VideoElement } from './contexts';
import { SnowplowMediaEvent } from './snowplowEvents';
import { MediaEvent, TextTrackEvent, DocumentEvent, VideoEvent } from './mediaEvents';

export type EventGroup = (DocumentEvent | MediaEvent | SnowplowMediaEvent | TextTrackEvent | VideoEvent)[];

export type MediaEventType = DocumentEvent | MediaEvent | SnowplowMediaEvent | TextTrackEvent | VideoEvent;

export type HTMLMediaElement = HTMLAudioElement | HTMLVideoElement;

export type HTMLVideoFormat = 'mp4' | 'ogg' | 'webm';

// All Video formats can be used as Audio as well
export type HTMLAudioFormat = 'aac' | 'aacp' | 'caf' | 'flac' | 'mp3' | 'wav' | HTMLVideoFormat;

export interface TrackingOptions {
  percentBoundries?: number[];
  captureEvents?: EventGroup;
  mediaLabel?: string;
}

export interface MediaConf {
  mediaId: string;
  percentBoundries: number[];
  captureEvents: EventGroup;
  mediaLabel?: string;
  percentTimeoutIds: any[];
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
  data: MediaElement | VideoElement | SnowplowData;
}

export interface TextTrackObject {
  label: string;
  language: string;
  kind: string;
  mode: string;
}
