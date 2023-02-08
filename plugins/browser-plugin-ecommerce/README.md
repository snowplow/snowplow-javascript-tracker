# Snowplow Ecommerce Tracking

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

<h3>⚠️ This package is deprecated, please use <a href="https://www.npmjs.com/package/@snowplow/browser-plugin-snowplow-ecommerce">@snowplow/browser-plugin-snowplow-ecommerce</a> instead. ⚠️</h3>

---

Browser Plugin to be used with `@snowplow/browser-tracker`.

Adds ecommerce events to your Snowplow tracking.

## Maintainer quick start

Part of the Snowplow JavaScript Tracker monorepo.  
Build with [Node.js](https://nodejs.org/en/) (14 or 16) and [Rush](https://rushjs.io/).

### Setup repository

```bash
npm install -g @microsoft/rush 
git clone https://github.com/snowplow/snowplow-javascript-tracker.git
rush update
```

## Package Installation

With npm:

```bash
npm install @snowplow/browser-plugin-ecommerce
```

## Usage

Initialize your tracker with the EcommercePlugin:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { EcommercePlugin } from '@snowplow/browser-plugin-ecommerce';

newTracker('sp1', '{{collector}}', { plugins: [ EcommercePlugin() ] }); // Also stores reference at module level
```

Then use the available functions from this package to track to all trackers which have been initialized with this plugin:

```js
import { addTrans, addItem, trackTrans, trackAddToCart } from '@snowplow/browser-plugin-ecommerce';

trackAddToCart({
  sku: '000345',
  name: 'blue tie',
  category: 'clothing',
  unitPrice: 3.49,
  quantity: 2,
  currency: 'GBP',
});

// Grouped, events are sent on `trackTrans()` call
addTrans({
  orderId: 'order-123',
  total: 8000,
  affiliation: 'acme',
  tax: 100,
  shipping: 50,
  city: 'pheonix',
  state: 'arizona',
  country: 'USA',
  currency: 'JPY',
});
addItem({
  orderId: 'order-123',
  sku: '1001',
  name: 'Blue t-shirt',
  category: 'clothing',
  price: '2000',
  quantity: '2',
  currency: 'JPY',
});
trackTrans();
```

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-ecommerce
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-ecommerce
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-ecommerce
