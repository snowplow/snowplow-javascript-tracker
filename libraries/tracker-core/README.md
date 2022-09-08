# Snowplow Tracker Core

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Core module to be used by Snowplow JavaScript based trackers.

## Maintainer quick start

Part of the Snowplow JavaScript Tracker monorepo.  
Build with [Node.js](https://nodejs.org/en/) (14 or 16) and [Rush](https://rushjs.io/).

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
const core = trackerCore({
    base64: false
});
```

### ES Module Example

```js
import { trackerCore } from '@snowplow/tracker-core';

// Create an instance with base 64 encoding set to false (it defaults to true)
const core = trackerCore({
    base64: false
})
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
core.setTrackerVersion('js-3.6.0');
core.setPlatform('web');
core.setUserId('user-321');
core.setColorDepth('24');
core.setViewport('600', '400');
core.setUseragent('Snowplow/0.0.1');

// Track a page view with URL and title
const pageViewPayload = core.track(
    buildPageView({
        pageUrl: 'http://www.example.com',
        pageTitle: 'landing page',
    })
);

console.log(pageViewPayload);
/*
{
    'e': 'pv',
    'url': 'http://www.example.com',
    'page': 'landing page',
    'uid': 'user-321',
    'vid': 2,
    'ds': '1160x620',
    'fp': 4070134789,
    'tv': 'js-3.6.0',
    'p': 'web',
    'cd': '24',
    'vp': '600x400',
    'ua': 'Snowplow/0.0.1',
    'dtm': '1406879959702',                          // timestamp
    'eid': 'cd39f493-dd3c-4838-b096-6e6f31015409'    // UUID
}
*/

// Stop automatically adding tv, p, and dtm to the payload.
core.resetPayloadPairs({});

// Track an unstructured event
const selfDescribingEventPayload = core.track(
    buildSelfDescribingEvent({
        event: {
            'schema': 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-0',
            'data': {
                'targetUrl': 'http://www.destination.com',
                'elementId': 'bannerLink'
            }
        }
    })
);

console.log(selfDescribingEventPayload);
/*
{
    'e': 'ue',
    'eid': '4ed5da6b-7fff-4f24-a8a9-21bc749881c6',
    'dtm': '1659086693634',
    'ue_pr': "{\"schema\":\"iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0\",\"data\":{\"schema\":\"iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-0\",\"data\":{\"targetUrl\":\"http://www.destination.com\",\"elementId\":\"bannerLink\"}}}"
}
*/
```

## Other features

Core instances can be initialized with a configuration object. `base64` Determines whether custom contexts and unstructured events will be base 64 encoded.  `corePlugins` are used to intercept payload creation and add contexts on every event. `callback` is an optional callback function which gets applied to every payload created by the instance.

```js
const core = trackerCore({
    base64: true,
    corePlugins: [/* Your plugins here*/],
    callback: console.log
});
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

Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/tracker-core
[npm-image]: https://img.shields.io/npm/v/@snowplow/tracker-core
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/node-js-tracker/javascript-tracker-core/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/tracker-core
