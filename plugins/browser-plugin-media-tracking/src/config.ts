import { MediaEventType } from '@snowplow/browser-plugin-media';
import { CommonMediaEventProperties, MediaTrackingConfiguration } from '@snowplow/browser-plugin-media/src/types';

export type HTML5MediaEventTypes = Extract<
  MediaEventType,
  | MediaEventType.Ready
  | MediaEventType.Play
  | MediaEventType.Pause
  | MediaEventType.End
  | MediaEventType.SeekEnd
  | MediaEventType.PlaybackRateChange
  | MediaEventType.VolumeChange
  | MediaEventType.FullscreenChange
  | MediaEventType.PictureInPictureChange
  | MediaEventType.BufferStart
  | MediaEventType.BufferEnd
  | MediaEventType.Error
  | MediaEventType.Ping
  | MediaEventType.PercentProgress
>;

export type Config = {
  video: string | HTMLMediaElement;
  label?: string;
} & CommonMediaEventProperties &
  Omit<MediaTrackingConfiguration, 'player'>;

export interface StringConfig extends Config {
  video: string;
}

export function isStringConfig(config: Config): config is StringConfig {
  return typeof config.video === 'string';
}

export interface ElementConfig extends Config {
  video: HTMLMediaElement;
}

export function isElementConfig(config: Config): config is ElementConfig {
  return config.video instanceof HTMLMediaElement;
}
