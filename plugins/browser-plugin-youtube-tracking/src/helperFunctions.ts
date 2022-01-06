import { AllEvents, DefaultEvents, EventGroups } from './eventGroups';
import { SnowplowEvent } from './snowplowEvents';
import { EventGroup, MediaTrackingOptions, TrackingOptions } from './types';
import { CaptureEventToYouTubeEvent, YTPlayerEvent } from './constants';

export function isElementFullScreen(mediaId: string): boolean {
  if (document.fullscreenElement) {
    return document.fullscreenElement.id === mediaId;
  }
  return false;
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

  if (conf.updateRate) defaults.updateRate = conf.updateRate;

  if (conf.captureEvents) {
    let parsedEvents: EventGroup = [];
    for (let ev of conf.captureEvents) {
      // If an event is an EventGroup, get the events from that group
      if (EventGroups.hasOwnProperty(ev)) {
        parsedEvents = parsedEvents.concat(EventGroups[ev]);
      } else if (!Object.keys(AllEvents).filter((k) => k === ev)) {
        console.warn(`'${ev}' is not a valid event.`);
      } else {
        parsedEvents.push(ev);
      }
    }

    conf.captureEvents = parsedEvents;

    for (let ev of conf.captureEvents) {
      const youtubeEvent = CaptureEventToYouTubeEvent[ev];
      if (CaptureEventToYouTubeEvent.hasOwnProperty(ev) && defaults.youtubeEvents.indexOf(youtubeEvent) === -1) {
        defaults.youtubeEvents.push(youtubeEvent);
      }
    }

    if (conf.captureEvents.indexOf(SnowplowEvent.PERCENTPROGRESS) !== -1) {
      defaults.progress = {
        boundaries: conf?.boundaries || defaults.progress!.boundaries,
        boundaryTimeoutIds: [],
      };
    }
  }

  return { ...defaults, ...conf };
}

// URLSearchParams is not supported in IE
// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams

export function addUrlParam(url: string, key: string, value: string) {
  const urlParams = parseUrlParams(url);
  urlParams[key] = value;
  return `${url}?${urlParamsToString(urlParams)}`;
}

export function parseUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const urlParams = url.split('?')[1];
  if (!urlParams) return params;
  urlParams.split('&').forEach((p) => {
    const param = p.split('=');
    params[param[0]] = param[1];
  });
  return params;
}

function urlParamsToString(urlParams: Record<string, string>) {
  // convert an object of url parameters to a string
  let params = '';
  Object.keys(urlParams).forEach((p) => {
    params += `${p}=${urlParams[p]}&`;
  });
  return params.slice(0, -1);
}
