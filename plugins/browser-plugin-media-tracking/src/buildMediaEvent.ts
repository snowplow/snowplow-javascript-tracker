import { NETWORK_STATE, READY_STATE } from './constants';
import { MediaElement } from './contexts';
import { isElementFullScreen, textTrackListToJson, timeRangesToObjectArray } from './helperFunctions';
import { HTMLAudioFormat, HTMLVideoFormat, MediaEntities, MediaEventData, MediaEventType } from './types';
import { MediaProperty, VideoProperty } from './mediaProperties';

export function buildMediaEvent(el: HTMLMediaElement, e: MediaEventType, mediaLabel?: string): MediaEventData {
  let mediaContext = [getHTMLMediaElementEntities(el), getSnowplowMediaEntities(el)];

  if (el instanceof HTMLVideoElement) {
    mediaContext.push(getHTMLVideoElementEntities(el));
  }

  return {
    schema: 'iglu:com.snowplowanalytics/media_player_event/jsonschema/1-0-0',
    data: { type: e, label: mediaLabel },
    context: mediaContext,
  };
}

function getSnowplowMediaEntities(el: HTMLMediaElement): MediaEntities {
  return {
    schema: 'iglu:com.snowplowanalytics/media_player/jsonschema/1-0-0',
    data: {
      current_time: el[MediaProperty.CURRENTTIME],
      duration: el[MediaProperty.DURATION],
      ended: el[MediaProperty.ENDED],
      loop: el[MediaProperty.LOOP],
      muted: el[MediaProperty.MUTED],
      paused: el[MediaProperty.PAUSED],
      playback_rate: el[MediaProperty.PLAYBACKRATE],
      volume: el[MediaProperty.VOLUME],
    },
  };
}

function getHTMLMediaElementEntities(el: HTMLMediaElement): MediaEntities {
  let data: MediaElement = {
    html_id: el.id,
    media_type: el.tagName as MediaElement['media_type'],
    auto_play: el[MediaProperty.AUTOPLAY],
    buffered: timeRangesToObjectArray(el[MediaProperty.BUFFERED]),
    controls: el[MediaProperty.CONTROLS],
    cross_origin: el[MediaProperty.CROSSORIGIN],
    current_source: el[MediaProperty.CURRENTSRC],
    default_muted: el[MediaProperty.DEFAULTMUTED],
    default_playback_rate: el[MediaProperty.DEFAULTPLAYBACKRATE],
    disable_remote_playback: el[MediaProperty.DISABLEREMOTEPLAYBACK],
    error: el[MediaProperty.ERROR],
    network_state: NETWORK_STATE[el[MediaProperty.NETWORKSTATE]] as MediaElement['network_state'],
    preload: el[MediaProperty.PRELOAD],
    ready_state: READY_STATE[el[MediaProperty.READYSTATE]] as MediaElement['ready_state'],
    seekable: timeRangesToObjectArray(el[MediaProperty.SEEKABLE]),
    seeking: el[MediaProperty.SEEKING],
    src: el[MediaProperty.SRC],
    text_tracks: textTrackListToJson(el[MediaProperty.TEXTTRACKS]),
    file_extension: el[MediaProperty.CURRENTSRC].split('.').pop() as HTMLVideoFormat | HTMLAudioFormat,
    fullscreen: isElementFullScreen(el.id),
    picture_in_picture: document.pictureInPictureElement?.id === el.id,
  };
  return {
    schema: 'iglu:org.whatwg/media_element/jsonschema/1-0-0',
    data: data,
  };
}

function getHTMLVideoElementEntities(el: HTMLVideoElement): MediaEntities {
  return {
    schema: 'iglu:org.whatwg/video_element/jsonschema/1-0-0',
    data: {
      auto_picture_in_picture: el[VideoProperty.AUTOPICTUREINPICTURE],
      disable_picture_in_picture: el[VideoProperty.DISABLEPICTUREINPICTURE],
      poster: el[VideoProperty.POSTER],
      video_height: el[VideoProperty.VIDEOHEIGHT],
      video_width: el[VideoProperty.VIDEOWIDTH],
    },
  };
}
