describe('Tracker created domain cookies', () => {
  it('contain the expected cookie names', async () => {
    await browser.url('/cookies.html');
    await browser.waitUntil(async () => (await $('#init').getText()) === 'true', {
      timeout: 5000,
      timeoutMsg: 'expected init after 5s',
      interval: 250,
    });

    await browser.waitUntil(async () => (await $('#cookies').getText()) !== '', {
      timeout: 5000,
      timeoutMsg: 'expected cookie to be set after 5s',
      interval: 250,
    });

    const cookies = await $('#cookies').getText();

    expect(cookies).not.toContain('_sp_0ses.'); // Missing as tests are not HTTPS and `cookieSecure: true` by default
    expect(cookies).not.toContain('_sp_0id.');
    // skipping the test for the sp_3 cookies being dropped since it is very flaky on Chrome
    // expect(cookies).not.toContain('_sp_3ses.'); // Missing as cookie lifetime is too short (1)
    // expect(cookies).not.toContain('_sp_3id.');
    expect(cookies).not.toContain('_sp_4ses.'); // Missing as anonymous tracking enabled
    expect(cookies).not.toContain('_sp_4id.');
    expect(cookies).not.toContain('_sp_5ses.'); // Missing as only using local storage
    expect(cookies).not.toContain('_sp_5id.');
    expect(cookies).not.toContain('_sp_7ses.'); // Can't set a cookie for another domain
    expect(cookies).not.toContain('_sp_7id.');

    expect(cookies).toContain('_sp_1ses.');
    expect(cookies).toContain('_sp_1id.');
    expect(cookies).toContain('_sp_2ses.');
    expect(cookies).toContain('_sp_2id.');
    expect(cookies).toContain('_sp_6ses.');
    expect(cookies).toContain('_sp_6id.');

    expect(await $('#getDomainUserId').getText()).toMatch(
      /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/i
    );
    expect(await $('#getDomainUserInfo').getText()).toMatch(
      /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b.[0-9]+.[0-9].[0-9]+.[0-9]*.\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b.(\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b)?.(\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b)?.[0-9]*.[0-9]+/i
    );
    expect(await $('#getUserId').getText()).toBe('Dave');
    expect(await $('#getCookieName').getText()).toMatch(/_sp_1id.[0-9a-z]{4}/i);
    expect(await $('#getPageViewId').getText()).toMatch(
      /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/i
    );
  });
});
