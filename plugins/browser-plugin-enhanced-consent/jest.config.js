module.exports = {
  preset: 'ts-jest',
  reporters: ['jest-standard-reporter'],
  setupFilesAfterEnv: ['../../setupTestGlobals.ts'],
  testEnvironment: 'jest-environment-jsdom-global',
};
