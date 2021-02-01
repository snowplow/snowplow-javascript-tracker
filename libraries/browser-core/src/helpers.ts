/*
 * JavaScript tracker for Snowplow: Snowplow.js
 *
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright
 * 2012-2020 Snowplow Analytics Ltd. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
 *   names of their contributors may be used to endorse or promote products
 *   derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import compact from 'lodash/compact';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';
import isObject from 'lodash/isObject';
import map from 'lodash/map';
import { SelfDescribingJson } from '@snowplow/tracker-core';

declare global {
  interface EventTarget {
    attachEvent?: (type: string, fn: EventListenerOrEventListenerObject) => void;
  }
}

var windowAlias = window,
  documentAlias = document,
  localStorageAlias = window.localStorage,
  sessionStorageAlias = window.sessionStorage;

/**
 * Cleans up the page title
 */
export function fixupTitle(title: string | { text: string }) {
  if (!isString(title)) {
    title = title.text || '';

    var tmp = documentAlias.getElementsByTagName('title');
    if (tmp && !isUndefined(tmp[0])) {
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
 * @param string oldLocation Optional.
 * @return string The referrer
 */
export function getReferrer(oldLocation?: string) {
  var referrer = '';

  var fromQs =
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
    referrer = windowAlias.top.document.referrer;
  } catch (e) {
    if (windowAlias.parent) {
      try {
        referrer = windowAlias.parent.document.referrer;
      } catch (e2) {
        referrer = '';
      }
    }
  }
  if (referrer === '') {
    referrer = documentAlias.referrer;
  }
  return referrer;
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

export type DynamicContexts = (SelfDescribingJson | ((...params: string[]) => SelfDescribingJson | null))[];

/*
 * Find dynamic context generating functions and merge their results into the static contexts
 * Combine an array of unchanging contexts with the result of a context-creating function
 *
 * @param {(object|function(...*): ?object)[]} dynamicOrStaticContexts Array of custom context Objects or custom context generating functions
 * @param {...*} Parameters to pass to dynamic callbacks
 */
export function resolveDynamicContexts(
  dynamicOrStaticContexts: DynamicContexts,
  ...extraParams: unknown[]
): Array<SelfDescribingJson> {
  return compact(
    map(dynamicOrStaticContexts, function (context) {
      if (typeof context === 'function') {
        try {
          return (context as (...params: unknown[]) => SelfDescribingJson)(...extraParams);
        } catch (e) {
          //TODO: provide warning
          return undefined;
        }
      } else {
        return context;
      }
    })
  );
}

/**
 * Only log deprecation warnings if they won't cause an error
 */
export function warn(message: string) {
  if (typeof console !== 'undefined') {
    console.warn('Snowplow: ' + message);
  }
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
function checkClass(elt: Element, classList: { [k: string]: boolean }) {
  var classes = getCssClasses(elt);

  for (const className of classes) {
    if (classList[className]) {
      return true;
    }
  }

  return false;
}
export interface FilterCriterion<T> {
  whitelist: string[];
  blacklist: string[];
  filter: (elt: T) => boolean;
}

function getFilter<T>(criterion: FilterCriterion<T>, fallbackFilter: (elt: T) => boolean) {
  if (criterion.hasOwnProperty('filter')) {
    return criterion.filter;
  }

  return fallbackFilter;
}

function getSpecifiedClassesSet<T>(criterion: FilterCriterion<T>) {
  var specifiedClasses = criterion.whitelist || criterion.blacklist;
  if (!Array.isArray(specifiedClasses)) {
    specifiedClasses = [specifiedClasses];
  }

  // Convert the array of classes to an object of the form {class1: true, class2: true, ...}
  var specifiedClassesSet: Record<string, boolean> = {};
  for (var i = 0; i < specifiedClasses.length; i++) {
    specifiedClassesSet[specifiedClasses[i]] = true;
  }

  return specifiedClassesSet;
}

/**
 * Convert a criterion object to a filter function
 *
 * @param object criterion Either {whitelist: [array of allowable strings]}
 *                             or {blacklist: [array of allowable strings]}
 *                             or {filter: function (elt) {return whether to track the element}
 * @param boolean byClass Whether to whitelist/blacklist based on an element's classes (for forms)
 *                        or name attribute (for fields)
 */
export function getFilterByClass(criterion: FilterCriterion<HTMLElement>): (elt: HTMLElement) => boolean {
  // If the criterion argument is not an object, add listeners to all elements
  if (Array.isArray(criterion) || !isObject(criterion)) {
    return function () {
      return true;
    };
  }

  const inclusive = criterion.hasOwnProperty('whitelist');
  const specifiedClassesSet = getSpecifiedClassesSet(criterion);

  return getFilter(criterion, function (elt: HTMLElement) {
    return checkClass(elt, specifiedClassesSet) === inclusive;
  });
}

/**
 * Convert a criterion object to a filter function
 *
 * @param object criterion Either {whitelist: [array of allowable strings]}
 *                             or {blacklist: [array of allowable strings]}
 *                             or {filter: function (elt) {return whether to track the element}
 */
export function getFilterByName<T extends { name: string }>(criterion: FilterCriterion<T>): (elt: T) => boolean {
  // If the criterion argument is not an object, add listeners to all elements
  if (Array.isArray(criterion) || !isObject(criterion)) {
    return function () {
      return true;
    };
  }

  const inclusive = criterion.hasOwnProperty('whitelist');
  const specifiedClassesSet = getSpecifiedClassesSet(criterion);

  return getFilter(criterion, function (elt: T) {
    return elt.name in specifiedClassesSet === inclusive;
  });
}

/**
 * Add a name-value pair to the querystring of a URL
 *
 * @param string url URL to decorate
 * @param string name Name of the querystring pair
 * @param string value Value of the querystring pair
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
 * Attempt to get a value from localStorage
 *
 * @param string key
 * @return string The value obtained from localStorage, or
 *                undefined if localStorage is inaccessible
 */
export function attemptGetLocalStorage(key: string) {
  try {
    const exp = localStorageAlias.getItem(key + '.expires');
    if (exp === null || +exp > Date.now()) {
      return localStorageAlias.getItem(key);
    } else {
      localStorageAlias.removeItem(key);
      localStorageAlias.removeItem(key + '.expires');
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
}

/**
 * Attempt to write a value to localStorage
 *
 * @param string key
 * @param string value
 * @param number ttl Time to live in seconds, defaults to 2 years from Date.now()
 * @return boolean Whether the operation succeeded
 */
export function attemptWriteLocalStorage(key: string, value: string, ttl = 63072000) {
  try {
    const t = Date.now() + ttl * 1000;
    localStorageAlias.setItem(`${key}.expires`, t.toString());
    localStorageAlias.setItem(key, value);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Attempt to delete a value from localStorage
 *
 * @param string key
 * @return boolean Whether the operation succeeded
 */
export function attemptDeleteLocalStorage(key: string) {
  try {
    localStorageAlias.removeItem(key);
    localStorageAlias.removeItem(key + '.expires');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Attempt to get a value from sessionStorage
 *
 * @param string key
 * @return string The value obtained from sessionStorage, or
 *                undefined if sessionStorage is inaccessible
 */
export function attemptGetSessionStorage(key: string) {
  try {
    return sessionStorageAlias.getItem(key);
  } catch (e) {
    return undefined;
  }
}

/**
 * Attempt to write a value to sessionStorage
 *
 * @param string key
 * @param string value
 * @return boolean Whether the operation succeeded
 */
export function attemptWriteSessionStorage(key: string, value: string) {
  try {
    sessionStorageAlias.setItem(key, value);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Finds the root domain
 */
export function findRootDomain(sameSite: string, secure: boolean) {
  var cookiePrefix = '_sp_root_domain_test_';
  var cookieName = cookiePrefix + new Date().getTime();
  var cookieValue = '_test_value_' + new Date().getTime();

  var split = windowAlias.location.hostname.split('.');
  var position = split.length - 1;
  while (position >= 0) {
    var currentDomain = split.slice(position, split.length).join('.');
    cookie(cookieName, cookieValue, 0, '/', currentDomain, sameSite, secure);
    if (cookie(cookieName) === cookieValue) {
      // Clean up created cookie(s)
      deleteCookie(cookieName, currentDomain, sameSite, secure);
      var cookieNames = getCookiesWithPrefix(cookiePrefix);
      for (var i = 0; i < cookieNames.length; i++) {
        deleteCookie(cookieNames[i], currentDomain, sameSite, secure);
      }

      return currentDomain;
    }
    position -= 1;
  }

  // Cookies cannot be read
  return windowAlias.location.hostname;
}

/**
 * Checks whether a value is present within an array
 *
 * @param val The value to check for
 * @param array The array to check within
 * @return boolean Whether it exists
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
 * @param cookieName The name of the cookie to delete
 * @param domainName The domain the cookie is in
 */
export function deleteCookie(cookieName: string, domainName?: string, sameSite?: string, secure?: boolean) {
  cookie(cookieName, '', -1, '/', domainName, sameSite, secure);
}

/**
 * Fetches the name of all cookies beginning with a certain prefix
 *
 * @param cookiePrefix The prefix to check for
 * @return array The cookies that begin with the prefix
 */
export function getCookiesWithPrefix(cookiePrefix: string) {
  var cookies = documentAlias.cookie.split('; ');
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
 * @param name The cookie name (required)
 * @param value The cookie value
 * @param ttl The cookie Time To Live (seconds)
 * @param path The cookies path
 * @param domain The cookies domain
 * @param samesite The cookies samesite attribute
 * @param secure Boolean to specify if cookie should be secure
 * @return string The cookies value
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
    return (documentAlias.cookie =
      name +
      '=' +
      encodeURIComponent(value ?? '') +
      (ttl ? '; Expires=' + new Date(+new Date() + ttl * 1000).toUTCString() : '') +
      (path ? '; Path=' + path : '') +
      (domain ? '; Domain=' + domain : '') +
      (samesite ? '; SameSite=' + samesite : '') +
      (secure ? '; Secure' : ''));
  }

  return decodeURIComponent((('; ' + documentAlias.cookie).split('; ' + name + '=')[1] || '').split(';')[0]);
}

/**
 * Parses an object and returns either the
 * integer or undefined.
 *
 * @param obj The object to parse
 * @return the result of the parse operation
 */
export function parseAndValidateInt(obj: unknown) {
  var result = parseInt(obj as string);
  return isNaN(result) ? undefined : result;
}

/**
 * Parses an object and returns either the
 * number or undefined.
 *
 * @param obj The object to parse
 * @return the result of the parse operation
 */
export function parseAndValidateFloat(obj: unknown) {
  var result = parseFloat(obj as string);
  return isNaN(result) ? undefined : result;
}

export function isFunction(func: unknown) {
  if (func && typeof func === 'function') {
    return true;
  }
  return false;
}
