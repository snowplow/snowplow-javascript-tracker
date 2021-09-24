import { NETWORK_STATE, READY_STATE } from './constants';
import { MediaElement, MediaPlayerEvent } from './contexts';
import { isElementFullScreen, textTrackListToJson, timeRangesToObjectArray } from './helperFunctions';
import { SnowplowMediaEvent } from './snowplowEvents';
import { MediaEntities, MediaEventData, MediaEventType, SnowplowData } from './types';
import { MediaProperty, VideoProperty } from './mediaProperties';

export function buildMediaEvent(
  el: HTMLMediaElement,
  e: MediaEventType,
  mediaId: string,
  eventDetail: any,
  mediaLabel?: string
): MediaEventData {
  let mediaContext = [getHTMLMediaElementEntities(el)];
  mediaContext.push(getSnowplowEntities(e, el, mediaId, eventDetail));

  if (el instanceof HTMLVideoElement) {
    mediaContext.push(getHTMLVideoElementEntities(el));
  }

  let mediaEventData: MediaPlayerEvent = {
    type: e,
    player_id: mediaId,
    media_type: el.tagName as MediaPlayerEvent['media_type'],
  };

  if (mediaLabel) {
    mediaEventData.mediaLabel = mediaLabel;
  }

  return {
    schema: 'iglu:com.snowplowanalytics/media_player_event/jsonschema/1-0-0',
    data: mediaEventData,
    context: mediaContext,
  };
}

function getHTMLMediaElementEntities(el: HTMLMediaElement): MediaEntities {
  return {
    schema: 'iglu:org.whatwg/media_element/jsonschema/1-0-0',
    data: {
      auto_play: el[MediaProperty.AUTOPLAY],
      buffered: timeRangesToObjectArray(el[MediaProperty.BUFFERED]),
      controls: el[MediaProperty.CONTROLS],
      cross_origin: el[MediaProperty.CROSSORIGIN],
      current_source: el[MediaProperty.CURRENTSRC],
      current_time: el[MediaProperty.CURRENTTIME],
      default_muted: el[MediaProperty.DEFAULTMUTED],
      default_playback_rate: el[MediaProperty.DEFAULTPLAYBACKRATE],
      disable_remote_playback: el[MediaProperty.DISABLEREMOTEPLAYBACK],
      duration: el[MediaProperty.DURATION],
      ended: el[MediaProperty.ENDED],
      error: el[MediaProperty.ERROR],
      loop: el[MediaProperty.LOOP],
      muted: el[MediaProperty.MUTED],
      network_state: NETWORK_STATE[el[MediaProperty.NETWORKSTATE]] as MediaElement['network_state'],
      paused: el[MediaProperty.PAUSED],
      playback_rate: el[MediaProperty.PLAYBACKRATE],
      preload: el[MediaProperty.PRELOAD],
      ready_state: READY_STATE[el[MediaProperty.READYSTATE]] as MediaElement['ready_state'],
      seekable: timeRangesToObjectArray(el[MediaProperty.SEEKABLE]),
      seeking: el[MediaProperty.SEEKING],
      src: el[MediaProperty.SRC],
      src_object: el[MediaProperty.SRCOBJECT],
      text_tracks: textTrackListToJson(el[MediaProperty.TEXTTRACKS]),
      volume: el[MediaProperty.VOLUME],
    },
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

function getSnowplowEntities(
  e: MediaEventType,
  el: HTMLMediaElement,
  mediaId: string,
  eventDetail: any
): MediaEntities {
  const snowplowData: SnowplowData = {
    file_extension: el[MediaProperty.CURRENTSRC].split('.').pop(),
    fullscreen: isElementFullScreen(mediaId),
    picture_in_picture: document.pictureInPictureElement?.id === mediaId,
  };

  if (e === SnowplowMediaEvent.PERCENTPROGRESS) {
    snowplowData.percent = eventDetail.percentThrough;
  }

  return {
    schema: 'iglu:com.snowplowanalytics/media_player/jsonschema/1-0-0',
    data: {
      ...snowplowData,
    },
  };
}
