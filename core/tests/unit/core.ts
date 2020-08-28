import test, { ExecutionContext } from 'ava';
import { trackerCore } from '../../src/core';
import { PayloadData, PayloadDictionary } from '../../src/payload';

const unstructEventSchema = 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0';
const tracker = trackerCore(false);
function compare(result: PayloadData, expected: PayloadDictionary, t: ExecutionContext) {
  const res = result.build();
  t.truthy(res['eid'], 'A UUID should be attached to all events');
  delete res['eid'];
  t.truthy(res['dtm'], 'A timestamp should be attached to all events');
  delete res['dtm'];
  t.deepEqual(res, expected);
}

test('should track a page view', (t) => {
  const url = 'http://www.example.com';
  const page = 'title page';
  const referer = 'https://www.google.com';
  const expected = {
    e: 'pv',
    url: url,
    page: page,
    refr: referer,
  };
  compare(tracker.trackPageView(url, page, referer), expected, t);
});
test('should track a page ping', (t) => {
  const url = 'http://www.example.com';
  const page = 'title page';
  const referer = 'http://www.google.com';
  const expected = {
    e: 'pp',
    page: page,
    url: url,
    refr: referer,
    pp_mix: '1',
    pp_max: '2',
    pp_miy: '3',
    pp_may: '4',
  };
  compare(tracker.trackPagePing(url, page, referer, 1, 2, 3, 4), expected, t);
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
  compare(tracker.trackStructEvent('cat', 'act', 'lab', 'prop', 1), expected, t);
});
test('should track an ecommerce transaction event', (t) => {
  const orderId = 'ak0008';
  const affiliation = '1234';
  const totalValue = '50';
  const taxValue = '6';
  const shipping = '0';
  const city = 'Phoenix';
  const state = 'Arizona';
  const country = 'USA';
  const currency = 'USD';
  const expected = {
    e: 'tr',
    tr_af: affiliation,
    tr_id: orderId,
    tr_tt: totalValue,
    tr_tx: taxValue,
    tr_sh: shipping,
    tr_ci: city,
    tr_st: state,
    tr_co: country,
    tr_cu: currency,
  };
  compare(
    tracker.trackEcommerceTransaction(
      orderId,
      affiliation,
      totalValue,
      taxValue,
      shipping,
      city,
      state,
      country,
      currency
    ),
    expected,
    t
  );
});
test('should track an ecommerce transaction item event', (t) => {
  const orderId = 'ak0008';
  const sku = '4q345';
  const price = '17.00';
  const quantity = '2';
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
  compare(tracker.trackEcommerceTransactionItem(orderId, sku, name, category, price, quantity, currency), expected, t);
});
test('should track an unstructured event', (t) => {
  const inputJson = {
    schema: 'iglu:com.acme/user/jsonschema/1-0-1',
    data: {
      name: 'Eric',
    },
  };
  const expected = {
    e: 'ue',
    ue_pr: JSON.stringify({
      schema: unstructEventSchema,
      data: inputJson,
    }),
  };
  compare(tracker.trackUnstructEvent(inputJson), expected, t);
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
      schema: unstructEventSchema,
      data: inputJson,
    }),
  };
  compare(tracker.trackSelfDescribingEvent(inputJson), expected, t);
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
      schema: unstructEventSchema,
      data: inputJson,
    }),
  };
  compare(tracker.trackLinkClick(targetUrl, elementId, elementClasses, elementTarget, elementContent), expected, t);
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
      schema: unstructEventSchema,
      data: inputJson,
    }),
  };
  compare(tracker.trackScreenView(name, id), expected, t);
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
      schema: unstructEventSchema,
      data: inputJson,
    }),
  };
  compare(
    tracker.trackAdImpression(impressionId, costModel, cost, targetUrl, bannerId, zoneId, advertiserId, campaignId),
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
      schema: unstructEventSchema,
      data: inputJson,
    }),
  };
  compare(
    tracker.trackAdClick(targetUrl, clickId, costModel, cost, bannerId, zoneId, impressionId, advertiserId, campaignId),
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
      schema: unstructEventSchema,
      data: inputJson,
    }),
  };
  compare(
    tracker.trackAdConversion(
      conversionId,
      costModel,
      cost,
      category,
      action,
      property,
      initialValue,
      advertiserId,
      campaignId
    ),
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
      schema: unstructEventSchema,
      data: inputJson,
    }),
  };
  compare(tracker.trackSocialInteraction(action, network, target), expected, t);
});
test('should track an add-to-cart event', (t) => {
  const sku = '4q345';
  const unitPrice = '17';
  const quantity = '2';
  const name = 'red shoes';
  const category = 'clothing';
  const currency = 'USD';
  const inputJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/add_to_cart/jsonschema/1-0-0',
    data: {
      sku: sku,
      name: name,
      category: category,
      unitPrice: unitPrice,
      quantity: quantity,
      currency: currency,
    },
  };
  const expected = {
    e: 'ue',
    ue_pr: JSON.stringify({
      schema: unstructEventSchema,
      data: inputJson,
    }),
  };
  compare(tracker.trackAddToCart(sku, name, category, unitPrice, quantity, currency), expected, t);
});
test('should track a remove-from-cart event', (t) => {
  const sku = '4q345';
  const unitPrice = '17';
  const quantity = '2';
  const name = 'red shoes';
  const category = 'clothing';
  const currency = 'USD';
  const inputJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/remove_from_cart/jsonschema/1-0-0',
    data: {
      sku: sku,
      name: name,
      category: category,
      unitPrice: unitPrice,
      quantity: quantity,
      currency: currency,
    },
  };
  const expected = {
    e: 'ue',
    ue_pr: JSON.stringify({
      schema: unstructEventSchema,
      data: inputJson,
    }),
  };
  compare(tracker.trackRemoveFromCart(sku, name, category, unitPrice, quantity, currency), expected, t);
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
      schema: unstructEventSchema,
      data: inputJson,
    }),
  };
  compare(
    tracker.trackFormFocusOrChange('focus_form', formId, elementId, nodeName, type, elementClasses, value),
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
      schema: unstructEventSchema,
      data: inputJson,
    }),
  };
  compare(
    tracker.trackFormFocusOrChange('change_form', formId, elementId, nodeName, type, elementClasses, value),
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
      schema: unstructEventSchema,
      data: inputJson,
    }),
  };
  compare(tracker.trackFormSubmission(formId, formClasses, elements), expected, t);
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
      schema: unstructEventSchema,
      data: inputJson,
    }),
  };
  compare(tracker.trackSiteSearch(terms, filters, totalResults, pageResults), expected, t);
});
test('should track a consent withdrawn event', (t) => {
  const all = false;
  const id = '1234';
  const version = '2';
  const name = 'consent_form';
  const description = 'user withdraws consent for form';
  const tstamp = 1000000000000;
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
      schema: unstructEventSchema,
      data: inputJson,
    }),
    co: JSON.stringify({
      schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
      data: inputContext,
    }),
  };
  compare(tracker.trackConsentWithdrawn(all, id, version, name, description, [], tstamp), expected, t);
});
test('should track a consent granted event', (t) => {
  const id = '1234';
  const version = '2';
  const name = 'consent_form';
  const description = 'user grants consent for form';
  const tstamp = 1000000000000;
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
      schema: unstructEventSchema,
      data: inputJson,
    }),
    co: JSON.stringify({
      schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
      data: inputContext,
    }),
  };
  compare(tracker.trackConsentGranted(id, version, name, description, expiry, [], tstamp), expected, t);
});
test('should track a page view with custom context', (t) => {
  const url = 'http://www.example.com';
  const page = 'title page';
  const referer = 'https://www.google.com';
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
    url: url,
    page: page,
    refr: referer,
    co: JSON.stringify({
      schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
      data: inputContext,
    }),
  };
  compare(tracker.trackPageView(url, page, referer, inputContext), expected, t);
});
test('should track a page view with a timestamp', (t) => {
  const tstamp = 1000000000000;
  t.is(tracker.trackPageView('http://www.example.com', 'title', 'ref', [], tstamp).build()['dtm'], '1000000000000');
});
test('should add individual name-value pairs to the payload', (t) => {
  const tracker = trackerCore(false);
  const url = 'http://www.example.com';
  const page = 'title';
  const referer = 'https://www.google.com';
  const expected = {
    e: 'pv',
    url: url,
    tna: 'cf',
    tv: 'js-2.0.0',
    page: page,
    refr: referer,
  };
  tracker.addPayloadPair('tna', 'cf');
  tracker.addPayloadPair('tv', 'js-2.0.0');
  compare(tracker.trackPageView(url, page, referer), expected, t);
});
test('should add a dictionary of name-value pairs to the payload', (t) => {
  const tracker = trackerCore(false);
  const url = 'http://www.example.com';
  const page = 'title';
  const referer = 'https://www.google.com';
  const expected = {
    e: 'pv',
    url: url,
    tv: 'js-2.0.0',
    tna: 'cf',
    aid: 'cf325',
    page: page,
    refr: referer,
  };
  tracker.addPayloadPair('tv', 'js-2.0.0');
  tracker.addPayloadDict({
    tna: 'cf',
    aid: 'cf325',
  });
  compare(tracker.trackPageView(url, page, referer), expected, t);
});
test('should reset payload name-value pairs', (t) => {
  const tracker = trackerCore(false);
  const url = 'http://www.example.com';
  const page = 'title';
  const referer = 'https://www.google.com';
  const expected = {
    e: 'pv',
    url: url,
    tna: 'cf',
    page: page,
    refr: referer,
  };
  tracker.addPayloadPair('tna', 'mistake');
  tracker.resetPayloadPairs({ tna: 'cf' });
  compare(tracker.trackPageView(url, page, referer), expected, t);
});
test('should execute a callback', (t) => {
  const tracker = trackerCore(false, function (payload) {
    const callbackTarget = payload;
    compare(callbackTarget, expected, t);
  });
  const url = 'http://www.example.com';
  const page = 'title';
  const referer = 'https://www.google.com';
  const expected = {
    e: 'pv',
    url: url,
    page: page,
    refr: referer,
  };
  tracker.trackPageView(url, page, referer);
});
test('should use setter methods', (t) => {
  const tracker = trackerCore(false);
  tracker.setTrackerVersion('js-3.0.0');
  tracker.setTrackerNamespace('cf1');
  tracker.setAppId('my-app');
  tracker.setPlatform('web');
  tracker.setUserId('jacob');
  tracker.setScreenResolution('400', '200');
  tracker.setViewport('500', '800');
  tracker.setColorDepth('24');
  tracker.setTimezone('Europe London');
  tracker.setIpAddress('37.151.33.154');
  tracker.setUseragent('SnowplowJavascript/0.0.1');
  const url = 'http://www.example.com';
  const page = 'title page';
  const referer = 'https://www.google.com';
  const expected = {
    e: 'pv',
    url: url,
    page: page,
    tna: 'cf1',
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
    refr: referer,
  };
  compare(tracker.trackPageView(url, page, referer), expected, t);
});

