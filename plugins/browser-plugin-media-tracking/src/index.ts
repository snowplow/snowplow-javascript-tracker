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
import { DefaultEvents, EventGroups } from './eventGroups';
import { isTypeTextTrackEvent, isTypeDocumentEvent, percentBoundryErrorHandling } from './helperFunctions';
import { SnowplowMediaEvent } from './snowplowEvents';
import { DocumentEvent, MediaEvent } from './mediaEvents';
import { MediaEventType, TrackingOptions, RecievedTrackingOptions } from './types';
import { BrowserPlugin, BrowserTracker, dispatchToTrackersInCollection } from '@snowplow/browser-tracker-core';
import { buildSelfDescribingEvent, CommonEventProperties, SelfDescribingJson } from '@snowplow/tracker-core';
import { MediaPlayerEvent } from './contexts';
import { findMediaElem } from './findMediaElement';
import { buildMediaEvent } from './buildMediaEvent';
import { MediaProperty } from './mediaProperties';

declare global {
  interface HTMLVideoElement {
    autoPictureInPicture?: boolean;
    disablePictureInPicture: boolean;
  }
  interface HTMLMediaElement {
    disableRemotePlayback: boolean;
  }
  interface HTMLAudioElement {
    disableRemotePlayback: any;
  }
  interface Document {
    pictureInPictureElement: HTMLMediaElement;
  }
}

const _trackers: Record<string, BrowserTracker> = {};

export function MediaTrackingPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      _trackers[tracker.id] = tracker;
    },
  };
}

function trackingOptionsParser(mediaId: string, trackingOptions?: RecievedTrackingOptions): TrackingOptions {
  let defaults: TrackingOptions = {
    mediaId: mediaId,
    captureEvents: DefaultEvents,
  };
  if (trackingOptions?.captureEvents) {
    let namedEvents = [];
    for (let ev of trackingOptions.captureEvents) {
      // If an event is an EventGroup, get the events from that group
      if (EventGroups.hasOwnProperty(ev)) {
        for (let event of EventGroups[ev]) {
          if (namedEvents.indexOf(event) === -1) {
            // If Percent Progress is an event as part of a group
            if (event === SnowplowMediaEvent.PERCENTPROGRESS) {
              defaults.boundry = {
                percentBoundries: trackingOptions.percentBoundries || [10, 25, 50, 75],
                percentTimeoutIds: [],
              };
            }
            namedEvents.push(event);
          }
        }
      } else if (!Object.keys(MediaEvent).filter((k) => k === ev)) {
        console.error(`'${ev}' is not a valid captureEvent.`);
        // If Percent Progress is a standalone event
      } else if (ev === SnowplowMediaEvent.PERCENTPROGRESS) {
        defaults.boundry = {
          percentBoundries: trackingOptions.percentBoundries || [10, 25, 50, 75],
          percentTimeoutIds: [],
        };
      } else {
        namedEvents.push(Object.keys(MediaEvent).filter((k) => k === ev)[0] || ev);
      }
    }

    trackingOptions.captureEvents = namedEvents;
  }
  // Percent boundries are now included in the 'boundry' object, so it can be removed before spread
  delete trackingOptions?.percentBoundries;
  return { ...defaults, ...trackingOptions };
}

export function enableMediaTracking(args: { id: string; trackingOptions?: RecievedTrackingOptions }) {
  let conf: TrackingOptions = trackingOptionsParser(args.id, args.trackingOptions);
  const eventsWithOtherFunctions: Record<string, Function> = {
    [DocumentEvent.FULLSCREENCHANGE]: (el: HTMLMediaElement, conf: TrackingOptions) => {
      if (document.fullscreenElement?.id === args.id) {
        mediaPlayerEvent(el, DocumentEvent.FULLSCREENCHANGE, conf);
      }
    },
    [MediaEvent.SEEKED]: (el: HTMLMediaElement, conf: TrackingOptions) => {
      while (conf.boundry!.percentTimeoutIds.length) {
        clearTimeout(conf.boundry!.percentTimeoutIds.pop());
      }
      setPercentageBoundTimeouts(el, conf);
    },
  };

  const eventHandlers: Record<string, Function> = {};
  for (let ev of conf.captureEvents) {
    if (eventsWithOtherFunctions.hasOwnProperty(ev)) {
      eventHandlers[ev] = (el: HTMLMediaElement) => eventsWithOtherFunctions[ev](el);
    }
    eventHandlers[ev] = (el: HTMLMediaElement, e: MediaEventType) => mediaPlayerEvent(el, e, conf);
  }

  let el = findMediaElem(args.id);
  if (!el) {
    console.error(`Couldn't find a Media element with id ${args.id}`);
    return;
  }

  for (let c of conf.captureEvents) {
    switch (c) {
      case SnowplowMediaEvent.PERCENTPROGRESS:
        percentBoundryErrorHandling(conf.boundry!.percentBoundries);
        setPercentageBoundTimeouts(el, conf);
    }
  }

  addCaptureEventListeners(el, conf.captureEvents, eventHandlers);
}

