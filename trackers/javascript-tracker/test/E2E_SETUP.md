# End-to-end tests setup

## Local runs

The end-to-end testing setup options used by the `rushx test:e2e:local` can be found in [wdio.local.conf.ts](./wdio.local.conf.ts).

By default, the enabled driver for local tests is the `chromedriver` which will instrument a local chrome instance. The version of the corresponding `chromedriver` package in the [package.json](../package.json) file should be one matching to your local chrome version. E.g. for Chrome version 140, you need to install `chromedriver@140`.

To enable testing with other browsers such as Microsoft Edge and Safari, you need to:
1. Uncomment the capabilities and services entries on [wdio.local.conf.ts](./wdio.local.conf.ts).
2. Install the `safaridriver` and/or `msedgedriver` on your local machine. _(Instructions will depend on your OS.)_
3. Start any driver program you want before running the tests.
4. In case of driver port conflicts, you can adjust each driver by their respective configuration.

<!-- 
TODO 
- Remove pinned chromedriver from package.json and expect local installation and availability.
- Add Firefox instructions.
-->