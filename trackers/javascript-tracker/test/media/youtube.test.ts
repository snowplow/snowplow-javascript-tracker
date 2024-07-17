import { fetchResults } from '../micro';
import { pageSetup, waitUntil } from '../integration/helpers';

declare var player: YT.Player;

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
          url: jasmine.stringMatching(/https\:\/\/www\.youtube\.com\/watch\?(t=\d+&)?v=ublEqhffop0/),
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

describe('Youtube tracking', () => {
  let testIdentifier = '';

  beforeAll(async () => {
    testIdentifier = await pageSetup();
  });
  // If that passes, everything else will work the same as passing in an ID
  describe('YouTube Tracker with Existing Player', () => {
    it('should track any event', async () => {
      await browser.url('/youtube/tracking-player.html');
      await waitUntil(browser, () => $('#youtube').isExisting(), {
        timeout: 5000,
        timeoutMsg: 'expected youtube after 5s',
      });

      const player = await $('#youtube');

      await player.click();
      await browser.pause(1000);

      await player.click();
      await browser.pause(5000);

      const log = await browser.call(async () => await fetchResults());
      const testResults = log.filter((l: any) => l.event?.app_id === 'yt-player-' + testIdentifier);

      // Any non-zero amount of events received means the
      // plugin is successfully sending events from the player
      expect(testResults.length).toBeGreaterThan(0);
    });
  });

  describe('YouTube Tracker', () => {
    if (shouldSkipBrowser(browser)) {
      fit('Skip browser', () => true);
      return;
    }

    const getFirstEventOfEventType = (eventType: string): any => {
      let results = log.filter(
        (l: any) =>
          l.event?.unstruct_event?.data.data.type === eventType && l.event?.app_id === 'yt-tracking-' + testIdentifier
      );
      return results[results.length - 1];
    };

    beforeAll(async () => {
      await browser.url('/youtube/tracking.html');
      await waitUntil(browser, () => $('#player').isExisting(), {
        timeout: 5000,
        timeoutMsg: 'expected youtube after 5s',
      });

      await browser.pause(1000);

      await $('#player').click();
      await browser.pause(1000);

      /* `player` is set at /youtube/tracking.html and is a YT JS API object https://developers.google.com/youtube/iframe_api_reference */

      await browser.setTimeout({ script: 30000 });
      await browser.executeAsync((done) => {
        var initialTimeMS = 0;

        setTimeout(() => {
          var duration = player.getDuration();
          player.seekTo(duration / 5, true);
        }, (initialTimeMS += 500));

        setTimeout(() => {
          player.setPlaybackRate(1.25);
        }, (initialTimeMS += 500));

        setTimeout(() => {
          player.setVolume(player.getVolume() - 10);
        }, (initialTimeMS += 4000));

        setTimeout(() => {
          player.setVolume(player.getVolume() - 10);
        }, (initialTimeMS += 1000));

        setTimeout(() => {
          player.pauseVideo();
        }, (initialTimeMS += 1000));

        setTimeout(() => {
          var duration = player.getDuration();
          player.seekTo(duration - 1, true);
          player.playVideo();
        }, (initialTimeMS += 1000));

        setTimeout(done, (initialTimeMS += 3000));
      });

      log = await browser.call(async () => await fetchResults());
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
        const expected = makeExpectedEvent(name, properties, 'player');
        const received = getFirstEventOfEventType(name);
        compare(expected, received);
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
        (l: any) =>
          l.event?.unstruct_event?.data.data.type === eventType &&
          l.event.contexts.data[0].data.playerId === id &&
          l.event?.app_id === 'yt-2-videos-' + testIdentifier
      );
      return results[results.length - 1];
    };

    it('Tracks 2 YouTube players with a single tracker', async () => {
      await browser.url('/youtube/tracking-2-videos.html');
      await waitUntil(browser, () => $('#youtube').isExisting(), {
        timeout: 5000,
        timeoutMsg: 'expected youtube after 5s',
      });

      const player1 = $('#youtube');
      const player2 = $('#youtube-2');

      await player1.click();
      await browser.pause(500);

      await player2.click();
      await browser.pause(3000);

      log = await browser.call(async () => await fetchResults());
      const expectedOne = makeExpectedEvent('playbackqualitychange');
      const receivedOne = getFirstEventOfEventTypeWithId('playbackqualitychange', 'youtube');
      compare(expectedOne, receivedOne);

      const expectedTwo = makeExpectedEvent('playbackqualitychange', {}, 'youtube-2');
      const receivedTwo = getFirstEventOfEventTypeWithId('playbackqualitychange', 'youtube-2');
      compare(expectedTwo, receivedTwo);
    });
  });

  describe('YouTube Tracker (1 video, 2 trackers)', () => {
    if (shouldSkipBrowser(browser)) {
      fit('Skip browser', () => true);
      return;
    }

    const getTwoEventsOfEventType = (eventType: string): Array<any> => {
      const results = log.filter(
        (l: any) =>
          l.event?.unstruct_event?.data.data.type === eventType && l.event?.app_id === 'yt-2-trackers-' + testIdentifier
      );
      return results.slice(results.length - 2);
    };

    it('Tracks 1 YouTube player with two trackers', async () => {
      await browser.url('/youtube/tracking-2-trackers.html');
      await waitUntil(browser, () => $('#youtube').isExisting(), {
        timeout: 5000,
        timeoutMsg: 'expected youtube after 5s',
      });

      const player = $('#youtube');
      await player.click(); // emits 'playbackqualitychange' and 'play';
      await browser.pause(2000);

      log = await browser.call(async () => await fetchResults());

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
});
