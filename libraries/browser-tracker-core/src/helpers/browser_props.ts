let cachedProperties: any = null;

/* Separator used for dimension values e.g. widthxheight */
const DIMENSION_SEPARATOR = 'x';

export function getBrowserProperties() {
  if (!cachedProperties) {
    updateBrowserProperties();
  }
  return cachedProperties;
}

function updateBrowserProperties() {
  cachedProperties = {
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

// Initialize the ResizeObserver
const resizeObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
    // Check if the observed entry is for document's body or root element
    if (entry.target === document.body || entry.target === document.documentElement) {
      updateBrowserProperties(); // Update the cache if there's a change
    }
  }
});

// Start observing the document's body and root element for size changes
resizeObserver.observe(document.body);
resizeObserver.observe(document.documentElement);

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
