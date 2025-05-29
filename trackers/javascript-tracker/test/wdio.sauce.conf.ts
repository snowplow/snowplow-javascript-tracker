import { Options } from '@wdio/types';
import { config as defaultConfig } from './wdio.default.conf';

let buildIdentifier = Math.floor(Math.random() * 1000000).toString();
if (process.env.GITHUB_WORKFLOW) {
  buildIdentifier = `${process.env.GITHUB_WORKFLOW}/${process.env.GITHUB_RUN_NUMBER}-${process.env.GITHUB_REF}-${process.env.GITHUB_SHA}`;
}

const buildName = `snowplow-js-tracker-${buildIdentifier}`;

export const config: Partial<Options.Testrunner> = {
  ...defaultConfig,

  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,

  maxInstances: 5,
  capabilities: [
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
      browserVersion: '78',
      platformName: 'Windows 10',
      'sauce:options': {
        build: buildName,
      },
    },
    {
      browserName: 'chrome',
      platformName: 'Windows 10',
      browserVersion: '109',
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
      browserVersion: 'latest',
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
    'shared-store',
  ],
};
