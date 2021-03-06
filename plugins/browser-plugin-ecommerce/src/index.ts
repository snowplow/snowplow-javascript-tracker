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

import { BrowserPlugin, BrowserTracker } from '@snowplow/browser-tracker-core';
import {
  AddToCartEvent,
  RemoveFromCartEvent,
  buildAddToCart,
  buildEcommerceTransaction,
  buildEcommerceTransactionItem,
  buildRemoveFromCart,
  CommonEventProperties,
  EcommerceTransactionEvent,
  EcommerceTransactionItemEvent,
} from '@snowplow/tracker-core';

interface Transaction {
  transaction?: EcommerceTransactionEvent & CommonEventProperties;
  items: Array<EcommerceTransactionItemEvent & CommonEventProperties>;
}

function ecommerceTransactionTemplate(): Transaction {
  return {
    items: [],
  };
}

const _trackers: Record<string, [BrowserTracker, Transaction]> = {};

/**
 * Adds ecommerce and cart tracking
 */
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
 * @param event The event information
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function addTrans(
  event: EcommerceTransactionEvent & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t][1].transaction = event;
    }
  });
}

/**
 * Track an ecommerce transaction item
 *
 * @param event The event information
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function addItem(
  event: EcommerceTransactionItemEvent & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t][1].items.push(event);
    }
  });
}

/**
 * Commit the ecommerce transaction
 *
 * @remark
 * This call will send the data specified with addTrans, ddItem methods to the tracking server.
 */
export function trackTrans(trackers: Array<string> = Object.keys(_trackers)) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      const transaction = _trackers[t][1].transaction;
      if (transaction) {
        _trackers[t][0].core.track(buildEcommerceTransaction(transaction), transaction.context, transaction.timestamp);
      }
      for (var i = 0; i < _trackers[t][1].items.length; i++) {
        const item = _trackers[t][1].items[i];
        _trackers[t][0].core.track(buildEcommerceTransactionItem(item), item.context, item.timestamp);
      }

      _trackers[t][1] = ecommerceTransactionTemplate();
    }
  });
}

/**
 * Track an add-to-cart event
 *
 * @param event The event information
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackAddToCart(
  event: AddToCartEvent & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t][0].core.track(buildAddToCart(event), event.context, event.timestamp);
    }
  });
}

/**
 * Track a remove-from-cart event
 *
 * @param event The event information
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackRemoveFromCart(
  event: RemoveFromCartEvent & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t][0].core.track(buildRemoveFromCart(event), event.context, event.timestamp);
    }
  });
}
