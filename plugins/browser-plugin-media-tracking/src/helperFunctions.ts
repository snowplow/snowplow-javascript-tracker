import { DocumentEvent, TextTrackEvent } from './mediaEvents';
import { TextTrackObject } from './types';

export function timeRangesToObjectArray(t: TimeRanges): { start: number; end: number }[] {
  let out = [];
  for (let i = 0; i < t.length; i++) {
    out.push({ start: t.start(i), end: t.end(i) });
  }
  return out;
}

export function textTrackListToJson(textTrackList: TextTrackList): TextTrackObject[] {
  let out: TextTrackObject[] = [];
  for (let o of Object.keys(textTrackList)) {
    let i = parseInt(o);
    out.push({
      label: textTrackList[i].label,
      language: textTrackList[i].language,
      kind: textTrackList[i].kind,
      mode: textTrackList[i].mode,
    });
  }
  return out;
}

export function isTypeTextTrackEvent(e: string): boolean {
  let fields: string[] = Object.keys(TextTrackEvent);
  return fields.indexOf(e) !== -1;
}

export function isTypeDocumentEvent(e: string): boolean {
  let fields: string[] = Object.keys(DocumentEvent);
  return fields.indexOf(e) !== -1;
}

export function isArrayOutOfBounds(arr: number[]): boolean {
  return arr.filter((a) => a < 0 || 100 < a).length !== 0;
}

export function duplicatesInArray(arr: number[]): boolean {
  return arr.filter((el, i) => arr.indexOf(el) !== i).length !== 0;
}

export function isElementFullScreen(mediaId: string): boolean {
  if (document.fullscreenElement) {
    return document.fullscreenElement.id === mediaId;
  }
  return false;
}

// IE doesn't support Object().values, so enumKeys and enumValues are needed for TS
// to be happy about getting enum values

export function enumKeys<T extends Object>(enumObj: T): string[] {
  return Object.keys(enumObj).filter((k) => {
    let n = Number(k);
    return !(typeof n === 'number' && isFinite(Number(k)) && Math.floor(n) === n);
  });
}

export function enumValues<T>(enumObj: T): T[keyof T][] {
  return enumKeys(enumObj).map((k) => enumObj[k as keyof T]);
}

export function percentBoundryErrorHandling(percentBoundries: number[]) {
  if (isArrayOutOfBounds(percentBoundries)) {
    let outsideBoundry = percentBoundries.filter((p: number) => p < 0 || 100 < p);
    console.error(
      `Percent bounds must be 1 - 100 inclusive. The following values have been removed: [${outsideBoundry}]`
    );
    for (let p of outsideBoundry) {
      percentBoundries.splice(percentBoundries.indexOf(p), 1);
    }
  }

  if (duplicatesInArray(percentBoundries)) {
    let duplicates = percentBoundries.filter((el: number, i: number) => percentBoundries!.indexOf(el) !== i);
    console.error(
      `You have duplicate values in the percent boundry array: [${percentBoundries}]\nThe following values have been removed: [${duplicates}]`
    );
    for (let d of duplicates) {
      percentBoundries.splice(percentBoundries.indexOf(d), 1);
    }
  }
}