test('should set true timestamp', (t) => {
  const url = 'http://www.example.com';
  const page = 'title page';
  const referer = 'https://www.google.com';
  const result = tracker.trackPageView(url, page, referer, undefined, { type: 'ttm', value: 1477403862 }).build();
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
  const result = tracker.trackSelfDescribingEvent(inputJson, [inputJson], { type: 'dtm', value: 1477403869 }).build();
  t.true('dtm' in result);
  t.is(result['dtm'], '1477403869');
  t.false('ttm' in result);
});

test('should run callback on each track event', (t) => {
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
  let count = 0;
  const afterTrack = () => (count += 1);
  const fs = [
    tracker.trackPagePing(url, str, url, num, num, num, num, undefined, undefined, afterTrack),
    tracker.trackPageView(url, str, str, undefined, undefined, afterTrack),
    tracker.trackAddToCart(str, str, str, str, str, str, undefined, undefined, afterTrack),
    tracker.trackScreenView(str, str, undefined, undefined, afterTrack),
    tracker.trackSiteSearch(arr, filters, num, num, undefined, undefined, afterTrack),
    tracker.trackStructEvent(str, str, str, str, num, undefined, undefined, afterTrack),
    tracker.trackAdConversion(str, str, num, str, str, str, num, str, str, undefined, undefined, afterTrack),
    tracker.trackAdImpression(str, str, num, url, str, str, str, str, undefined, undefined, afterTrack),
    tracker.trackConsentGranted(str, str, str, undefined, undefined, undefined, undefined, afterTrack),
    tracker.trackFormSubmission(str, [], [], undefined, undefined, afterTrack),
    tracker.trackRemoveFromCart(str, str, str, str, str, str, undefined, undefined, afterTrack),
    tracker.trackConsentWithdrawn(false, undefined, undefined, undefined, undefined, undefined, undefined, afterTrack),
    tracker.trackFormFocusOrChange(str, str, str, str, str, arr, str, undefined, undefined, afterTrack),
    tracker.trackSocialInteraction(str, str, str, undefined, undefined, afterTrack),
    tracker.trackSelfDescribingEvent(inputJson, undefined, undefined, afterTrack),
    tracker.trackEcommerceTransaction(str, str, str, str, str, str, str, str, str, undefined, undefined, afterTrack),
    tracker.trackEcommerceTransactionItem(str, str, str, str, str, str, str, undefined, undefined, afterTrack),
    tracker.trackLinkClick(url, str, arr, str, str, undefined, undefined, afterTrack),
    tracker.trackAdClick(url, str, str, num, str, str, str, str, str, undefined, undefined, afterTrack),
  ];

  t.is(count, fs.length);
});
