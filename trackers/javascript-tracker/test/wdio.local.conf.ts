import { config as defaultConfig } from './wdio.default.conf';

export const config = {
  ...defaultConfig,

  maxInstances: 1,
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: ['--auto-open-devtools-for-tabs'],
      },
    },
  ],
  specFileRetries: 0,
  logLevel: 'debug',
  bail: 1,
  services: [
    ['chromedriver', {}],
    [
      'static-server',
      {
        folders: [{ mount: '/', path: './test/pages' }],
        port: 8080,
      },
    ],
  ],
};
