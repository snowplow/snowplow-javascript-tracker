# JavaScript web analytics for Snowplow

[ ![Build Status] [travis-image] ] [travis]
[ ![Code Climate] [codeclimate-image] ] [codeclimate]
[ ![Built with Grunt] [grunt-image] ] [grunt]

## Overview

Add analytics to your websites and web apps with the [Snowplow] [snowplow] event tracker for JavaScript.

With this tracker you can collect user event data (page views, e-commerce transactions etc) from the client-side tier of your websites and web apps.

## Find out more

| Technical Docs              | Setup Guide           | Roadmap & Contributing               |         
|-----------------------------|-----------------------|--------------------------------------|
| ![i1] [techdocs-image]      | ![i2] [setup-image]   | ![i3] [roadmap-image]                |
| [Technical Docs] [tech-docs] | [Setup Guide] [setup] | _coming soon_                        |


## Developers

### Getting started
Make sure you have `node` and `npm` installed and in your `$PATH`.
* Install npm deps: `npm install`
* Install `grunt-cli`:  `(sudo) npm install -g grunt-cli`
* Set up an `./aws.json` file using the example `./aws.sample.json`
  * If you just want to concat + minify you don't need to fill out the
    `aws.json` file with valid credentials.
* Build the package (default task concatenates and minifies) `grunt`

## Copyright and license

The Snowplow JavaScript Tracker is based on Anthon Pang's [`piwik.js`] [piwikjs], the JavaScript tracker for the open-source [Piwik] [piwik] project, and is distributed under the same license ([Simplified BSD] [bsd]).

Significant portions of the Snowplow JavaScript Tracker copyright 2010 Anthon Pang. Remainder copyright 2012-14 Snowplow Analytics Ltd.

Licensed under the [Simplified BSD] [bsd] license.

[snowplow]: http://www.keplarllp.com/blog/2012/02/introducing-snowplow-the-worlds-most-powerful-web-analytics-platform
[piwik]: http://piwik.org/
[piwikjs]: https://github.com/piwik/piwik/blob/master/js/piwik.js
[piwikphp]: https://github.com/piwik/piwik/blob/master/piwik.php
[bsd]: http://www.opensource.org/licenses/bsd-license.php 
[integrating]: /snowplow/snowplow/blob/master/docs/03_integrating_snowplowjs.md
[selfhosting]: /snowplow/snowplow/blob/master/docs/04_selfhosting_snowplow.md
[setup]: https://github.com/snowplow/snowplow/wiki/javascript-tracker-setup
[integrating-js-on-website]: https://github.com/snowplow/snowplow/wiki/integrating-javascript-tags-onto-your-website
[tech-docs]: https://github.com/snowplow/snowplow/wiki/javascript-tracker
[techdocs-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/techdocs.png
[setup-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/setup.png
[roadmap-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/roadmap.png
[grunt-image]: https://cdn.gruntjs.com/builtwith.png
[grunt]: http://gruntjs.com/
[travis-image]: https://travis-ci.org/snowplow/snowplow-javascript-tracker.png?branch=master
[travis]: http://travis-ci.org/snowplow/snowplow-javascript-tracker
[codeclimate-image]: https://codeclimate.com/github/snowplow/snowplow-javascript-tracker.png
[codeclimate]: https://codeclimate.com/github/snowplow/snowplow-javascript-tracker      
