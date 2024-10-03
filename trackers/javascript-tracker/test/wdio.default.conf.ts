import { DockerWrapper, start, stop } from './micro';
import { setValue } from '@wdio/shared-store-service';
import type { Options } from '@wdio/types';

function getFullPath(path: string): string {
  return process.cwd() + '/' + path;
}

type CustomTestRunnerConfig = Options.Testrunner & { dockerInstance?: DockerWrapper };

export const config: Omit<Options.Testrunner, 'capabilities'> = {
  specs: [[
    getFullPath('test/functional/*.test.ts'),
    getFullPath('test/integration/*.test.ts'),
    getFullPath('test/media/media.test.ts'),
    getFullPath('test/performance/*.test.ts'),
    // YouTube and Vimeo tests are disabled since they block SauceLabs on CI
  ]],
  logLevel: 'warn',
  baseUrl: 'http://snowplow-js-tracker.local:8080',
  waitforTimeout: 30000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  specFileRetries: 1,
  specFileRetriesDelay: 60, // Delay in seconds between the spec file retry attempts
  specFileRetriesDeferred: true, // Defer retries to the end of the queue
  maxInstances: 5, // Maximum number of total parallel running workers
  framework: 'jasmine',
  reporters: ['spec'],
  jasmineOpts: {
    defaultTimeoutInterval: 120000,
  },
  async onPrepare(config: CustomTestRunnerConfig) {
    const isSauce = config.services?.some((service) => Array.isArray(service) && service[0] === 'sauce');
    config.dockerInstance = await start(isSauce);
    await setValue('dockerInstanceUrl', config.dockerInstance.url);
    return;
  },
  async onComplete(_, config: CustomTestRunnerConfig) {
    await stop(config.dockerInstance!.container);
  },
};
