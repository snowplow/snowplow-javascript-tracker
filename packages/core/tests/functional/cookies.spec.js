/*
 * JavaScript tracker for Snowplow: tests/functional/cookies.spec.js
 *
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright
 * 2012-2020 Snowplow Analytics Ltd. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
 *   names of their contributors may be used to endorse or promote products
 *   derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

describe('Tracker created domain cookies', () => {
  it('contain the expected cookie names', () => {
    browser.url('/cookies.html')
    browser.waitUntil(
      () => $('#init').getText() === 'true',
      {
        timeout: 5000,
        timeoutMsg: 'expected init after 5s',
        interval: 250
      }
    )

    browser.waitUntil(
      () => $('#cookies').getText() !== '',
      {
        timeout: 5000,
        timeoutMsg: 'expected cookie to be set after 5s',
        interval: 250
      }
    )

    const cookies = $('#cookies').getText();

    expect(cookies).not.toContain('_sp_0ses.'); // Missing as tests are not HTTPS and `cookieSecure: true` by default
    expect(cookies).not.toContain('_sp_0id.');
    expect(cookies).not.toContain('_sp_3es.'); // Missing as cookie lifetime is too short (1)
    expect(cookies).not.toContain('_sp_3id.');
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

    expect($('#getDomainUserId').getText()).toMatch(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/i);
    expect($('#getDomainUserInfo').getText()).toMatch(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b.[0-9]+.[0-9].[0-9]+.[0-9]+.\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/i);
    expect($('#getUserId').getText()).toBe('Dave');
    expect($('#getCookieName').getText()).toMatch(/_sp_1id.[0-9a-z]{4}/i);
    expect($('#getPageViewId').getText()).toMatch(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/i);
  })
})