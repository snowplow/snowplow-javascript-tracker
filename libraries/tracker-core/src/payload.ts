/*
 * Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang
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

import * as base64 from './base64';

export type PayloadValue = unknown;

/**
 * Interface for a Payload dictionary
 */
export type Payload = Record<string, PayloadValue>;

/**
 * Interface for mutable object encapsulating tracker payload
 */
export interface PayloadBuilder {
  /**
   * Adds an entry to the Payload
   * @param key Key for Payload dictionary entry
   * @param value Value for Payload dictionaty entry
   */
  add: (key: string, value: PayloadValue) => void;

  /**
   * Merges a payload into the existing payload
   * @param dict The payload to merge
   */
  addDict: (dict: Payload) => void;

  /**
   * Adds a JSON object to the payload - will stringify the JSON object
   * @param keyIfEncoded key if base64 encoding is enabled
   * @param keyIfNotEncoded key if base64 encoding is disabled
   * @param json The json to be stringified and added to the payload
   */
  addJson: (keyIfEncoded: string, keyIfNotEncoded: string, json: Record<string, unknown>) => void;

  /**
   * Builds and returns the Payload
   */
  build: () => Payload;
}

/**
 * Base64 encode data with URL and Filename Safe Alphabet (base64url)
 *
 * See: http://tools.ietf.org/html/rfc4648#page-7
 */
function base64urlencode(data: string): string {
  if (!data) {
    return data;
  }

  const enc = base64.base64encode(data);
  return enc.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Is property a non-empty JSON?
 */
export function isNonEmptyJson(property?: Record<string, unknown>): boolean {
  if (!isJson(property)) {
    return false;
  }
  for (const key in property) {
    if (Object.prototype.hasOwnProperty.call(property, key)) {
      return true;
    }
  }
  return false;
}

/**
 * Is property a JSON?
 */
export function isJson(property?: Record<string, unknown>): boolean {
  return (
    typeof property !== 'undefined' &&
    property !== null &&
    (property.constructor === {}.constructor || property.constructor === [].constructor)
  );
}

/**
 * A helper to build a Snowplow request string from an
 * an optional initial value plus a set of individual
 * name-value pairs, provided using the add method.
 *
 * @param base64Encode Whether or not JSONs should be Base64-URL-safe-encoded
 *
 * @return The request string builder, with add, addRaw and build methods
 */
export function payloadBuilder(base64Encode: boolean): PayloadBuilder {
  const dict: Payload = {};

  const add = (key: string, value: PayloadValue): void => {
    if (value != null && value !== '') {
      // null also checks undefined
      dict[key] = value;
    }
  };

  const addDict = (dict: Payload): void => {
    for (const key in dict) {
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        add(key, dict[key]);
      }
    }
  };

  const addJson = (keyIfEncoded: string, keyIfNotEncoded: string, json?: Record<string, unknown>): void => {
    if (json && isNonEmptyJson(json)) {
      const str = JSON.stringify(json);
      if (base64Encode) {
        add(keyIfEncoded, base64urlencode(str));
      } else {
        add(keyIfNotEncoded, str);
      }
    }
  };

  const build = (): Payload => {
    return dict;
  };

  return {
    add,
    addDict,
    addJson,
    build,
  };
}
