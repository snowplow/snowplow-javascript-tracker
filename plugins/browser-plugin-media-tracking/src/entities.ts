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

export function buildHTMLMediaElementEntity(el: HTMLAudioElement | HTMLVideoElement): SelfDescribingJson | null {
  // currentSrc is required by the schema and constrained to `format: uri`, which
  // an empty string does not satisfy. Both currentSrc and src are empty while no
  // source is attached (networkState NETWORK_EMPTY) — for example between element
  // creation and MediaSource attachment in Media Source Extensions (MSE) players
  // such as hls.js or dash.js, which assign a blob: URL only once they attach.
  // There is nothing to describe in that state, so omit the entity rather than
  // emitting one the pipeline would reject as a schema violation.
  const source = el.currentSrc || el.src;
  if (!source) {
    return null;
  }

  // Both fields are optional-but-uri-formatted, so having passed the guard above,
  // fall back to the other rather than letting either serialize as an empty string.
  const src = el.src || el.currentSrc;

  const data: MediaElement = {
    // htmlId is a required property in the schema, but may not be present if
    // the user provided the element themselves
    htmlId: el.id || '',
    mediaType: el.tagName as MediaElement['mediaType'],
    autoPlay: el.autoplay,
    buffered: timeRangesToObjectArray(el.buffered),
    controls: el.controls,
    currentSrc: source,
    defaultMuted: el.defaultMuted || false,
    defaultPlaybackRate: el.defaultPlaybackRate,
    error: el.error ? { code: el.error?.code, message: el.error?.message } : null,
    networkState: NETWORK_STATE[el.networkState] as MediaElement['networkState'],
    preload: el.preload,
    readyState: READY_STATE[el.readyState] as MediaElement['readyState'],
    seekable: timeRangesToObjectArray(el.seekable),
    seeking: el.seeking,
    src: dataUrlHandler(src),
    textTracks: textTrackListToJson(el.textTracks),
    fileExtension: getUriFileExtension(source),
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
