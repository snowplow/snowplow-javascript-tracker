/*
 * Copyright (c) 2022 Snowplow Analytics Ltd
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import { addUrlParam, parseUrlParams } from './helperFunctions';
import {
  CaptureEventToYouTubeEvent,
  YouTubeIFrameAPIURL,
  YTError,
  YTPlayerEvent,
  YTState,
  YTStateEvent,
} from './constants';
import {
  EventData,
  EventGroup,
  MediaTrackingOptions,
  TrackedPlayer,
  TrackingOptions,
  YouTubeTrackingConfiguration,
} from './types';
import { BrowserPlugin, BrowserTracker, dispatchToTrackersInCollection } from '@snowplow/browser-tracker-core';
import {
  buildSelfDescribingEvent,
  CommonEventProperties,
  LOG,
  SelfDescribingJson,
  DynamicContext,
} from '@snowplow/tracker-core';
import { SnowplowEvent } from './snowplowEvents';
import { MediaPlayerEvent } from './contexts';
import { buildYouTubeEvent } from './buildYouTubeEvent';
import { YTEvent } from './youtubeEvents';
import { DefaultEvents, EventGroups, AllEvents } from './eventGroups';

const _trackers: Record<string, BrowserTracker> = {};
const trackedPlayers: Record<string, TrackedPlayer> = {};
const trackingQueue: Array<TrackingOptions> = [];

export function YouTubeTrackingPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      _trackers[tracker.id] = tracker;
    },
  };
}

function trackEvent(
  event: SelfDescribingJson<MediaPlayerEvent> & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
): void {
  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildSelfDescribingEvent({ event }), event.context, event.timestamp);
  });
}

export function trackingOptionsParser(id: string | YT.Player, conf?: MediaTrackingOptions, context?: DynamicContext | null): TrackingOptions {
  const player = typeof id === 'string' ? undefined : id;
  const elementId = typeof id === 'string' ? id : id.getIframe().id;
  const defaultBoundaries = [10, 25, 50, 75];
  const defaultUpdateRate = 500;

  const parsed: TrackingOptions = {
    mediaId: elementId,
    player,
    captureEvents: conf?.captureEvents || DefaultEvents,
    youtubeEvents: [],
    updateRate: conf?.updateRate || defaultUpdateRate,
    context: context,
  };

  if (conf?.label) parsed.label = conf.label;

  let parsedEvents: EventGroup = [];
  for (let ev of parsed.captureEvents) {
    // If an event is an EventGroup, get the events from that group
    if (EventGroups.hasOwnProperty(ev)) {
      parsedEvents = parsedEvents.concat(EventGroups[ev]);
    } else if (AllEvents.indexOf(ev) === -1) {
      LOG.warn(`'${ev}' is not a valid event`);
    } else {
      parsedEvents.push(ev);
    }
  }

  parsed.captureEvents = parsedEvents;

  // Check if any events in `parsed.captureEvents` require a listener on a `YTPlayerEvent`
  // for them to fire
  for (let ev of parsed.captureEvents) {
    if (
      CaptureEventToYouTubeEvent.hasOwnProperty(ev) &&
      parsed.youtubeEvents.indexOf(CaptureEventToYouTubeEvent[ev]) === -1
    ) {
      parsed.youtubeEvents.push(CaptureEventToYouTubeEvent[ev]);
    }
  }

  // If "percentprogress" is in `captureEvents`, add the `progress` object
  // to the tracking options with the user-defined boundaries, or the default
  if (parsed.captureEvents.indexOf(SnowplowEvent.PERCENTPROGRESS) !== -1) {
    parsed.progress = {
      boundaries: conf?.boundaries || defaultBoundaries,
      boundaryTimeoutIds: [],
    };
    // We need to monitor state changes for 'percentprogress' events
    // as `progressHandler` uses these to set/reset timeouts
    if (parsed.youtubeEvents.indexOf(YTPlayerEvent.ONSTATECHANGE) === -1) {
      parsed.youtubeEvents.push(YTPlayerEvent.ONSTATECHANGE);
    }
  }

  return parsed;
}

export function enableYouTubeTracking(args: YouTubeTrackingConfiguration) {
  if (!Object.keys(_trackers).length) {
    LOG.error('Check YoutubeTrackingPlugin is initialized in tracker config');
    return;
  }

  const conf: TrackingOptions = trackingOptionsParser(args.id, args.options, args.context);

  if (typeof args.id !== 'string') {
    conf.urlParameters = parseUrlParams((<any>args.id).getIframe().src);
    addExistingPlayer(conf);
    return;
  }

  const el: HTMLIFrameElement = document.getElementById(args.id) as HTMLIFrameElement;
  
  if (!el) {
    LOG.error('Cannot find YouTube iframe');
    return;
  }

  // The 'enablejsapi' parameter is required to be '1' for the API to be able to communicate with the player

  if (el.src.indexOf('enablejsapi') === -1) {
    el.src = addUrlParam(el.src, 'enablejsapi', '1');
  }

  conf.urlParameters = parseUrlParams(el.src);

  // If the API is ready, we can immediately add the listeners
  if (typeof YT !== 'undefined' && typeof YT.Player !== 'undefined') {
    initialisePlayer(conf);
  } else {
    // If not, we put them into a queue that will have listeners added once the API is ready
    // and start trying to load the iframe API
    trackingQueue.push(conf);
    handleYouTubeIframeAPI(conf);
  }
}

let iframeAPIRetryWait = 100;
function handleYouTubeIframeAPI(conf: TrackingOptions) {
  // First we check if the script tag exists in the DOM, and enable the API if not
  const scriptTags = Array.prototype.slice.call(document.getElementsByTagName('script'));
  if (!scriptTags.some((s) => s.src === YouTubeIFrameAPIURL)) {
    // Load the Iframe API
    // https://developers.google.com/youtube/iframe_api_reference
    const tag: HTMLScriptElement = document.createElement('script');
    tag.src = YouTubeIFrameAPIURL;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
  }

  // Once the API is ready to use, 'YT.Player' will be defined
  // 'YT.Player' is not available immediately after 'YT' is defined,
  // so we need to wait until 'YT' is defined to then check 'YT.Player'
  if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
    if (iframeAPIRetryWait <= 6400) {
      setTimeout(() => {
        handleYouTubeIframeAPI(conf);
      }, iframeAPIRetryWait);
      iframeAPIRetryWait *= 2;
    } else {
      LOG.error('YouTube iframe API failed to load');
    }
  } else {
    // Once the API is avaliable, listeners are attached to anything sitting in the queue
    while (trackingQueue.length) {
      initialisePlayer(trackingQueue.pop()!);
    }
  }
}

/**
 * Adds a player to the list of tracked players, and attaches listeners to the player
 * This is used when a user passes in an existing player instance
 *
 * @param conf - The configuration for the player
 */
