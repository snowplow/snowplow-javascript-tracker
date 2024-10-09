# Snowplow GA Cookies Tracking

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Browser Plugin to be used with `@snowplow/browser-tracker`.

Adds Google Analytics 4 and optionally Universal Analytics cookies to your Snowplow tracking.

## Maintainer quick start

Part of the Snowplow JavaScript Tracker monorepo.
Build with [Node.js](https://nodejs.org/en/) (18+) and [Rush](https://rushjs.io/).

### Setup repository

```bash
npm install -g @microsoft/rush
git clone https://github.com/snowplow/snowplow-javascript-tracker.git
rush update
```

## Package Installation

With npm:

```bash
npm install @snowplow/browser-plugin-ga-cookies
```

## Usage

Initialize your tracker with the GaCookiesPlugin:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { GaCookiesPlugin } from '@snowplow/browser-plugin-ga-cookies';

newTracker('sp1', '{{collector}}', { plugins: [ GaCookiesPlugin(
    /* pluginOptions */
) ] });

/*
 * Available plugin options `GACookiesPluginOptions`:
 * {
 * ua: Send Universal Analytics specific cookie values. Defaults to false.
 * ga4: Send Google Analytics 4 specific cookie values. Defaults to true.
 * ga4MeasurementId: Measurement id/ids to search the Google Analytics 4 session cookie. Can be a single measurement id as a string or an array of measurement id strings. The cookie has the form of <cookie_prefix>_ga_<container-id> where <container-id> is the data stream container id and <cookie_prefix> is the optional cookie_prefix option of the gtag.js tracker.
 * cookiePrefix: Cookie prefix set on the Google Analytics 4 cookies using the cookie_prefix option of the gtag.js tracker.
 * }
 */
```

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2023 Snowplow Analytics Ltd.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-ga-cookies
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-ga-cookies
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-ga-cookies
