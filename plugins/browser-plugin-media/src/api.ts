import { BrowserPlugin, BrowserTracker, dispatchToTrackersInCollection } from '@snowplow/browser-tracker-core';
import { buildSelfDescribingEvent, LOG, SelfDescribingJson } from '@snowplow/tracker-core';
import { MediaTracking } from './mediaTracking';
import { MediaPingInterval } from './pingInterval';
import { MediaSessionTracking } from './sessionTracking';
import {
  CommonMediaEventProperties,
  MediaEventType,
  MediaAdBreakType,
  MediaTrackArguments,
  MediaTrackAdBreakArguments,
  MediaTrackAdArguments,
  MediaTrackingConfiguration,
  MediaTrackPlaybackRateChangeArguments,
  MediaEvent,
  MediaTrackVolumeChangeArguments,
  MediaTrackFullscreenChangeArguments,
  MediaTrackPictureInPictureChangeArguments,
  MediaTrackAdPercentProgressArguments,
  MediaTrackQualityChangeArguments,
  MediaTrackErrorArguments,
  MediaTrackSelfDescribingEventArguments,
  EventWithContext,
} from './types';

export { MediaAdBreakType as MediaPlayerAdBreakType };

const _trackers: Record<string, BrowserTracker> = {};
const _context: Record<string, SelfDescribingJson[]> = {};

/**
 * Adds media tracking
 */
export function SnowplowMediaPlugin(): BrowserPlugin {
  let trackerId: string;
  return {
    activateBrowserPlugin: (tracker) => {
      trackerId = tracker.id;
      _trackers[trackerId] = tracker;
      _context[trackerId] = [];
    },
    contexts: () => {
      return _context[trackerId] || [];
    },
  };
}

const activeMedias: { [key: string]: MediaTracking } = {};

/**
 * Starts media tracking for a single media content tracked in a media player.
 * The tracking instance is uniquely identified by a given ID.
 * All subsequent media track calls will be processed within this media tracking if given the same ID.
 *
 * @param config Configuration for setting up media tracking
 * @param trackers The tracker identifiers which ping events will be sent to
 */
export function startMediaTracking(
  config: MediaTrackingConfiguration & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const pingInterval = typeof config.pings === 'boolean' ? undefined : config.pings?.pingInterval;
  const maxPausedPings = typeof config.pings === 'boolean' ? undefined : config.pings?.maxPausedPings;
  const pings =
    config.pings === false || config.pings === undefined
      ? undefined
      : new MediaPingInterval(pingInterval, maxPausedPings, () => {
          track({ mediaEvent: { type: MediaEventType.Ping } }, { id: config.id }, trackers);
        });

  const sessionTracking: MediaSessionTracking | undefined =
    config.session === false ? undefined : new MediaSessionTracking(config.id, config.session?.startedAt, pingInterval);

  const mediaTracking = new MediaTracking(
    config.id,
    config.player,
    sessionTracking,
    pings,
    config.boundaries,
    config.captureEvents,
    config.updatePageActivityWhilePlaying,
    config.filterOutRepeatedEvents,
    config.context
  );
  activeMedias[mediaTracking.id] = mediaTracking;
}

/**
 * Ends media tracking with the given ID if previously started.
 * Clears local state for the media tracking and sends any events waiting to be sent.
 *
 * @param configuration Configuration with the media tracking ID
 */
export function endMediaTracking(configuration: { id: string }) {
  if (activeMedias[configuration.id]) {
    activeMedias[configuration.id].flushAndStop();
    delete activeMedias[configuration.id];
  }
}

/**
 * Updates stored attributes of the media tracking such as the current playback.
 * Use this function to continually update the player attributes so that they
 * can be sent in the background ping events.
 *
 * @param args The attributes for the media entities
 * @param trackers The tracker identifiers which any resulting event will be sent to
 */
export function updateMediaTracking(
  args: MediaTrackArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  track({}, args, trackers);
}

