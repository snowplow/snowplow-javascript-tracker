import { BrowserPlugin, BrowserTracker, dispatchToTrackersInCollection } from '@snowplow/browser-tracker-core';
import { buildConsentEvent, buildCmpVisibleEvent } from './core';
import { CommonConsentEventProperties, Consent, CmpVisible } from './types';

const _trackers: Record<string, BrowserTracker> = {};

type ConsentEventProperties = Omit<Consent, 'eventType'> & CommonConsentEventProperties;

/**
 * Adds consent tracking
 */

export function EnhancedConsentPlugin(): BrowserPlugin {
  let trackerId: string;
  return {
    activateBrowserPlugin: (tracker) => {
      trackerId = tracker.id;
      _trackers[trackerId] = tracker;
    },
  };
}

/**
 * Track the loadtime of a CMP banner
 */

export function trackCmpVisible(
  cmpVisible: CmpVisible & CommonConsentEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { context, timestamp, elapsedTime } = cmpVisible;
  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(
      buildCmpVisibleEvent({
        elapsedTime,
      }),
      context,
      timestamp
    );
  });
}

// Generic consent action
function trackConsentAction(
  consent: Consent & CommonConsentEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { context, timestamp, ...consentAttributes } = consent;
  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildConsentEvent(consentAttributes), context, timestamp);
  });
}

/**
 * Track an allow consent event
 *
 * @param consent - The consent information
 * @param trackers - The tracker identifiers which the event will be sent to
 */

export function trackConsentAllow(consent: ConsentEventProperties, trackers: Array<string> = Object.keys(_trackers)) {
  trackConsentAction({ ...consent, eventType: 'allow_all' }, trackers);
}

/**
 * Track an allow selected consent event
 *
 * @param consent - The consent information
 * @param trackers - The tracker identifiers which the event will be sent to
 */

export function trackConsentSelected(
  consent: ConsentEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackConsentAction({ ...consent, eventType: 'allow_selected' }, trackers);
}

/**
 * Track a consent pending event
 *
 * @param consent - The consent information
 * @param trackers - The tracker identifiers which the event will be sent to
 */

export function trackConsentPending(consent: ConsentEventProperties, trackers: Array<string> = Object.keys(_trackers)) {
  trackConsentAction({ ...consent, eventType: 'pending' }, trackers);
}

/**
 * Track an implicit consent event
 *
 * @param consent - The consent information
 * @param trackers - The tracker identifiers which the event will be sent to
 */

export function trackConsentImplicit(
  consent: ConsentEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackConsentAction({ ...consent, eventType: 'implicit_consent' }, trackers);
}

/**
 * Track a deny consent event
 *
 * @param consent - The consent information
 * @param trackers - The tracker identifiers which the event will be sent to
 */

export function trackConsentDeny(consent: ConsentEventProperties, trackers: Array<string> = Object.keys(_trackers)) {
  trackConsentAction({ ...consent, eventType: 'deny_all' }, trackers);
}

/**
 * Track a consent expired event
 *
 * @param consent - The consent information
 * @param trackers - The tracker identifiers which the event will be sent to
 */

export function trackConsentExpired(consent: ConsentEventProperties, trackers: Array<string> = Object.keys(_trackers)) {
  trackConsentAction({ ...consent, eventType: 'expired' }, trackers);
}

/**
 * Track a consent withdrawn event
 *
 * @param consent - The consent information
 * @param trackers - The tracker identifiers which the event will be sent to
 */

export function trackConsentWithdrawn(
  consent: ConsentEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackConsentAction({ ...consent, eventType: 'withdrawn' }, trackers);
}
