# Snowplow Geolocation Tracking

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Browser Plugin to be used with `@snowplow/browser-tracker`.

Adds Geolocation to your Snowplow tracking.

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
npm install @snowplow/browser-plugin-geolocation
```

## Usage

Initialize your tracker with the GeolocationPlugin:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { GeolocationPlugin, enableGeolocationContext } from '@snowplow/browser-plugin-geolocation';

// Enables at tracker load - set to `false` to load later with `enableGeolocationContext`
newTracker('sp1', '{{collector}}', { plugins: [ GeolocationPlugin(true) ] }); 

enableGeolocationContext(); // If initializing with `false`, call this to switch it on
```

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-geolocation
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-geolocation
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-geolocation
