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

import { newTracker, getDomainSessionId } from '../src';

describe('Browser Tracker API: #getDomainSessionId', () => {
  let cookieJar: string;

  beforeAll(() => {
    cookieJar = '';
    jest.spyOn(document, 'cookie', 'set').mockImplementation((cookie) => {
      cookieJar += cookie;
    });
    jest.spyOn(document, 'cookie', 'get').mockImplementation(() => cookieJar);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('exposes the domain session id of a named tracker', () => {
    const tracker = newTracker('sp-api-1', '', { stateStorageStrategy: 'cookie' });
    const sessionId = tracker?.getDomainSessionId();

    expect(sessionId).toMatch(/^[0-9a-f-]+$/);
    expect(getDomainSessionId('sp-api-1')).toEqual(sessionId);
  });

  it('defaults to the first initialised tracker when no id is provided', () => {
    // 'sp-api-1' is the only/first tracker registered in this module
    expect(getDomainSessionId()).toEqual(getDomainSessionId('sp-api-1'));
  });

  it('returns undefined for an unknown tracker id', () => {
    expect(getDomainSessionId('missing-tracker')).toBeUndefined();
  });
});
