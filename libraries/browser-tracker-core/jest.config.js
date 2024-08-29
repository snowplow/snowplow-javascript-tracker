module.exports = {
  preset: 'ts-jest',
  reporters: ['jest-standard-reporter'],
  testEnvironment: 'jest-environment-jsdom-global',
  setupFilesAfterEnv: ['../../setupTestGlobals.ts'],
  testEnvironmentOptions: {
    url: 'https://snowplow-js-tracker.local/test/page.html',
    referrer: 'https://example.com/',
  },
};
