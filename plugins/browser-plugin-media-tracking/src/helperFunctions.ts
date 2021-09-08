import { DocumentEvent, TextTrackEvent } from './wgEvents';

export function timeRangesToObjectArray(t: TimeRanges): { start: number; end: number }[] {
  let out = [];
  for (let i = 0; i < t.length; i++) {
    out.push({ start: t.start(i), end: t.end(i) });
  }
  return out;
}

interface TextTrackObject {
  label: string;
  language: string;
  kind: string;
  mode: string;
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
  let fields: string[] = Object.values(TextTrackEvent);
  return fields.includes(e);
}

export function isTypeDocumentEvent(e: string): boolean {
  let fields: string[] = Object.values(DocumentEvent);
  return fields.includes(e);
}

function getDuplicatesInArray(arr: number[]) {
  return arr.filter((el, i) => arr.indexOf(el) !== i);
}

export function checkPercentBoundryArrayIsValid(percentBoundries: number[]): void {
  let errorValues: number[] = [];
  percentBoundries.forEach((p) => {
    if (p < 0 || 100 < p) {
      errorValues.push(p);
    }
  });
  if (errorValues.length) {
    throw new Error(`Percent bounds must be 1 - 100 inclusive. Adjust or remove the following: [${errorValues}]`);
  }
  let duplicates = getDuplicatesInArray(percentBoundries);
  if (duplicates.length) {
    throw new Error(
      `You have duplicate values in the percent boundry array. Remove the following duplicate value${
        duplicates.length - 1 ? 's' : ''
      }: [${duplicates}]`
    );
  }
}

export function isElementFullScreen(mediaId: string): boolean {
  if (document.fullscreenElement) {
    return document.fullscreenElement.id === mediaId;
  }
  return false;
}
