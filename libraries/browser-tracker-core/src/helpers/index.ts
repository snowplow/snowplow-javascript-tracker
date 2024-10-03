/*
 * Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

export * from './storage';
export * from './cross_domain';

declare global {
  interface EventTarget {
    attachEvent?: (type: string, fn: EventListenerOrEventListenerObject) => void;
  }
}

/**
 * The criteria which will be used to filter results to specific classes or elements
 */
export interface FilterCriterion<T> {
  /** A collection of class names to include */
  allowlist?: string[];
  /** A collector of class names to exclude */
  denylist?: string[];
  /** A callback which returns a boolean as to whether the element should be included */
  filter?: (elt: T) => boolean;
}

/**
 * Checks if an object is a string
 * @param str - The object to check
 */
export function isString(str: Object): str is string {
  if (str && typeof str.valueOf() === 'string') {
    return true;
  }
  return false;
}

/**
 * Checks if an object is an integer
 * @param int - The object to check
 */
export function isInteger(int: Object): int is number {
  return (
    (Number.isInteger && Number.isInteger(int)) || (typeof int === 'number' && isFinite(int) && Math.floor(int) === int)
  );
}

/**
 * Checks if the input parameter is a function
 * @param func - The object to check
 */
export function isFunction(func: unknown) {
  if (func && typeof func === 'function') {
    return true;
  }
  return false;
}

/**
 * Lightweight configured runtime timezone detection
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/resolvedOptions#getting_the_users_time_zone_and_locale_preferences
 * @returns IANA timezone name of current runtime preference
 */
export function getTimeZone(): string | void {
  if (typeof Intl === 'object' && typeof Intl.DateTimeFormat === 'function') {
    const systemPreferences = new Intl.DateTimeFormat().resolvedOptions();
    return systemPreferences.timeZone;
  }
}

/**
 * Cleans up the page title
 */
export function fixupTitle(title: string | { text: string }) {
  if (!isString(title)) {
    title = title.text || '';

    var tmp = document.getElementsByTagName('title');
    if (tmp && tmp[0] != null) {
      title = tmp[0].text;
    }
  }
  return title;
}

/**
 * Extract hostname from URL
 */
export function getHostName(url: string) {
  // scheme : // [username [: password] @] hostname [: port] [/ [path] [? query] [# fragment]]
  var e = new RegExp('^(?:(?:https?|ftp):)/*(?:[^@]+@)?([^:/#]+)'),
    matches = e.exec(url);

  return matches ? matches[1] : url;
}

/**
 * Fix-up domain
 */
export function fixupDomain(domain: string) {
  var dl = domain.length;

  // remove trailing '.'
  if (domain.charAt(--dl) === '.') {
    domain = domain.slice(0, dl);
  }
  // remove leading '*'
  if (domain.slice(0, 2) === '*.') {
    domain = domain.slice(1);
  }
  return domain;
}

/**
 * Get page referrer. In the case of a single-page app,
 * if the URL changes without the page reloading, pass
 * in the old URL. It will be returned unless overriden
 * by a "refer(r)er" parameter in the querystring.
 *
 * @param string - oldLocation Optional.
 * @returns string The referrer
 */
export function getReferrer(oldLocation?: string) {
  let windowAlias = window,
    fromQs =
      fromQuerystring('referrer', windowAlias.location.href) || fromQuerystring('referer', windowAlias.location.href);

  // Short-circuit
  if (fromQs) {
    return fromQs;
  }

  // In the case of a single-page app, return the old URL
  if (oldLocation) {
    return oldLocation;
  }

  try {
    if (windowAlias.top) {
      return windowAlias.top.document.referrer;
    } else if (windowAlias.parent) {
      return windowAlias.parent.document.referrer;
    }
  } catch {}

  return document.referrer;
}

/**
 * Cross-browser helper function to add event handler
 */
export function addEventListener(
  element: HTMLElement | EventTarget,
  eventType: string,
  eventHandler: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
) {
  if (element.addEventListener) {
    element.addEventListener(eventType, eventHandler, options);
    return true;
  }

  // IE Support
  if (element.attachEvent) {
    return element.attachEvent('on' + eventType, eventHandler);
  }
  (element as any)['on' + eventType] = eventHandler;
}

/**
 * Return value from name-value pair in querystring
 */
