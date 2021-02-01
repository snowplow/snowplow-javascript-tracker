import { isFunction } from '@snowplow/browser-core';
import { Core, Plugin } from '@snowplow/tracker-core';
import isUndefined from 'lodash/isUndefined';

declare global {
  interface MimeTypeArray {
    [index: string]: MimeType;
  }
}

const windowAlias = window,
  navigatorAlias = navigator;

export const BrowserFeaturesPlugin = (): Plugin => {
  return {
    coreInit: (core: Core) => {
      let mimeType,
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

      // General plugin detection
      if (navigatorAlias.mimeTypes && navigatorAlias.mimeTypes.length) {
        for (const i in pluginMap) {
          if (Object.prototype.hasOwnProperty.call(pluginMap, i)) {
            mimeType = navigatorAlias.mimeTypes[pluginMap[i]];
            if (mimeType) {
              core.addPayloadPair('f_' + i, mimeType.enabledPlugin ? '1' : '0');
            }
          }
        }
      }

      // Safari and Opera
      // IE6/IE7 navigator.javaEnabled can't be aliased, so test directly
      if (
        navigatorAlias.constructor === window.Navigator &&
        !isUndefined(navigatorAlias.javaEnabled) &&
        navigatorAlias.javaEnabled()
      ) {
        core.addPayloadPair('f_java', '1');
      }

      // Firefox
      if (isFunction((windowAlias as any).GearsFactory)) {
        core.addPayloadPair('f_gears', '1');
      }
    },
  };
};
