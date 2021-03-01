/*
 * Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang
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

import { BrowserPlugin, BrowserTracker, parseAndValidateFloat, parseAndValidateInt } from '@snowplow/browser-core';
import { SelfDescribingJson, Timestamp } from '@snowplow/tracker-core';

const _trackers: Record<string, [BrowserTracker, Array<SelfDescribingJson>]> = {};

export function EnhancedEcommercePlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker) => {
      _trackers[tracker.id] = [tracker, []];
    },
  };
}

/**
 * Track a GA Enhanced Ecommerce Action with all stored
 * Enhanced Ecommerce contexts
 *
 * @param string action
 * @param array context Optional. Context relating to the event.
 * @param tstamp Opinal number or Timestamp object
 */
export function trackEnhancedEcommerceAction(
  {
    action,
    context,
    tstamp,
  }: { action?: string; context?: Array<SelfDescribingJson> | null; tstamp?: Timestamp | null } = {},
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      const combinedContexts = _trackers[t][1].concat(context || []);
      _trackers[t][1].length = 0;

      _trackers[t][0].core.trackSelfDescribingEvent(
        {
          schema: 'iglu:com.google.analytics.enhanced-ecommerce/action/jsonschema/1-0-0',
          data: {
            action: action,
          },
        },
        combinedContexts,
        tstamp
      );
    }
  });
}

/**
 * Adds a GA Enhanced Ecommerce Action Context
 *
 * @param string id
 * @param string affiliation
 * @param number revenue
 * @param number tax
 * @param number shipping
 * @param string coupon
 * @param string list
 * @param integer step
 * @param string option
 * @param string currency
 */
export function addEnhancedEcommerceActionContext(
  {
    id,
    affiliation,
    revenue,
    tax,
    shipping,
    coupon,
    list,
    step,
    option,
    currency,
  }: {
    id?: string;
    affiliation?: string;
    revenue?: string;
    tax?: number;
    shipping?: number;
    coupon?: string;
    list?: string;
    step?: number;
    option?: string;
    currency?: string;
  } = {},
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t][1].push({
        schema: 'iglu:com.google.analytics.enhanced-ecommerce/actionFieldObject/jsonschema/1-0-0',
        data: {
          id: id,
          affiliation: affiliation,
          revenue: parseAndValidateFloat(revenue),
          tax: parseAndValidateFloat(tax),
          shipping: parseAndValidateFloat(shipping),
          coupon: coupon,
          list: list,
          step: parseAndValidateInt(step),
          option: option,
          currency: currency,
        },
      });
    }
  });
}

/**
 * Adds a GA Enhanced Ecommerce Impression Context
 *
 * @param string id
 * @param string name
 * @param string list
 * @param string brand
 * @param string category
 * @param string variant
 * @param integer position
 * @param number price
 * @param string currency
 */
export function addEnhancedEcommerceImpressionContext(
  {
    id,
    name,
    list,
    brand,
    category,
    variant,
    position,
    price,
    currency,
  }: {
    id?: string;
    name?: string;
    list?: string;
    brand?: string;
    category?: string;
    variant?: string;
    position?: number;
    price?: string;
    currency?: string;
  } = {},
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t][1].push({
        schema: 'iglu:com.google.analytics.enhanced-ecommerce/impressionFieldObject/jsonschema/1-0-0',
        data: {
          id: id,
          name: name,
          list: list,
          brand: brand,
          category: category,
          variant: variant,
          position: parseAndValidateInt(position),
          price: parseAndValidateFloat(price),
          currency: currency,
        },
      });
    }
  });
}
/**
 * Adds a GA Enhanced Ecommerce Product Context
 *
 * @param string id
 * @param string name
 * @param string list
 * @param string brand
 * @param string category
 * @param string variant
 * @param number price
 * @param integer quantity
 * @param string coupon
 * @param integer position
 * @param string currency
 */
export function addEnhancedEcommerceProductContext(
  {
    id,
    name,
    list,
    brand,
    category,
    variant,
    price,
    quantity,
    coupon,
    position,
    currency,
  }: {
    id?: string;
    name?: string;
    list?: string;
    brand?: string;
    category?: string;
    variant?: string;
    price?: number;
    quantity?: number;
    coupon?: string;
    position?: number;
    currency?: string;
  } = {},
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t][1].push({
        schema: 'iglu:com.google.analytics.enhanced-ecommerce/productFieldObject/jsonschema/1-0-0',
        data: {
          id: id,
          name: name,
          list: list,
          brand: brand,
          category: category,
          variant: variant,
          price: parseAndValidateFloat(price),
          quantity: parseAndValidateInt(quantity),
          coupon: coupon,
          position: parseAndValidateInt(position),
          currency: currency,
        },
      });
    }
  });
}

/**
 * Adds a GA Enhanced Ecommerce Promo Context
 *
 * @param string id
 * @param string name
 * @param string creative
 * @param string position
 * @param string currency
 */
export function addEnhancedEcommercePromoContext(
  {
    id,
    name,
    creative,
    position,
    currency,
  }: { id?: string; name?: string; creative?: string; position?: string; currency?: string } = {},
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t][1].push({
        schema: 'iglu:com.google.analytics.enhanced-ecommerce/promoFieldObject/jsonschema/1-0-0',
        data: {
          id: id,
          name: name,
          creative: creative,
          position: position,
          currency: currency,
        },
      });
    }
  });
}
