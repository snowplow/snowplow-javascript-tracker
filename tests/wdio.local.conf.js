const { config } = require('./wdio.default.conf')

exports.config = {
  ...config,

  maxInstances: 1,
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: ['--auto-open-devtools-for-tabs'],
      },
    },
  ],
  logLevel: 'debug',
  bail: 1,
  services: ['chromedriver', 'static-server'],
}
