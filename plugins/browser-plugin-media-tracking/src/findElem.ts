import { LOG } from '@snowplow/tracker-core';
import { ElementConfig, StringConfig } from './config';
import { SEARCH_ERROR } from './constants';
import { SearchResult } from './types';
import { isHtmlAudioElement, isHtmlMediaElement, isHtmlVideoElement } from './helperFunctions';

/**
 * Waits for an HTML media element and invokes a callback with the element once found.
 *
 * - First, it tries to find the media element by id
 *   - If found and valid (`isHtmlMediaElement()`), the callback is called with the updated config.
 *   - If not found, a warning is logged and a `MutationObserver` is set up.
 *
 * - The `MutationObserver` watches for new elements added to the DOM. When the target media element is detected,
 *   the callback is invoked, and the observer disconnects.
 *
 * Useful for cases where the media element might not be in the DOM immediately.
 */
export function waitForElement(config: StringConfig, callback: (element: ElementConfig) => void) {
  const { el, err } = findMediaElement(config.video);
  if (err) {
    LOG.info(`${err}. Waiting for element to be added to the DOM.`);
  }

  if (isHtmlMediaElement(el)) {
    callback({ ...config, video: el });
  } else {
    let observer = new MutationObserver((mutations) => {
      mutations.forEach((mut) => {
        if (!mut.addedNodes) {
          return;
        }
        for (let node of Object.values(mut.addedNodes)) {
          if (isHtmlMediaElement(node) && node.id === config.video) {
            callback({ ...config, video: node });
            observer.disconnect();
          }
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

export function findMediaElement(id: string): SearchResult {
  let el: HTMLElement | null = null;

  try {
    el = document.getElementById(id) ?? document.querySelector(id);
  } catch (e) {}

  if (!el) {
    return { err: SEARCH_ERROR.NOT_FOUND };
  }
  if (isHtmlAudioElement(el)) return { el };

  if (isHtmlVideoElement(el)) {
    // Plyr loads in an initial blank video with currentSrc as https://cdn.plyr.io/static/blank.mp4
    // so we need to check until currentSrc updates.
    if (el.currentSrc === 'https://cdn.plyr.io/static/blank.mp4' && el.readyState === 0) {
      return { err: SEARCH_ERROR.PLYR_CURRENTSRC };
    }
    return { el };
  }

  return findMediaElementChild(el);
}

function findMediaElementChild(el: Element): SearchResult {
  for (let tag of ['VIDEO', 'AUDIO']) {
    let descendentTags = el.getElementsByTagName(tag);
    if (descendentTags.length === 1) {
      const el = descendentTags[0];
      if (isHtmlAudioElement(el) || isHtmlVideoElement(el)) {
        return { el };
      }
    } else if (descendentTags.length === 2 && tag === 'VIDEO' && isHtmlVideoElement(descendentTags[0])) {
      // Special JWPlayer case where two video elements are used for cover-video effect.
      // In that case, we select the first video element.
      return { el: descendentTags[0] };
    } else if (descendentTags.length > 1) {
      return { err: SEARCH_ERROR.MULTIPLE_ELEMENTS };
    }
  }
  return { err: SEARCH_ERROR.NOT_FOUND };
}
