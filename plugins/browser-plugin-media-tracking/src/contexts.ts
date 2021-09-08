/*
 * Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
export interface VideoElement {
  /**
   * A boolean value that is true if the video should enter or leave picture-in-picture mode automatically when changing tab and/or application
   **/
  auto_picture_in_picture?: boolean | null;

  /**
   * The disablePictureInPicture property will hint the user agent to not suggest the picture-in-picture to users or to request it automatically
   **/
  disable_picture_in_picture?: boolean | null;

  /**
   * 'poster' HTML attribute, which specifies an image to show while no video data is available
   **/
  poster?: string | null;

  /**
   * A value indicating the intrinsic height of the resource in CSS pixels, or 0 if no media is available yet
   **/
  video_height: number;

  /**
   * A value indicating the intrinsic width of the resource in CSS pixels, or 0 if no media is available yet
   **/
  video_width: number;
  [key: string]: unknown;
}

export interface BufferedInterface {
  start: number;
  end: number;
}

export interface PlayedInterface {
  start: number;
  end: number;
}

export interface SeekableInterface {
  start: number;
  end: number;
}

export interface TextTracksInterface {
  label: string;
  language: string;
  kind: string;
  mode: string;
}
export interface MediaElement {
  /**
   * If playback should automatically begin as soon as enough media is available to do so without interruption.
   **/
  auto_play: boolean;

  /**
   * An array of time ranges that have been buffered
   **/
  buffered: BufferedInterface[];

  /**
   * If the user agent should provide it's own set of controls
   **/
  controls: boolean;

  /**
   * CORS settings value of the media player
   **/
  cross_origin?: string | null;

  /**
   * The absolute URL of the media resource
   **/
  current_source: string;

  /**
   * The current playback time
   **/
  current_time: number;

  /**
   * If audio is muted by default
   **/
  default_muted: boolean;

  /**
   * The default media playback rate of the player
   **/
  default_playback_rate: number;

  /**
   * If the media element is allowed to have a remote playback UI
   **/
  disable_remote_playback?: boolean | null;

  /**
   * Total length of media in seconds
   **/
  duration?: number | null;

  /**
   * If playback of the media has ended
   **/
  ended: boolean;

  /**
   * An object of the latest error to occur, or null if no errors
   **/
  error?: object | null;

  /**
   * If the video restarts after ended
   **/
  loop: boolean;

  /**
   * If the media element is muted
   **/
  muted: boolean;

  /**
   * The current state of the fetching of media over the network
   **/
  network_state: 'NETWORK_EMPTY' | 'NETWORK_IDLE' | 'NETWORK_LOADING' | 'NETWORK_NO_SOURCE';

  /**
   * If the media element is paused
   **/
  paused: boolean;

  /**
   * Playback rate relative to 1 (normal speed)
   **/
  playback_rate: number;

  /**
   * An array of time ranges played
   **/
  played?: PlayedInterface[];

  /**
   * The 'preload' HTML attribute of the media
   **/
  preload: string;

  /**
   * The readiness of the media
   **/
  ready_state: 'HAVE_NOTHING' | 'HAVE_METADATA' | 'HAVE_CURRENT_DATA' | 'HAVE_FUTURE_DATA' | 'HAVE_ENOUGH_DATA';

  /**
   * Seekable time range(s)
   **/
  seekable: SeekableInterface[];

  /**
   * If the media is in the process of seeking to a new position
   **/
  seeking: boolean;

  /**
   * The 'src' HTML attribute of the media element
   **/
  src: string;

  /**
   * The 'srcObject' property of the HTML media element
   **/
  src_object?: object | null;

  /**
   * An array of TextTrack objects on the media element
   **/
  text_tracks?: TextTracksInterface[];

  /**
   * Volume level
   **/
  volume: number;
  [key: string]: unknown;
}

export interface MediaPlayerEvent {
  /**
   * The event fired by the media player
   **/
  type: string;

  /**
   * The HTML id of the video element
   **/
  player_id: string;

  /**
   * If the media is a video element, or audio
   **/
  media_type: 'AUDIO' | 'VIDEO';

  /**
   * The custom media identifier given by the user
   **/
  media_label?: string | null;
  [key: string]: unknown;
}

export interface MediaPlayer {
  /**
   * The percent of the way through the media
   **/
  percent_progress: number;

  /**
   * The media file format
   **/
  file_extension: string;

  /**
   * If the video element is fullscreen
   **/
  fullscreen: boolean;

  /**
   * If the video element is showing Picture-In-Picture
   **/
  picture_in_picture: boolean;
  [key: string]: unknown;
}
