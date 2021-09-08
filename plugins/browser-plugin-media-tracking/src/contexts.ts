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

import { TextTrack } from './types';

interface TimeRange {
  start: number;
  end: number;
}

export interface VideoElement {
  /**
   * A boolean value that is true if the video should enter or leave picture-in-picture mode automatically when changing tab and/or application
   **/
  autoPictureInPicture?: boolean | null;

  /**
   * The disablePictureInPicture property will hint the user agent to not suggest the picture-in-picture to users or to request it automatically
   **/
  disablePictureInPicture?: boolean | null;

  /**
   * 'poster' HTML attribute, which specifies an image to show while no video data is available
   **/
  poster?: string | null;

  /**
   * A value indicating the intrinsic height of the resource in CSS pixels, or 0 if no media is available yet
   **/
  videoHeight: number;

  /**
   * A value indicating the intrinsic width of the resource in CSS pixels, or 0 if no media is available yet
   **/
  videoWidth: number;
  [key: string]: unknown;
}

export interface MediaElement {
  /**
   * If playback should automatically begin as soon as enough media is available to do so without interruption
   **/
  autoPlay: boolean;

  /**
   * An array of time ranges that have been buffered
   **/
  buffered: TimeRange[];

  /**
   * If the user agent should provide it's own set of controls
   **/
  controls: boolean;

  /**
   * CORS settings value of the media player
   **/
  crossOrigin?: string | null;

  /**
   * The absolute URL of the media resource
   **/
  currentSrc: string;

  /**
   * If audio is muted by default
   **/
  defaultMuted: boolean;

  /**
   * The default media playback rate of the player
   **/
  defaultPlaybackRate: number;

  /**
   * If the media element is allowed to have a remote playback UI
   **/
  disableRemotePlayback?: boolean | null;

  /**
   * An object of the latest error to occur, or null if no errors
   **/
  error?: object | null;

  /**
   * The media file format
   **/
  fileExtension: string;

  /**
   * If the video element is fullscreen
   **/
  fullscreen?: boolean | null;

  /**
   * If the media is a video element, or audio
   **/
  mediaType: 'AUDIO' | 'VIDEO';

  /**
   * The current state of the fetching of media over the network
   **/
  networkState: 'NETWORK_EMPTY' | 'NETWORK_IDLE' | 'NETWORK_LOADING' | 'NETWORK_NO_SOURCE';

  /**
   * If the video element is showing Picture-In-Picture
   **/
  pictureInPicture?: boolean | null;

  /**
   * An array of time ranges played
   **/
  played?: TimeRange[];

  /**
   * The HTML id of the element
   **/
  htmlId: string;

  /**
   * The 'preload' HTML attribute of the media
   **/
  preload: string;

  /**
   * The readiness of the media
   **/
  readyState: 'HAVE_NOTHING' | 'HAVE_METADATA' | 'HAVE_CURRENT_DATA' | 'HAVE_FUTURE_DATA' | 'HAVE_ENOUGH_DATA';

  /**
   * Seekable time range(s)
   **/
  seekable: TimeRange[];

  /**
   * If the media is in the process of seeking to a new position
   **/
  seeking: boolean;

  /**
   * The 'src' HTML attribute of the media element
   **/
  src: string;

  /**
   * An array of TextTrack objects on the media element
   **/
  textTracks?: TextTrack[];
  [key: string]: unknown;
}

export interface MediaPlayerEvent {
  /**
   * The event fired by the media player
   **/
  type: string;

  /**
   * The custom media identifier given by the user
   **/
  mediaLabel?: string | null;
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
  percentProgress?: number | null;

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
