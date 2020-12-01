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
  specFileRetries: 0,
  logLevel: 'debug',
  bail: 1,
  services: [
    ['chromedriver', {}],
    ['static-server', {
      folders: [
        { mount: '/', path: './tests/pages' }
      ],
      port: 8080
    }]
  ],
}
