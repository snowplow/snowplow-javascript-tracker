/*
 * Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang
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

import { addUrlParam, parseUrlParams } from '../src/helperFunctions';
import type { TrackingOptions } from '../src/types';
import { AllEvents, DefaultEvents, trackingOptionsParser } from '../src/options';

const nilUUID = '00000000-0000-0000-0000-000000000000';

describe('config parser', () => {
  const default_output: TrackingOptions = {
    sessionId: expect.any(String),
    config: expect.anything(),
    player: undefined,
    video: 'element_id',
    captureEvents: DefaultEvents,
    youtubeEvents: ['onStateChange', 'onPlaybackQualityChange', 'onPlaybackRateChange'],
    updateRate: 500,
    boundaries: [10, 25, 50, 75],
  };

  it('assigns defaults', () => {
    const test = trackingOptionsParser({ video: 'element_id', id: nilUUID });
    expect(test).toEqual(default_output);
  });

  it('parses boundaries', () => {
    const expectedOutput = [1, 4, 7, 9, 99];
    expect(
      trackingOptionsParser({ id: nilUUID, video: 'element_id', boundaries: [1, 4, 7, 9, 99] }).boundaries
    ).toEqual(expectedOutput);
  });

  it('parses label', () => {
    const expectedOutput = 'test-label';
    expect(trackingOptionsParser({ id: nilUUID, video: 'element_id', label: expectedOutput }).config.label).toEqual(
      expectedOutput
    );
  });

  it('parses capture events', () => {
    const expectedOutput = ['play', 'pause'];
    expect(
      trackingOptionsParser({ id: nilUUID, video: 'element_id', captureEvents: ['play', 'pause'] }).captureEvents
    ).toEqual(expectedOutput);
  });

  it('parses youtube events', () => {
    const expectedOutput = ['onStateChange', 'onError', 'onPlaybackRateChange', 'onPlaybackQualityChange'];
    expect(
      trackingOptionsParser({
        id: nilUUID,
        video: 'element_id',
        captureEvents: ['play', 'error', 'playbackratechange', 'playbackqualitychange'],
      }).youtubeEvents
    ).toEqual(expectedOutput);
  });

  it('parses capture event groups', () => {
    expect(
      trackingOptionsParser({ id: nilUUID, video: 'element_id', captureEvents: ['AllEvents'] }).captureEvents
    ).toEqual(AllEvents);
  });

  it('parses capture events and groups in same array', () => {
    expect(
      trackingOptionsParser({ id: nilUUID, video: 'element_id', captureEvents: ['DefaultEvents', 'ready'] })
        .captureEvents
    ).toEqual(DefaultEvents);
  });

  it("doesn't return youtube events not in capture events", () => {
    const expectedOutput = ['onStateChange'];
    expect(
      trackingOptionsParser({ id: nilUUID, video: 'element_id', captureEvents: ['play', 'pause'] }).youtubeEvents
    ).toEqual(expectedOutput);
  });

  it("Only includes YTPlayerEvent.ONERROR with 'error' event ", () => {
    const expectedOutput = ['onError'];
    for (const event of AllEvents) {
      if (event === 'error') {
        expect(
          trackingOptionsParser({ id: nilUUID, video: 'element_id', captureEvents: [event] }).youtubeEvents
        ).toEqual(expectedOutput);
      } else {
        expect(
          trackingOptionsParser({ id: nilUUID, video: 'element_id', captureEvents: [event] }).youtubeEvents
        ).not.toEqual(expectedOutput);
      }
    }
  });

  it('Only includes YT.Events.onStateChange with required events (%p)', () => {
    const expectedOutput = ['onStateChange'];
    const eventsUsingStateChange = [
      'unstarted',
      'play',
      'playing',
      'pause',
      'paused',
      'buffering',
      'cued',
      'end',
      'ended',
      'percent_progress',
    ];
    for (const event of AllEvents) {
      if (eventsUsingStateChange.indexOf(event) !== -1) {
        expect(
          trackingOptionsParser({ id: nilUUID, video: 'element_id', captureEvents: [event] }).youtubeEvents
        ).toEqual(expectedOutput);
      } else {
        expect(
          trackingOptionsParser({ id: nilUUID, video: 'element_id', captureEvents: [event] }).youtubeEvents
        ).not.toEqual(expectedOutput);
      }
    }
  });

  it("Only includes YT.Events.onPlaybackRateChange with 'playback_rate_change' event", () => {
    let expectedOutput = ['onPlaybackRateChange'];
    for (const event of AllEvents) {
      if (event === 'playback_rate_change') {
        expect(
          trackingOptionsParser({ id: nilUUID, video: 'element_id', captureEvents: [event] }).youtubeEvents
        ).toEqual(expectedOutput);
      } else {
        expect(
          trackingOptionsParser({ id: nilUUID, video: 'element_id', captureEvents: [event] }).youtubeEvents
        ).not.toEqual(expectedOutput);
      }
    }
  });

  it("Only includes YT.Events.onPlaybackQualityChange only with 'quality_change' event", () => {
    const expectedOutput = ['onPlaybackQualityChange'];
    for (const event of AllEvents) {
      if (event === 'quality_change') {
        expect(
          trackingOptionsParser({ id: nilUUID, video: 'element_id', captureEvents: [event] }).youtubeEvents
        ).toEqual(expectedOutput);
      } else {
        expect(
          trackingOptionsParser({ id: nilUUID, video: 'element_id', captureEvents: [event] }).youtubeEvents
        ).not.toEqual(expectedOutput);
      }
    }
  });

  it('Only includes YT.Events.onApiChange only with "apichange" event', () => {
    const expectedOutput = ['onApiChange'];
    for (const event of AllEvents) {
      if ((event as string) === 'apichange') {
        expect(
          trackingOptionsParser({ id: nilUUID, video: 'element_id', captureEvents: [event] }).youtubeEvents
        ).toEqual(expectedOutput);
      } else {
        expect(
          trackingOptionsParser({ id: nilUUID, video: 'element_id', captureEvents: [event] }).youtubeEvents
        ).not.toEqual(expectedOutput);
      }
    }
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
