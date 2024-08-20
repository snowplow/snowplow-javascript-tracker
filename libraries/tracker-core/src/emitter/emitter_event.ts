import { Payload } from "../payload";

/**
 * Wraps a payload and provides methods to get the payload ready for a GET or POST request
 */
export interface EmitterEvent {
  /**
   * Get the original payload
   */
  getPayload: () => Payload;
  /**
   * Prepare the payload for a POST request
   */
  getPOSTRequestBody: () => Record<string, unknown>;
  /**
   * Calculate the byte size of the payload when POSTed
   */
  getPOSTRequestBytesCount: () => number;
  /**
   * Get the URL for a GET request
   */
  getGETRequestURL: (collectorUrl: string, useStm: boolean) => string;
  /**
   * Calculate the byte size of the payload when sent via GET
   */
  getGETRequestBytesCount: () => number;
}

/**
 * Count the number of bytes a string will occupy when UTF-8 encoded
 * Taken from http://stackoverflow.com/questions/2848462/count-bytes-in-textarea-using-javascript/
 *
 * @param s - The string
 * @returns number Length of s in bytes when UTF-8 encoded
 */
function getUTF8Length(s: string) {
  let len = 0;
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code <= 0x7f) {
      len += 1;
    } else if (code <= 0x7ff) {
      len += 2;
    } else if (code >= 0xd800 && code <= 0xdfff) {
      // Surrogate pair: These take 4 bytes in UTF-8 and 2 chars in UCS-2
      // (Assume next char is the other [valid] half and just skip it)
      len += 4;
      i++;
    } else if (code < 0xffff) {
      len += 3;
    } else {
      len += 4;
    }
  }
  return len;
}

/*
  * Convert a dictionary to a querystring
  * The context field is the last in the querystring
  */
function getQuerystring(request: Payload) {
  let querystring = '?',
    lowPriorityKeys = { co: true, cx: true },
    firstPair = true;

  for (const key in request) {
    if (request.hasOwnProperty(key) && !lowPriorityKeys.hasOwnProperty(key)) {
      if (!firstPair) {
        querystring += '&';
      } else {
        firstPair = false;
      }
      querystring += encodeURIComponent(key) + '=' + encodeURIComponent(request[key] as string | number | boolean);
    }
  }

  for (const contextKey in lowPriorityKeys) {
    if (request.hasOwnProperty(contextKey) && lowPriorityKeys.hasOwnProperty(contextKey)) {
      querystring += '&' + contextKey + '=' + encodeURIComponent(request[contextKey] as string | number | boolean);
    }
  }

  return querystring;
}

/*
  * Convert numeric fields to strings to match payload_data schema
  */
function preparePostBody(request: Payload): Record<string, unknown> {
  const cleanedRequest = Object.keys(request)
    .map<[string, unknown]>((k) => [k, request[k]])
    .reduce((acc, [key, value]) => {
      acc[key] = (value as Object).toString();
      return acc;
    }, {} as Record<string, unknown>);
  return cleanedRequest;
}

export function newEmitterEvent(payload: Payload): EmitterEvent {
  let querystring: string | null = null;
  let postBody: Record<string, unknown> | null = null;
  let byteCountGET: number | null = null;
  let byteCountPOST: number | null = null;

  function getPayload(): Payload {
    return payload;
  }

  function getCachedQuerystring(payload: Payload): string {
    if (querystring === null) {
      querystring = getQuerystring(payload);
    }
    return querystring;
  }

  function getGETRequestURL(collectorUrl: string, useStm: boolean): string {
    const querystring = getCachedQuerystring(payload);
    if (useStm) {
      return collectorUrl + querystring.replace('?', '?stm=' + new Date().getTime() + '&');
    }

    return collectorUrl + querystring;
  }

  function getGETRequestBytesCount(): number {
    if (byteCountGET === null) {
      const querystring = getCachedQuerystring(payload);
      byteCountGET = getUTF8Length(querystring);
    }
    return byteCountGET;
  }

  function getPOSTRequestBody(): Record<string, unknown> {
    if (postBody === null) {
      postBody = preparePostBody(payload);
    }
    return postBody;
  }

  function getPOSTRequestBytesCount(): number {
    if (byteCountPOST === null) {
      byteCountPOST = getUTF8Length(JSON.stringify(preparePostBody(payload)));
    }
    return byteCountPOST;
  }
  return {
    getPayload,
    getGETRequestURL,
    getGETRequestBytesCount,
    getPOSTRequestBody,
    getPOSTRequestBytesCount,
  };
}
