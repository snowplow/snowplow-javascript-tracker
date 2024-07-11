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

import test, { ExecutionContext } from 'ava';
import {
  buildAdClick,
  buildAdConversion,
  buildAddToCart,
  buildAdImpression,
  buildConsentGranted,
  buildConsentWithdrawn,
  buildEcommerceTransaction,
  buildEcommerceTransactionItem,
  buildFormFocusOrChange,
  buildFormSubmission,
  buildLinkClick,
  buildPagePing,
  buildPageView,
  buildRemoveFromCart,
  buildScreenView,
  buildSelfDescribingEvent,
  buildSiteSearch,
  buildSocialInteraction,
  buildStructEvent,
  trackerCore,
} from '../src/core';
import { Payload } from '../src/payload';

const UUID_REGEX = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

const selfDescribingEventSchema = 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0';
let beforeCount = 0,
  afterCount = 0;
const tracker = trackerCore({
  base64: false,
  corePlugins: [{ beforeTrack: () => (beforeCount += 1), afterTrack: () => (afterCount += 1) }],
});
function compare(result: Payload, expected: Payload, t: ExecutionContext) {
  t.truthy(result['eid'], 'A UUID should be attached to all events');
  delete result['eid'];
  t.truthy(result['dtm'], 'A timestamp should be attached to all events');
  delete result['dtm'];
  t.deepEqual(result, expected);
}

test('tracker.track API should return the eid attribute', (t) => {
  const pageUrl = 'http://www.example.com';
  const pageTitle = 'title page';
  const referrer = 'https://www.google.com';
  const expected = {
    e: 'pv',
    url: pageUrl,
    page: pageTitle,
    refr: referrer,
  };
  const eventPayload = tracker.track(buildPageView({ pageUrl, pageTitle, referrer }))!;
  t.truthy(eventPayload.eid);
  t.regex(eventPayload.eid as string, UUID_REGEX);
  compare(eventPayload, expected, t);
});

