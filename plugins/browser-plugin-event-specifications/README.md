# Snowplow Event Specifications Plugin

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Browser Plugin to be used with `@snowplow/browser-tracker`.

The plugin allows you to integrate with Event Specifications for a selected set of plugins. The plugin will automatically add an Event Specification context to the events matching the configuration added on the plugin. This configuration should be retrieved directly from your Data Product in the [Snowplow BDP Console](https://console.snowplowanalytics.com).

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
npm install @snowplow/browser-plugin-event-specifications
```

## Usage

Initialize your tracker with the `EventSpecificationsPlugin`:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { EventSpecificationsPlugin } from '@snowplow/browser-plugin-event-specifications';

newTracker('sp1', '{{collector}}', { plugins: [ EventSpecificationsPlugin(/* pluginOptions */) ] });

/* 
 * Available plugin options `EventSpecificationsPluginOptions`:
 * {
 *  [k in AvailablePlugins]: Keys for available plugins that have been added as integrations.
 * }
 */
```

### Getting the expected Event Specification options input

The expected Event Specification option input can be retrieved directly from your Data Product in the [Snowplow BDP Console](https://console.snowplowanalytics.com) and would be similar to the following example:

```js
EventSpecificationsPlugin(
     SnowplowMediaPlugin: { play_event: 'event_specification_id' }
);
```

### Adding a new integration

Every integration needs to satisfy the following interface:

```ts
export type Integration = {
    /**
     * Find a matching event for the integration with a plugin and an event specification id map.
     * The returned string should match what we expect as key coming from the configuration object on this specific plugin integration.
     */
    detectMatchingEvent: (payloadBuilder: PayloadBuilder) => string | undefined
}
```

The `detectMatchingEvent` function should return the key expected for the Event Specification input option of the integration.

To add a new integration, add the required code under `src/integrations` and export it accordingly on the `integrations` object on the `src/integrations/index.ts` file.

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2024 Snowplow Analytics Ltd.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-event-specifications
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-event-specifications
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-event-specifications
