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

import { addTracker, SharedState } from '@snowplow/browser-tracker-core';
import F from 'lodash/fp';
import {
  EnhancedEcommercePlugin,
  addEnhancedEcommerceActionContext,
  addEnhancedEcommerceImpressionContext,
  addEnhancedEcommerceProductContext,
  addEnhancedEcommercePromoContext,
  trackEnhancedEcommerceAction,
} from '../src';
import { newInMemoryEventStore } from '@snowplow/tracker-core';

const getUEEvents = F.compose(F.filter(F.compose(F.eq('ue'), F.get('e'))));
const extractSchemas = F.map(F.compose(F.get('data'), (cx: string) => JSON.parse(cx), F.get('co')));

it('attaches enhanced ecommerce contexts to enhanced ecommerce events', async () => {
  const eventStore = newInMemoryEventStore({});
  addTracker('sp1', 'sp1', 'js-3.0.0', '', new SharedState(), {
    stateStorageStrategy: 'cookie',
    encodeBase64: false,
    plugins: [EnhancedEcommercePlugin()],
    eventStore,
    customFetch: async () => new Response(null, { status: 500 }),
  });

  addEnhancedEcommerceProductContext({ id: '1234-5678', name: 'T-Shirt' });
  addEnhancedEcommerceImpressionContext({ id: '1234-5678', name: 'T-Shirt' });
  addEnhancedEcommercePromoContext({ id: '1234-5678', name: 'T-Shirt' });
  addEnhancedEcommerceActionContext({ id: '1234-5678', affiliation: 'acme' });
  trackEnhancedEcommerceAction();

  const findWithStaticValue = F.filter(F.get('data.id'));
  const extractContextsWithStaticValue = F.compose(findWithStaticValue, F.flatten, extractSchemas, getUEEvents);

  const countWithStaticValueEq = (value: string) =>
    F.compose(F.size, F.filter(F.compose(F.eq(value), F.get('data.id'))), extractContextsWithStaticValue);

  // we expect there to be four contexts added to the event
  expect(countWithStaticValueEq('1234-5678')(await eventStore.getAllPayloads())).toBe(4);
});
