import { config as defaultConfig } from './wdio.default.conf';

let buildIdentifier = Math.floor(Math.random() * 1000000).toString();
if (process.env.GITHUB_WORKFLOW) {
  buildIdentifier = `${process.env.GITHUB_WORKFLOW}/${process.env.GITHUB_RUN_NUMBER}-${process.env.GITHUB_REF}-${process.env.GITHUB_SHA}`;
}

const buildName = `snowplow-js-tracker-${buildIdentifier}`;

export const config = {
  ...defaultConfig,

  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,

  maxInstances: 5,
  capabilities: [
    {
      browserName: 'firefox',
      platformName: 'Windows 10',
      browserVersion: '96',
      'sauce:options': {
        build: buildName,
      },
    },
    {
      browserName: 'firefox',
      platformName: 'macOS 10.15',
      browserVersion: '96',
      'sauce:options': {
        build: buildName,
      },
    },
    {
      browserName: 'firefox',
      browserVersion: '55.0',
      platformName: 'Windows 10',
      'sauce:options': {
        build: buildName,
      },
    },
    {
      browserName: 'chrome',
      platformName: 'Windows 10',
      browserVersion: '95',
      'sauce:options': {
        build: buildName,
      },
    },
    {
      browserName: 'chrome',
      platformName: 'macOS 10.15',
      browserVersion: '95',
      'sauce:options': {
        build: buildName,
      },
    },
    {
      browserName: 'MicrosoftEdge',
      platformName: 'Windows 10',
      browserVersion: '97',
      'sauce:options': {
        build: buildName,
      },
    },
    {
      browserName: 'MicrosoftEdge',
      platformName: 'Windows 10',
      browserVersion: '13.10586',
      'sauce:options': {
        build: buildName,
      },
    },
    {
      browserName: 'internet explorer',
      platformName: 'Windows 8.1',
      browserVersion: '11',
      'sauce:options': {
        build: buildName,
      },
    },
    {
      browserName: 'internet explorer',
      platformName: 'Windows 8',
      browserVersion: '10',
      'sauce:options': {
        build: buildName,
      },
    },
    {
      browserName: 'safari',
      browserVersion: '14',
      platformName: 'macOS 11.00',
      'sauce:options': {
        build: buildName,
      },
    },
    {
      browserName: 'safari',
      browserVersion: '13.1',
      platformName: 'macOS 10.15',
      'sauce:options': {
        build: buildName,
      },
    },
    {
      browserName: 'safari',
      browserVersion: '12.1',
      platformName: 'macOS 10.13',
      'sauce:options': {
        build: buildName,
      },
    },
    // Legacy Sauce Labs
    {
      browserName: 'safari',
      platform: 'OS X 10.10',
      version: '8.0',
      build: buildName,
    },
    {
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '9',
      build: buildName,
    },
    {
      browserName: 'chrome',
      platform: 'Windows 10',
      version: '60.0',
      build: buildName,
    },
  ],
  services: [
    [
      'sauce',
      {
        sauceConnect: true,
        sauceConnectOpts: {},
      },
    ],
    [
      'static-server',
      {
        folders: [{ mount: '/', path: './test/pages' }],
        port: 8080,
      },
    ],
  ],
};
