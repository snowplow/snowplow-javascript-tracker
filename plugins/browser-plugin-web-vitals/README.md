# Snowplow Web Vitals Tracking

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Browser Plugin to be used with `@snowplow/browser-tracker`.

The plugin adds the capability to track web performance metrics categorized as [Web Vitals](https://web.dev/vitals/). These metrics are tracked with an event based on the [web_vitals schema](https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/web_vitals/jsonschema/).

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
npm install @snowplow/browser-plugin-web-vitals
```

## Usage

Initialize your tracker with the `WebVitalsPlugin`:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { WebVitalsPlugin } from '@snowplow/browser-plugin-web-vitals';

newTracker('sp1', '{{collector}}', { plugins: [ WebVitalsPlugin(/* pluginOptions */) ] });

/* 
 * Available plugin options `WebVitalsPluginOptions`:
 * {
 *  loadWebVitalsScript: Should the plugin immediately load the Core Web Vitals measurement script from UNPKG CDN.
 *  webVitalsSource: The URL endpoint the Web Vitals script should be loaded from. Defaults to the UNPKG CDN.
 *  context: Array of entity objects or entity-generating functions (the web_vitals payload is passed as a parameter) to attach to the web_vitals event.
 * }
 */
```

### Choosing a Web Vitals measurement source

The default Web Vitals measurement script is loaded from the [UNPKG](https://www.unpkg.com/) CDN. This choice is chosen as a default but you should consider your own setup when choosing the script source. Selecting a script source from a CDN which might already be used in your website might save you from yet another connection startup time (_Queueing_,_DNS lookup_,_TCP_, _SSL_).

Another reasonable choice could be [jsDelivr](https://cdn.jsdelivr.net/npm/web-vitals@3/dist/web-vitals.iife.js).

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2023 Snowplow Analytics Ltd.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-web-vitals
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-web-vitals
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-web-vitals
