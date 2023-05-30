import { SelfDescribingJson } from '@snowplow/tracker-core';
import {
  getMediaEventSchema,
  MEDIA_AD_BREAK_SCHEMA,
  MEDIA_AD_SCHEMA,
  MEDIA_PLAYER_SCHEMA,
  MEDIA_SESSION_SCHEMA,
} from './schemata';
import { MediaPlayer, MediaAd, MediaAdBreak, MediaSession, MediaEvent } from './types';

export function buildMediaPlayerEvent(event: MediaEvent): SelfDescribingJson {
  return {
    schema: getMediaEventSchema(event.type),
    data: removeEmptyProperties(event.eventBody ?? {}),
  };
}

export function buildMediaPlayerEntity(mediaPlayer: MediaPlayer): SelfDescribingJson {
  return {
    schema: MEDIA_PLAYER_SCHEMA,
    data: removeEmptyProperties(mediaPlayer),
  };
}

export function buildMediaSessionEntity(session: MediaSession): SelfDescribingJson {
  return {
    schema: MEDIA_SESSION_SCHEMA,
    data: removeEmptyProperties(session),
  };
}

export function buildMediaAdEntity(ad: MediaAd): SelfDescribingJson {
  return {
    schema: MEDIA_AD_SCHEMA,
    data: removeEmptyProperties(ad),
  };
}

export function buildMediaAdBreakEntity(adBreak: MediaAdBreak): SelfDescribingJson {
  return {
    schema: MEDIA_AD_BREAK_SCHEMA,
    data: removeEmptyProperties(adBreak),
  };
}

/**
 * Returns a copy of a JSON with undefined and null properties removed
 *
 * @param event - Object to clean
 * @returns A cleaned copy of eventJson
 */
function removeEmptyProperties(event: Record<string, unknown>): Record<string, unknown> {
  const ret: Record<string, unknown> = {};
  for (const k in event) {
    if (event[k] != null) {
      ret[k] = event[k];
    }
  }
  return ret;
}
