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

/**
 * Attempt to get a value from localStorage
 *
 * @param string - key
 * @returns string The value obtained from localStorage, or
 *                undefined if localStorage is inaccessible
 */
export function attemptGetLocalStorage(key: string) {
  try {
    const localStorageAlias = window.localStorage,
      exp = localStorageAlias.getItem(key + '.expires');
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
 * @param string - key
 * @param string - value
 * @param number - ttl Time to live in seconds, defaults to 2 years from Date.now()
 * @returns boolean Whether the operation succeeded
 */
export function attemptWriteLocalStorage(key: string, value: string, ttl = 63072000) {
  try {
    const localStorageAlias = window.localStorage,
      t = Date.now() + ttl * 1000;
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
 * @param string - key
 * @returns boolean Whether the operation succeeded
 */
export function attemptDeleteLocalStorage(key: string) {
  try {
    const localStorageAlias = window.localStorage;
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
 * @param string - key
 * @returns string The value obtained from sessionStorage, or
 *                undefined if sessionStorage is inaccessible
 */
export function attemptGetSessionStorage(key: string) {
  try {
    return window.sessionStorage.getItem(key);
  } catch (e) {
    return undefined;
  }
}

/**
 * Attempt to write a value to sessionStorage
 *
 * @param string - key
 * @param string - value
 * @returns boolean Whether the operation succeeded
 */
export function attemptWriteSessionStorage(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
    return true;
  } catch (e) {
    return false;
  }
}
