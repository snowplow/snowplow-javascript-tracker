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

import { BrowserPlugin, BrowserTracker } from '@snowplow/browser-core';
import { SelfDescribingJson, Timestamp } from '@snowplow/tracker-core';

interface Transaction {
  transaction?: {
    orderId: string;
    total: number;
    affiliation?: string;
    tax?: number;
    shipping?: number;
    city?: string;
    state?: string;
    country?: string;
    currency?: string;
    context?: Array<SelfDescribingJson>;
    tstamp?: Timestamp;
  };
  items: Array<{
    orderId: string;
    sku: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    currency: string;
    context: Array<SelfDescribingJson>;
    tstamp: Timestamp;
  }>;
}

const _trackers: Record<string, [BrowserTracker, Transaction]> = {};

export function EcommercePlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker) => {
      _trackers[tracker.id] = [tracker, ecommerceTransactionTemplate()];
    },
  };
}

/**
 * Track an ecommerce transaction
 *
 * @param string orderId Required. Internal unique order id number for this transaction.
 * @param string total Required. Total amount of the transaction.
 * @param string affiliation Optional. Partner or store affiliation.
 * @param string tax Optional. Tax amount of the transaction.
 * @param string shipping Optional. Shipping charge for the transaction.
 * @param string city Optional. City to associate with transaction.
 * @param string state Optional. State to associate with transaction.
 * @param string country Optional. Country to associate with transaction.
 * @param string currency Optional. Currency to associate with this transaction.
 * @param object context Optional. Context relating to the event.
 * @param tstamp number or Timestamp object
 */
export function addTrans(
  {
    orderId,
    total,
    affiliation,
    tax,
    shipping,
    city,
    state,
    country,
    currency,
    context,
    tstamp,
  }: {
    orderId: string;
    total: number;
    affiliation?: string;
    tax?: number;
    shipping?: number;
    city?: string;
    state?: string;
    country?: string;
    currency?: string;
    context?: Array<SelfDescribingJson>;
    tstamp?: Timestamp;
  },
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t][1].transaction = {
        orderId: orderId,
        total: total,
        affiliation: affiliation,
        tax: tax,
        shipping: shipping,
        city: city,
        state: state,
        country: country,
        currency: currency,
        context: context,
        tstamp: tstamp,
      };
    }
  });
}

/**
 * Track an ecommerce transaction item
 *
 * @param string orderId Required Order ID of the transaction to associate with item.
 * @param string sku Required. Item's SKU code.
 * @param string name Optional. Product name.
 * @param string category Optional. Product category.
 * @param string price Required. Product price.
 * @param string quantity Required. Purchase quantity.
 * @param string currency Optional. Product price currency.
 * @param object context Optional. Context relating to the event.
 * @param tstamp number or Timestamp object
 */
export function addItem(
  {
    orderId,
    sku,
    name,
    category,
    price,
    quantity,
    currency,
    context,
    tstamp,
  }: {
    orderId: string;
    sku: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    currency: string;
    context: Array<SelfDescribingJson>;
    tstamp: Timestamp;
  },
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t][1].items.push({
        orderId: orderId,
        sku: sku,
        name: name,
        category: category,
        price: price,
        quantity: quantity,
        currency: currency,
        context: context,
        tstamp: tstamp,
      });
    }
  });
}

/**
 * Commit the ecommerce transaction
 *
 * This call will send the data specified with addTrans,
 * addItem methods to the tracking server.
 */
export function trackTrans(trackers: Array<string> = Object.keys(_trackers)) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      const transaction = _trackers[t][1].transaction;
      if (transaction) {
        _trackers[t][0].core.trackEcommerceTransaction(
          transaction.orderId,
          transaction.total,
          transaction.affiliation,
          transaction.tax,
          transaction.shipping,
          transaction.city,
          transaction.state,
          transaction.country,
          transaction.currency,
          transaction.context,
          transaction.tstamp
        );
      }
      for (var i = 0; i < _trackers[t][1].items.length; i++) {
        var item = _trackers[t][1].items[i];
        _trackers[t][0].core.trackEcommerceTransactionItem(
          item.orderId,
          item.sku,
          item.name,
          item.category,
          item.price,
          item.quantity,
          item.currency,
          item.context,
          item.tstamp
        );
      }

      _trackers[t][1] = ecommerceTransactionTemplate();
    }
  });
}

function ecommerceTransactionTemplate(): Transaction {
  return {
    items: [],
  };
}
