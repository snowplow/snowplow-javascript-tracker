import { Capabilities } from "@wdio/types";

const loadUrlAndWait = async (url: string) => {
  await browser.url(url);
  await browser.pause(5000);
  await browser.waitUntil(async () => (await $('#init').getText()) === 'true', {
    timeout: 20000,
    timeoutMsg: 'expected init after 20s',
  });
};

const shouldSkipBrowser = (browser: any) => {
  const capabilities = browser.capabilities as Capabilities.DesiredCapabilities;
  const browserName = capabilities.browserName?.toLowerCase();
  return browserName === 'firefox' || browserName === 'safari';
};

describe('Performance of tracking', () => {
  if (shouldSkipBrowser(browser)) {
    fit('Skip browser', () => { });
    return;
  }

  let noneMeasure: PerformanceMeasure | undefined;
  let cookieMeasure: PerformanceMeasure | undefined;
  let cookieAndLocalStorageMeasure: PerformanceMeasure | undefined;
  let cookieAndLocalStorageSyncMeasure: PerformanceMeasure | undefined;

  beforeAll(async () => {
    await loadUrlAndWait('/track_performance.html?stateStorageStrategy=none');
    noneMeasure = await browser.execute(() => performance.measure('none', 'start', 'end'));

    await loadUrlAndWait('/track_performance.html?stateStorageStrategy=cookie');
    cookieMeasure = await browser.execute(() => performance.measure('cookie', 'start', 'end'));

    await loadUrlAndWait('/track_performance.html?stateStorageStrategy=cookieAndLocalStorage');
    cookieAndLocalStorageMeasure = await browser.execute(() => performance.measure('cookieAndLocalStorage', 'start', 'end'));

    await loadUrlAndWait('/track_performance.html?stateStorageStrategy=cookieAndLocalStorage&synchronousCookieWrite=true');
    cookieAndLocalStorageSyncMeasure = await browser.execute(() => performance.measure('cookieAndLocalStorageSync', 'start', 'end'));

    console.log('state storage strategy: none', noneMeasure?.duration);
    console.log('state storage strategy: cookie', cookieMeasure?.duration);
    console.log('state storage strategy: cookieAndLocalStorage', cookieAndLocalStorageMeasure?.duration);
    console.log('state storage strategy: cookieAndLocalStorageSync', cookieAndLocalStorageSyncMeasure?.duration);
  });

  it('should have a performance log', () => {
    expect(noneMeasure).toBeDefined();
    expect(cookieMeasure).toBeDefined();
    expect(cookieAndLocalStorageMeasure).toBeDefined();
    expect(cookieAndLocalStorageSyncMeasure).toBeDefined();
  });

  it('should have a performance log with a duration', () => {
    expect(noneMeasure?.duration).toBeLessThan(1000);
    expect(cookieMeasure?.duration).toBeLessThan((noneMeasure?.duration ?? 0) * 2);
    expect(cookieAndLocalStorageMeasure?.duration).toBeLessThan((cookieMeasure?.duration ?? 0) * 2);
    expect(cookieAndLocalStorageSyncMeasure?.duration).toBeLessThan((cookieAndLocalStorageMeasure?.duration ?? 0) * 10);
  });
});
