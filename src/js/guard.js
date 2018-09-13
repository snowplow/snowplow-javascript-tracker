/*
 * JavaScript tracker for Snowplow: tracker.js
 *
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright
 * 2012-2018 Snowplow Analytics Ltd. All rights reserved.
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


var object = typeof exports !== 'undefined' ? exports : this;

object.ManagedError = function(message) {
	Error.prototype.constructor.apply(this, arguments);
	this.message = message;
};

object.ManagedError.prototype = new Error();

function wrap(fn, value) {
	// not all 'function's are actually functions!
	if (typeof value === 'function') {
		return fn(value);
	} else if (typeof value === 'object' && value !== null) {
		for (var key in value) if (value.hasOwnProperty(key)) {
			value[key] = wrap(fn, value[key]);
		}
	}

	return value;
}

function unguard(fn) {
	return function () {
		try {
			return fn.apply(this, arguments);
		} catch (e) {
			// surface the error
			setTimeout(function () {
				throw e;
			}, 0);
		}
	}
}

function guard (fn) {
	return function () {
		// capture the arguments and unguard any functions
		var args = Array.prototype.slice.call(arguments)
			.map(function (arg) {
				return wrap(unguard, arg);
			});

		try {
			return wrap(guard, fn.apply(this, args));
		} catch (e) {
			if (e instanceof object.ManagedError) {
				throw e;
			}
		}
	}
}

exports.productionize = function (value) {
	var methods = {};
	if (typeof value === 'object' && value !== null) {
        Object.getOwnPropertyNames(value).forEach(
            function (val, idx, array) {
                methods[val] = guard(value[val]);
            }
        );
	}
	return methods;
};