/*
 * JavaScript tracker core for Snowplow: payload.js
 * 
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright 
 * 2012-2014 Snowplow Analytics Ltd. All rights reserved. 
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

;(function() {

	var
		json2 = require('JSON'),
		base64 = require('./base64'),

		object = typeof exports !== 'undefined' ? exports : this; // For eventual node.js environment support

	/*
	 * Bas64 encode data with URL and Filename Safe Alphabet (base64url)
	 *
	 * See: http://tools.ietf.org/html/rfc4648#page-7
	 */
	function base64urlencode(data) {
		if (!data) return data;

		var enc = base64.base64encode(data);
		return enc.replace(/=/g, '')
	            .replace(/\+/g, '-')
	            .replace(/\//g, '_');
	};

	/*
	 * Is property a JSON?
	 */
	object.isJson = function (property) {
		return (typeof property !== 'undefined' && property !== null && 
			(property.constructor === {}.constructor || property.constructor === [].constructor));
	}

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
				dict[key] = value
			}
		};

		var addDict = function (dict) {
			for (var key in dict) {
				if (dict.hasOwnProperty(key)) {
					add(key, dict[key]);
				}
			}
		}

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
			build: function() {
				return dict;
			}
		};
	}

}());
