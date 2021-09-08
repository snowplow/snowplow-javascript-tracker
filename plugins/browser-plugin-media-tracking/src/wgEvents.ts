// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#events

enum MediaEvent {
  ABORT = 'abort',
  CANPLAY = 'canplay',
  CANPLAYTHROUGH = 'canplaythrough',
  DURATIONCHANGE = 'durationchange',
  EMPTIED = 'emptied',
  ENDED = 'ended',
  ERROR = 'error',
  LOADEDMETADATA = 'loadedmetadata',
  LOADSTART = 'loadstart',
  PAUSE = 'pause',
  PLAY = 'play',
  PLAYING = 'playing',
  PROGRESS = 'progress',
  RATECHANGE = 'ratechange',
  RESIZE = 'resize',
  SEEKED = 'seeked',
  SEEKING = 'seeking',
  STALLED = 'stalled',
  SUSPEND = 'suspend',
  TIMEUPDATE = 'timeupdate',
  VOLUMECHANGE = 'volumechange',
  WAITING = 'waiting',
}

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement#events

enum VideoEvent {
  ENTERPICTUREINPICTURE = 'enterpictureinpicture',
  LEAVEPICTUREINPICTURE = 'leavepictureinpicture',
}

// https://developer.mozilla.org/en-US/docs/Web/API/TextTrack#events
enum TextTrackEvent {
  CHANGE = 'change',
}

// https://developer.mozilla.org/en-US/docs/Web/API/Document/fullscreenchange_event
enum DocumentEvent {
  FULLSCREENCHANGE = 'fullscreenchange',
}

export { MediaEvent, TextTrackEvent, VideoEvent, DocumentEvent };
