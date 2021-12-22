import { SEARCH_ERROR, TAG } from './constants';
import { SearchResult } from './types';

export function findMediaElem(id: string): SearchResult {
  let el: HTMLVideoElement | HTMLAudioElement | HTMLElement | null = document.getElementById(id);

  if (!el) return { err: SEARCH_ERROR.NOT_FOUND };
  if (isAudioElement(el)) return { el: el };

  if (isVideoElement(el)) {
    // Plyr loads in an initial blank video with currentSrc as https://cdn.plyr.io/static/blank.mp4
    // so we need to check until currentSrc updates
    if (el.currentSrc === 'https://cdn.plyr.io/static/blank.mp4' && el.readyState === 0) {
      return { err: SEARCH_ERROR.PLYR_CURRENTSRC };
    }
    return { el: el };
  }

  return findMediaElementChild(el);
}

function findMediaElementChild(el: Element): SearchResult {
  for (let tag of Object.keys(TAG)) {
    let elem = el.getElementsByTagName(tag);
    if (elem.length === 1) {
      if (isAudioElement(elem[0])) return { el: elem[0] };
      if (isVideoElement(elem[0])) return { el: elem[0] };
    } else if (elem.length > 1) {
      return { err: SEARCH_ERROR.MULTIPLE_ELEMENTS };
    }
  }
  return { err: SEARCH_ERROR.NOT_FOUND };
}

function isAudioElement(el: Element): el is HTMLAudioElement {
  return el.tagName === TAG.AUDIO;
}

function isVideoElement(el: Element): el is HTMLVideoElement {
  return el.tagName === TAG.VIDEO;
}
