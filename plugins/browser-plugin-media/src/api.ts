import { BrowserPlugin, BrowserTracker, dispatchToTrackersInCollection } from '@snowplow/browser-tracker-core';
import { buildSelfDescribingEvent, LOG, SelfDescribingJson } from '@snowplow/tracker-core';
import { MediaTracking } from './mediaTracking';
import { PingInterval } from './pingInterval';
import { MediaPlayerSessionTracking } from './sessionTracking';
import {
  CommonMediaEventProperties,
  MediaPlayerAttributes,
  MediaPlayerEventType,
  MediaPlayerAdBreakType,
  MediaTrackArguments,
  MediaTrackAdBreakArguments,
  MediaTrackAdArguments,
} from './types';

export { MediaPlayerAdBreakType };

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

type MediaTrackingConfiguration = {
  id: string;
  label?: string;
  media?: MediaPlayerAttributes;
  session?: { startedAt?: Date } | false;
  pings?: { pingInterval?: number } | boolean;
  boundaries?: number[];
};

let activeMedias: { [key: string]: MediaTracking } = {};

/**
 * Starts media tracking with a given ID.
 * All subsequent media track calls will be processed within this media tracking if given the same ID.
 *
 * @param config Configuration for setting up media tracking
 * @param trackers The tracker identifiers which ping events will be sent to
 */
export function startMediaTracking(
  config: MediaTrackingConfiguration & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const pingInterval =
    config.pings === false ? undefined : config.pings === true ? undefined : config.pings?.pingInterval;

  const sessionTracking: MediaPlayerSessionTracking | undefined =
    config.session === false
      ? undefined
      : new MediaPlayerSessionTracking(config.id, config.session?.startedAt, pingInterval);

  const pings =
    config.pings === false || config.pings == undefined
      ? undefined
      : new PingInterval(pingInterval, () => {
          trackMediaEvent(
            MediaPlayerEventType.Ping,
            {
              id: config.id,
              context: config.context,
            },
            trackers
          );
        });

  const mediaTracking = new MediaTracking(
    config.id,
    config.label,
    config.media,
    sessionTracking,
    pings,
    config.boundaries
  );
  activeMedias[mediaTracking.id] = mediaTracking;
}

/**
 * Ends media tracking with the given ID if previously started.
 * Clears local state for the media tracking.
 *
 * @param configuration Configuration with the media tracking ID
 */
export function endMediaTracking(configuration: { id: string }) {
  if (activeMedias[configuration.id]) {
    activeMedias[configuration.id].stop();
    delete activeMedias[configuration.id];
  }
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
  trackMediaEvent(MediaPlayerEventType.Ready, args, trackers);
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
  trackMediaEvent(MediaPlayerEventType.Play, args, trackers);
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
  trackMediaEvent(MediaPlayerEventType.Pause, args, trackers);
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
  trackMediaEvent(MediaPlayerEventType.End, args, trackers);
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
  trackMediaEvent(MediaPlayerEventType.SeekStart, args, trackers);
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
  trackMediaEvent(MediaPlayerEventType.SeekEnd, args, trackers);
}

