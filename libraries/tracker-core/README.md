# Snowplow Tracker Core

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Core module to be used by Snowplow JavaScript based trackers.

## Maintainer quick start

Part of the Snowplow JavaScript Tracker monorepo.  
Build with [Node.js](https://nodejs.org/en/) (12 LTS or 14 LTS) and [Rush](https://rushjs.io/).

### Setup repository

```bash
npm install -g @microsoft/rush 
git clone https://github.com/snowplow/snowplow-javascript-tracker.git
rush update
```

### Building Tracker Core

```bash
cd libraries/tracker-core
rushx build
```

### Running tests

```bash
rushx test
```

## Package Installation

With npm:

```bash
npm install @snowplow/tracker-core
```

## Usage

### CommonJS Example

```js
const trackerCore = require('@snowplow/tracker-core').trackerCore;

// Create an instance with base 64 encoding set to false (it defaults to true)
const core = trackerCore(false);
```

### ES Module Example

```js
import { trackerCore } from '@snowplow/tracker-core';

// Create an instance with base 64 encoding set to false (it defaults to true)
const core = trackerCore(false)
```

### Example

```js
// Add a name-value pair to all payloads
core.addPayloadPair('vid', 2);

// Add each name-value pair in a dictionary to all payloads
core.addPayloadDict({
    'ds': '1160x620',
    'fp': 4070134789
});

// Add name-value pairs to all payloads using convenience methods
core.setTrackerVersion('js-3.0.0');
core.setPlatform('web');
core.setUserId('user-321');
core.setColorDepth(24);
core.setViewport(600, 400);
core.setUseragent('Snowplow/0.0.1');

// Track a page view with URL and title
const pageViewPayload = core.track(buildPageView({ pageUrl: 'http://www.example.com', pageTitle: 'landing page'});

console.log(pageViewPayload.build());
/*
{
    'e': 'pv',
    'url': 'http://www.example.com',
    'page': 'landing page',
    'uid': 'user-321',
    'vd': 2,
    'ds': '1160x620',
    'fp': 4070134789
    'tv': 'js-3.0.0',
    'p': 'web',
    'cd': 24,
    'vp': '600x400',
    'ua': 'Snowplow/0.0.1',
    'dtm': 1406879959702,                          // timestamp
    'eid': '0718a85a-45dc-4f71-a949-27870442ed7d'  // UUID
}
*/

// Stop automatically adding tv, p, and dtm to the payload
core.resetPayloadPairs();

// Track an unstructured event
const selfDescribingEventPayload = core.track(buildSelfDescribingEvent({ 
    event: {
        'schema': 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-0',
        'data': {
            'targetUrl': 'http://www.destination.com',
            'elementId': 'bannerLink'
        }
    }
});

console.log(selfDescribingEventPayload.build());
/*
{
    'e': 'ue',
    'ue_pr': {
        'schema': 'iglu:com.snowplowanalytics.snowplow/unstruct_even/jsonschema/1-0-0',
        'data': {
            'schema': 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-0',
            'data': {
                'targetUrl': 'http://www.destination.com',
                'elementId': 'bannerLink'
            }
        }
    },
    'dtm': 1406879973439,
    'eid': '956c6670-cbf6-460b-9f96-143e0320fdf6'
}
*/
```

## Other features

Core instances can be initialized with three parameters. The first is a boolean and determines whether custom contexts and unstructured events will be base 64 encoded. The second are optional Core Plugins, these can be used to intercept payload creation and add contexts on every event. The third is an optional callback function which gets applied to every payload created by the instance.

```js
const core = trackerCore(true, [], console.log);
```

The above example would base 64 encode all unstructured events and custom contexts and would log each payload to the console.

Use the `setBase64Encoding` method to turn base 64 encoding on or off after initializing a core instance:

```js
const core = trackerCore(); // Base 64 encoding on by default

core.setBase64Encoding(false); // Base 64 encoding is now off
```

## Documentation

For more information on the Snowplow JavaScript Tracker Core's API, view its [docs page][docs].

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/tracker-core
[npm-image]: https://img.shields.io/npm/v/@snowplow/tracker-core
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/node-js-tracker/javascript-tracker-core/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/tracker-core
