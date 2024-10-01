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

import {
  BrowserPlugin,
  BrowserTracker,
  parseAndValidateFloat,
  parseAndValidateInt,
  dispatchToTrackersInCollection,
} from '@snowplow/browser-tracker-core';
import { buildSelfDescribingEvent, CommonEventProperties, SelfDescribingJson } from '@snowplow/tracker-core';

const _trackers: Record<string, BrowserTracker> = {};
const _context: Record<string, Array<SelfDescribingJson>> = {};

/**
 * For tracking GA Enhanced Ecommerce events and contexts
 * {@link https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce}
 *
 * @deprecated Use @snowplow/browser-plugin-snowplow-ecommerce instead
 */
export function EnhancedEcommercePlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker) => {
      _trackers[tracker.id] = tracker;
      _context[tracker.id] = [];
    },
  };
}

/**
 * An Enhanced Ecommerce Action
 * Used when tracking an GA Enhanced Ecommerce Action with all stored Enhanced Ecommerce contexts
 */
export interface EnhancedEcommerceAction {
  /** Actions specify how to interpret product and promotion data */
  action?: string;
}

/**
 * Track a GA Enhanced Ecommerce Action with all stored
 * Enhanced Ecommerce contexts
 *
 * @param event
 * @param trackers
 */
export function trackEnhancedEcommerceAction(
  event: EnhancedEcommerceAction & CommonEventProperties = {},
  trackers: Array<string> = Object.keys(_trackers)
) {
  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    const combinedContexts = _context[t.id].concat(event.context || []);
    _context[t.id].length = 0;

    t.core.track(
      buildSelfDescribingEvent({
        event: {
          schema: 'iglu:com.google.analytics.enhanced-ecommerce/action/jsonschema/1-0-0',
          data: {
            action: event.action,
          },
        },
      }),
      combinedContexts,
      event.timestamp
    );
  });
}

/**
 * The Action Context
 * Represents information about an ecommerce related action that has taken place.
 */
export interface EnhanacedCommerceActionContext {
  /** The transaction id */
  id?: string;
  /** The store of affiliation from which this transaction occured */
  affiliation?: string;
  /** Specifies the total revenue or grand total associated with the transaction */
  revenue?: string;
  /** The total tax associated with the transaction. */
  tax?: number;
  /** The shipping cost associated with the transaction. */
  shipping?: number;
  /** The transaction coupon redeemed with the transaction. */
  coupon?: string;
  /** The list that the associated products belong to. */
  list?: string;
  /**	A number representing a step in the checkout process. Optional on `checkout` actions.  */
  step?: number;
  /** Additional field for checkout and checkout_option actions that can describe option information on the checkout page, like selected payment method. */
  option?: string;
  /** The currency of the transactoin */
  currency?: string;
}

/**
 * Adds a GA Enhanced Ecommerce Action Context
 *
 * @param context - The context to be stored
 * @param trackers - The tracker identifiers which the context will be stored against
 */
export function addEnhancedEcommerceActionContext(
  context: EnhanacedCommerceActionContext = {},
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { id, affiliation, revenue, tax, shipping, coupon, list, step, option, currency } = context;
  trackers.forEach((trackerId) => {
    if (_context[trackerId]) {
      _context[trackerId].push({
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
 * An enhanced ecommerce impression context
 */
export interface EnhancedEcommerceImpressionContext {
  /** The product ID or SKU */
  id?: string;
  /** The name of the product */
  name?: string;
  /** The list or collection to which the product belongs */
  list?: string;
  /** The brand associated with the product */
  brand?: string;
  /** The category to which the product belongs */
  category?: string;
  /** The variant of the product */
  variant?: string;
  /** The product's position in a list or collection */
  position?: number;
  /** The price of a product  */
  price?: string;
  /** The currency of a product  */
  currency?: string;
}

/**
 * Adds a GA Enhanced Ecommerce Impression Context
 *
 * @param context - The context to be stored
 * @param trackers - The tracker identifiers which the context will be stored against
 */
export function addEnhancedEcommerceImpressionContext(
  context: EnhancedEcommerceImpressionContext = {},
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { id, name, list, brand, category, variant, position, price, currency } = context;
  trackers.forEach((trackerId) => {
    if (_context[trackerId]) {
      _context[trackerId].push({
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
 * An enhanced ecommerce product context
 */
export interface EnhancedEcommerceProductContext {
  /** The product ID or SKU */
  id?: string;
  /** The name of the product */
  name?: string;
  /** The list or collection to which the product belongs */
  list?: string;
  /** The brand associated with the product */
  brand?: string;
  /** The category to which the product belongs  */
  category?: string;
  /** The variant of the product */
  variant?: string;
  /** The price of a product */
  price?: number;
  /** The quantity of a product */
  quantity?: number;
  /** The coupon code associated with a product */
  coupon?: string;
  /** The product's position in a list or collection */
  position?: number;
  /** The currency of the product */
  currency?: string;
}

/**
 * Adds a GA Enhanced Ecommerce Product Context
 *
 * @param context - The context to be stored
 * @param trackers - The tracker identifiers which the context will be stored against
 */
export function addEnhancedEcommerceProductContext(
  context: EnhancedEcommerceProductContext = {},
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { id, name, list, brand, category, variant, price, quantity, coupon, position, currency } = context;
  trackers.forEach((trackerId) => {
    if (_context[trackerId]) {
      _context[trackerId].push({
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
 * An enhanced ecommerce promo context
 */
export interface EnhancedEcommercePromoContext {
  /** The promotion ID */
  id?: string;
  /** The name of the promotion */
  name?: string;
  /** The creative associated with the promotion */
  creative?: string;
  /** The position of the creative */
  position?: string;
  /** The currency of the product */
  currency?: string;
}

/**
 * Adds a GA Enhanced Ecommerce Promo Context
 *
 * @param context - The context to be stored
 * @param trackers - The tracker identifiers which the context will be stored against
 */
export function addEnhancedEcommercePromoContext(
  context: EnhancedEcommercePromoContext = {},
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { id, name, creative, position, currency } = context;
  trackers.forEach((trackerId) => {
    if (_context[trackerId]) {
      _context[trackerId].push({
        schema: 'iglu:com.google.analytics.enhanced-ecommerce/promoFieldObject/jsonschema/1-0-0',
        data: {
          id,
          name,
          creative,
          position,
          currency,
        },
      });
    }
  });
}
