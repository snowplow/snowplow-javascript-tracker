import { ExtendedCrossDomainLinkerAttributes, Platform } from '../tracker/types';

const DEFAULT_CROSS_DOMAIN_LINKER_PARAMS: ExtendedCrossDomainLinkerAttributes = {
  sessionId: true,
  sourceId: true,
  sourcePlatform: false,
  userId: false,
  reason: false,
};

interface ExtendedCrossDomainLinkerValues {
  domainUserId?: string;
  /* Timestamp of the cross-domain link click. */
  timestamp?: number;
  /* Current user ID as set with setUserId(). */
  userId?: string;
  /* Visitor ID. */
  sessionId?: string;
  /* The app ID. */
  sourceId?: string;
  sourcePlatform?: Platform;
  /* Link text of the cross-domain link. */
  reason?: string;
}

export function createCrossDomainParameterValue(
  isExtendedFormat: boolean,
  attributeConfiguration: ExtendedCrossDomainLinkerAttributes | undefined,
  attributeValues: ExtendedCrossDomainLinkerValues & {
    /* As `reason` might be a callback, we also need to pass the event to calculate the reason value. */
    event: Event;
  }
): string {
  let crossDomainParameterValue;
  const timestamp = new Date().getTime();
  const config = { ...DEFAULT_CROSS_DOMAIN_LINKER_PARAMS, ...attributeConfiguration };
  const { domainUserId, userId, sessionId, sourceId, sourcePlatform, event } = attributeValues;

  const eventTarget = event.currentTarget as HTMLAnchorElement | HTMLAreaElement | null;
  const reason = typeof config.reason === 'function' ? config.reason(event) : eventTarget?.textContent?.trim();

  if (isExtendedFormat) {
    /* Index is used by Enrich, so it should not be changed. */
    crossDomainParameterValue = [
      domainUserId,
      timestamp,
      config.sessionId && sessionId,
      config.userId && urlSafeBase64Encode(userId || ''),
      config.sourceId && urlSafeBase64Encode(sourceId || ''),
      config.sourcePlatform && sourcePlatform,
      config.reason && urlSafeBase64Encode(reason || ''),
    ]
      .map((attribute) => attribute || '')
      .join('.')
      // Remove trailing dots
      .replace(/([.]*$)/, '');
  } else {
    crossDomainParameterValue = attributeValues.domainUserId + '.' + timestamp;
  }

  return crossDomainParameterValue;
}

/**
 *
 * The url-safe variation emits - and _ instead of + and / characters. Also removes = sign padding.
 * @param {string} str The string to encode in a URL safe manner
 * @return {string}
 */
export function urlSafeBase64Encode(str: string) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}
