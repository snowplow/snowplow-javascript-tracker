const { config } = require('./wdio.default.conf')

exports.config = {
  ...config,

  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,

  maxInstances: 5,
  capabilities: [
    {
      browserName: 'firefox',
      platform: 'Windows 10',
    },
    {
      browserName: 'firefox',
      platform: 'macOS 10.14',
    },
    {
      browserName: 'chrome',
      platform: 'Windows 10',
    },
    {
      browserName: 'chrome',
      platform: 'macOS 10.14',
    },
    {
      browserName: 'MicrosoftEdge',
      platform: 'Windows 10',
    },
    {
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11',
    },
    {
      browserName: 'internet explorer',
      platform: 'Windows 8',
      version: '10',
    },
    {
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '9',
    },
    /* note the change from platform to platformName
     * that goes with the selenium version switch
     */
    {
      browserName: 'safari',
      browserVersion: 'latest',
      platformName: 'macOS 10.14',
      'sauce:options': { seleniumVersion: '3.14.0' },
    },
    {
      browserName: 'safari',
      browserVersion: '13.0',
      platformName: 'macOS 10.13',
      'sauce:options': { seleniumVersion: '3.14.0' },
    },
    {
      browserName: 'safari',
      browserVersion: '11.0',
      platformName: 'macOS 10.12',
      'sauce:options': { seleniumVersion: '3.14.0' },
    },
    {
      browserName: 'safari',
      platformName: 'macOS 10.12',
      browserVersion: '10.1',
      'sauce:options': { seleniumVersion: '3.14.0' },
    },
    // and back to platform again
    {
      browserName: 'safari',
      platform: 'OS X 10.10',
      browserVersion: '8.0',
    },
  ],
  services: ['static-server', 'sauce'],

  sauceConnect: true,
  sauceConnectOpts: {},
}
