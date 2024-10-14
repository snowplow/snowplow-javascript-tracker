describe('Snowtype compat', () => {
  it('pass if this snowtype-generated file passes typechecks', () => {});
});
// generated with Snowtype v0.8.4, package import on below line needs to be updated to '../src'

import { trackSelfDescribingEvent, CommonEventProperties, SelfDescribingJson } from '../src';
// Automatically generated by Snowtype

/**
 * Schema for an example event
 */
export type SubscriptionFunnel = {
  /**
   * the action of the funnel step
   */
  action?: null | string;
  /**
   * the number of the funnel step
   */
  step: number;
  /**
   * the type of subscription the user is signing up to
   */
  subscription_type?: null | string;
};

/**
 * Creates a Snowplow Event Specification entity.
 */
export function createEventSpecification(eventSpecification: EventSpecification) {
  return {
    schema: 'iglu:com.snowplowanalytics.snowplow/event_specification/jsonschema/1-0-2',
    data: eventSpecification,
  };
}

/**
 * Automatically attached context for event specifications
 */
interface EventSpecification {
  id: string;
  name: string;
  data_product_id: string;
  data_product_name: string;
}

type ContextsOrTimestamp<T = any> = Omit<CommonEventProperties<T>, 'context'> & {
  context?: SelfDescribingJson<T>[] | null | undefined;
};
/**
 * Track a Snowplow event for SubscriptionFunnel.
 * Schema for an example event
 */
export function trackSubscriptionFunnel<T extends {} = any>(
  subscriptionFunnel: SubscriptionFunnel & ContextsOrTimestamp<T>,
  trackers?: string[]
) {
  const { context, timestamp, ...data } = subscriptionFunnel;
  const event: SelfDescribingJson<typeof data> = {
    schema: 'iglu:com.example/subscription_funnel/jsonschema/1-0-0',
    data,
  };

  trackSelfDescribingEvent(
    {
      event,
      context,
      timestamp,
    },
    trackers
  );
}

/**
 * Creates a Snowplow SubscriptionFunnel entity.
 */
export function createSubscriptionFunnel(subscriptionFunnel: SubscriptionFunnel) {
  return {
    schema: 'iglu:com.example/subscription_funnel/jsonschema/1-0-0',
    data: subscriptionFunnel,
  };
}
