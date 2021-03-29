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

import { BrowserPlugin } from '@snowplow/browser-tracker-core';
import { HttpClientHints } from './contexts';

interface NavigatorUABrandVersion {
  brand: string; // "Google Chrome"
  version: string; // "84"
}

interface UADataValues {
  platform: string; // "PhoneOS"
  platformVersion: string; // "10A"
  architecture: string; // "arm"
  model: string; // "X644GTM"
  uaFullVersion: string; // "73.32.AGX.5"
}

declare global {
  interface Navigator {
    userAgentData: {
      mobile: boolean;
      brands: Array<NavigatorUABrandVersion>;
      getHighEntropyValues: (hints: Array<string>) => Promise<UADataValues>;
    };
  }
}

const navigatorAlias = navigator;

/**
 * Attaches Client Hint information where available
 * @param includeHighEntropy - Should high entropy values be included
 */
export function ClientHintsPlugin(includeHighEntropy?: boolean): BrowserPlugin {
  let uaClientHints: HttpClientHints;

  if (navigatorAlias.userAgentData) {
    uaClientHints = {
      isMobile: navigatorAlias.userAgentData.mobile,
      brands: navigatorAlias.userAgentData.brands,
    };
    if (includeHighEntropy && navigatorAlias.userAgentData.getHighEntropyValues) {
      navigatorAlias.userAgentData
        .getHighEntropyValues(['platform', 'platformVersion', 'architecture', 'model', 'uaFullVersion'])
        .then((res) => {
          uaClientHints.architecture = res.architecture;
          uaClientHints.model = res.model;
          uaClientHints.platform = res.platform;
          uaClientHints.uaFullVersion = res.uaFullVersion;
          uaClientHints.platformVersion = res.platformVersion;
        });
    }
  }

  return {
    contexts: () => {
      if (uaClientHints) {
        return [
          {
            schema: 'iglu:org.ietf/http_client_hints/jsonschema/1-0-0',
            data: uaClientHints,
          },
        ];
      }
      return [];
    },
  };
}
