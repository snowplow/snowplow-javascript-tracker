# Snowplow Node Tracker

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Add Snowplow Tracking to your Node.js Application with `@snowplow/node-tracker`.  

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
npm install @snowplow/node-tracker
```

## Usage

Initialize your tracker with your desired configuration:

```js
import { newTracker } from '@snowplow/node-tracker';
const t = newTracker(
  { namespace: 'myTracker', appId: 'myApp', encodeBase64: false }, 
  { endpoint:  'collector.mydomain.net', port: 8080, bufferSize: 5 }
);
```

Then use the `track` function from this package, along with the `buildX` functions to send events to your configured emitters:

```js
import {
  buildSelfDescribingEvent,
  buildPageView
} from '@snowplow/node-tracker';

const context = [
  {
    schema: 'iglu:com.acme/user/jsonschema/1-0-0',
    data: {
      type: 'tester',
    },
  },
];

t.track(
  buildPageView({ pageUrl: 'http://www.example.com', pageTitle: 'example page', referrer: 'http://google.com' }),
  context
);

const eventJson = {
  schema: 'iglu:com.acme/viewed_product/jsonschema/1-0-0',
  data: {
    price: 20,
  },
};

t.track(buildSelfDescribingEvent({ event: eventJson }), context);
```

To enable success and failure callback debugging, run your application with `NODE_DEBUG=snowplow`.

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2022 Snowplow Analytics Ltd.

All rights reserved.

[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/node-tracker
[npm-url]: https://www.npmjs.com/package/@snowplow/node-tracker
[npm-image]: https://img.shields.io/npm/v/@snowplow/node-tracker