test('should track a page view', (t) => {
  const pageUrl = 'http://www.example.com';
  const pageTitle = 'title page';
  const referrer = 'https://www.google.com';
  const expected = {
    e: 'pv',
    url: pageUrl,
    page: pageTitle,
    refr: referrer,
  };
  compare(tracker.track(buildPageView({ pageUrl, pageTitle, referrer }))!, expected, t);
});
test('should track a page ping', (t) => {
  const pageUrl = 'http://www.example.com';
  const pageTitle = 'title page';
  const referrer = 'http://www.google.com';
  const expected = {
    e: 'pp',
    page: pageTitle,
    url: pageUrl,
    refr: referrer,
    pp_mix: '1',
    pp_max: '2',
    pp_miy: '3',
    pp_may: '4',
  };
  compare(
    tracker.track(
      buildPagePing({ pageUrl, pageTitle, referrer, minXOffset: 1, maxXOffset: 2, minYOffset: 3, maxYOffset: 4 })
    )!,
    expected,
    t
  );
});
test('should track a structured event', (t) => {
  const expected = {
    e: 'se',
    se_ca: 'cat',
    se_ac: 'act',
    se_la: 'lab',
    se_pr: 'prop',
    se_va: '1',
  };
  compare(
    tracker.track(buildStructEvent({ category: 'cat', action: 'act', label: 'lab', property: 'prop', value: 1 }))!,
    expected,
    t
  );
});
test('should track an ecommerce transaction event', (t) => {
  const orderId = 'ak0008';
  const affiliation = '1234';
  const total = 50;
  const tax = 6;
  const shipping = 0;
  const city = 'Phoenix';
  const state = 'Arizona';
  const country = 'USA';
  const currency = 'USD';
  const expected = {
    e: 'tr',
    tr_af: affiliation,
    tr_id: orderId,
    tr_tt: total,
    tr_tx: tax,
    tr_sh: shipping,
    tr_ci: city,
    tr_st: state,
    tr_co: country,
    tr_cu: currency,
  };
  compare(
    tracker.track(
      buildEcommerceTransaction({
        orderId,
        total,
        affiliation,
        tax,
        shipping,
        city,
        state,
        country,
        currency,
      })
    )!,
    expected,
    t
  );
});
test('should track an ecommerce transaction item event', (t) => {
  const orderId = 'ak0008';
  const sku = '4q345';
  const price = 17.0;
  const quantity = 2;
  const name = 'red shoes';
  const category = 'clothing';
  const currency = 'USD';
  const expected = {
    e: 'ti',
    ti_id: orderId,
    ti_sk: sku,
    ti_nm: name,
    ti_ca: category,
    ti_pr: price,
    ti_qu: quantity,
    ti_cu: currency,
  };
  compare(
    tracker.track(buildEcommerceTransactionItem({ orderId, sku, name, category, price, quantity, currency }))!,
    expected,
    t
  );
});
test('should track a self-describing event', (t) => {
  const inputJson = {
    schema: 'iglu:com.acme/user/jsonschema/1-0-1',
    data: {
      name: 'Eric',
    },
  };
  const expected = {
    e: 'ue',
    ue_pr: JSON.stringify({
      schema: selfDescribingEventSchema,
      data: inputJson,
    }),
  };
  compare(tracker.track(buildSelfDescribingEvent({ event: inputJson }))!, expected, t);
});
test('should track a link click', (t) => {
  const targetUrl = 'http://www.example.com';
  const elementId = 'first header';
  const elementClasses = ['header'];
  const elementContent = 'link';
  const elementTarget = 'target';
  const inputJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
    data: {
      targetUrl: targetUrl,
      elementId: elementId,
      elementClasses: elementClasses,
      elementTarget: elementTarget,
      elementContent: elementContent,
    },
  };
  const expected = {
    e: 'ue',
    ue_pr: JSON.stringify({
      schema: selfDescribingEventSchema,
      data: inputJson,
    }),
  };
  compare(
    tracker.track(buildLinkClick({ targetUrl, elementId, elementClasses, elementTarget, elementContent }))!,
    expected,
    t
  );
});
test('should track a screen view', (t) => {
  const name = 'intro';
  const id = '7398-4352-5345-1950';
  const inputJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/screen_view/jsonschema/1-0-0',
    data: {
      name: name,
      id: id,
    },
  };
  const expected = {
    e: 'ue',
    ue_pr: JSON.stringify({
      schema: selfDescribingEventSchema,
      data: inputJson,
    }),
  };
  compare(tracker.track(buildScreenView({ name, id }))!, expected, t);
});
test('should track an ad impression', (t) => {
  const impressionId = 'a0e8f8780ab3';
  const costModel = 'cpc';
  const cost = 0.5;
  const targetUrl = 'http://adsite.com';
  const bannerId = '123';
  const zoneId = 'zone-14';
  const advertiserId = 'ad-company';
  const campaignId = 'campaign-7592';
  const inputJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
    data: {
      impressionId: impressionId,
      costModel: costModel,
      cost: cost,
      targetUrl: targetUrl,
      bannerId: bannerId,
      zoneId: zoneId,
      advertiserId: advertiserId,
      campaignId: campaignId,
    },
  };
  const expected = {
    e: 'ue',
    ue_pr: JSON.stringify({
      schema: selfDescribingEventSchema,
      data: inputJson,
    }),
  };
  compare(
    tracker.track(
      buildAdImpression({ impressionId, costModel, cost, targetUrl, bannerId, zoneId, advertiserId, campaignId })
    )!,
    expected,
    t
  );
});
test('should track an ad click', (t) => {
  const targetUrl = 'http://adsite.com';
  const clickId = 'click-321';
  const costModel = 'cpc';
  const cost = 0.5;
  const bannerId = '123';
  const zoneId = 'zone-14';
  const impressionId = 'a0e8f8780ab3';
  const advertiserId = 'ad-company';
  const campaignId = 'campaign-7592';
  const inputJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/ad_click/jsonschema/1-0-0',
    data: {
      targetUrl: targetUrl,
      clickId: clickId,
      costModel: costModel,
      cost: cost,
      bannerId: bannerId,
      zoneId: zoneId,
      impressionId: impressionId,
      advertiserId: advertiserId,
      campaignId: campaignId,
    },
  };
  const expected = {
    e: 'ue',
    ue_pr: JSON.stringify({
      schema: selfDescribingEventSchema,
      data: inputJson,
    }),
  };
  compare(
    tracker.track(
      buildAdClick({ targetUrl, clickId, costModel, cost, bannerId, zoneId, impressionId, advertiserId, campaignId })
    )!,
    expected,
    t
  );
});
test('should track an ad conversion', (t) => {
  const conversionId = 'conversion-59';
  const costModel = 'cpc';
  const cost = 0.5;
  const category = 'cat';
  const action = 'act';
  const property = 'prop';
  const initialValue = 7;
  const advertiserId = 'ad-company';
  const campaignId = 'campaign-7592';
  const inputJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/ad_conversion/jsonschema/1-0-0',
    data: {
      conversionId: conversionId,
      costModel: costModel,
      cost: cost,
      category: category,
      action: action,
      property: property,
      initialValue: initialValue,
      advertiserId: advertiserId,
      campaignId: campaignId,
    },
  };
  const expected = {
    e: 'ue',
    ue_pr: JSON.stringify({
      schema: selfDescribingEventSchema,
      data: inputJson,
    }),
  };
  compare(
    tracker.track(
      buildAdConversion({
        conversionId,
        costModel,
        cost,
        category,
        action,
        property,
        initialValue,
        advertiserId,
        campaignId,
      })
    )!,
    expected,
    t
  );
});
test('should track a social interaction', (t) => {
  const action = 'like';
  const network = 'facebook';
  const target = 'status-0000345345';
  const inputJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/social_interaction/jsonschema/1-0-0',
    data: {
      action: action,
      network: network,
      target: target,
    },
  };
  const expected = {
    e: 'ue',
    ue_pr: JSON.stringify({
      schema: selfDescribingEventSchema,
      data: inputJson,
    }),
  };
  compare(tracker.track(buildSocialInteraction({ action, network, target }))!, expected, t);
});
test('should track an add-to-cart event', (t) => {
  const sku = '4q345';
  const unitPrice = 17.0;
  const quantity = 2;
  const name = 'red shoes';
  const category = 'clothing';
  const currency = 'USD';
  const inputJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/add_to_cart/jsonschema/1-0-0',
    data: {
      sku: sku,
      quantity: quantity,
      name: name,
      category: category,
      unitPrice: unitPrice,
      currency: currency,
    },
  };
  const expected = {
    e: 'ue',
    ue_pr: JSON.stringify({
      schema: selfDescribingEventSchema,
      data: inputJson,
    }),
  };
  compare(tracker.track(buildAddToCart({ sku, name, category, unitPrice, quantity, currency }))!, expected, t);
});
test('should track a remove-from-cart event', (t) => {
  const sku = '4q345';
  const unitPrice = 17.0;
  const quantity = 2;
  const name = 'red shoes';
  const category = 'clothing';
  const currency = 'USD';
  const inputJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/remove_from_cart/jsonschema/1-0-0',
    data: {
      sku: sku,
      quantity: quantity,
      name: name,
      category: category,
      unitPrice: unitPrice,
      currency: currency,
    },
  };
  const expected = {
    e: 'ue',
    ue_pr: JSON.stringify({
      schema: selfDescribingEventSchema,
      data: inputJson,
    }),
  };
  compare(tracker.track(buildRemoveFromCart({ sku, name, category, unitPrice, quantity, currency }))!, expected, t);
});
test('should track a form focus event', (t) => {
  const formId = 'parent';
  const elementId = 'child';
  const nodeName = 'INPUT';
  const type = 'text';
  const elementClasses = ['important'];
  const value = 'male';
  const inputJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
    data: {
      formId: formId,
      elementId: elementId,
      nodeName: nodeName,
      elementClasses: elementClasses,
      value: value,
      elementType: type,
    },
  };
  const expected = {
    e: 'ue',
    ue_pr: JSON.stringify({
      schema: selfDescribingEventSchema,
      data: inputJson,
    }),
  };
  compare(
    tracker.track(
      buildFormFocusOrChange({ schema: 'focus_form', formId, elementId, nodeName, type, elementClasses, value })
    )!,
    expected,
    t
  );
});
test('should track a form change event', (t) => {
  const formId = 'parent';
  const elementId = 'child';
  const nodeName = 'INPUT';
  const type = 'text';
  const elementClasses = ['important'];
  const value = 'male';
  const inputJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0',
    data: {
      formId: formId,
      elementId: elementId,
      nodeName: nodeName,
      elementClasses: elementClasses,
      value: value,
      type: type,
    },
  };
  const expected = {
    e: 'ue',
    ue_pr: JSON.stringify({
      schema: selfDescribingEventSchema,
      data: inputJson,
    }),
  };
  compare(
    tracker.track(
      buildFormFocusOrChange({ schema: 'change_form', formId, elementId, nodeName, type, elementClasses, value })
    )!,
    expected,
    t
  );
});
test('should track a form submission event', (t) => {
  const formId = 'parent';
  const formClasses = ['formclass'];
  const elements = [
    {
      name: 'gender',
      value: 'male',
      nodeName: 'INPUT',
      type: 'text',
    },
  ];
  const inputJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0',
    data: {
      formId: formId,
      formClasses: formClasses,
      elements: elements,
    },
  };
  const expected = {
    e: 'ue',
    ue_pr: JSON.stringify({
      schema: selfDescribingEventSchema,
      data: inputJson,
    }),
  };
  compare(tracker.track(buildFormSubmission({ formId, formClasses, elements }))!, expected, t);
});
test('should track a site seach event', (t) => {
  const terms = ['javascript', 'development'];
  const filters = {
    safeSearch: true,
    category: 'books',
  };
  const totalResults = 35;
  const pageResults = 10;
  const inputJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/site_search/jsonschema/1-0-0',
    data: {
      terms: terms,
      filters: filters,
      totalResults: totalResults,
      pageResults: pageResults,
    },
  };
  const expected = {
    e: 'ue',
    ue_pr: JSON.stringify({
      schema: selfDescribingEventSchema,
      data: inputJson,
    }),
  };
  compare(tracker.track(buildSiteSearch({ terms, filters, totalResults, pageResults }))!, expected, t);
});
test('should track a consent withdrawn event', (t) => {
  const all = false;
  const id = '1234';
  const version = '2';
  const name = 'consent_form';
  const description = 'user withdraws consent for form';
  const timestamp = 1000000000000;
  const inputContext = [
    {
      schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
      data: {
        id: id,
        version: version,
        name: name,
        description: description,
      },
    },
  ];
  const inputJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/consent_withdrawn/jsonschema/1-0-0',
    data: {
      all: all,
    },
  };
  const expected = {
    e: 'ue',
    ue_pr: JSON.stringify({
      schema: selfDescribingEventSchema,
      data: inputJson,
    }),
    co: JSON.stringify({
      schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
      data: inputContext,
    }),
  };
  const consentEvent = buildConsentWithdrawn({ all, id, version, name, description });
  compare(tracker.track(consentEvent.event, consentEvent.context, timestamp)!, expected, t);
});
test('should track a consent granted event', (t) => {
  const id = '1234';
  const version = '2';
  const name = 'consent_form';
  const description = 'user grants consent for form';
  const timestamp = 1000000000000;
  const expiry = '01 January, 1970 00:00:00 Universal Time (UTC)';
  const inputContext = [
    {
      schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
      data: {
        id: id,
        version: version,
        name: name,
        description: description,
      },
    },
  ];
  const inputJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/consent_granted/jsonschema/1-0-0',
    data: {
      expiry: expiry,
    },
  };
  const expected = {
    e: 'ue',
    ue_pr: JSON.stringify({
      schema: selfDescribingEventSchema,
      data: inputJson,
    }),
    co: JSON.stringify({
      schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
      data: inputContext,
    }),
  };
  const consentEvent = buildConsentGranted({ id, version, name, description, expiry });
  compare(tracker.track(consentEvent.event, consentEvent.context, timestamp)!, expected, t);
});
test('should track a page view with custom context', (t) => {
  const pageUrl = 'http://www.example.com';
  const pageTitle = 'title page';
  const referrer = 'https://www.google.com';
  const inputContext = [
    {
      schema: 'iglu:com.acme/user/jsonschema/1-0-0',
      data: {
        userType: 'tester',
        userName: 'Jon',
      },
    },
  ];
  const expected = {
    e: 'pv',
    url: pageUrl,
    page: pageTitle,
    refr: referrer,
    co: JSON.stringify({
      schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
      data: inputContext,
    }),
  };
  compare(tracker.track(buildPageView({ pageUrl, pageTitle, referrer }), inputContext)!, expected, t);
});
test('should track a page view with a timestamp', (t) => {
  const timestamp = 1000000000000;
  t.is(
    tracker.track(
      buildPageView({ pageUrl: 'http://www.example.com', pageTitle: 'title', referrer: 'ref' }),
      [],
      timestamp
    )!['dtm'],
    '1000000000000'
  );
});
test('should add individual name-value pairs to the payload', (t) => {
  const tracker = trackerCore({ base64: false });
  const pageUrl = 'http://www.example.com';
  const pageTitle = 'title';
  const referrer = 'https://www.google.com';
  const expected = {
    e: 'pv',
    url: pageUrl,
    tna: 'sp',
    tv: 'js-2.0.0',
    page: pageTitle,
    refr: referrer,
  };
  tracker.addPayloadPair('tna', 'sp');
  tracker.addPayloadPair('tv', 'js-2.0.0');
  compare(tracker.track(buildPageView({ pageUrl, pageTitle, referrer }))!, expected, t);
});
test('should add a dictionary of name-value pairs to the payload', (t) => {
  const tracker = trackerCore({ base64: false });
  const pageUrl = 'http://www.example.com';
  const pageTitle = 'title';
  const referrer = 'https://www.google.com';
  const expected = {
    e: 'pv',
    url: pageUrl,
    tv: 'js-2.0.0',
    tna: 'sp',
    aid: 'sp325',
    page: pageTitle,
    refr: referrer,
  };
  tracker.addPayloadPair('tv', 'js-2.0.0');
  tracker.addPayloadDict({
    tna: 'sp',
    aid: 'sp325',
  });
  compare(tracker.track(buildPageView({ pageUrl, pageTitle, referrer }))!, expected, t);
});
test('should reset payload name-value pairs', (t) => {
  const tracker = trackerCore({ base64: false });
  const pageUrl = 'http://www.example.com';
  const pageTitle = 'title';
  const referrer = 'https://www.google.com';
  const expected = {
    e: 'pv',
    url: pageUrl,
    tna: 'sp',
    page: pageTitle,
    refr: referrer,
  };
  tracker.addPayloadPair('tna', 'mistake');
  tracker.resetPayloadPairs({ tna: 'sp' });
  compare(tracker.track(buildPageView({ pageUrl, pageTitle, referrer }))!, expected, t);
});
test('should execute a callback', (t) => {
  const tracker = trackerCore({
    base64: false,
    corePlugins: [],
    callback: function (payload) {
      const callbackTarget = payload;
      compare(callbackTarget.build(), expected, t);
    },
  });
  const pageUrl = 'http://www.example.com';
  const pageTitle = 'title';
  const referrer = 'https://www.google.com';
  const expected = {
    e: 'pv',
    url: pageUrl,
    page: pageTitle,
    refr: referrer,
  };
  tracker.track(buildPageView({ pageUrl, pageTitle, referrer }));
});
test('should use setter methods', (t) => {
  const tracker = trackerCore({ base64: false });
  tracker.setTrackerVersion('js-3.0.0');
  tracker.setTrackerNamespace('sp1');
  tracker.setAppId('my-app');
  tracker.setPlatform('web');
  tracker.setUserId('jacob');
  tracker.setScreenResolution('400', '200');
  tracker.setViewport('500', '800');
  tracker.setColorDepth('24');
  tracker.setTimezone('Europe London');
  tracker.setIpAddress('37.151.33.154');
  tracker.setUseragent('SnowplowJavascript/0.0.1');
  const pageUrl = 'http://www.example.com';
  const pageTitle = 'title page';
  const referrer = 'https://www.google.com';
  const expected = {
    e: 'pv',
    url: pageUrl,
    page: pageTitle,
    tna: 'sp1',
    tv: 'js-3.0.0',
    aid: 'my-app',
    p: 'web',
    uid: 'jacob',
    res: '400x200',
    vp: '500x800',
    cd: '24',
    tz: 'Europe London',
    ip: '37.151.33.154',
    ua: 'SnowplowJavascript/0.0.1',
    refr: referrer,
  };
  compare(tracker.track(buildPageView({ pageUrl, pageTitle, referrer }))!, expected, t);
});

