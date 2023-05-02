import { v4 as uuid } from 'uuid';
import { MediaSessionTrackingStats } from '../src/sessionStats';
import { MediaAdBreakType, MediaAdBreak, MediaEventType } from '../src/types';

const mediaPlayerDefaults = {
  ended: false,
  paused: false,
};

describe('MediaSessionTrackingStats', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.clearAllTimers();
  });

  it('calculates played duration', () => {
    let session = new MediaSessionTrackingStats();

    session.update(MediaEventType.Play, { ...mediaPlayerDefaults, currentTime: 0 });

    jest.advanceTimersByTime(60 * 1000);
    session.update(MediaEventType.End, { ...mediaPlayerDefaults, currentTime: 60 });

    let entity = session.toSessionContextEntity();
    expect(entity.contentWatched).toBe(61);
    expect(entity.timePlayed).toBe(60);
    expect(entity.timePlayedMuted).toBeUndefined();
    expect(entity.timePaused).toBeUndefined();
    expect(entity.avgPlaybackRate).toBeUndefined();
  });

  it('considers pauses', () => {
    let session = new MediaSessionTrackingStats();

    session.update(MediaEventType.Play, { ...mediaPlayerDefaults, currentTime: 0 });

    jest.advanceTimersByTime(10 * 1000);
    session.update(undefined, { ...mediaPlayerDefaults, currentTime: 10 });
    session.update(MediaEventType.Pause, { ...mediaPlayerDefaults, currentTime: 10, paused: true });

    jest.advanceTimersByTime(10 * 1000);
    session.update(MediaEventType.Play, { ...mediaPlayerDefaults, currentTime: 10 });

    jest.advanceTimersByTime(50 * 1000);
    session.update(MediaEventType.End, { ...mediaPlayerDefaults, currentTime: 60 });

    let entity = session.toSessionContextEntity();
    expect(entity.contentWatched).toBe(61);
    expect(entity.timePlayed).toBe(60);
    expect(entity.timePlayedMuted).toBeUndefined();
    expect(entity.timePaused).toBe(10);
    expect(entity.avgPlaybackRate).toBeUndefined();
  });

  it('calculates play on mute', () => {
    let session = new MediaSessionTrackingStats();

    session.update(MediaEventType.Play, { ...mediaPlayerDefaults, currentTime: 0, muted: false });

    jest.advanceTimersByTime(30 * 1000);
    session.update(MediaEventType.VolumeChange, { ...mediaPlayerDefaults, currentTime: 30, muted: true });

    jest.advanceTimersByTime(30 * 1000);
    session.update(MediaEventType.End, { ...mediaPlayerDefaults, currentTime: 60 });

    let entity = session.toSessionContextEntity();
    expect(entity.contentWatched).toBe(61);
    expect(entity.timePlayed).toBe(60);
    expect(entity.timePlayedMuted).toBe(30);
    expect(entity.timePaused).toBeUndefined();
    expect(entity.avgPlaybackRate).toBeUndefined();
  });

  it('calculates average playback rate', () => {
    let session = new MediaSessionTrackingStats();

    session.update(MediaEventType.Play, { ...mediaPlayerDefaults, currentTime: 0, playbackRate: 1 });

    jest.advanceTimersByTime(30 * 1000);
    session.update(MediaEventType.PlaybackRateChange, {
      ...mediaPlayerDefaults,
      currentTime: 30,
      playbackRate: 2,
    });

    jest.advanceTimersByTime(30 * 1000);
    session.update(MediaEventType.End, { ...mediaPlayerDefaults, currentTime: 90 });

    let entity = session.toSessionContextEntity();
    expect(entity.contentWatched).toBe(91);
    expect(entity.timePlayed).toBe(60);
    expect(entity.timePlayedMuted).toBeUndefined();
    expect(entity.timePaused).toBeUndefined();
    expect(entity.avgPlaybackRate).toBe(1.5);
  });

  it('calculates stats for linear ads', () => {
    let session = new MediaSessionTrackingStats();

    session.update(MediaEventType.Play, { ...mediaPlayerDefaults, currentTime: 0 });

    jest.advanceTimersByTime(30 * 1000);
    session.update(MediaEventType.AdStart, { ...mediaPlayerDefaults, currentTime: 30 });

    jest.advanceTimersByTime(5 * 1000);
    session.update(MediaEventType.AdClick, { ...mediaPlayerDefaults, currentTime: 30 });

    jest.advanceTimersByTime(10 * 1000);
    session.update(MediaEventType.AdComplete, { ...mediaPlayerDefaults, currentTime: 30 });

    session.update(MediaEventType.AdStart, { ...mediaPlayerDefaults, currentTime: 30 });

    jest.advanceTimersByTime(15 * 1000);
    session.update(MediaEventType.AdComplete, { ...mediaPlayerDefaults, currentTime: 30 });

    jest.advanceTimersByTime(30 * 1000);
    session.update(MediaEventType.End, { ...mediaPlayerDefaults, currentTime: 60 });

    let entity = session.toSessionContextEntity();
    expect(entity.timeSpentAds).toBe(30);
    expect(entity.ads).toBe(2);
    expect(entity.adsClicked).toBe(1);
    expect(entity.adBreaks).toBeUndefined();
    expect(entity.contentWatched).toBe(61);
    expect(entity.timePlayed).toBe(60);
  });

  it('calculate stats for non-linear ads', () => {
    let session = new MediaSessionTrackingStats();
    let adBreak: MediaAdBreak = { breakId: uuid(), startTime: 0, breakType: MediaAdBreakType.NonLinear };

    session.update(MediaEventType.Play, { ...mediaPlayerDefaults, currentTime: 0 });

    jest.advanceTimersByTime(30 * 1000);
    session.update(MediaEventType.AdBreakStart, { ...mediaPlayerDefaults, currentTime: 30 }, adBreak);
    session.update(MediaEventType.AdStart, { ...mediaPlayerDefaults, currentTime: 30 }, adBreak);

    jest.advanceTimersByTime(15 * 1000);
    session.update(MediaEventType.AdComplete, { ...mediaPlayerDefaults, currentTime: 45 }, adBreak);
    session.update(MediaEventType.AdBreakEnd, { ...mediaPlayerDefaults, currentTime: 45 }, adBreak);

    jest.advanceTimersByTime(30 * 1000);
    session.update(MediaEventType.End, { ...mediaPlayerDefaults, currentTime: 75 });

    let entity = session.toSessionContextEntity();
    expect(entity.timeSpentAds).toBe(15);
    expect(entity.ads).toBe(1);
    expect(entity.adBreaks).toBe(1);
    expect(entity.contentWatched).toBe(76);
    expect(entity.timePlayed).toBe(75);
  });

  it('counts rewatched content once in contentWatched', () => {
    let session = new MediaSessionTrackingStats();

    session.update(MediaEventType.Play, { ...mediaPlayerDefaults, currentTime: 0 });

    jest.advanceTimersByTime(30 * 1000);
    session.update(MediaEventType.SeekStart, { ...mediaPlayerDefaults, currentTime: 30 });
    session.update(MediaEventType.SeekEnd, { ...mediaPlayerDefaults, currentTime: 15 });

    jest.advanceTimersByTime(45 * 1000);
    session.update(MediaEventType.End, { ...mediaPlayerDefaults, currentTime: 60 });

    let entity = session.toSessionContextEntity();
    expect(entity.contentWatched).toBe(61);
    expect(entity.timePlayed).toBe(75);
  });

  it('considers changes in ping events', () => {
    let session = new MediaSessionTrackingStats();

    session.update(MediaEventType.Play, { ...mediaPlayerDefaults, currentTime: 0 });

    for (let i = 0; i < 60; i++) {
      session.update(MediaEventType.Ping, { ...mediaPlayerDefaults, currentTime: i, muted: i % 2 == 0 });
      jest.advanceTimersByTime(1 * 1000);
    }

    session.update(MediaEventType.End, { ...mediaPlayerDefaults, currentTime: 60 });

    let entity = session.toSessionContextEntity();
    expect(entity.contentWatched).toBe(61);
    expect(entity.timePlayed).toBe(60);
    expect(entity.timePlayedMuted).toBe(30);
  });

  it('calculates buffering time', () => {
    let session = new MediaSessionTrackingStats();

    session.update(MediaEventType.BufferStart, { ...mediaPlayerDefaults, currentTime: 0 });

    jest.advanceTimersByTime(30 * 1000);
    session.update(MediaEventType.BufferEnd, { ...mediaPlayerDefaults, currentTime: 0 });

    let entity = session.toSessionContextEntity();
    expect(entity.timeBuffering).toBe(30);
  });

  it('ends buffering when playback time moves', () => {
    let session = new MediaSessionTrackingStats();

    session.update(MediaEventType.BufferStart, { ...mediaPlayerDefaults, currentTime: 0 });

    jest.advanceTimersByTime(15 * 1000);
    session.update(undefined, { ...mediaPlayerDefaults, currentTime: 1 });

    jest.advanceTimersByTime(15 * 1000);
    session.update(MediaEventType.Play, { ...mediaPlayerDefaults, currentTime: 15 });

    let entity = session.toSessionContextEntity();
    expect(entity.timeBuffering).toBe(15);
  });
});
