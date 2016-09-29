/*
 * JavaScript tracker core for Snowplow: payload.js
 * 
 * Copyright (c) 2014-2016 Snowplow Analytics Ltd. All rights reserved.
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
 * Interface for mutable object encapsulating tracker payload
 */
export interface PayloadData {
	add: (key: string, value?: string) => void,
	addDict: (dict: Object) => void,
	addJson: (keyIfEncoded: string, keyIfNotEncoded: string, json: Object) => void,
	build: () => Object;
}

/**
 * Bas64 encode data with URL and Filename Safe Alphabet (base64url)
 *
 * See: http://tools.ietf.org/html/rfc4648#page-7
 */
function base64urlencode(data: string): string {
	if (!data) {
		return data;
	}

	var enc = base64.base64encode(data);
	return enc.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Is property a non-empty JSON?
 */
export function isNonEmptyJson(property): boolean {
	if (!isJson(property)) {
		return false;
	}
	for (var key in property) {
		if (property.hasOwnProperty(key)) {
			return true;
		}
	}
	return false;
}

/**
 * Is property a JSON?
 */
export function isJson(property: Object): boolean {
	return (typeof property !== 'undefined' && property !== null &&
	(property.constructor === {}.constructor || property.constructor === [].constructor));
}


/**
 * A helper to build a Snowplow request string from an
 * an optional initial value plus a set of individual
 * name-value pairs, provided using the add method.
 *
 * @param base64Encode boolean Whether or not JSONs should be
 * Base64-URL-safe-encoded
 *
 * @return object The request string builder, with add, addRaw and build methods
 */
export function payloadBuilder(base64Encode: boolean): PayloadData {
	var dict = {};

	var add = function (key: string, value?: string): void {
		if (value != null && value !== '') {  // null also checks undefined
			dict[key] = value;
		}
	};

	var addDict = function (dict: Object) {
		for (var key in dict) {
			if (dict.hasOwnProperty(key)) {
				add(key, dict[key]);
			}
		}
	};

	var addJson = function (keyIfEncoded: string, keyIfNotEncoded: string, json?: Object) {
		if (isNonEmptyJson(json)) {
			var str = JSON.stringify(json);
			if (base64Encode) {
				add(keyIfEncoded, base64urlencode(str));
			} else {
				add(keyIfNotEncoded, str);
			}
		}
	};

	return {
		add: add,
		addDict: addDict,
		addJson: addJson,
		build: function () {
			return dict;
		}
	};
}
