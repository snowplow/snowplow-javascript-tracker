import { SelfDescribingJson, resolveDynamicContext } from '@snowplow/tracker-core';

import { MediaPlayerEvent, YouTube } from './contexts';
import { SnowplowEvent } from './snowplowEvents';
import { EventData, MediaEntities, SnowplowMediaPlayer, TrackingOptions, UrlParameters } from './types';

export function buildYouTubeEvent(player: YT.Player, eventName: string, conf: TrackingOptions, eventData?: EventData) {
  const data: MediaPlayerEvent | SelfDescribingJson<Record<string, unknown>> = { type: eventName };
  if (conf.hasOwnProperty('label')) data.label = conf.label;

  const context = [
    ...resolveDynamicContext(conf.context),
    getYouTubeEntities(player, conf.urlParameters!, eventData),
    getMediaPlayerEntities(eventName, player, conf.urlParameters!, eventData),
  ];

  return {
    schema: 'iglu:com.snowplowanalytics.snowplow/media_player_event/jsonschema/1-0-0',
    data: data,
    context: context,
  };
}

function getYouTubeEntities(player: YT.Player, urlParameters: UrlParameters, eventData?: EventData): MediaEntities {
  const spherical: YT.SphericalProperties = player.getSphericalProperties();
  const playerStates: Record<number, boolean> = {
    [YT.PlayerState.BUFFERING]: false,
    [YT.PlayerState.CUED]: false,
    [YT.PlayerState.UNSTARTED]: false,
  };

  const state = player.getPlayerState();
  if (state in playerStates) {
    playerStates[state] = true;
  }

  let data: YouTube = {
    autoPlay: urlParameters.autoplay === '1',
    avaliablePlaybackRates: player.getAvailablePlaybackRates(),
    avaliableQualityLevels: player.getAvailableQualityLevels(),
    buffering: playerStates[YT.PlayerState.BUFFERING],
    controls: urlParameters.controls !== '0',
    cued: playerStates[YT.PlayerState.CUED],
    loaded: parseInt(String(player.getVideoLoadedFraction() * 100)),
    playbackQuality: player.getPlaybackQuality(),
    playerId: player.getIframe().id,
    unstarted: playerStates[YT.PlayerState.UNSTARTED],
    url: player.getVideoUrl(),
  };

  if (spherical) data = { ...data, ...spherical };

  if (eventData?.error) data.error = eventData.error as YouTube['error'];

  const playlistIndex = player.getPlaylistIndex();
  if (playlistIndex !== -1) data.playlistIndex = playlistIndex;

  const playlist = player.getPlaylist();
  if (playlist) {
    data.playlist = playlist.map((item: string) => parseInt(item));
  }

  return {
    schema: 'iglu:com.youtube/youtube/jsonschema/1-0-0',
    data: data,
  };
}

function getMediaPlayerEntities(
  e: string,
  player: YT.Player,
  urlParameters: UrlParameters,
  eventData?: EventData
): MediaEntities {
  const playerStates: Record<number, boolean> = {
    [YT.PlayerState.ENDED]: false,
    [YT.PlayerState.PAUSED]: false,
  };

  const state = player.getPlayerState();
  if (state in playerStates) {
    playerStates[state] = true;
  }

  const data: SnowplowMediaPlayer = {
    currentTime: player.getCurrentTime(),
    duration: player.getDuration(),
    ended: playerStates[YT.PlayerState.ENDED],
    loop: urlParameters.loop === '1',
    muted: player.isMuted(),
    paused: playerStates[YT.PlayerState.PAUSED],
    playbackRate: player.getPlaybackRate(),
    volume: Math.round(player.getVolume()),
  };

  if (e === SnowplowEvent.PERCENTPROGRESS) {
    data.percentProgress = eventData!.percentThrough;
  }

  return {
    schema: 'iglu:com.snowplowanalytics.snowplow/media_player/jsonschema/1-0-0',
    data: data,
  };
}
