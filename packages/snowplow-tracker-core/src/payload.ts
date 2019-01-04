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

import { encode } from "universal-base64url";

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
 * Is property a non-empty JSON?
 */
export function isNonEmptyJson(property: Object | undefined): boolean {
	if (typeof property === 'undefined' || !isJson(property)) {
		return false;
	}
	for (let key in property) {
		if (property.hasOwnProperty(key)) {
			return true;
		}
	}
	return false;
}

/**
 * Is property a JSON?
 */
export function isJson(property: Object | undefined): boolean {
	return (typeof property !== 'undefined' && property !== null &&
	(property.constructor === {}.constructor || property.constructor === [].constructor));
}

export interface PayloadDict {
	[key: string]: PayloadDict | string
}

export interface StringDict {
	[key: string]: string
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
	let dict: PayloadDict = {};

	let add = function (key: string, value?: string): void {
		if (value != null && value !== '') {  // null also checks undefined
			dict[key] = value;
		}
	};

	let addDict = function (dict: Object) {
		for (let key in dict) {
			if (dict.hasOwnProperty(key) && typeof key === 'string' && typeof (dict as PayloadDict)[key] === 'string') {
				add(key, (dict as StringDict)[key]);
			}
		}
	};

	let addJson = function (keyIfEncoded: string, keyIfNotEncoded: string, json?: Object) {
		if (isNonEmptyJson(json)) {
			let str = JSON.stringify(json);
			if (base64Encode) {
				add(keyIfEncoded, encode(str));
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
