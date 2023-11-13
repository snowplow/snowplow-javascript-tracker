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

import { PayloadBuilder } from '@snowplow/tracker-core';
import { v4 as uuid } from 'uuid';
import { ClientSession } from './types';

/**
 * Indices of cookie values
 */
const cookieDisabledIndex = 0,
  domainUserIdIndex = 1,
  createTsIndex = 2,
  visitCountIndex = 3,
  nowTsIndex = 4,
  lastVisitTsIndex = 5,
  sessionIdIndex = 6,
  previousSessionIdIndex = 7,
  firstEventIdIndex = 8,
  firstEventTsInMsIndex = 9,
  eventIndexIndex = 10;

export type ParsedIdCookie = [
  string, // cookieDisabled
  string, // domainUserId
  number, // cookieCreateTs
  number, // visitCount
  number, // nowTs
  number | undefined, // lastVisitTs
  string, // sessionId
  string, // previousSessionId
  string, // firstEventId
  number | undefined, // firstEventTs
  number // eventIndex
];

/**
 * Parses the cookie values from its string representation.
 *
 * @param id Cookie value as string
 * @param domainUserId Domain user ID to be used in case of empty cookie string
 * @returns Parsed ID cookie tuple
 */
export function parseIdCookie(
  id: string | undefined,
  domainUserId: string,
  memorizedSessionId: string,
  memorizedVisitCount: number
) {
  let now = new Date(),
    nowTs = Math.round(now.getTime() / 1000),
    tmpContainer;

  if (id) {
    tmpContainer = id.split('.');
    // cookies enabled
    tmpContainer.unshift('0');
  } else {
    tmpContainer = [
      // cookies disabled
      '1',
      // Domain user ID
      domainUserId,
      // Creation timestamp - seconds since Unix epoch
      nowTs,
      // visitCount - 0 = no previous visit
      memorizedVisitCount,
      // Current visit timestamp
      nowTs,
      // Last visit timestamp - blank meaning no previous visit
      '',
      // Session ID
      memorizedSessionId,
    ];
  }

  if (!tmpContainer[sessionIdIndex] || tmpContainer[sessionIdIndex] === 'undefined') {
    // session id
    tmpContainer[sessionIdIndex] = uuid();
  }
  if (!tmpContainer[previousSessionIdIndex] || tmpContainer[previousSessionIdIndex] === 'undefined') {
    // previous session id
    tmpContainer[previousSessionIdIndex] = '';
  }
  if (!tmpContainer[firstEventIdIndex] || tmpContainer[firstEventIdIndex] === 'undefined') {
    // firstEventId - blank meaning no previous event
    tmpContainer[firstEventIdIndex] = '';
  }
  if (!tmpContainer[firstEventTsInMsIndex] || tmpContainer[firstEventTsInMsIndex] === 'undefined') {
    // firstEventTs - blank meaning no previous event
    tmpContainer[firstEventTsInMsIndex] = '';
  }
  if (!tmpContainer[eventIndexIndex] || tmpContainer[eventIndexIndex] === 'undefined') {
    // eventIndex – 0 = no previous event
    tmpContainer[eventIndexIndex] = 0;
  }

  const parseIntOr = (value: any, defaultValue: any) => {
    let parsed = parseInt(value as string);
    return isNaN(parsed) ? defaultValue : parsed;
  };
  const parseIntOrUndefined = (value: any) => (value ? parseIntOr(value, undefined) : undefined);

  const parsed: ParsedIdCookie = [
    tmpContainer[cookieDisabledIndex] as string,
    tmpContainer[domainUserIdIndex] as string,
    parseIntOr(tmpContainer[createTsIndex], nowTs),
    parseIntOr(tmpContainer[visitCountIndex], memorizedVisitCount),
    parseIntOr(tmpContainer[nowTsIndex], nowTs),
    parseIntOrUndefined(tmpContainer[lastVisitTsIndex]),
    tmpContainer[sessionIdIndex] as string,
    tmpContainer[previousSessionIdIndex] as string,
    tmpContainer[firstEventIdIndex] as string,
    parseIntOrUndefined(tmpContainer[firstEventTsInMsIndex]),
    parseIntOr(tmpContainer[eventIndexIndex], 0),
  ];
  return parsed;
}

/**
 * Initializes the domain user ID if not already present in the cookie. Sets an empty string if anonymous tracking.
 *
 * @param idCookie Parsed cookie
 * @param configAnonymousTracking Whether anonymous tracking is enabled
 * @returns Domain user ID
 */
export function initializeDomainUserId(idCookie: ParsedIdCookie, configAnonymousTracking: boolean) {
  let domainUserId;
  if (idCookie[domainUserIdIndex]) {
    domainUserId = idCookie[domainUserIdIndex];
  } else if (!configAnonymousTracking) {
    domainUserId = uuid();
    idCookie[domainUserIdIndex] = domainUserId;
  } else {
    domainUserId = '';
    idCookie[domainUserIdIndex] = domainUserId;
  }
  return domainUserId;
}

type NewSessionOptions = {
  memorizedVisitCount: number;
};

/**
 * Starts a new session with a new ID.
 * Sets the previous session, last visit timestamp, and increments visit count if cookies enabled.
 * First event references are reset and will be updated in `updateFirstEventInIdCookie`.
 *
 * @param idCookie Parsed cookie
 * @param options.configStateStorageStrategy Cookie storage strategy
 * @param options.configAnonymousTracking If anonymous tracking is enabled
 * @param options.memorizedVisitCount Visit count to be used if cookies not enabled
 * @param options.onSessionUpdateCallback Session callback triggered on every session update
 * @returns New session ID
 */
