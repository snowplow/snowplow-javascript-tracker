import { Plugin } from '@snowplow/tracker-core';
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

const ClientHintsPlugin = (includeHighEntropy: boolean): Plugin => {
  const navigatorAlias = navigator;
  var uaClientHints: HttpClientHints;

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
      return [
        {
          schema: 'iglu:org.ietf/http_client_hints/jsonschema/1-0-0',
          data: uaClientHints,
        },
      ];
    },
  };
};

export { ClientHintsPlugin };
