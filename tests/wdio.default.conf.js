exports.config = {
  specs: ['./tests/integration/*.spec.js', './tests/functional/*.spec.js'],
  exclude: ['tests/unit/**/*.spec.js'],
  logLevel: 'warn',
  baseUrl: 'http://snowplow-js-tracker.local:8080',
  waitforTimeout: 30000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  specFileRetries: 1,

  framework: 'jasmine',
  reporters: ['spec'],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 120000,
  },
  beforeSession: function() {
    require('@babel/register')
  }
}
