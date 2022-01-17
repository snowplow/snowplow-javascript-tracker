/*
 * Copyright (c) 2021 Snowplow Analytics Ltd
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
import { isType, boundaryErrorHandling, trackingOptionsParser } from './helperFunctions';
import { DocumentEvent, MediaEvent, SnowplowEvent, TextTrackEvent } from './mediaEvents';
import { TrackingOptions, MediaTrackingOptions, TrackedElement, EventDetail } from './types';
import { BrowserPlugin, BrowserTracker, dispatchToTrackersInCollection } from '@snowplow/browser-tracker-core';
import { buildSelfDescribingEvent, CommonEventProperties, Logger, SelfDescribingJson } from '@snowplow/tracker-core';
import { MediaPlayerEvent } from './contexts';
import { findMediaElem } from './findMediaElement';
import { buildMediaEvent } from './buildMediaEvent';
import { SEARCH_ERROR } from './constants';

declare global {
  interface HTMLVideoElement {
    autoPictureInPicture: boolean;
    disableRemotePlayback: boolean;
    disablePictureInPicture: boolean;
  }
  interface HTMLAudioElement {
    disableRemotePlayback: boolean;
  }
  interface Document {
    pictureInPictureElement: Element;
    msFullscreenElement: Element;
  }
}

let LOG: Logger;
const _trackers: Record<string, BrowserTracker> = {};

export function MediaTrackingPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      _trackers[tracker.id] = tracker;
    },
    logger: (logger) => {
      LOG = logger;
    },
  };
}

const trackedIds: Record<string, TrackedElement> = {};

// IE doesn't assign the 'target' property to the element a fullscreen event was called from,
// so need to track the element that is fullscreen, so when leaving fullscreen, we can
// check which id to track the event for (as document.fullscreenElement is null at that point)
let fullscreenElementId: string = '';

export function enableMediaTracking(args: { id: string; options?: MediaTrackingOptions }) {
  const conf: TrackingOptions = trackingOptionsParser(args.id, args.options);

  // Some events have additional effects/need to perform checks before running mediaPlayerEvent
  const eventsWithOtherFunctions: Record<string, Function> = {
    [DocumentEvent.FULLSCREENCHANGE]: (e: string, el: HTMLAudioElement | HTMLVideoElement, conf: TrackingOptions) => {
      // If there is no fullscreen element, it means we are entering fullscreen
      if (document.fullscreenElement || document.msFullscreenElement) {
        fullscreenElementId = document.fullscreenElement?.id || document.msFullscreenElement?.id;
      }
      if (fullscreenElementId === el.id) {
        mediaPlayerEvent(e, el, conf);
      }
    },
    [MediaEvent.SEEKED]: (eventName: string, el: HTMLAudioElement | HTMLVideoElement, conf: TrackingOptions) => {
      if (conf.captureEvents.indexOf(SnowplowEvent.PERCENTPROGRESS) !== 0) {
        while (conf.progress!.boundaryTimeoutIds.length) {
          clearTimeout(conf.progress!.boundaryTimeoutIds.pop() as ReturnType<typeof setTimeout>);
        }
        mediaPlayerEvent(eventName, el, conf);
        setPercentageBoundTimeouts(el, conf);
      }
    },
  };

  const eventHandlers: Record<string, Function> = {};
  conf.captureEvents.forEach((ev) => {
    if (eventsWithOtherFunctions.hasOwnProperty(ev)) {
      eventHandlers[ev] = (e: string, el: HTMLAudioElement | HTMLVideoElement, conf: TrackingOptions, event: Event) =>
        eventsWithOtherFunctions[ev](e, el, conf, event);
    } else {
      eventHandlers[ev] = (e: string, el: HTMLAudioElement | HTMLVideoElement, conf: TrackingOptions) =>
        mediaPlayerEvent(e, el, conf);
    }
  });

  trackedIds[args.id] = { waitTime: 250, retryCount: 5, tracking: false };
  setUpListeners(args.id, conf, eventHandlers);
}

function setUpListeners(id: string, conf: TrackingOptions, eventHandlers: Record<string, Function>) {
  // The element may not be loaded in time for this function to run, so we have a few goes at finding the element
  const result = findMediaElem(id);

  if (!trackedIds[id].retryCount) {
    LOG.error(result.err || SEARCH_ERROR.NOT_FOUND);
    return;
  }

  if (!result.el) {
    trackedIds[id].retryCount--;
    trackedIds[id].timeoutId = setTimeout(() => setUpListeners(id, conf, eventHandlers), trackedIds[id].waitTime);
    trackedIds[id].waitTime *= 2;
    return;
  }

  clearTimeout(trackedIds[id].timeoutId as ReturnType<typeof setTimeout>);

  if (!trackedIds[id].tracking) {
    if (conf.captureEvents.indexOf(SnowplowEvent.PERCENTPROGRESS) !== 0) {
      boundaryErrorHandling(conf.progress!.boundaries);
      setPercentageBoundTimeouts(result.el, conf);
    }
    addCaptureEventListeners(result.el, conf, eventHandlers);
    trackedIds[id].tracking = true;
  }
}

function addCaptureEventListeners(
  el: HTMLAudioElement | HTMLVideoElement,
  conf: TrackingOptions,
  eventHandlers: Record<string, Function>
): void {
  conf.captureEvents.forEach((e) => {
    if (isType(e, TextTrackEvent)) {
      // IE10 doesn't support addEventListener for TextTrack objects
      if (el.textTracks.hasOwnProperty('addEventListener')) {
        el.textTracks.addEventListener(e, () => eventHandlers[e](e, el, conf));
      }
    } else if (isType(e, DocumentEvent)) {
      // The event emitted by the listener is needed for fullscreen tracking, as on exiting fullscreen
      // document.fullscreenElement is null. The id is needed to check if the event should be tracked
      ['MSFullscreenChange', 'fullscreenchange'].forEach((p: string) => {
        document.addEventListener(p, () => eventHandlers[e](e, el, conf));
      });
    } else {
      el.addEventListener(e, () => eventHandlers[e](e, el, conf));
    }
  });
}

function mediaPlayerEvent(
  e: string,
  el: HTMLAudioElement | HTMLVideoElement,
  conf: TrackingOptions,
  detail?: EventDetail
): void {
  const event = buildMediaEvent(e, el, conf, detail);
  if (conf.captureEvents.indexOf(SnowplowEvent.PERCENTPROGRESS) !== -1) {
    progressHandler(e, el, conf);
  }

  // Dragging the volume scrubber will generate a lot of events, this limits the rate at which
  // volume events can be sent at
  if (e === MediaEvent.VOLUMECHANGE) {
    clearTimeout(conf.volume!.eventTimeoutId as ReturnType<typeof setTimeout>);
    conf.volume!.eventTimeoutId = setTimeout(() => trackMediaEvent(event), conf.volume!.trackingInterval);
  } else {
    trackMediaEvent(event);
  }
}

function trackMediaEvent(
  event: SelfDescribingJson<MediaPlayerEvent> & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
): void {
  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildSelfDescribingEvent({ event }), event.context, event.timestamp);
  });
}

// Progress Tracking

function progressHandler(e: string, el: HTMLAudioElement | HTMLVideoElement, conf: TrackingOptions) {
  // If the event is a pause event, we need to clear any existing progress timeouts, and set them again on play
  if (e === MediaEvent.PAUSE) {
    while (conf.progress!.boundaryTimeoutIds.length) {
      clearTimeout(conf.progress!.boundaryTimeoutIds.pop() as ReturnType<typeof setTimeout>);
    }
  }
  if (e === MediaEvent.PLAY && (el as HTMLAudioElement | HTMLVideoElement).readyState > 0) {
    setPercentageBoundTimeouts(el as HTMLAudioElement | HTMLVideoElement, conf);
  }
}

function setPercentageBoundTimeouts(el: HTMLAudioElement | HTMLVideoElement, conf: TrackingOptions) {
  conf.progress!.boundaries.forEach((boundary) => {
    const absoluteBoundaryTimeMs = el.duration * (boundary / 100) * 1000;
    const timeUntilBoundaryEvent = absoluteBoundaryTimeMs - el.currentTime * 1000;
    // If the boundary is less than the current time, we don't need to bother setting it
    if (0 < timeUntilBoundaryEvent) {
      conf.progress!.boundaryTimeoutIds.push(
        setTimeout(
          () => waitAnyRemainingTimeAfterTimeout(el, absoluteBoundaryTimeMs, boundary, conf),
          timeUntilBoundaryEvent
        )
      );
    }
  });
}

// The timeout in setPercentageBoundTimeouts fires ~100 - 300ms early
// waitAnyRemainingTimeAfterTimeout ensures the event is fired accurately

function waitAnyRemainingTimeAfterTimeout(
  el: HTMLAudioElement | HTMLVideoElement,
  absoluteBoundaryTimeMs: number,
  boundary: number,
  conf: TrackingOptions
) {
  if (el.currentTime * 1000 < absoluteBoundaryTimeMs) {
    setTimeout(() => {
      waitAnyRemainingTimeAfterTimeout(el, absoluteBoundaryTimeMs, boundary, conf);
    }, 10);
  } else {
    mediaPlayerEvent(SnowplowEvent.PERCENTPROGRESS, el, conf, { boundary: boundary });
  }
}
