import F from 'lodash/fp';
import { DockerWrapper, clearCache, fetchResults, start, stop } from '../micro';
import { waitUntil } from './helpers';

describe('onSessionUpdate callback feature', () => {
  if (
    browser.capabilities.browserName === 'internet explorer' &&
    (browser.capabilities.version === '9' || browser.capabilities.browserVersion === '10')
  ) {
    fit('Skip IE 9 and 10', () => true);
    return;
  }

  if (browser.capabilities.browserName === 'safari' && browser.capabilities.version === '8.0') {
    fit('Skip Safari 8', () => true);
    return;
  }

  let log: Array<unknown> = [];
  let docker: DockerWrapper;

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
    await browser.call(async () => (docker = await start()));
    await waitUntil(browser, async () => {
      return await browser.call(async () => await clearCache(docker.url));
    });
    await browser.url('/index.html');
    await browser.setCookies({ name: 'container', value: docker.url });
    await loadUrlAndWait('/session-update-callback.html');
    await browser.pause(2000);
    log = await browser.call(async () => await fetchResults(docker.url));
    await browser.pause(2000);
  });

  afterAll(async () => {
    await browser.call(async () => await stop(docker?.container));
  });

  it(`properly runs the onSessionCallback`, async () => {
    expect(
      logContains({
        event: {
          app_id: `onSessionCallback`,
          event: 'struct',
          se_category: 'session_callback',
          se_action: 'called',
        },
      })
    ).toBe(true);
    expect(log.length).toEqual(2);
  });
});
