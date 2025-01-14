import { BrowserPlugin, BrowserTracker, Payload } from '@snowplow/browser-tracker-core';
import { hasMobileInterface, trackWebViewEvent } from '@snowplow/webview-tracker';
import { Logger, SelfDescribingEvent, SelfDescribingJson } from '@snowplow/tracker-core';
import { base64urldecode } from './utils';

const _trackers: Record<string, BrowserTracker> = {};

const defaultTrackerNamespaces: string[] = [];

type WebViewPluginOptions = {
  trackerNamespaces?: string[];
};

/**
 * Forwards events to Snowplow mobile trackers running in a WebView.
 * @param configuration - Configuration. Specify certain tracker namespaces to forward events to.
 */
export function WebViewPlugin(configuration?: WebViewPluginOptions): BrowserPlugin {
  let LOG: Logger;

  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      _trackers[tracker.id] = tracker;
    },

    logger: (logger: Logger) => {
      LOG = logger;
    },

    filter: (payload) => {
      if (hasMobileInterface() === true) {
        LOG.debug(`Payload (event ID: ${payload.eid}) was filtered out and forwarded to WebView tracker.`);

        let atomicProperties = {
          eventName: payload.e as string,
          trackerVersion: payload.tv as string,
          useragent: (payload.ua as string) ?? window.navigator.userAgent,
          url: payload.url as string | undefined,
          title: payload.page as string | undefined,
          referrer: payload.refr as string | undefined,
          category: payload.se_ca as string | undefined,
          action: payload.se_ac as string | undefined,
          label: payload.se_la as string | undefined,
          property: payload.se_pr as string | undefined,
          value: payload.se_va !== undefined ? parseFloat(payload.se_va as string) : undefined,
          minXOffset: payload.pp_mix !== undefined ? parseInt(payload.pp_mix as string) : undefined,
          maxXOffset: payload.pp_max !== undefined ? parseInt(payload.pp_max as string) : undefined,
          minYOffset: payload.pp_miy !== undefined ? parseInt(payload.pp_miy as string) : undefined,
          maxYOffset: payload.pp_may !== undefined ? parseInt(payload.pp_may as string) : undefined,
        };
        let event = getSelfDescribingEventData(payload);
        let entities = getEntities(payload);
        let trackers: Array<string> = configuration?.trackerNamespaces
          ? configuration?.trackerNamespaces
          : defaultTrackerNamespaces;

        trackWebViewEvent({ properties: atomicProperties, event: event, context: entities }, trackers);

        return false;
      } else {
        return true;
      }
    },
  };
}

function getSelfDescribingEventData(payload: Payload): SelfDescribingEvent | undefined {
  if (payload.ue_pr) {
    return JSON.parse(payload.ue_pr as string);
  } else if (payload.ue_px) {
    let decoded = base64urldecode(payload.ue_px as string);
    return JSON.parse(decoded);
  }
  return undefined;
}

function getEntities(payload: Payload): SelfDescribingJson[] {
  if (payload.co) {
    return JSON.parse(payload.co as string)['data'];
  } else if (payload.cx) {
    let decoded = base64urldecode(payload.cx as string);
    return JSON.parse(decoded)['data'];
  }
  return [];
}