function addExistingPlayer(conf: TrackingOptions) {
  trackedPlayers[conf.mediaId] = {
    player: conf.player!!,
    conf: conf,
    seekTracking: {
      prevTime: conf.player?.getCurrentTime() || 0,
      enabled: false,
    },
    volumeTracking: {
      prevVolume: conf.player?.getVolume() || 0,
      enabled: false,
    },
  };

  // The 'ready' event is required for modelling purposes, the Out-The-Box YouTube modelling won't work without it
  // Ensure you have 'ready' in your 'captureEvents' array if you are using the Out-The-Box YouTube modelling
  if (conf.captureEvents.indexOf(YTEvent.READY) !== -1) {
    // We need to manually trigger the 'ready' event, as it won't be fired by the player when
    // an existing player is passed in, since it's already been fired
    const readyEvent = buildYouTubeEvent(conf.player!!, 'ready', conf);
    trackEvent(readyEvent);
  }

  attachListeners(conf.player!!, conf);
}

/**
 * Adds a player to the list of tracked players, and sets up the `onReady` callback to attach listeners once the player is ready
 *
 * @param conf - The configuration for the player
 */
function initialisePlayer(conf: TrackingOptions) {
  trackedPlayers[conf.mediaId] = {
    player: new YT.Player(conf.mediaId, { events: { onReady: (e: YT.PlayerEvent) => playerReady(e, conf) } }),
    conf: conf,
    seekTracking: {
      prevTime: 0,
      enabled: false,
    },
    volumeTracking: {
      prevVolume: 0,
      enabled: false,
    },
  };
}

