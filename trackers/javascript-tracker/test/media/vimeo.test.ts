import { VimeoEvent } from '@snowplow/browser-plugin-vimeo-tracking';
import { pageSetup } from '../integration/helpers';
import { fetchResults } from '../micro';

function compareContextObjects(expected: any, received: any) {
  expect(expected.schema).toEqual(received.schema);
  for (let i = 0; i < expected.data.length; i++) {
    expect(expected.data[i].schema).toEqual(received.data[i].schema);
    Object.keys(expected.data[i].data).forEach((key) => {
      // Only test if the key exists in the received data
      if (received.data[i].data[key] !== undefined) {
        expect(expected.data[i].data[key]).toEqual(received.data[i].data[key]);
      }
    });
  }
}

const makeSchema = (eventType: string) => {
  return `iglu:com.snowplowanalytics.snowplow.media/${eventType}_event/jsonschema/1-0-0`;
};

const makeContext = () => {
  return {
    schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
    data: [
      {
        schema: 'iglu:com.snowplowanalytics.snowplow/media_player/jsonschema/2-0-0',
        data: {
          currentTime: jasmine.any(Number),
          paused: jasmine.any(Boolean),
          ended: jasmine.any(Boolean),
          duration: jasmine.any(Number),
          loop: jasmine.any(Boolean),
          muted: jasmine.any(Boolean),
          playbackRate: jasmine.any(Number),
          volume: jasmine.any(Number),
          quality: jasmine.any(String),
          pictureInPicture: jasmine.any(Boolean),
        },
      },
      {
        schema: 'iglu:com.snowplowanalytics.snowplow.media/session/jsonschema/1-0-0',
        data: {
          sessionId: 'test',
          startedAt: jasmine.any(String),
          pingInterval: 5,
        },
      },
    ],
  };
};

