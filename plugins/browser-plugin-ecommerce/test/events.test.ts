/*
 * Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang
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

import { addTracker, BrowserTracker, SharedState } from '@snowplow/browser-tracker-core';
import { trackerCore } from '@snowplow/tracker-core';
import F from 'lodash/fp';
import { EcommercePlugin, trackAddToCart, trackRemoveFromCart, addItem, addTrans, trackTrans } from '../src';

const getUEEvents = F.compose(F.filter(F.compose(F.eq('ue'), F.get('evt.e'))));
const extractEventProperties = F.map(F.compose(F.get('data'), (cx: string) => JSON.parse(cx), F.get('evt.ue_pr')));
const extractUeEvent = (schema: string) => {
  return {
    from: F.compose(
      F.first,
      F.filter(F.compose(F.eq(schema), F.get('schema'))),
      F.flatten,
      extractEventProperties,
      getUEEvents
    ),
  };
};

describe('EcommercePlugin', () => {
  const state = new SharedState();
  addTracker('sp1', 'sp1', 'js-3.0.0', '', state, {
    stateStorageStrategy: 'cookie',
    encodeBase64: false,
    plugins: [EcommercePlugin()],
  });

  it('trackAddToCart adds the expected add to cart event to the queue', () => {
    trackAddToCart(
      {
        quantity: 1,
        sku: '12345-1234',
        category: 'category-1',
        currency: 'currency-1',
        name: 'name-1',
        unitPrice: 10.99,
      },
      ['sp1']
    );

    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/add_to_cart/jsonschema/1-0-0').from(state.outQueues[0])
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/add_to_cart/jsonschema/1-0-0',
      data: {
        quantity: 1,
        sku: '12345-1234',
        category: 'category-1',
        currency: 'currency-1',
        name: 'name-1',
        unitPrice: 10.99,
      },
    });
  });

  it('trackRemoveFromCart adds the expected remove from cart event to the queue', () => {
    trackRemoveFromCart(
      {
        quantity: 1,
        sku: '12345-1234',
        category: 'category-1',
        currency: 'currency-1',
        name: 'name-1',
        unitPrice: 10.99,
      },
      ['sp1']
    );

    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/remove_from_cart/jsonschema/1-0-0').from(state.outQueues[0])
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/remove_from_cart/jsonschema/1-0-0',
      data: {
        quantity: 1,
        sku: '12345-1234',
        category: 'category-1',
        currency: 'currency-1',
        name: 'name-1',
        unitPrice: 10.99,
      },
    });
  });

  it('trackTrans adds the expected transaction event to the queue', (done) => {
    let eventCount = 0;
    const plugin = EcommercePlugin();
    const core = trackerCore({
      corePlugins: [plugin],
      base64: false,
      callback: (payloadBuilder) => {
        eventCount++;
        const payload = payloadBuilder.build();
        if (payload['e'] === 'tr') {
          expect(payload['tr_id']).toBe('1234');
          expect(payload['tr_af']).toBe('aff');
          expect(payload['tr_tt']).toBe(420);
          expect(payload['tr_tx']).toBe(4.2);
          expect(payload['tr_sh']).toBe(10.69);
          expect(payload['tr_ci']).toBe('city');
          expect(payload['tr_st']).toBe('texas');
          expect(payload['tr_co']).toBe('country');
          expect(payload['tr_cu']).toBe('usd');
        }

        if (payload['e'] === 'ti') {
          expect(payload['ti_id']).toBe('1234');
          expect(payload['ti_sk']).toBe('12345-1111');
          expect(payload['ti_nm']).toBe('name-1');
          expect(payload['ti_ca']).toBe('category-1');
          expect(payload['ti_pr']).toBe(10.99);
          expect(payload['ti_qu']).toBe(2);
          expect(payload['ti_cu']).toBe('usd');
        }

        if (eventCount === 2) {
          done();
        }
      },
    });

    plugin.activateBrowserPlugin?.({ id: 'sp2', core } as BrowserTracker);

    addTrans(
      {
        orderId: '1234',
        total: 420,
        affiliation: 'aff',
        city: 'city',
        country: 'country',
        currency: 'usd',
        shipping: 10.69,
        state: 'texas',
        tax: 4.2,
      },
      ['sp2']
    );

    addItem(
      {
        orderId: '1234',
        price: 10.99,
        sku: '12345-1111',
        category: 'category-1',
        currency: 'usd',
        name: 'name-1',
        quantity: 2,
      },
      ['sp2']
    );

    trackTrans(['sp2']);
  });
});
