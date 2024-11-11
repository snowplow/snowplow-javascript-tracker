import {
  startMediaTracking,
  trackMediaPlay,
  trackMediaPause,
  trackMediaEnd,
  trackMediaSeekEnd,
  trackMediaPlaybackRateChange,
  trackMediaVolumeChange,
  trackMediaFullscreenChange,
  trackMediaPictureInPictureChange,
  trackMediaBufferStart,
  trackMediaBufferEnd,
  trackMediaError,
  updateMediaTracking,
  trackMediaReady,
} from '@snowplow/browser-plugin-media';
import { MediaPlayerUpdate, MediaType } from '@snowplow/browser-plugin-media/src/types';
import { ElementConfig } from './config';
import { getDuration, isFullScreen, isHtmlVideoElement, parseVolume } from './helperFunctions';
import { buildHTMLMediaElementEntity, buildHTMLVideoElementEntity } from './entities';
import { SelfDescribingJson } from '@snowplow/tracker-core';

type CommonMediaPlayerUpdate = Omit<MediaPlayerUpdate, 'fullscreen' | 'pictureInPicture' | 'quality'>;
type VideoMediaPlayerUpdate = Pick<MediaPlayerUpdate, 'fullscreen' | 'pictureInPicture'>;

function updatePlayer(el: HTMLMediaElement): MediaPlayerUpdate {
  const common: CommonMediaPlayerUpdate = {
    currentTime: el.currentTime || 0,
    duration: getDuration(el),
    ended: el.ended,
    livestream: el.duration === Infinity,
    loop: el.loop,
    mediaType: isHtmlVideoElement(el) ? MediaType.Video : MediaType.Audio,
    muted: el.muted,
    paused: el.paused,
    volume: parseVolume(el.volume),
    playbackRate: el.playbackRate,
  };

  const video: VideoMediaPlayerUpdate =
    el instanceof HTMLVideoElement
      ? {
          fullscreen: isFullScreen(el),
          pictureInPicture: document.pictureInPictureElement === el,
        }
      : {};

  return { ...common, ...video };
}

function htmlContext(el: HTMLMediaElement): (() => SelfDescribingJson)[] {
  const context = [() => buildHTMLMediaElementEntity(el)];

  if (el instanceof HTMLVideoElement) {
    context.push(() => buildHTMLVideoElementEntity(el));
  }

  return context;
}

export function setUpListeners(config: ElementConfig) {
  const { id, video, label } = config;

  startMediaTracking({
    ...config,
    id,
    player: {
      label,
      ...updatePlayer(video)
    },
    context: (config.context ?? []).concat(htmlContext(video)),
  });

  // If metadata is already loaded, we can track the ready event immediately
  if (video.readyState > 0) {
    trackMediaReady({ id, player: updatePlayer(video) });
  } else {
    video.addEventListener('loadedmetadata', () => {
      trackMediaReady({ id, player: updatePlayer(video) });
    });
  }

  addVideoEventListeners(video, id);
}

function addVideoEventListeners(video: HTMLMediaElement, id: string) {
  let isWaiting = false;

  video.addEventListener('play', () => trackMediaPlay({ id, player: updatePlayer(video) }));

  video.addEventListener('pause', () => trackMediaPause({ id, player: updatePlayer(video) }));

  video.addEventListener('ended', () => trackMediaEnd({ id, player: updatePlayer(video) }));

  video.addEventListener('seeked', () => trackMediaSeekEnd({ id, player: updatePlayer(video) }));

  video.addEventListener('ratechange', () =>
    trackMediaPlaybackRateChange({ id, player: updatePlayer(video), newRate: video.playbackRate })
  );

  video.addEventListener('volumechange', () => {
    trackMediaVolumeChange({ id, player: updatePlayer(video), newVolume: parseVolume(video.volume) });
  });

  video.addEventListener('fullscreenchange', () => {
    trackMediaFullscreenChange({
      id,
      player: updatePlayer(video),
      fullscreen: document.fullscreenElement === video,
    });
  });

  video.addEventListener('enterpictureinpicture', () => {
    trackMediaPictureInPictureChange({
      id,
      player: updatePlayer(video),
      pictureInPicture: true,
    });
  });

  video.addEventListener('leavepictureinpicture', () => {
    trackMediaPictureInPictureChange({
      id,
      player: updatePlayer(video),
      pictureInPicture: false,
    });
  });

  video.addEventListener('waiting', () => {
    trackMediaBufferStart({ id, player: updatePlayer(video) });
    isWaiting = true;
  });

  // `playing` is also triggered by playing the video after pausing,
  // so we need to check if the video was waiting before tracking the buffer
  video.addEventListener('playing', () => {
    if (isWaiting) {
      trackMediaBufferEnd({ id, player: updatePlayer(video) });
      isWaiting = false;
    }
  });

  video.addEventListener('error', () => {
    trackMediaError({ id, player: updatePlayer(video) });
  });

  video.addEventListener('timeupdate', () => {
    updateMediaTracking({ id, player: updatePlayer(video) });
  });
}
