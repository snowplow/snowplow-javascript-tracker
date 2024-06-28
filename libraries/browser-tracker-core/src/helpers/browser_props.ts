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
function initializeResizeObserver() {
  if (resizeObserverInitialized) {
    return;
  }
  if(!document || !document.body || !document.documentElement) {
    return;
  }
  resizeObserverInitialized = true;

  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      if (entry.target === document.body || entry.target === document.documentElement) {
        cachedProperties = readBrowserProperties();
      }
    }
  });
  resizeObserver.observe(document.body);
  resizeObserver.observe(document.documentElement);
}

let cachedProperties: BrowserProperties;

/* Separator used for dimension values e.g. widthxheight */
const DIMENSION_SEPARATOR = 'x';

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
    viewport: floorDimensionFields(detectViewport()),
    documentSize: floorDimensionFields(detectDocumentSize()),
    resolution: floorDimensionFields(detectScreenResolution()),
    colorDepth: screen.colorDepth,
    devicePixelRatio: window.devicePixelRatio,
    cookiesEnabled: window.navigator.cookieEnabled,
    online: window.navigator.onLine,
    browserLanguage: window.navigator.language || (window.navigator as any).userLanguage,
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
    return width + DIMENSION_SEPARATOR + height;
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
  return isNaN(w) || isNaN(h) ? '' : w + DIMENSION_SEPARATOR + h;
}

function detectScreenResolution() {
  return screen.width + DIMENSION_SEPARATOR + screen.height;
}

export function floorDimensionFields(field?: string | null) {
  return (
    field &&
    field
      .split(DIMENSION_SEPARATOR)
      .map((dimension) => Math.floor(Number(dimension)))
      .join(DIMENSION_SEPARATOR)
  );
}
