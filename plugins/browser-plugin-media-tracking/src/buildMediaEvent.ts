import { eventNames, NETWORK_STATE, READY_STATE } from './constants';
import { MediaElement, MediaPlayer, MediaPlayerEvent, VideoElement } from './contexts';
import { dataUrlHandler, isElementFullScreen, textTrackListToJson, timeRangesToObjectArray } from './helperFunctions';
import { EventDetail, MediaEntities, MediaEventData, TrackingOptions } from './types';

export function buildMediaEvent(
  e: string,
  el: HTMLAudioElement | HTMLVideoElement,
  conf: TrackingOptions,
  detail?: EventDetail
): MediaEventData {
  const context = [getHTMLMediaElementEntities(el, conf), getMediaPlayerEntities(el, detail)];
  if (el instanceof HTMLVideoElement) context.push(getHTMLVideoElementEntities(el as HTMLVideoElement));
  const data: MediaPlayerEvent = { type: e in eventNames ? eventNames[e] : e };
  if (conf.label) data.label = conf.label;
  return {
    schema: 'iglu:com.snowplowanalytics.snowplow/media_player_event/jsonschema/1-0-0',
    data: data,
    context: context,
  };
}

function getMediaPlayerEntities(el: HTMLAudioElement | HTMLVideoElement, detail?: EventDetail): MediaEntities {
  const data: MediaPlayer = {
    currentTime: el.currentTime || 0,
    duration: el.duration || 0,
    ended: el.ended,
    loop: el.loop,
    muted: el.muted,
    paused: el.paused,
    playbackRate: el.playbackRate,
    volume: parseInt(String(el.volume * 100)),
  };
  if (detail?.boundary) {
    data.percentProgress = detail.boundary;
  }
  return {
    schema: 'iglu:com.snowplowanalytics.snowplow/media_player/jsonschema/1-0-0',
    data: data,
  };
}

function getHTMLMediaElementEntities(el: HTMLAudioElement | HTMLVideoElement, conf: TrackingOptions): MediaEntities {
  // In cases where the media does not have explicit id, we use the container id passed from the configuration.
  const htmlId = el.id || conf.id;
  const data: MediaElement = {
    htmlId,
    mediaType: el.tagName as MediaElement['mediaType'],
    autoPlay: el.autoplay,
    buffered: timeRangesToObjectArray(el.buffered),
    controls: el.controls,
    currentSrc: el.currentSrc,
    defaultMuted: el.defaultMuted || false,
    defaultPlaybackRate: el.defaultPlaybackRate,
    error: el.error ? { code: el.error?.code, message: el.error?.message } : null,
    networkState: NETWORK_STATE[el.networkState] as MediaElement['networkState'],
    preload: el.preload,
    readyState: READY_STATE[el.readyState] as MediaElement['readyState'],
    seekable: timeRangesToObjectArray(el.seekable),
    seeking: el.seeking,
    src: dataUrlHandler(el.src || el.currentSrc),
    textTracks: textTrackListToJson(el.textTracks),
    fileExtension: el.currentSrc.split('.').pop() as string,
    fullscreen: isElementFullScreen(el.id),
    pictureInPicture: document.pictureInPictureElement?.id === el.id,
  };
  if (el.disableRemotePlayback) data.disableRemotePlayback = el.disableRemotePlayback;
  if (el.crossOrigin) data.crossOrigin = el.crossOrigin;
  return {
    schema: 'iglu:org.whatwg/media_element/jsonschema/1-0-0',
    data: data,
  };
}

function getHTMLVideoElementEntities(el: HTMLVideoElement): MediaEntities {
  const data: VideoElement = {
    poster: el.poster,
    videoHeight: el.videoHeight,
    videoWidth: el.videoWidth,
  };
  if (el.autoPictureInPicture) data.autoPictureInPicture = el.autoPictureInPicture;
  if (el.disablePictureInPicture) data.disablePictureInPicture = el.disablePictureInPicture;
  return {
    schema: 'iglu:org.whatwg/video_element/jsonschema/1-0-0',
    data: data,
  };
}
