# Web analytics for Snowplow

[![actively-maintained]][tracker-classificiation]
[![Build Status][gh-actions-image]][gh-actions]
[![Saucelabs Test Status][saucelabs-button-image]][saucelabs]
[![Release][release-image]][releases]
[![License][license-image]](LICENSE)

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

## Maintainers

### Contributing quick start

Assuming [git](https://git-scm.com/downloads), [Node.js 10+ LTS](https://nodejs.org/en/download/releases/).

#### Clone repository

```bash
$ git clone https://github.com/snowplow/snowplow-javascript-tracker.git
```

#### Building

```bash
$ npm install -g @microsoft/rush
$ rush update
$ rush build
```

## Testing

To run unit tests:

```bash
$ rush test
```

To run e2e tests (locally):

```bash
$ cd trackers/javascript-tracker/
$ rushx test:e2e:local
```

[![Sauce Labs Test Status][saucelabs-matrix-image]][saucelabs]

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang.

All rights reserved.

[snowplow]: http://snowplowanalytics.com/
[docker-install]: https://docs.docker.com/install/
[setup]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/general-parameters/
[tech-docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
[techdocs-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/techdocs.png
[setup-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/setup.png
[contributing-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/contributing.png
[release-image]: https://img.shields.io/github/v/release/snowplow/snowplow-javascript-tracker?sort=semver
[releases]: https://github.com/snowplow/snowplow-javascript-tracker/releases
[gh-actions]: https://github.com/snowplow/snowplow-javascript-tracker/actions
[gh-actions-image]: https://github.com/snowplow/snowplow-javascript-tracker/workflows/Build/badge.svg
[saucelabs]: https://saucelabs.com/u/snowplow
[saucelabs-button-image]: https://img.shields.io/static/v1?style=flat&label=Sauce%20Labs&message=Tested&color=e2231a&logo=sauce-labs
[saucelabs-matrix-image]: https://app.saucelabs.com/browser-matrix/snowplow.svg
[osi]: https://opensource.org/licenses/BSD-3-Clause
[license-image]: https://img.shields.io/github/license/snowplow/snowplow-javascript-tracker
[tracker-classificiation]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/tracker-maintenance-classification/
[actively-maintained]: https://img.shields.io/static/v1?style=flat&label=Snowplow&message=Actively%20Maintained&color=6638b8&labelColor=9ba0aa&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAeFBMVEVMaXGXANeYANeXANZbAJmXANeUANSQAM+XANeMAMpaAJhZAJeZANiXANaXANaOAM2WANVnAKWXANZ9ALtmAKVaAJmXANZaAJlXAJZdAJxaAJlZAJdbAJlbAJmQAM+UANKZANhhAJ+EAL+BAL9oAKZnAKVjAKF1ALNBd8J1AAAAKHRSTlMAa1hWXyteBTQJIEwRgUh2JjJon21wcBgNfmc+JlOBQjwezWF2l5dXzkW3/wAAAHpJREFUeNokhQOCA1EAxTL85hi7dXv/E5YPCYBq5DeN4pcqV1XbtW/xTVMIMAZE0cBHEaZhBmIQwCFofeprPUHqjmD/+7peztd62dWQRkvrQayXkn01f/gWp2CrxfjY7rcZ5V7DEMDQgmEozFpZqLUYDsNwOqbnMLwPAJEwCopZxKttAAAAAElFTkSuQmCC
