import { BrowserPlugin, BrowserTracker, Payload } from '@snowplow/browser-tracker-core';
import { hasMobileInterface, trackWebViewEvent } from '@snowplow/webview-tracker';
import { Logger, SelfDescribingEvent, SelfDescribingJson } from '@snowplow/tracker-core';

const _trackers: Record<string, BrowserTracker> = {};

export function WebViewPlugin(): BrowserPlugin {
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
          useragent: payload.ua as string,
          url: payload.url as string,
          title: payload.page as string,
          referrer: payload.refr as string,
          category: payload.se_ca as string,
          action: payload.se_ac as string,
          label: payload.se_la as string,
          property: payload.se_pr as string,
          value: payload.se_va as number,
          minXOffset: payload.pp_mix as number,
          maxXOffset: payload.pp_max as number,
          minYOffset: payload.pp_miy as number,
          maxYOffset: payload.pp_may as number,
        };
        let event = getSelfDescribingEventData(payload);
        let entities = getEntities(payload);
        let trackers: Array<string> = Object.keys(_trackers);

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
    return JSON.parse(payload.ue_px as string);
  }
  return undefined;
}

function getEntities(payload: Payload): SelfDescribingJson[] {
  if (payload.co) {
    return JSON.parse(payload.co as string)['data'];
  } else if (payload.cx) {
    return JSON.parse(payload.cx as string)['data'];
  }
  return [];
}
