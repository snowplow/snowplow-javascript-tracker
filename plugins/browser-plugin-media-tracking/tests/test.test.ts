import { addTracker, SharedState } from '@snowplow/browser-tracker-core';
import { waitForElement } from '../src/findElem';
import { PayloadBuilder, SelfDescribingJson } from '@snowplow/tracker-core';
import { MediaEventType, SnowplowMediaPlugin, endMediaTracking } from '@snowplow/browser-plugin-media';
import { startHtml5MediaTracking, MediaTrackingPlugin } from '../src';

describe('waitForElement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should call callback when element is added to the DOM', async () => {
    const callback = jest.fn();

    const stringConfig = {
      id: 'test',
      video: 'video',
      captureEvents: [],
      context: undefined,
      timestamp: undefined,
    };

    waitForElement(stringConfig, callback);

    const element = document.createElement('video');
    element.id = 'video';
    document.body.appendChild(element);

    await new Promise((r) => setTimeout(r, 0));

    expect(callback).toHaveBeenCalledWith({
      context: undefined,
      timestamp: undefined,
      id: 'test',
      video: element,
      captureEvents: [],
    });
  });
});

describe('MediaTrackingPlugin', () => {
  window.fetch = jest.fn();

  let idx = 1;
  let id = '';
  let eventQueue: { event: SelfDescribingJson; context: SelfDescribingJson[] }[] = [];

  beforeEach(() => {
    addTracker(`sp${idx++}`, `sp${idx++}`, 'js-3.9.0', '', new SharedState(), {
      stateStorageStrategy: 'cookie',
      encodeBase64: false,
      plugins: [
        SnowplowMediaPlugin(),
        MediaTrackingPlugin(),
        {
          beforeTrack: (pb: PayloadBuilder) => {
            const { ue_pr, co, tna } = pb.build();
            if (tna == `sp${idx - 1}`) {
              eventQueue.push({ event: JSON.parse(ue_pr as string).data, context: JSON.parse(co as string).data });
            }
          },
        },
      ],
      contexts: { webPage: false },
      customFetch: async () => new Response(null, { status: 200 }),
    });
    id = `media-${idx}`;
  });

  afterEach(() => {
    endMediaTracking({ id });
    eventQueue = [];
  });

  const htmlMediaEvents = [
    'abort',
    'canplay',
    'canplaythrough',
    'durationchange',
    'emptied',
    'ended',
    'error',
    'loadeddata',
    'loadedmetadata',
    'loadstart',
    'pause',
    'play',
    'playing',
    'progress',
    'ratechange',
    'seeked',
    'seeking',
    'stalled',
    'suspend',
    'timeupdate',
    'volumechange',
    'waiting',
  ];

  for (const event of htmlMediaEvents) {
    Object.defineProperty(global.window.HTMLMediaElement.prototype, event, {
      get() {
        return () => this.dispatchEvent(new Event(event));
      },
    });
  }

  it(`tracks: Play`, async () => {
    const video = document.createElement('video');
    video.id = id;
    document.body.appendChild(video);

    startHtml5MediaTracking({ id: 'id', video, captureEvents: [MediaEventType.Play] });

    video.play();

    expect(eventQueue[0].event).toEqual({
      schema: `iglu:com.snowplowanalytics.snowplow.media/play_event/jsonschema/1-0-0`,
      data: {},
    });
  });

  it(`tracks: Pause`, async () => {
    const video = document.createElement('video');
    video.id = id;
    document.body.appendChild(video);

    startHtml5MediaTracking({ id: 'id', video, captureEvents: [MediaEventType.Pause] });

    video.pause();

    expect(eventQueue[0].event).toEqual({
      schema: `iglu:com.snowplowanalytics.snowplow.media/pause_event/jsonschema/1-0-0`,
      data: {},
    });
  });

  it('tracks: End', async () => {
    const video = document.createElement('video');
    video.id = id;
    document.body.appendChild(video);

    startHtml5MediaTracking({ id: 'id', video, captureEvents: [MediaEventType.End] });

    video.dispatchEvent(new Event('ended'));

    expect(eventQueue[0].event).toEqual({
      schema: `iglu:com.snowplowanalytics.snowplow.media/end_event/jsonschema/1-0-0`,
      data: {},
    });
  });

  it('tracks: SeekEnd', () => {
    const video = document.createElement('video');
    video.id = id;
    document.body.appendChild(video);

    startHtml5MediaTracking({
      id: 'id',
      video,
      captureEvents: [MediaEventType.SeekEnd],
      filterOutRepeatedEvents: false,
    });

    video.dispatchEvent(new Event('seeked'));

    expect(eventQueue.pop()!.event).toEqual({
      schema: `iglu:com.snowplowanalytics.snowplow.media/seek_end_event/jsonschema/1-0-0`,
      data: {},
    });
  });

  it('tracks: PlaybackRateChange', () => {
    const video = document.createElement('video');
    video.id = id;
    document.body.appendChild(video);

    startHtml5MediaTracking({ id: 'id', video, captureEvents: [MediaEventType.PlaybackRateChange] });

    video.playbackRate = 2;

    expect(eventQueue[0].event).toEqual({
      schema: `iglu:com.snowplowanalytics.snowplow.media/playback_rate_change_event/jsonschema/1-0-0`,
      data: {
        newRate: 2,
        previousRate: 1,
      },
    });
  });

  it('tracks: VolumeChange', () => {
    const video = document.createElement('video');
    video.id = id;
    document.body.appendChild(video);

    startHtml5MediaTracking({
      id: 'id',
      video,
      captureEvents: [MediaEventType.VolumeChange],
      filterOutRepeatedEvents: false,
    });

    video.volume = 0.1;

    expect(eventQueue[0].event).toEqual({
      schema: `iglu:com.snowplowanalytics.snowplow.media/volume_change_event/jsonschema/1-0-0`,
      data: {
        newVolume: 10,
        previousVolume: 100,
      },
    });
  });

  // Can't set fullscreen element in JSDOM, so `fullscreen` will be always `false`
  it('tracks: FullscreenChange', () => {
    const video = document.createElement('video');
    video.id = id;
    document.body.appendChild(video);

    startHtml5MediaTracking({ id: 'id', video, captureEvents: [MediaEventType.FullscreenChange] });

    video.dispatchEvent(new Event('fullscreenchange'));

    expect(eventQueue[0].event).toEqual({
      schema: `iglu:com.snowplowanalytics.snowplow.media/fullscreen_change_event/jsonschema/1-0-0`,
      data: {
        fullscreen: false,
      },
    });
  });

  it('tracks: PictureInPictureChange', () => {
    const video = document.createElement('video');
    video.id = id;
    document.body.appendChild(video);

    startHtml5MediaTracking({ id: 'id', video, captureEvents: [MediaEventType.PictureInPictureChange] });

    video.dispatchEvent(new Event('enterpictureinpicture'));

    expect(eventQueue.pop()!.event).toEqual({
      schema: `iglu:com.snowplowanalytics.snowplow.media/picture_in_picture_change_event/jsonschema/1-0-0`,
      data: {
        pictureInPicture: true,
      },
    });

    video.dispatchEvent(new Event('leavepictureinpicture'));

    expect(eventQueue.pop()!.event).toEqual({
      schema: `iglu:com.snowplowanalytics.snowplow.media/picture_in_picture_change_event/jsonschema/1-0-0`,
      data: {
        pictureInPicture: false,
      },
    });
  });

  it('tracks: BufferStart', () => {
    const video = document.createElement('video');
    video.id = id;
    document.body.appendChild(video);

    startHtml5MediaTracking({ id: 'id', video, captureEvents: [MediaEventType.BufferStart] });

    video.dispatchEvent(new Event('waiting'));

    expect(eventQueue[0].event).toEqual({
      schema: `iglu:com.snowplowanalytics.snowplow.media/buffer_start_event/jsonschema/1-0-0`,
      data: {},
    });
  });

  it('tracks: BufferEnd', () => {
    const video = document.createElement('video');
    video.id = id;
    document.body.appendChild(video);

    startHtml5MediaTracking({ id: 'id', video, captureEvents: [MediaEventType.BufferStart, MediaEventType.BufferEnd] });

    video.dispatchEvent(new Event('waiting'));
    video.dispatchEvent(new Event('playing'));

    expect(eventQueue.pop()!.event).toEqual({
      schema: `iglu:com.snowplowanalytics.snowplow.media/buffer_end_event/jsonschema/1-0-0`,
      data: {},
    });
  });

  it('tracks: Error', () => {
    const video = document.createElement('video');
    video.id = id;
    document.body.appendChild(video);

    startHtml5MediaTracking({ id: 'id', video, captureEvents: [MediaEventType.Error] });

    video.dispatchEvent(new Event('error'));

    expect(eventQueue[0].event).toEqual({
      schema: `iglu:com.snowplowanalytics.snowplow.media/error_event/jsonschema/1-0-0`,
      data: {},
    });
  });

  it("doesn't track BufferEnd if 'waiting' not fired first ", () => {
    const video = document.createElement('video');
    video.id = id;
    document.body.appendChild(video);

    startHtml5MediaTracking({ id: 'id', video, captureEvents: [MediaEventType.BufferStart, MediaEventType.BufferEnd] });

    video.dispatchEvent(new Event('playing'));

    expect(eventQueue.length).toBe(0);
  });
});
