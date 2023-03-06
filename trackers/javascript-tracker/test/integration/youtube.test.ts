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
import { waitUntil } from './helpers';

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
          playbackQuality: jasmine.any(String),
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

function shouldSkipBrowser(browser: any): boolean {
  return (
    browser.capabilities.browserName === 'internet explorer' ||
    // Unknown command: {"name":"sendKeysToActiveElement","parameters":{"value":["k"]}}, Safari 12 keeps crashing
    (browser.capabilities.browserName === 'safari' && browser.capabilities.browserVersion < 14) ||
    // Element is obscured (WARNING: The server did not provide any stacktrace information)
    (browser.capabilities.browserName === 'MicrosoftEdge' && browser.capabilities.browserVersion === '13.10586') ||
    // Driver info: driver.version: unknown
    (browser.capabilities.browserName === 'firefox' && browser.capabilities.version === '53.0')
  );
}

// This is simply to check that the plugin can accept an instance of `YT.Player` and emit events
// If that passes, everything else will work the same as passing in an ID
describe('YouTube Tracker with Existing Player', () => {
  beforeAll(async () => {
    await browser.call(async () => (docker = await start()));

    await browser.url('/index.html');
    await browser.setCookies({ name: 'container', value: docker.url });
    await browser.url('/youtube/tracking-player.html');
    await waitUntil(browser, () => $('#youtube').isExisting(), {
      timeout: 5000,
      timeoutMsg: 'expected youtube after 5s',
    });

    const player = await $('#youtube');

    await player.click();
    await browser.pause(5000);

    await player.click();
    await browser.pause(5000);

    await browser.waitUntil(
      async () => {
        log = await browser.call(async () => await fetchResults(docker.url));
        return log.length > 0;
      },
      {
        timeout: 20000,
        timeoutMsg: 'expected events after 20s',
      }
    );
  });

  afterAll(async () => {
    await browser.call(async () => await clearCache(docker.url));
  });

  it('should track any event', async () => {
    // Any non-zero amount of events received means the
    // plugin is successfully sending events from the player
    expect(log.length).toBeGreaterThan(0);
  });
});

describe('YouTube Tracker', () => {
  const getFirstEventOfEventType = (eventType: string): any => {
    let results = log.filter((l: any) => l.event.unstruct_event.data.data.type === eventType);
    return results[results.length - 1];
  };

  if (shouldSkipBrowser(browser)) {
    fit('Skip browser', () => true);
    return;
  }

  beforeAll(async () => {
    await browser.call(async () => (docker = await start()));

    await browser.url('/index.html');
    await browser.setCookies({ name: 'container', value: docker.url });
    await browser.url('/youtube/tracking.html');
    await waitUntil(browser, () => $('#youtube').isExisting(), {
      timeout: 5000,
      timeoutMsg: 'expected youtube after 5s',
    });

    const player = $('#youtube');
    await player.click(); // emits 'playbackqualitychange' and 'play';
    await browser.keys(Array(2).fill('ArrowRight')); // Skips to the point just before 'percentprogress' fires
    await browser.pause(15000); // Wait to track percentprogress events

    const events = [
      async () => await browser.keys(['Shift', '.', 'Shift']), // Increase playback rate
      async () => await browser.keys(['ArrowRight']), // Seek
      async () => await browser.keys(['ArrowDown']), // Volume down
      async () => await browser.keys(['k']), // Pause
      async () => await browser.keys(['9']), // Skip as close as we can to the end
    ];

    for (const e of events) {
      await e();
      await browser.pause(200);
    }

    // We've got ~216 seconds left to skip
    for (let i = 0; i < 60; i++) {
      // Ended
      await browser.keys(['ArrowRight']);
      await browser.pause(50);
    }
    await browser.pause(1000);

    log = await browser.call(async () => await fetchResults(docker.url));

    // YouTube saves the volume level in localstorage, meaning loading a new page will have the same
    // volume level as the end of this test, so we need to increase it again to return to the 'default' state
    await browser.keys(['ArrowUp']);
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
    if (browser.capabilities.browserName === 'safari' && name == 'percentprogress') {
      return;
      // percentprogress events seem not be tracked reliably in Safari, should investigate why
    }
    it('tracks ' + name, () => {
      const expected = makeExpectedEvent(name, properties);
      const received = getFirstEventOfEventType(name);
      compare(expected, received);
    });
  });

  afterAll(async () => {
    await waitUntil(browser, async () => {
      return await browser.call(async () => await clearCache(docker.url));
    });
  });
});

describe('YouTube Tracker (2 videos, 1 tracker)', () => {
  if (shouldSkipBrowser(browser)) {
    fit('Skip browser', () => true);
    return;
  }

  const getFirstEventOfEventTypeWithId = (eventType: string, id: string) => {
    const results = log.filter(
      (l: any) => l.event.unstruct_event.data.data.type === eventType && l.event.contexts.data[0].data.playerId === id
    );
    return results[results.length - 1];
  };

  beforeAll(async () => {
    await browser.url('/index.html');
    await browser.setCookies({ name: 'container', value: docker.url });
    await browser.url('/youtube/tracking-2-videos.html');
    await waitUntil(browser, () => $('#youtube').isExisting(), {
      timeout: 5000,
      timeoutMsg: 'expected youtube after 5s',
    });

    const player1 = $('#youtube');
    const player2 = $('#youtube-2');

    const actions = [
      async () => await player1.click(), // emits 'playbackqualitychange' and 'play';
      async () => await browser.keys(['k']), // Pause
      async () => await player2.click(), // emits 'playbackqualitychange' and 'play';
      async () => await browser.keys(['k']), // Pause
    ];

    for (const a of actions) {
      await a();
      await browser.pause(500);
    }
    await browser.pause(1000);

    log = await browser.call(async () => await fetchResults(docker.url));
  });

  afterAll(async () => {
    await waitUntil(browser, async () => {
      return await browser.call(async () => await clearCache(docker.url));
    });
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
  if (shouldSkipBrowser(browser)) {
    fit('Skip browser', () => true);
    return;
  }

  beforeAll(async () => {
    await browser.url('/index.html');
    await browser.setCookies({ name: 'container', value: docker.url });
    await browser.url('/youtube/tracking-2-trackers.html');
    await waitUntil(browser, () => $('#youtube').isExisting(), {
      timeout: 5000,
      timeoutMsg: 'expected youtube after 5s',
    });

    const player = $('#youtube');
    await player.click(); // emits 'playbackqualitychange' and 'play';
    await browser.pause(1000);
    await browser.keys(['k']); // Pause
    await browser.pause(1000);

    log = await browser.call(async () => await fetchResults(docker.url));
  });

  afterAll(async () => {
    await browser.call(async () => await stop(docker.container));
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
