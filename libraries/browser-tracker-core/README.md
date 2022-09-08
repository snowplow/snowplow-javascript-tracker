# Snowplow Browser Tracker Core

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Browser Core module to be used by Snowplow Browser based trackers.

It should rarely be used alone, you probably want `@snowplow/browser-tracker`.

## Maintainer quick start

Part of the Snowplow JavaScript Tracker monorepo.  
Build with [Node.js](https://nodejs.org/en/) (14 or 16) and [Rush](https://rushjs.io/).

### Setup repository

```bash
npm install -g @microsoft/rush 
git clone https://github.com/snowplow/snowplow-javascript-tracker.git
rush update
```

### Building Browser Tracker Core

```bash
cd libraries/browser-tracker-core
rushx build
```

### Running tests

```bash
rushx test
```

## Package Installation

With npm:

```bash
npm install @snowplow/browser-tracker-core
```

## Usage

```js
import { addTracker, createSharedState, getTracker } from '@snowplow/browser-tracker-core';

const sharedState = createSharedState();
const tracker = addTracker('snowplow_sp1', 'sp1', 'js-3.0.0', '{{collector}}', sharedState, {}); // Also stores reference at module level
const sameTracker = getTracker('snowplow_sp1');
```

### Example

```js
const domainUserId = tracker.getDomainUserId();
```

## Other features

This package contains a number of helper functions for tracking events in the browser as well as the core functionality of the Snowplow JavaScript Tracker.

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/tracker-core
[npm-image]: https://img.shields.io/npm/v/@snowplow/tracker-core
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-tracker-core
