import { Options } from '@wdio/types';
import { config as defaultConfig } from './wdio.default.conf';

export const config: Partial<Options.Testrunner> = {
  ...defaultConfig,

  maxInstances: 2,
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: ['--auto-open-devtools-for-tabs'],
      },
    },
    // {
    //   browserName: 'safari',
    // },
    // {
    //   browserName: 'MicrosoftEdge',
    //   port: 9515,
    //   'ms:edgeOptions': {
    //     args: ['--auto-open-devtools-for-tabs'],
    //   },
    // }
  ],
  specFileRetries: 0,
  logLevel: 'info',
  bail: 4,
  services: [
    'chromedriver',
    // 'safaridriver',
    // 'edgedriver',
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
