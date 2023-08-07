import { Error as VimeoError } from '@vimeo/player';

import {
  trackMediaBufferEnd,
  trackMediaBufferStart,
  trackMediaEnd,
  trackMediaFullscreenChange,
  trackMediaPause,
  trackMediaPictureInPictureChange,
  trackMediaPlay,
  trackMediaPlaybackRateChange,
  trackMediaQualityChange,
  trackMediaReady,
  trackMediaSeekEnd,
  trackMediaSeekStart,
  trackMediaSelfDescribingEvent,
  trackMediaVolumeChange,
  updateMediaTracking,
} from '@snowplow/browser-plugin-media';
import { MediaEventType, MediaPlayer } from '@snowplow/browser-plugin-media/src/types';

import { getVimeoMetadata, getVimeoMediaAttributes } from './utils';
import { VimeoSchema } from './schema';
import { InternalVimeoEvent } from './events';
import {
  TrackedPlayer,
  EventData,
  EventType,
  asVimeoInteractiveHotspotClickedData,
  asVimeoInteractiveOverlayPanelClickedData,
  asTextTrackData,
  asTimeUpdateData,
  asQualityChangeEvent,
  asVimeoPlayerCuePointData,
  asChapterData,
} from './types';

export function trackEvent(
  trackedPlayer: TrackedPlayer,
  eventType: EventType,
  eventData: EventData | unknown = {},
  trackError: (error: VimeoError) => void
): void {
  getVimeoMediaAttributes(trackedPlayer)
    .then((mediaPlayer) => {
      runMediaPluginFunction(mediaPlayer, trackedPlayer, eventType, eventData, trackError);
    })
    .catch(trackError);
}

/** Run the relevant Media plugin function for the event type */
export function runMediaPluginFunction(
  player: MediaPlayer,
  trackedPlayer: TrackedPlayer,
  eventType: EventType,
  eventData: EventData | unknown = {},
  trackError: (error: VimeoError) => void
): void {
  const id = trackedPlayer.config.id;

  switch (eventType) {
    case InternalVimeoEvent.PLAY:
      trackMediaPlay({ id, player });
      break;

    case InternalVimeoEvent.PAUSE:
      trackMediaPause({ id, player });
      break;

    case InternalVimeoEvent.ENDED:
      trackMediaEnd({ id, player });
      break;

    case InternalVimeoEvent.SEEKING:
      trackMediaSeekStart({ id, player });
      break;

    case InternalVimeoEvent.SEEKED:
      trackMediaSeekEnd({ id, player });
      break;

    case InternalVimeoEvent.ERROR:
      trackError(eventData as VimeoError);
      break;

    case InternalVimeoEvent.TIMEUPDATE:
      updateMediaTracking({ id, player: { ...player, currentTime: asTimeUpdateData(eventData).seconds } });
      break;

    case InternalVimeoEvent.BUFFERSTART:
      trackMediaBufferStart({ id, player });
      break;

    case InternalVimeoEvent.BUFFEREND:
      trackMediaBufferEnd({ id, player });
      break;

    case InternalVimeoEvent.VOLUMECHANGE:
      trackedPlayer.player
        .getVolume()
        .then((newVolume) => trackMediaVolumeChange({ id, player, newVolume: Math.round(newVolume * 100) }))
        .catch(trackError);
      break;

    case InternalVimeoEvent.FULLSCREENCHANGE:
      trackedPlayer.player
        .getFullscreen()
        .then((fullscreen) => trackMediaFullscreenChange({ id, player, fullscreen }))
        .catch(trackError);
      break;

    case InternalVimeoEvent.PLAYBACKRATECHANGE:
      trackedPlayer.player
        .getPlaybackRate()
        .then((newRate) => trackMediaPlaybackRateChange({ id, player, newRate }))
        .catch(trackError);
      break;

    case InternalVimeoEvent.ENTERPICTUREINPICTURE:
      trackMediaPictureInPictureChange({ id, player, pictureInPicture: true });
      break;

    case InternalVimeoEvent.LEAVEPICTUREINPICTURE:
      trackMediaPictureInPictureChange({ id, player, pictureInPicture: false });
      break;

    case InternalVimeoEvent.QUALITYCHANGE:
      trackMediaQualityChange({ id, player, newQuality: asQualityChangeEvent(eventData).quality });
      break;

    case InternalVimeoEvent.CUEPOINT:
      trackMediaSelfDescribingEvent({
        id,
        player,
        event: {
          schema: VimeoSchema.CUEPOINT,
          data: asVimeoPlayerCuePointData(eventData),
        },
      });
      break;

    case InternalVimeoEvent.TEXTTRACKCHANGE:
      trackMediaSelfDescribingEvent({
        id,
        player,
        event: {
          schema: VimeoSchema.TEXT_TRACK_CHANGE,
          data: asTextTrackData(eventData),
        },
      });
      break;

    case InternalVimeoEvent.INTERACTIVEHOTSPOTCLICKED:
      trackMediaSelfDescribingEvent({
        id,
        player,
        event: {
          schema: VimeoSchema.HOTSPOT_CLICK,
          data: {},
        },
        context: [{ schema: VimeoSchema.INTERACTION, data: asVimeoInteractiveHotspotClickedData(eventData) }],
      });
      break;

    case InternalVimeoEvent.INTERACTIVEOVERLAYPANELCLICKED:
      trackMediaSelfDescribingEvent({
        id,
        player,
        event: {
          schema: VimeoSchema.OVERLAY_CLICK,
          data: {},
        },
        context: [{ schema: VimeoSchema.INTERACTION, data: asVimeoInteractiveOverlayPanelClickedData(eventData) }],
      });
      break;

    case InternalVimeoEvent.CHAPTERCHANGE:
      trackMediaSelfDescribingEvent({
        id,
        player,
        event: {
          schema: VimeoSchema.CHAPTER_CHANGE,
          data: asChapterData(eventData),
        },
      });
      break;

    case InternalVimeoEvent.LOADED:
      updateMediaTracking({ id, player });
      break;

    case InternalVimeoEvent.PROGRESS:
      updateMediaTracking({ id, player });
      break;

    case MediaEventType.Ready:
      getVimeoMetadata(trackedPlayer)
        .then((entities) => trackMediaReady({ id, player, context: [entities] }))
        .catch(trackError);
      break;
  }
}
