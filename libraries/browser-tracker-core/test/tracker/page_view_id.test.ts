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

describe('Tracker API: page view IDs', () => {
  it('Keeps the page view ID when URL changes', () => {
    const tracker = createTracker();
    tracker?.setCustomUrl('http://example.com/1');
    const pageView1 = tracker?.getPageViewId();
    tracker?.setCustomUrl('http://example.com/2');
    const pageView2 = tracker?.getPageViewId();

    expect(pageView1).toEqual(pageView2);
  });

  describe('preservePageViewIdForUrl: false', () => {
    it('Generates new page view ID on second page view', () => {
      const tracker = createTracker();
      tracker?.preservePageViewIdForUrl(false);

      const pageView1 = tracker?.getPageViewId();

      tracker?.trackPageView();
      const pageView2 = tracker?.getPageViewId();
      const pageView3 = tracker?.getPageViewId();

      tracker?.trackPageView();
      const pageView4 = tracker?.getPageViewId();

      expect(pageView1).toEqual(pageView2);
      expect(pageView2).toEqual(pageView3);
      expect(pageView3).not.toEqual(pageView4);
    });

    it("Doesn't generate new page view ID when URL is changed", () => {
      const tracker = createTracker();
      tracker?.preservePageViewIdForUrl(false);

      tracker?.setCustomUrl('http://example.com/1');
      const pageView1 = tracker?.getPageViewId();

      tracker?.setCustomUrl('http://example.com/2');
      const pageView2 = tracker?.getPageViewId();

      expect(pageView1).toEqual(pageView2);
    });
  });

  describe('preservePageViewIdForUrl: full', () => {
    it("Generates new page view ID on second page view on the same URL", () => {
      const tracker = createTracker();
      tracker?.preservePageViewIdForUrl('full');

      const pageView1 = tracker?.getPageViewId();

      tracker?.trackPageView();
      const pageView2 = tracker?.getPageViewId();

      tracker?.trackPageView();
      const pageView3 = tracker?.getPageViewId();

      expect(pageView1).toEqual(pageView2);
      expect(pageView2).not.toEqual(pageView3);
    });

    it("Doesn't generate new page view ID for the same URL", () => {
      const tracker = createTracker();
      tracker?.preservePageViewIdForUrl('full');

      tracker?.setCustomUrl('http://example.com/1');
      const pageView1 = tracker?.getPageViewId();

      const pageView2 = tracker?.getPageViewId();

      expect(pageView1).toEqual(pageView2);
    });

    it('Generates new page view ID when URL changes', () => {
      const tracker = createTracker();
      tracker?.preservePageViewIdForUrl('full');

      tracker?.setCustomUrl('http://example.com/1');
      const pageView1 = tracker?.getPageViewId();

      tracker?.setCustomUrl('http://example.com/2');
      const pageView2 = tracker?.getPageViewId();

      expect(pageView1).not.toEqual(pageView2);
    });

    it('Generates new page view ID when hash param changes', () => {
      const tracker = createTracker();
      tracker?.preservePageViewIdForUrl('full');

      tracker?.setCustomUrl('http://example.com/#1');
      const pageView1 = tracker?.getPageViewId();

      tracker?.setCustomUrl('http://example.com/#2');
      const pageView2 = tracker?.getPageViewId();

      expect(pageView1).not.toEqual(pageView2);
    });

    it('Generates new page view ID when search param changes', () => {
      const tracker = createTracker();
      tracker?.preservePageViewIdForUrl('full');

      tracker?.setCustomUrl('http://example.com/?test=1');
      const pageView1 = tracker?.getPageViewId();

      tracker?.setCustomUrl('http://example.com/?test=2');
      const pageView2 = tracker?.getPageViewId();

      expect(pageView1).not.toEqual(pageView2);
    });

    it('Works the same way if set to true', () => {
      const tracker = createTracker();
      tracker?.preservePageViewIdForUrl(true);

      tracker?.setCustomUrl('http://example.com/#1');
      const pageView1 = tracker?.getPageViewId();

      tracker?.setCustomUrl('http://example.com/#2');
      const pageView2 = tracker?.getPageViewId();

      expect(pageView1).not.toEqual(pageView2);
    });

    it('Works the same way if configured through createTracker', () => {
      const tracker = createTracker({ preservePageViewIdForUrl: 'full' });

      tracker?.setCustomUrl('http://example.com/?test=1');
      const pageView1 = tracker?.getPageViewId();

      tracker?.setCustomUrl('http://example.com/?test=2');
      const pageView2 = tracker?.getPageViewId();

      expect(pageView1).not.toEqual(pageView2);
    });
  });

  describe('preservePageViewIdForUrl: pathname', () => {
    it("Generates new page view ID on second page view on the same URL", () => {
      const tracker = createTracker();
      tracker?.preservePageViewIdForUrl('pathname');

      const pageView1 = tracker?.getPageViewId();

      tracker?.trackPageView();
      const pageView2 = tracker?.getPageViewId();

      tracker?.trackPageView();
      const pageView3 = tracker?.getPageViewId();

      expect(pageView1).toEqual(pageView2);
      expect(pageView2).not.toEqual(pageView3);
    });

    it("Doesn't generate new page view ID for the same URL", () => {
      const tracker = createTracker();
      tracker?.preservePageViewIdForUrl('pathname');

      tracker?.setCustomUrl('http://example.com/1');
      const pageView1 = tracker?.getPageViewId();

      const pageView2 = tracker?.getPageViewId();

      expect(pageView1).toEqual(pageView2);
    });

    it("Doesn't generate new page view ID when hash param changes", () => {
      const tracker = createTracker();
      tracker?.preservePageViewIdForUrl('pathname');

      tracker?.setCustomUrl('http://example.com/#1');
      const pageView1 = tracker?.getPageViewId();

      tracker?.setCustomUrl('http://example.com/#2');
      const pageView2 = tracker?.getPageViewId();

      expect(pageView1).toEqual(pageView2);
    });

    it("Doesn't generate new page view ID when search param changes", () => {
      const tracker = createTracker();
      tracker?.preservePageViewIdForUrl('pathname');

      tracker?.setCustomUrl('http://example.com/?test=1');
      const pageView1 = tracker?.getPageViewId();

      tracker?.setCustomUrl('http://example.com/?test=2');
      const pageView2 = tracker?.getPageViewId();

      expect(pageView1).toEqual(pageView2);
    });

    it('Generates a new page view ID when the path changes', () => {
      const tracker = createTracker();
      tracker?.preservePageViewIdForUrl('pathname');

      tracker?.setCustomUrl('http://example.com/1');
      const pageView1 = tracker?.getPageViewId();

      tracker?.setCustomUrl('http://example.com/2');
      const pageView2 = tracker?.getPageViewId();

      expect(pageView1).not.toEqual(pageView2);
    });
  });

  describe('preservePageViewIdForUrl: pathnameAndSearch', () => {
    it("Generates new page view ID on second page view on the same URL", () => {
      const tracker = createTracker();
      tracker?.preservePageViewIdForUrl('pathnameAndSearch');

      const pageView1 = tracker?.getPageViewId();

      tracker?.trackPageView();
      const pageView2 = tracker?.getPageViewId();

      tracker?.trackPageView();
      const pageView3 = tracker?.getPageViewId();

      expect(pageView1).toEqual(pageView2);
      expect(pageView2).not.toEqual(pageView3);
    });

    it("Doesn't generate new page view ID for the same URL", () => {
      const tracker = createTracker();
      tracker?.preservePageViewIdForUrl('pathnameAndSearch');

      tracker?.setCustomUrl('http://example.com/1');
      const pageView1 = tracker?.getPageViewId();

      const pageView2 = tracker?.getPageViewId();

      expect(pageView1).toEqual(pageView2);
    });

    it("Doesn't generate new page view ID when hash param changes", () => {
      const tracker = createTracker();
      tracker?.preservePageViewIdForUrl('pathnameAndSearch');

      tracker?.setCustomUrl('http://example.com/#1');
      const pageView1 = tracker?.getPageViewId();

      tracker?.setCustomUrl('http://example.com/#2');
      const pageView2 = tracker?.getPageViewId();

      expect(pageView1).toEqual(pageView2);
    });

    it('Generates new page view ID when search param changes', () => {
      const tracker = createTracker();
      tracker?.preservePageViewIdForUrl('pathnameAndSearch');

      tracker?.setCustomUrl('http://example.com/?test=1');
      const pageView1 = tracker?.getPageViewId();

      tracker?.setCustomUrl('http://example.com/?test=2');
      const pageView2 = tracker?.getPageViewId();

      expect(pageView1).not.toEqual(pageView2);
    });

    it('Generates a new page view ID when the path changes', () => {
      const tracker = createTracker();
      tracker?.preservePageViewIdForUrl('pathnameAndSearch');

      tracker?.setCustomUrl('http://example.com/1');
      const pageView1 = tracker?.getPageViewId();

      tracker?.setCustomUrl('http://example.com/2');
      const pageView2 = tracker?.getPageViewId();

      expect(pageView1).not.toEqual(pageView2);
    });
  });

  describe('Multiple trackers with a shared state', () => {
    it('Keeps the page view ID for each page view pairs', () => {
      const tracker1 = createTracker();
      const tracker2 = createTracker(undefined, tracker1?.sharedState);

      tracker1?.setCustomUrl('http://example.com/1');
      tracker1?.trackPageView();
      const pageView1 = tracker1?.getPageViewId();

      tracker2?.trackPageView();
      const pageView2 = tracker2?.getPageViewId();

      expect(pageView1).toEqual(pageView2);

      tracker1?.trackPageView();
      const pageView3 = tracker1?.getPageViewId();

      tracker2?.trackPageView();
      const pageView4 = tracker2?.getPageViewId();

      expect(pageView1).not.toEqual(pageView3);
      expect(pageView3).toEqual(pageView4);
    });

    it("Doesn't keep the page view ID for multiple calls to one tracker", () => {
      const tracker1 = createTracker();
      const tracker2 = createTracker(undefined, tracker1?.sharedState);

      tracker1?.setCustomUrl('http://example.com/1');
      tracker1?.trackPageView();
      const pageView1 = tracker1?.getPageViewId();
      tracker1?.trackPageView();
      const pageView2 = tracker1?.getPageViewId();

      tracker2?.trackPageView();
      const pageView3 = tracker2?.getPageViewId();

      expect(pageView1).not.toEqual(pageView2);
      expect(pageView2).toEqual(pageView3);

      tracker1?.trackPageView();
      const pageView4 = tracker1?.getPageViewId();

      tracker2?.trackPageView();
      const pageView5 = tracker2?.getPageViewId();

      expect(pageView3).not.toEqual(pageView4);
      expect(pageView4).toEqual(pageView5);
    });
  });
});