function attachListeners(player: YT.Player, conf: TrackingOptions) {
  const builtInEvents: Record<string, Function> = {
    [YTPlayerEvent.ONSTATECHANGE]: (e: YT.OnStateChangeEvent) => {
      const stateEventInCaptureEvents = conf.captureEvents.indexOf(YTStateEvent[e.data.toString()]) !== -1;
      // If the user is tracking 'percentprogress' events, we need to pass these state changes to `progressHandler`,
      // even if the user is not tracking the state changes themselves
      if (conf.captureEvents.indexOf(SnowplowEvent.PERCENTPROGRESS) !== -1) {
        // Only pass the event to `progressHandler` if the event isn't in the `captureEvents` array
        // As otherwise it will be handled by `youtubeEvent` below
        if (!stateEventInCaptureEvents) {
          progressHandler(player, YTStateEvent[e.data], conf);
        }
      }

      if (stateEventInCaptureEvents) {
        youtubeEvent(trackedPlayers[conf.mediaId].player, YTStateEvent[e.data], conf);
      }
    },
    [YTPlayerEvent.ONPLAYBACKQUALITYCHANGE]: () =>
      youtubeEvent(trackedPlayers[conf.mediaId].player, YTEvent.PLAYBACKQUALITYCHANGE, conf),
    [YTPlayerEvent.ONAPICHANGE]: () => youtubeEvent(trackedPlayers[conf.mediaId].player, YTEvent.APICHANGE, conf),
    [YTPlayerEvent.ONERROR]: (e: YT.OnErrorEvent) =>
      youtubeEvent(trackedPlayers[conf.mediaId].player, YTEvent.ERROR, conf, { error: YTError[e.data] }),
    [YTPlayerEvent.ONPLAYBACKRATECHANGE]: () =>
      youtubeEvent(trackedPlayers[conf.mediaId].player, YTEvent.PLAYBACKRATECHANGE, conf),
  };

  conf.youtubeEvents.forEach((youtubeEventName) => {
    player.addEventListener(youtubeEventName, (eventData: YT.PlayerEvent) =>
      builtInEvents[youtubeEventName](eventData)
    );
  });
}

/**
 * Callback for when the player is ready
 *
 * This is used when a user passes in the string id of an IFrame player
 *
 * Attaches the listeners to the player and fires the captured `onReady` event
 *
 * @param event - The event object from the YouTube API (in this case, onReady)
 * @param conf - The configuration object for the player
 */
function playerReady(event: YT.PlayerEvent, conf: TrackingOptions) {
  const player: YT.Player = event.target;
  attachListeners(player, conf);

  if (conf.captureEvents.indexOf(YTEvent.READY) !== -1) {
    youtubeEvent(player, YTEvent.READY, conf);
  }
}

