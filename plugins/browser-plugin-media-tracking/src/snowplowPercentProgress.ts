import { mediaPlayerEvent } from '.';
import { MediaEvent } from './mediaEvents';
import { MediaProperty } from './mediaProperties';
import { SnowplowMediaEvent } from './snowplowEvents';
import { MediaConf, MediaEventType } from './types';

export function progressHandler(e: MediaEventType, el: HTMLMediaElement, conf: MediaConf) {
  if (e === MediaEvent.PAUSE) {
    while (conf.percentTimeoutIds.length) {
      clearTimeout(conf.percentTimeoutIds.pop());
    }
  }

  if (e === MediaEvent.PLAY && el[MediaProperty.READYSTATE] > 0) {
    setPercentageBoundTimeouts(el, conf);
  }
}

export function setPercentageBoundTimeouts(el: HTMLMediaElement, conf: MediaConf) {
  for (let p of conf.percentBoundries) {
    let percentTime = el[MediaProperty.DURATION] * 1000 * (p / 100);
    if (el[MediaProperty.CURRENTTIME] === 0) {
      percentTime -= el[MediaProperty.CURRENTTIME] * 1000;
    }
    if (p < percentTime) {
      conf.percentTimeoutIds.push(
        setTimeout(() => waitAnyRemainingTimeAfterTimeout(el, percentTime, p, conf), percentTime)
      );
    }
  }
}

// Setting the timeout callback above as MediaPlayerEvent will result in a discrepency between the setTimeout time and
// the current video time when the event fires of ~100 - 300ms

// The below function waits any required amount of remaining time, to ensure the event is fired as close as possible to the
// appropriate percentage boundry time.

function waitAnyRemainingTimeAfterTimeout(el: HTMLMediaElement, percentTime: number, p: number, conf: MediaConf) {
  if (el[MediaProperty.CURRENTTIME] * 1000 < percentTime) {
    setTimeout(() => waitAnyRemainingTimeAfterTimeout(el, percentTime, p, conf), 10);
  } else {
    mediaPlayerEvent(el, SnowplowMediaEvent.PERCENTPROGRESS, conf, { percentThrough: p });
  }
}
