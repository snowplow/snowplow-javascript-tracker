import Player, { EventMap } from '@vimeo/player';

import { LOG } from '@snowplow/tracker-core';
import { BrowserPlugin } from '@snowplow/browser-tracker-core';
import { MediaEventType, MediaTrackingConfiguration, MediaType } from '@snowplow/browser-plugin-media/src/types';
import { SnowplowMediaPlugin, endMediaTracking, startMediaTracking } from '@snowplow/browser-plugin-media';

import { trackEvent } from './mediaPluginBinding';
import { CapturableInternalVimeoEvents, InternalVimeoEvent } from './events';
import { EventData, TrackedPlayer, VimeoTrackingConfiguration } from './types';
import { filterVimeoEvents, getErrorCallback, getVimeoMediaAttributes } from './utils';

export function VimeoTrackingPlugin(): BrowserPlugin {
  return SnowplowMediaPlugin();
}

const trackedPlayers: Record<string, TrackedPlayer> = {};

/** Start tracking a Vimeo Iframe element or existing Vimeo {@link Player} */
export function startVimeoTracking(args: VimeoTrackingConfiguration): void {
  const { video, ...config } = args;
  if (video === undefined) {
    LOG.error("Property 'video' is undefined");
  } else if (video instanceof HTMLIFrameElement && video.nodeName !== 'IFRAME') {
    LOG.error("Property 'video' is not an Iframe");
  } else {
    const internalConfig = filterVimeoEvents(config as VimeoTrackingConfiguration);

    if ((video as HTMLIFrameElement).nodeName === 'IFRAME') {
      startVimeoTrackingOnIframe(video as HTMLIFrameElement, internalConfig);
    } else {
      startVimeoTrackingOnPlayer(video as Player, internalConfig);
    }
  }
}

/**
 * Ends media tracking with the given ID if previously started. Clears local state for the media tracking.
 * Clears all listeners set by the plugin on the Vimeo player.
 */
export function endVimeoTracking(id: string): void {
  const playerToEnd = trackedPlayers[id];
  if (playerToEnd === undefined) {
    LOG.error(`No Vimeo player found with ID ${id}`);
  } else {
    Object.entries(playerToEnd.eventListeners).forEach(([eventType, callback]) =>
      playerToEnd.player.off(eventType as keyof EventMap, callback)
    );
    endMediaTracking({ id: playerToEnd.config.id });
  }
}

/** Enables the tracking of Vimeo events on an Iframe */
function startVimeoTrackingOnIframe(iframe: HTMLIFrameElement, config: VimeoTrackingConfiguration): void {
  setInitialPlayerAttributes({
    player: new Player(iframe),
    config,
    eventListeners: {},
  });
}

/** Enables the tracking of Vimeo events on an existing Vimeo player */
function startVimeoTrackingOnPlayer(player: Player, config: VimeoTrackingConfiguration): void {
  setInitialPlayerAttributes({
    player,
    config,
    eventListeners: {},
  });
}

/** Set the initial Media plugin player configuration before tracking begins */
async function setInitialPlayerAttributes(trackedPlayer: TrackedPlayer): Promise<void> {
  trackedPlayer.config.player = {
    ...(await getVimeoMediaAttributes(trackedPlayer)),
    ...trackedPlayer.config.player,
    ...{ mediaType: MediaType.Video, playerType: 'com.vimeo' },
  };

  trackedPlayers[trackedPlayer.config.id] = trackedPlayer;
  startTracking(trackedPlayer);
}

/** Attaches listeners to the Vimeo player for each event in {@link VimeoTrackingConfiguration.vimeoCaptureEvents | vimeoCaptureEvents} */
async function startTracking(trackedPlayer: TrackedPlayer): Promise<void> {
  const errorCallback = getErrorCallback(trackedPlayer);

  startMediaTracking(trackedPlayer.config as MediaTrackingConfiguration);

  trackEvent(trackedPlayer, MediaEventType.Ready, {}, errorCallback);

  // Track every event, event filtering is done by the Media Plugin
  Object.keys(InternalVimeoEvent).forEach((eventName) => {
    const eventType = InternalVimeoEvent[eventName as keyof typeof InternalVimeoEvent];
    // Don't attach listeners for Vimeo events that haven't been passed in with the Media Plugin config
    if (
      CapturableInternalVimeoEvents.includes(eventType) &&
      !trackedPlayer.config.vimeoCaptureEvents?.includes(eventType)
    ) {
      return;
    }

    // Create a named function to allow us to remove the listener later
    const callback = (eventData: EventData | unknown) => trackEvent(trackedPlayer, eventType, eventData, errorCallback);
    trackedPlayer.eventListeners[eventType] = callback;

    trackedPlayer.player.on(eventType, callback);
  });
}
