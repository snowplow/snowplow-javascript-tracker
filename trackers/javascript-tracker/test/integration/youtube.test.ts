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

import { DockerWrapper, start, stop, fetchResults, clearCache } from '../micro';

const makeExpectedEvent = (
  eventType: string,
  values?: { mediaPlayer?: any; mediaElement?: any; youtube?: any },
  playerId = 'youtube'
) => {
  return {
    context: [
      {
        schema: 'iglu:com.youtube/youtube/jsonschema/1-0-0',
        data: {
          playbackQuality: jasmine.stringMatching(/small|medium|large|hd720|hd1080|highres|auto|unknown/),
          cued: false,
          playerId: playerId,
          autoPlay: false,
          buffering: jasmine.any(Boolean),
          controls: true,
          loaded: jasmine.any(Number),
          unstarted: jasmine.any(Boolean),
          url: jasmine.stringMatching(/https\:\/\/www\.youtube\.com\/watch\?(t=\d+&)?v=zSM4ZyVe8xs/),
          ...values?.youtube,
        },
      },
      {
        schema: 'iglu:com.snowplowanalytics.snowplow/media_player/jsonschema/1-0-0',
        data: {
          currentTime: jasmine.any(Number),
          duration: jasmine.any(Number),
          ended: false,
          loop: false,
          muted: false,
          paused: false,
          playbackRate: jasmine.any(Number),
          volume: jasmine.any(Number),
          ...values?.mediaPlayer,
        },
      },
    ],
    unstruct_event: {
      schema: 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0',
      data: {
        schema: 'iglu:com.snowplowanalytics.snowplow/media_player_event/jsonschema/1-0-0',
        data: { type: eventType, label: 'test-label' },
      },
    },
  };
};

const compare = (expected: any, received: any) => {
  if (received === undefined) {
    expect(received).toBeDefined();
    return;
  }
  for (let i = 0; i < expected.context.length; i++) {
    expect(expected.context[i].schema).toEqual(received.event.contexts.data[i].schema);
    Object.keys(expected.context[i].data).forEach((key) => {
      expect(expected.context[i].data[key]).toEqual(received.event.contexts.data[i].data[key]);
    });
  }
  expect(expected.unstruct_event).toEqual(received.event.unstruct_event);
};

let docker: DockerWrapper;
let log: Array<unknown> = [];

describe('YouTube Tracker', () => {
  const getFirstEventOfEventType = (eventType: string): any => {
    let results = log.filter((l: any) => l.event.unstruct_event.data.data.type === eventType);
    return results[results.length - 1];
  };

  if (browser.capabilities.browserName === 'internet explorer' && browser.capabilities.version === '9') {
    fit('Skip IE 9', () => true);
    return;
  }

  if (browser.capabilities.browserName === 'internet explorer' && browser.capabilities.browserVersion === '10') {
    fit('Skip IE 10', () => true);
    return;
  }

  // Unknown command: {"name":"sendKeysToActiveElement","parameters":{"value":["k"]}}
  if (browser.capabilities.browserName === 'safari' && browser.capabilities.version === '8.0') {
    fit('Skip Safari 8', () => true);
    return;
  }

  // Element is obscured (WARNING: The server did not provide any stacktrace information)
  if (browser.capabilities.browserName === 'MicrosoftEdge' && browser.capabilities.browserVersion === '13.10586') {
    fit('Skip Edge 13', () => true);
    return;
  }

  // Driver info: driver.version: unknown
  if (browser.capabilities.browserName === 'firefox' && browser.capabilities.version === '53.0') {
    fit('Skip Firefox 53', () => true);
    return;
  }

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 180000;
    browser.call(() => {
      return start().then((container) => {
        docker = container;
      });
    });

    browser.url('/index.html');
    browser.setCookies({ name: 'container', value: docker.url });
  });

  afterAll(() => {
    browser.waitUntil(() => {
      return browser.call(() => clearCache(docker.url));
    });
  });

  it('should navigate the pages', () => {
    browser.url('/youtube/tracking.html');
    browser.waitUntil(() => $('#youtube').isExisting(), {
      timeout: 5000,
      timeoutMsg: 'expected youtube after 5s',
    });

    const player = $('#youtube');
    player.click(); // emits 'playbackqualitychange' and 'play';
    player.keys(Array(3).fill('ArrowRight')); // Skips to the point just before 'percentprogress' fires

    browser.waitUntil(
      () => {
        return browser.call(() =>
          fetchResults(docker.url).then((result) => {
            return result.some((r: any) => r.event.unstruct_event.data.data.type === 'percentprogress');
          })
        );
      },
      {
        interval: 5000,
        timeout: 40000,
        timeoutMsg: "No 'percentprogress' event received",
      }
    );

    const events = [
      () => player.keys(['Shift', '.', 'Shift']), // Increase playback rate
      () => player.keys(['ArrowRight']), // Seek
      () => player.keys(['ArrowDown']), // Volume down
      () => player.keys(['k']), // Pause
      () => player.keys(['9']), // Skip as close as we can to the end
    ];

    events.forEach((e: Function) => {
      e();
      browser.pause(200);
    });

    browser.waitUntil(
      () => {
        // We've got ~216 seconds left to skip, so we can make use of the waitUntil to skip in chunks
        for (let i = 0; i < 60; i++) {
          // Ended
          player.keys(['ArrowRight']);
          browser.pause(50);
        }
        return browser.call(() =>
          fetchResults(docker.url).then((result) => {
            log = result;
            return log.some((l: any) => l.event.unstruct_event.data.data.type === 'ended');
          })
        );
      },
      {
        interval: 2000,
        timeout: 40000,
        timeoutMsg: 'All events not found before timeout',
      }
    );

    // YouTube saves the volume level in localstorage, meaning loading a new page will have the same
    // volume level as the end of this test, so we need to increase it again to return to the 'default' state
    player.keys(['ArrowUp']);
  });

  const expected = {
    ready: { youtube: { cued: true } },
    percentprogress: {},
    playbackqualitychange: {},
    play: {},
    playbackratechange: {},
    seek: { mediaPlayer: { paused: jasmine.any(Boolean) } },
    volumechange: { mediaPlayer: { paused: jasmine.any(Boolean) } },
    pause: { mediaPlayer: { paused: true } },
    ended: { mediaPlayer: { ended: true } },
  };

  Object.entries(expected).forEach(([name, properties]) => {
    if (browser.capabilities.browserName === 'internet explorer' && name === 'playbackratechange') {
      return;
      // The hotkey for playback rate change doesn't work in IE
      // Trying to create a key sequence to change the option in the UI has proved to be
      // very unreliable, so this test is skipped
    }
    it('tracks ' + name, () => {
      const expected = makeExpectedEvent(name, properties);
      const received = getFirstEventOfEventType(name);
      compare(expected, received);
    });
  });
});