export function fromQuerystring(field: string, url: string) {
  var match = new RegExp('^[^#]*[?&]' + field + '=([^&#]*)').exec(url);
  if (!match) {
    return null;
  }
  return decodeURIComponent(match[1].replace(/\+/g, ' '));
}

/**
 * Add a name-value pair to the querystring of a URL
 *
 * @param string - url URL to decorate
 * @param string - name Name of the querystring pair
 * @param string - value Value of the querystring pair
 */
export function decorateQuerystring(url: string, name: string, value: string) {
  var initialQsParams = name + '=' + value;
  var hashSplit = url.split('#');
  var qsSplit = hashSplit[0].split('?');
  var beforeQuerystring = qsSplit.shift();
  // Necessary because a querystring may contain multiple question marks
  var querystring = qsSplit.join('?');
  if (!querystring) {
    querystring = initialQsParams;
  } else {
    // Whether this is the first time the link has been decorated
    var initialDecoration = true;
    var qsFields = querystring.split('&');
    for (var i = 0; i < qsFields.length; i++) {
      if (qsFields[i].substr(0, name.length + 1) === name + '=') {
        initialDecoration = false;
        qsFields[i] = initialQsParams;
        querystring = qsFields.join('&');
        break;
      }
    }
    if (initialDecoration) {
      querystring = initialQsParams + '&' + querystring;
    }
  }
  hashSplit[0] = beforeQuerystring + '?' + querystring;
  return hashSplit.join('#');
}

/**
 * Finds the root domain
 */
export function findRootDomain(sameSite: string, secure: boolean) {
  const windowLocationHostnameAlias = window.location.hostname,
    cookiePrefix = '_sp_root_domain_test_',
    cookieName = cookiePrefix + new Date().getTime(),
    cookieValue = '_test_value_' + new Date().getTime();

  const locationParts = windowLocationHostnameAlias.split('.');
  for (let idx = locationParts.length - 2; idx >= 0; idx--) {
    const currentDomain = locationParts.slice(idx).join('.');
    cookie(cookieName, cookieValue, 0, '/', currentDomain, sameSite, secure);
    if (cookie(cookieName) === cookieValue) {
      // Clean up created cookie(s)
      deleteCookie(cookieName, '/', currentDomain, sameSite, secure);
      const cookieNames = getCookiesWithPrefix(cookiePrefix);
      for (let i = 0; i < cookieNames.length; i++) {
        deleteCookie(cookieNames[i], '/', currentDomain, sameSite, secure);
      }

      return currentDomain;
    }
  }

  // Cookies cannot be read
  return windowLocationHostnameAlias;
}

/**
 * Checks whether a value is present within an array
 *
 * @param val - The value to check for
 * @param array - The array to check within
 * @returns boolean Whether it exists
 */
export function isValueInArray<T>(val: T, array: T[]) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === val) {
      return true;
    }
  }
  return false;
}

/**
 * Deletes an arbitrary cookie by setting the expiration date to the past
 *
 * @param cookieName - The name of the cookie to delete
 * @param domainName - The domain the cookie is in
 */
export function deleteCookie(cookieName: string, path?: string, domainName?: string, sameSite?: string, secure?: boolean) {
  cookie(cookieName, '', -1, path, domainName, sameSite, secure);
}

/**
 * Fetches the name of all cookies beginning with a certain prefix
 *
 * @param cookiePrefix - The prefix to check for
 * @returns array The cookies that begin with the prefix
 */
export function getCookiesWithPrefix(cookiePrefix: string) {
  var cookies = document.cookie.split('; ');
  var cookieNames = [];
  for (var i = 0; i < cookies.length; i++) {
    if (cookies[i].substring(0, cookiePrefix.length) === cookiePrefix) {
      cookieNames.push(cookies[i]);
    }
  }
  return cookieNames;
}

/**
 * Get and set the cookies associated with the current document in browser
 * This implementation always returns a string, returns the cookie value if only name is specified
 *
 * @param name - The cookie name (required)
 * @param value - The cookie value
 * @param ttl - The cookie Time To Live (seconds)
 * @param path - The cookies path
 * @param domain - The cookies domain
 * @param samesite - The cookies samesite attribute
 * @param secure - Boolean to specify if cookie should be secure
 * @returns string The cookies value
 */
