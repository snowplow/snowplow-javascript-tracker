/*
 * JavaScript tracker for Snowplow: identifiers.js
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

;(function () {

	var object = typeof module.exports != 'undefined' ? module.exports : this; // For eventual node.js environment support

	/*
	 * Is property defined?
	 */
	object.isDefined = function (property) {
		return typeof property !== 'undefined';
	}

	/**
	 * Is property null?
	 */
	object.isNotNull = function (property) {
		return property !== null;
	}

	/*
	 * Is property a function?
	 */
	object.isFunction = function (property) {
		return typeof property === 'function';
	}

	/*
	 * Is property an array?
	 */
	object.isArray = ('isArray' in Array) ? 
		Array.isArray : 
		function (value) {
			return Object.prototype.toString.call(value) === '[object Array]';
		}

	/*
	 * Is property an empty array?
	 */
	object.isEmptyArray = function (property) {
		return object.isArray(property) && property.length < 1;
	}

	/*
	 * Is property an object?
	 *
	 * @return bool Returns true if property is null, an Object, or subclass of Object (i.e., an instanceof String, Date, etc.)
	 */
	object.isObject = function (property) {
		return typeof property === 'object';
	}

	/*
	 * Is property a JSON?
	 */
	object.isJson = function (property) {
		return (object.isDefined(property) && object.isNotNull(property) && property.constructor === {}.constructor);
	}

	/*
	 * Is property a non-empty JSON?
	 */
	object.isNonEmptyJson = function (property) {
		return object.isJson(property) && property !== {};
	}

	/*
	 * Is property a string?
	 */
	object.isString = function (property) {
		return typeof property === 'string' || property instanceof String;
	}

	/*
	 * Is property a non-empty string?
	 */
	object.isNonEmptyString = function (property) {
		return object.isString(property) && property !== '';
	}

	/*
	 * Is property a date?
	 */
	object.isDate = function (property) {
		return Object.prototype.toString.call(property) === "[object Date]";
	}

}());
