import Player, { Error as VimeoError, QualityChangeEvent, TrackKind, VimeoCuePoint } from '@vimeo/player';
import { InternalVimeoEvent, VimeoEvent } from './events';
import { MediaEventType, MediaTrackingConfiguration } from '@snowplow/browser-plugin-media/src/types';

/** The configuration object for the Vimeo tracking plugin */
export interface VimeoTrackingConfiguration extends Omit<MediaTrackingConfiguration, 'captureEvents'> {
  video: HTMLIFrameElement | Player;
  captureEvents?: VimeoEvent[];
}

// An internal configuration type to avoid exposing `vimeoCaptureEvents` to the user
export interface InternalVimeoTrackingConfiguration extends VimeoTrackingConfiguration {
  /** Events filtered from `captureEvents` that are passed into the Vimeo player's `on` method */
  vimeoCaptureEvents?: InternalVimeoEvent[];
}

/** A {@link Player} and its associated {@link VimeoTrackingConfiguration | configuration} */
export type TrackedPlayer = {
  player: Player;
  eventListeners: Partial<Record<InternalVimeoEvent, (eventData: EventData | unknown) => void>>;
  config: InternalVimeoTrackingConfiguration;
};

/** Associated type for the Vimeo "meta" schema */
export type VimeoPlayerMetadata = {
  videoId: number;
  videoTitle: string;
  videoUrl?: string;
  videoWidth: number;
  videoHeight: number;
};

/** Event types that trigger a Media Plugin function */
export type EventType = InternalVimeoEvent | MediaEventType.Ready;

/** Sum type of all event data types */
export type EventData =
  | VimeoError
  | QualityChangeEvent
  | TimeUpdateData
  | ChapterData
  | TextTrackData
  | VimeoPlayerCuePointData
  | VimeoInteractiveHotspotClickedData
  | VimeoInteractiveOverlayPanelClickedData;

/** 'time' can be a reserved word in some warehouses, so we extend the Vimeo type to rename the field to 'cuePointData' */
export interface VimeoPlayerCuePointData extends Omit<VimeoCuePoint, 'time'> {
  cuePointTime: number;
  [key: string]: unknown;
}

export function asVimeoPlayerCuePointData(eventData: EventData | unknown): VimeoPlayerCuePointData {
  const data = eventData as VimeoCuePoint;
  return {
    cuePointTime: data.time,
    data: data.data,
    id: data.id,
  };
}

/**
 * The event data associated with a `timeupdate` event
 * https://developer.vimeo.com/player/sdk/reference#timeupdate
 */
export type TimeUpdateData = {
  duration: number;
  percent: number;
  seconds: number;
};

export function asTimeUpdateData(eventData: EventData | unknown): TimeUpdateData {
  const data = eventData as TimeUpdateData;
  return {
    duration: data.duration,
    percent: data.percent,
    seconds: data.seconds,
  };
}

/**
 * The event data associated with a `texttrackchange` event
 * https://developer.vimeo.com/player/sdk/reference#texttrackchange
 */
export type TextTrackData = {
  language: string;
  kind: TrackKind;
  label: string;
};

export function asTextTrackData(eventData: EventData | unknown): TextTrackData {
  const data = eventData as TextTrackData;
  return {
    language: data.language,
    kind: data.kind,
    label: data.label,
  };
}

/**
 * The event data associated with a `chapterchange` event
 * https://developer.vimeo.com/player/sdk/reference#chapterchange
 */
export type ChapterData = {
  index: number;
  startTime: number;
  title: string;
};

/**
 * The event data for an `interactivehotspotclicked` event
 * https://developer.vimeo.com/player/sdk/reference#events-for-interactive-videos
 */
export type VimeoInteractiveHotspotClickedData = {
  action: string;
  actionPreference: {
    pauseOnAction: boolean;
    overlayId: number;
    seekTo?: number;
    url?: string;
  };
  currentTime: number;
  customPayloadData?: Object;
  hotspotId: number;
};

export function asVimeoInteractiveHotspotClickedData(
  eventData: EventData | unknown
): VimeoInteractiveHotspotClickedData {
  const data = eventData as VimeoInteractiveHotspotClickedData;
  return {
    action: data.action,
    actionPreference: {
      pauseOnAction: data.actionPreference.pauseOnAction,
      overlayId: data.actionPreference.overlayId,
      seekTo: data.actionPreference?.seekTo,
      url: data.actionPreference?.url,
    },
    currentTime: data.currentTime,
    customPayloadData: data.customPayloadData,
    hotspotId: data.hotspotId,
  } as VimeoInteractiveHotspotClickedData;
}

/**
 * The event data for an `interactiveoverlaypanelclicked` event
 * https://developer.vimeo.com/player/sdk/reference#events-for-interactive-videos
 */
export type VimeoInteractiveOverlayPanelClickedData = {
  action: string;
  actionPreference: {
    pauseOnAction: boolean;
    seekTo?: number;
    url?: string;
  };
  currentTime: number;
  customPayloadData?: Object;
  hotspotId: number;
  panelId: number;
};

export function asVimeoInteractiveOverlayPanelClickedData(
  eventData: EventData | unknown
): VimeoInteractiveOverlayPanelClickedData {
  const data = eventData as VimeoInteractiveOverlayPanelClickedData;
  return {
    action: data.action,
    actionPreference: {
      pauseOnAction: data.actionPreference.pauseOnAction,
      seekTo: data.actionPreference?.seekTo,
      url: data.actionPreference?.url,
    },
    currentTime: data.currentTime,
    customPayloadData: data.customPayloadData,
    hotspotId: data.hotspotId,
    panelId: data.panelId,
  };
}

// Conversion functions for types from the Vimeo SDK

export function asChapterData(eventData: EventData | unknown): ChapterData {
  const data = eventData as ChapterData;
  return {
    index: data.index,
    startTime: data.startTime,
    title: data.title,
  };
}

export function asQualityChangeEvent(eventData: EventData | unknown): QualityChangeEvent {
  const data = eventData as QualityChangeEvent;
  return {
    quality: data.quality,
  };
}