export function cookie(
  name: string,
  value?: string,
  ttl?: number,
  path?: string,
  domain?: string,
  samesite?: string,
  secure?: boolean
) {
  if (arguments.length > 1) {
    return (document.cookie =
      name +
      '=' +
      encodeURIComponent(value ?? '') +
      (ttl ? '; Expires=' + new Date(+new Date() + ttl * 1000).toUTCString() : '') +
      (path ? '; Path=' + path : '') +
      (domain ? '; Domain=' + domain : '') +
      (samesite ? '; SameSite=' + samesite : '') +
      (secure ? '; Secure' : ''));
  }

  return decodeURIComponent((('; ' + document.cookie).split('; ' + name + '=')[1] || '').split(';')[0]);
}

/**
 * Parses an object and returns either the
 * integer or undefined.
 *
 * @param obj - The object to parse
 * @returns the result of the parse operation
 */
export function parseAndValidateInt(obj: unknown) {
  var result = parseInt(obj as string);
  return isNaN(result) ? undefined : result;
}

/**
 * Parses an object and returns either the
 * number or undefined.
 *
 * @param obj - The object to parse
 * @returns the result of the parse operation
 */
export function parseAndValidateFloat(obj: unknown) {
  var result = parseFloat(obj as string);
  return isNaN(result) ? undefined : result;
}

/**
 * Convert a criterion object to a filter function
 *
 * @param object - criterion Either {allowlist: [array of allowable strings]}
 *                             or {denylist: [array of allowable strings]}
 *                             or {filter: function (elt) {return whether to track the element}
 * @param boolean - byClass Whether to allowlist/denylist based on an element's classes (for forms)
 *                        or name attribute (for fields)
 */
export function getFilterByClass(criterion?: FilterCriterion<HTMLElement> | null): (elt: HTMLElement) => boolean {
  // If the criterion argument is not an object, add listeners to all elements
  if (criterion == null || typeof criterion !== 'object' || Array.isArray(criterion)) {
    return function () {
      return true;
    };
  }

  const inclusive = Object.prototype.hasOwnProperty.call(criterion, 'allowlist');
  const specifiedClassesSet = getSpecifiedClassesSet(criterion);

  return getFilter(criterion, function (elt: HTMLElement) {
    return checkClass(elt, specifiedClassesSet) === inclusive;
  });
}

/**
 * Convert a criterion object to a filter function
 *
 * @param object - criterion Either {allowlist: [array of allowable strings]}
 *                             or {denylist: [array of allowable strings]}
 *                             or {filter: function (elt) {return whether to track the element}
 */
export function getFilterByName<T extends { name: string }>(criterion?: FilterCriterion<T>): (elt: T) => boolean {
  // If the criterion argument is not an object, add listeners to all elements
  if (criterion == null || typeof criterion !== 'object' || Array.isArray(criterion)) {
    return function () {
      return true;
    };
  }

  const inclusive = criterion.hasOwnProperty('allowlist');
  const specifiedClassesSet = getSpecifiedClassesSet(criterion);

  return getFilter(criterion, function (elt: T) {
    return elt.name in specifiedClassesSet === inclusive;
  });
}

/**
 * List the classes of a DOM element without using elt.classList (for compatibility with IE 9)
 */
export function getCssClasses(elt: Element) {
  return elt.className.match(/\S+/g) || [];
}

/**
 * Check whether an element has at least one class from a given list
 */
function checkClass(elt: Element, classList: Record<string, boolean>) {
  var classes = getCssClasses(elt);

  for (const className of classes) {
    if (classList[className]) {
      return true;
    }
  }

  return false;
}

function getFilter<T>(criterion: FilterCriterion<T>, fallbackFilter: (elt: T) => boolean) {
  if (criterion.hasOwnProperty('filter') && criterion.filter) {
    return criterion.filter;
  }

  return fallbackFilter;
}

function getSpecifiedClassesSet<T>(criterion: FilterCriterion<T>) {
  // Convert the array of classes to an object of the form {class1: true, class2: true, ...}
  var specifiedClassesSet: Record<string, boolean> = {};
  var specifiedClasses = criterion.allowlist || criterion.denylist;

  if (specifiedClasses) {
    if (!Array.isArray(specifiedClasses)) {
      specifiedClasses = [specifiedClasses];
    }

    for (var i = 0; i < specifiedClasses.length; i++) {
      specifiedClassesSet[specifiedClasses[i]] = true;
    }
  }

  return specifiedClassesSet;
}
