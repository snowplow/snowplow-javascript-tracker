/*
 * Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang
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

import { fromQuerystring, getHostName } from './helpers';

/*
 * Extract parameter from URL
 */
function getParameter(url: string, name: string) {
  // scheme : // [username [: password] @] hostname [: port] [/ [path] [? query] [# fragment]]
  var e = new RegExp('^(?:https?|ftp)(?::/*(?:[^?]+))([?][^#]+)'),
    matches = e.exec(url);

  if (matches && matches?.length > 1) {
    return fromQuerystring(name, matches[1]);
  }
  return null;
}

/*
 * Fix-up URL when page rendered from search engine cache or translated page.
 */
export function fixupUrl(hostName: string, href: string, referrer: string) {
  if (hostName === 'translate.googleusercontent.com') {
    // Google
    if (referrer === '') {
      referrer = href;
    }
    href = getParameter(href, 'u') ?? '';
    hostName = getHostName(href);
  } else if (
    hostName === 'cc.bingj.com' || // Bing & Yahoo
    hostName === 'webcache.googleusercontent.com' // Google
  ) {
    href = document.links[0].href;
    hostName = getHostName(href);
  }
  return [hostName, href, referrer];
}
