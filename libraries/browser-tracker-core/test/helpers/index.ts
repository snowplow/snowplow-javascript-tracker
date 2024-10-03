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

import { TrackerConfiguration, addTracker, SharedState } from '../../src';

// Default Domain alias is snowplow-js-tracker.local & configCookiepath is /
const DEFAULT_DOMAIN_HASH = '7f01';

interface CreateTestIdCookie {
  domainHash: string;
  domainUserId: string;
  createTs: number;
  visitCount: number;
  nowTs: number;
  lastVisitTs: number;
  sessionId: string;
}
/**
 * Create a sp_id (id) cookie for testing purposes.
 */
export function createTestIdCookie(params: Partial<CreateTestIdCookie>) {
  const now = Date.now();
  const DEFAULT_PARAMS: CreateTestIdCookie = {
    domainHash: DEFAULT_DOMAIN_HASH,
    domainUserId: '',
    createTs: now,
    visitCount: 1,
    nowTs: now,
    lastVisitTs: now,
    sessionId: '',
  };
  const cookieParams = { ...DEFAULT_PARAMS, ...params };
  const { domainHash } = cookieParams;
  // @ts-expect-error
  delete cookieParams.domainHash;
  return `_sp_id.${domainHash}=${Object.values(cookieParams).join('.')}; Expires=; Path=/; SameSite=Lax; Secure;`;
}

interface CreateTestSessionIdCookie {
  domainHash: string;
}

/**
 * Create a sp_ses (session) cookie for testing purposes.
 */
export function createTestSessionIdCookie(params?: CreateTestSessionIdCookie) {
  const domainHash = DEFAULT_DOMAIN_HASH || params?.domainHash;
  return `_sp_ses.${domainHash}=*; Expires=; Path=/; SameSite=Lax; Secure;`;
}

export function createTracker(configuration?: TrackerConfiguration, sharedState?: SharedState) {
  let id = 'sp-' + Math.random();
  configuration = { ...configuration, synchronousCookieWrite: true };
  return addTracker(id, id, '', '', sharedState ?? new SharedState(), configuration);
}
