const loadUrlAndWait = async (url: string) => {
  await browser.url(url);
  await browser.pause(5000);
  await browser.waitUntil(async () => (await $('#init').getText()) === 'true', {
    timeout: 20000,
    timeoutMsg: 'expected init after 20s',
  });
};

describe('Performance of tracking', () => {
  let noneMeasure: PerformanceMeasure | undefined;
  let cookieMeasure: PerformanceMeasure | undefined;
  let cookieAndLocalStorageMeasure: PerformanceMeasure | undefined;

  beforeAll(async () => {
    await loadUrlAndWait('/track_performance.html?stateStorageStrategy=none');
    noneMeasure = await browser.execute(() => performance.measure('none', 'start', 'end'));

    await loadUrlAndWait('/track_performance.html?stateStorageStrategy=cookie');
    cookieMeasure = await browser.execute(() => performance.measure('cookie', 'start', 'end'));

    await loadUrlAndWait('/track_performance.html?stateStorageStrategy=cookieAndLocalStorage');
    cookieAndLocalStorageMeasure = await browser.execute(() => performance.measure('cookieAndLocalStorage', 'start', 'end'));

    console.log('state storage strategy: none', noneMeasure?.duration);
    console.log('state storage strategy: cookie', cookieMeasure?.duration);
    console.log('state storage strategy: cookieAndLocalStorage', cookieAndLocalStorageMeasure?.duration);
  });

  it('should have a performance log', () => {
    expect(noneMeasure).toBeDefined();
    expect(cookieMeasure).toBeDefined();
    expect(cookieAndLocalStorageMeasure).toBeDefined();
  });

  it('should have a performance log with a duration', () => {
    expect(noneMeasure?.duration).toBeLessThan(1000);
    expect(cookieMeasure?.duration).toBeLessThan((noneMeasure?.duration ?? 0) * 2);
    expect(cookieAndLocalStorageMeasure?.duration).toBeLessThan((cookieMeasure?.duration ?? 0) * 2);
  });
});
