# Snowplow Site Tracking

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Browser Plugin to be used with `@snowplow/browser-tracker`.

Adds site tracking based events to your Snowplow tracking.

## Maintainer quick start

Part of the Snowplow JavaScript Tracker monorepo.  
Build with [Node.js](https://nodejs.org/en/) (12 LTS or 14 LTS) and [Rush](https://rushjs.io/).

### Setup repository

```bash
npm install -g @microsoft/rush 
git clone https://github.com/snowplow/snowplow-javascript-tracker.git
rush update
```

## Package Installation

With npm:

```bash
npm install @snowplow/browser-plugin-site-tracking
```

## Usage

Initialize your tracker with the SiteTrackingPlugin:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { SiteTrackingPlugin } from '@snowplow/browser-plugin-site-tracking';

newTracker('sp1', '{{collector}}', { plugins: [ SiteTrackingPlugin() ] }); // Also stores reference at module level
```

Then use the `trackX` functions from this package to track to all trackers which have been initialized with this plugin:

```js
import { trackSocialInteraction, trackSiteSearch, trackTiming } from '@snowplow/browser-plugin-site-tracking';

trackSocialInteraction({
  action: 'retweet',
  network: 'twitter',
  target: '1234',
});

trackSiteSearch({
  terms: ['unified', 'log'],
  filters: { category: 'books', 'sub-category': 'non-fiction' },
  totalResults: 14,
  pageResults: 8,
});

trackTiming({
  category: 'load',
  variable: 'map_loaded',
  timing: 50,
  label: 'Map loading time',
});
```

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-ad-tracking
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-ad-tracking
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-ad-tracking
