import { EventGroup } from './types';
import { DocumentEvent, MediaEvent, SnowplowEvent, TextTrackEvent, VideoEvent } from './mediaEvents';

const enumValues = (enumType: any) => Object.keys(enumType).map((key) => enumType[key]);

export const AllEvents: EventGroup = [
  ...enumValues(MediaEvent),
  ...enumValues(SnowplowEvent),
  ...enumValues(VideoEvent),
  ...enumValues(TextTrackEvent),
  ...enumValues(DocumentEvent),
];

export const DefaultEvents: EventGroup = [
  MediaEvent.PAUSE,
  MediaEvent.PLAY,
  MediaEvent.SEEKED,
  MediaEvent.RATECHANGE,
  MediaEvent.VOLUMECHANGE,
  MediaEvent.ENDED,
  DocumentEvent.FULLSCREENCHANGE,
  SnowplowEvent.PERCENTPROGRESS,
];

export const EventGroups: Record<string, EventGroup> = {
  AllEvents: AllEvents,
  DefaultEvents: DefaultEvents,
};
