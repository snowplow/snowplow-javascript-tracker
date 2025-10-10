'use strict';

import { buildSelfDescribingEvent, payloadBuilder } from '@snowplow/tracker-core';
import { getAllTrackerCores, getAllTrackers, getTracker, getTrackerCore } from './tracker';
import type {
  ScreenViewProps,
  SelfDescribing,
  StructuredProps,
  ReactNativeTracker,
  TrackerCore,
  PayloadBuilder,
  Payload,
  WebViewMessageHandler,
} from './types';

/**
 * Internal event type for events with payload properties tracked using the WebView tracker.
 */
interface WebViewEvent {
  selfDescribingEventData?: SelfDescribing;
  eventName?: string;
  trackerVersion?: string;
  useragent?: string;
  pageUrl?: string;
  pageTitle?: string;
  referrer?: string;
  category?: string;
  action?: string;
  label?: string;
  property?: string;
  value?: number;
  pingXOffsetMin?: number;
  pingXOffsetMax?: number;
  pingYOffsetMin?: number;
  pingYOffsetMax?: number;
}

/**
 * Internal event type for page views tracked using the WebView tracker.
 */
interface WebViewPageViewEvent {
  title?: string | null;
  url?: string;
  referrer?: string;
}

/**
 * Internal type exchanged in messages received from the WebView tracker in Web views through the web view callback.
 */
type WebViewMessage = {
  command: 'trackSelfDescribingEvent' | 'trackStructEvent' | 'trackPageView' | 'trackScreenView' | 'trackWebViewEvent';
  event: StructuredProps | SelfDescribing | ScreenViewProps | WebViewPageViewEvent | WebViewEvent;
  context?: Array<SelfDescribing> | null;
  trackers?: Array<string>;
};

function forEachTracker(trackers: Array<string> | undefined, iterator: (tracker: ReactNativeTracker) => void): void {
  if (trackers && trackers.length > 0) {
    trackers
      .map(getTracker)
      .filter((t) => t !== undefined)
      .map((t) => t!)
      .forEach(iterator);
  } else {
    getAllTrackers().forEach(iterator);
  }
}

function forEachTrackerCore(trackers: Array<string> | undefined, iterator: (tracker: TrackerCore) => void): void {
  if (trackers && trackers.length > 0) {
    trackers
      .map(getTrackerCore)
      .filter((t) => t !== undefined)
      .map((t) => t!)
      .forEach(iterator);
  } else {
    getAllTrackerCores().forEach(iterator);
  }
}

/**
 * Wrapper around the PayloadBuilder that disables overriding property values.
 * This is to prevent the tracker overriding values like tracker version set in the WebView.
 */
function webViewPayloadBuilder(pb: PayloadBuilder): PayloadBuilder {
  const addedKeys = new Set<string>();

  const add = (key: string, value: unknown): void => {
    if (!addedKeys.has(key)) {
      addedKeys.add(key);
      pb.add(key, value);
    }
  };

  const addDict = (dict: Payload): void => {
    for (const key in dict) {
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        add(key, dict[key]);
      }
    }
  };

  return {
    ...pb,
    add,
    addDict,
  };
}

/**
 * Enables tracking events from apps rendered in react-native-webview components.
 * The apps need to use the Snowplow WebView tracker to track the events.
 *
 * To subscribe for the events, use as the `onMessage` prop for a `WebView` component.
 *
 * @returns Callback to subscribe for events from Web views tracked using the Snowplow WebView tracker.
 */
export function getWebViewCallback(): WebViewMessageHandler {
  return (message) => {
    const data = JSON.parse(message.nativeEvent.data) as WebViewMessage;
    switch (data.command) {
      case 'trackSelfDescribingEvent':
        forEachTracker(data.trackers, (tracker) => {
          tracker.trackSelfDescribingEvent(data.event as SelfDescribing, data.context || []);
        });
        break;

      case 'trackStructEvent':
        forEachTracker(data.trackers, (tracker) => {
          tracker.trackStructuredEvent(data.event as StructuredProps, data.context || []);
        });
        break;

      case 'trackPageView':
        forEachTracker(data.trackers, (tracker) => {
          const event = data.event as WebViewPageViewEvent;
          tracker.trackPageViewEvent({
            pageTitle: event.title,
            pageUrl: event.url,
            referrer: event.referrer,
          });
        });
        break;

      case 'trackScreenView':
        forEachTracker(data.trackers, (tracker) => {
          tracker.trackScreenViewEvent(data.event as ScreenViewProps, data.context || []);
        });
        break;

      case 'trackWebViewEvent':
        forEachTrackerCore(data.trackers, (tracker) => {
          const event = data.event as WebViewEvent;
          let pb: PayloadBuilder;
          if (event.selfDescribingEventData) {
            pb = buildSelfDescribingEvent({ event: event.selfDescribingEventData });
          } else {
            pb = payloadBuilder();
          }
          pb = webViewPayloadBuilder(pb);

          if (event.eventName !== undefined) {
            pb.add('e', event.eventName);
          }
          if (event.action !== undefined) {
            pb.add('se_ac', event.action);
          }
          if (event.category !== undefined) {
            pb.add('se_ca', event.category);
          }
          if (event.label !== undefined) {
            pb.add('se_la', event.label);
          }
          if (event.property !== undefined) {
            pb.add('se_pr', event.property);
          }
          if (event.value !== undefined) {
            pb.add('se_va', event.value.toString());
          }
          if (event.pageUrl !== undefined) {
            pb.add('url', event.pageUrl);
          }
          if (event.pageTitle !== undefined) {
            pb.add('page', event.pageTitle);
          }
          if (event.referrer !== undefined) {
            pb.add('refr', event.referrer);
          }
          if (event.pingXOffsetMin !== undefined) {
            pb.add('pp_mix', event.pingXOffsetMin.toString());
          }
          if (event.pingXOffsetMax !== undefined) {
            pb.add('pp_max', event.pingXOffsetMax.toString());
          }
          if (event.pingYOffsetMin !== undefined) {
            pb.add('pp_miy', event.pingYOffsetMin.toString());
          }
          if (event.pingYOffsetMax !== undefined) {
            pb.add('pp_may', event.pingYOffsetMax.toString());
          }
          if (event.trackerVersion !== undefined) {
            pb.add('tv', event.trackerVersion);
          }
          if (event.useragent !== undefined) {
            pb.add('ua', event.useragent);
          }
          tracker.track(pb, data.context || []);
        });
        break;

      default:
        console.warn(`Unknown command from WebView: ${data.command}`);
    }
  };
}
