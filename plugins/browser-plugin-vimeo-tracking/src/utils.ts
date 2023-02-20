import { Error as VimeoError, VimeoPromise } from '@vimeo/player';

import { LOG, SelfDescribingJson } from '@snowplow/tracker-core';
import { trackMediaError } from '@snowplow/browser-plugin-media';
import { MediaPlayer } from '@snowplow/browser-plugin-media/src/types';

import {
  InternalVimeoEvent,
  VimeoEventType,
  AllEvents,
  AvailableMediaEventType,
  AlwaysOnInternalVimeoEvents,
} from './events';
import {
  InternalVimeoTrackingConfiguration,
  TrackedPlayer,
  VimeoPlayerMetadata,
  VimeoTrackingConfiguration,
} from './types';
import { VimeoSchema } from './schema';

/**
 * Split the `captureEvents` array into two arrays:
 * - `captureEvents` - events that are passed onto the Media plugins `captureEvents` property
 * - `vimeoCaptureEvents` - events that can be passed into the `on` method of the Vimeo player
 */
export function filterVimeoEvents(configuration: VimeoTrackingConfiguration): InternalVimeoTrackingConfiguration {
  configuration.captureEvents = configuration.captureEvents ?? AllEvents;
  // Extract any events that are in the MediaEventType enum
  const mediaEventTypes = Object.values(AvailableMediaEventType);
  const captureEvents = configuration.captureEvents.filter((event) =>
    mediaEventTypes.includes(event as AvailableMediaEventType)
  ) as AvailableMediaEventType[];

  // Extract any events that aren't in the MediaEventType enum
  // Check if they are in the VimeoEventType enum
  // If so, remove any underscores and add them to the vimeoCaptureEvents array
  const vimeoEventTypes = Object.values(VimeoEventType);
  let vimeoCaptureEvents = configuration.captureEvents
    .filter((event) => vimeoEventTypes.includes(event as string as VimeoEventType))
    .map((e) => e.replace(/_/g, '') as InternalVimeoEvent) as InternalVimeoEvent[];

  // Add any always-on events that aren't already in the vimeoCaptureEvents array
  for (const event of AlwaysOnInternalVimeoEvents) {
    if (!vimeoCaptureEvents.includes(event)) {
      vimeoCaptureEvents.push(event);
    }
  }

  return {
    ...configuration,
    captureEvents,
    vimeoCaptureEvents,
  };
}

/**
 * Attempt to get the value of a Vimeo promise, or return undefined
 * if the method fails
 *
 * The Vimeo player will throw an error if the getter methods' promise is rejected
 * So to minimise event loss, we ignore any returned error value and return undefined instead,
 * so the property isn't serialized
 *
 * @param promise The promise returned by the Vimeo getter method
 * @returns The value returned from the promise, or undefined if the promise is rejected
 */
function tryVimeoPromise<T>(promise: VimeoPromise<T, VimeoError>): T | undefined {
  let ret: T | undefined;
  promise
    .then((v) => (ret = v))
    .catch((e) => {
      LOG.warn(e);
    });
  return ret;
}

export async function getVimeoMetadata(trackedPlayer: TrackedPlayer): Promise<SelfDescribingJson> {
  const { player } = trackedPlayer;

  const data: VimeoPlayerMetadata = {
    videoId: await player.getVideoId(),
    videoTitle: await player.getVideoTitle(),
    videoWidth: await player.getVideoWidth(),
    videoHeight: await player.getVideoHeight(),
    // 'getVideoUrl' can fail due to privacy settings
    videoUrl: tryVimeoPromise(player.getVideoUrl()),
  };

  return {
    schema: VimeoSchema.META,
    data,
  };
}

/** Get all attributes that can be passed into `updateMediaTracking` */
export async function getVimeoMediaAttributes(trackedPlayer: TrackedPlayer): Promise<MediaPlayer> {
  const { player } = trackedPlayer;
  return {
    currentTime: await player.getCurrentTime(),
    duration: await player.getDuration(),
    ended: await player.getEnded(),
    loop: await player.getLoop(),
    muted: await player.getMuted(),
    paused: await player.getPaused(),
    playbackRate: await player.getPlaybackRate(),
    volume: Math.round((await player.getVolume()) * 100),
    pictureInPicture: await player.getPictureInPicture(),
  };
}

/** A callback function for the current player, to use in the `.catch()` callback of the Vimeo Player getter methods */
export function getErrorCallback(trackedPlayer: TrackedPlayer) {
  return (error: VimeoError): void => {
    trackMediaError({
      id: trackedPlayer.config.id,
      errorName: error.name,
      errorDescription: `${error.method} - ${error.message}`,
    });
  };
}
