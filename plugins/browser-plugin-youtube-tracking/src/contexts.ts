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

export interface MediaPlayerEvent {
  /**
   * The event fired by the media player
   **/
  type: string;

  /**
   * The custom media identifier given by the user
   **/
  label?: string;
  [key: string]: unknown;
}

export interface MediaPlayer {
  /**
   * The current playback time
   **/
  currentTime: number;

  /**
   * A double-precision floating-point value indicating the duration of the media in seconds
   **/
  duration?: number | null;

  /**
   * If playback of the media has ended
   **/
  ended: boolean;

  /**
   * If the video should restart after ending
   **/
  loop: boolean;

  /**
   * If the media element is muted
   **/
  muted: boolean;

  /**
   * If the media element is paused
   **/
  paused: boolean;

  /**
   * The percent of the way through the media
   **/
  percentProgress?: number;

  /**
   * Playback rate (1 is normal)
   **/
  playbackRate: number;

  /**
   * Volume level
   **/
  volume: number;
  [key: string]: unknown;
}

export interface YouTube {
  /**
   * An array of playback rates in which the current video is available
   **/
  avaliablePlaybackRates: Array<number>;

  /**
   * If the video is cued
   **/
  cued: boolean;

  /**
   * The HTML id of the video element
   **/
  playerId: string;

  /**
   * This specifies whether the initial video will automatically start to play when the player loads.
   **/
  autoPlay: boolean;

  /**
   * If the player is buffering
   **/
  buffering: boolean;

  /**
   * Whether the video player controls are displayed
   **/
  controls: boolean;

  /**
   * A string of the latest error to occur, or null if no errors
   **/
  error?: 'INVALID_PARAMETER' | 'HTML5_PLAYER_ERROR' | 'NOT_FOUND' | 'EMBED_DISALLOWED';

  /**
   * The percentage of the video that the player shows as buffered
   **/
  loaded: number;

  /**
   * The origin domain of the embed
   **/
  origin?: string | null;

  /**
   * An array of the video IDs in the playlist as they are currently ordered.
   **/
  playlist?: Array<number> | null;

  /**
   * The index of the playlist video that is currently playing
   **/
  playlistIndex?: number | null;

  /**
   * If the player hasn't started
   **/
  unstarted: boolean;

  /**
   * The YouTube embed URL of the media resource
   **/
  url: string;

  /**
   * The field-of-view of the view in degrees, as measured along the longer edge of the viewport
   **/
  fov?: number | null;

  /**
   * The clockwise or counterclockwise rotational angle of the view in degrees
   **/
  roll?: number | null;

  /**
   * The vertical angle of the view in degrees
   **/
  pitch?: number | null;

  /**
   * The horizontal angle of the view in degrees
   **/
  yaw?: number | null;
  [key: string]: unknown;
}
