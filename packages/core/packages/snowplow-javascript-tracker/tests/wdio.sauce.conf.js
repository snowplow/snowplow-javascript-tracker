const { config } = require('./wdio.default.conf')

const buildName = `snowplow-js-tracker-${process.env.GITHUB_WORKFLOW}/${process.env.GITHUB_RUN_NUMBER}-${process.env.GITHUB_REF}-${process.env.GITHUB_SHA}`

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
        'build': buildName,
      },
    },
    {
      browserName: 'firefox',
      platformName: 'macOS 10.15',
      browserVersion: 'latest',
      'sauce:options': {
        'build': buildName,
      },
    },
    {
      browserName: 'chrome',
      platformName: 'Windows 10',
      browserVersion: 'latest',
      'sauce:options': {
        'build': buildName,
      },
    },
    {
      browserName: 'chrome',
      platformName: 'macOS 10.15',
      browserVersion: 'latest',
      'sauce:options': {
        'build': buildName,
      },
    },
    {
      browserName: 'MicrosoftEdge',
      platformName: 'Windows 10',
      browserVersion: 'latest',
      'sauce:options': {
        'build': buildName,
      },
    },
    {
      browserName: 'MicrosoftEdge',
      platformName: 'Windows 10',
      browserVersion: '13.10586',
      'sauce:options': {
        'build': buildName,
      },
    },
    {
      browserName: 'internet explorer',
      platformName: 'Windows 8.1',
      browserVersion: '11',
      'sauce:options': {
        'build': buildName,
      },
    },
    {
      browserName: 'internet explorer',
      platformName: 'Windows 8',
      browserVersion: '10',
      'sauce:options': {
        'build': buildName,
      },
    },
    {
      browserName: 'safari',
      browserVersion: '14',
      platformName: 'macOS 11.00',
      'sauce:options': { 
        seleniumVersion: '3.14.0',
        'build': buildName,
      },
    },
    {
      browserName: 'safari',
      browserVersion: '13.1',
      platformName: 'macOS 10.15',
      'sauce:options': { 
        seleniumVersion: '3.14.0',
        'build': buildName,
      },
    },
    {
      browserName: 'safari',
      browserVersion: '12.1',
      platformName: 'macOS 10.13',
      'sauce:options': { 
        seleniumVersion: '3.14.0',
        'build': buildName,
      },
    },
    // Legacy Sauce Labs 
    {
      browserName: 'safari',
      platform: 'OS X 10.10',
      version: '8.0',
      build: buildName,
    },
    {
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '9',
      build: buildName,
    },
    {
      browserName: 'firefox',
      platform: 'Windows 10',
      version: '53.0',
      build: buildName,
    },
    {
      browserName: 'chrome',
      platform: 'Windows 10',
      version: '60.0',
      build: buildName,
    },
  ],
  services: [
    ['sauce', {
      sauceConnect: true,
      sauceConnectOpts: {}
    }], 
    ['static-server', {
      folders: [
        { mount: '/', path: './tests/pages' }
      ],
      port: 8080
    }]
  ]
}
