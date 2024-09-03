# Snowplow Performance Navigation Timing Tracking

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Browser Plugin to be used with `@snowplow/browser-tracker`.

Adds Performance Navigation Timing contexts to your Snowplow tracking. To learn more about the properties tracked, you can visit the [specification](https://www.w3.org/TR/navigation-timing-2/) or MDN [documentation site](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming).

The following diagram shows the ResourceTiming and PerformanceNavigationTiming properties and how they connect to the navigation of the page main document.

<figure>
  <img src="./docs/performance_navigation_timeline.svg" alt="performance navigation timeline"/>
  <figcaption>Performance navigation timeline from the <a href="https://www.w3.org/TR/navigation-timing-2/">W3C specification.</a></figcaption>
</figure>

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
npm install @snowplow/browser-plugin-performance-navigation-timing
```

## Usage

Initialize your tracker with the PerformanceNavigationTimingPlugin:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { PerformanceNavigationTimingPlugin } from '@snowplow/browser-plugin-performance-navigation-timing';

newTracker('sp1', '{{collector}}', { plugins: [ PerformanceNavigationTimingPlugin() ] }); 
```

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2023 Snowplow Analytics Ltd.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-performance-navigation-timing
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-performance-navigation-timing
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-performance-navigation-timing
