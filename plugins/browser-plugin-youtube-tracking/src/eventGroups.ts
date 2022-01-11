import { SnowplowEvent } from './snowplowEvents';
import { EventGroup } from './types';
import { YTPlayerEvent, YTState } from './constants';
import { YTEvent } from './youtubeEvents';

export const AllEvents: EventGroup = [
  ...Object.keys(YTEvent).map((k: string) => YTEvent[k as keyof typeof YTEvent]),
  ...Object.keys(SnowplowEvent).map((k: string) => SnowplowEvent[k as keyof typeof SnowplowEvent]),
  ...Object.keys(YTState).map((k: string) => YTState[k as keyof typeof YTState]),
];

export const DefaultEvents: EventGroup = [
  YTState.PAUSED,
  YTState.PLAYING,
  YTState.ENDED,
  SnowplowEvent.SEEK,
  SnowplowEvent.VOLUMECHANGE,
  YTPlayerEvent.ONPLAYBACKQUALITYCHANGE,
  YTPlayerEvent.ONPLAYBACKRATECHANGE,
  SnowplowEvent.PERCENTPROGRESS,
];

export const EventGroups: Record<string, EventGroup> = {
  AllEvents: AllEvents,
  DefaultEvents: DefaultEvents,
};
