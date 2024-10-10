import type { updateMediaTracking } from '@snowplow/browser-plugin-media';
import type { SelfDescribingJson } from '@snowplow/tracker-core';
import { MediaType } from '@snowplow/browser-plugin-media/src/types';

import { TrackingOptions, YouTubeEntity } from './types';

type PlayerStatus = NonNullable<Parameters<typeof updateMediaTracking>[0]['player']>;

const PLAYER_TYPE = 'com.youtube-youtube';

export function buildPlayerEntity(conf: TrackingOptions): PlayerStatus | undefined {
  const player = conf.player;
  if (!player) return;

  return {
    currentTime: player.getCurrentTime(),
    duration: player.getDuration(),
    ended: player.getPlayerState() === YT.PlayerState.ENDED,
    fullscreen: undefined,
    label: conf.config.label,
    livestream: undefined,
    loop: undefined,
    mediaType: MediaType.Video,
    muted: player.isMuted(),
    paused: player.getPlayerState() !== YT.PlayerState.PLAYING,
    pictureInPicture: undefined,
    playbackRate: player.getPlaybackRate(),
    playerType: PLAYER_TYPE,
    quality: player.getPlaybackQuality(),
    volume: player.getVolume(),
  };
}

export function buildYouTubeEntity(conf: TrackingOptions): SelfDescribingJson<YouTubeEntity> | null {
  const { player, urlParameters = {} } = conf;

  if (!player) return null;

  const state = player.getPlayerState();

  let data: YouTubeEntity = {
    autoPlay: urlParameters.autoplay === '1',
    avaliablePlaybackRates: player.getAvailablePlaybackRates(),
    avaliableQualityLevels: player.getAvailableQualityLevels(),
    buffering: state === YT.PlayerState.BUFFERING,
    controls: urlParameters.controls !== '0',
    cued: state === YT.PlayerState.CUED,
    loaded: parseInt(String(player.getVideoLoadedFraction() * 100)),
    playbackQuality: player.getPlaybackQuality(),
    playerId: player.getIframe().id,
    unstarted: state === YT.PlayerState.UNSTARTED,
    url: player.getVideoUrl(),
  };

  const spherical: YT.SphericalProperties = player.getSphericalProperties();
  if (spherical) data = { ...data, ...spherical };

  const playlistIndex = player.getPlaylistIndex();
  if (playlistIndex !== -1) data.playlistIndex = playlistIndex;

  const playlist = player.getPlaylist();
  if (playlist) {
    data.playlist = playlist.map((item: string) => parseInt(item, 10));
  }

  return {
    schema: 'iglu:com.youtube/youtube/jsonschema/1-0-0',
    data,
  };
}
