import { Config } from './config';

export function isFullScreen(el: HTMLMediaElement): boolean {
  return document.fullscreenElement === el || false;
}

export function isHtmlMediaElement(element?: Node): element is HTMLMediaElement {
  return element instanceof HTMLMediaElement;
}

export function isHtmlAudioElement(element?: Node): element is HTMLAudioElement {
  return element instanceof HTMLAudioElement;
}

export function isHtmlVideoElement(element?: Node): element is HTMLVideoElement {
  return element instanceof HTMLVideoElement;
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

export function getDuration(el: HTMLAudioElement | HTMLVideoElement): number | null {
  const duration = el.duration;
  // A NaN value is returned if duration is not available, or Infinity if the media resource is streaming.
  if (isNaN(duration) || duration === Infinity) {
    return null;
  }

  return duration;
}

// Checks if a url is a data_url, so we don't send a (potentially large) payload
export function dataUrlHandler(url: string): string {
  if (url.indexOf('data:') !== -1) {
    return 'DATA_URL';
  }
  return url;
}

type TimeRange = { start: number; end: number };
export function timeRangesToObjectArray(t: TimeRanges): TimeRange[] {
  const out: TimeRange[] = [];
  for (let i = 0; i < t.length; i++) {
    const start = t.start(i);
    const end = t.end(i);
    if (isFinite(start) && isFinite(end)) {
      out.push({ start: start || 0, end: end || 0 });
    }
  }
  return out;
}

type TextTrack = {
  label: string;
  language: string;
  kind: string;
  mode: string;
};
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

export function setConfigDefaults(config: Config): Config {
  const defaults = {
    boundaries: [10, 25, 50, 75],
  };

  return { ...defaults, ...config };
}

export function parseVolume(volume: number): number {
  return parseInt((volume * 100).toString());
}
