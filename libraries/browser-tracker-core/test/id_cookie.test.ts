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

import * as uuid from 'uuid';
jest.mock('uuid');
const MOCK_UUID = '123456789';
jest.spyOn(uuid, 'v4').mockReturnValue(MOCK_UUID);

import { payloadBuilder } from '@snowplow/tracker-core';
import {
  clientSessionFromIdCookie,
  cookiesEnabledInIdCookie,
  createTsFromIdCookie,
  domainUserIdFromIdCookie,
  eventIndexFromIdCookie,
  firstEventIdFromIdCookie,
  firstEventTsInMsFromIdCookie,
  incrementEventIndexInIdCookie,
  initializeDomainUserId,
  lastVisitTsFromIdCookie,
  nowTsFromIdCookie,
  parseIdCookie,
  previousSessionIdFromIdCookie,
  serializeIdCookie,
  sessionIdFromIdCookie,
  startNewIdCookieSession,
  updateFirstEventInIdCookie,
  updateNowTsInIdCookie,
  visitCountFromIdCookie,
} from '../src/tracker/id_cookie';

describe('parseIdCookie', () => {
  it('Initializes a new ID cookie using memorized values given empty string', () => {
    let before = Math.round(new Date().getTime() / 1000);
    let idCookie = parseIdCookie('', 'xyz', 'ses', 10);
    let after = Math.round(new Date().getTime() / 1000);

    expect(cookiesEnabledInIdCookie(idCookie)).not.toBeTruthy();
    expect(domainUserIdFromIdCookie(idCookie)).toBe('xyz');
    expect(sessionIdFromIdCookie(idCookie)).toBe('ses');
    expect(visitCountFromIdCookie(idCookie)).toBe(10);
    expect(previousSessionIdFromIdCookie(idCookie)).toBeFalsy();
    expect(createTsFromIdCookie(idCookie)).toBeGreaterThanOrEqual(before);
    expect(createTsFromIdCookie(idCookie)).toBeLessThanOrEqual(after);
    expect(nowTsFromIdCookie(idCookie)).toBeGreaterThanOrEqual(before);
    expect(nowTsFromIdCookie(idCookie)).toBeLessThanOrEqual(after);
    expect(lastVisitTsFromIdCookie(idCookie)).toBeUndefined();
    expect(firstEventIdFromIdCookie(idCookie)).toBe('');
    expect(firstEventTsInMsFromIdCookie(idCookie)).toBeUndefined();
    expect(eventIndexFromIdCookie(idCookie)).toBe(0);
  });

  it('Initializes from a partial version of the cookie', () => {
    let ts = Math.round(new Date().getTime() / 1000);
    let idCookie = parseIdCookie(`abc.${ts}.10.${ts + 10}.${ts - 10}`, '', '', 0);

    expect(domainUserIdFromIdCookie(idCookie)).toBe('abc');
    expect(visitCountFromIdCookie(idCookie)).toBe(10);
    expect(nowTsFromIdCookie(idCookie)).toBe(ts + 10);
    expect(lastVisitTsFromIdCookie(idCookie)).toBe(ts - 10);
    expect(sessionIdFromIdCookie(idCookie)).toBeTruthy();
    expect(createTsFromIdCookie(idCookie)).toBe(ts);
    expect(firstEventIdFromIdCookie(idCookie)).toBe('');
    expect(firstEventTsInMsFromIdCookie(idCookie)).toBeUndefined();
    expect(eventIndexFromIdCookie(idCookie)).toBe(0);
  });

  it('Initializes from a partial version of the cookie including session id', () => {
    let ts = Math.round(new Date().getTime() / 1000);
    let idCookie = parseIdCookie(`abc.${ts}.10.${ts + 10}.${ts - 10}.ses`, '', '', 0);

    expect(sessionIdFromIdCookie(idCookie)).toBe('ses');
  });

  it('Initializes from a complete cookie', () => {
    let idCookie = parseIdCookie(`def.1653632272.10.1653632282.1653632262.ses.previous.fid.1653632252.9`, '', '', 0);

    expect(domainUserIdFromIdCookie(idCookie)).toBe('def');
    expect(visitCountFromIdCookie(idCookie)).toBe(10);
    expect(sessionIdFromIdCookie(idCookie)).toBe('ses');
    expect(previousSessionIdFromIdCookie(idCookie)).toBe('previous');
    expect(firstEventIdFromIdCookie(idCookie)).toBe('fid');
    expect(firstEventTsInMsFromIdCookie(idCookie)).toBe(1653632252);
    expect(eventIndexFromIdCookie(idCookie)).toBe(9);
  });
});

