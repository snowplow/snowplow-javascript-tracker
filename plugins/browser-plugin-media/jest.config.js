module.exports = {
  preset: 'ts-jest',
  reporters: ['jest-standard-reporter'],
  testEnvironment: 'jest-environment-jsdom-global',
  setupFilesAfterEnv: ['../../setupTestGlobals.ts'],
};
