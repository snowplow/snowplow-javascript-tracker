module.exports = {
  preset: 'react-native',
  reporters: ['jest-standard-reporter'],
  transformIgnorePatterns: [],
  setupFilesAfterEnv: ['../../setupTestGlobals.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
};
