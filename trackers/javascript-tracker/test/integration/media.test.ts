/*
 * Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang
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

import { DockerWrapper, start, stop, fetchMostRecentResult, fetchBadResults } from '../micro';

const itif = (condition: any) => (condition ? it : it.skip);

enum BrowserName {
  FIREFOX = 'firefox',
  CHROME = 'chrome',
  EDGE = 'MicrosoftEdge',
  IE = 'internet explorer',
  OPERA = 'opera',
  SAFARI = 'safari',
}

describe('Media Tracker', () => {
  let docker: DockerWrapper;

  beforeAll(() => {
    browser.call(() => {
      return start().then((container) => {
        docker = container;
      });
    });
    browser.url('/index.html');
    browser.setCookies({ name: 'container', value: docker.url });
    browser.pause(6000); // Time for micro to get started
  });

  beforeEach(() => {
    browser.url('/media-tracking.html');
    browser.waitUntil(() => $('#html5').isExisting(), {
      timeout: 10000,
      timeoutMsg: 'expected html5 after 5s',
    });
  });

  afterAll(() => {
    browser.call(() => {
      return stop(docker.container);
    });
  });

  it('tracks play', async () => {
    await browser.execute(() => (document.getElementById('html5') as HTMLVideoElement).play());

    console.log(await fetchBadResults(docker.url).then((result) => console.log(result)));

    return fetchMostRecentResult(docker.url).then((result) => {
      expect(result.event.unstruct_event.data.data.type).toEqual('play');
    });
  });

  it('tracks pause', async () => {
    await browser.execute(() => {
      let elem = document.getElementById('html5') as HTMLVideoElement;
      elem.play();
      elem.pause();
    });
    return fetchMostRecentResult(docker.url).then((result) => {
      expect(result.event.unstruct_event.data.data.type).toEqual('pause');
    });
  });

  it('tracks seeked', async () => {
    await browser.execute(() => ((document.getElementById('html5') as HTMLVideoElement).currentTime = 20));
    return fetchMostRecentResult(docker.url).then((result) => {
      expect(result.event.unstruct_event.data.data.type).toEqual('seeked');
    });
  });

  it('tracks volume change', async () => {
    await browser.execute(() => ((document.getElementById('html5') as HTMLVideoElement).volume = 0.5));
    return fetchMostRecentResult(docker.url).then((result) => {
      expect(result.event.unstruct_event.data.data.type).toEqual('volumechange');
    });
  });

  it('tracks playback rate change', async () => {
    await browser.execute(() => ((document.getElementById('html5') as HTMLVideoElement).playbackRate = 0.9));
    return fetchMostRecentResult(docker.url).then((result) => {
      expect(result.event.unstruct_event.data.data.type).toEqual('ratechange');
    });
  });

  it('tracks ending', async () => {
    await browser.execute(() => {
      let elem = document.getElementById('html5') as HTMLVideoElement;
      elem.currentTime = elem.duration - 2;
      elem.play();
    });
    return fetchMostRecentResult(docker.url).then((result) => {
      expect(result.event.unstruct_event.data.data.type).toEqual('ended');
    });
  });

  it('tracks progress', async () => {
    await browser.execute(() => {
      let elem = document.getElementById('html5') as HTMLVideoElement;
      elem.currentTime = elem.duration / 2 - 2;
      elem.play();
    });
    await browser.pause(5000);
    return fetchMostRecentResult(docker.url).then((result) => {
      expect(result.event.unstruct_event.data.data.type).toEqual('percentprogress');
    });
  });
});
