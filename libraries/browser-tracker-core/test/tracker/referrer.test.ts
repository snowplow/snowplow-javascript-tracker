/*
 * Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { createTracker } from '../helpers';

const EXTERNAL_REFERRER = 'https://www.google.com/search?q=snowplow';

/**
 * Simulate a SPA client-side navigation by updating window.location
 * without a page reload, and advancing the tracker's internal URL state.
 */
function navigateTo(path: string) {
  window.history.pushState({}, '', path);
}

describe('Tracker API: preserveOriginalReferrer', () => {
  let referrerSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset URL to a known starting point before each test
    window.history.pushState({}, '', '/test/page.html');
    referrerSpy = jest.spyOn(document, 'referrer', 'get').mockReturnValue(EXTERNAL_REFERRER);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('freezes the original external referrer across SPA navigations when enabled', () => {
    const referrers: string[] = [];
    const tracker = createTracker({
      preserveOriginalReferrer: true,
      plugins: [
        {
          afterTrack: (payload) => {
            referrers.push(payload.refr as string);
          },
        },
      ],
    });

    // First page view — referrer should be the external referrer
    tracker?.trackPageView();

    // Simulate SPA navigation to a different route
    navigateTo('/test/about.html');
    tracker?.trackPageView();

    // Simulate another SPA navigation
    navigateTo('/test/contact.html');
    tracker?.trackPageView();

    // All three page views should report the original external referrer
    expect(referrers).toHaveLength(3);
    expect(referrers[0]).toBe(EXTERNAL_REFERRER);
    expect(referrers[1]).toBe(EXTERNAL_REFERRER);
    expect(referrers[2]).toBe(EXTERNAL_REFERRER);
  });

  it('is a no-op when document.referrer is empty at init (direct navigation)', () => {
    // Override the referrer spy to return empty string (direct navigation)
    referrerSpy.mockReturnValue('');

    const referrers: string[] = [];
    const tracker = createTracker({
      preserveOriginalReferrer: true,
      plugins: [
        {
          afterTrack: (payload) => {
            referrers.push((payload.refr as string) ?? '');
          },
        },
      ],
    });

    // First page view — no external referrer, so refr is empty
    tracker?.trackPageView();
    const firstRefr = referrers[0];

    // Navigate to a new route — now the previous internal URL becomes the referrer
    navigateTo('/test/about.html');
    tracker?.trackPageView();

    // The second page view should have the previous internal URL as referrer
    // (not frozen to empty string), proving the no-op behaviour
    expect(referrers).toHaveLength(2);
    expect(firstRefr ?? '').toBe('');
    // The second referrer should be set to the previous page's URL (internal chain intact)
    expect(referrers[1]).toContain('/test/page.html');
  });

  it('allows setReferrerUrl to override the preserved referrer after init', () => {
    const referrers: string[] = [];
    const tracker = createTracker({
      preserveOriginalReferrer: true,
      plugins: [
        {
          afterTrack: (payload) => {
            referrers.push(payload.refr as string);
          },
        },
      ],
    });

    // Override with an explicit custom referrer after init
    tracker?.setReferrerUrl('https://custom.com/landing');
    tracker?.trackPageView();

    navigateTo('/test/about.html');
    tracker?.trackPageView();

    // The explicit setReferrerUrl call wins (last-write-wins on customReferrer)
    expect(referrers[0]).toBe('https://custom.com/landing');
    expect(referrers[1]).toBe('https://custom.com/landing');
  });

  it('does not affect SPA referrer chain when option is absent', () => {
    const referrers: string[] = [];
    const tracker = createTracker({
      // preserveOriginalReferrer not set — default behaviour
      plugins: [
        {
          afterTrack: (payload) => {
            referrers.push((payload.refr as string) ?? '');
          },
        },
      ],
    });

    // First page view uses document.referrer
    tracker?.trackPageView();

    // Navigate — second page view should use the previous internal URL as referrer
    navigateTo('/test/about.html');
    tracker?.trackPageView();

    expect(referrers).toHaveLength(2);
    expect(referrers[0]).toBe(EXTERNAL_REFERRER);
    // After SPA navigation the referrer becomes the previous internal URL
    expect(referrers[1]).toContain('/test/page.html');
  });
});
