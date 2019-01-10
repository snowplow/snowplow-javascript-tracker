/*
 * JavaScript tracker for Snowplow: snowplow.js
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

import { addEventListener } from './lib/Utilities'
import InQueueManager from './lib/InQueueManager'
import JavascriptTracker from './lib/JavascriptTracker'
import { version } from '../package.json'
class SnowplowTracker {
    constructor(asynchronousQueue, functionName) {

        /************************************************************
         * Private methods
         ************************************************************/

        this.documentAlias = document
        this.windowAlias = window
        /* Tracker identifier with version */
        this.version = `js-${version}` // Update banner.js too
        /* Contains four variables that are shared with tracker.js and must be passed by reference */
        this.mutSnowplowState = {
            /* List of request queues - one per Tracker instance */
            outQueues: [],
            bufferFlushers: [],

            /* Time at which to stop blocking excecution */
            expireDateTime: null,

            /* DOM Ready */
            hasLoaded: false,
            registeredOnLoadHandlers: [],

            /* pageViewId, which can changed by other trackers on page;
             * initialized by tracker sent first event */
            pageViewId: null,
        }

        /*
         * Handle beforeunload event
         *
         * Subject to Safari's "Runaway JavaScript Timer" and
         * Chrome V8 extension that terminates JS that exhibits
         * "slow unload", i.e., calling getTime() > 1000 times
         */
        const beforeUnloadHandler = () => {
            var now

            // Flush all POST queues
            this.mutSnowplowState.bufferFlushers.forEach(function(flusher) {
                flusher()
            })

            /*
             * Delay/pause (blocks UI)
             */
            if (this.mutSnowplowState.expireDateTime) {
                // the things we do for backwards compatibility...
                // in ECMA-262 5th ed., we could simply use:
                //     while (Date.now() < mutSnowplowState.expireDateTime) { }
                do {
                    now = new Date()
                    if (
                        this.mutSnowplowState.outQueues.filter(function(
                            queue
                        ) {
                            return queue.length > 0
                        }).length === 0
                    ) {
                        break
                    }
                } while (now.getTime() < this.mutSnowplowState.expireDateTime)
            }
        }

        /*
         * Handler for onload event
         */
        const loadHandler = () => {
            var i

            if (!this.mutSnowplowState.hasLoaded) {
                this.mutSnowplowState.hasLoaded = true
                for (
                    i = 0;
                    i < this.mutSnowplowState.registeredOnLoadHandlers.length;
                    i++
                ) {
                    this.mutSnowplowState.registeredOnLoadHandlers[i]()
                }
            }
            return true
        }

        /*
         * Add onload or DOM ready handler
         */
        const addReadyListener = ()=>{
            var _timer

            if (this.documentAlias.addEventListener) {
                addEventListener(
                    this.documentAlias,
                    'DOMContentLoaded',
                    function ready() {
                        this.documentAlias.removeEventListener(
                            'DOMContentLoaded',
                            ready,
                            false
                        )
                        loadHandler()
                    }
                )
            } else if (this.documentAlias.attachEvent) {
                this.documentAlias.attachEvent(
                    'onreadystatechange',
                    function ready() {
                        if (this.documentAlias.readyState === 'complete') {
                            this.documentAlias.detachEvent(
                                'onreadystatechange',
                                ready
                            )
                            loadHandler()
                        }
                    }
                )

                if (
                    this.documentAlias.documentElement.doScroll &&
                    this.windowAlias === this.windowAlias.top
                ) {
                    (function ready() {
                        if (!this.mutSnowplowState.hasLoaded) {
                            try {
                                this.documentAlias.documentElement.doScroll('left')
                            } catch (error) {
                                setTimeout(ready, 0)
                                return
                            }
                            loadHandler()
                        }
                    })()
                }
            }

            // sniff for older WebKit versions
            if (new RegExp('WebKit').test(navigator.userAgent)) {
                _timer = setInterval(()=> {
                    if (
                        this.mutSnowplowState.hasLoaded ||
                        /loaded|complete/.test(this.documentAlias.readyState)
                    ) {
                        clearInterval(_timer)
                        loadHandler()
                    }
                }, 10)
            }

            // fallback
            addEventListener(this.windowAlias, 'load', loadHandler, false)
        }

        /************************************************************
         * Public data and methods
         ************************************************************/


        this.windowAlias.Snowplow = {
            /**
             * Returns a Tracker object, configured with a
             * CloudFront collector.
             *
             * @param string distSubdomain The subdomain on your CloudFront collector's distribution
             */
            getTrackerCf: function(distSubdomain) {
                var t = new JavascriptTracker(
                    functionName,
                    '',
                    this.version,
                    this. mutSnowplowState,
                    {}
                )
                t.setCollectorCf(distSubdomain)
                return t
            },

            /**
             * Returns a Tracker object, configured with the
             * URL to the collector to use.
             *
             * @param string rawUrl The collector URL minus protocol and /i
             */
            getTrackerUrl: function(rawUrl) {
                var t = new JavascriptTracker(
                    functionName,
                    '',
                    this.version,
                    this.mutSnowplowState,
                    {}
                )
                t.setCollectorUrl(rawUrl)
                return t
            },

            /**
             * Get internal asynchronous tracker object
             *
             * @return Tracker
             */
            getAsyncTracker: function() {
                return new JavascriptTracker(
                    functionName,
                    '',
                    this.version,
                    this.mutSnowplowState,
                    {}
                )
            },
        }

        // initialize the Snowplow singleton
        addEventListener(
            this.windowAlias,
            'beforeunload',
            beforeUnloadHandler,
            false
        )
        addReadyListener()

        // Now replace initialization array with queue manager object
        return new InQueueManager(
            JavascriptTracker,
            this.version,
            this.mutSnowplowState,
            asynchronousQueue,
            functionName
        )

    }
}

export default SnowplowTracker
