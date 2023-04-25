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
  trackMediaUserUpdateQuality,
  trackMediaVolumeChange,
  updateMediaPlayer,
} from '../src';
import { getMediaPlayerSchema, MEDIA_PLAYER_SCHEMA, MEDIA_PLAYER_SESSION_SCHEMA } from '../src/schemata';
import { MediaPlayerEventType } from '../src/types';

describe('Media Tracking API', () => {
  let idx = 1;
  let id = '';
  let eventQueue: { event: SelfDescribingJson; context: SelfDescribingJson[] }[] = [];

  beforeEach(() => {
    addTracker(`sp${idx++}`, `sp${idx++}`, 'js-3.0.0', '', new SharedState(), {
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
      { api: trackMediaReady, eventType: MediaPlayerEventType.Ready },
      { api: trackMediaPlay, eventType: MediaPlayerEventType.Play },
      { api: trackMediaPause, eventType: MediaPlayerEventType.Pause },
      { api: trackMediaEnd, eventType: MediaPlayerEventType.End },
      { api: trackMediaSeekStart, eventType: MediaPlayerEventType.SeekStart },
      { api: trackMediaSeekEnd, eventType: MediaPlayerEventType.SeekEnd },
      { api: trackMediaPlaybackRateChange, eventType: MediaPlayerEventType.PlaybackRateChange },
      { api: trackMediaVolumeChange, eventType: MediaPlayerEventType.VolumeChange },
      { api: trackMediaFullscreenChange, eventType: MediaPlayerEventType.FullscreenChange },
      { api: trackMediaPictureInPictureChange, eventType: MediaPlayerEventType.PictureInPictureChange },
      { api: trackMediaAdBreakStart, eventType: MediaPlayerEventType.AdBreakStart },
      { api: trackMediaAdBreakEnd, eventType: MediaPlayerEventType.AdBreakEnd },
      { api: trackMediaAdStart, eventType: MediaPlayerEventType.AdStart },
      { api: trackMediaAdFirstQuartile, eventType: MediaPlayerEventType.AdFirstQuartile },
      { api: trackMediaAdMidpoint, eventType: MediaPlayerEventType.AdMidpoint },
      { api: trackMediaAdThirdQuartile, eventType: MediaPlayerEventType.AdThirdQuartile },
      { api: trackMediaAdComplete, eventType: MediaPlayerEventType.AdComplete },
      { api: trackMediaAdSkip, eventType: MediaPlayerEventType.AdSkip },
      { api: trackMediaAdClick, eventType: MediaPlayerEventType.AdClick },
      { api: trackMediaAdPause, eventType: MediaPlayerEventType.AdPause },
      { api: trackMediaAdResume, eventType: MediaPlayerEventType.AdResume },
      { api: trackMediaBufferStart, eventType: MediaPlayerEventType.BufferStart },
      { api: trackMediaBufferEnd, eventType: MediaPlayerEventType.BufferEnd },
      { api: trackMediaQualityChange, eventType: MediaPlayerEventType.QualityChange },
      { api: trackMediaUserUpdateQuality, eventType: MediaPlayerEventType.UserUpdateQuality },
      { api: trackMediaError, eventType: MediaPlayerEventType.Error },
    ].forEach((test) => {
      it(`tracks a ${test.eventType} event`, () => {
        startMediaTracking({ id });

        test.api({ id });

        const { event } = eventQueue[0];

        expect(event).toMatchObject({
          schema: getMediaPlayerSchema(test.eventType),
        });
      });
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

    it('updates percentProgress automatically', () => {
      startMediaTracking({ id, media: { duration: 100 }, session: false });
      trackMediaPlay({ id, media: { currentTime: 50 } });

      expect(eventQueue).toMatchObject([
        {
          context: [{ data: { percentProgress: 50 } }],
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
        { event: { schema: getMediaPlayerSchema(MediaPlayerEventType.SeekStart) } },
        { event: { schema: getMediaPlayerSchema(MediaPlayerEventType.SeekEnd) } },
        { event: { schema: getMediaPlayerSchema(MediaPlayerEventType.SeekStart) } },

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
      startMediaTracking({ id, captureEvents: [MediaPlayerEventType.Pause], session: false });

      trackMediaPlay({ id });
      trackMediaPause({ id });

      expect(eventQueue).toMatchObject([{ event: { schema: getMediaPlayerEventSchema(MediaPlayerEventType.Pause) } }]);
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
        schema: getMediaPlayerSchema(MediaPlayerEventType.Ready),
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
        schema: getMediaPlayerSchema(MediaPlayerEventType.Ready),
      });
    });

    it('calculates session stats', () => {
      startMediaTracking({ id, media: { duration: 10 } });
      trackMediaPlay({ id });
      jest.advanceTimersByTime(10 * 1000);
      updateMediaPlayer({ id, media: { currentTime: 10 } });
      trackMediaEnd({ id, media: { currentTime: 10 } });

      expect(eventQueue).toMatchObject([
        { event: { schema: getMediaPlayerSchema(MediaPlayerEventType.Play) } },
        {
          event: { schema: getMediaPlayerSchema(MediaPlayerEventType.End) },
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

      expect(eventQueue).toMatchObject([{ event: { schema: getMediaPlayerSchema(MediaPlayerEventType.Ping) } }]);
    });

    it('should make a ping event in a custom interval', () => {
      startMediaTracking({ id, pings: { pingInterval: 1 } });

      jest.advanceTimersByTime(1000);

      expect(eventQueue).toMatchObject([{ event: { schema: getMediaPlayerSchema(MediaPlayerEventType.Ping) } }]);
    });

    it('should send ping events regardless of other events', () => {
      startMediaTracking({ id, pings: { pingInterval: 1, maxPausedPings: 10 } });
      trackMediaPlay({ id });
      jest.advanceTimersByTime(1000);
      trackMediaPause({ id });
      jest.advanceTimersByTime(2000);

      expect(eventQueue).toMatchObject([
        { event: { schema: getMediaPlayerSchema(MediaPlayerEventType.Play) } },
        { event: { schema: getMediaPlayerSchema(MediaPlayerEventType.Ping) } },
        { event: { schema: getMediaPlayerSchema(MediaPlayerEventType.Pause) } },
        { event: { schema: getMediaPlayerSchema(MediaPlayerEventType.Ping) } },
        { event: { schema: getMediaPlayerSchema(MediaPlayerEventType.Ping) } },

    it('should not send more ping events than max when paused', () => {
      startMediaTracking({ id, pings: { pingInterval: 1, maxPausedPings: 1 } });
      trackMediaPause({ id });
      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(2000);
      jest.advanceTimersByTime(3000);

      expect(eventQueue).toMatchObject([
        { event: { schema: getMediaPlayerEventSchema(MediaPlayerEventType.Pause) } },
        { event: { schema: getMediaPlayerEventSchema(MediaPlayerEventType.Ping) } },
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
        { event: { schema: getMediaPlayerSchema(MediaPlayerEventType.Play) } },
        {
          event: { schema: getMediaPlayerSchema(MediaPlayerEventType.PercentProgress) },
          context: [{ data: { percentProgress: 10 } }],
        },
        {
          event: { schema: getMediaPlayerSchema(MediaPlayerEventType.PercentProgress) },
          context: [{ data: { percentProgress: 50 } }],
        },
        {
          event: { schema: getMediaPlayerSchema(MediaPlayerEventType.PercentProgress) },
          context: [{ data: { percentProgress: 90 } }],
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

      expect(eventQueue).toMatchObject([{ event: { schema: getMediaPlayerSchema(MediaPlayerEventType.Pause) } }]);
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
        { event: { schema: getMediaPlayerSchema(MediaPlayerEventType.Play) } },
        {
          event: { schema: getMediaPlayerSchema(MediaPlayerEventType.PercentProgress) },
          context: [{ data: { percentProgress: 50 } }],
        },
        {
          event: { schema: getMediaPlayerSchema(MediaPlayerEventType.SeekEnd) },
          context: [{ data: { percentProgress: 0 } }],
        },
      ]);
    });
  });
});