describe('initializeDomainUserId', () => {
  it('Uses existing ID if present', () => {
    let idCookie = parseIdCookie(`abc.1653632272.10.1653632272.1653632272`, '', '', 0);

    let duidAnonymous = initializeDomainUserId(idCookie, true);
    expect(duidAnonymous).toBe('abc');

    let duidNonAnonymous = initializeDomainUserId(idCookie, false);
    expect(duidNonAnonymous).toBe('abc');
  });

  it('Generates a new ID', () => {
    let duid = initializeDomainUserId(parseIdCookie('', '', '', 0), false);

    expect(duid).toBeTruthy();
  });

  it('Is empty in case of anonymous tracking', () => {
    let duid = initializeDomainUserId(parseIdCookie('', '', '', 0), true);

    expect(duid).toBeFalsy();
  });
});

describe('startNewIdCookieSession', () => {
  it('Resets the first event references and event index', () => {
    let idCookie = parseIdCookie('def.1653632272.10.1653632282.1653632262.ses.previous.fid.1653632252.9', '', '', 0);
    startNewIdCookieSession(idCookie);

    expect(firstEventIdFromIdCookie(idCookie)).toBeFalsy();
    expect(firstEventTsInMsFromIdCookie(idCookie)).toBeUndefined();
    expect(eventIndexFromIdCookie(idCookie)).toBe(0);
  });

  it('Increments the visit count', () => {
    let idCookie = parseIdCookie('def.1653632272.10.1653632282.1653632262', '', '', 0);

    expect(visitCountFromIdCookie(idCookie)).toBe(10);
    startNewIdCookieSession(idCookie);
    expect(visitCountFromIdCookie(idCookie)).toBe(11);
  });

  it('Uses the passed visit count in case of disabled cookies', () => {
    let idCookie = parseIdCookie('', '', '', 0);
    startNewIdCookieSession(idCookie, { memorizedVisitCount: 100 });
    expect(visitCountFromIdCookie(idCookie)).toBe(100);
  });

  it("Doesn't set the last visit timestamp if disabled cookies and keeps now timestamp", () => {
    let idCookie = parseIdCookie('', '', '', 0);
    let nowTs = nowTsFromIdCookie(idCookie);
    startNewIdCookieSession(idCookie);
    expect(lastVisitTsFromIdCookie(idCookie)).toBeUndefined();
    expect(nowTsFromIdCookie(idCookie)).toBe(nowTs);
  });

  it('Generates a new session ID', () => {
    let idCookie = parseIdCookie('def.1653632272.10.1653632282.1653632262', '', '', 0);

    let before = sessionIdFromIdCookie(idCookie);

    jest.spyOn(uuid, 'v4').mockReturnValueOnce('another_random_uuid');
    startNewIdCookieSession(idCookie);
    let after = sessionIdFromIdCookie(idCookie);

    expect(before).not.toBe(after);
  });

  it('Moves current visit to last visit timestamp', () => {
    let idCookie = parseIdCookie(`def.1653632100.10.1653632200.1653632300`, '', '', 0);

    startNewIdCookieSession(idCookie);
    expect(lastVisitTsFromIdCookie(idCookie)).toBe(1653632200);
  });

  it('Sets the previous session ID', () => {
    let idCookie = parseIdCookie('def.1653632100.10.1653632200.1653632300.ses', '', '', 0);

    startNewIdCookieSession(idCookie);
    expect(previousSessionIdFromIdCookie(idCookie)).toBe('ses');
  });
});

describe('updateNowTsInIdCookie', () => {
  it('Sets the timestamp to current time', () => {
    let idCookie = parseIdCookie('def.1653632100.10.1653632200.1653632300.ses', '', '', 0);

    let before = Math.round(new Date().getTime() / 1000);
    updateNowTsInIdCookie(idCookie);
    let after = Math.round(new Date().getTime() / 1000);

    expect(nowTsFromIdCookie(idCookie)).toBeGreaterThanOrEqual(before);
    expect(nowTsFromIdCookie(idCookie)).toBeLessThanOrEqual(after);
  });
});

