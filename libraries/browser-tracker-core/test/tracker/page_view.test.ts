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

describe('Tracker API: page views', () => {
  beforeEach(() => {
    jest.spyOn(document, 'title', 'get').mockReturnValue('Page title 1');
  });

  it('Uses custom page title for only a single page view', () => {
    let titles: string[] = [];
    const tracker = createTracker({
      plugins: [
        {
          afterTrack: (payload) => {
            titles.push(payload.page as string);
          },
        },
      ],
    });

    tracker?.trackPageView({
      title: 'Title override',
    });
    tracker?.trackPageView();

    expect(titles).toEqual(['Title override', 'Page title 1']);
  });

  it('Uses custom page title set using setDocumentTitle until overriden again', () => {
    let titles: string[] = [];
    const tracker = createTracker({
      plugins: [
        {
          afterTrack: (payload) => {
            titles.push(payload.page as string);
          },
        },
      ],
    });

    tracker?.setDocumentTitle('Title override');
    tracker?.trackPageView();
    tracker?.trackPageView();

    jest.spyOn(document, 'title', 'get').mockReturnValue('Page title 2');
    tracker?.trackPageView();

    tracker?.setDocumentTitle('Title override 2');
    tracker?.trackPageView();

    expect(titles).toEqual(['Title override', 'Title override', 'Title override', 'Title override 2']);
  });

  it('Explicit title in trackPageView overrides setDocumentTitle', () => {
    let titles: string[] = [];
    const tracker = createTracker({
      plugins: [
        {
          afterTrack: (payload) => {
            titles.push(payload.page as string);
          },
        },
      ],
    });

    tracker?.setDocumentTitle('Title override');
    tracker?.trackPageView({
      title: 'Explicit title',
    });
    tracker?.trackPageView();

    expect(titles).toEqual(['Explicit title', 'Page title 1']);
  });
});
