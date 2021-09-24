import { Player } from './players';
import { HTMLMediaElement } from './types';
let findElementRetryAmount = 5;

export function findMediaElem(mediaId: string): HTMLMediaElement | null {
  const methodsToFindPlayerType: { [key in Player]?: Function } = {
    [Player.PLYR]: (el: HTMLElement) => getPlyrPlayer(el),
  };

  let el: HTMLVideoElement | HTMLAudioElement | Element | null = document.getElementById(mediaId);
  // The element may not be loaded in time for this function to run,
  // so we have a few goes at finding the element
  if (!el && findElementRetryAmount) {
    findElementRetryAmount -= 1;
    setTimeout(findMediaElem, 750);
  }

  if (el) {
    if ((el as HTMLVideoElement).videoWidth) {
      return el as HTMLVideoElement;
    }

    if ((el as HTMLAudioElement).duration) {
      return el as HTMLAudioElement;
    }

    let playerType: Player = getPlayerType(el);
    el = methodsToFindPlayerType.hasOwnProperty(playerType)
      ? methodsToFindPlayerType[playerType]!(el)
      : genericMediaElementSearch(el);
    return el as HTMLMediaElement;
  }

  return null;
}

let plyrRetryCount = 0;
const plyrRetryLimit = 5;

function getPlyrPlayer(el: Element): HTMLVideoElement | null {
  // Find the video elem within the Plyr instance
  let videoEl;
  if (el.tagName === 'VIDEO') {
    videoEl = el as HTMLVideoElement;
  } else {
    videoEl = el.getElementsByTagName('VIDEO')[0] as HTMLVideoElement;
  }
  // Plyr loads in an initial blank video with currentSrc as https://cdn.plyr.io/static/blank.mp4
  // so we need to check until currentSrc updates (there's probably a better way of doing this)
  if (
    (videoEl.currentSrc === 'https://cdn.plyr.io/static/blank.mp4' || videoEl.currentSrc === '') &&
    plyrRetryCount === plyrRetryLimit
  ) {
    return null;
  } else {
    plyrRetryCount += 1;
    setTimeout(() => getPlyrPlayer(el), 10 ** plyrRetryCount);
  }
  return videoEl;
}

function genericMediaElementSearch(el: Element): HTMLMediaElement | null {
  let mediaTags = ['AUDIO', 'VIDEO'];
  let searchEl: Element | HTMLMediaElement | null = el;
  console.log(searchEl);
  if (mediaTags.indexOf(el.tagName) === -1) {
    searchEl = el.getElementsByTagName('VIDEO')[0] as HTMLVideoElement;
    if (!searchEl) {
      searchEl = el.getElementsByTagName('AUDIO')[0] as HTMLAudioElement;
      if (!searchEl) {
        return null;
      }
    }
  }
  if (mediaTags.indexOf(searchEl.tagName) === 1) {
    return searchEl as HTMLMediaElement;
  }
  return null;
}

function getPlayerType(el: Element | HTMLIFrameElement): Player {
  let player_type = Player.HTML5;
  // The main class names VideoJS and Plyr give their elements
  let player_class_names: { [index: string]: Player } = { 'video-js': Player.VIDEOJS, plyr: Player.PLYR };
  for (let name of Object.keys(player_class_names)) {
    let elems = el.classList.contains(name);
    if (elems) {
      player_type = player_class_names[name];
    }
    let parentClass = el.parentElement?.classList.contains(name);
    if (parentClass) {
      player_type = player_class_names[name];
    }
  }
  return player_type;
}
