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

import { DockerWrapper, start, stop, fetchResults } from '../micro';

enum BrowserName {
  FIREFOX = 'firefox',
  CHROME = 'chrome',
  EDGE = 'MicrosoftEdge',
  IE = 'internet explorer',
  OPERA = 'opera',
  SAFARI = 'safari',
}

describe('Media Tracker', () => {
  if (browser.capabilities.browserName === BrowserName.IE) {
    it.only('Skip IE9', () => true);
    return;
  }

  if (browser.capabilities.browserName === BrowserName.SAFARI && browser.capabilities.version === '8.0') {
    it.only('Skip Safari 8', () => true);
    return;
  }

  let docker: DockerWrapper;
  let log: Array<string> = [];

  beforeAll(() => {
    browser.call(() => {
      return start().then((container) => {
        docker = container;
      });
    });

    browser.url('/index.html');
    browser.setCookies({ name: 'container', value: docker.url });
    browser.url('/media-tracking.html');
    $('#html5').waitForExist({
      timeout: 10000,
      timeoutMsg: 'expected html5 after 5s',
    });

    browser.execute(() => (document.getElementById('html5') as HTMLVideoElement).play());
    browser.pause(3000);
    browser.execute(() => (document.getElementById('html5') as HTMLVideoElement).pause());
    browser.pause(1000);
    browser.execute(() => ((document.getElementById('html5') as HTMLVideoElement).volume = 0.5));
    browser.pause(500);
    browser.execute(() => ((document.getElementById('html5') as HTMLVideoElement).playbackRate = 0.9));
    browser.pause(500);
    browser.execute(() => ((document.getElementById('html5') as HTMLVideoElement).currentTime = 15));
    browser.pause(500);
    browser.execute(() => (document.getElementById('html5') as HTMLVideoElement).play());
    browser.pause(15000);

    // 'ended' should be the final event, if not, try again
    browser.waitUntil(
      () => {
        return browser.call(() =>
          fetchResults(docker.url).then((result) => {
            log = result
              .filter((r: any) => r.event.event === 'unstruct')
              .map((r: any) => r.event.unstruct_event.data.data.type);
            return log.includes('ended');
          })
        );
      },
      {
        interval: 2000,
        timeout: 120000,
        timeoutMsg: 'All events not found before timeout',
      }
    );
  });

  afterAll(() => {
    browser.call(() => {
      return stop(docker.container);
    });
  });

  it('tracks play', () => {
    expect(log).toContain('play');
  });

  it('tracks pause', () => {
    expect(log).toContain('pause');
  });

  it('tracks seeked', () => {
    expect(log).toContain('seeked');
  });

  it('tracks volume change', () => {
    expect(log).toContain('volumechange');
  });

  it('tracks playback rate change', () => {
    expect(log).toContain('ratechange');
  });

  it('tracks percentprogress', () => {
    expect(log).toContain('percentprogress');
  });

  it('tracks ended', () => {
    expect(log).toContain('ended');
  });
});
