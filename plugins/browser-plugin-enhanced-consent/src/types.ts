import { CommonEventProperties, SelfDescribingJson } from '@snowplow/tracker-core';

/**
 * Type for Consent Action
 */
export interface Consent {
  /**
   * The action for the consent preferences of a user
   */
  eventType: 'deny_all' | 'allow_all' | 'allow_selected' | 'pending' | 'implicit_consent' | 'withdrawn' | 'expired';
  /**
   * GDPR lawful basis for data collection & processing
   */
  basisForProcessing:
    | 'consent'
    | 'contract'
    | 'legal_obligation'
    | 'vital_interests'
    | 'public_task'
    | 'legitimate_interests';
  /**
   * URI of the privacy policy related document
   */
  consentUrl: string;
  /**
   * Version of the privacy policy related document
   */
  consentVersion: string;
  /**
   * The scopes allowed after the user finalized his selection of consent preferences. E.g ['analytics', 'functional', 'advertisement'].
   */
  consentScopes: string[];
  /**
   * The domains for which this consent allows these preferences to persist to.
   */
  domainsApplied: string[];
  /**
   * Determine if GDPR applies based on the user's geo-location.
   */
  gdprApplies?: boolean;
}

export interface CmpVisible {
  /**
   * The time between the page load and dialog box appearing
   */
  elapsedTime: number;
}

export interface CommonConsentEventProperties extends CommonEventProperties {
  /** Add context to an event by setting an Array of Self Describing JSON */
  context?: Array<SelfDescribingJson>;
}
