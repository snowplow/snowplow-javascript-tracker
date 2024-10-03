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
   * @returns true if the cookie was set, false otherwise
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
  deleteCookie(name: string, path?: string, domainName?: string, sameSite?: string, secure?: boolean): void;
}

export interface AsyncCookieStorage extends CookieStorage {
  /**
   * Clear the cookie storage cache (does not delete any cookies)
   */
  clearCache(): void;

  /**
   * Write all pending cookies.
   */
  flush(): void;
}

interface Cookie {
  getValue: () => string;
  setValue: (value?: string, ttl?: number, path?: string, domain?: string, samesite?: string, secure?: boolean) => boolean;
  deleteValue: (path?: string, domainName?: string, sameSite?: string, secure?: boolean) => void;
  flush: () => void;
}

function newCookie(name: string): Cookie {
  let flushTimer: ReturnType<typeof setTimeout> | undefined;
  let lastSetValueArgs: Parameters<typeof setValue> | undefined;
  let cacheExpireAt: Date | undefined;
  let flushed = true;
  const flushTimeout = 10; // milliseconds
  const maxCacheTtl = 0.05; // seconds

  function getValue(): string {
    // Note: we can't cache the cookie value as we don't know the expiration date
    if (lastSetValueArgs && (!cacheExpireAt || cacheExpireAt > new Date())) {
      return lastSetValueArgs[0] ?? cookie(name);
    }
    return cookie(name);
  }

  function setValue(value?: string, ttl?: number, path?: string, domain?: string, samesite?: string, secure?: boolean): boolean {
    lastSetValueArgs = [value, ttl, path, domain, samesite, secure];
    flushed = false;

    // throttle setting the cookie
    if (flushTimer === undefined) {
      flushTimer = setTimeout(() => {
        flushTimer = undefined;
        flush();
      }, flushTimeout);
    }

    cacheExpireAt = new Date(Date.now() + Math.min(maxCacheTtl, ttl ?? maxCacheTtl) * 1000);
    return true;
  }

  function deleteValue(path?: string, domainName?: string, sameSite?: string, secure?: boolean): void {
    lastSetValueArgs = undefined;
    flushed = true;

    // cancel setting the cookie
    if (flushTimer !== undefined) {
      clearTimeout(flushTimer);
      flushTimer = undefined;
    }

    deleteCookie(name, path, domainName, sameSite, secure);
  }

  function flush(): void {
    if (flushTimer !== undefined) {
      clearTimeout(flushTimer);
      flushTimer = undefined;
    }

    if (flushed) {
      return;
    }
    flushed = true;

    if (lastSetValueArgs !== undefined) {
      const [value, ttl, path, domain, samesite, secure] = lastSetValueArgs;
      cookie(name, value, ttl, path, domain, samesite, secure);
    }
  }

  return {
    getValue,
    setValue,
    deleteValue,
    flush,
  };
}

/**
 * Create a new async cookie storage
 *
 * @returns A new cookie storage
 */
export function newCookieStorage(): AsyncCookieStorage {
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

  function deleteCookie(name: string, path?: string, domainName?: string, sameSite?: string, secure?: boolean): void {
    getOrInitCookie(name).deleteValue(path, domainName, sameSite, secure);
  }

  function clearCache(): void {
    cache = {};
  }

  function flush(): void {
    for (const cookie of Object.values(cache)) {
      cookie.flush();
    }
  }

  return {
    getCookie,
    setCookie,
    deleteCookie,
    clearCache,
    flush,
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
    return document.cookie.indexOf(`${name}=`) !== -1;
  },
  deleteCookie
};
