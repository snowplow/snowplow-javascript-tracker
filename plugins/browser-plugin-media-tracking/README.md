# Snowplow Media Tracking

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Browser Plugin to be used with `@snowplow/browser-tracker`.

Adds HTML5 Video and Audio tracking events to your Snowplow tracking.

## Maintainer quick start

Part of the Snowplow JavaScript Tracker monorepo.  
Build with [Node.js](https://nodejs.org/en/) (18 - 20) and [Rush](https://rushjs.io/).

### Setup repository

```bash
npm install -g @microsoft/rush 
git clone https://github.com/snowplow/snowplow-javascript-tracker.git
rush update
```

### Package Installation

With npm:

```bash
npm install @snowplow/browser-plugin-media-tracking
```

## Usage

Initialize your tracker with the MediaTrackingPlugin:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { MediaTrackingPlugin } from 'snowplow-browser-media-tracker';

newTracker('sp2', '{{collector}}', { plugins: [ MediaTrackingPlugin() ] }); // Also stores reference at module level
```

Then, use the `enableMediaTracking` function described below to produce events from your HTML5 Video/Audio element(s).

```js
enableMediaTracking({ id, options?: { label?, captureEvents?, boundaries?, volumeChangeTrackingInterval? } })
```

| Parameter                              | Type       | Default             | Description                                               | Required |
| -------------------------------------- | ---------- | ------------------- | --------------------------------------------------------- | -------- |
| `id`                                   | `string`   | -                   | The HTML id attribute of the media element                | Yes      |
| `options.label`                        | `string`   | -                   | An identifiable custom label sent with the event          | No       |
| `options.captureEvents`                | `string[]` | `['DefaultEvents']` | The name(s) of the events to capture                      | No       |
| `options.boundaries`                   | `number[]` | `[10, 25, 50, 75]`  | The progress percentages to fire an event at (if enabled) | No       |
| `options.volumeChangeTrackingInterval` | `number`   | `250`               | The rate at which volume events can be sent               | No       |

## Example Usage

```html
  ...
  <video id="my-video" src="my-video.mp4">
  ...
```

```js
import { enableMediaTracking } from '@snowplow/browser-plugin-media-tracking'

enableMediaTracking({
  id: 'my-video',
  options: {
    label: "My Custom Video Label",
    captureEvents: ["DefaultEvents"],
    boundaries: [10, 25, 50, 75],
    volumeChangeTrackingInterval: 250,
  }
})
```

 For a full list of trackable events, head over to the [docs page](https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/browser-tracker/browser-tracker-v3-reference/media-tracking/)

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2022 Snowplow Analytics Ltd.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-form-tracking
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-form-tracking
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-form-tracking
