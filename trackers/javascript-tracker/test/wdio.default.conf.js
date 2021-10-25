exports.config = {
  specs: ['./test/integration/media.test.ts'],
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
};
