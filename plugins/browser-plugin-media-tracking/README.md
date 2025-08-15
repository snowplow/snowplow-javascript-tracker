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
import { MediaTrackingPlugin, startHtml5MediaTracking, endHtml5MediaTracking } from '@snowplow/browser-plugin-media-tracking';

newTracker('sp2', '{{collector}}', { plugins: [ MediaTrackingPlugin() ] }); // Also stores reference at module level
```

Then, use the `startHtml5MediaTracking` function described below to produce events from your HTML5 Video/Audio element(s).

```js
startHtml5MediaTracking({ video, id })
```

| Parameter | Type                     | Description                                                                            | Required |
| ----------| ------------------------ | -------------------------------------------------------------------------------------- | -------- |
| `id`      | `string`                 | A UUID identifier to use as the media session ID                                       | Yes      |
| `video`   | `string` / `HTMLElement` | The HTML id attribute, CSS selector, or actual media element to track media events for | Yes      |

See the [full documentation](https://docs.snowplow.io/docs/sources/trackers/web-trackers/tracking-events/media/html5/#starthtml5mediatracking) for optional parameters.

## Example Usage

```html
  ...
  <video id="my-video" src="my-video.mp4">
  ...
```

```js
import { startHtml5MediaTracking, endHtml5MediaTracking } from '@snowplow/browser-plugin-media-tracking';

const sessionId = crypto.randomUUID();

startHtml5MediaTracking({
  id: sessionId,
  video: 'my-video',
  label: "My Custom Video Label",
  boundaries: [10, 25, 50, 75],
});

/* ... */

endHtml5MediaTracking(sessionId);
```

 For a full list of parameters and trackable events, head over to the [docs page](https://docs.snowplow.io/docs/sources/trackers/web-trackers/tracking-events/media/html5/#events).

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2022 Snowplow Analytics Ltd.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-form-tracking
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-form-tracking
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-form-tracking
