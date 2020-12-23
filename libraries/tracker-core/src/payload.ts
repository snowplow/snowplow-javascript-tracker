/*
 * JavaScript tracker core for Snowplow: payload.ts
 *
 * Copyright (c) 2014-2020 Snowplow Analytics Ltd. All rights reserved.
 *
 * This program is licensed to you under the Apache License Version 2.0,
 * and you may not use this file except in compliance with the Apache License Version 2.0.
 * You may obtain a copy of the Apache License Version 2.0 at http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the Apache License Version 2.0 is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Apache License Version 2.0 for the specific language governing permissions and limitations there under.
 */

import * as base64 from './base64';

/**
 * Interface for a Payload dictionary
 */
export interface PayloadDictionary {
  [key: string]: unknown;
}

/**
 * Interface for mutable object encapsulating tracker payload
 */
export interface PayloadData {
  /**
   * Adds an entry to the Payload
   * @param key Key for Payload dictionary entry
   * @param value Value for Payload dictionaty entry
   */
  add: (key: string, value?: string) => void;

  /**
   * Merges a payload into the existing payload
   * @param dict The payload to merge
   */
  addDict: (dict: PayloadDictionary) => void;

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
  build: () => PayloadDictionary;
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
export function isNonEmptyJson(property: Record<string, unknown>): boolean {
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
export function isJson(property: unknown): boolean {
  const record = property as Record<string, unknown> | null | undefined;
  return (
    typeof record !== 'undefined' &&
    record !== null &&
    (record.constructor === {}.constructor || record.constructor === [].constructor)
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
export function payloadBuilder(base64Encode: boolean): PayloadData {
  const dict: PayloadDictionary = {};

  const add = (key: string, value?: unknown): void => {
    if (value != null && value !== '') {
      // null also checks undefined
      dict[key] = value;
    }
  };

  const addDict = (dict: PayloadDictionary): void => {
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

  const build = (): PayloadDictionary => {
    return dict;
  };

  return {
    add,
    addDict,
    addJson,
    build,
  };
}
