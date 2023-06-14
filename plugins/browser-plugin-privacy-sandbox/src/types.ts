export type PrivacySandboxTopic = {
  configVersion: string;
  modelVersion: string;
  taxonomyVersion: string;
  topic: number;
  version: string;
};

export type Topic = Pick<PrivacySandboxTopic, 'topic' | 'version'>;

export type BrowsingTopicsOptions = {
  /* Enabling will not cause the current page to be included in the weekly epoch calculation or update the list of topics observed for the caller. */
  skipObservation?: boolean;
};
