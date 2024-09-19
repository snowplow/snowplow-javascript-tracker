import { NETWORK_STATE, READY_STATE } from './constants';
import { MediaElement, VideoElement } from './types';
import {
  dataUrlHandler,
  getUriFileExtension,
  isFullScreen,
  textTrackListToJson,
  timeRangesToObjectArray,
} from './helperFunctions';
import { SelfDescribingJson } from '@snowplow/tracker-core';

export function buildHTMLMediaElementEntity(el: HTMLAudioElement | HTMLVideoElement): SelfDescribingJson {
  const data: MediaElement = {
    // htmlId is a required property in the schema, but may not be present if
    // the user provided the element themselves
    htmlId: el.id || '',
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
    fileExtension: getUriFileExtension(el.currentSrc),
    fullscreen: isFullScreen(el),
    pictureInPicture: document.pictureInPictureElement === el,
  };
  if (el.disableRemotePlayback) data.disableRemotePlayback = el.disableRemotePlayback;
  if (el.crossOrigin) data.crossOrigin = el.crossOrigin;
  return {
    schema: 'iglu:org.whatwg/media_element/jsonschema/1-0-0',
    data,
  };
}

export function buildHTMLVideoElementEntity(el: HTMLVideoElement): SelfDescribingJson {
  const data: VideoElement = {
    poster: el.poster,
    videoHeight: el.videoHeight,
    videoWidth: el.videoWidth,
  };
  if (el.hasAttribute('autopictureinpicture')) data.autoPictureInPicture = true;
  if (el.disablePictureInPicture) data.disablePictureInPicture = el.disablePictureInPicture;
  return {
    schema: 'iglu:org.whatwg/video_element/jsonschema/1-0-0',
    data,
  };
}
