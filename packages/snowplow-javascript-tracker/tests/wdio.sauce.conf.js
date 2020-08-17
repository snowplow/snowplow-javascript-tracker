const { config } = require('./wdio.default.conf')

exports.config = {
  ...config,

  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,

  maxInstances: 5,
  capabilities: [
    {
      browserName: 'firefox',
      platformName: 'Windows 10',
      browserVersion: 'latest',
      'sauce:options': {
        'build': 'snowplow-js-tracker-v2.15.0',
      },
    },
    {
      browserName: 'firefox',
      platformName: 'macOS 10.14',
      browserVersion: 'latest',
      'sauce:options': {
        'build': 'snowplow-js-tracker-v2.15.0',
      },
    },
    {
      browserName: 'chrome',
      platformName: 'Windows 10',
      browserVersion: 'latest',
      'sauce:options': {
        'build': 'snowplow-js-tracker-v2.15.0',
      },
    },
    {
      browserName: 'chrome',
      platformName: 'macOS 10.14',
      browserVersion: 'latest',
      'sauce:options': {
        'build': 'snowplow-js-tracker-v2.15.0',
      },
    },
    {
      browserName: 'MicrosoftEdge',
      platformName: 'Windows 10',
      browserVersion: 'latest',
      'sauce:options': {
        'build': 'snowplow-js-tracker-v2.15.0',
      },
    },
    {
      browserName: 'MicrosoftEdge',
      platformName: 'Windows 10',
      browserVersion: '13',
      'sauce:options': {
        'build': 'snowplow-js-tracker-v2.15.0',
      },
    },
    {
      browserName: 'internet explorer',
      platformName: 'Windows 8.1',
      browserVersion: '11',
      'sauce:options': {
        'build': 'snowplow-js-tracker-v2.15.0',
      },
    },
    {
      browserName: 'internet explorer',
      platformName: 'Windows 8',
      browserVersion: '10',
      'sauce:options': {
        'build': 'snowplow-js-tracker-v2.15.0',
      },
    },
    {
      browserName: 'safari',
      browserVersion: 'latest',
      platformName: 'macOS 10.14',
      'sauce:options': { 
        seleniumVersion: '3.14.0',
        'build': 'snowplow-js-tracker-v2.15.0',
      },
    },
    {
      browserName: 'safari',
      browserVersion: '11.0',
      platformName: 'macOS 10.12',
      'sauce:options': { 
        seleniumVersion: '3.14.0',
        'build': 'snowplow-js-tracker-v2.15.0',
      },
    },
    // Legacy Sauce Labs 
    {
      browserName: 'safari',
      platform: 'OS X 10.10',
      version: '8.0',
      build: 'snowplow-js-tracker-v2.15.0',
    },
    {
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '9',
      build: 'snowplow-js-tracker-v2.15.0',
    },
  ],
  services: ['static-server', 'sauce'],
  sauceConnect: true,
  sauceConnectOpts: {},
}
