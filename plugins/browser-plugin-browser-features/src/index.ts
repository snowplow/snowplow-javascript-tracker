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

import { isFunction, BrowserPlugin, BrowserTracker } from '@snowplow/browser-tracker-core';

declare global {
  interface MimeTypeArray {
    [index: string]: MimeType;
  }
}

const windowAlias = window,
  navigatorAlias = navigator,
  pluginMap: Record<string, string> = {
    // document types
    pdf: 'application/pdf',

    // media players
    qt: 'video/quicktime',
    realp: 'audio/x-pn-realaudio-plugin',
    wma: 'application/x-mplayer2',

    // interactive multimedia
    dir: 'application/x-director',
    fla: 'application/x-shockwave-flash',

    // RIA
    java: 'application/x-java-vm',
    gears: 'application/x-googlegears',
    ag: 'application/x-silverlight',
  };

export const BrowserFeaturesPlugin = (): BrowserPlugin => {
  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      // General plugin detection
      if (navigatorAlias.mimeTypes && navigatorAlias.mimeTypes.length) {
        for (const i in pluginMap) {
          if (Object.prototype.hasOwnProperty.call(pluginMap, i)) {
            let mimeType = navigatorAlias.mimeTypes[pluginMap[i]];
            if (mimeType) {
              tracker.core.addPayloadPair('f_' + i, mimeType.enabledPlugin ? '1' : '0');
            }
          }
        }
      }

      // Safari and Opera
      // IE6/IE7 navigator.javaEnabled can't be aliased, so test directly
      if (navigatorAlias.javaEnabled && navigatorAlias.javaEnabled()) {
        tracker.core.addPayloadPair('f_java', '1');
      }

      // Firefox
      if (isFunction((windowAlias as any).GearsFactory)) {
        tracker.core.addPayloadPair('f_gears', '1');
      }
    },
  };
};
