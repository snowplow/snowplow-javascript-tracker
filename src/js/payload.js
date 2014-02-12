/*
 * JavaScript tracker for Snowplow: payload.js
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

/**
 * A helper to build a SnowPlow request string from an
 * an optional initial value plus a set of individual
 * name-value pairs, provided using the add method.
 *
 * @param boolean base64Encode Whether or not JSONs should be
 * Base64-URL-safe-encoded
 *
 * @return object The request string builder, with add, addRaw and build methods
 */

SnowPlow.payloadBuilder = function (base64Encode) {
	var str = '';
	
	var addNvPair = function (key, value, encode) {
		if (value !== undefined && value !== null && value !== '') {
			var sep = (str.length > 0) ? "&" : "?";
			str += sep + key + '=' + (encode ? SnowPlow.encodeWrapper(value) : value);
		}
	};

	/*
	 * Extract suffix from a property
	 */
	var getPropertySuffix = function (property) {
		var e = new RegExp('\\$(.[^\\$]+)$'),
		    matches = e.exec(property);

		if (matches) return matches[1];
	};

	/*
	 * Translates a value of an unstructured date property
	 */
	var translateDateValue = function (date, type) {
	  switch (type) {
	    case 'tms':
	      return SnowPlow.toTimestamp(date, true);
	    case 'ts':
	      return SnowPlow.toTimestamp(date, false);
	    case 'dt':
	      return SnowPlow.toDatestamp(date);
	    default:
	      return date;
	  }
	};

	/*
	 * Add type suffixes as needed to JSON properties
	 */
	var appendTypes = (function() {

		function recurse(json) {
			var translated = {};
			for (var prop in json) {
				var key = prop, value = json[prop];

				// Special treatment...
				if (json.hasOwnProperty(key)) {

					// ... for JavaScript Dates
					if (SnowPlow.isDate(value)) {
						type = getPropertySuffix(key);
						if (!type) {
							type = 'tms';
							key += '$' + type;
						}
						value = translateDateValue(value, type);
					}

					// ... for JSON objects
					if (SnowPlow.isJson(value)) {
						value = recurse(value);
					}

					// TODO: should think about Arrays of Dates too
				}

				translated[key] = value;
			}
			return translated;
		}
		return recurse;
	})();

	var add = function (key, value) {
		addNvPair(key, value, true);
	};

	var addRaw = function (key, value) {
		addNvPair(key, value, false);
	};

	var addJson = function (keyIfEncoded, keyIfNotEncoded, json) {
		
		if (SnowPlow.isNonEmptyJson(json)) {
			var typed = appendTypes(json);
			var str = JSON2.stringify(typed);

			if (base64Encode) {
				addRaw(keyIfEncoded, SnowPlow.base64urlencode(str));
			} else {
				add(keyIfNotEncoded, str);
			}
		}
	};

	return {
		add: add,
		addRaw: addRaw,
		addJson: addJson,
		build: function() {
			return str;
		}
	};
}
