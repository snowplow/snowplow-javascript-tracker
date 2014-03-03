/*
 * JavaScript tracker for Snowplow: out_queue.js
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
		localStorageAccessible = require('./lib/detectors').localStorageAccessible(),
		object = typeof exports !== 'undefined' ? exports : this, // For eventual node.js environment support

		executingQueue = false,
		imageQueue;

	if (localStorageAccessible) {
		// Catch any JSON parse errors that might be thrown
		try {
			imageQueue = json2.parse(localStorage.getItem('snaqImageQueue'));
		}
		catch(e) {}
	}

	// Initialize to and empty array if we didn't get anything out of localStorage
	if (typeof imageQueue === 'undefined' || imageQueue == null) {
		imageQueue = [];
	}

	/*
	 * Queue an image beacon for submission to the collector.
	 * If we're not processing the queue, we'll start.
	 */
	object.queueImage = function(request, configCollectorUrl) {
		imageQueue.push(request);
		if (localStorageAccessible) {
			localStorage.setItem('snaqImageQueue', json2.stringify(imageQueue));
		}

		if (!executingQueue) {
			executeQueue(configCollectorUrl);
		}
	}

	/*
	 * Run through the queue of image beacons, sending them one at a time.
	 * Stops processing when we run out of queued requests, or we get an error.
	 */
	function executeQueue(configCollectorUrl) {
		if (imageQueue.length < 1) {
			executingQueue = false;
			return;
		}

		executingQueue = true;
		var nextRequest = imageQueue[0];

		/*
		 * Send image request to the Snowplow Collector using GET.
		 * The Collector serves a transparent, single pixel (1x1) GIF
		 */
		var image = new Image(1,1);

		// Let's check that we have a Url to ping
		if (configCollectorUrl === null) {
			throw "No Snowplow collector configured, cannot track";
		}

		// Okay? Let's proceed.
		image.onload = function() {
			// We succeeded, let's remove this request from the queue
			imageQueue.shift();
			if (localStorageAccessible) {
				localStorage.setItem('snaqImageQueue', json2.stringify(imageQueue));
			}
			executeQueue(configCollectorUrl);
		}

		image.onerror = function() {
			executingQueue = false;
		}

		image.src = configCollectorUrl + nextRequest;
	}

}());