/**
 * Tracks a media player ready event that is fired when the media tracking is successfully
 * attached to the player and can track events.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaReady(
  args: MediaTrackArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  track({ mediaEvent: { type: MediaEventType.Ready } }, args, trackers);
}

/**
 * Tracks a media player play event sent when the player changes state to playing from
 * previously being paused.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaPlay(
  args: MediaTrackArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  track(
    { mediaEvent: { type: MediaEventType.Play } },
    {
      ...args,
      player: {
        ...args.player,
        paused: false,
      },
    },
    trackers
  );
}

/**
 * Tracks a media player pause event sent when the user pauses the playback.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaPause(
  args: MediaTrackArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  track(
    { mediaEvent: { type: MediaEventType.Pause } },
    {
      ...args,
      player: {
        ...args.player,
        paused: true,
      },
    },
    trackers
  );
}

/**
 * Tracks a media player end event sent when playback stops when end of the media
 * is reached or because no further data is available.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaEnd(
  args: MediaTrackArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  track(
    { mediaEvent: { type: MediaEventType.End } },
    {
      ...args,
      player: {
        ...args.player,
        ended: true,
        paused: true,
      },
    },
    trackers
  );
}

/**
 * Tracks a media player seek start event sent when a seek operation begins.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaSeekStart(
  args: MediaTrackArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  track({ mediaEvent: { type: MediaEventType.SeekStart } }, args, trackers);
}

/**
 * Tracks a media player seek end event sent when a seek operation completes.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaSeekEnd(
  args: MediaTrackArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  track({ mediaEvent: { type: MediaEventType.SeekEnd } }, args, trackers);
}

/**
 * Tracks a media player playback rate change event sent when the playback rate has changed.
 *
 * If not passed here, the previous rate is taken from the last setting in media player.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaPlaybackRateChange(
  args: MediaTrackArguments & MediaTrackPlaybackRateChangeArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { previousRate, newRate } = args;
  track(
    {
      mediaEvent: {
        type: MediaEventType.PlaybackRateChange,
        eventBody: {
          previousRate: previousRate ?? getMedia(args.id)?.player.playbackRate,
          newRate,
        },
      },
    },
    {
      ...args,
      player: { ...args.player, playbackRate: newRate },
    },
    trackers
  );
}

/**
 * Tracks a media player volume change event sent when the volume has changed.
 *
 * If not passed here, the previous volume is taken from the last setting in media player.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaVolumeChange(
  args: MediaTrackArguments & MediaTrackVolumeChangeArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { previousVolume, newVolume } = args;
  track(
    {
      mediaEvent: {
        type: MediaEventType.VolumeChange,
        eventBody: {
          previousVolume: previousVolume ?? getMedia(args.id)?.player.volume,
          newVolume,
        },
      },
    },
    {
      ...args,
      player: { ...args.player, volume: newVolume },
    },
    trackers
  );
}

/**
 * Tracks a media player fullscreen change event fired immediately after
 * the browser switches into or out of full-screen mode.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaFullscreenChange(
  args: MediaTrackArguments & MediaTrackFullscreenChangeArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { fullscreen } = args;
  track(
    {
      mediaEvent: {
        type: MediaEventType.FullscreenChange,
        eventBody: { fullscreen },
      },
    },
    {
      ...args,
      player: { ...args.player, fullscreen },
    },
    trackers
  );
}

/**
 * Tracks a media player picture-in-picture change event fired immediately
 * after the browser switches into or out of picture-in-picture mode.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaPictureInPictureChange(
  args: MediaTrackArguments & MediaTrackPictureInPictureChangeArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { pictureInPicture } = args;
  track(
    {
      mediaEvent: {
        type: MediaEventType.PictureInPictureChange,
        eventBody: { pictureInPicture },
      },
    },
    {
      ...args,
      player: { ...args.player, pictureInPicture },
    },
    trackers
  );
}

/**
 * Tracks a media player ad break start event that signals the start of an ad break.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaAdBreakStart(
  args: MediaTrackArguments & MediaTrackAdBreakArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  track({ mediaEvent: { type: MediaEventType.AdBreakStart } }, args, trackers);
}

/**
 * Tracks a media player ad break end event that signals the end of an ad break.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaAdBreakEnd(
  args: MediaTrackArguments & MediaTrackAdBreakArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  track({ mediaEvent: { type: MediaEventType.AdBreakEnd } }, args, trackers);
}

/**
 * Tracks a media player ad start event that signals the start of an ad.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaAdStart(
  args: MediaTrackArguments & MediaTrackAdBreakArguments & MediaTrackAdArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  track({ mediaEvent: { type: MediaEventType.AdStart } }, args, trackers);
}

/**
 * Tracks a media player ad skip event fired when the user activated
 * a skip control to skip the ad creative.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaAdSkip(
  args: MediaTrackArguments &
    MediaTrackAdPercentProgressArguments &
    MediaTrackAdBreakArguments &
    MediaTrackAdArguments &
    CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  let { percentProgress } = args;
  if (percentProgress !== undefined) { percentProgress = Math.floor(percentProgress); }
  track(
    {
      mediaEvent: {
        type: MediaEventType.AdSkip,
        eventBody: { percentProgress },
      },
    },
    args,
    trackers
  );
}

/**
 * Tracks a media player ad first quartile played event fired when
 * a quartile of ad is reached after continuous ad playback at normal speed.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaAdFirstQuartile(
  args: MediaTrackArguments & MediaTrackAdBreakArguments & MediaTrackAdArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  track(
    {
      mediaEvent: {
        type: MediaEventType.AdFirstQuartile,
        eventBody: { percentProgress: 25 },
      },
    },
    args,
    trackers
  );
}

/**
 * Tracks a media player ad midpoint played event fired when a midpoint of ad is
 * reached after continuous ad playback at normal speed.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaAdMidpoint(
  args: MediaTrackArguments & MediaTrackAdBreakArguments & MediaTrackAdArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  track(
    {
      mediaEvent: {
        type: MediaEventType.AdMidpoint,
        eventBody: { percentProgress: 50 },
      },
    },
    args,
    trackers
  );
}

/**
 * Tracks media player ad third quartile played event fired when a quartile
 * of ad is reached after continuous ad playback at normal speed.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaAdThirdQuartile(
  args: MediaTrackArguments & MediaTrackAdBreakArguments & MediaTrackAdArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  track(
    {
      mediaEvent: {
        type: MediaEventType.AdThirdQuartile,
        eventBody: { percentProgress: 75 },
      },
    },
    args,
    trackers
  );
}

/**
 * Tracks a media player ad complete event that signals the ad creative
 * was played to the end at normal speed.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaAdComplete(
  args: MediaTrackArguments & MediaTrackAdBreakArguments & MediaTrackAdArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  track({ mediaEvent: { type: MediaEventType.AdComplete } }, args, trackers);
}

/**
 * Tracks a media player ad click event fired when the user clicked on the ad.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaAdClick(
  args: MediaTrackArguments &
    MediaTrackAdPercentProgressArguments &
    MediaTrackAdBreakArguments &
    CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  let { percentProgress } = args;
  if (percentProgress !== undefined) { percentProgress = Math.floor(percentProgress); }
  track(
    {
      mediaEvent: {
        type: MediaEventType.AdClick,
        eventBody: { percentProgress },
      },
    },
    args,
    trackers
  );
}

/**
 * Tracks a media player ad pause event fired when the user clicked the pause
 * control and stopped the ad creative.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaAdPause(
  args: MediaTrackArguments &
    MediaTrackAdPercentProgressArguments &
    MediaTrackAdBreakArguments &
    CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  let { percentProgress } = args;
  if (percentProgress !== undefined) { percentProgress = Math.floor(percentProgress); }
  track(
    {
      mediaEvent: {
        type: MediaEventType.AdPause,
        eventBody: { percentProgress },
      },
    },
    args,
    trackers
  );
}

/**
 * Tracks a media player ad resume event fired when the user resumed playing the
 * ad creative after it had been stopped or paused.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaAdResume(
  args: MediaTrackArguments &
    MediaTrackAdPercentProgressArguments &
    MediaTrackAdBreakArguments &
    MediaTrackAdArguments &
    CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  let { percentProgress } = args;
  if (percentProgress !== undefined) { percentProgress = Math.floor(percentProgress); }
  track(
    {
      mediaEvent: {
        type: MediaEventType.AdResume,
        eventBody: { percentProgress: percentProgress },
      },
    },
    args,
    trackers
  );
}

/**
 * Tracks a media player buffering start event fired when the player goes
 * into the buffering state and begins to buffer content.
 *
 * End of buffering can be tracked using `trackMediaBufferEnd` or `trackMediaPlay` or
 * by updating the `currentTime` property.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaBufferStart(
  args: MediaTrackArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  track({ mediaEvent: { type: MediaEventType.BufferStart } }, args, trackers);
}

/**
 * Tracks a media player buffering end event fired when the the player
 * finishes buffering content and resumes playback.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaBufferEnd(
  args: MediaTrackArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  track({ mediaEvent: { type: MediaEventType.BufferEnd } }, args, trackers);
}

/**
 * Tracks a media player quality change event tracked when the video
 * playback quality changes automatically.
 *
 * If not passed here, the previous quality is taken from the last setting in media player.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaQualityChange(
  args: MediaTrackArguments & MediaTrackQualityChangeArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { previousQuality, newQuality, bitrate, framesPerSecond, automatic, id } = args;
  track(
    {
      mediaEvent: {
        type: MediaEventType.QualityChange,
        eventBody: {
          previousQuality: previousQuality ?? getMedia(id)?.player.quality,
          newQuality,
          bitrate,
          framesPerSecond,
          automatic,
        },
      },
    },
    {
      ...args,
      player: { ...args.player, quality: newQuality },
    },
    trackers
  );
}

/**
 * Tracks a media player error event tracked when the resource could not be loaded due to an error.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaError(
  args: MediaTrackArguments & MediaTrackErrorArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { errorCode, errorName, errorDescription } = args;
  track(
    {
      mediaEvent: {
        type: MediaEventType.Error,
        eventBody: { errorCode, errorName, errorDescription },
      },
    },
    args,
    trackers
  );
}

/**
 * Tracks a custom self-describing event within the context of the media tracking.
 * It will attach the context entities managed by the media tracking to the event (e.g. player, session, ad).
 *
 * @param args The attributes for the event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaSelfDescribingEvent(
  args: MediaTrackSelfDescribingEventArguments &
    MediaTrackArguments &
    MediaTrackAdArguments &
    MediaTrackAdBreakArguments &
    CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { event } = args;
  track({ customEvent: event }, args, trackers);
}

function getMedia(id: string): MediaTracking | undefined {
  if (activeMedias[id] === undefined) {
    LOG.error(`Media tracking ${id} not started.`);
    return undefined;
  }

  return activeMedias[id];
}

function track(
  event: { mediaEvent?: MediaEvent; customEvent?: SelfDescribingJson },
  args: MediaTrackArguments & MediaTrackAdArguments & MediaTrackAdBreakArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { context = [], timestamp, player, ad, adBreak, id } = args;
  const { mediaEvent, customEvent } = event;

  const mediaTracking = getMedia(id);
  if (mediaTracking === undefined) {
    return;
  }

  const trackEvent = (event: EventWithContext) => {
    dispatchToTrackersInCollection(trackers, _trackers, (t) => {
      t.core.track(buildSelfDescribingEvent(event), (event.context ?? []).concat(context), timestamp);
    });
  };

  mediaTracking.update(trackEvent, mediaEvent, customEvent, player, ad, adBreak);

  // Update page activity in order to keep sending page pings if needed
  if (mediaTracking.shouldUpdatePageActivity()) {
    dispatchToTrackersInCollection(trackers, _trackers, (t) => {
      t.updatePageActivity();
    });
  }
}
