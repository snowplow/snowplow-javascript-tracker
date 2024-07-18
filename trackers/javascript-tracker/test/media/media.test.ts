import _ from 'lodash';
import { fetchResults } from '../micro';
import { pageSetup, waitUntil } from '../integration/helpers';

const playVideoElement1Callback = () => {
  return (done: (_: void) => void) => {
    const promise = (document.getElementById('html5') as HTMLVideoElement).play();
    if (promise) {
      promise.then(done);
    } else {
      done();
    } // IE does not return a promise
  };
};

const playVideoElement2Callback = () => {
  return (done: (_: void) => void) => {
    const promise = (document.getElementById('html5-2') as HTMLVideoElement).play();
    if (promise) {
      promise.then(done);
    } else {
      done();
    } // IE does not return a promise
  };
};

const makeExpectedEvent = (
  eventType: string,
  values: { mediaPlayer?: any; mediaElement?: any; videoElement?: any },
  htmlId = 'html5'
) => {
  const data = {
    context: [
      {
        schema: 'iglu:org.whatwg/media_element/jsonschema/1-0-0',
        data: {
          htmlId: htmlId,
          mediaType: 'VIDEO',
          autoPlay: false,
          buffered: jasmine.any(Array),
          controls: true,
          currentSrc: jasmine.stringMatching(
            /http\:\/\/snowplow-js-tracker\.local\:8080\/media\/(test-video\.mp4|not-a-video\.unsupported_format)/
          ),
          defaultMuted: true,
          defaultPlaybackRate: 1,
          disableRemotePlayback: undefined,
          error: null,
          networkState: jasmine.stringMatching(/NETWORK_(EMPTY|IDLE|LOADING|NO_SOURCE)/),
          preload: jasmine.stringMatching(/auto|metadata|none||/),
          readyState: jasmine.stringMatching(/HAVE_(NOTHING|METADATA|CURRENT_DATA|FUTURE_DATA|ENOUGH_DATA)/),
          seekable: jasmine.any(Array),
          seeking: false,
          src: jasmine.stringMatching(
            /http\:\/\/snowplow-js-tracker\.local\:8080\/media\/(test-video\.mp4|not-a-video\.unsupported_format)/
          ),
          textTracks: [
            {
              label: 'English',
              language: 'en',
              kind: 'captions',
              mode: jasmine.stringMatching(/showing|hidden|disabled|/),
            },
          ],
          fileExtension: jasmine.stringMatching(/mp4|unsupported_format/),
          fullscreen: false,
          pictureInPicture: false,
          ...values.mediaElement,
        },
      },
      {
        schema: 'iglu:com.snowplowanalytics.snowplow/media_player/jsonschema/1-0-0',
        data: {
          currentTime: jasmine.any(Number),
          ended: false,
          loop: false,
          muted: true,
          paused: false,
          playbackRate: 1,
          volume: 100,
          ...values.mediaPlayer,
        },
      },
      {
        schema: 'iglu:org.whatwg/video_element/jsonschema/1-0-0',
        data: {
          autoPictureInPicture: undefined,
          disablePictureInPicture: undefined,
          poster: '',
          videoHeight: 144,
          videoWidth: 176,
          ...values.videoElement,
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

  if (browser.capabilities.browserName === 'internet explorer') {
    data.context[0].data.defaultMuted = false;
  }

  return data;
};

const compare = (expected: any, received: any) => {
  if (received === undefined) {
    expect(received).toBeDefined();
    return;
  }
  for (let i = 0; i < expected.context.length; i++) {
    expect(expected.context[i].schema).toEqual(received.event.contexts.data[i].schema);
    Object.keys(expected.context[i].data).forEach((key) => {
      // jasmine doesn't have an 'or' matcher and the error state of 'loadstart' is very inconsistent
      // so we put the potential values in an array and check if the received value is in the array
      // However, we want to check the 'textTracks' property with toEqual, so that needs to be excluded
      if (
        expected.unstruct_event.data.data.type === 'loadstart' &&
        Array.isArray(expected.context[i].data[key]) &&
        key !== 'textTracks'
      ) {
        expect(expected.context[i].data[key]).toContain(received.event.contexts.data[i].data[key]);
      } else {
        expect(expected.context[i].data[key]).toEqual(received.event.contexts.data[i].data[key]);
      }
    });
  }
  expect(expected.unstruct_event).toEqual(received.event.unstruct_event);
};

describe('Media Tracking', () => {
  let log: Array<unknown> = [];
  let testIdentifier = '';

  describe('Media Tracker - Default Events', () => {
    const getFirstEventOfEventType = (eventType: string) => {
      for (let i = log.length - 1; i >= 0; i--) {
        const currentEvent = log[i] as any;
        if (
          currentEvent.event?.unstruct_event?.data.data.type === eventType &&
          currentEvent.event?.app_id === 'media-default-events-' + testIdentifier
        ) {
          return log[i];
        }
      }
    };

    if (
      browser.capabilities.browserName === 'internet explorer' &&
      (browser.capabilities.version === '9' || browser.capabilities.browserVersion === '10')
    ) {
      fit('Skip IE 9 and 10', () => true);
      return;
    }

    if (browser.capabilities.browserName === 'safari' && browser.capabilities.version === '8.0') {
      fit('Skip Safari 8', () => true);
      return;
    }

    beforeAll(async () => {
      testIdentifier = await pageSetup();
      await browser.url('media/tracking.html');
      await waitUntil(browser, () => $('#html5').isExisting(), {
        timeout: 10000,
        timeoutMsg: 'expected html5 after 5s',
      });

      let actions = [
        playVideoElement1Callback(),
        (done: () => void) => {
          (document.getElementById('html5') as HTMLVideoElement).pause();
          done();
        },
        (done: () => void) => {
          (document.getElementById('html5') as HTMLVideoElement).volume = 0.5;
          done();
        },
        (done: () => void) => {
          (document.getElementById('html5') as HTMLVideoElement).playbackRate = 0.9;
          done();
        },
        (done: () => void) => {
          (document.getElementById('html5') as HTMLVideoElement).currentTime = 18;
          done();
        },
        playVideoElement1Callback(),
      ];

      for (const a of actions) {
        await browser.executeAsync(a);
        await browser.pause(500);
      }

      // 'ended' should be the final event, if not, try again
      await waitUntil(
        browser,
        async () => {
          return await browser.call(async () => {
            let log = await fetchResults();
            return log.some(
              (l: any) =>
                l.event?.unstruct_event?.data.data.type === 'ended' &&
                l.event?.app_id === 'media-default-events-' + testIdentifier
            );
          });
        },
        {
          interval: 2000,
          timeout: 60000,
          timeoutMsg: 'All events not found before timeout',
        }
      );

      log = await browser.call(async () => await fetchResults());
    });

    const expected = {
      ready: {
        mediaPlayer: { paused: true },
        videoElement: { videoHeight: jasmine.any(Number), videoWidth: jasmine.any(Number) },
      },
      play: { mediaPlayer: { duration: 20 } },
      pause: { mediaPlayer: { paused: true } },
      volumechange: { mediaPlayer: { paused: true, volume: 50 } },
      ratechange: { mediaPlayer: { paused: true, volume: 50, playbackRate: 0.9 } },
      seeked: { mediaPlayer: { paused: true, volume: 50, playbackRate: 0.9 } },
      percentprogress: { mediaPlayer: { volume: 50, playbackRate: jasmine.any(Number) } },
      ended: {
        mediaPlayer: { volume: 50, playbackRate: jasmine.any(Number), paused: jasmine.any(Boolean), ended: true },
      },
    };

    Object.entries(expected).forEach(([name, properties]) => {
      it('tracks ' + name, () => {
        const expected = makeExpectedEvent(name, properties);
        const received = getFirstEventOfEventType(name);
        compare(expected, received);
      });
    });
  });

  describe('Media Tracker (2 videos, 1 tracker)', () => {
    beforeAll(async () => {
      await browser.url('/media/tracking-2-players.html');

      await waitUntil(browser, () => $('#html5').isExisting(), {
        timeout: 10000,
        timeoutMsg: 'expected html5 after 5s',
      });

      let actions = [
        playVideoElement1Callback(),
        playVideoElement2Callback(),
        (done: () => void) => {
          (document.getElementById('html5') as HTMLVideoElement).pause();
          done();
        },
        (done: () => void) => {
          (document.getElementById('html5-2') as HTMLVideoElement).pause();
          done();
        },
      ];

      for (const a of actions) {
        await browser.executeAsync(a);
        await browser.pause(200);
      }

      // wait until we have 2 'pause' events
      await waitUntil(
        browser,
        async () => {
          return await browser.call(async () => {
            let log = await fetchResults();
            return (
              log.filter(
                (l: any) =>
                  l.event?.unstruct_event?.data.data.type === 'pause' &&
                  l.event?.app_id === 'media-2-players-1-tracker-' + testIdentifier
              ).length === 2
            );
          });
        },
        {
          interval: 2000,
          timeout: 20000,
          timeoutMsg: 'All events not found before timeout',
        }
      );

      log = await browser.call(async () => await fetchResults());
    });

    const getFirstEventOfEventTypeWithId = (eventType: string, id: string) => {
      let results = log.filter(
        (l: any) =>
          l.event?.unstruct_event?.data.data.type === eventType &&
          l.event.contexts.data[0].data.htmlId === id &&
          l.event.app_id === 'media-2-players-1-tracker-' + testIdentifier
      );
      return results[results.length - 1];
    };

    it('tracks two players with a single tracker', () => {
      const expectedOne = makeExpectedEvent('pause', { mediaPlayer: { paused: true } });
      const receivedOne = getFirstEventOfEventTypeWithId('pause', 'html5');
      compare(expectedOne, receivedOne);

      const expectedTwo = makeExpectedEvent('pause', { mediaPlayer: { paused: true } }, 'html5-2');
      const receivedTwo = getFirstEventOfEventTypeWithId('pause', 'html5-2');
      compare(expectedTwo, receivedTwo);
    });
  });

  describe('Media Tracker (1 video, 2 trackers)', () => {
    beforeAll(async () => {
      await browser.url('media/tracking-2-trackers.html');

      await waitUntil(browser, () => $('#html5').isExisting(), {
        timeout: 10000,
        timeoutMsg: 'expected html5 after 5s',
      });

      await browser.executeAsync(playVideoElement1Callback());
      await browser.pause(200);
      await browser.execute(() => (document.getElementById('html5') as HTMLVideoElement).pause());

      // wait until we have 2 'pause' events
      await waitUntil(
        browser,
        async () => {
          return await browser.call(async () => {
            let log = await fetchResults();
            return (
              log.filter(
                (l: any) =>
                  l.event?.unstruct_event?.data.data.type === 'pause' &&
                  l.event.app_id === 'media-1-player-2-trackers-' + testIdentifier
              ).length === 2
            );
          });
        },
        {
          interval: 2000,
          timeout: 60000,
          timeoutMsg: 'All events not found before timeout',
        }
      );

      log = await browser.call(async () => await fetchResults());
    });

    const getEventsOfEventType = (eventType: string, limit: number = 1): Array<any> => {
      const results = log.filter(
        (l: any) =>
          l.event?.unstruct_event?.data.data.type === eventType &&
          l.event.app_id === 'media-1-player-2-trackers-' + testIdentifier
      );
      return results.slice(results.length - limit);
    };

    it('tracks one player with two trackers', () => {
      const expected = makeExpectedEvent('pause', { mediaPlayer: { paused: true } });
      const result = getEventsOfEventType('pause', 2);

      compare(expected, result[0]);
      compare(expected, result[1]);
      const tracker_names = result.map((r: any) => r.event.name_tracker);
      expect(tracker_names).toContain('sp1');
      expect(tracker_names).toContain('sp2');
    });
  });

  describe('Media Tracker - All Events', () => {
    beforeAll(async () => {
      await browser.url('media/tracking-all-events.html');

      await waitUntil(browser, () => $('#html5').isExisting(), {
        timeout: 10000,
        timeoutMsg: 'expected html5 after 5s',
      });

      const video_url = await browser.execute(() => {
        return (document.getElementById('html5') as HTMLVideoElement).src;
      });

      let actions = [
        playVideoElement1Callback(),
        (done: () => void) => {
          (document.getElementById('html5') as HTMLVideoElement).pause();
          done();
        },
        (done: () => void) => {
          (document.getElementById('html5') as HTMLVideoElement).currentTime = 18;
          done();
        },
        playVideoElement1Callback(),
        (done: () => void) => {
          (document.getElementById('html5') as HTMLVideoElement).textTracks[0].mode = 'disabled';
          done();
        },
        (done: () => void) => {
          (document.getElementById('html5') as HTMLVideoElement).src = 'not-a-video.unsupported_format';
          done();
        },
      ];

      for (const a of actions) {
        await browser.executeAsync(a);
        await browser.pause(1000);
      }

      await browser.execute((video_url) => {
        (document.getElementById('html5') as HTMLVideoElement).src = video_url;
      }, video_url);

      await waitUntil(
        browser,
        async () => {
          return await browser.call(async () => {
            let log = await fetchResults();
            // Events can occur in any order, so we can't just check for the last event
            // 40 - 45 events are expected, due to the timing of 'timeupdate' events
            return log.length > 40;
          });
        },
        {
          interval: 2000,
          timeout: 60000,
          timeoutMsg: 'All events not found before timeout',
        }
      );

      log = await browser.call(async () => await fetchResults());
    });

    const getFirstEventOfEventType = (eventType: string) => {
      let results = log.filter(
        (l: any) =>
          l.event?.unstruct_event?.data.data.type === eventType &&
          l.event.app_id === 'media-all-events-' + testIdentifier
      );
      return results[results.length - 1];
    };

    const expected = {
      canplay: {
        mediaPlayer: {
          paused: true,
        },
      },
      canplaythrough: {
        mediaPlayer: {
          paused: true,
        },
      },
      timeupdate: {},
      playing: {},
      seeking: {
        mediaElement: {
          seeking: true,
        },
        mediaPlayer: {
          paused: true,
        },
      },
      error: {
        mediaElement: {
          networkState: 'NETWORK_NO_SOURCE',
          readyState: 'HAVE_NOTHING',
          currentSrc: 'http://snowplow-js-tracker.local:8080/media/not-a-video.unsupported_format',
          src: 'http://snowplow-js-tracker.local:8080/media/not-a-video.unsupported_format',
          error: jasmine.any(Object),
        },
        mediaPlayer: {
          paused: true,
        },
        videoElement: {
          videoHeight: 0,
          videoWidth: 0,
        },
      },
      loadstart: {
        mediaElement: {
          error: [jasmine.any(Object), null],
        },
        mediaPlayer: {
          currentTime: 0,
          paused: true,
        },
        videoElement: {
          videoHeight: 0,
          videoWidth: 0,
        },
      },
      loadedmetadata: {
        mediaPlayer: {
          paused: true,
        },
      },
      durationchange: {
        mediaPlayer: {
          paused: true,
        },
      },
    };

    Object.entries(expected).forEach(([name, properties]) => {
      // I can't find a good way of triggering an error event for firefox 53 or chrome 60, so they can
      // be skipped for now (events past 'error' are fired as a result of the error occouring)
      if (
        (name === 'error' &&
          browser.capabilities.browserName === 'firefox' &&
          browser.capabilities.browserVersion === '53.0') ||
        (browser.capabilities.browserName === 'chrome' && browser.capabilities.version === '60.0.3112.78')
      ) {
        fit('Skip events from error', () => true);
        return;
      } else {
        it('tracks ' + name, () => {
          const expected = makeExpectedEvent(name, properties);
          const received = getFirstEventOfEventType(name);
          compare(expected, received);
        });
      }
    });
  });
});