function youtubeEvent(player: YT.Player, eventName: string, conf: TrackingOptions, eventData?: EventData) {
  const playerInstance = trackedPlayers[conf.mediaId];
  if (!playerInstance.seekTracking.enabled && conf.captureEvents.indexOf(SnowplowEvent.SEEK) !== -1) {
    enableSeekTracking(player, conf, eventData);
  }
  if (!playerInstance.volumeTracking.enabled && conf.captureEvents.indexOf(SnowplowEvent.VOLUMECHANGE) !== -1) {
    enableVolumeTracking(player, conf, eventData);
  }

  if (conf.captureEvents.indexOf(SnowplowEvent.PERCENTPROGRESS) !== -1) {
    progressHandler(player, eventName, conf);
  }

  const event = buildYouTubeEvent(player, eventName, conf, eventData);
  trackEvent(event);
}

// Progress Tracking

function progressHandler(player: YT.Player, eventName: string, conf: TrackingOptions) {
  const timeoutIds = conf.progress!.boundaryTimeoutIds;
  if (eventName === YTState.PAUSED) {
    timeoutIds.forEach((id) => clearTimeout(id));
    timeoutIds.length = 0;
  }

  if (eventName === YTState.PLAYING) {
    setPercentageBoundTimeouts(player, conf);
  }
}

function setPercentageBoundTimeouts(player: YT.Player, conf: TrackingOptions) {
  conf.progress?.boundaries!.forEach((boundary) => {
    const absoluteBoundaryTimeMs = player.getDuration() * (boundary / 100) * 1000;
    const timeUntilBoundaryEvent = absoluteBoundaryTimeMs - player.getCurrentTime() * 1000;
    if (0 < timeUntilBoundaryEvent) {
      conf.progress!.boundaryTimeoutIds.push(
        setTimeout(
          () => waitAnyRemainingTimeAfterTimeout(player, conf, absoluteBoundaryTimeMs, boundary),
          timeUntilBoundaryEvent
        )
      );
    }
  });
}

// The timeout in setPercentageBoundTimeouts fires ~100 - 300ms early
// waitAnyRemainingTimeAfterTimeout ensures the event is fired accurately

function waitAnyRemainingTimeAfterTimeout(player: YT.Player, conf: TrackingOptions, percentTime: number, p: number) {
  if (player.getCurrentTime() * 1000 < percentTime) {
    setTimeout(() => waitAnyRemainingTimeAfterTimeout(player, conf, percentTime, p), 10);
  } else {
    youtubeEvent(player, SnowplowEvent.PERCENTPROGRESS, conf, {
      percentThrough: p,
    });
  }
}

// Seek Tracking

function enableSeekTracking(player: YT.Player, conf: TrackingOptions, eventData?: EventData) {
  trackedPlayers[conf.mediaId].seekTracking.enabled = true;
  setInterval(() => seekEventTracker(player, conf, eventData), conf.updateRate);
}

function seekEventTracker(player: YT.Player, conf: TrackingOptions, eventData?: EventData) {
  const playerInstance = trackedPlayers[conf.mediaId];
  const playerTime = player.getCurrentTime();
  if (Math.abs(playerTime - (playerInstance.seekTracking.prevTime + 0.5)) > 1) {
    youtubeEvent(player, SnowplowEvent.SEEK, conf, eventData);
  }
  playerInstance.seekTracking.prevTime = playerTime;
}

// Volume Tracking

function enableVolumeTracking(player: YT.Player, conf: TrackingOptions, eventData?: EventData) {
  trackedPlayers[conf.mediaId].volumeTracking.enabled = true;
  trackedPlayers[conf.mediaId].volumeTracking.prevVolume = player.getVolume();
  setInterval(() => volumeEventTracker(player, conf, eventData), conf.updateRate);
}

function volumeEventTracker(player: YT.Player, conf: TrackingOptions, eventData?: EventData) {
  const playerVolumeTracking = trackedPlayers[conf.mediaId].volumeTracking;
  const playerVolume = player.getVolume();
  if (playerVolume !== playerVolumeTracking.prevVolume) {
    youtubeEvent(player, SnowplowEvent.VOLUMECHANGE, conf, eventData);
  }
  playerVolumeTracking.prevVolume = playerVolume;
}
