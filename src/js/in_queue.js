/*
 * JavaScript tracker for Snowplow: queue.js
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
		lodash = require('./lib_managed/lodash'),
		
		object = typeof exports !== 'undefined' ? exports : this; // For eventual node.js environment support

	/************************************************************
	 * Proxy object
	 * - this allows the caller to continue push()'ing to _snaq
	 *   after the Tracker has been initialized and loaded
	 ************************************************************/

	object.InQueueManager = function(TrackerConstructor, version, mutSnowplowState, asyncQueue) {

		var trackerDictionary = {};

		/*
		 * Get an array of trackers to which a function should be applied.
		 *
		 * @param names array List of namespaces to use. If empty, use all namespaces.
		 */
		function getNamedTrackers(names) {
			var namedTrackers = [];

			if (!names || names.length === 0) {
				namedTrackers = lodash.values(trackerDictionary);
			} else {
				for (var i = 0; i < names.length; i++) {
					if (trackerDictionary.hasOwnProperty(names[i])) {
						namedTrackers.push(trackerDictionary[names[i]]);
					} else if (!lodash.isUndefined(console)) {
						console.log('Warning: Tracker namespace "' + names[i] + '" not configured');
					}
				}
			}
			return namedTrackers;
		}

		/*
		 * Legacy support for input of the form _snaq.push(['setCollectorCf', 'd34uzc5hjrimh8'])
		 * 
		 * @param f string Either 'setCollectorCf' or 'setCollectorUrl'
		 * @param endpoint string
		 * @param namespace string Optional tracker name
		 * 
		 * TODO: remove this in 1.2.0
		 */
		function legacyCreateNewNamespace(f, endpoint, namespace) {
			if (!lodash.isUndefined(console)) {
				console.log(f, 'is deprecated.'); //TODO: more instructions for switching
			}

			var name;

			if (lodash.isUndefined(namespace)) {
				name = 'default'    // TODO: make default names work properly
			} else {
				name = namespace;
			}

			createNewNamespace(name);
			trackerDictionary[name][f](endpoint);
		}

		/*
		 * Initiate a new tracker namespace
		 *
		 * @param namespace string
		 * @param endpoint string Of the form d3rkrsqld9gmqf.cloudfront.net
		 */
		function createNewNamespace(namespace, endpoint) {
			trackerDictionary[namespace] = new TrackerConstructor(namespace, version, mutSnowplowState);
			trackerDictionary[namespace].setCollectorUrl(endpoint);
		}

		/*
		 * Output an array of the form ['functionName', [trackerName1, trackerName2, ...]]
		 *
		 * @param inputString String
		 */
		function parseInputString(inputString) {
			var separatedString = inputString.split(':'),
				extractedFunction = separatedString[0],
				extractedNames = (separatedString.length > 1) ? separatedString[1].split(';') : [];

			return [extractedFunction, extractedNames];
		}

		/*
		 * apply wrapper
		 *
		 * @param array parameterArray An array comprising either:
		 *      [ 'methodName', optional_parameters ]
		 * or:
		 *      [ functionObject, optional_parameters ]
		 */
		function applyAsyncFunction() {
			var i, f, parameterArray;

			for (i = 0; i < arguments.length; i += 1) {
				parameterArray = arguments[i];
				f = parameterArray.shift();
				inputString = parameterArray.shift();
				parsedString = parseInputString(inputString);
				f = parsedString[0];
				names = parsedString[1];

				if (f === 'newTracker') {
					createNewNamespace(parameterArray[0], parameterArray[1]);
					continue;
				}

				if ((f === 'setCollectorCf' || f === 'setCollectorUrl') && (!names || names.length === 0)) {
					legacyCreateNewNamespace(f, parameterArray[0], parameterArray[1]);

					continue;
				}

				namedTrackers = getNamedTrackers(names);

				if (lodash.isString(f)) {
					asyncTracker[f].apply(asyncTracker, parameterArray);
				} else {
					f.apply(asyncTracker, parameterArray);
				}
			}
		}

		// We need to manually apply any events collected before this initialization
		for (var i = 0; i < asyncQueue.length; i++) {
			applyAsyncFunction(asyncQueue[i]);
		}

		return {
			push: applyAsyncFunction
		};
	}

}());
