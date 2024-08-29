import { Payload } from "./payload";

export interface EventStorePayload {
  /**
   * The event payload to be stored
   */
  payload: Payload;

  /**
   * If the request should undergo server anonymization.
   * @defaultValue false
   */
  svrAnon?: boolean;
}

/**
 * Create a new EventStorePayload
 */
export function newEventStorePayload({
  payload,
  svrAnon = false,
}: EventStorePayload): EventStorePayload {
  return {
    payload,
    svrAnon,
  };
}
