import { SnowplowMediaEvent } from './snowplowEvents';
import { EventGroup } from './types';
import { DocumentEvent, MediaEvent, TextTrackEvent, VideoEvent } from './mediaEvents';
import { enumValues } from './helperFunctions';

const MediaEvents: EventGroup = enumValues(MediaEvent);
const SnowplowEvents: EventGroup = enumValues(SnowplowMediaEvent);

export const AllEvents: EventGroup = MediaEvents.concat(SnowplowEvents);

export const DefaultEvents: EventGroup = [
  MediaEvent.PAUSE,
  MediaEvent.PLAY,
  MediaEvent.SEEKED,
  MediaEvent.RATECHANGE,
  MediaEvent.VOLUMECHANGE,
  TextTrackEvent.CHANGE,
  DocumentEvent.FULLSCREENCHANGE,
  VideoEvent.ENTERPICTUREINPICTURE,
  VideoEvent.LEAVEPICTUREINPICTURE,
];
