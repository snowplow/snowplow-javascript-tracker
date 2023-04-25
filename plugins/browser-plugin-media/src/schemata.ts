import { MediaPlayerEventType } from './types';

export const MEDIA_PLAYER_SCHEMA = 'iglu:com.snowplowanalytics.snowplow/media_player/jsonschema/1-0-0';
export const MEDIA_PLAYER_SESSION_SCHEMA = 'iglu:com.snowplowanalytics.snowplow/media_player_session/jsonschema/1-0-0';
export const MEDIA_PLAYER_AD_SCHEMA = 'iglu:com.snowplowanalytics.snowplow/media_player_ad/jsonschema/1-0-0';
export const MEDIA_PLAYER_AD_BREAK_SCHEMA =
  'iglu:com.snowplowanalytics.snowplow/media_player_ad_break/jsonschema/1-0-0';
export const MEDIA_PLAYER_QUALITY_SCHEMA = 'iglu:com.snowplowanalytics.snowplow/media_player_quality/jsonschema/1-0-0';
export const MEDIA_PLAYER_ERROR_SCHEMA = 'iglu:com.snowplowanalytics.snowplow/media_player_error/jsonschema/1-0-0';

function eventNameForEventType(eventType: MediaPlayerEventType): string {
  switch (eventType) {
    case MediaPlayerEventType.Ready:
      return 'media_player_event_ready';
    case MediaPlayerEventType.Play:
      return 'media_player_event_play';
    case MediaPlayerEventType.Pause:
      return 'media_player_event_pause';
    case MediaPlayerEventType.End:
      return 'media_player_event_end';
    case MediaPlayerEventType.SeekStart:
      return 'media_player_event_seek_start';
    case MediaPlayerEventType.SeekEnd:
      return 'media_player_event_seek_end';

    case MediaPlayerEventType.PlaybackRateChange:
      return 'media_player_event_playbackrate_change';
    case MediaPlayerEventType.VolumeChange:
      return 'media_player_event_volume_change';
    case MediaPlayerEventType.FullscreenChange:
      return 'media_player_event_fullscreen_change';
    case MediaPlayerEventType.PictureInPictureChange:
      return 'media_player_event_pictureinpicture_change';

    case MediaPlayerEventType.Ping:
      return 'media_player_event_ping';
    case MediaPlayerEventType.PercentProgress:
      return 'media_player_event_percent_progress';

    case MediaPlayerEventType.AdBreakStart:
      return 'media_player_event_ad_break_start';
    case MediaPlayerEventType.AdBreakEnd:
      return 'media_player_event_ad_break_end';
    case MediaPlayerEventType.AdStart:
      return 'media_player_event_ad_start';
    case MediaPlayerEventType.AdFirstQuartile:
      return 'media_player_event_ad_quartile';
    case MediaPlayerEventType.AdMidpoint:
      return 'media_player_event_ad_quartile';
    case MediaPlayerEventType.AdThirdQuartile:
      return 'media_player_event_ad_quartile';
    case MediaPlayerEventType.AdComplete:
      return 'media_player_event_ad_complete';
    case MediaPlayerEventType.AdSkip:
      return 'media_player_event_ad_skip';
    case MediaPlayerEventType.AdClick:
      return 'media_player_event_ad_click';
    case MediaPlayerEventType.AdPause:
      return 'media_player_event_ad_pause';
    case MediaPlayerEventType.AdResume:
      return 'media_player_event_ad_resume';

    case MediaPlayerEventType.BufferStart:
      return 'media_player_event_buffer_start';
    case MediaPlayerEventType.BufferEnd:
      return 'media_player_event_buffer_end';
    case MediaPlayerEventType.QualityChange:
      return 'media_player_event_quality_change';
    case MediaPlayerEventType.UserUpdateQuality:
      return 'media_player_event_user_update_quality';
    case MediaPlayerEventType.Error:
      return 'media_player_event_error';
  }
}

export function getMediaPlayerEventSchema(eventType: MediaPlayerEventType) {
  const eventName = eventNameForEventType(eventType);
  return `iglu:com.snowplowanalytics.snowplow/${eventName}/jsonschema/1-0-0`;
}
