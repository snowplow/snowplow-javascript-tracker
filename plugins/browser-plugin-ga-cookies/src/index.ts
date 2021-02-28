import { SelfDescribingJson } from '@snowplow/tracker-core';
import { BrowserPlugin, cookie } from '@snowplow/browser-core';
import { Cookies } from './contexts';

const GaCookiesPlugin = (): BrowserPlugin => {
  return {
    contexts: () => {
      const gaCookieData: SelfDescribingJson<Cookies> = {
        schema: 'iglu:com.google.analytics/cookies/jsonschema/1-0-0',
        data: {},
      };
      ['__utma', '__utmb', '__utmc', '__utmv', '__utmz', '_ga'].forEach(function (cookieType) {
        var value = cookie(cookieType);
        if (value) {
          gaCookieData.data[cookieType] = value;
        }
      });
      return [gaCookieData];
    },
  };
};

export { GaCookiesPlugin };
