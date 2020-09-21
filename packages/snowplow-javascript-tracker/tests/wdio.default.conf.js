exports.config = {
  runner: 'local',
  path: '/',
  sync: true,
  specs: ['./tests/integration/*.spec.js', './tests/functional/*.spec.js'],
  exclude: ['tests/unit/**/*.spec.js'],
  logLevel: 'warn',
  bail: 0,
  baseUrl: 'http://snowplow-js-tracker.local:8080',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  specFileRetries: 3,

  staticServerFolders: [{ mount: '/', path: './tests/pages' }],
  staticServerPort: 8080,

  framework: 'jasmine',
  reporters: ['spec'],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000,
  },
  beforeSession: function() {
    require('@babel/register')
  }
}
