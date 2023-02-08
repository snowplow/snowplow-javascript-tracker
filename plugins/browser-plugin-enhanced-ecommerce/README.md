# Snowplow Enhanced Ecommerce Tracking

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

<h3>⚠️ This package is deprecated, please use <a href="https://www.npmjs.com/package/@snowplow/browser-plugin-snowplow-ecommerce">@snowplow/browser-plugin-snowplow-ecommerce</a> instead. ⚠️</h3>

---

Browser Plugin to be used with `@snowplow/browser-tracker`.

Adds enhanced ecommerce events to your Snowplow tracking.

## Maintainer quick start

Part of the Snowplow JavaScript Tracker monorepo.  
Build with [Node.js](https://nodejs.org/en/) (18 - 20) and [Rush](https://rushjs.io/).

### Setup repository

```bash
npm install -g @microsoft/rush 
git clone https://github.com/snowplow/snowplow-javascript-tracker.git
rush update
```

## Package Installation

With npm:

```bash
npm install @snowplow/browser-plugin-enhanced-ecommerce
```

## Usage

Initialize your tracker with the EnhancedEcommercePlugin:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { EnhancedEcommercePlugin } from '@snowplow/browser-plugin-enhanced-ecommerce';

newTracker('sp1', '{{collector}}', { plugins: [ EnhancedEcommercePlugin() ] }); // Also stores reference at module level
```

Then use the available functions from this package to track to all trackers which have been initialized with this plugin:

```js
import { addEnhancedEcommerceProductContext, addEnhancedEcommercePromoContext, trackEnhancedEcommerceAction } from '@snowplow/browser-plugin-enhanced-ecommerce';

addEnhancedEcommerceProductContext({
  id: 'P12345',
  name: 'Blue T-Shirt',
  list: 'Search Results',
  brand: 'The T-Shirt Company',
  category: 'Apparel/T-Shirts',
  variant: 'Black',
  quantity: 1,
});

addEnhancedEcommercePromoContext({
  id: 'PROMO_1234',
  name: 'Summer Sale',
  creative: 'summer_banner2',
  position: 'banner_slot1',
});

trackEnhancedEcommerceAction({ action: 'purchase' });

```

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-enhanced-ecommerce
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-enhanced-ecommerce
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-enhanced-ecommerce
