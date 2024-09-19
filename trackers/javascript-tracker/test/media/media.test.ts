import _ from 'lodash';
import { fetchResults } from '../micro';
import { pageSetup, waitUntil } from '../integration/helpers';
import { Capabilities } from '@wdio/types';
import { MediaEventType } from '@snowplow/browser-plugin-media';

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

const mediaElementContext = (htmlId: string): any => {
  const data = {
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
    },
  };

  const browserName = 'browserName' in browser.capabilities && browser.capabilities.browserName;
  if (browserName === 'internet explorer') {
    data.data.defaultMuted = false;
  }

  return data;
};

const compareMediaElementContext = (expected: any, received: any) => {
  const keys = Object.keys(mediaElementContext('').data);
  for (const key of keys) {
    expect(expected[key]).toEqual(received[key]);
  }
};

const videoElementContext = () => {
  return {
    schema: 'iglu:org.whatwg/video_element/jsonschema/1-0-0',
    data: {
      autoPictureInPicture: undefined,
      disablePictureInPicture: undefined,
      poster: '',
      videoHeight: 144,
      videoWidth: 176,
    },
  };
};

const compareVideoElementContext = (expected: any, received: any) => {
  const keys = Object.keys(videoElementContext().data);
  for (const key of keys) {
    expect(expected[key]).toEqual(received[key]);
  }
};

const expectedUnstructEvent = (mediaEventType: string, data: object = {}) => {
  return {
    schema: 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0',
    data: {
      schema: `iglu:com.snowplowanalytics.snowplow.media/${mediaEventType}_event/jsonschema/1-0-0`,
      data,
    },
  };
};

describe('Media Tracking', () => {
  let log: Array<unknown> = [];
  let testIdentifier = '';

  describe('Media Tracker', () => {
    const capabilities = browser.capabilities as Capabilities.DesiredCapabilities;
    if (
      capabilities.browserName === 'internet explorer' &&
      (capabilities.version === '9' || capabilities.browserVersion === '10')
    ) {
      fit('Skip IE 9 and 10', () => {});
      return;
    }

    if (capabilities.browserName === 'safari' && capabilities.version === '8.0') {
      fit('Skip Safari 8', () => {});
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
                l.schema?.includes('end_event') && l.event?.app_id === 'media-default-events-' + testIdentifier
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
      [MediaEventType.Ready]: {},
      [MediaEventType.Play]: {},
      [MediaEventType.Pause]: {},
      [MediaEventType.VolumeChange]: { previousVolume: 100, newVolume: 50 },
      [MediaEventType.PlaybackRateChange]: { previousRate: 1, newRate: 0.9 },
      [MediaEventType.SeekEnd]: {},
      [MediaEventType.PercentProgress]: { percentProgress: 95 },
      [MediaEventType.End]: {},
    };

    const getEventByEventType = (mediaEventType: string): any => {
      for (const event of log) {
        if (
          (event as any).schema === `iglu:com.snowplowanalytics.snowplow.media/${mediaEventType}_event/jsonschema/1-0-0`
        )
          return event;
      }
    };

    Object.entries(expected).forEach(([name, data]) => {
      it('tracks ' + name, () => {
        const expected_unstruct_event = expectedUnstructEvent(name, data);
        const expected_video_element = videoElementContext();
        const expected_media_element = mediaElementContext('html5');

        const received: any = getEventByEventType(name);

        expect(expected_unstruct_event).toEqual(received.event.unstruct_event);

        const received_media_element_context = received.event.contexts.data.find(
          (schema_data: any) => schema_data.schema === 'iglu:org.whatwg/media_element/jsonschema/1-0-0'
        );
        compareMediaElementContext(expected_media_element, received_media_element_context);

        const received_video_element_context = received.event.contexts.data.find(
          (schema_data: any) => schema_data.schema === 'iglu:org.whatwg/video_element/jsonschema/1-0-0'
        );
        compareVideoElementContext(expected_video_element, received_video_element_context);
      });
    });
  });

  describe('Media Tracker (2 videos, 1 tracker)', () => {
    beforeAll(async () => {
      testIdentifier = await pageSetup();
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
            const filtered = log.filter((l: any) => {
              return (
                l.event?.event_name === 'pause_event' &&
                l.event?.app_id === 'media-2-players-1-tracker-' + testIdentifier
              );
            });
            return filtered.length === 2;
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

    const getFirstEventOfEventTypeWithId = (eventType: string, id: string): any => {
      let results = log.filter((l: any) => {
        return (
          l.event?.event_name === eventType + '_event' &&
          l.event.contexts.data[2].data.htmlId === id &&
          l.event.app_id === 'media-2-players-1-tracker-' + testIdentifier
        );
      });
      return results[results.length - 1];
    };

    it('tracks two players with a single tracker', () => {
      const expectedUnstructEventOne = expectedUnstructEvent(MediaEventType.Pause);
      const receivedOne = getFirstEventOfEventTypeWithId(MediaEventType.Pause, 'html5');
      expect(expectedUnstructEventOne).toEqual(receivedOne.event.unstruct_event);

      const expectedUnstructEventTwo = expectedUnstructEvent(MediaEventType.Pause);
      const receivedTwo = getFirstEventOfEventTypeWithId(MediaEventType.Pause, 'html5-2');
      expect(expectedUnstructEventTwo).toEqual(receivedTwo.event.unstruct_event);
    });
  });

  describe('Media Tracker (1 video, 2 trackers)', () => {
    beforeAll(async () => {
      testIdentifier = await pageSetup();
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
                  l.event?.event_name === 'pause_event' &&
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

    const getEventsOfEventType = (eventType: MediaEventType, limit: number = 1): Array<any> => {
      const results = log.filter(
        (l: any) =>
          l.event?.event_name === eventType + '_event' &&
          l.event.app_id === 'media-1-player-2-trackers-' + testIdentifier
      );
      return results.slice(results.length - limit);
    };

    it('tracks one player with two trackers', () => {
      const expected = expectedUnstructEvent(MediaEventType.Pause);
      const result = getEventsOfEventType(MediaEventType.Pause, 2);

      expect(expected).toEqual(result[0].event.unstruct_event);
      expect(expected).toEqual(result[1].event.unstruct_event);

      const tracker_names = result.map((r: any) => r.event.name_tracker);
      expect(tracker_names).toContain('sp1');
      expect(tracker_names).toContain('sp2');
    });
  });
});
