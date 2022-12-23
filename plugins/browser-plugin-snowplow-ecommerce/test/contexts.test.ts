import { addTracker, SharedState } from '@snowplow/browser-tracker-core';
import { SnowplowEcommercePlugin, setEcommerceUser, setPageType, trackCheckoutStep } from '../src';
import { CHECKOUT_STEP_SCHEMA } from '../src/schemata';

const extractStateProperties = ({
  outQueues: [
    [
      {
        evt: { ue_pr, co },
      },
    ],
  ],
}: any) => ({ unstructuredEvent: JSON.parse(ue_pr).data, context: JSON.parse(co).data });

describe('SnowplowEcommercePlugin contexts', () => {
  let state: SharedState;
  let idx = 1;

  beforeEach(() => {
    state = new SharedState();
    addTracker(`sp${idx++}`, `sp${idx++}`, 'js-3.0.0', '', state, {
      stateStorageStrategy: 'cookie',
      encodeBase64: false,
      plugins: [SnowplowEcommercePlugin()],
      contexts: { webPage: false },
    });
  });

  it('setPageContext can only be added one time and the latest one is persisted', () => {
    const checkoutPageType = { type: 'Checkout', locale: 'us' };
    const homepagePageType = { type: 'Homepage', locale: 'us' };
    setPageType(homepagePageType);
    setPageType(checkoutPageType);

    const checkoutStep = {
      step: 1,
    };
    trackCheckoutStep(checkoutStep);

    const { context } = extractStateProperties(state);

    expect(context).toMatchObject([
      {
        data: checkoutStep,
        schema: CHECKOUT_STEP_SCHEMA,
      },
      { data: checkoutPageType },
    ]);
  });

  it('setEcommerceUser can only be added one time and the latest one is persisted', () => {
    setEcommerceUser({ id: 'testid' });
    setEcommerceUser({ id: 'testid', email: 'test@snowplow.com' });

    const checkoutStep = {
      step: 1,
    };
    trackCheckoutStep(checkoutStep);

    const { context } = extractStateProperties(state);

    expect(context).toMatchObject([
      {
        data: checkoutStep,
        schema: CHECKOUT_STEP_SCHEMA,
      },
      { data: { id: 'testid', email: 'test@snowplow.com' } },
    ]);
  });
});
