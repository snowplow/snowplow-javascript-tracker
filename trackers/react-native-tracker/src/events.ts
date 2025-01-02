import {
  buildPageView,
  buildSelfDescribingEvent,
  buildStructEvent,
  PageViewEvent,
  SelfDescribingJson,
  TrackerCore,
} from '@snowplow/tracker-core';
import { EventContext, MessageNotificationProps, StructuredProps, TimingProps } from './types';

export function newTrackEventFunctions(core: TrackerCore) {
  const trackSelfDescribingEvent = <T extends Record<string, unknown> = Record<string, unknown>>(
    argmap: SelfDescribingJson<T>,
    contexts?: EventContext[]
  ) => {
    core.track(buildSelfDescribingEvent({ event: argmap }), contexts);
  };

  const trackStructuredEvent = (argmap: StructuredProps, contexts?: EventContext[]) => {
    return core.track(buildStructEvent(argmap), contexts)?.eid;
  };

  const trackPageViewEvent = (argmap: PageViewEvent, contexts?: EventContext[]) => {
    return core.track(buildPageView(argmap), contexts)?.eid;
  };

  const trackTimingEvent = (argmap: TimingProps, contexts?: EventContext[]) => {
    trackSelfDescribingEvent(
      {
        schema: 'iglu:com.snowplowanalytics.snowplow/timing/jsonschema/1-0-0',
        data: argmap,
      },
      contexts
    );
  };

  const trackMessageNotificationEvent = (argmap: MessageNotificationProps, contexts?: EventContext[]) => {
    trackSelfDescribingEvent(
      {
        schema: 'iglu:com.snowplowanalytics.mobile/message_notification/jsonschema/1-0-0',
        data: argmap,
      },
      contexts
    );
  };

  return {
    trackSelfDescribingEvent,
    trackStructuredEvent,
    trackPageViewEvent,
    trackTimingEvent,
    trackMessageNotificationEvent,
  };
}
