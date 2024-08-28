import { addTracker, SharedState, EventStore } from '@snowplow/browser-tracker-core';
import { SnowplowEcommercePlugin, setEcommerceUser, setPageType, trackCheckoutStep } from '../src';
import { CHECKOUT_STEP_SCHEMA } from '../src/schemata';
import { newInMemoryEventStore } from '@snowplow/tracker-core';

const extractEventsProperties = ([{ ue_pr, co }]: any) => ({
  unstructuredEvent: JSON.parse(ue_pr).data,
  context: JSON.parse(co).data,
});

describe('SnowplowEcommercePlugin contexts', () => {
  let idx = 1;
  let eventStore: EventStore;
  const customFetch = async () => new Response(null, { status: 500 });

  beforeEach(() => {
    eventStore = newInMemoryEventStore({});
  });

  beforeEach(() => {
    addTracker(`sp${idx++}`, `sp${idx++}`, 'js-3.0.0', '', new SharedState(), {
      stateStorageStrategy: 'cookie',
      encodeBase64: false,
      plugins: [SnowplowEcommercePlugin()],
      contexts: { webPage: false },
      customFetch,
      eventStore,
    });
  });

  it('setPageContext can only be added one time and the latest one is persisted', async () => {
    const checkoutPageType = { type: 'Checkout', locale: 'us' };
    const homepagePageType = { type: 'Homepage', locale: 'us' };
    setPageType(homepagePageType);
    setPageType(checkoutPageType);

    const checkoutStep = {
      step: 1,
    };
    trackCheckoutStep(checkoutStep);

    const { context } = extractEventsProperties(await eventStore.getAllPayloads());

    expect(context).toMatchObject([
      {
        data: checkoutStep,
        schema: CHECKOUT_STEP_SCHEMA,
      },
      { data: checkoutPageType },
    ]);
  });

  it('setEcommerceUser can only be added one time and the latest one is persisted', async () => {
    setEcommerceUser({ id: 'testid' });
    setEcommerceUser({ id: 'testid', email: 'test@snowplow.com' });

    const checkoutStep = {
      step: 1,
    };
    trackCheckoutStep(checkoutStep);

    const { context } = extractEventsProperties(await eventStore.getAllPayloads());

    expect(context).toMatchObject([
      {
        data: checkoutStep,
        schema: CHECKOUT_STEP_SCHEMA,
      },
      { data: { id: 'testid', email: 'test@snowplow.com' } },
    ]);
  });
});
