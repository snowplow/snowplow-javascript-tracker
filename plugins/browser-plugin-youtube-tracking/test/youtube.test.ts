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

import { AllEvents, DefaultEvents } from '../src/eventGroups';
import { addUrlParam, parseUrlParams, trackingOptionsParser } from '../src/helperFunctions';
import { MediaTrackingOptions, TrackingOptions } from '../src/types';
import { YTPlayerEvent } from '../src/constants';

describe('config parser', () => {
  const id = 'youtube';
  const default_output: TrackingOptions = {
    mediaId: 'youtube',
    captureEvents: DefaultEvents,
    youtubeEvents: [
      YTPlayerEvent.ONSTATECHANGE,
      YTPlayerEvent.ONPLAYBACKQUALITYCHANGE,
      YTPlayerEvent.ONERROR,
      YTPlayerEvent.ONPLAYBACKRATECHANGE,
    ],
    updateRate: 500,
    progress: {
      boundaries: [10, 25, 50, 75],
      boundaryTimeoutIds: [],
    },
  };

  it('assigns defaults', () => {
    let test = trackingOptionsParser(id);
    expect(test).toEqual(default_output);
  });

  it('parses boundries', () => {
    let trackingOptions: MediaTrackingOptions = {
      captureEvents: DefaultEvents,
      boundaries: [1, 4, 7, 9, 99],
    };
    let expectedOutput = [1, 4, 7, 9, 99];
    expect(trackingOptionsParser(id, trackingOptions).progress?.boundaries).toEqual(expectedOutput);
  });

  it('parses label', () => {
    let trackingOptions: MediaTrackingOptions = {
      label: 'test-label',
    };
    let expectedOutput = 'test-label';
    expect(trackingOptionsParser(id, trackingOptions).label).toEqual(expectedOutput);
  });

  it('parses capture events', () => {
    let trackingOptions: MediaTrackingOptions = {
      captureEvents: ['play', 'pause'],
    };

    let expectedOutput = ['play', 'pause'];
    expect(trackingOptionsParser(id, trackingOptions).captureEvents).toEqual(expectedOutput);
  });

  it('parses youtube events', () => {
    let trackingOptions: MediaTrackingOptions = {
      captureEvents: ['play', 'ready', 'error', 'playbackratechange', 'playbackqualitychange', 'apichange'],
    };

    let expectedOutput = [
      'onStateChange',
      'onPlaybackQualityChange',
      'onError',
      'onPlaybackRateChange',
      'onReady',
      'onApiChange',
    ];
    expect(trackingOptionsParser(id, trackingOptions).youtubeEvents).toEqual(expectedOutput);
  });

  it('parses capture event groups', () => {
    let trackingOptions: MediaTrackingOptions = {
      captureEvents: ['AllEvents'],
    };
    let expectedOutput = AllEvents;
    expect(trackingOptionsParser(id, trackingOptions).captureEvents).toEqual(expectedOutput);
  });

  it('parses capture events and groups in same array', () => {
    let trackingOptions: MediaTrackingOptions = {
      captureEvents: ['DefaultEvents', 'ready'],
    };

    let expectedOutput = DefaultEvents.concat(['ready']);
    expect(trackingOptionsParser(id, trackingOptions).captureEvents).toEqual(expectedOutput);
  });
});

describe('url parameter functions', () => {
  const createTestUrl = (params?: Record<string, string>) => {
    let testUrl = 'https://www.youtube.com/embed/zSM4ZyVe8xs';
    if (!params) return testUrl;
    Object.keys(params).forEach((p: string, i: number) => {
      let sep = i === 0 ? '?' : '&';
      let addon = `${sep + p}=${params[p]}`;
      testUrl += addon;
    });
    return testUrl;
  };

  it('adds a parameter', () => {
    let url = 'https://www.youtube.com/embed/zSM4ZyVe8xs';
    url = addUrlParam(url, 'testParam', 'testValue');
    expect(url.indexOf('testParam=testValue')).toBeGreaterThan(-1);
  });

  it('parses urls params', () => {
    const urlParameters = parseUrlParams(createTestUrl({ loop: '1', enablejsapi: '1' }));
    expect(urlParameters).toEqual({ loop: '1', enablejsapi: '1' });
  });
});
