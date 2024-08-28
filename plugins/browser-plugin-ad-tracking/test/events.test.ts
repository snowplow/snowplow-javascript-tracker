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
import { AdTrackingPlugin, trackAdClick, trackAdConversion, trackAdImpression } from '../src';
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
  const state = new SharedState();
  let eventStore = newInMemoryEventStore({});
  const customFetch = async () => new Response(null, { status: 500 });

  addTracker('sp1', 'sp1', 'js-3.0.0', '', state, {
    stateStorageStrategy: 'cookie',
    encodeBase64: false,
    plugins: [AdTrackingPlugin()],
    eventStore,
    customFetch,
  });

  it('trackAdClick adds the expected ad click event to the queue', async () => {
    trackAdClick({
      targetUrl: 'https://www.snowplowanalytics.com',
      bannerId: 'banner-1',
      advertiserId: 'advertiser-1',
      campaignId: 'campaign-1',
      clickId: 'click-1',
      impressionId: 'impression-1',
      cost: 0.01,
      costModel: 'cpa',
      zoneId: 'zone-1',
    });

    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/ad_click/jsonschema/1-0-0').from(
        await eventStore.getAllPayloads()
      )
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/ad_click/jsonschema/1-0-0',
      data: {
        targetUrl: 'https://www.snowplowanalytics.com',
        bannerId: 'banner-1',
        advertiserId: 'advertiser-1',
        campaignId: 'campaign-1',
        clickId: 'click-1',
        impressionId: 'impression-1',
        cost: 0.01,
        costModel: 'cpa',
        zoneId: 'zone-1',
      },
    });
  });

  it('trackAdConversion adds the expected ad conversion event to the queue', async () => {
    trackAdConversion({
      action: 'action',
      advertiserId: 'advertiser-1',
      campaignId: 'campaign-1',
      category: 'category',
      conversionId: 'conversion-1',
      cost: 0.02,
      costModel: 'cpc',
      initialValue: 10,
      property: 'property',
    });

    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/ad_conversion/jsonschema/1-0-0').from(
        await eventStore.getAllPayloads()
      )
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/ad_conversion/jsonschema/1-0-0',
      data: {
        action: 'action',
        advertiserId: 'advertiser-1',
        campaignId: 'campaign-1',
        category: 'category',
        conversionId: 'conversion-1',
        cost: 0.02,
        costModel: 'cpc',
        initialValue: 10,
        property: 'property',
      },
    });
  });

  it('trackAdImpression adds the expected ad impression event to the queue', async () => {
    trackAdImpression({
      advertiserId: 'advrtiser-1',
      bannerId: 'banner-1',
      campaignId: 'campaign-1',
      cost: 0.03,
      costModel: 'cpm',
      impressionId: 'impression-1',
      targetUrl: 'https://snowplowanalytics.com',
      zoneId: 'zone-1',
    });

    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0').from(
        await eventStore.getAllPayloads()
      )
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
      data: {
        advertiserId: 'advrtiser-1',
        bannerId: 'banner-1',
        campaignId: 'campaign-1',
        cost: 0.03,
        costModel: 'cpm',
        impressionId: 'impression-1',
        targetUrl: 'https://snowplowanalytics.com',
        zoneId: 'zone-1',
      },
    });
  });
});
