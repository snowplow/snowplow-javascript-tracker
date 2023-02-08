# Snowplow Browser Feature Tracking

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

<h3>⚠️ This package is deprecated ⚠️</h3>

---

Browser Plugin to be used with `@snowplow/browser-tracker`.

Adds Browser Features to your Snowplow tracking. Identifies available MIME Types.

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
npm install @snowplow/browser-plugin-browser-features
```

## Usage

Initialize your tracker with the BrowserFeaturesPlugin:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { BrowserFeaturesPlugin } from '@snowplow/browser-plugin-browser-features';

newTracker('sp1', '{{collector}}', { plugins: [ BrowserFeaturesPlugin() ] }); // Also stores reference at module level
```

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-browser-features
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-browser-features
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-browser-features
