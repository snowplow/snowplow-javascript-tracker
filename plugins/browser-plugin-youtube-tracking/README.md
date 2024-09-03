# Snowplow YouTube Tracking

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Browser Plugin to be used with `@snowplow/browser-tracker`.

Adds YouTube Video and Audio tracking events to your Snowplow tracking.

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
npm install @snowplow/browser-plugin-youtube-tracking
```

## Usage

Initialize your tracker with the YouTubeTrackingPlugin:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { YouTubeTrackingPlugin } from 'snowplow-browser-youtube-tracker';

newTracker('sp2', '{{collector}}', { plugins: [ YouTubeTrackingPlugin() ] }); // Also stores reference at module level
```

Then, use the `enableYouTubeTracking` function described below to produce events from your YouTube IFrame(s).

```js
enableYouTubeTracking({ id, options?: { label?, captureEvents?, percentBoundries?, updateRate? } })
```

| Parameter               | Type       | Default             | Description                                               | Required |
| ----------------------- | ---------- | ------------------- | --------------------------------------------------------- | -------- |
| `id`                    | `string`   | -                   | The HTML id attribute of the youtube element              | Yes      |
| `options.label`         | `string`   | -                   | An identifiable custom label sent with the event          | No       |
| `options.captureEvents` | `string[]` | `['DefaultEvents']` | The name(s) of the events to capture                      | No       |
| `options.boundries`     | `number[]` | `[10, 25, 50, 75]`  | The progress percentages to fire an event at (if enabled) | No       |
| `options.updateRate`    | `number`   | `500`               | The rate at which volume/seek events are checked in ms    | No       |

## Example Usage

```html
  ...
  <body>
    <video id="my-video" src="my-video.mp4">
  </body>
  ...
```

```js
import { enableYouTubeTracking } from '@snowplow/browser-plugin-youtube-tracking'

enableYouTubeTracking({
  id: 'my-video',
  options: {
    label: "My Custom Video Label",
    captureEvents: ["pause", "volumechange", "percentprogress"],
    boundries: [10, 25, 50, 75],
  }
})
```

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2022 Snowplow Analytics Ltd.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-form-tracking
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-form-tracking
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-form-tracking
