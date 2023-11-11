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

let uaClientHints: HttpClientHints;

/**
 * This function makes sure that the expected array is returned as an array instead of an object.
 * It handles a problem that in some cases the `navigator.userAgentData.brands` was returned as an object instead of array.
 */
function forceArray<T>(array: T[] | Record<string, T>): T[] {
  if (Array.isArray(array)) return array;

  if (Object.prototype.toString.call(array) === '[object Object]') {
    return Object.keys(array).map((e) => {
      return array[e];
    });
  }

  return [];
}

/**
 * Returns the client-hints brands, ensuring no additional properties.
 */
function getBrands(brands: Array<NavigatorUABrandVersion>): Array<NavigatorUABrandVersion> {
  return brands.map((b) => {
    const { brand, version } = b;
    return { brand, version };
  });
}

/**
 * Validates whether userAgentData is compliant to the client-hints interface.
 * https://wicg.github.io/ua-client-hints/#interface
 */
function validClientHints(hints: HttpClientHints): boolean {
  if (!hints || typeof hints.isMobile !== 'boolean' || !Array.isArray(hints.brands)) {
    return false;
  }

  if (
    hints.brands.length === 0 ||
    hints.brands.some((brand) => typeof brand.brand !== 'string' || typeof brand.version !== 'string')
  ) {
    return false;
  }

  return true;
}

/**
 * Attaches Client Hint information where available
 * @param includeHighEntropy - Should high entropy values be included
 */
export function ClientHintsPlugin(includeHighEntropy?: boolean): BrowserPlugin {
  const populateClientHints = () => {
    const navigatorAlias = navigator;
    const uaData = navigatorAlias.userAgentData;

    if (uaData) {
      let candidateHints: HttpClientHints;
      candidateHints = {
        isMobile: uaData.mobile,
        brands: getBrands(forceArray(uaData.brands)),
      };
      if (includeHighEntropy && uaData.getHighEntropyValues) {
        uaData
          .getHighEntropyValues(['platform', 'platformVersion', 'architecture', 'model', 'uaFullVersion'])
          .then((res) => {
            candidateHints.architecture = res.architecture;
            candidateHints.model = res.model;
            candidateHints.platform = res.platform;
            candidateHints.uaFullVersion = res.uaFullVersion;
            candidateHints.platformVersion = res.platformVersion;
          });
      }

      if (validClientHints(candidateHints)) {
        uaClientHints = candidateHints;
      }
    }
  };

  return {
    activateBrowserPlugin: () => {
      if (!uaClientHints) {
        populateClientHints();
      }
    },
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
