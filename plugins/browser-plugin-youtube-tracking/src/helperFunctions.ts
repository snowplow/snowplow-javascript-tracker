export function isElementFullScreen(mediaId: string): boolean {
  if (document.fullscreenElement) {
    return document.fullscreenElement.id === mediaId;
  }
  return false;
}

// URLSearchParams is not supported in IE
// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams

export function addUrlParam(url: string, key: string, value: string) {
  const urlParams = parseUrlParams(url);
  urlParams[key] = value;

  return `${url.split('?').shift()!}?${urlParamsToString(urlParams)}`;
}

export function parseUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const urlParams = url.split('?').slice(1).join('?');
  if (!urlParams) return params;
  urlParams.split('&').forEach((p) => {
    const param = p.split('=');
    const key = decodeURIComponent(param.shift()!);
    params[key] = decodeURIComponent(param.join('='));
  });
  return params;
}

function urlParamsToString(urlParams: Record<string, string>) {
  // convert an object of url parameters to a string
  return Object.keys(urlParams)
    .map((p) => `${encodeURIComponent(p)}=${encodeURIComponent(urlParams[p])}`)
    .join('&');
}
