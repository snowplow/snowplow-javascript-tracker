export const config = {
  specs: ['./test/functional/*.test.ts', './test/integration/*.test.ts'],
  logLevel: 'warn',
  baseUrl: 'http://snowplow-js-tracker.local:8080',
  waitforTimeout: 30000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  specFileRetries: 2,
  specFileRetriesDelay: 60, // Delay in seconds between the spec file retry attempts
  specFileRetriesDeferred: false, // Defer retries to the end of the queue
  maxInstances: 5, // Maximum number of total parallel running workers
  framework: 'jasmine',
  reporters: ['spec'],
  jasmineOpts: {
    defaultTimeoutInterval: 120000,
  },
};
