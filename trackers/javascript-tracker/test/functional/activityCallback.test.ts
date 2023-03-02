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

import F from 'lodash/fp';
import { DockerWrapper, start, stop } from '../micro';

declare var trackPageView: () => void;
declare var findMaxX: () => number;
declare var findMaxY: () => number;
declare var getCurrentPageViewId: () => void;
declare var findFirstEventForPageViewId: (id: string) => Record<string, unknown>;
declare var findLastEventForPageViewId: (id: string) => Record<string, unknown>;

describe('Activity tracking with callbacks', () => {
  if (browser.capabilities.browserName === 'internet explorer') {
    fit('Skip IE', () => true);
    return;
  }

  let docker: DockerWrapper;

  beforeAll(async () => {
    await browser.call(async () => {
      return await start().then((container) => {
        docker = container;
      });
    });
    await browser.url('/index.html');
    await browser.setCookies({ name: 'container', value: docker.url });
  });

  afterAll(async () => {
    await browser.call(async () => {
      return await stop(docker.container);
    });
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
