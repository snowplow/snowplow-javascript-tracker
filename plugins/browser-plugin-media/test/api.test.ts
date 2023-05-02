import { addTracker, SharedState } from '@snowplow/browser-tracker-core';
import { PayloadBuilder, SelfDescribingJson } from '@snowplow/tracker-core';
import {
  endMediaTracking,
  SnowplowMediaPlugin,
  startMediaTracking,
  trackMediaAdBreakEnd,
  trackMediaAdBreakStart,
  trackMediaAdClick,
  trackMediaAdComplete,
  trackMediaAdFirstQuartile,
  trackMediaAdMidpoint,
  trackMediaAdPause,
  trackMediaAdResume,
  trackMediaAdSkip,
  trackMediaAdStart,
  trackMediaAdThirdQuartile,
  trackMediaBufferEnd,
  trackMediaBufferStart,
  trackMediaEnd,
  trackMediaError,
  trackMediaFullscreenChange,
  trackMediaPause,
  trackMediaPictureInPictureChange,
  trackMediaPlay,
  trackMediaPlaybackRateChange,
  trackMediaQualityChange,
  trackMediaReady,
  trackMediaSeekEnd,
  trackMediaSeekStart,
  trackMediaVolumeChange,
  updateMediaPlayer,
} from '../src';
import { getMediaPlayerEventSchema, MEDIA_PLAYER_SCHEMA, MEDIA_PLAYER_SESSION_SCHEMA } from '../src/schemata';
import { MediaEventType } from '../src/types';

