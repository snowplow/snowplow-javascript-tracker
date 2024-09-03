# Snowplow Ecommerce Plugin

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Browser Plugin to be used with `@snowplow/browser-tracker`.

This plugin is the recommended way to track ecommerce events on your store. Functions, usage and a complete setup journey is showcased on the [E-commerce Web Accelerator](https://docs.snowplow.io/accelerators/ecommerce/).

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
npm install @snowplow/browser-plugin-snowplow-ecommerce
```

## Usage

Initialize your tracker with the SnowplowEcommercePlugin:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { SnowplowEcommercePlugin } from '@snowplow/browser-plugin-snowplow-ecommerce';

newTracker('sp1', '{{collector_url}}', { 
   appId: 'my-app-id', 
   plugins: [ SnowplowEcommercePlugin() ],
});
```

For a full API reference, you can read the plugin [documentation page](https://docs.snowplow.io/docs/collecting-data/collecting-from-own-applications/javascript-trackers/browser-tracker/browser-tracker-v3-reference/plugins/snowplow-ecommerce/).

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2022 Snowplow Analytics Ltd.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-snowplow-ecommerce
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-snowplow-ecommerce
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-snowplow-ecommerce
