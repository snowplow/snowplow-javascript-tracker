import { cookie, deleteCookie } from '../helpers';


/**
 * Cookie storage interface for reading and writing cookies.
 */
export interface CookieStorage {
  /**
   * Get the value of a cookie
   *
   * @param name - The name of the cookie
   * @returns The cookie value
   */
  getCookie(name: string): string;

  /**
   * Set a cookie
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
  setCookie(
    name: string,
    value?: string,
    ttl?: number,
    path?: string,
    domain?: string,
    samesite?: string,
    secure?: boolean
  ): boolean;

  /**
   * Delete a cookie
   *
   * @param name - The cookie name
   * @param domainName - The cookie domain name
   * @param sameSite - The cookie same site attribute
   * @param secure - Boolean to specify if cookie should be secure
   */
  deleteCookie(name: string, domainName?: string, sameSite?: string, secure?: boolean): void;

  /**
   * Clear the cookie storage cache (does not delete any cookies)
   */
  clearCache(): void;
}

interface Cookie {
  getValue: () => string;
  setValue: (value?: string, ttl?: number, path?: string, domain?: string, samesite?: string, secure?: boolean) => boolean;
  deleteValue: (domainName?: string, sameSite?: string, secure?: boolean) => void;
}

function newCookie(name: string): Cookie {
  let cachedValue: string | undefined;
  let setCookieTimer: ReturnType<typeof setTimeout> | undefined;
  const debounceTimeout = 10;

  function scheduleClearCache(ttl: number) {
    setCookieTimer = setTimeout(() => {
      cachedValue = undefined;
    }, ttl * 1000);
  }

  function getValue(): string {
    // Note: we can't cache the cookie value as we don't know the expiration date
    return cachedValue ?? cookie(name);
  }

  function setValue(value?: string, ttl?: number, path?: string, domain?: string, samesite?: string, secure?: boolean): boolean {
    cachedValue = value;

    // debounce setting the cookie
    if (setCookieTimer !== undefined) {
      clearTimeout(setCookieTimer);
    }
    setCookieTimer = setTimeout(() => {
      setCookieTimer = undefined;
      cookie(name, value, ttl, path, domain, samesite, secure);

      if (ttl !== undefined) {
        scheduleClearCache(ttl);
      }
    }, debounceTimeout);
    return true;
  }

  function deleteValue(domainName?: string, sameSite?: string, secure?: boolean): void {
    cachedValue = undefined;

    // cancel setting the cookie
    if (setCookieTimer !== undefined) {
      clearTimeout(setCookieTimer);
    }
    deleteCookie(name, domainName, sameSite, secure);
  }

  return {
    getValue,
    setValue,
    deleteValue
  };
}

/**
 * Create a new async cookie storage
 *
 * @returns A new cookie storage
 */
export function newCookieStorage(): CookieStorage {
  let cache: Record<string, Cookie> = {};

  function getOrInitCookie(name: string): Cookie {
    if (!cache[name]) {
      cache[name] = newCookie(name);
    }
    return cache[name];
  }

  function getCookie(name: string): string {
    return getOrInitCookie(name).getValue();
  }

  function setCookie(
    name: string,
    value?: string,
    ttl?: number,
    path?: string,
    domain?: string,
    samesite?: string,
    secure?: boolean
  ): boolean {
    return getOrInitCookie(name).setValue(value, ttl, path, domain, samesite, secure);
  }

  function deleteCookie(name: string, domainName?: string, sameSite?: string, secure?: boolean): void {
    getOrInitCookie(name).deleteValue(domainName, sameSite, secure);
  }

  function clearCache(): void {
    cache = {};
  }

  return {
    getCookie,
    setCookie,
    deleteCookie,
    clearCache,
  };
}

/**
 * Cookie storage instance with asynchronous cookie writes
 */
export const asyncCookieStorage = newCookieStorage();

/**
 * Cookie storage instance with synchronous cookie writes
 */
export const syncCookieStorage: CookieStorage = {
    getCookie: cookie,
    setCookie: (name, value, ttl, path, domain, samesite, secure) => {
      cookie(name, value, ttl, path, domain, samesite, secure);
      return document.cookie.indexOf(`${name}=`) !== -1 ? true : false;
    },
    deleteCookie: deleteCookie,
    clearCache: () => {},
};