function addCaptureEventListeners(el: HTMLMediaElement, captureEvents: any, eventHandlers: any): void {
  for (let e of captureEvents) {
    let ev: EventListener = () => eventHandlers[e](el, e);
    if (isTypeTextTrackEvent(e)) {
      el.textTracks.addEventListener(e, ev);
    } else if (isTypeDocumentEvent(e)) {
      document.addEventListener(e, ev);
      // Chrome and Safari both use the 'webkit' prefix for the 'fullscreenchange' event
      // IE uses 'MS'
      if (e === DocumentEvent.FULLSCREENCHANGE) {
        document.addEventListener('webkit' + e, ev);
        document.addEventListener('MS' + e, ev);
      }
    } else {
      el.addEventListener(e, ev);
    }
  }
}

function mediaPlayerEvent(el: HTMLMediaElement, e: MediaEventType, conf: TrackingOptions, eventDetail?: any): void {
  console.log(e);
  let event = buildMediaEvent(el, e, conf.mediaId, eventDetail, conf.mediaLabel);
  if (conf.captureEvents.indexOf(SnowplowMediaEvent.PERCENTPROGRESS) !== -1) {
    progressHandler(e, el, conf);
  }

  // Dragging the volume scrubber will generate a lot of events, this limits the rate at which
  // volume events can be sent at
  if (e === MediaEvent.VOLUMECHANGE) {
    clearTimeout(conf.volumeChangeTimeout);
    conf.volumeChangeTimeout = setTimeout(() => trackMediaEvent(event), 200);
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

function progressHandler(e: MediaEventType, el: HTMLMediaElement, conf: TrackingOptions) {
  if (e === MediaEvent.PAUSE) {
    while (conf.boundry!.percentTimeoutIds.length) {
      clearTimeout(conf.boundry!.percentTimeoutIds.pop());
    }
  }

  if (e === MediaEvent.PLAY && el[MediaProperty.READYSTATE] > 0) {
    setPercentageBoundTimeouts(el, conf);
  }
}

function setPercentageBoundTimeouts(el: HTMLMediaElement, conf: TrackingOptions) {
  console.log(conf);
  for (let p of conf.boundry!.percentBoundries) {
    let absoluteBoundryTimeMs = el[MediaProperty.DURATION] * (p / 100) * 1000;
    let currentTimeMs = el[MediaProperty.CURRENTTIME] * 1000;
    let timeUntilBoundryEvent = absoluteBoundryTimeMs - currentTimeMs;
    // If the boundry is less than the current time, we don't need to bother setting it
    if (0 < timeUntilBoundryEvent) {
      conf.boundry!.percentTimeoutIds.push(
        setTimeout(() => waitAnyRemainingTimeAfterTimeout(el, timeUntilBoundryEvent, p, conf), timeUntilBoundryEvent)
      );
    }
  }
}

// Setting the timeout callback above as MediaPlayerEvent will result in a discrepency between the setTimeout time and
// the current video time when the event fires of ~100 - 300ms

// The below function waits any required amount of remaining time, to ensure the event is fired as close as possible to the
// appropriate percentage boundry time.

function waitAnyRemainingTimeAfterTimeout(el: HTMLMediaElement, percentTime: number, p: number, conf: TrackingOptions) {
  if (el[MediaProperty.CURRENTTIME] * 1000 < percentTime) {
    setTimeout(() => waitAnyRemainingTimeAfterTimeout(el, percentTime, p, conf), 10);
  } else {
    console.log('Firing percent event', p);
    mediaPlayerEvent(el, SnowplowMediaEvent.PERCENTPROGRESS, conf, { percentThrough: p });
  }
}
