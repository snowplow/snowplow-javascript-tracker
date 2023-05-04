import { MediaEventType } from './types';

const MEDIA_SCHEMA_PREFIX = 'iglu:com.snowplowanalytics.snowplow.media/';
const MEDIA_SCHEMA_SUFFIX = '/jsonschema/1-0-0';
export const MEDIA_PLAYER_SCHEMA = MEDIA_SCHEMA_PREFIX + 'player' + MEDIA_SCHEMA_SUFFIX;
export const MEDIA_SESSION_SCHEMA = MEDIA_SCHEMA_PREFIX + 'session' + MEDIA_SCHEMA_SUFFIX;
export const MEDIA_AD_SCHEMA = MEDIA_SCHEMA_PREFIX + 'ad' + MEDIA_SCHEMA_SUFFIX;
export const MEDIA_AD_BREAK_SCHEMA = MEDIA_SCHEMA_PREFIX + 'ad_break' + MEDIA_SCHEMA_SUFFIX;

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

export function getMediaEventSchema(eventType: MediaEventType): string {
  const eventName = eventNameForEventType(eventType);
  return MEDIA_SCHEMA_PREFIX + eventName + '_event' + MEDIA_SCHEMA_SUFFIX;
}
