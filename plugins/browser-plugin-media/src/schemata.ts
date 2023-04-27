import { MediaPlayerEventType } from './types';

export const MEDIA_PLAYER_SCHEMA_PREFIX = 'iglu:com.snowplowanalytics.snowplow/media_player';
export const MEDIA_PLAYER_SCHEMA_SUFFIX = '/jsonschema/1-0-0';
export const MEDIA_PLAYER_SCHEMA = MEDIA_PLAYER_SCHEMA_PREFIX + MEDIA_PLAYER_SCHEMA_SUFFIX;
export const MEDIA_PLAYER_SESSION_SCHEMA = MEDIA_PLAYER_SCHEMA_PREFIX + '_session' + MEDIA_PLAYER_SCHEMA_SUFFIX;
export const MEDIA_PLAYER_AD_SCHEMA = MEDIA_PLAYER_SCHEMA_PREFIX + '_ad' + MEDIA_PLAYER_SCHEMA_SUFFIX;
export const MEDIA_PLAYER_AD_BREAK_SCHEMA = MEDIA_PLAYER_SCHEMA_PREFIX + '_ad_break' + MEDIA_PLAYER_SCHEMA_SUFFIX;

function eventNameForEventType(eventType: MediaPlayerEventType): string {
  switch (eventType) {
    case MediaPlayerEventType.AdFirstQuartile:
      return 'ad_quartile';
    case MediaPlayerEventType.AdMidpoint:
      return 'ad_quartile';
    case MediaPlayerEventType.AdThirdQuartile:
      return 'ad_quartile';
  }

  return eventType;
}

export function getMediaPlayerEventSchema(eventType: MediaPlayerEventType) {
  const eventName = eventNameForEventType(eventType);
  return MEDIA_PLAYER_SCHEMA_PREFIX + '_event_' + eventName + MEDIA_PLAYER_SCHEMA_SUFFIX;
}
