# Browser and Node.js analytics for Snowplow

[![actively-maintained]][tracker-classificiation]
[![Release][release-image]][releases]
[![License][license-image]](LICENSE)
[![Build Status][gh-actions-image]][gh-actions]
[![Saucelabs Test Status][saucelabs-button-image]][saucelabs]

![snowplow-logo](common/media/snowplow_logo.png)

Snowplow is a scalable open-source platform for rich, high quality, low-latency data collection. It is designed to collect high quality, complete behavioral data for enterprise business.

**To find out more, please check out the [Snowplow website][website] and our [documentation][docs].**

## Snowplow JavaScript Trackers Overview

The Snowplow JavaScript Trackers allow you to add analytics to your websites, web apps and Node.js applications when using a [Snowplow][snowplow] pipeline.

With these trackers you can collect user event data (page views, e-commerce transactions etc) from the
client-side and server-side tiers of your websites and web apps.

**Technical documentation can be found for each tracker in our [Documentation][javascript-docs].**

### @snowplow/browser-tracker (npm)

| Technical Docs                              | Setup Guide                          |
|---------------------------------------------|--------------------------------------|
| [![i1][techdocs-image]][tech-docs-browser]  | [![i2][setup-image]][setup-browser]  |
| [Technical Docs][tech-docs-browser]         | [Setup Guide][setup-browser]         |

### @snowplow/javascript-tracker (tag based)

| Technical Docs                         | Setup Guide                     |
|----------------------------------------|---------------------------------|
| [![i3][techdocs-image]][tech-docs-js]  | [![i4][setup-image]][setup-js]  |
| [Technical Docs][tech-docs-js]         | [Setup Guide][setup-js]         |

### @snowplow/node-tracker (npm)

| Technical Docs                           | Setup Guide                       |
|------------------------------------------|-----------------------------------|
| [![i5][techdocs-image]][tech-docs-node]  | [![i6][setup-image]][setup-node]  |
| [Technical Docs][tech-docs-node]         | [Setup Guide][setup-node]         |

## Maintainers

| Contributing                         |
|--------------------------------------|
| ![i7][contributing-image]            |
| [Contributing](CONTRIBUTING.md)      |

### Maintainer quick start

Assuming [git](https://git-scm.com/downloads), [Node.js 18 - 20](https://nodejs.org/en/download/releases/) are installed.

#### Clone repository

```bash
git clone https://github.com/snowplow/snowplow-javascript-tracker.git
```

#### Install gitleaks

To commit with safety in the repository, preventing sensitive key leakage, we use [gitleaks](https://github.com/gitleaks/gitleaks). Gitleaks runs as a pre-commit hook making sure it can prevent accidental committing of sensitive data.

To install gitleaks, you can follow the [getting started](https://github.com/gitleaks/gitleaks) section on the repository.

_For open source users before the update, you might need to re-run `rush install` to update your git hooks from source._

:warning: To disable gitleaks check, you can run your commit command with the `SKIP=gitleaks` variable. e.g. `SKIP=gitleaks git commit -m "Unsafe commit"`.

#### Building

```bash
npm install -g @microsoft/rush
rush update
rush build
```

## Testing

To run unit tests:

```bash
rush test
```

To run e2e browser tests (locally):

- Add `127.0.0.1 snowplow-js-tracker.local` to your `hosts` file:

```bash
cd trackers/javascript-tracker/
rushx test:e2e:local
```

[![Sauce Labs Test Status][saucelabs-matrix-image]][saucelabs]

## Copyright and license

Licensed and distributed under the [BSD 3-Clause License](LICENSE) ([An OSI Approved License][osi]).

Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang.

All rights reserved.

[website]: https://snowplowanalytics.com
[snowplow]: https://github.com/snowplow/snowplow
[docs]: https://docs.snowplowanalytics.com/
[docker-install]: https://docs.docker.com/install/
[javascript-docs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/
[tech-docs-browser]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/browser-tracker/browser-tracker-v3-reference/
[setup-browser]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/browser-tracker/quick-start-guide/
[tech-docs-js]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/javascript-tracker/javascript-tracker-v3/
[setup-js]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/javascript-tracker/web-quick-start-guide/
[tech-docs-node]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/node-js-tracker/node-js-tracker-v3/
[setup-node]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/node-js-tracker/node-js-tracker-v3/setup/
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
[license-image]: https://img.shields.io/npm/l/@snowplow/javascript-tracker
[tracker-classificiation]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/tracker-maintenance-classification/
[actively-maintained]: https://img.shields.io/static/v1?style=flat&label=Snowplow&message=Actively%20Maintained&color=6638b8&labelColor=9ba0aa&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAeFBMVEVMaXGXANeYANeXANZbAJmXANeUANSQAM+XANeMAMpaAJhZAJeZANiXANaXANaOAM2WANVnAKWXANZ9ALtmAKVaAJmXANZaAJlXAJZdAJxaAJlZAJdbAJlbAJmQAM+UANKZANhhAJ+EAL+BAL9oAKZnAKVjAKF1ALNBd8J1AAAAKHRSTlMAa1hWXyteBTQJIEwRgUh2JjJon21wcBgNfmc+JlOBQjwezWF2l5dXzkW3/wAAAHpJREFUeNokhQOCA1EAxTL85hi7dXv/E5YPCYBq5DeN4pcqV1XbtW/xTVMIMAZE0cBHEaZhBmIQwCFofeprPUHqjmD/+7peztd62dWQRkvrQayXkn01f/gWp2CrxfjY7rcZ5V7DEMDQgmEozFpZqLUYDsNwOqbnMLwPAJEwCopZxKttAAAAAElFTkSuQmCC
