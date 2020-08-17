# JavaScript web analytics for Snowplow

[![actively-maintained]][tracker-classificiation]
[![Release][release-image]][releases]
[![Build Status][travis-image]][travis]
[![Selenium Test Status][saucelabs-button-image]][saucelabs]
[![Code Climate][codeclimate-image]][codeclimate]
[![License][license-image]][bsd]

## Overview

Add analytics to your websites and web apps with the [Snowplow][snowplow] event tracker for
JavaScript.

With this tracker you can collect user event data (page views, e-commerce transactions etc) from the
client-side tier of your websites and web apps.

## Find out more

| Technical Docs                      | Setup Guide                  | Contributing                         |
|-------------------------------------|------------------------------|--------------------------------------|
| [![i1][techdocs-image]][tech-docs]  | [![i2][setup-image]][setup]  | ![i3][contributing-image]            |
| [Technical Docs][tech-docs]         | [Setup Guide][setup]         | [Contributing](Contributing.md)      |

## Developers

### Contributing quickstart

Assuming git and [Docker][docker-install] installed:

```bash
 host$ git clone https://github.com/snowplow/snowplow-javascript-tracker.git
 host$ cd snowplow-javascript-tracker
 host$ cd core
 host$ docker build -t core .
 host$ docker run core grunt
 host$ cd ..
 host$ docker build -t tracker .
 host$ docker run tracker grunt
```

Set up an `./aws.json` file using the example `./aws.sample.json`. If you just want to concat +
minify without uploading then you don't need to fill out the `aws.json` file with valid credentials.

Build the package (default task concatenates and minifies) using `grunt`.

## Testing

[![Selenium Test Status][saucelabs-matrix-image]][saucelabs]

## Copyright and license

The Snowplow JavaScript Tracker is based on Anthon Pang's [`piwik.js`][piwikjs], the JavaScript
tracker for the open-source [Piwik][piwik] project, and is distributed under the same license
([Simplified BSD][bsd]).

Significant portions of the Snowplow JavaScript Tracker copyright 2010 Anthon Pang. Remainder
copyright 2012-2020 Snowplow Analytics Ltd.

Licensed under the [Simplified BSD][bsd] license.

[snowplow]: http://snowplowanalytics.com/
[docker-install]: https://docs.docker.com/install/
[piwik]: http://piwik.org/
[piwikjs]: https://github.com/piwik/piwik/blob/master/js/piwik.js
[piwikphp]: https://github.com/piwik/piwik/blob/master/piwik.php
[bsd]: http://www.opensource.org/licenses/bsd-license.php
[setup]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/general-parameters/
[tech-docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[techdocs-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/techdocs.png
[setup-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/setup.png
[contributing-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/contributing.png
[release-image]: https://img.shields.io/badge/release-2.15.0-blue.svg?style=flat
[releases]: https://github.com/snowplow/snowplow-javascript-tracker/releases
[grunt-image]: https://cdn.gruntjs.com/builtwith.png
[grunt]: https://gruntjs.com/
[travis-image]: https://travis-ci.org/snowplow/snowplow-javascript-tracker.png?branch=master
[travis]: http://travis-ci.org/snowplow/snowplow-javascript-tracker
[codeclimate-image]: https://codeclimate.com/github/snowplow/snowplow-javascript-tracker.png
[codeclimate]: https://codeclimate.com/github/snowplow/snowplow-javascript-tracker
[saucelabs]: https://saucelabs.com/u/snowplow
[saucelabs-button-image]: https://app.saucelabs.com/buildstatus/snowplow
[saucelabs-matrix-image]: https://app.saucelabs.com/browser-matrix/snowplow.svg
[license-image]: http://img.shields.io/badge/license-simplified--bsd-blue.svg?style=flat
[tracker-classificiation]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/tracker-maintenance-classification/
[actively-maintained]: https://img.shields.io/static/v1?style=flat&label=Snowplow&message=Actively%20Maintained&color=6638b8&labelColor=9ba0aa&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAeFBMVEVMaXGXANeYANeXANZbAJmXANeUANSQAM+XANeMAMpaAJhZAJeZANiXANaXANaOAM2WANVnAKWXANZ9ALtmAKVaAJmXANZaAJlXAJZdAJxaAJlZAJdbAJlbAJmQAM+UANKZANhhAJ+EAL+BAL9oAKZnAKVjAKF1ALNBd8J1AAAAKHRSTlMAa1hWXyteBTQJIEwRgUh2JjJon21wcBgNfmc+JlOBQjwezWF2l5dXzkW3/wAAAHpJREFUeNokhQOCA1EAxTL85hi7dXv/E5YPCYBq5DeN4pcqV1XbtW/xTVMIMAZE0cBHEaZhBmIQwCFofeprPUHqjmD/+7peztd62dWQRkvrQayXkn01f/gWp2CrxfjY7rcZ5V7DEMDQgmEozFpZqLUYDsNwOqbnMLwPAJEwCopZxKttAAAAAElFTkSuQmCC