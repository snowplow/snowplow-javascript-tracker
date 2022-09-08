# Snowplow Browser Tracker

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Add Snowplow Tracking to your Web Application with `@snowplow/browser-tracker`.  

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
npm install @snowplow/browser-tracker
```

## Usage

Initialize your tracker with your desired configuration and optional plugins:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { SiteTrackingPlugin } from '@snowplow/browser-plugin-site-tracking';
import { PerformanceTimingPlugin } from '@snowplow/browser-plugin-performance-timing';
import { ClientHintsPlugin } from '@snowplow/browser-plugin-client-hints';
import { FormTrackingPlugin, enableFormTracking } from '@snowplow/browser-plugin-form-tracking';

newTracker('sp1', '{{collector}}', { plugins: [ PerformanceTimingPlugin(), SiteTrackingPlugin(), ClientHintsPlugin(), FormTrackingPlugin() ] }); // Also stores reference at module level
newTracker('sp2', '{{collector}}', { plugins: [ PerformanceTimingPlugin(), SiteTrackingPlugin() ] }); // You can have multiple trackers with different configs!

enableFormTracking() // Switch on form tracking

```

Then use the `trackX` functions from this package and your plugins to track to all trackers which have been initialized, or select just some trackers:

```js
import { trackPageView } from '@snowplow/browser-tracker';
import { trackSocialInteraction } from '@snowplow/browser-plugin-site-tracking';

trackPageView({}, ['sp1']); // Just to `sp1`

// OR to all trackers with some extra context!
trackPageView({
  title: 'My Title',
  context: [
    {
      schema: 'iglu:org.schema/WebPage/jsonschema/1-0-0',
      data: {
        keywords: ['tester'],
      },
    },
  ],
});

// Use your plugin track methods too
trackSocialInteraction({
  action: 'retweet',
  network: 'twitter',
  target: '1234',
});


```

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-tracker
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-tracker
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-tracker
