import { MediaEventType } from '@snowplow/browser-plugin-media/src/types';

/** Events that can be passed into Vimeo's `on` method */
export enum InternalVimeoEvent {
  // Events with direct Media plugin event-sending functions
  LOADED = 'loaded',
  PLAY = 'play',
  PAUSE = 'pause',
  ENDED = 'ended',
  SEEKING = 'seeking',
  SEEKED = 'seeked',
  ERROR = 'error',
  BUFFERSTART = 'bufferstart',
  BUFFEREND = 'bufferend',
  VOLUMECHANGE = 'volumechange',
  QUALITYCHANGE = 'qualitychange',
  FULLSCREENCHANGE = 'fullscreenchange',
  PLAYBACKRATECHANGE = 'playbackratechange',
  ENTERPICTUREINPICTURE = 'enterpictureinpicture',
  LEAVEPICTUREINPICTURE = 'leavepictureinpicture',

  // Events that cause state updates in the Media plugin
  TIMEUPDATE = 'timeupdate',
  PROGRESS = 'progress',

  // Events that send `trackMediaSelfDescribingEvent`
  CUEPOINT = 'cuepoint',
  CHAPTERCHANGE = 'chapterchange',
  TEXTTRACKCHANGE = 'texttrackchange',
  INTERACTIVEHOTSPOTCLICKED = 'interactivehotspotclicked',
  INTERACTIVEOVERLAYPANELCLICKED = 'interactiveoverlaypanelclicked',
}

/** Vimeo-specific events not present in {@link MediaEventType}
 *
 * These are the values a user would place in `captureEvents`, to match the
 * style of the existing events from the Media plugin
 */
export enum VimeoEventType {
  CuePoint = 'cue_point',
  ChapterChange = 'chapter_change',
  TextTrackChange = 'text_track_change',
  InteractiveHotSpotClicked = 'interactive_hot_spot_clicked',
  InteractiveOverlayPanelClicked = 'interactive_overlay_panel_clicked',
}

// Events from InternalVimeoEvent that can be captured by the user
// This allows us to only attached listeners to the InternalVimeoEvents that the user wants to capture
export const CapturableInternalVimeoEvents: InternalVimeoEvent[] = [
  InternalVimeoEvent.CUEPOINT,
  InternalVimeoEvent.CHAPTERCHANGE,
  InternalVimeoEvent.TEXTTRACKCHANGE,
  InternalVimeoEvent.INTERACTIVEHOTSPOTCLICKED,
  InternalVimeoEvent.INTERACTIVEOVERLAYPANELCLICKED,
];

// Internal Vimeo events that can't be disabled by the user
export const AlwaysOnInternalVimeoEvents = [
  InternalVimeoEvent.TIMEUPDATE, // Used to run `updateMediaTracking` at regular intervals (every ~250ms)
  InternalVimeoEvent.PROGRESS, // Used to run `updateMediaTracking` when the video is buffering
];

// Events from the Media plugin that are automatically tracked with this plugin
export type AvailableMediaEventType =
  | MediaEventType.Ready
  | MediaEventType.Play
  | MediaEventType.Pause
  | MediaEventType.End
  | MediaEventType.SeekStart
  | MediaEventType.SeekEnd
  | MediaEventType.PlaybackRateChange
  | MediaEventType.VolumeChange
  | MediaEventType.FullscreenChange
  | MediaEventType.PictureInPictureChange
  | MediaEventType.Ping
  | MediaEventType.PercentProgress
  | MediaEventType.BufferStart
  | MediaEventType.BufferEnd
  | MediaEventType.QualityChange
  | MediaEventType.Error;

// Events from the Media plugin that are automatically tracked with this plugin
export const AvailableMediaEventType = {
  Ready: MediaEventType.Ready as VimeoEvent,
  Play: MediaEventType.Play as VimeoEvent,
  Pause: MediaEventType.Pause as VimeoEvent,
  End: MediaEventType.End as VimeoEvent,
  SeekStart: MediaEventType.SeekStart as VimeoEvent,
  SeekEnd: MediaEventType.SeekEnd as VimeoEvent,
  PlaybackRateChange: MediaEventType.PlaybackRateChange as VimeoEvent,
  VolumeChange: MediaEventType.VolumeChange as VimeoEvent,
  FullscreenChange: MediaEventType.FullscreenChange as VimeoEvent,
  PictureInPictureChange: MediaEventType.PictureInPictureChange as VimeoEvent,
  Ping: MediaEventType.Ping as VimeoEvent,
  PercentProgress: MediaEventType.PercentProgress as VimeoEvent,
  BufferStart: MediaEventType.BufferStart as VimeoEvent,
  BufferEnd: MediaEventType.BufferEnd as VimeoEvent,
  QualityChange: MediaEventType.QualityChange as VimeoEvent,
  Error: MediaEventType.Error as VimeoEvent,
};

/** Events accepted by `VimeoTrackingConfiguration.captureEvents` */
export type VimeoEvent = AvailableMediaEventType | VimeoEventType;
export const VimeoEvent = { ...AvailableMediaEventType, ...VimeoEventType };

export const AllEvents: VimeoEvent[] = [...Object.values(AvailableMediaEventType), ...Object.values(VimeoEventType)];
