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

/**
 * Use this function to load Snowplow
 *
 * @param object - p The window
 * @param object - l The document
 * @param string - o "script", the tag name of script elements
 * @param string - w The source of the Snowplow script. Make sure you get the latest version.
 * @param string - i The Snowplow namespace. The Snowplow user should set this.
 * @param undefined - n The new script (to be created inside the function)
 * @param undefined - g The first script on the page (to be found inside the function)
 */
;(function(p,l,o,w,i,n,g) {
	"p:nomunge, l:nomunge, o:nomunge, w:nomunge, i:nomunge, n:nomunge, g:nomunge";

	// Stop if the Snowplow namespace i already exists
	if (!p[i]) { 
	
		// Initialise the 'FliptoFliptoFliptoFliptoGlobalSnowplowNamespace' array
		p['FliptoFliptoFliptoFliptoGlobalSnowplowNamespace'] = p['FliptoFliptoFliptoFliptoGlobalSnowplowNamespace'] || [];
	
		// Add the new Snowplow namespace to the global array so sp.js can find it
		p['FliptoFliptoFliptoFliptoGlobalSnowplowNamespace'].push(i);
	
		// Create the Snowplow function
		p[i] = function() {
			(p[i].q = p[i].q || []).push(arguments);
		};
	
		// Initialise the asynchronous queue
		p[i].q = p[i].q || [];

		// Create a new script element
		n = l.createElement(o);
	
		// Get the first script on the page
		g = l.getElementsByTagName(o)[0];
	
		// The new script should load asynchronously
		n.async = 1;
	
		// Load Snowplow
		n.src = w;
	
		// Insert the Snowplow script before every other script so it executes as soon as possible
		g.parentNode.insertBefore(n,g);
	}
} (window, document, 'script', '//{{url}}/sp.js', 'new_name_here'));
