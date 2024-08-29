import { WaitUntilOptions } from 'webdriverio';
import util from 'util';
import { Capabilities } from '@wdio/types';

declare module WebdriverIO {
  interface Browser {
    pause: (interval: number) => Promise<unknown>;
  }
}

export const dumpLog = (log: Array<unknown>) => console.log(util.inspect(log, true, null, true));

/**
 * This is a custom implementation of `browser.waitUntil` provided by WDIO as that
 * became unreliable and exited too early. Can be removed once `browser.waitUntil`
 * behaves reliably.
 */
export const waitUntil = async (
  browser: WebdriverIO.Browser,
  condition: () => Promise<boolean>,
  { interval, timeout, timeoutMsg }: Partial<WaitUntilOptions> = {}
) => {
  timeout = timeout ?? 5000;
  interval = interval ?? 500;
  let iterations = timeout / interval;
  for (let i = 1; ; i++) {
    await browser.pause(interval);
    let result = await condition();
    if (i >= iterations) {
      if (!result) {
        throw new Error(timeoutMsg ?? 'Timeout while waiting');
      }
      break;
    } else if (result) {
      break;
    }
  }
};

/**
 * Initiates the `index.html` page and sets:
 * 1. the value for the micro container url in a cookie named `container`.
 * 2. the value for the current test identifier in a cookie named `testIdentifier`.
 *
 * @returns {string} The identifier for this test, similar to the cookie set on the page. This identifier is commonly used in custom matchers for events.
 */
export async function pageSetup() {
  const dockerUrl = (await browser.sharedStore.get('dockerInstanceUrl')) as string;
  if (!dockerUrl) {
    throw 'dockerInstanceUrl not available in `browser.sharedStore`';
  }
  const capabilities = browser.capabilities as Capabilities.DesiredCapabilities;
  const testIdentifier = capabilities.browserName + '_' + capabilities.browserVersion + '_' + Math.random();
  await browser.url('/index.html');
  await browser.setCookies([
    { name: 'container', value: dockerUrl },
    { name: 'testIdentifier', value: testIdentifier },
  ]);

  return testIdentifier;
}
