import { Payload } from '@snowplow/tracker-core';

export interface Emitter {
  flush: () => void;
  input: (payload: Payload) => void;
  /** Set if the requests from the emitter should be anonymized. Read more about anonymization used at https://docs.snowplow.io/docs/collecting-data/collecting-from-own-applications/snowplow-tracker-protocol/going-deeper/http-headers/. */
  setAnonymization?: (shouldAnonymize: boolean) => void;
}

/**
 * Convert all fields in a payload dictionary to strings
 *
 * @param payload - Payload on which the new dictionary is based
 */
export const preparePayload = (payload: Payload): Record<string, string> => {
  const stringifiedPayload: Record<string, string> = {};

  const finalPayload = addDeviceSentTimestamp(payload);

  for (const key in finalPayload) {
    if (Object.prototype.hasOwnProperty.call(finalPayload, key)) {
      stringifiedPayload[key] = String(finalPayload[key]);
    }
  }
  return stringifiedPayload;
};

/**
 * Adds the 'stm' paramater with the current time to the payload
 * @param payload - The payload which will be mutated
 */
const addDeviceSentTimestamp = (payload: Payload): Payload => {
  payload['stm'] = new Date().getTime().toString();
  return payload;
};