test('should set true timestamp', (t) => {
  const pageUrl = 'http://www.example.com';
  const pageTitle = 'title page';
  const referrer = 'https://www.google.com';
  const result = tracker.track(buildPageView({ pageUrl, pageTitle, referrer }), undefined, {
    type: 'ttm',
    value: 1477403862,
  })!;
  t.true('ttm' in result);
  t.is(result['ttm'], '1477403862');
  t.false('dtm' in result);
});

test('should set device timestamp as ADT', (t) => {
  const inputJson = {
    schema: 'iglu:com.acme/user/jsonschema/1-0-1',
    data: {
      name: 'Eric',
    },
  };
  const result = tracker.track(buildSelfDescribingEvent({ event: inputJson }), [inputJson], {
    type: 'dtm',
    value: 1477403869,
  })!;
  t.true('dtm' in result);
  t.is(result['dtm'], '1477403869');
  t.false('ttm' in result);
});

test('should run plugin before and after track callbacks on each track event', (t) => {
  const url = 'http://www.example.com';
  const str = 'cccccckevjfiddbdjeikkdbkvvkdjcehggiutbkhnrfe';
  const num = 1;
  const arr = [str];
  const filters = {
    safeSearch: true,
    category: str,
  };
  const inputJson = {
    schema: 'iglu:com.acme/user/jsonschema/1-0-1',
    data: {
      name: str,
    },
  };
  (beforeCount = 0), (afterCount = 0);
  const fs = [
    tracker.track(
      buildPagePing({
        pageUrl: url,
        pageTitle: str,
        referrer: url,
        maxXOffset: num,
        maxYOffset: num,
        minXOffset: num,
        minYOffset: num,
      })
    ),
    tracker.track(buildPageView({ pageUrl: url, pageTitle: str, referrer: url })),
    tracker.track(buildAddToCart({ category: str, name: str, quantity: num, sku: str, unitPrice: num })),
    tracker.track(buildScreenView({ id: str, name: str })),
    tracker.track(buildSiteSearch({ filters, pageResults: num, terms: arr, totalResults: num })),
    tracker.track(buildStructEvent({ category: str, action: str })),
    tracker.track(
      buildAdConversion({
        conversionId: str,
        costModel: 'cpm',
        cost: num,
        category: str,
        action: str,
        property: str,
        initialValue: num,
        advertiserId: str,
        campaignId: str,
      })
    ),
    tracker.track(
      buildAdImpression({
        impressionId: str,
        costModel: 'cpm',
        cost: num,
        targetUrl: str,
        bannerId: str,
        zoneId: str,
        advertiserId: str,
        campaignId: str,
      })
    ),
    tracker.track(buildFormSubmission({ elements: [], formClasses: [], formId: str })),
    tracker.track(buildRemoveFromCart({ category: str, name: str, quantity: num, sku: str, unitPrice: num })),
    tracker.track(buildConsentGranted({ id: str, version: str }).event),
    tracker.track(buildConsentWithdrawn({ all: true }).event),
    tracker.track(
      buildFormFocusOrChange({
        schema: 'focus_form',
        formId: str,
        elementId: str,
        nodeName: str,
        type: str,
        elementClasses: arr,
        value: str,
      })
    ),
    tracker.track(buildSocialInteraction({ action: str, network: str, target: str })),
    tracker.track(buildSelfDescribingEvent({ event: inputJson })),
    tracker.track(buildEcommerceTransaction({ orderId: str, total: num })),
    tracker.track(
      buildEcommerceTransactionItem({ orderId: str, sku: str, name: str, category: str, price: num, quantity: num })
    ),
    tracker.track(buildLinkClick({ targetUrl: url })),
    tracker.track(
      buildAdClick({
        targetUrl: str,
        clickId: str,
        costModel: 'cpm',
        cost: num,
        bannerId: str,
        zoneId: str,
        impressionId: str,
        advertiserId: str,
        campaignId: str,
      })
    ),
  ];

  t.is(beforeCount, fs.length);
  t.is(afterCount, fs.length);
});

