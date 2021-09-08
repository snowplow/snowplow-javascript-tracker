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
import { ready_state_consts, network_state_consts } from './consts';
import { ControlEvents } from './eventGroups';
import {
  timeRangesToObjectArray,
  textTrackListToJson,
  isTypeTextTrackEvent,
  checkPercentBoundryArrayIsValid,
  isTypeDocumentEvent,
  isElementFullScreen,
} from './helperFunctions';
import { SnowplowMediaEvent } from './snowplowEvents';
import { DocumentEvent, MediaEvent } from './wgEvents';
import { MediaProperty, VideoProperty } from './wgProperties';
import { MediaTrackingConfig, SnowplowData, MediaEventType, HTMLMediaElement } from './types';
import { BrowserPlugin, BrowserTracker, dispatchToTrackersInCollection } from '@snowplow/browser-tracker-core';
import { buildSelfDescribingEvent, CommonEventProperties, SelfDescribingJson } from '@snowplow/tracker-core';
import { MediaElement, VideoElement, MediaPlayerEvent } from './contexts';

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

export function trackMedia(mediaId: string, config: MediaTrackingConfig = {}): void {
  // --- Setup ---
  const listenEvents = config.listenEvents || ControlEvents;
  const percentBoundries = config.percentBoundries || [10, 25, 50, 75];
  const mediaLabel = config.mediaLabel || 'custom_media_label';
  const percentTimeoutIds: any[] = [];
  let findElementRetryAmount: number = 5;
  let prevVolumeChangeEvent: any;
  let prevEvent: any;

  checkPercentBoundryArrayIsValid(percentBoundries);

  const eventsWithOtherFunctions: Record<string, Function> = {
    [DocumentEvent.FULLSCREENCHANGE]: (el: HTMLMediaElement) => fullScreenEventHandler(el),
  };

  // Assigns each event in 'listenEvents' a callback
  const eventHandlers: Record<string, Function> = {};
  for (let ev of Object.values(listenEvents)) {
    if (eventsWithOtherFunctions.hasOwnProperty(ev)) {
      eventHandlers[ev] = (el: HTMLMediaElement) => eventsWithOtherFunctions[ev](el);
    }
    eventHandlers[ev] = (el: HTMLMediaElement, e: MediaEventType) => mediaPlayerEvent(el, e);
  }

  findMediaElem();

  function setPercentageBoundTimeouts(el: HTMLMediaElement) {
    for (let p of percentBoundries) {
      let percentTime = el[MediaProperty.DURATION] * 1000 * (p / 100);
      if (el[MediaProperty.CURRENTTIME] !== 0) {
        percentTime -= el[MediaProperty.CURRENTTIME] * 1000;
      }
      if (p < percentTime) {
        percentTimeoutIds.push(setTimeout(() => waitAnyRemainingTimeAfterTimeout(el, percentTime, p), percentTime));
      }
    }
  }

  // Setting the timeout callback above as MediaPlayerEvent will result in a discrepency between the setTimeout time and
  // the current video time when the event fires of ~100 - 300ms

  // The below function waits any required amount of remaining time, to ensure the event is fired as close as possible to the
  // appropriate percentage boundry time.

  function waitAnyRemainingTimeAfterTimeout(el: HTMLMediaElement, percentTime: number, p: number) {
    if (el[MediaProperty.CURRENTTIME] * 1000 < percentTime) {
      setTimeout(() => waitAnyRemainingTimeAfterTimeout(el, percentTime, p), 10);
    } else {
      mediaPlayerEvent(el, SnowplowMediaEvent.PERCENTPROGRESS, { percentThrough: p });
    }
  }

  function mediaPlayerEvent(el: HTMLMediaElement, e: MediaEventType, eventDetail?: any): void {
    // Media Event

    interface mediaEvent {
      schema: string;
      data: MediaPlayerEvent;
      context: MediaProperty[];
    }

    let mediaEvent: mediaEvent = {
      schema: 'iglu:com.snowplowanalytics/media_player_event/jsonschema/1-0-0',
      data: {
        type: e,
        player_id: mediaId,
        media_type: el.tagName as MediaPlayerEvent['media_type'],
        media_label: mediaLabel,
      },
      context: [],
    };

    // Snowplow Events

    if (listenEvents.includes(SnowplowMediaEvent.PERCENTPROGRESS)) {
      if (e === MediaEvent.PAUSE) {
        while (percentTimeoutIds.length) {
          clearTimeout(percentTimeoutIds.pop());
        }
      }

      if (e === MediaEvent.PLAY && el[MediaProperty.READYSTATE] > 0) {
        setPercentageBoundTimeouts(el);
        el.defaultPlaybackRate = 0;
      }
    }

    // Snowplow Properties

    const snowplowData: SnowplowData = {
      file_extension: el[MediaProperty.CURRENTSRC].split('.').pop() || 'unknown',
      fullscreen: isElementFullScreen(mediaId),
      picture_in_picture: document.pictureInPictureElement?.id === mediaId,
    };

    if (e === SnowplowMediaEvent.PERCENTPROGRESS) {
      snowplowData.percent = eventDetail.percentThrough!;
    }

    mediaEvent.context.push({
      schema: 'iglu:com.snowplowanalytics/media_player/jsonschema/1-0-0',
      data: {
        ...snowplowData,
      },
    });

    // HTMLMediaElement Properties

    interface MediaProperty {
      schema: string;
      data: MediaElement | VideoElement | SnowplowData;
    }

    mediaEvent.context.push({
      schema: 'iglu:org.whatwg/media_element/jsonschema/1-0-0',
      data: {
        auto_play: el[MediaProperty.AUTOPLAY],
        buffered: timeRangesToObjectArray(el[MediaProperty.BUFFERED]),
        controls: el[MediaProperty.CONTROLS],
        cross_origin: el[MediaProperty.CROSSORIGIN],
        current_source: el[MediaProperty.CURRENTSRC],
        current_time: el[MediaProperty.CURRENTTIME],
        default_muted: el[MediaProperty.DEFAULTMUTED],
        default_playback_rate: el[MediaProperty.DEFAULTPLAYBACKRATE],
        disable_remote_playback: el[MediaProperty.DISABLEREMOTEPLAYBACK],
        duration: el[MediaProperty.DURATION],
        ended: el[MediaProperty.ENDED],
        error: el[MediaProperty.ERROR],
        loop: el[MediaProperty.LOOP],
        muted: el[MediaProperty.MUTED],
        network_state: network_state_consts[el[MediaProperty.NETWORKSTATE]] as MediaElement['network_state'],
        paused: el[MediaProperty.PAUSED],
        playback_rate: el[MediaProperty.PLAYBACKRATE],
        preload: el[MediaProperty.PRELOAD],
        ready_state: ready_state_consts[el[MediaProperty.READYSTATE]] as MediaElement['ready_state'],
        seekable: timeRangesToObjectArray(el[MediaProperty.SEEKABLE]),
        seeking: el[MediaProperty.SEEKING],
        src: el[MediaProperty.SRC],
        src_object: el[MediaProperty.SRCOBJECT],
        text_tracks: textTrackListToJson(el[MediaProperty.TEXTTRACKS]),
        volume: el[MediaProperty.VOLUME],
      },
    });

    // HTMLVideoElement properties

    if (el instanceof HTMLVideoElement) {
      mediaEvent.context.push({
        schema: 'iglu:org.whatwg/video_element/jsonschema/1-0-0',
        data: {
          auto_picture_in_picture: el[VideoProperty.AUTOPICTUREINPICTURE],
          disable_picture_in_picture: el[VideoProperty.DISABLEPICTUREINPICTURE],
          poster: el[VideoProperty.POSTER],
          video_height: el[VideoProperty.VIDEOHEIGHT],
          video_width: el[VideoProperty.VIDEOWIDTH],
        },
      });
    }

    // Dragging the volume scrubber will generate a lot of events, when we are really only interested in the final position
    // This keeps the most recent volume change event, which is then sent on mouseup
    prevEvent = e;
    if (e === MediaEvent.VOLUMECHANGE) {
      prevVolumeChangeEvent = mediaEvent;
    } else {
      trackMediaEvent(mediaEvent);
    }
  }

  function getPlayerType(el: HTMLMediaElement): string {
    let player_type = '';
    // The main class names VideoJS and Plyr give their elements
    let player_class_names = ['video-js', 'plyr'];
    for (let name of player_class_names) {
      let elems = el.getElementsByClassName(name);
      if (elems.length) {
        player_type = name;
      }
    }
    return player_type;
  }

  function getPlyrPlayer(el: HTMLMediaElement, retryCount: number, retryLimit: number): void {
    // Find the video elem within the Plyr instance
    let videoEl = el.getElementsByTagName('VIDEO')[0] as HTMLVideoElement;
    // Plyr loads in an initial blank video with currentSrc as https://cdn.plyr.io/static/blank.mp4
    // so we need to check until currentSrc updates (there's probably a better way of doing this)
    if (videoEl.currentSrc === 'https://cdn.plyr.io/static/blank.mp4' || videoEl.currentSrc === '') {
      if (retryCount === retryLimit) {
        console.error("Plyr hasn't loaded your video yet.");
        return;
      }
      setTimeout(() => getPlyrPlayer(el, retryCount + 1, retryLimit), 10 ** retryCount);
    } else {
      addEventListeners(videoEl);
    }
  }

  function findMediaElem(): void {
    let mediaTags = ['AUDIO', 'VIDEO'];
    let el: HTMLMediaElement = document.getElementById(mediaId) as HTMLMediaElement;
    // The element may not be loaded in time for this function to run,
    // so we have a few goes at finding the element
    if (!el && findElementRetryAmount) {
      findElementRetryAmount -= 1;
      setTimeout(findMediaElem, 750);
      return;
    }
    let playerType = getPlayerType(el);
    if (!el) {
      console.error(`Couldn't find passed element id: ${mediaId}.\nEnsure you have entered the correct element id.`);
      return;
    } else {
      if (playerType === 'plyr') {
        getPlyrPlayer(el, 1, 5);
        return;
      }
      let searchEl: HTMLMediaElement = el;
      if (!mediaTags.includes(el.tagName)) {
        searchEl = el.getElementsByTagName('VIDEO')[0] as HTMLVideoElement;
        if (!searchEl) {
          searchEl = el.getElementsByTagName('AUDIO')[0] as HTMLAudioElement;
          if (!searchEl) {
            console.error(`Couldn't find a Media element with the passed HTML id: ${mediaId}`);
            return;
          }
        }
      }
      if (searchEl) addEventListeners(searchEl);
    }
  }

  function handleMouseUp() {
    if (prevEvent === 'mouseup') {
      trackMediaEvent(prevVolumeChangeEvent);
      prevEvent = prevVolumeChangeEvent = '';
    }
  }

  function addEventListeners(el: HTMLMediaElement): void {
    document.addEventListener('mouseup', handleMouseUp);
    for (let e of listenEvents) {
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

  function fullScreenEventHandler(el: HTMLMediaElement) {
    if (document.fullscreenElement?.id === mediaId) {
      mediaPlayerEvent(el, DocumentEvent.FULLSCREENCHANGE);
    }
  }
}

export function trackMediaEvent(
  event: SelfDescribingJson<MediaPlayerEvent> & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
): void {
  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildSelfDescribingEvent({ event }), event.context, event.timestamp);
  });
}
