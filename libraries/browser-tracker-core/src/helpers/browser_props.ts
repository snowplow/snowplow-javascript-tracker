interface BrowserProperties {
  viewport?: string | null;
  documentSize?: string | null;
  resolution?: string | null;
  colorDepth: number;
  devicePixelRatio: number;
  cookiesEnabled: boolean;
  online: boolean;
  browserLanguage: string;
  documentLanguage: string;
  webdriver: boolean;
  deviceMemory?: number; // Optional because it's not supported in all browsers
  hardwareConcurrency?: number;
}

function useResizeObserver(): boolean {
  return 'ResizeObserver' in window;
}

let resizeObserverInitialized = false;
let readBrowserPropertiesTask: number | null = null;
function initializeResizeObserver() {
  if (resizeObserverInitialized) {
    return;
  }
  if (!document || !document.body || !document.documentElement) {
    return;
  }
  resizeObserverInitialized = true;

  const resizeObserver = new ResizeObserver(() => {
    if (!readBrowserPropertiesTask) {
      // The browser property lookup causes a forced synchronous layout when offsets/sizes are
      // queried. It's possible that the forced synchronous layout causes the ResizeObserver
      // to be fired again, leading to an infinite loop and the "ResizeObserver loop completed
      // with undelivered notifications" error.
      readBrowserPropertiesTask = requestAnimationFrame(() => {
        readBrowserPropertiesTask = null;
        cachedProperties = readBrowserProperties();
      });
    }
  });
  resizeObserver.observe(document.body);
  resizeObserver.observe(document.documentElement);
}

let cachedProperties: BrowserProperties;

/**
 * Gets various browser properties (that are expensive to read!)
 * - Will use a "ResizeObserver" approach in modern browsers to update cached properties only on change
 * - Will fallback to a direct read approach without cache in old browsers
 *
 * @returns BrowserProperties
 */
export function getBrowserProperties() {
  if (!useResizeObserver()) {
    return readBrowserProperties();
  }

  if (!cachedProperties) {
    cachedProperties = readBrowserProperties();
  }
  initializeResizeObserver();
  return cachedProperties;
}

/**
 * Reads the browser properties - expensive call!
 *
 * @returns BrowserProperties
 */
function readBrowserProperties(): BrowserProperties {
  return {
    viewport: detectViewport(),
    documentSize: detectDocumentSize(),
    resolution: detectScreenResolution(),
    colorDepth: screen.colorDepth,
    devicePixelRatio: window.devicePixelRatio,
    cookiesEnabled: window.navigator.cookieEnabled,
    online: window.navigator.onLine,
    browserLanguage: window.navigator.language || (window.navigator as any).userLanguage,
    documentLanguage: document.documentElement.lang,
    webdriver: window.navigator.webdriver,
    deviceMemory: (window.navigator as any).deviceMemory,
    hardwareConcurrency: Math.floor(window.navigator.hardwareConcurrency) || undefined,
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

  return makeDimension(Math.max(0, width), Math.max(0, height));
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

  return makeDimension(
    Math.max(de.clientWidth, de.offsetWidth, de.scrollWidth),
    Math.max(de.clientHeight, de.offsetHeight, de.scrollHeight, bodyHeight)
  );
}

function detectScreenResolution() {
  return makeDimension(screen.width, screen.height);
}

export function makeDimension(width: number, height: number): string | null {
  if (isNaN(width) || isNaN(height)) {
    return null;
  }

  return Math.floor(width) + 'x' + Math.floor(height);
}
