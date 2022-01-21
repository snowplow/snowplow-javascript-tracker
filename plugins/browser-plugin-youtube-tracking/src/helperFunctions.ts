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
  return `${url}?${urlParamsToString(urlParams)}`;
}

export function parseUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const urlParams = url.split('?')[1];
  if (!urlParams) return params;
  urlParams.split('&').forEach((p) => {
    const param = p.split('=');
    params[param[0]] = param[1];
  });
  return params;
}

function urlParamsToString(urlParams: Record<string, string>) {
  // convert an object of url parameters to a string
  let params = '';
  Object.keys(urlParams).forEach((p) => {
    params += `${p}=${urlParams[p]}&`;
  });
  return params.slice(0, -1);
}
