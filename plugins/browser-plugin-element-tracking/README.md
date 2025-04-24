# Snowplow Element Tracking Plugin

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Browser Plugin to be used with `@snowplow/browser-tracker`.

This plugin allows tracking the addition/removal and visibility of page elements.

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
npm install @snowplow/browser-plugin-element-tracking
```

## Usage

Initialize your tracker with the SnowplowElementTrackingPlugin and then call `startElementTracking`:

```js
import { newTracker } from '@snowplow/browser-tracker';
import { SnowplowElementTrackingPlugin, startElementTracking } from '@snowplow/browser-plugin-element-tracking';

newTracker('sp1', '{{collector_url}}', {
   appId: 'my-app-id',
   plugins: [ SnowplowElementTrackingPlugin() ],
});

startElementTracking({
   elements: [
      {selector: '.newsletter-signup'}
   ]
});
```

### Configuration

Configuration occurs primarily via the `elements` setting passed to `startElementTracking`.

You can pass a single configuration or an array of multiple configurations.

Each configuration requires a `selector`, with a CSS selector describing the elements the configuration applies to.
All other configuration is optional.

You can label each configuration with the `name` property (if not specified, the `selector` is used as the `name`).
The `name` is used in the event payloads and matches the `element_name` of any entities specific to the target element(s).

The settings control triggering events for:

- `expose_element`: When a selected element enters the viewport, becoming visible
- `obscure_element`: When a selected element exists the viewport, no longer being visible
- `create_element`: When a selected element is created or exists in the document
- `destroy_element`: When a selected element is removed from or no longer found in the document

Each of these events can be enabled, disabled, or configured more specifically.
By default, only `expose_element` is enabled.

Rather than trigger events, configurations can also define the selected elements as "components", which can be listed as a `component_parents` entity for other events; or can have their current state attached to other events (such as page pings) via `element_statistics` entities.

The plugin manages the following custom entities:

- `element`: This is shared between all the above events. It contains the `element_name` from the matching configuration, and data about the element that generated the event. This includes the element's dimensions, position (relative to the viewport and document), how many elements matched it's selector (and the index of the element in question, if you selector matches multiple elements). It will also contain custom attributes you can extract from the element via the `details` configuration.
- `component_parents`: For the element generating the event, provides a list of components (defined by the `component` setting) that are ancestors of that element.
- `element_content`: You can also attach details about child elements of the element that matches your selector. E.g. you can select a recommendations widget, and then extract details about the individual recommendations within it.
- `element_statistics`: This entity can be attached to other events and provides a snapshot of what this plugin has observed at that point; it includes the current/smallest/largest dimensions so far, how long the element has existed since it was first observed, its current/maximum scroll depth, its total time in view, and how many times it has been visible in the viewport.

A detailed example configuration follows:

```javascript
snowplow('startElementTracking', {
   elements: [
   // can be a single or array of many configurations; additive, can be called multiple times to add more configurations, but doesn't dedupe
   {
      selector: '.oncreate', // required: selector for element, relative to document scope by default
      name: 'created div', // logical name: can be shared across multiple configs; defaults to `selector` if not specified; this is used in event payloads and as a key to reference entities
      create: true, // track an event when the element is added to the DOM (or when plugin loads if already on page) (default: false)
      destroy: true, // track an event when the element is removed from the DOM (or when plugin loads if already on page) (default: false)
      expose: true, // track an event when the element intersects with the viewport (default: true)
      obscure: true, // track an event when the element scrolls out of the viewport (default: false)
      details: [
         // details can be extracted from the element and included in the entity
         function (element) {
            return { example: 'from a function' };
         }, // use a function that returns an object
         { attributes: ['class'], selector: true }, // or declarative options; either as a single object or array elements if you want config re-use; this is less flexible but will be useful to Google Tag Manager where functions may not be able to reference DOM elements
         { attributes: ['class'] }, // attributes: get the static/default attributes originally defined on the element when created
         { properties: ['className'] }, // properties: get the dynamic/current attributes defined on the element
         { dataset: ['example'] }, // dataset: extract values from dataset attributes
         { child_text: { heading: 'h2' } }, // child_text: for each given name:selector pair, extract the textContent of the first child matching selector, if it has text content use that value with the given name; if there's no matching children it will try shadow children
         { selector: true }, // selector: attach the matching CSS selector as an attribute; useful if you're using logical names but want to differentiate
         { content: { textType: /text (\S+)/ } }, //content (map of regex patterns to match text against, first capture group used if detected); if no innerText, will try shadow innerText
      ],
      includeStats: ['page_ping'], // you can include a list of event names here; statistics about elements matching this configuration will be attached as entities to those events; event names don't have to be generated by this plugin so can include built-in events like page_pings or custom events
   },
   { selector: 'nav', expose: false, component: true }, // `expose` is true by default so may need disabling; `component` means the name/selector is attached to the component_parents entity list for other events triggered on descendants
   {
      selector: 'div.toggled', // elements that exist but don't yet match the selector will count as created/destroyed if they later are changed to match it
      name: 'mutated div',
      create: true,
      destroy: true,
      expose: false,
      obscure: false,
   },
   {
      selector: '.perpage.toggled',
      name: 'perpage mutation',
      create: { when: 'pageview' }, // for each type of event you can specify frequency caps for when the event will fire: never, always, once, element, pageview
      destroy: { when: 'pageview' },
      /*
      the frequency options are "per":
      - per never will never track the event, effectively disabling the configuration
      - per always will track an event every time it is eligible (e.g. every time on screen when scrolled past)
      - per once will only track the event a single time for each configuration for the duration of the plugin instance; this reduces volume since only the first matching element will fire the event
      - per element is like once, but for each individually matching element instance
      - per pageview is like once, but useful for single-page-applications with long-lasting plugin instances where you may want to track the element on each virtual pageview
      */
      expose: false, // `false` is equivalent to `when: never`, and `true` is `when: always`
      obscure: false,
   },
   {
      name: 'recommendations',
      selector: '.recommendations',
      expose: {
         // expose has more options than the other events:
         minTimeMillis: 5000, // cumulative time in milliseconds that each matching element should be visible for before considered exposed
         minPercentage: 0, // the minimum percentage of the element's area that should be visible before considering exposed; range 0.0 - 1.0
         minSize: 0, // the minimum size the element should be before being considered exposed; this can be used to ignore elements with 0 size
         boundaryPixels: 0, // arbitrary margins to apply to the element when calculating minPercentage; can be a number to apply to all sides, 2-element array to specify vertical and horizontal, or 4-element array to specify margins for each size individually
      },
      obscure: true,
      component: true,
      details: { child_text: ['h2'] },
      contents: [
         // content information can be extracted
         {
         name: 'recommendation-item', // contents can be named too
         selector: 'li', // selectors are relative to the parent element
         details: { content: { item_name: /.+/ } }, // content item details can be captured too
         contents: { name: 'recommendation_image', selector: 'img', details: { attributes: ['alt'] } }, // you can descend contents like a tree
         },
      ],
   },
   {
      name: 'shadow',
      selector: 'button.shadow',
      shadowSelector: 'shadow-host', // elements within custom components/shadow hosts require their hosts' selectors to be specified
      shadowOnly: true, // if the selector could erroneously catch elements outside your shadow hosts, you can restrict it to only match in shadows; by default it will match elements in and out of shadow hosts if they match the selector
   },
   ],
});

snowplow('getComponentListGenerator', function (componentGenerator, componentGeneratorWithDetail) {
   // access a context generator aware of the startElementTracking "components" configuration
   // this will attach the component_parents entity to events generated by these plugins that show the component hierarchy
   snowplow('enableLinkClickTracking', { context: [componentGenerator] });
   snowplow('enableFormTracking', { context: [componentGenerator] });

   // componentGeneratorWithDetail will also populate element_detail entities for each component, but may not be directly compatible with the above APIs
});

snowplow('endElementTracking', {elements: ['names']}); // stop tracking all configurations with given `name`s
snowplow('endElementTracking', {elementIds: ['id']}); // to be more specific, each configuration can also have an ID to remove explicitly
snowplow('endElementTracking', {filter: (config) => true}); // decide for yourself if the configuration should be removed; must explicitly return `true` to remove; "truthy" values will not count
snowplow('endElementTracking'); // stop tracking all elements and remove listeners
```


## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2024 Snowplow Analytics Ltd.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-plugin-element-tracking
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-plugin-element-tracking
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/browser-plugin-element-tracking
