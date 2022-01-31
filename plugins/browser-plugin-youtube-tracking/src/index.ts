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
import { EventData, EventGroup, MediaTrackingOptions, TrackedPlayer, TrackingOptions } from './types';
import { BrowserPlugin, BrowserTracker, dispatchToTrackersInCollection } from '@snowplow/browser-tracker-core';
import { buildSelfDescribingEvent, CommonEventProperties, Logger, SelfDescribingJson } from '@snowplow/tracker-core';
import { SnowplowEvent } from './snowplowEvents';
import { MediaPlayerEvent } from './contexts';
import { buildYouTubeEvent } from './buildYouTubeEvent';
import { YTEvent } from './youtubeEvents';
import { DefaultEvents, EventGroups, AllEvents } from './eventGroups';

const _trackers: Record<string, BrowserTracker> = {};
const trackedPlayers: Record<string, TrackedPlayer> = {};
const trackingQueue: Array<TrackingOptions> = [];
let LOG: Logger;

export function YouTubeTrackingPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      _trackers[tracker.id] = tracker;
    },
    logger: (logger) => {
      LOG = logger;
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

export function trackingOptionsParser(mediaId: string, conf?: MediaTrackingOptions): TrackingOptions {
  const defaults: TrackingOptions = {
    mediaId: mediaId,
    captureEvents: DefaultEvents,
    youtubeEvents: [
      YTPlayerEvent.ONSTATECHANGE,
      YTPlayerEvent.ONPLAYBACKQUALITYCHANGE,
      YTPlayerEvent.ONERROR,
      YTPlayerEvent.ONPLAYBACKRATECHANGE,
    ],
    updateRate: 500,
    progress: {
      boundaries: [10, 25, 50, 75],
      boundaryTimeoutIds: [],
    },
  };

  if (!conf) return defaults;
  if (conf.label) defaults.label = conf.label;
  defaults.updateRate = conf.updateRate || defaults.updateRate;
  defaults.captureEvents = conf.captureEvents || defaults.captureEvents;

  let parsedEvents: EventGroup = [];
  for (let ev of defaults.captureEvents) {
    // If an event is an EventGroup, get the events from that group
    if (EventGroups.hasOwnProperty(ev)) {
      parsedEvents = parsedEvents.concat(EventGroups[ev]);
    } else if (!Object.keys(AllEvents).filter((k) => k === ev)) {
      LOG.warn(`'${ev}' is not a valid event.`);
    } else {
      parsedEvents.push(ev);
    }
  }

  defaults.captureEvents = parsedEvents;

  for (let ev of defaults.captureEvents) {
    if (
      CaptureEventToYouTubeEvent.hasOwnProperty(ev) &&
      defaults.youtubeEvents.indexOf(CaptureEventToYouTubeEvent[ev]) === -1
    ) {
      defaults.youtubeEvents.push(CaptureEventToYouTubeEvent[ev]);
    }
  }

  if (defaults.captureEvents.indexOf(SnowplowEvent.PERCENTPROGRESS) !== -1) {
    defaults.progress = {
      boundaries: conf.boundaries || defaults.progress!.boundaries,
      boundaryTimeoutIds: [],
    };
  }

  return defaults;
}

export function enableYouTubeTracking(args: { id: string; options?: MediaTrackingOptions }) {
  const conf: TrackingOptions = trackingOptionsParser(args.id, args.options);
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
      LOG.error('YouTube iframe API failed to load.');
    }
  } else {
    // Once the API is avaliable, listeners are attached to anything sitting in the queue
    while (trackingQueue.length) {
      initialisePlayer(trackingQueue.pop()!);
    }
  }
}

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

function playerReady(event: YT.PlayerEvent, conf: TrackingOptions) {
  const player: YT.Player = event.target;

  const builtInEvents: Record<string, Function> = {
    [YTPlayerEvent.ONSTATECHANGE]: (e: YT.OnStateChangeEvent) => {
      if (conf.captureEvents.indexOf(YTStateEvent[e.data.toString()]) !== -1) {
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