describe('YouTube Tracker (2 videos, 1 tracker)', () => {
  const getFirstEventOfEventTypeWithId = (eventType: string, id: string) => {
    const results = log.filter(
      (l: any) => l.event.unstruct_event.data.data.type === eventType && l.event.contexts.data[0].data.playerId === id
    );
    return results[results.length - 1];
  };

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 180000;
    browser.url('/index.html');
    browser.setCookies({ name: 'container', value: docker.url });
  });

  afterAll(() => {
    browser.waitUntil(() => {
      return browser.call(() => clearCache(docker.url));
    });
  });

  it('should navigate the pages', () => {
    browser.url('/youtube/tracking-2-videos.html');
    browser.waitUntil(() => $('#youtube').isExisting(), {
      timeout: 5000,
      timeoutMsg: 'expected youtube after 5s',
    });

    const player1 = $('#youtube');
    const player2 = $('#youtube-2');

    const actions = [
      () => player1.click(), // emits 'playbackqualitychange' and 'play';
      () => player1.keys(['k']), // Pause
      () => player2.click(), // emits 'playbackqualitychange' and 'play';
      () => player2.keys(['k']), // Pause
    ];

    actions.forEach((a: Function) => {
      a();
      browser.pause(500);
    });

    browser.waitUntil(
      () => {
        return browser.call(() =>
          fetchResults(docker.url).then((result) => {
            log = result;
            return Array.from(new Set(log.map((l: any) => l.event.contexts.data[0].data.playerId))).length === 2;
          })
        );
      },
      {
        interval: 2000,
        timeout: 60000,
        timeoutMsg: 'All events not found before timeout',
      }
    );
  });

  it('Tracks 2 YouTube players with a single tracker', () => {
    const expectedOne = makeExpectedEvent('playbackqualitychange');
    const recievedOne = getFirstEventOfEventTypeWithId('playbackqualitychange', 'youtube');
    compare(expectedOne, recievedOne);

    const expectedTwo = makeExpectedEvent('playbackqualitychange', {}, 'youtube-2');
    const recievedTwo = getFirstEventOfEventTypeWithId('playbackqualitychange', 'youtube-2');
    compare(expectedTwo, recievedTwo);
  });
});

describe('YouTube Tracker (1 video, 2 trackers)', () => {
  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 180000;
    browser.url('/index.html');
    browser.setCookies({ name: 'container', value: docker.url });
  });

  afterAll(() => {
    browser.call(() => {
      return stop(docker.container);
    });
  });

  it('should navigate the pages', () => {
    browser.url('/youtube/tracking-2-trackers.html');
    browser.waitUntil(() => $('#youtube').isExisting(), {
      timeout: 5000,
      timeoutMsg: 'expected youtube after 5s',
    });

    const player = $('#youtube');
    player.click(); // emits 'playbackqualitychange' and 'play';
    player.keys(['k']); // Pause

    browser.waitUntil(
      () => {
        return browser.call(() =>
          fetchResults(docker.url).then((result) => {
            log = result;
            return (
              log.filter((l: any) => l.event.unstruct_event.data.data.type === 'playbackqualitychange').length === 2
            );
          })
        );
      },
      {
        interval: 2000,
        timeout: 40000,
        timeoutMsg: 'All events not found before timeout',
      }
    );
  });

  const getTwoEventsOfEventType = (eventType: string): Array<any> => {
    const results = log.filter((l: any) => l.event.unstruct_event.data.data.type === eventType);
    return results.slice(results.length - 2);
  };

  it('Tracks 2 YouTube players with a single tracker', () => {
    const expected = makeExpectedEvent('playbackqualitychange', {
      mediaPlayer: { paused: jasmine.any(Boolean) },
    });
    const result = getTwoEventsOfEventType('playbackqualitychange');
    compare(expected, result[0]);
    compare(expected, result[1]);
    const tracker_names = result.map((r: any) => r.event.name_tracker);
    expect(tracker_names).toContain('sp1');
    expect(tracker_names).toContain('sp2');
  });
});
