# Snowplow Consent Tracking

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

<h3>⚠️ This package is deprecated, please use <a href="https://www.npmjs.com/package/@snowplow/browser-plugin-enhanced-consent">@snowplow/browser-plugin-enhanced-consent</a> instead. ⚠️</h3>

---

Browser Plugin to be used with `@snowplow/browser-tracker`.

Adds consent information to your Snowplow tracking.

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
npm install @snowplow/browser-plugin-consent
```

## Usage

Initialize your tracker with the ConsentPlugin:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { ConsentPlugin } from '@snowplow/browser-plugin-consent';

newTracker('sp1', '{{collector}}', { plugins: [ ConsentPlugin() ] }); // Also stores reference at module level
```

Then use the available functions from this package to track to all trackers which have been initialized with this plugin:

```js
import { enableGdprContext, trackConsentGranted } from '@snowplow/browser-plugin-consent';

enableGdprContext({ basisForProcessing: 'consent' });
trackConsentGranted({ id: '123-456', version: '1' });
```

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-consent
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-consent
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-consent