/**
 * Tracks a media player playback rate change event sent when the playback rate has changed.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaPlaybackRateChange(
  args: MediaTrackArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackMediaEvent(MediaPlayerEventType.PlaybackRateChange, args, trackers);
}

/**
 * Tracks a media player volume change event sent when the volume has changed.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaVolumeChange(
  args: MediaTrackArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackMediaEvent(MediaPlayerEventType.VolumeChange, args, trackers);
}

/**
 * Tracks a media player fullscreen change event fired immediately after
 * the browser switches into or out of full-screen mode.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaFullscreenChange(
  args: MediaTrackArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackMediaEvent(MediaPlayerEventType.FullscreenChange, args, trackers);
}

/**
 * Tracks a media player picture-in-picture change event fired immediately
 * after the browser switches into or out of picture-in-picture mode.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaPictureInPictureChange(
  args: MediaTrackArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackMediaEvent(MediaPlayerEventType.PictureInPictureChange, args, trackers);
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
  trackMediaEvent(MediaPlayerEventType.AdBreakStart, args, trackers);
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
  trackMediaEvent(MediaPlayerEventType.AdBreakEnd, args, trackers);
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
  trackMediaEvent(MediaPlayerEventType.AdStart, args, trackers);
}

/**
 * Tracks a media player ad skip event fired when the user activated
 * a skip control to skip the ad creative.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaAdSkip(
  args: MediaTrackArguments & MediaTrackAdBreakArguments & MediaTrackAdArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackMediaEvent(MediaPlayerEventType.AdSkip, args, trackers);
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
  trackMediaEvent(MediaPlayerEventType.AdFirstQuartile, args, trackers);
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
  trackMediaEvent(MediaPlayerEventType.AdMidpoint, args, trackers);
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
  trackMediaEvent(MediaPlayerEventType.AdThirdQuartile, args, trackers);
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
  trackMediaEvent(MediaPlayerEventType.AdComplete, args, trackers);
}

/**
 * Tracks a media player ad click event fired when the user clicked on the ad.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaAdClick(
  args: MediaTrackArguments & MediaTrackAdBreakArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackMediaEvent(MediaPlayerEventType.AdClick, args, trackers);
}

/**
 * Tracks a media player ad pause event fired when the user clicked the pause
 * control and stopped the ad creative.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaAdPause(
  args: MediaTrackArguments & MediaTrackAdBreakArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackMediaEvent(MediaPlayerEventType.AdPause, args, trackers);
}

/**
 * Tracks a media player ad resume event fired when the user resumed playing the
 * ad creative after it had been stopped or paused.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaAdResume(
  args: MediaTrackArguments & MediaTrackAdBreakArguments & MediaTrackAdArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackMediaEvent(MediaPlayerEventType.AdResume, args, trackers);
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
  trackMediaEvent(MediaPlayerEventType.BufferStart, args, trackers);
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
  trackMediaEvent(MediaPlayerEventType.BufferEnd, args, trackers);
}

/**
 * Tracks a media player quality change event tracked when the video
 * playback quality changes automatically.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaQualityChange(
  args: MediaTrackArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackMediaEvent(MediaPlayerEventType.QualityChange, args, trackers);
}

/**
 * Tracks a media player user update quality event tracked when the video
 * playback quality changes as a result of user interaction (choosing a different quality setting).
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaUserUpdateQuality(
  args: MediaTrackArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackMediaEvent(MediaPlayerEventType.UserUpdateQuality, args, trackers);
}

/**
 * Tracks a media player error event tracked when the resource could not be loaded due to an error.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which the event will be sent to
 */
export function trackMediaError(
  args: MediaTrackArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackMediaEvent(MediaPlayerEventType.Error, args, trackers);
}

/**
 * Updates stored attributes of the media player such as the current playback.
 * Use this function to continually update the player attributes so that they
 * can be sent in the background ping events.
 *
 * @param args The attributes for the media player event and entities
 * @param trackers The tracker identifiers which any resulting event will be sent to
 */
export function updateMediaPlayer(
  args: MediaTrackArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackMediaEvent(undefined, args, trackers);
}

function trackMediaEvent(
  eventType: MediaPlayerEventType | undefined,
  args: MediaTrackArguments & MediaTrackAdArguments & MediaTrackAdBreakArguments & CommonMediaEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { context = [], timestamp, media, ad, adBreak } = args;

  if (activeMedias[args.id] === undefined) {
    LOG.error(`Media tracking ${args.id} not started.`);
    return;
  }

  const mediaTracking = activeMedias[args.id];
  const events = mediaTracking.update(eventType, media, ad, adBreak);

  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    events.forEach((event) => {
      t.core.track(buildSelfDescribingEvent(event), event.context.concat(context), timestamp);
    });
  });
}
