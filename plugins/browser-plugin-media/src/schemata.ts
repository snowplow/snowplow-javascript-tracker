import { MediaEventType } from './types';

export const MEDIA_PLAYER_SCHEMA_PREFIX = 'iglu:com.snowplowanalytics.snowplow.media/';
export const MEDIA_PLAYER_SCHEMA_SUFFIX = '/jsonschema/1-0-0';
export const MEDIA_PLAYER_SCHEMA = MEDIA_PLAYER_SCHEMA_PREFIX + 'player' + MEDIA_PLAYER_SCHEMA_SUFFIX;
export const MEDIA_PLAYER_SESSION_SCHEMA = MEDIA_PLAYER_SCHEMA_PREFIX + 'session' + MEDIA_PLAYER_SCHEMA_SUFFIX;
export const MEDIA_PLAYER_AD_SCHEMA = MEDIA_PLAYER_SCHEMA_PREFIX + 'ad' + MEDIA_PLAYER_SCHEMA_SUFFIX;
export const MEDIA_PLAYER_AD_BREAK_SCHEMA = MEDIA_PLAYER_SCHEMA_PREFIX + 'ad_break' + MEDIA_PLAYER_SCHEMA_SUFFIX;

function eventNameForEventType(eventType: MediaEventType): string {
  /// ad first quartile, midpoint, and third quartile events share the same schema
  switch (eventType) {
    case MediaEventType.AdFirstQuartile:
      return 'ad_quartile';
    case MediaEventType.AdMidpoint:
      return 'ad_quartile';
    case MediaEventType.AdThirdQuartile:
      return 'ad_quartile';
  }

  return eventType;
}

export function getMediaPlayerEventSchema(eventType: MediaEventType): string {
  const eventName = eventNameForEventType(eventType);
  return MEDIA_PLAYER_SCHEMA_PREFIX + eventName + '_event' + MEDIA_PLAYER_SCHEMA_SUFFIX;
}
