# Snowplow Privacy Sandbox Tracking

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Browser Plugin to be used with `@snowplow/browser-tracker`.

Allows for adding Privacy Sandbox related data to your Snowplow tracking. To learn more about the Privacy Sandbox you can visit the official [website](https://www.privacysandbox.com/). As more and more APIs become available or further refined, we will be upgrading the plugin with more capabilities and options as more APIs are added to the Privacy Sandbox.

Currently supported APIs:
- [Topics API](https://developer.chrome.com/docs/privacy-sandbox/topics/overview/)


__Note:__ Some of the APIs and data will not be available by default in all users. This is commonly due to these APIs being dependent on browser support, user privacy preferences, browser feature-flags or ad-blocking software. The plugin will not modify or request access explicitly to any of these features if not available by default.

## Maintainer quick start

Part of the Snowplow JavaScript Tracker monorepo.  
Build with [Node.js](https://nodejs.org/en/) (14 or 16) and [Rush](https://rushjs.io/).

### Setup repository

```bash
npm install -g @microsoft/rush 
git clone https://github.com/snowplow/snowplow-javascript-tracker.git
rush update
```

## Package Installation

With npm:

```bash
npm install @snowplow/browser-plugin-privacy-sandbox
```

## Usage

Initialize your tracker with the PrivacySandboxPlugin:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { PrivacySandboxPlugin } from '@snowplow/browser-plugin-privacy-sandbox';

newTracker('sp1', '{{collector}}', { plugins: [ PrivacySandboxPlugin() ] }); 
```

With the plugin added to your tracker, a new context will be attached to every event, when Privacy Sandbox [Topics](https://developer.chrome.com/docs/privacy-sandbox/topics/overview/) are detected for a user.

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2023 Snowplow Analytics Ltd.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-privacy-sandbox
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-privacy-sandbox
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-privacy-sandbox
