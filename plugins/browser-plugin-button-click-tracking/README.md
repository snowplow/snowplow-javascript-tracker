# Snowplow Button Click Tracking

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Browser Plugin to be used with `@snowplow/browser-tracker`.

Adds button click tracking events to your Snowplow tracking.

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
npm install @snowplow/browser-plugin-button-click-tracking
```

## Usage

Initialize your tracker with the ButtonClickTrackingPlugin:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { ButtonClickTrackingPlugin } from '@snowplow/browser-plugin-button-click-tracking';

newTracker('sp1', '{{collector}}', { plugins: [ ButtonClickTrackingPlugin() ] }); // Also stores reference at module level
```

Then use the available functions from this package to track to all trackers which have been initialized with this plugin:

```js
import { enableButtonClickTracking } from '@snowplow/browser-plugin-button-click-tracking';

enableButtonClickTracking({ filter: { .. }, context: { .. } });
```

For a full API reference, you can read the plugin [documentation page](https://docs.snowplow.io/docs/collecting-data/collecting-from-own-applications/javascript-trackers/browser-tracker/browser-tracker-v3-reference/plugins/button-click-tracking/).

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2023 Snowplow Analytics Ltd, 2010 Anthon Pang.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-form-tracking
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-form-tracking
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-form-tracking
