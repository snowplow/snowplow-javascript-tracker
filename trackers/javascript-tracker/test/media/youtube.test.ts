import { fetchResults } from '../micro';
import { pageSetup, waitUntil } from '../integration/helpers';
import { Capabilities } from '@wdio/types';

declare var player: YT.Player;

const makeExpectedEvent = (
  eventType: string,
  values?: { mediaPlayer?: any; mediaElement?: any; youtube?: any; session?: any },
  playerId = 'youtube'
) => {
  return {
    context: [
      {
        schema: 'iglu:com.snowplowanalytics.snowplow/media_player/jsonschema/2-0-0',
        data: {
          currentTime: jasmine.any(Number),
          duration: jasmine.any(Number),
          ended: false,
          mediaType: 'video',
          muted: false,
          paused: jasmine.any(Boolean),
          playbackRate: jasmine.any(Number),
          playerType: 'com.youtube-youtube',
          quality: jasmine.any(String),
          volume: jasmine.any(Number),
          ...values?.mediaPlayer,
        },
      },
      {
        schema: 'iglu:com.snowplowanalytics.snowplow.media/session/jsonschema/1-0-0',
        data: {
          mediaSessionId: jasmine.any(String),
          startedAt: jasmine.any(String),
          ...values?.session,
        },
      },
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
    ],
    unstruct_event: {
      schema: 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0',
      data: {
        schema: `iglu:com.snowplowanalytics.snowplow.media/${eventType}_event/jsonschema/1-0-0`,
        data: {
          ...values?.mediaElement,
        },
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
    const received_context = received.event.contexts.data.find(
      (c: { schema: string }) => c.schema === expected.context[i].schema
    );
    expect(received_context).toBeDefined();
    if (!received_context) continue;

    expect(received_context.schema).toEqual(expected.context[i].schema);
    Object.keys(expected.context[i].data).forEach((key) => {
      expect(received_context.data[key]).toEqual(expected.context[i].data[key]);
    });
  }
  expect(received.event.unstruct_event).toEqual(expected.unstruct_event);
};

let log: Array<unknown> = [];

function shouldSkipBrowser(browser: any): boolean {
  const capabilities = browser.capabilities as Capabilities.DesiredCapabilities;
  return (
    capabilities.browserName === 'internet explorer' ||
    // Unknown command: {"name":"sendKeysToActiveElement","parameters":{"value":["k"]}}, Safari 12 keeps crashing
    (capabilities.browserName === 'safari' && parseInt(capabilities.browserVersion ?? '') < 14) ||
    // Element is obscured (WARNING: The server did not provide any stacktrace information)
    (capabilities.browserName === 'MicrosoftEdge' && capabilities.browserVersion === '13.10586') ||
    // Driver info: driver.version: unknown
    (capabilities.browserName === 'firefox' && capabilities.version === '53.0')
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
      fit('Skip browser', () => {});
      return;
    }

    const getFirstEventOfEventType = (eventType: string): any => {
      let results = log.filter(
        (l: any) =>
          l.event?.unstruct_event?.data.schema.split('/').includes(eventType) &&
          l.event?.app_id === 'yt-tracking-' + testIdentifier
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
      percent_progress: { mediaElement: { percentProgress: jasmine.any(Number) } },
      quality_change: {
        mediaElement: {
          previousQuality: jasmine.any(String),
          newQuality: jasmine.any(String),
        },
      },
      play: {},
      playback_rate_change: {
        mediaElement: {
          previousRate: jasmine.any(Number),
          newRate: jasmine.any(Number),
        },
      },
      seek_start: { mediaPlayer: { paused: jasmine.any(Boolean) } },
      volume_change: {
        mediaElement: { previousVolume: jasmine.any(Number), newVolume: jasmine.any(Number) },
        mediaPlayer: { paused: jasmine.any(Boolean) },
      },
      pause: { mediaPlayer: { paused: true } },
      end: { mediaPlayer: { ended: true } },
    };

    Object.entries(expected).forEach(([name, properties]) => {
      const capabilities = browser.capabilities as Capabilities.DesiredCapabilities;
      if (capabilities.browserName === 'internet explorer' && name === 'playbackratechange') {
        return;
        // The hotkey for playback rate change doesn't work in IE
        // Trying to create a key sequence to change the option in the UI has proved to be
        // very unreliable, so this test is skipped
      }
      if (capabilities.browserName === 'safari' && name == 'percentprogress') {
        return;
        // percentprogress events seem not be tracked reliably in Safari, should investigate why
      }
      it('tracks ' + name, () => {
        const expected = makeExpectedEvent(name, properties, 'player');
        const received = getFirstEventOfEventType(name + '_event');
        compare(expected, received);
      });
    });
  });

  describe('YouTube Tracker (2 videos, 1 tracker)', () => {
    if (shouldSkipBrowser(browser)) {
      fit('Skip browser', () => {});
      return;
    }

    const getFirstEventOfEventTypeWithId = (eventType: string, id: string) => {
      const results = log.filter(
        (l: any) =>
          l.event?.unstruct_event?.data.schema.split('/').includes(eventType) &&
          l.event?.app_id === 'yt-2-videos-' + testIdentifier &&
          l.event?.contexts.data.find((c: any) => /youtube/.test(c.schema)).data.playerId === id
      );
      return results.pop();
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
      const expectedOne = makeExpectedEvent('quality_change', {
        mediaElement: { previousQuality: jasmine.any(String), newQuality: jasmine.any(String) },
      });
      const receivedOne = getFirstEventOfEventTypeWithId('quality_change_event', 'youtube');
      compare(expectedOne, receivedOne);

      const expectedTwo = makeExpectedEvent(
        'quality_change',
        { mediaElement: { previousQuality: jasmine.any(String), newQuality: jasmine.any(String) } },
        'youtube-2'
      );
      const receivedTwo = getFirstEventOfEventTypeWithId('quality_change_event', 'youtube-2');
      compare(expectedTwo, receivedTwo);
    });
  });

  describe('YouTube Tracker (1 video, 2 trackers)', () => {
    if (shouldSkipBrowser(browser)) {
      fit('Skip browser', () => {});
      return;
    }

    const getTwoEventsOfEventType = (eventType: string): Array<any> => {
      const results = log.filter(
        (l: any) =>
          l.event?.unstruct_event?.data.schema.split('/').includes(eventType) &&
          l.event?.app_id === 'yt-2-trackers-' + testIdentifier
      );
      return results.slice(-2);
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

      const expected = makeExpectedEvent('quality_change', {
        mediaPlayer: { paused: jasmine.any(Boolean) },
        mediaElement: { previousQuality: jasmine.any(String), newQuality: jasmine.any(String) },
      });
      const result = getTwoEventsOfEventType('quality_change_event');
      compare(expected, result[0]);
      compare(expected, result[1]);
      const tracker_names = result.map((r: any) => r.event.name_tracker);
      expect(tracker_names).toContain('sp1');
      expect(tracker_names).toContain('sp2');
    });
  });
});
