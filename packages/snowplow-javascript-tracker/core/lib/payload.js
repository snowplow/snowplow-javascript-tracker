/*
 * JavaScript tracker core for Snowplow: payload.js
 * 
 * Copyright (c) 2014 Snowplow Analytics Ltd. All rights reserved.
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

;(function() {

	var
		json2 = require('JSON'),
		base64 = require('./base64'),

		object = typeof exports !== 'undefined' ? exports : this;

	/*
	 * Bas64 encode data with URL and Filename Safe Alphabet (base64url)
	 *
	 * See: http://tools.ietf.org/html/rfc4648#page-7
	 */
	function base64urlencode(data) {
		if (!data) {
			return data;
		}

		var enc = base64.base64encode(data);
		return enc.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
	}

	/*
	 * Is property a JSON?
	 */
	object.isJson = function (property) {
		return (typeof property !== 'undefined' && property !== null && 
			(property.constructor === {}.constructor || property.constructor === [].constructor));
	};

	/*
	 * Is property a non-empty JSON?
	 */
	object.isNonEmptyJson = function (property) {
		if (!object.isJson(property)) {
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
	 * A helper to build a Snowplow request string from an
	 * an optional initial value plus a set of individual
	 * name-value pairs, provided using the add method.
	 *
	 * @param boolean base64Encode Whether or not JSONs should be
	 * Base64-URL-safe-encoded
	 *
	 * @return object The request string builder, with add, addRaw and build methods
	 */
	object.payloadBuilder = function (base64Encode) {
		var dict = {};
		
		var add = function (key, value) {
			if (value !== undefined && value !== null && value !== '') {
				dict[key] = value;
			}
		};

		var addDict = function (dict) {
			for (var key in dict) {
				if (dict.hasOwnProperty(key)) {
					add(key, dict[key]);
				}
			}
		};

		var addJson = function (keyIfEncoded, keyIfNotEncoded, json) {

			if (object.isNonEmptyJson(json)) {
				var str = json2.stringify(json);
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
	};

}());