describe('updateFirstEventInIdCookie', () => {
  it('Sets the first event references if first event in session', () => {
    let pb = payloadBuilder();
    let timestamp = new Date().getTime();
    pb.add('eid', 'xyz');
    pb.add('dtm', timestamp);

    let idCookie = parseIdCookie('', '', '', 0);
    updateFirstEventInIdCookie(idCookie, pb);

    expect(firstEventIdFromIdCookie(idCookie)).toBe('xyz');
    expect(firstEventTsInMsFromIdCookie(idCookie)).toBe(timestamp);
  });

  it('Sets the first event timestamp from true timestamp if device timestamp not available', () => {
    let pb = payloadBuilder();
    let timestamp = new Date().getTime();
    pb.add('eid', 'xyz');
    pb.add('ttm', timestamp);

    let idCookie = parseIdCookie('', '', '', 0);
    updateFirstEventInIdCookie(idCookie, pb);

    expect(firstEventTsInMsFromIdCookie(idCookie)).toBe(timestamp);
  });

  it("Doesn't change first event references if not first event in session", () => {
    let idCookie = parseIdCookie('def.1653632272.10.1653632282.1653632262.ses.previous.fid.1653632252.9', '', '', 0);

    let pb = payloadBuilder();
    pb.add('eid', 'xyz');
    pb.add('dtm', new Date().getTime());

    updateFirstEventInIdCookie(idCookie, pb);

    expect(firstEventIdFromIdCookie(idCookie)).toBe('fid');
    expect(firstEventTsInMsFromIdCookie(idCookie)).toBe(1653632252);
  });
});

describe('incrementEventIndexInIdCookie', () => {
  it('Increments the event index', () => {
    let idCookie = parseIdCookie('', '', '', 0);
    expect(eventIndexFromIdCookie(idCookie)).toBe(0);
    incrementEventIndexInIdCookie(idCookie);
    expect(eventIndexFromIdCookie(idCookie)).toBe(1);
    incrementEventIndexInIdCookie(idCookie);
    expect(eventIndexFromIdCookie(idCookie)).toBe(2);
  });
});

describe('serializeIdCookie', () => {
  it("Doesn't change the original cookie", () => {
    let cookie = `def.1653632272.10.1653632282.1653632262.ses.previous.fid.1653632252.9`;
    expect(serializeIdCookie(parseIdCookie(cookie, '', '', 0))).toBe(cookie);
  });
});

describe('clientSessionFromIdCookie', () => {
  it('Correctly fills out the properties', () => {
    let idCookie = parseIdCookie('def.1653632272.10.1653632282.1653632262.ses.previous.fid.1653638673483.9', '', '', 0);
    let clientSession = clientSessionFromIdCookie(idCookie, 'cookieAndLocalStorage', false);

    expect(clientSession.userId).toBe('def');
    expect(clientSession.sessionId).toBe('ses');
    expect(clientSession.previousSessionId).toBe('previous');
    expect(clientSession.eventIndex).toBe(9);
    expect(clientSession.sessionIndex).toBe(10);
    expect(clientSession.storageMechanism).toBe('COOKIE_1');
    expect(clientSession.firstEventId).toBe('fid');
    expect(clientSession.firstEventTimestamp).toBe('2022-05-27T08:04:33.483Z');
  });

  it('Anonymises userId and previousSessionId when anonymous tracking', () => {
    let idCookie = parseIdCookie('def.1653632272.10.1653632282.1653632262.ses.previous.fid.1653638673483.9', '', '', 0);
    let clientSession = clientSessionFromIdCookie(idCookie, 'cookieAndLocalStorage', true);

    expect(clientSession.userId).toBe('00000000-0000-0000-0000-000000000000');
    expect(clientSession.sessionId).toBe('ses');
    expect(clientSession.previousSessionId).toBeNull;
    expect(clientSession.eventIndex).toBe(9);
    expect(clientSession.sessionIndex).toBe(10);
    expect(clientSession.storageMechanism).toBe('COOKIE_1');
    expect(clientSession.firstEventId).toBe('fid');
    expect(clientSession.firstEventTimestamp).toBe('2022-05-27T08:04:33.483Z');
  });
});
