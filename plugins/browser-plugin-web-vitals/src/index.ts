import { BrowserPlugin, BrowserTracker, dispatchToTrackersInCollection } from '@snowplow/browser-tracker-core';
import { DynamicContext, buildSelfDescribingEvent, resolveDynamicContext } from '@snowplow/tracker-core';
import { WEB_VITALS_SCHEMA } from './schemata';
import { attachWebVitalsPageListeners, createWebVitalsScript, webVitalsListener } from './utils';

const _trackers: Record<string, BrowserTracker> = {};
const WEB_VITALS_SOURCE = 'https://unpkg.com/web-vitals@4/dist/web-vitals.iife.js';
let listenersAttached = false;

interface WebVitalsPluginOptions {
  loadWebVitalsScript?: boolean;
  webVitalsSource?: string;
  context?: DynamicContext;
}

const defaultPluginOptions = {
  loadWebVitalsScript: true,
  webVitalsSource: WEB_VITALS_SOURCE,
  context: [],
};

/**
 * Adds Web Vitals measurement events
 *
 * @param pluginOptions.loadWebVitalsScript - Should the plugin immediately load the Core Web Vitals measurement script from UNPKG CDN.
 * @param pluginOptions.webVitalsSource - The URL endpoint the Web Vitals script should be loaded from. Defaults to the UNPKG CDN.
 * @remarks
 */
export function WebVitalsPlugin(pluginOptions: WebVitalsPluginOptions = defaultPluginOptions): BrowserPlugin {
  const webVitalsObject: Record<string, unknown> = {};
  const options = { ...defaultPluginOptions, ...pluginOptions };
  let trackerId: string;
  let webVitalsScript: HTMLScriptElement | undefined;
  return {
    activateBrowserPlugin: (tracker) => {
      trackerId = tracker.id;
      _trackers[trackerId] = tracker;

      function sendWebVitals() {
        if (!Object.keys(webVitalsObject).length) {
          return;
        }
        dispatchToTrackersInCollection(Object.keys(_trackers), _trackers, (t) => {
          t.core.track(
            buildSelfDescribingEvent({
              event: {
                schema: WEB_VITALS_SCHEMA,
                data: webVitalsObject,
              },
            }),
            resolveDynamicContext(options.context ?? [], webVitalsObject)
          );
        });
      }

      if (options.loadWebVitalsScript) {
        webVitalsScript = createWebVitalsScript(options.webVitalsSource);
      }

      /*
       * Attach page listeners only once per page.
       * Prevent multiple trackers from attaching listeners multiple times.
       */
      if (!listenersAttached) {
        if (webVitalsScript) {
          webVitalsScript.addEventListener('load', () => webVitalsListener(webVitalsObject));
        } else {
          webVitalsListener(webVitalsObject);
        }
        attachWebVitalsPageListeners(sendWebVitals);
        listenersAttached = true;
      }

      return;
    },
  };
}
