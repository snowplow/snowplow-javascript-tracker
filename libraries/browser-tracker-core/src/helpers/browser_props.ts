export function getBrowserProperties() {
  return {
    viewport: detectViewport(),
    documentSize: detectDocumentSize(),
    resolution: screen.width + 'x' + screen.height,
    colorDepth: screen.colorDepth,
    devicePixelRatio: window.devicePixelRatio,
    cookiesEnabled: window.navigator.cookieEnabled,
    online: window.navigator.onLine,
    browserLanguage: navigator.language || (navigator as any).userLanguage,
    documentLanguage: document.documentElement.lang,
    webdriver: window.navigator.webdriver,
    deviceMemory: (window.navigator as any).deviceMemory,
    hardwareConcurrency: (window.navigator as any).hardwareConcurrency,
  };
}

/**
 * Gets the current viewport.
 *
 * Code based on:
 * - http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
 * - http://responsejs.com/labs/dimensions/
 */
function detectViewport() {
  var width, height;

  if ('innerWidth' in window) {
    width = window['innerWidth'];
    height = window['innerHeight'];
  } else {
    const e = document.documentElement || document.body;
    width = e['clientWidth'];
    height = e['clientHeight'];
  }

  if (width >= 0 && height >= 0) {
    return width + 'x' + height;
  } else {
    return null;
  }
}

/**
 * Gets the dimensions of the current
 * document.
 *
 * Code based on:
 * - http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
 */
function detectDocumentSize() {
  var de = document.documentElement, // Alias
    be = document.body,
    // document.body may not have rendered, so check whether be.offsetHeight is null
    bodyHeight = be ? Math.max(be.offsetHeight, be.scrollHeight) : 0;
  var w = Math.max(de.clientWidth, de.offsetWidth, de.scrollWidth);
  var h = Math.max(de.clientHeight, de.offsetHeight, de.scrollHeight, bodyHeight);
  return isNaN(w) || isNaN(h) ? '' : w + 'x' + h;
}