const skipBrowsers = (browser: any) => {
  if (browser.capabilities.browserName === 'internet explorer' && browser.capabilities.version === '9') {
    fit('Skip IE 9', () => true);
    return;
  }

  if (browser.capabilities.browserName === 'internet explorer' && browser.capabilities.browserVersion === '10') {
    fit('Skip IE 10', () => true);
    return;
  }

  // element not interactable: Element is not displayed
  if (browser.capabilities.browserName === 'internet explorer' && browser.capabilities.browserVersion === '11') {
    fit('Skip IE 11', () => true);
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
};

describe('Vimeo Tracker - Player', () => {
  skipBrowsers(browser);
  let testResults: any[];
  let testIdentifier = '';

  beforeAll(async () => {
    testIdentifier = await pageSetup();
    await browser.url('/vimeo/player.html');
    await browser.waitUntil(() => $('#vimeo').isExisting(), {
      timeout: 10000,
      timeoutMsg: 'expected vimeo after 5s',
    });

    const player = await $('#vimeo');

    await browser.pause(5000); // Time for the video to load

    // user has to interacted with by the user to avoid:
    // element not interactable
    // (Session info: chrome=114.0.5735.133)
    await player.click();

    // This would work better as an async function, but it will throw an error:
    // [0-0] 2023-06-19T10:58:17.232Z ERROR webdriver: Request failed with status 500 due to javascript error: javascript error: tslib_1 is not defined
    await browser.execute(() => {
      const player = new Vimeo.Player('vimeo');

      const methods = [
        () => player.play.bind(player),
        () => player.pause.bind(player),
        () => player.play.bind(player),
        () => player.setPlaybackRate.bind(player, 1.5),
        () => player.setVolume.bind(player, 0.5),
        () => player.setCurrentTime.bind(player, 0),
        () => player.enableTextTrack.bind(player, 'en'),
      ];

      // An incorrect event name will cause an error
      player.on('not a real event', () => {});

      for (let i = 0; i < methods.length; i++) {
        setTimeout(methods[i](), 1500 * (i + 1));
      }
    });

    // Wait for the 'ended' callback to signal the end of the video on the page
    await browser.waitUntil(async () => {
      const elem = await $('#ended');
      return (await elem.getText()) === 'true';
    });

    await browser.pause(5_000);

    const log = await browser.call(async () => await fetchResults());
    testResults = log.filter((l: any) => l.event?.app_id === 'vimeo-player-test-' + testIdentifier);
  });

  const expectedEvents = [
    VimeoEvent.Ready,
    VimeoEvent.Play,
    VimeoEvent.Pause,
    VimeoEvent.End,
    VimeoEvent.SeekStart,
    VimeoEvent.SeekEnd,
    VimeoEvent.VolumeChange,
    VimeoEvent.PlaybackRateChange,
    VimeoEvent.PercentProgress,
    VimeoEvent.Ping,
  ];

  expectedEvents.forEach((eventName) => {
    it(`tracks media event: ${eventName}`, () => {
      const expectedSchema = makeSchema(eventName);

      const expectedContext = makeContext();

      const received = testResults.filter((e) => e.event.unstruct_event.data.schema === expectedSchema)[0];

      if (received === undefined) {
        fail(`Event ${eventName} not found`);
      }

      compareContextObjects(expectedContext, received.event.contexts);

      const eventSchemas = testResults.map((e: any) => e.event.unstruct_event.data.schema);
      expect(eventSchemas.includes(expectedSchema)).toBe(true);
    });
  });

  //  InteractiveHotspotClicked and InteractiveOverlayPanelClicked aren't tested here,
  //  as they require a paid Vimeo account to enable
  let vimeoEvents = {
    [VimeoEvent.CuePoint]: {
      schema: 'iglu:com.vimeo/cue_point_event/jsonschema/1-0-0',
      data: {
        cuePointTime: 1,
        data: { foo: 'bar' },
        id: jasmine.any(String),
      },
    },

    [VimeoEvent.TextTrackChange]: {
      schema: 'iglu:com.vimeo/text_track_change_event/jsonschema/1-0-0',
      data: { label: 'English', language: 'en', kind: 'subtitles' },
    },
  };

  Object.entries(vimeoEvents).forEach(([eventName, expectedEvent]) => {
    it(`tracks vimeo event: ${eventName}`, () => {
      const event = testResults.filter((e) => e.event.unstruct_event.data.schema === expectedEvent.schema)[0];
      if (event === undefined) {
        fail(`Event ${eventName} not found`);
      }
      const eventData = event.event.unstruct_event.data.data;

      if (eventName === VimeoEvent.CuePoint) {
        expect(eventData.data.foo).toEqual(expectedEvent.data.data.foo);
        expect(eventData.time).toEqual(expectedEvent.data.time);
        expect(eventData.id).toEqual(expectedEvent.data.id);
      }

      if (eventName === VimeoEvent.ChapterChange) {
        expect(eventData.startTime).toEqual(expectedEvent.data.startTime);
        expect(eventData.title).toEqual(expectedEvent.data.title);
        expect(eventData.index).toEqual(expectedEvent.data.index);
      }

      if (eventName === VimeoEvent.TextTrackChange) {
        expect(eventData.label).toEqual(expectedEvent.data.label);
        expect(eventData.language).toEqual(expectedEvent.data.language);
        expect(eventData.kind).toEqual(expectedEvent.data.kind);
      }
    });
  });
});

describe('Vimeo Tracker - IFRAME', () => {
  skipBrowsers(browser);
  let testResults: any[];
  let testIdentifier = '';

  beforeAll(async () => {
    testIdentifier = await pageSetup();

    await browser.url('/vimeo/iframe.html');
    await browser.waitUntil(() => $('#vimeo').isExisting(), {
      timeout: 10000,
      timeoutMsg: 'expected vimeo after 5s',
    });

    const player = await $('#vimeo');
    await browser.pause(5000); // Time for the video to load

    await player.click(); // 'play'

    await browser.pause(10_000);

    const log = await browser.call(async () => await fetchResults());
    testResults = log.filter((l: any) => l.event?.app_id === 'vimeo-iframe-test-' + testIdentifier);
  });

  // 'ready' doesn't require attaching the listeners to the player, as it is fired "manually" in the plugin,
  // so 'play' ensures we  are getting events produced by the event listeners
  const expectedEvents = [VimeoEvent.Ready, VimeoEvent.Play];

  expectedEvents.forEach((eventName) => {
    it(`tracks ${eventName}`, () => {
      const expectedSchema = makeSchema(eventName);

      const expectedContext = makeContext(eventName);

      const received = testResults.filter((e) => e.event.unstruct_event.data.schema === expectedSchema)[0];

      if (received === undefined) {
        fail(`Event ${eventName} not found`);
      }

      compareContextObjects(expectedContext, received.event.contexts);

      const eventSchemas = testResults.map((e: any) => e.event.unstruct_event.data.schema);
      expect(eventSchemas.includes(expectedSchema)).toBe(true);
    });
  });
});
