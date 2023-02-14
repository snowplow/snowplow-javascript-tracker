/*
 * Copyright (c) 2022 Snowplow Analytics Ltd
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { addTracker, SharedState } from '@snowplow/browser-tracker-core';
import {
  SnowplowEcommercePlugin,
  trackAddToCart,
  trackCheckoutStep,
  trackProductListClick,
  trackProductListView,
  trackProductView,
  trackPromotionClick,
  trackPromotionView,
  trackRefund,
  trackRemoveFromCart,
  trackTransaction,
} from '../src';
import {
  CART_SCHEMA,
  CHECKOUT_STEP_SCHEMA,
  ECOMMERCE_ACTION_SCHEMA,
  PRODUCT_SCHEMA,
  PROMO_SCHEMA,
  REFUND_SCHEMA,
  TRANSACTION_SCHEMA,
} from '../src/schemata';

const extractStateProperties = ({
  outQueues: [
    [
      {
        evt: { ue_pr, co },
      },
    ],
  ],
}: any) => ({ unstructuredEvent: JSON.parse(ue_pr).data, context: JSON.parse(co).data });

describe('SnowplowEcommercePlugin events', () => {
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

  it('trackAddToCart adds the expected "add to cart" event to the queue', () => {
    const productX = { id: '1234', price: 12, currency: 'EUR' };
    const productY = { id: '12345', price: 25, currency: 'EUR' };
    trackAddToCart({
      total_value: 40,
      currency: 'EUR',
      products: [productX, productY],
    });

    const { context, unstructuredEvent } = extractStateProperties(state);

    expect(context).toMatchObject([
      {
        data: productX,
        schema: PRODUCT_SCHEMA,
      },
      {
        data: productY,
        schema: PRODUCT_SCHEMA,
      },
      {
        data: {
          currency: 'EUR',
          total_value: 40,
        },
        schema: CART_SCHEMA,
      },
    ]);

    expect(unstructuredEvent).toMatchObject({
      schema: ECOMMERCE_ACTION_SCHEMA,
      data: { type: 'add_to_cart' },
    });
  });

  it('trackRemoveFromCart adds the expected "remove from cart" event to the queue', () => {
    const productX = { id: '1234', price: 12, currency: 'EUR' };
    trackRemoveFromCart({
      total_value: 40,
      currency: 'EUR',
      products: [productX],
    });

    const { context, unstructuredEvent } = extractStateProperties(state);

    expect(context).toMatchObject([
      {
        data: productX,
        schema: PRODUCT_SCHEMA,
      },
      {
        data: {
          currency: 'EUR',
          total_value: 40,
        },
        schema: CART_SCHEMA,
      },
    ]);

    expect(unstructuredEvent).toMatchObject({
      schema: ECOMMERCE_ACTION_SCHEMA,
      data: { type: 'remove_from_cart' },
    });
  });

  it('trackProductView adds the expected "product view" event to the queue', () => {
    const productX = {
      id: '1234',
      price: 25,
      currency: 'EUR',
      brand: 'Snowplow',
    };
    trackProductView(productX);

    const { context, unstructuredEvent } = extractStateProperties(state);

    expect(context).toMatchObject([
      {
        data: productX,
        schema: PRODUCT_SCHEMA,
      },
    ]);

    expect(unstructuredEvent).toMatchObject({
      schema: ECOMMERCE_ACTION_SCHEMA,
      data: { type: 'product_view' },
    });
  });

  it('trackPromotionView adds the expected "promotion view" event to the queue', () => {
    const promoX = {
      id: '1234',
      name: 'promo_winter',
      product_ids: ['P1234'],
      type: 'carousel',
      position: 1,
    };
    trackPromotionView(promoX);

    const { context, unstructuredEvent } = extractStateProperties(state);

    expect(context).toMatchObject([
      {
        data: promoX,
        schema: PROMO_SCHEMA,
      },
    ]);

    expect(unstructuredEvent).toMatchObject({
      schema: ECOMMERCE_ACTION_SCHEMA,
      data: { type: 'promo_view' },
    });
  });

  it('trackPromotionClick adds the expected "promotion click" event to the queue', () => {
    const promoX = {
      id: '1234',
      name: 'promo_winter',
      product_ids: ['P1234'],
      type: 'carousel',
      position: 1,
    };
    trackPromotionClick(promoX);

    const { context, unstructuredEvent } = extractStateProperties(state);

    expect(context).toMatchObject([
      {
        data: promoX,
        schema: PROMO_SCHEMA,
      },
    ]);

    expect(unstructuredEvent).toMatchObject({
      schema: ECOMMERCE_ACTION_SCHEMA,
      data: { type: 'promo_click' },
    });
  });

  it('trackProductListView adds the expected "product list view" event to the queue', () => {
    const productX = { id: '1234', price: 12, currency: 'EUR' };
    const productY = { id: '12345', price: 25, currency: 'EUR' };
    trackProductListView({
      name: 'recommended products',
      products: [productX, productY],
    });

    const { context, unstructuredEvent } = extractStateProperties(state);

    expect(context).toMatchObject([
      {
        data: productX,
        schema: PRODUCT_SCHEMA,
      },
      {
        data: productY,
        schema: PRODUCT_SCHEMA,
      },
    ]);

    expect(unstructuredEvent).toMatchObject({
      schema: ECOMMERCE_ACTION_SCHEMA,
      data: { type: 'list_view', name: 'recommended products' },
    });
  });

  it('trackProductListClick adds the expected "product list click" event to the queue', () => {
    const productX = { id: '1234', price: 12, currency: 'EUR', position: 3 };
    trackProductListClick({
      name: 'recommended products',
      product: productX,
    });

    const { context, unstructuredEvent } = extractStateProperties(state);

    expect(context).toMatchObject([
      {
        data: productX,
        schema: PRODUCT_SCHEMA,
      },
    ]);

    expect(unstructuredEvent).toMatchObject({
      schema: ECOMMERCE_ACTION_SCHEMA,
      data: { type: 'list_click', name: 'recommended products' },
    });
  });

  it('trackCheckoutStep adds the expected "checkout step" event to the queue', () => {
    const checkoutStep = {
      step: 1,
      shipping_postcode: '1234',
      proof_of_payment: 'invoice',
    };
    trackCheckoutStep(checkoutStep);

    const { context, unstructuredEvent } = extractStateProperties(state);

    expect(context).toMatchObject([
      {
        data: checkoutStep,
        schema: CHECKOUT_STEP_SCHEMA,
      },
    ]);

    expect(unstructuredEvent).toMatchObject({
      schema: ECOMMERCE_ACTION_SCHEMA,
      data: { type: 'checkout_step' },
    });
  });

  it('trackTransaction adds the expected "transaction" event to the queue', () => {
    const productX = { id: '1234', price: 12, currency: 'EUR', quantity: 4 };
    const productY = { id: '12345', price: 25, currency: 'EUR', quantity: 1 };
    const transaction = { revenue: 45, currency: 'EUR', transaction_id: '12345', payment_method: 'card' };
    trackTransaction({
      ...transaction,
      products: [productX, productY],
    });

    const { context, unstructuredEvent } = extractStateProperties(state);

    expect(context).toMatchObject([
      {
        data: productX,
        schema: PRODUCT_SCHEMA,
      },
      {
        data: productY,
        schema: PRODUCT_SCHEMA,
      },
      {
        data: transaction,
        schema: TRANSACTION_SCHEMA,
      },
    ]);

    /* Expect implicit total_quantity calculation */
    const emmitedTransaction = context[2].data;
    expect(emmitedTransaction).toHaveProperty('total_quantity');
    expect(emmitedTransaction.total_quantity).toEqual(productX.quantity + productY.quantity);

    expect(unstructuredEvent).toMatchObject({
      schema: ECOMMERCE_ACTION_SCHEMA,
      data: { type: 'transaction' },
    });
  });

  it('trackRefund adds the expected "refund" event to the queue', () => {
    const productX = { id: '1234', price: 12, currency: 'EUR' };
    const productY = { id: '12345', price: 25, currency: 'EUR' };
    const refund = { refund_amount: 45, currency: 'EUR', transaction_id: '12345', refund_reason: 'Return' };
    trackRefund({
      ...refund,
      products: [productX, productY],
    });

    const { context, unstructuredEvent } = extractStateProperties(state);

    expect(context).toMatchObject([
      {
        data: productX,
        schema: PRODUCT_SCHEMA,
      },
      {
        data: productY,
        schema: PRODUCT_SCHEMA,
      },
      {
        data: refund,
        schema: REFUND_SCHEMA,
      },
    ]);

    expect(unstructuredEvent).toMatchObject({
      schema: ECOMMERCE_ACTION_SCHEMA,
      data: { type: 'refund' },
    });
  });
});
