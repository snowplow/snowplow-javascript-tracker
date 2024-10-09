import { SelfDescribingJson } from '@snowplow/tracker-core';
import { BrowserPlugin, cookie } from '@snowplow/browser-tracker-core';
import { GA4Cookies, GA4SessionCookies, UACookies } from './types';
import { GOOGLE_ANALYTICS_4_COOKIES_SCHEMA, UNIVERSAL_ANALYTICS_COOKIES_SCHEMA } from './schemata';

interface GACookiesPluginOptions {
  ua?: boolean;
  ga4?: boolean;
  ga4MeasurementId?: string | string[];
  cookiePrefix?: string | string[];
}

const defaultPluginOptions: GACookiesPluginOptions = {
  ua: false,
  ga4: true,
  ga4MeasurementId: '',
  cookiePrefix: [],
};

/**
 * Captures the GA cookies on a page and sends as context on each event
 * @param pluginOptions.ua - Send Universal Analytics specific cookie values.
 * @param pluginOptions.ga4 - Send Google Analytics 4 specific cookie values.
 * @param pluginOptions.ga4MeasurementId - Measurement id/ids to search the Google Analytics 4 session cookie. Can be a single measurement id as a string or an array of measurement id strings. The cookie has the form of _ga_<container-id> where <container-id> is the data stream container id.
 * @param pluginOptions.cookiePrefix - Cookie prefix set on the Google Analytics 4 cookies using the cookie_prefix option of the gtag.js tracker.
 */
export function GaCookiesPlugin(pluginOptions: GACookiesPluginOptions = defaultPluginOptions): BrowserPlugin {
  return {
    contexts: () => {
      const contexts: SelfDescribingJson<Record<string, unknown>>[] = [];
      const { ga4, ga4MeasurementId, ua, cookiePrefix } = { ...defaultPluginOptions, ...pluginOptions };
      const GA_USER_COOKIE = '_ga';
      const GA4_MEASUREMENT_ID_PREFIX = 'G-';
      const GA4_COOKIE_PREFIX = '_ga_';

      if (ua) {
        const uaCookiesContext: SelfDescribingJson<UACookies> = {
          schema: UNIVERSAL_ANALYTICS_COOKIES_SCHEMA,
          data: {},
        };
        ['__utma', '__utmb', '__utmc', '__utmv', '__utmz', GA_USER_COOKIE].forEach(function (cookieType) {
          var value = cookie(cookieType);
          if (value) {
            uaCookiesContext.data[cookieType] = value;
          }
        });
        contexts.push(uaCookiesContext);
      }

      if (ga4) {
        const cookiePrefixes = Array.isArray(cookiePrefix) ? [...cookiePrefix] : [cookiePrefix];

        /* We also will search for the default (no prefix) in every case. */
        cookiePrefixes.unshift('');
        cookiePrefixes.forEach((prefix) => {
          const userCookie = cookie(prefix + GA_USER_COOKIE);
          const sessionCookies: GA4SessionCookies[] = [];
          if (ga4MeasurementId) {
            const measurementIdentifiers = Array.isArray(ga4MeasurementId) ? [...ga4MeasurementId] : [ga4MeasurementId];

            measurementIdentifiers.forEach(function (cookieIdentifier) {
              const sessionCookieValue = cookie(
                prefix + cookieIdentifier.replace(GA4_MEASUREMENT_ID_PREFIX, GA4_COOKIE_PREFIX)
              );
              if (sessionCookieValue) {
                sessionCookies.push({
                  measurement_id: cookieIdentifier,
                  session_cookie: sessionCookieValue,
                });
              }
            });
          }

          if (!userCookie && !sessionCookies.length) {
            return;
          }

          const ga4CookiesContext: SelfDescribingJson<GA4Cookies> = {
            schema: GOOGLE_ANALYTICS_4_COOKIES_SCHEMA,
            data: {
              _ga: userCookie,
              session_cookies: sessionCookies.length ? sessionCookies : undefined,
              cookie_prefix: prefix || undefined,
            },
          };

          contexts.push(ga4CookiesContext);
        });
      }

      return contexts;
    },
  };
}
