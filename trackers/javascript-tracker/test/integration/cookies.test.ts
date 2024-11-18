import { fetchResults } from '../micro';
import { pageSetup } from './helpers';

describe('Tracker created domain cookies across multiple pages', () => {
  let log: Array<unknown> = [];
  let testIdentifier = '';

  beforeAll(async () => {
    testIdentifier = await pageSetup();
    await browser.url('/multi_page_cookies');
    await browser.pause(5000);

    log = await browser.call(async () => await fetchResults());
    log = log.filter((ev) => (ev as any).event.app_id === 'cookies-iframe-' + testIdentifier);
  });

  it('all events should have the same session id', () => {
    expect(log.length).toBeGreaterThanOrEqual(15);

    const sessionIds = log.map((ev) => (ev as any).event.domain_sessionid);
    const uniqueSessionIds = Array.from(new Set(sessionIds));
    expect(uniqueSessionIds.length).toBe(1);
  });
});
