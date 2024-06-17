import { eventNames } from './constants';
import { AllEvents, DefaultEvents, EventGroups } from './eventGroups';
import { MediaEvent, SnowplowEvent } from './mediaEvents';
import { EventGroup, MediaTrackingOptions, TextTrack, TrackingOptions } from './types';

export function timeRangesToObjectArray(t: TimeRanges): { start: number; end: number }[] {
  const out = [];
  for (let i = 0; i < t.length; i++) {
    out.push({ start: t.start(i), end: t.end(i) });
  }
  return out;
}

export function textTrackListToJson(textTrackList: TextTrackList): TextTrack[] {
  return Object.keys(textTrackList).map((_, i) => {
    return {
      label: textTrackList[i].label,
      language: textTrackList[i].language,
      kind: textTrackList[i].kind,
      mode: textTrackList[i].mode,
    };
  });
}

export function isType(e: string, _type: Record<string, string>): boolean {
  return (
    Object.keys(_type)
      .map((k: string) => _type[k])
      .indexOf(e) !== -1
  );
}

export function isElementFullScreen(id: string): boolean {
  return document.fullscreenElement?.id === id || false;
}

export function boundaryErrorHandling(boundaries: number[]): number[] {
  // Remove any elements that are out of bounds
  if (boundaries.some((b) => b < 1 || 100 < b)) {
    boundaries = boundaries.filter((b) => 0 < b && b < 100);
  }
  // Remove any duplicate elements
  if (boundaries.some((b, _, self) => self.filter((f) => f == b).length > 1)) {
    boundaries = boundaries.filter((item, pos, self) => self.indexOf(item) == pos);
  }
  return boundaries;
}

export function getUriFileExtension(uri: string): string | null {
  // greedily match until the final '.' is found with trailing characters, capture those as extension
  // only capture until finding URI metacharacters
  const pattern = /.+\.([^\.?&#]+)/;

  let uriPath = uri;
  try {
    uriPath = new URL(uri).pathname;
  } catch (e) {}

  // try to match against the pathname only first, if unsuccessful try against the full URI
  const match = pattern.exec(uriPath) || pattern.exec(uri);
  return match && match[1];
}

export function trackingOptionsParser(id: string, trackingOptions?: MediaTrackingOptions): TrackingOptions {
  const defaults: TrackingOptions = {
    id: id,
    captureEvents: DefaultEvents,
    progress: {
      boundaries: [10, 25, 50, 75],
      boundaryTimeoutIds: [],
    },
    volume: {
      trackingInterval: 250,
    },
  };

  if (!trackingOptions) return defaults;

  if (trackingOptions?.captureEvents) {
    let parsedEvents: string[] | EventGroup = [];
    trackingOptions.captureEvents.forEach((ev) => {
      // If an event is an EventGroup, get the events from that group
      if (EventGroups.hasOwnProperty(ev)) {
        parsedEvents = parsedEvents.concat(EventGroups[ev]);
      } else if (!Object.keys(AllEvents).filter((k) => k === ev)) {
        console.warn(`'${ev}' is not a valid event.`);
      } else {
        parsedEvents.push(ev in eventNames ? eventNames[ev] : ev);
      }
    });

    trackingOptions.captureEvents = parsedEvents;
    if (trackingOptions.captureEvents.indexOf(SnowplowEvent.PERCENTPROGRESS) !== -1) {
      defaults.progress = {
        boundaries: trackingOptions?.boundaries || defaults.progress!.boundaries,
        boundaryTimeoutIds: [],
      };
    }

    if (trackingOptions.captureEvents.indexOf(MediaEvent.VOLUMECHANGE) !== -1) {
      defaults.volume = {
        trackingInterval: trackingOptions?.volumeChangeTrackingInterval || defaults.volume!.trackingInterval,
      };
    }
  }
  return { ...defaults, ...trackingOptions };
}

// Checks if a url is a data_url, so we don't send a (potentially large) payload
export function dataUrlHandler(url: string): string {
  if (url.indexOf('data:') !== -1) {
    return 'DATA_URL';
  }
  return url;
}

export function getDuration(el: HTMLAudioElement | HTMLVideoElement): number | null {
  const duration = el.duration;
  // A NaN value is returned if duration is not available, or Infinity if the media resource is streaming.
  if (isNaN(duration) || duration === Infinity) {
    return null;
  }

  return duration;
}
