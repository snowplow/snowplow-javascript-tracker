# Snowplow React Native Tracker

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Add Snowplow Tracking to your React Native Application with `@snowplow/react-native-tracker`.

## Package Installation

With npm:

```bash
npm install @snowplow/react-native-tracker
```

## Usage

Initialize your tracker with your desired configuration:

```js
import { newTracker } from '@snowplow/react-native-tracker';
const t = newTracker({
  namespace: 'myTracker',
  appId: 'myApp',
  endpoint: 'http://0.0.0.0:9090'
});
```

Then use the `track` function from this package, along with the `buildX` functions to send events to your configured emitters:

```js
const context = [
  {
    schema: 'iglu:com.acme/user/jsonschema/1-0-0',
    data: {
      type: 'tester',
    },
  },
];

t.trackScreenViewEvent({ name: 'myScreenName' });

t.trackPageView(
  { pageUrl: 'http://www.example.com', pageTitle: 'example page' },
  context
);

const eventJson = {
  schema: 'iglu:com.acme/viewed_product/jsonschema/1-0-0',
  data: {
    price: 20,
  },
};

t.trackSelfDescribingEvent(eventJson, context);
```

## Maintainer quick start

Part of the Snowplow JavaScript Tracker monorepo.  
Build with [Node.js](https://nodejs.org/en/) (18 - 20) and [Rush](https://rushjs.io/).

### Setup repository

```bash
npm install -g @microsoft/rush 
git clone https://github.com/snowplow/snowplow-javascript-tracker.git
rush update
```

## Find out more

| Technical Docs                    | Setup Guide                 |
|-----------------------------------|-----------------------------|
| [![i1][techdocs-image]][techdocs] | [![i2][setup-image]][setup] |
| [Technical Docs][techdocs]        | [Setup Guide][setup]        |

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2022 Snowplow Analytics Ltd.

All rights reserved.

[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/node-tracker
[npm-url]: https://www.npmjs.com/package/@snowplow/node-tracker
[npm-image]: https://img.shields.io/npm/v/@snowplow/node-tracker

[techdocs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/react-native-tracker/introduction
[techdocs-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/techdocs.png
[setup]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/react-native-tracker/quick-start-guide/
[setup-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/setup.png