test('should skip events in case the plugin filter function returns false', (t) => {
  let countTracked = 0;
  const tracker = trackerCore({
    base64: false,
    corePlugins: [
      {
        filter: (payload) => {
          return payload.e !== 'pv';
        },
      },
      {
        filter: (payload) => {
          return payload.e !== 'pp';
        },
      },
      {
        afterTrack: () => {
          countTracked += 1;
        },
      },
    ],
  });

  t.falsy(
    tracker.track(
      buildPageView({
        pageUrl: 'http://www.example.com',
        pageTitle: 'title page',
        referrer: 'https://www.google.com',
      })
    )
  );

  t.falsy(
    tracker.track(
      buildPagePing({
        pageUrl: 'http://www.example.com',
        pageTitle: 'title page',
        referrer: 'https://www.google.com',
        maxXOffset: 1,
        maxYOffset: 1,
        minXOffset: 1,
        minYOffset: 1,
      })
    )
  );

  t.truthy(
    tracker.track(
      buildAddToCart({
        category: 'cat',
        name: 'name',
        quantity: 1,
        sku: 'sku',
        unitPrice: 1,
      })
    )
  );

  t.assert(countTracked === 1);
});

test('filter is passed full payload including dynamic context', (t) => {
  let countTracked = 0;
  const tracker = trackerCore({
    base64: false,
    corePlugins: [
      {
        contexts: () => {
          return [
            {
              schema: 'iglu:com.acme/user/jsonschema/1-0-0',
              data: {
                userType: 'tester',
                userName: 'Jon',
              },
            },
          ]
        },
        filter: (payload) => {
          return (payload.co as string).includes('com.acme');
        },
        afterTrack: () => {
          countTracked += 1;
        },
      },
    ],
  });

  t.truthy(
    tracker.track(
      buildPageView({
        pageUrl: 'http://www.example.com',
        pageTitle: 'title page',
        referrer: 'https://www.google.com',
      })
    )
  );

  t.assert(countTracked === 1);
});
