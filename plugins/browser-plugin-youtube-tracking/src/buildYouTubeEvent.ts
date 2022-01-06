import { MediaPlayerEvent, YouTube } from './contexts';
import { SnowplowEvent } from './snowplowEvents';
import { EventData, MediaEntities, SnowplowMediaPlayer, TrackingOptions, UrlParameters } from './types';
import { YTStateEvent } from './constants';

export function buildYouTubeEvent(player: YT.Player, eventName: string, conf: TrackingOptions, eventData?: EventData) {
  const data: MediaPlayerEvent = { type: eventName };
  if (conf.hasOwnProperty('label')) data.label = conf.label;

  const context = [
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
  const playerStates: Record<string, boolean> = {
    buffering: false,
    cued: false,
    unstarted: false,
  };

  const state = player.getPlayerState();
  if (playerStates.hasOwnProperty(YTStateEvent[state])) {
    playerStates[YTStateEvent[state]] = true;
  }

  let data: YouTube = {
    autoPlay: urlParameters.autoplay === '1',
    avaliablePlaybackRates: player.getAvailablePlaybackRates(),
    buffering: playerStates.buffering,
    controls: urlParameters.controls !== '0',
    cued: playerStates.cued,
    loaded: parseInt(String(player.getVideoLoadedFraction() * 100)),
    playbackQuality: player.getPlaybackQuality(),
    playerId: player.getIframe().id,
    unstarted: playerStates.unstarted,
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

  const qualityLevels = player.getAvailableQualityLevels();
  if (qualityLevels) data.avaliableQualityLevels = qualityLevels;

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
  const playerStates: Record<string, boolean> = {
    ended: false,
    paused: false,
  };

  const state = player.getPlayerState();
  if (playerStates.hasOwnProperty(YTStateEvent[state])) {
    playerStates[YTStateEvent[state]] = true;
  }

  const data: SnowplowMediaPlayer = {
    currentTime: player.getCurrentTime(),
    duration: player.getDuration(),
    ended: playerStates.ended,
    loop: urlParameters.loop === '1',
    muted: player.isMuted(),
    paused: playerStates.paused,
    playbackRate: player.getPlaybackRate(),
    volume: player.getVolume(),
  };

  if (e === SnowplowEvent.PERCENTPROGRESS) {
    data.percentProgress = eventData!.percentThrough;
  }

  return {
    schema: 'iglu:com.snowplowanalytics.snowplow/media_player/jsonschema/1-0-0',
    data: data,
  };
}
