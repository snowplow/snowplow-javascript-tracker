# Snowplow vimeo-tracking Plugin

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Browser Plugin to be used with `@snowplow/browser-tracker`.

This plugin enables automatic tracking of Vimeo videos, utilizing the [Snowplow Media Plugin](https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/browser-tracker/browser-tracker-v3-reference/plugins/media-tracking/)

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
npm install @snowplow/browser-plugin-vimeo-tracking
```

## Usage

Initialize your tracker with the Vimeo tracking plugin:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { VimeoTrackingPlujgin } from '@snowplow/browser-plugin-vimeo-tracking';

newTracker('sp1', '{{collector_url}}', { 
   appId: 'my-app-id', 
   plugins: [ VimeoTrackingPlugin() ],
});
```

For a full API reference, you can read the plugin [documentation page](https://docs.snowplow.io/docs/collecting-data/collecting-from-own-applications/javascript-trackers/browser-tracker/browser-tracker-v3-reference/plugins/vimeo-tracking/).

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2023 Snowplow Analytics Ltd.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-vimeo-tracking
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-vimeo-tracking
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-vimeo-tracking
