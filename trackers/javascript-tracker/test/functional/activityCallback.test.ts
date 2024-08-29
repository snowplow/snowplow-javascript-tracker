import F from 'lodash/fp';
import { pageSetup } from '../integration/helpers';

declare var trackPageView: () => void;
declare var findMaxX: () => number;
declare var findMaxY: () => number;
declare var getCurrentPageViewId: () => void;
declare var findFirstEventForPageViewId: (id: string) => Record<string, unknown>;
declare var findLastEventForPageViewId: (id: string) => Record<string, unknown>;

describe('Activity tracking with callbacks', () => {
  const browserName = 'browserName' in browser.capabilities && browser.capabilities.browserName;
  if (browserName === 'internet explorer') {
    fit('Skip IE', () => {});
    return;
  }

  beforeAll(async () => {
    await pageSetup();
  });

  it('reports events on scroll', async () => {
    await browser.url('/activity-callback.html?test1');
    await browser.waitUntil(async () => (await $('#init').getText()) === 'true', {
      timeout: 5000,
      timeoutMsg: 'expected init after 5s',
      interval: 250,
    });

    await $('#bottomRight').scrollIntoView();

    await browser.waitUntil(async () => +(await $('#numEvents').getText()) >= 1, {
      timeout: 10000,
      timeoutMsg: 'expected > 1 event after 10s',
    });
    const [maxX, maxY] = await browser.execute(() => {
      return [findMaxX(), findMaxY()];
    });

    expect(maxX).toBeGreaterThan(100);
    expect(maxY).toBeGreaterThan(100);
  });

  it('carries pageviewid change through and resets scroll', async () => {
    await browser.url('/activity-callback.html?test2');
    await browser.waitUntil(async () => (await $('#init').getText()) === 'true', {
      timeout: 5000,
      timeoutMsg: 'expected init after 5s',
      interval: 250,
    });

    await browser.execute(() => window.scrollTo(0, 0));

    await browser.execute(() => {
      getCurrentPageViewId();
    });
    const firstPageViewId = await $('#currentPageViewId').getText();

    await $('#bottomRight').scrollIntoView();
    await $('#middle').scrollIntoView();
    await browser.waitUntil(async () => +(await $('#numEvents').getText()) >= 1, {
      timeout: 10000,
      timeoutMsg: 'expected > 1 event after 10s',
    });

    await browser.execute(() => {
      trackPageView();
    });
    await $('#bottomRight').scrollIntoView();

    await browser.waitUntil(async () => +(await $('#numEvents').getText()) > 1, {
      timeout: 10000,
      timeoutMsg: 'expected > 1 event after 10s',
    });

    await browser.execute(() => {
      getCurrentPageViewId();
    });
    const secondPageViewId = await $('#currentPageViewId').getText();

    // sanity check
    expect(firstPageViewId).not.toEqual(secondPageViewId);

    const first = await browser.execute((id) => {
      return findFirstEventForPageViewId(id);
    }, firstPageViewId);
    const second = await browser.execute((id) => {
      return findLastEventForPageViewId(id);
    }, secondPageViewId);

    const getMinXY = F.at(['minXOffset', 'minYOffset']);

    // the first page view starts at 0,0
    expect(getMinXY(first)).toEqual([0, 0]);

    // but the second starts at #bottomRight and only moves as far as #middle
    // so there is no way it can get to 0,0
    const [secondX, secondY] = getMinXY(second);
    expect(secondX).toBeGreaterThan(0);
    expect(secondY).toBeGreaterThan(0);
  });
});
