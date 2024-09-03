# Snowplow JavaScript Tracker

[![npm version][npm-image]][npm-url]
[![License][license-image]](LICENSE)

Add Snowplow Tracking to your website via a tag solution.

## Maintainer quick start

Part of the Snowplow JavaScript Tracker monorepo.  
Build with [Node.js](https://nodejs.org/en/) (18 - 20) and [Rush](https://rushjs.io/).

### Setup repository

```bash
npm install -g @microsoft/rush 
git clone https://github.com/snowplow/snowplow-javascript-tracker.git
rush update
```

## Select your version

This repository creates two versions of the tracker. 

The fully featured `sp.js` contains the majority of the plugins included within this repository for a complete tracking experience. This is our recommended version.

However, if you'd like a lightweight version of the tracker you can opt for `sp.lite.js`.  
This version only includes Page Views, Page Activity, Structured and Self Describing events as well as global contexts and anonymous tracking.

## Installation

Add the tag to your website or Tag Management solution:

```html
<script type="text/javascript" async=1>
;(function(p,l,o,w,i,n,g){if(!p[i]){p.GlobalSnowplowNamespace=p.GlobalSnowplowNamespace||[]; p.GlobalSnowplowNamespace.push(i);p[i]=function(){(p[i].q=p[i].q||[]).push(arguments) };p[i].q=p[i].q||[];n=l.createElement(o);g=l.getElementsByTagName(o)[0];n.async=1; n.src=w;g.parentNode.insertBefore(n,g)}}(window,document,"script","{{URL to sp.js}}","snowplow"));
</script>

<script>
window.snowplow('newTracker', 'sp', collector_endpoint, {
  appId: 'my-app',
  eventMethod: 'post',
  contexts: {
    performanceTiming: true,
  },
});
</script>
```

We advise you host `sp.js` or `sp.lite.js` yourself, and rename it. However if you'd like use a CDN, you'll find the tracker on jsDelivr, unpkg and cdnjs.

## Usage

```js
window.snowplow('enableLinkClickTracking');

window.snowplow('trackPageView', {
  title: 'My Title',
  context: [
    // Set page title; add page context
    {
      schema: 'iglu:org.schema/WebPage/jsonschema/1-0-0',
      data: {
        keywords: ['tester'],
      },
    },
  ],
});

window.snowplow('trackSelfDescribingEvent', {
  event: {
    schema: 'iglu:com.acme/my_event/jsonschema/1-0-0',
    data: {
      myId: '12345-abc',
    },
  }
});
```

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang.

All rights reserved.

[npm-url]: https://www.npmjs.com/package/@snowplow/browser-tracker
[npm-image]: https://img.shields.io/npm/v/@snowplow/browser-tracker
[docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/npm/l/@snowplow/javascript-tracker
