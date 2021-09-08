import { SnowplowMediaEvent } from './snowplowEvents';
import { EventGroup } from './types';
import { DocumentEvent, MediaEvent, TextTrackEvent, VideoEvent } from './wgEvents';

export const AllEvents: any[] = Object.values(MediaEvent);
for (let e of Object.values(SnowplowMediaEvent)) {
  AllEvents.push(e);
}

export const ControlEvents: EventGroup = [
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