describe('Media Tracking API', () => {
  let idx = 1;
  let id = '';
  let eventQueue: { event: SelfDescribingJson; context: SelfDescribingJson[] }[] = [];

  beforeEach(() => {
    addTracker(`sp${idx++}`, `sp${idx++}`, 'js-3.9.0', '', new SharedState(), {
      stateStorageStrategy: 'cookie',
      encodeBase64: false,
      plugins: [
        SnowplowMediaPlugin(),
        {
          beforeTrack: (pb: PayloadBuilder) => {
            const { ue_pr, co, tna } = pb.getPayload();
            if (tna == `sp${idx - 1}`) {
              eventQueue.push({ event: JSON.parse(ue_pr as string).data, context: JSON.parse(co as string).data });
            }
          },
        },
      ],
      contexts: { webPage: false },
    });
    id = `media-${idx}`;
  });

  afterEach(() => {
    endMediaTracking({ id });
    eventQueue = [];
  });

  describe('media player events', () => {
    [
      { api: trackMediaReady, eventType: MediaEventType.Ready },
      { api: trackMediaPlay, eventType: MediaEventType.Play },
      { api: trackMediaPause, eventType: MediaEventType.Pause },
      { api: trackMediaEnd, eventType: MediaEventType.End },
      { api: trackMediaSeekStart, eventType: MediaEventType.SeekStart },
      { api: trackMediaSeekEnd, eventType: MediaEventType.SeekEnd },
      { api: trackMediaAdBreakStart, eventType: MediaEventType.AdBreakStart },
      { api: trackMediaAdBreakEnd, eventType: MediaEventType.AdBreakEnd },
      { api: trackMediaAdStart, eventType: MediaEventType.AdStart },
      { api: trackMediaAdComplete, eventType: MediaEventType.AdComplete },
      { api: trackMediaBufferStart, eventType: MediaEventType.BufferStart },
      { api: trackMediaBufferEnd, eventType: MediaEventType.BufferEnd },
    ].forEach((test) => {
      it(`tracks a ${test.eventType} event`, () => {
        startMediaTracking({ id });

        test.api({ id });

        const { event } = eventQueue[0];

        expect(event).toMatchObject({
          schema: getMediaPlayerEventSchema(test.eventType),
        });
      });
    });

    it('tracks a playback rate change event and remembers the new rate', () => {
      startMediaTracking({ id, session: false, media: { playbackRate: 0.5 } });

      trackMediaPlaybackRateChange({ id, newRate: 1.5 });
      trackMediaPause({ id });

      expect(eventQueue).toMatchObject([
        {
          event: {
            schema: getMediaPlayerEventSchema(MediaEventType.PlaybackRateChange),
            data: {
              previousRate: 0.5,
              newRate: 1.5,
            },
          },
          context: [{ data: { playbackRate: 1.5 } }],
        },
        {
          context: [{ data: { playbackRate: 1.5 } }],
        },
      ]);
    });

    it('tracks a volume change event and remembers the new volume', () => {
      startMediaTracking({ id, session: false, media: { volume: 50 } });

      trackMediaVolumeChange({ id, newVolume: 70 });
      trackMediaPause({ id });

      expect(eventQueue).toMatchObject([
        {
          event: {
            schema: getMediaPlayerEventSchema(MediaEventType.VolumeChange),
            data: {
              previousVolume: 50,
              newVolume: 70,
            },
          },
          context: [{ data: { volume: 70 } }],
        },
        {
          context: [{ data: { volume: 70 } }],
        },
      ]);
    });

    it('tracks a fullscreen change event and remembers the setting', () => {
      startMediaTracking({ id, session: false });

      trackMediaFullscreenChange({ id, fullscreen: true });
      trackMediaPause({ id });

      expect(eventQueue).toMatchObject([
        {
          event: {
            schema: getMediaPlayerEventSchema(MediaEventType.FullscreenChange),
            data: { fullscreen: true },
          },
          context: [{ data: { fullscreen: true } }],
        },
        {
          context: [{ data: { fullscreen: true } }],
        },
      ]);
    });

    it('tracks a picture in picture change event and remembers the setting', () => {
      startMediaTracking({ id, session: false });

      trackMediaPictureInPictureChange({ id, pictureInPicture: true });
      trackMediaPause({ id });

      expect(eventQueue).toMatchObject([
        {
          event: {
            schema: getMediaPlayerEventSchema(MediaEventType.PictureInPictureChange),
            data: { pictureInPicture: true },
          },
          context: [{ data: { pictureInPicture: true } }],
        },
        {
          context: [{ data: { pictureInPicture: true } }],
        },
      ]);
    });

    it('tracks an ad first quartile event', () => {
      startMediaTracking({ id, session: false });

      trackMediaAdFirstQuartile({ id })

      expect(eventQueue).toMatchObject([
        {
          event: {
            schema: getMediaPlayerEventSchema(MediaEventType.AdFirstQuartile),
            data: { percentProgress: 25 },
          },
        },
      ]);
    });

    it('tracks an ad midpoint event', () => {
      startMediaTracking({ id, session: false });

      trackMediaAdMidpoint({ id })

      expect(eventQueue).toMatchObject([
        {
          event: {
            schema: getMediaPlayerEventSchema(MediaEventType.AdMidpoint),
            data: { percentProgress: 50 },
          },
        },
      ]);
    });

    it('tracks an ad third quartile event', () => {
      startMediaTracking({ id, session: false });

      trackMediaAdThirdQuartile({ id })

      expect(eventQueue).toMatchObject([
        {
          event: {
            schema: getMediaPlayerEventSchema(MediaEventType.AdThirdQuartile),
            data: { percentProgress: 75 },
          },
        },
      ]);
    });

    it('tracks an ad skip event', () => {
      startMediaTracking({ id, session: false });

      trackMediaAdSkip({ id, percentProgress: 33 })

      expect(eventQueue).toMatchObject([
        {
          event: {
            schema: getMediaPlayerEventSchema(MediaEventType.AdSkip),
            data: { percentProgress: 33 },
          },
        },
      ]);
    });

    it('tracks an ad click event', () => {
      startMediaTracking({ id, session: false });

      trackMediaAdClick({ id, percentProgress: 33 })

      expect(eventQueue).toMatchObject([
        {
          event: {
            schema: getMediaPlayerEventSchema(MediaEventType.AdClick),
            data: { percentProgress: 33 },
          },
        },
      ]);
    });

    it('tracks an ad pause event', () => {
      startMediaTracking({ id, session: false });

      trackMediaAdPause({ id, percentProgress: 33 })

      expect(eventQueue).toMatchObject([
        {
          event: {
            schema: getMediaPlayerEventSchema(MediaEventType.AdPause),
            data: { percentProgress: 33 },
          },
        },
      ]);
    });

    it('tracks an ad resume event', () => {
      startMediaTracking({ id, session: false });

      trackMediaAdResume({ id, percentProgress: 33 })

      expect(eventQueue).toMatchObject([
        {
          event: {
            schema: getMediaPlayerEventSchema(MediaEventType.AdResume),
            data: { percentProgress: 33 },
          },
        },
      ]);
    });

    it('tracks quality change event', () => {
      startMediaTracking({ id, session: false });

      trackMediaQualityChange({
        id,
        previousQuality: '720p',
        newQuality: '1080p',
        bitrate: 1000,
        framesPerSecond: 30,
        automatic: false,
      });

      expect(eventQueue).toMatchObject([
        {
          event: {
            schema: getMediaPlayerEventSchema(MediaEventType.QualityChange),
            data: {
              previousQuality: '720p',
              newQuality: '1080p',
              bitrate: 1000,
              framesPerSecond: 30,
              automatic: false,
            },
          },
        },
      ]);
    });

    it('tracks error event', () => {
      startMediaTracking({ id, session: false });

      trackMediaError({
        id,
        errorCode: '500',
        errorDescription: 'Failed to load media',
      });

      expect(eventQueue).toMatchObject([
        {
          event: {
            schema: getMediaPlayerEventSchema(MediaEventType.Error),
            data: {
              errorCode: '500',
              errorDescription: 'Failed to load media',
            },
          },
        },
      ]);
    });

    it('sets paused to false in media context when play is tracked', () => {
      startMediaTracking({ id, media: { paused: true }, session: false });
      trackMediaPlay({ id });

      expect(eventQueue).toMatchObject([
        {
          context: [{ data: { paused: false } }],
        },
      ]);
    });

    it('sets paused to true in media context when pause is tracked', () => {
      startMediaTracking({ id, media: { paused: false }, session: false });
      trackMediaPause({ id });

      expect(eventQueue).toMatchObject([
        {
          context: [{ data: { paused: true } }],
        },
      ]);
    });

    it('sets paused and ended to true in media context when end is tracked', () => {
      startMediaTracking({ id, media: { paused: false }, session: false });
      trackMediaEnd({ id });

      expect(eventQueue).toMatchObject([
        {
          context: [{ data: { paused: true, ended: true } }],
        },
      ]);
    });

    it('doesnt track seek start multiple times', () => {
      startMediaTracking({ id, media: { duration: 100 }, session: false });
      trackMediaSeekStart({ id, media: { currentTime: 1 } });
      trackMediaSeekStart({ id, media: { currentTime: 2 } });
      trackMediaSeekEnd({ id, media: { currentTime: 3 } });
      trackMediaSeekStart({ id, media: { currentTime: 3 } });

      expect(eventQueue).toMatchObject([
        { event: { schema: getMediaPlayerEventSchema(MediaEventType.SeekStart) } },
        { event: { schema: getMediaPlayerEventSchema(MediaEventType.SeekEnd) } },
        { event: { schema: getMediaPlayerEventSchema(MediaEventType.SeekStart) } },
      ]);
    });

    it('adds custom context entities to all events', () => {
      const context: Array<SelfDescribingJson> = [{ schema: 'test', data: {} }];
      startMediaTracking({ id, context, session: false });

      trackMediaPlay({ id });
      trackMediaPause({ id });

      expect(eventQueue).toMatchObject([
        { context: [{ data: { paused: false } }, { schema: 'test' }] },
        { context: [{ data: { paused: true } }, { schema: 'test' }] },
      ]);
    });

    it('doesnt track events not in captureEvents', () => {
      startMediaTracking({ id, captureEvents: [MediaEventType.Pause], session: false });

      trackMediaPlay({ id });
      trackMediaPause({ id });

      expect(eventQueue).toMatchObject([{ event: { schema: getMediaPlayerEventSchema(MediaEventType.Pause) } }]);
    });
  });

  describe('session', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.clearAllTimers();
    });

    it('adds media session context entity with given ID', () => {
      startMediaTracking({ id });
      trackMediaReady({ id });

      const { context, event } = eventQueue[0];

      expect(context).toMatchObject([
        {
          schema: MEDIA_PLAYER_SCHEMA,
        },
        {
          data: { mediaSessionId: id },
          schema: MEDIA_PLAYER_SESSION_SCHEMA,
        },
      ]);

      expect(event).toMatchObject({
        schema: getMediaPlayerEventSchema(MediaEventType.Ready),
      });
    });

    it('adds media session context entity with given started at date', () => {
      let startedAt = new Date(new Date().getTime() - 100 * 1000);
      startMediaTracking({ id, session: { startedAt: startedAt } });
      trackMediaReady({ id });

      const { context, event } = eventQueue[0];

      expect(context).toMatchObject([
        {
          schema: MEDIA_PLAYER_SCHEMA,
        },
        {
          data: { startedAt: startedAt.toISOString() },
          schema: MEDIA_PLAYER_SESSION_SCHEMA,
        },
      ]);

      expect(event).toMatchObject({
        schema: getMediaPlayerEventSchema(MediaEventType.Ready),
      });
    });

    it('calculates session stats', () => {
      startMediaTracking({ id, media: { duration: 10 } });
      trackMediaPlay({ id });
      jest.advanceTimersByTime(10 * 1000);
      updateMediaPlayer({ id, media: { currentTime: 10 } });
      trackMediaEnd({ id, media: { currentTime: 10 } });

      expect(eventQueue).toMatchObject([
        { event: { schema: getMediaPlayerEventSchema(MediaEventType.Play) } },
        {
          event: { schema: getMediaPlayerEventSchema(MediaEventType.End) },
          context: [
            { schema: MEDIA_PLAYER_SCHEMA },
            {
              schema: MEDIA_PLAYER_SESSION_SCHEMA,
              data: {
                timePlayed: 10,
                contentWatched: 11,
              },
            },
          ],
        },
      ]);
    });
  });

  describe('ping events', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.clearAllTimers();
    });

    it('starts sending ping events after session starts', () => {
      startMediaTracking({ id, pings: true });

      jest.advanceTimersByTime(30 * 1000);

      expect(eventQueue).toMatchObject([{ event: { schema: getMediaPlayerEventSchema(MediaEventType.Ping) } }]);
    });

    it('should make a ping event in a custom interval', () => {
      startMediaTracking({ id, pings: { pingInterval: 1 } });

      jest.advanceTimersByTime(1000);

      expect(eventQueue).toMatchObject([{ event: { schema: getMediaPlayerEventSchema(MediaEventType.Ping) } }]);
    });

    it('should send ping events regardless of other events', () => {
      startMediaTracking({ id, pings: { pingInterval: 1, maxPausedPings: 10 } });
      trackMediaPlay({ id });
      jest.advanceTimersByTime(1000);
      trackMediaPause({ id });
      jest.advanceTimersByTime(2000);

      expect(eventQueue).toMatchObject([
        { event: { schema: getMediaPlayerEventSchema(MediaEventType.Play) } },
        { event: { schema: getMediaPlayerEventSchema(MediaEventType.Ping) } },
        { event: { schema: getMediaPlayerEventSchema(MediaEventType.Pause) } },
        { event: { schema: getMediaPlayerEventSchema(MediaEventType.Ping) } },
        { event: { schema: getMediaPlayerEventSchema(MediaEventType.Ping) } },
      ]);
    });

    it('should not send more ping events than max when paused', () => {
      startMediaTracking({ id, pings: { pingInterval: 1, maxPausedPings: 1 } });
      trackMediaPause({ id });
      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(2000);
      jest.advanceTimersByTime(3000);

      expect(eventQueue).toMatchObject([
        { event: { schema: getMediaPlayerEventSchema(MediaEventType.Pause) } },
        { event: { schema: getMediaPlayerEventSchema(MediaEventType.Ping) } },
      ]);
    });
  });

  describe('percent progress', () => {
    it('should send progress events when boundaries reached', () => {
      startMediaTracking({
        id,
        boundaries: [10, 50, 90],
        media: { duration: 100 },
        session: false,
      });

      trackMediaPlay({ id });
      for (let i = 1; i <= 100; i++) {
        updateMediaPlayer({ id, media: { currentTime: i } });
      }

      expect(eventQueue).toMatchObject([
        { event: { schema: getMediaPlayerEventSchema(MediaEventType.Play) } },
        {
          event: {
            schema: getMediaPlayerEventSchema(MediaEventType.PercentProgress),
            data: { percentProgress: 10 },
          },
        },
        {
          event: {
            schema: getMediaPlayerEventSchema(MediaEventType.PercentProgress),
            data: { percentProgress: 50 },
          },
        },
        {
          event: {
            schema: getMediaPlayerEventSchema(MediaEventType.PercentProgress),
            data: { percentProgress: 90 },
          },
        },
      ]);
    });

    it('doesnt send progress events if paused', () => {
      startMediaTracking({
        id,
        boundaries: [10, 50, 90],
        media: { duration: 100 },
        session: false,
      });

      trackMediaPause({ id });
      for (let i = 1; i <= 100; i++) {
        updateMediaPlayer({ id, media: { currentTime: i } });
      }

      expect(eventQueue).toMatchObject([{ event: { schema: getMediaPlayerEventSchema(MediaEventType.Pause) } }]);
    });

    it('doesnt send progress event multiple times', () => {
      startMediaTracking({
        id,
        boundaries: [50],
        media: { duration: 100 },
        session: false,
      });

      trackMediaPlay({ id });
      for (let i = 1; i <= 100; i++) {
        updateMediaPlayer({ id, media: { currentTime: i } });
      }
      trackMediaSeekEnd({ id, media: { currentTime: 0 } });
      for (let i = 1; i <= 100; i++) {
        updateMediaPlayer({ id, media: { currentTime: i } });
      }

      expect(eventQueue).toMatchObject([
        { event: { schema: getMediaPlayerEventSchema(MediaEventType.Play) } },
        {
          event: {
            schema: getMediaPlayerEventSchema(MediaEventType.PercentProgress),
            data: { percentProgress: 50 },
          },
        },
        {
          event: {
            schema: getMediaPlayerEventSchema(MediaEventType.SeekEnd),
          },
          context: [{ data: { currentTime: 0 } }],
        },
      ]);
    });
  });
});
