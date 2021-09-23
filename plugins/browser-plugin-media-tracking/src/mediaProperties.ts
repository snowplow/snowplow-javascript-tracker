// https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement

enum VideoProperty {
  AUTOPICTUREINPICTURE = 'autoPictureInPicture',
  DISABLEPICTUREINPICTURE = 'disablePictureInPicture',
  POSTER = 'poster',
  VIDEOHEIGHT = 'videoHeight',
  VIDEOWIDTH = 'videoWidth',
}

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#properties

enum MediaProperty {
  AUTOPLAY = 'autoplay',
  BUFFERED = 'buffered',
  CONTROLS = 'controls',
  CONTROLSLIST = 'controlsList',
  CROSSORIGIN = 'crossOrigin',
  CURRENTSRC = 'currentSrc',
  CURRENTTIME = 'currentTime',
  DEFAULTMUTED = 'defaultMuted',
  DEFAULTPLAYBACKRATE = 'defaultPlaybackRate',
  DISABLEREMOTEPLAYBACK = 'disableRemotePlayback',
  DURATION = 'duration',
  ENDED = 'ended',
  ERROR = 'error',
  LOOP = 'loop',
  MEDIAKEYS = 'mediaKeys',
  MUTED = 'muted',
  NETWORKSTATE = 'networkState',
  PAUSED = 'paused',
  PLAYBACKRATE = 'playbackRate',
  PRELOAD = 'preload',
  READYSTATE = 'readyState',
  SEEKABLE = 'seekable',
  SEEKING = 'seeking',
  SRC = 'src',
  SRCOBJECT = 'srcObject',
  TEXTTRACKS = 'textTracks',
  VIDEOTRACKS = 'videoTracks',
  VOLUME = 'volume',
}

export { MediaProperty, VideoProperty };
