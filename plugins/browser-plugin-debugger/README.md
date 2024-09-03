# Snowplow Advertising Tracking

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Browser Plugin to be used with `@snowplow/browser-tracker`.

Adds debugging to your Snowplow tracking.

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
npm install @snowplow/browser-plugin-debugger
```

## Usage

Initialize your tracker with the DebuggerPlugin:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { DebuggerPlugin } from '@snowplow/browser-plugin-debugger';

newTracker('sp1', '{{collector}}', { plugins: [ DebuggerPlugin() ] }); // Also stores reference at module level
```

Then additional debugging information will be available in your browsers Developer Tools.

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-ad-tracking
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-ad-tracking
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-ad-tracking
