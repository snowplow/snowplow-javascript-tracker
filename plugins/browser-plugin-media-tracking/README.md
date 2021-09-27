# Snowplow Media Tracking

[![License][license-image]](LICENSE)

Browser Plugin to be used with `@snowplow/browser-tracker`.

Adds Video and Audio tracking events to your Snowplow tracking.

## Maintainer quick start

Part of the Snowplow JavaScript Tracker monorepo.  
Build with [Node.js](https://nodejs.org/en/) (12 LTS or 14 LTS) and [Rush](https://rushjs.io/).

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

Then, use the `enableMediaTracking` function described below to produce events from your Video/Audio element(s).

```js
enableMediaTracking( mediaId, [ config ])
```

## Parameters

| Argument  | Type   | Default   | Required | Description                                |
| --------- | ------ | --------- | -------- | ------------------------------------------ |
| `mediaId` | string | -         | Yes      | The HTML id attribute of the media element |
| `config`  | object | See below | No       | The config options for tracking            |

## Config

| Parameter             | Type       | Default            | Description                                               |
| --------------------- | ---------- | ------------------ | --------------------------------------------------------- |
| `label`               | `string`   | -                  | An identifiable custom label sent with the event          |
| `captureEvents`       | `string[]` | `DefaultEvents`    | The name(s) of the events you want to listen for          |
| `percentageBoundries` | `number[]` | `[10, 25, 50, 75]` | The progress percentages to fire an event at (if enabled) |

### Pre-Made Event Groups

#### `DefaultEvents`

| Event                 | Description |
| --------------------- | ----------- |
| pause                 | ---         |
| play                  | ---         |
| seeked                | ---         |
| ratechange            | ---         |
| volumechange          | ---         |
| change                | ---         |
| fullscreenchange      | ---         |
| enterpictureinpicture | ---         |
| leavepictureinpicture | ---         |

## Example Usage

```html
<!DOCTYPE html>

<html>
  <head>
    ...
  </head>
  <body>
    <video id="my-video" src="my-video.mp4">
  </body>
</html>
```

```js
import { enableMediaTracking } from '@snowplow/browser-plugin-media-tracking'

enableMediaTracking(
  "my-video",
  {
    label: "My Custom Video Label",
    captureEvents: ["pause", "volumechange", "percentprogress"],
    percentageBoundries: [10, 25, 50, 75],
  }
)

```

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2021 Snowplow Analytics Ltd.

All rights reserved.

[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/github/license/snowplow-incubator/snowplow-browser-plugin-advanced-template
