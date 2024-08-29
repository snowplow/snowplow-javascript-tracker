import F from 'lodash/fp';
import { fetchResults } from '../micro';
import { pageSetup } from './helpers';
import { Capabilities } from '@wdio/types';

describe('onSessionUpdate callback feature', () => {
  const capabilities = browser.capabilities as Capabilities.DesiredCapabilities;
  if (
    capabilities.browserName === 'internet explorer' &&
    (capabilities.version === '9' || capabilities.browserVersion === '10')
  ) {
    fit('Skip IE 9 and 10', () => {});
    return;
  }

  if (capabilities.browserName === 'safari' && capabilities.version === '8.0') {
    fit('Skip Safari 8', () => {});
    return;
  }

  let log: Array<unknown> = [];
  let testIdentifier = '';

  const logContains = (ev: unknown) => F.some(F.isMatch(ev as object), log);

  const loadUrlAndWait = async (url: string) => {
    await browser.url(url);
    await browser.waitUntil(async () => (await $('#init').getText()) === 'true', {
      timeout: 5000,
      timeoutMsg: 'expected init after 5s',
      interval: 250,
    });
  };

  beforeAll(async () => {
    testIdentifier = await pageSetup();
    await loadUrlAndWait('/session-update-callback.html');
    await browser.pause(2000);
    log = await browser.call(async () => await fetchResults());
  });

  it(`properly runs the onSessionCallback`, async () => {
    expect(
      logContains({
        event: {
          app_id: 'onSessionCallback' + testIdentifier,
          event: 'struct',
          se_category: 'session_callback',
          se_action: 'called',
        },
      })
    ).toBe(true);
    const results = log.filter((event: any) => event.event.app_id === 'onSessionCallback' + testIdentifier);
    expect(results.length).toEqual(2);
  });
});
