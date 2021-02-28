import { isFunction, BrowserPlugin, BrowserTracker } from '@snowplow/browser-core';

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
