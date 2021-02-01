import { Plugin, SelfDescribingJson } from '@snowplow/tracker-core';
import { cookie } from '@snowplow/browser-core';
import forEach from 'lodash/forEach';
import { Cookies } from './contexts';

const GaCookiesPlugin = (): Plugin => {
  const gaCookieData: SelfDescribingJson<Cookies> = {
    schema: 'iglu:com.google.analytics/cookies/jsonschema/1-0-0',
    data: {},
  };
  forEach(['__utma', '__utmb', '__utmc', '__utmv', '__utmz', '_ga'], function (cookieType) {
    var value = cookie(cookieType);
    if (value) {
      gaCookieData.data[cookieType] = value;
    }
  });

  return {
    contexts: () => [gaCookieData],
  };
};

export { GaCookiesPlugin };
