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
import { DefaultEvents } from './eventGroups';
import { isTypeTextTrackEvent, isTypeDocumentEvent, percentBoundryErrorHandling } from './helperFunctions';
import { SnowplowMediaEvent } from './snowplowEvents';
import { DocumentEvent, MediaEvent } from './mediaEvents';
import { MediaEventType, HTMLMediaElement, MediaConf } from './types';
import { BrowserPlugin, BrowserTracker, dispatchToTrackersInCollection } from '@snowplow/browser-tracker-core';
import { buildSelfDescribingEvent, CommonEventProperties, SelfDescribingJson } from '@snowplow/tracker-core';
import { MediaPlayerEvent } from './contexts';
import { findMediaElem } from './findMediaElement';
import { buildMediaEvent } from './buildMediaEvent';
import { progressHandler, setPercentageBoundTimeouts } from './snowplowPercentProgress';

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

function configSorter(mediaId: string, options?: MediaConf) {
  let defaults = {
    mediaId: mediaId,
    captureEvents: DefaultEvents,
    percentBoundries: [10, 25, 50, 75],
    percentTimeoutIds: [],
  };
  if (options === undefined) {
    return defaults;
  } else {
    return { ...defaults, ...options };
  }
}

export function enableMediaTracking(mediaId: string, options?: MediaConf) {
  let conf = configSorter(mediaId, options);

  const eventsWithOtherFunctions: Record<string, Function> = {
    [DocumentEvent.FULLSCREENCHANGE]: (el: HTMLMediaElement, conf: MediaConf) => {
      if (document.fullscreenElement?.id === conf.mediaId) {
        mediaPlayerEvent(el, DocumentEvent.FULLSCREENCHANGE, conf);
      }
    },
  };

  const eventHandlers: Record<string, Function> = {};
  for (let ev of conf.captureEvents) {
    if (eventsWithOtherFunctions.hasOwnProperty(ev)) {
      eventHandlers[ev] = (el: HTMLMediaElement) => eventsWithOtherFunctions[ev](el);
    }
    eventHandlers[ev] = (el: HTMLMediaElement, e: MediaEventType) => mediaPlayerEvent(el, e, conf);
  }

  let el = findMediaElem(mediaId);
  if (!el) {
    console.error(`Couldn't find a Media element with id ${mediaId}`);
    return;
  }

  for (let c of conf.captureEvents) {
    switch (c) {
      case SnowplowMediaEvent.PERCENTPROGRESS:
        percentBoundryErrorHandling(conf.percentBoundries);
        setPercentageBoundTimeouts(el, conf);
    }
  }

  addCaptureEventListeners(el, captureEvents, eventHandlers);
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

export function mediaPlayerEvent(el: HTMLMediaElement, e: MediaEventType, conf: MediaConf, eventDetail?: any): void {
  let event = buildMediaEvent(el, e, conf.mediaId, eventDetail, conf.mediaLabel);
  if (conf.captureEvents.indexOf(SnowplowMediaEvent.PERCENTPROGRESS) === -1) {
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
