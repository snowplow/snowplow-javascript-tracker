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
import { SiteTrackingPlugin, trackTiming, trackSiteSearch, trackSocialInteraction } from '../src';
import { newInMemoryEventStore } from '@snowplow/tracker-core';

const getUEEvents = F.compose(F.filter(F.compose(F.eq('ue'), F.get('e'))));
const extractEventProperties = F.map(F.compose(F.get('data'), (cx: string) => JSON.parse(cx), F.get('ue_pr')));
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

describe('AdTrackingPlugin', () => {
  const eventStore = newInMemoryEventStore({});
  addTracker('sp1', 'sp1', 'js-3.0.0', '', new SharedState(), {
    stateStorageStrategy: 'cookie',
    encodeBase64: false,
    plugins: [SiteTrackingPlugin()],
    eventStore,
    customFetch: async () => new Response(null, { status: 500 }),
  });

  it('trackTiming adds the expected timing click event to the queue', async () => {
    trackTiming({
      category: 'category-1',
      timing: 200,
      variable: 'var-1',
      label: 'label-1',
    });

    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/timing/jsonschema/1-0-0').from(
        await eventStore.getAllPayloads()
      )
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/timing/jsonschema/1-0-0',
      data: {
        category: 'category-1',
        timing: 200,
        variable: 'var-1',
        label: 'label-1',
      },
    });
  });

  it('trackSiteSearch adds the expected site search event to the queue', async () => {
    trackSiteSearch({
      terms: ['term-1', 'term-2'],
      filters: { key: 'value' },
      pageResults: 10,
      totalResults: 100,
    });

    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/site_search/jsonschema/1-0-0').from(
        await eventStore.getAllPayloads()
      )
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/site_search/jsonschema/1-0-0',
      data: {
        terms: ['term-1', 'term-2'],
        filters: { key: 'value' },
        pageResults: 10,
        totalResults: 100,
      },
    });
  });

  it('trackSocialInteraction adds the expected social interaction event to the queue', async () => {
    trackSocialInteraction({
      action: 'action-1',
      network: 'network-1',
      target: 'target-1',
    });

    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/social_interaction/jsonschema/1-0-0').from(
        await eventStore.getAllPayloads()
      )
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/social_interaction/jsonschema/1-0-0',
      data: {
        action: 'action-1',
        network: 'network-1',
        target: 'target-1',
      },
    });
  });
});
