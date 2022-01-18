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

import { base64urlencode } from './base64';

/**
 * Type for a Payload dictionary
 */
export type Payload = Record<string, unknown>;

/**
 * A tuple which represents the unprocessed JSON to be added to the Payload
 */
export type EventJsonWithKeys = { keyIfEncoded: string; keyIfNotEncoded: string; json: Record<string, unknown> };

/**
 * An array of tuples which represents the unprocessed JSON to be added to the Payload
 */
export type EventJson = Array<EventJsonWithKeys>;

/**
 * A function which will processor the Json onto the injected PayloadBuilder
 */
export type JsonProcessor = (payloadBuilder: PayloadBuilder, jsonForProcessing: EventJson) => void;

/**
 * Interface for mutable object encapsulating tracker payload
 */
export interface PayloadBuilder {
  /**
   * Adds an entry to the Payload
   * @param key - Key for Payload dictionary entry
   * @param value - Value for Payload dictionaty entry
   */
  add: (key: string, value: unknown) => void;

  /**
   * Merges a payload into the existing payload
   * @param dict - The payload to merge
   */
  addDict: (dict: Payload) => void;

  /**
   * Caches a JSON object to be added to payload on build
   * @param keyIfEncoded - key if base64 encoding is enabled
   * @param keyIfNotEncoded - key if base64 encoding is disabled
   * @param json - The json to be stringified and added to the payload
   */
  addJson: (keyIfEncoded: string, keyIfNotEncoded: string, json: Record<string, unknown>) => void;

  /**
   * Gets the current payload, before cached JSON is processed
   */
  getPayload: () => Payload;

  /**
   * Gets all JSON objects added to payload
   */
  getJson: () => EventJson;

  /**
   * Adds a function which will be executed when building
   * the payload to process the JSON which has been added to this payload
   * @param jsonProcessor - The JsonProcessor function for this builder
   */
  withJsonProcessor: (jsonProcessor: JsonProcessor) => void;

  /**
   * Builds and returns the Payload
   * @param base64Encode - configures if unprocessed, cached json should be encoded
   */
  build: () => Payload;
}

export function payloadBuilder(): PayloadBuilder {
  const dict: Payload = {},
    allJson: EventJson = [],
    jsonForProcessing: EventJson = [];
  let processor: JsonProcessor | undefined;

  const add = (key: string, value: unknown): void => {
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
      const jsonWithKeys = { keyIfEncoded, keyIfNotEncoded, json };
      jsonForProcessing.push(jsonWithKeys);
      allJson.push(jsonWithKeys);
    }
  };

  return {
    add,
    addDict,
    addJson,
    getPayload: () => dict,
    getJson: () => allJson,
    withJsonProcessor: (jsonProcessor) => {
      processor = jsonProcessor;
    },
    build: function () {
      processor?.(this, jsonForProcessing);
      return dict;
    },
  };
}

/**
 * A helper to build a Snowplow request from a set of name-value pairs, provided using the add methods.
 * Will base64 encode JSON, if desired, on build
 *
 * @returns The request builder, with add and build methods
 */
export function payloadJsonProcessor(encodeBase64: boolean): JsonProcessor {
  return (payloadBuilder: PayloadBuilder, jsonForProcessing: EventJson) => {
    for (const json of jsonForProcessing) {
      const str = JSON.stringify(json.json);
      if (encodeBase64) {
        payloadBuilder.add(json.keyIfEncoded, base64urlencode(str));
      } else {
        payloadBuilder.add(json.keyIfNotEncoded, str);
      }
    }
    jsonForProcessing.length = 0;
  };
}

/**
 * Is property a non-empty JSON?
 * @param property - Checks if object is non-empty json
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
 * @param property - Checks if object is json
 */
export function isJson(property?: Record<string, unknown>): boolean {
  return (
    typeof property !== 'undefined' &&
    property !== null &&
    (property.constructor === {}.constructor || property.constructor === [].constructor)
  );
}
