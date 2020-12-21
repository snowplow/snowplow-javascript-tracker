exports.config = {
  specs: ['./tests/integration/*.spec.js', './tests/functional/*.spec.js'],
  exclude: ['tests/unit/**/*.spec.js'],
  logLevel: 'warn',
  baseUrl: 'http://snowplow-js-tracker.local:8080',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  specFileRetries: 1,

  framework: 'jasmine',
  reporters: ['spec'],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000,
  },
  beforeSession: function() {
    require('@babel/register')
  }
}