export function startNewIdCookieSession(
  idCookie: ParsedIdCookie,
  options: NewSessionOptions = { memorizedVisitCount: 1 }
) {
  const { memorizedVisitCount } = options;

  // If cookies are enabled, base visit count and session ID on the cookies
  if (cookiesEnabledInIdCookie(idCookie)) {
    // Store the previous session ID
    idCookie[previousSessionIdIndex] = idCookie[sessionIdIndex];
    // Set lastVisitTs to currentVisitTs
    idCookie[lastVisitTsIndex] = idCookie[nowTsIndex];
    // Increment the session ID
    idCookie[visitCountIndex]++;
  } else {
    idCookie[visitCountIndex] = memorizedVisitCount;
  }

  // Create a new sessionId
  const sessionId = uuid();
  idCookie[sessionIdIndex] = sessionId;

  // Reset event index and first event references
  idCookie[eventIndexIndex] = 0;
  idCookie[firstEventIdIndex] = '';
  idCookie[firstEventTsInMsIndex] = undefined;

  return sessionId;
}

/**
 * Update now timestamp in cookie.
 *
 * @param idCookie Parsed cookie
 */
export function updateNowTsInIdCookie(idCookie: ParsedIdCookie) {
  idCookie[nowTsIndex] = Math.round(new Date().getTime() / 1000);
}

/**
 * Updates the first event references according to the event payload if first event in session.
 *
 * @param idCookie Parsed cookie
 * @param payloadBuilder Event payload builder
 */
export function updateFirstEventInIdCookie(idCookie: ParsedIdCookie, payloadBuilder: PayloadBuilder) {
  // Update first event references if new session or not present
  if (idCookie[eventIndexIndex] === 0) {
    const payload = payloadBuilder.build();
    idCookie[firstEventIdIndex] = payload['eid'] as string;
    const ts = (payload['dtm'] || payload['ttm']) as string;
    idCookie[firstEventTsInMsIndex] = ts ? parseInt(ts) : undefined;
  }
}

/**
 * Increments event index counter.
 *
 * @param idCookie Parsed cookie
 */
export function incrementEventIndexInIdCookie(idCookie: ParsedIdCookie) {
  idCookie[eventIndexIndex] += 1;
}

/**
 * Serializes parsed cookie to string representation.
 *
 * @param idCookie Parsed cookie
 * @returns String cookie value
 */
export function serializeIdCookie(idCookie: ParsedIdCookie) {
  idCookie.shift();
  return idCookie.join('.');
}

/**
 * Transforms the parsed cookie into a client session context entity.
 *
 * @param idCookie Parsed cookie
 * @param configStateStorageStrategy Cookie storage strategy
 * @param configAnonymousTracking If anonymous tracking is enabled
 * @returns Client session context entity
 */
export function clientSessionFromIdCookie(
  idCookie: ParsedIdCookie,
  configStateStorageStrategy: string,
  configAnonymousTracking: boolean
) {
  const firstEventTsInMs = idCookie[firstEventTsInMsIndex];
  const clientSession: ClientSession = {
    userId: configAnonymousTracking
      ? '00000000-0000-0000-0000-000000000000' // TODO: use uuid.NIL when we upgrade to uuid v8.3
      : idCookie[domainUserIdIndex],
    sessionId: idCookie[sessionIdIndex],
    eventIndex: idCookie[eventIndexIndex],
    sessionIndex: idCookie[visitCountIndex],
    previousSessionId: configAnonymousTracking ? null : idCookie[previousSessionIdIndex] || null,
    storageMechanism: configStateStorageStrategy == 'localStorage' ? 'LOCAL_STORAGE' : 'COOKIE_1',
    firstEventId: idCookie[firstEventIdIndex] || null,
    firstEventTimestamp: firstEventTsInMs ? new Date(firstEventTsInMs).toISOString() : null,
  };

  return clientSession;
}

export function sessionIdFromIdCookie(idCookie: ParsedIdCookie) {
  return idCookie[sessionIdIndex];
}

export function domainUserIdFromIdCookie(idCookie: ParsedIdCookie) {
  return idCookie[domainUserIdIndex];
}

export function visitCountFromIdCookie(idCookie: ParsedIdCookie) {
  return idCookie[visitCountIndex];
}

export function cookiesEnabledInIdCookie(idCookie: ParsedIdCookie) {
  return idCookie[cookieDisabledIndex] === '0';
}

export function createTsFromIdCookie(idCookie: ParsedIdCookie) {
  return idCookie[createTsIndex];
}

export function nowTsFromIdCookie(idCookie: ParsedIdCookie) {
  return idCookie[nowTsIndex];
}

export function lastVisitTsFromIdCookie(idCookie: ParsedIdCookie) {
  return idCookie[lastVisitTsIndex];
}

export function previousSessionIdFromIdCookie(idCookie: ParsedIdCookie) {
  return idCookie[previousSessionIdIndex];
}

export function firstEventIdFromIdCookie(idCookie: ParsedIdCookie) {
  return idCookie[firstEventIdIndex];
}

export function firstEventTsInMsFromIdCookie(idCookie: ParsedIdCookie) {
  return idCookie[firstEventTsInMsIndex];
}

export function eventIndexFromIdCookie(idCookie: ParsedIdCookie) {
  return idCookie[eventIndexIndex];
}
