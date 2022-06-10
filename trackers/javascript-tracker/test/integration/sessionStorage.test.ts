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

import util from 'util';
import F from 'lodash/fp';
import { DockerWrapper, fetchResults, start, stop } from '../micro';

const dumpLog = (log: Array<unknown>) => console.log(util.inspect(log, true, null, true));

describe('Sessions', () => {
  let log: Array<unknown> = [];
  let docker: DockerWrapper;

  const logContains = (ev: unknown) => F.some(F.isMatch(ev as object), log);

  beforeAll(async () => {
    await browser.call(async () => (docker = await start()));
    await browser.url('/index.html');
    await browser.setCookies({ name: 'container', value: docker.url });
    await browser.url('/session-integration.html');
    await browser.pause(6000); // Time for requests to get written
    log = await browser.call(async () => await fetchResults(docker.url));
  });

  afterAll(async () => {
    browser.call(async () => await stop(docker.container));
  });

  it('should count sessions using cookies', () => {
    expect(
      logContains({
        event: {
          event: 'page_view',
          name_tracker: 'cookieSessionTracker',
          domain_sessionidx: 2,
        },
      })
    ).toBe(true);
  });

  it('should count sessions using local storage', () => {
    expect(
      logContains({
        event: {
          event: 'page_view',
          name_tracker: 'localStorageSessionTracker',
          domain_sessionidx: 2,
        },
      })
    ).toBe(true);
  });

  it('should count sessions using anonymousSessionTracking', () => {
    expect(
      logContains({
        event: {
          event: 'page_view',
          name_tracker: 'anonymousSessionTracker',
          domain_sessionidx: 2,
        },
      })
    ).toBe(true);
  });

  it('should only add session context when enabled', () => {
    const events = (ev: any) =>
      F.get('event.name_tracker', ev) !== 'cookieSessionTracker' &&
      F.get('contexts[0]', ev) === 'iglu:com.snowplowanalytics.snowplow/client_session/jsonschema/1-0-2';

    expect(F.size(F.filter(events, log))).toBe(0);
  });

  it('should have the same information in session context as in event properties', () => {
    const events = F.filter((ev: any) => F.get('event.name_tracker', ev) === 'cookieSessionTracker', log);

    expect(F.size(events)).toBe(3);
    expect(
      F.size(
        F.filter((e: any) => F.get('event.contexts.data[0].data.userId', e) === F.get('event.domain_userid', e), events)
      )
    ).toBe(3);
    expect(
      F.size(
        F.filter(
          (e: any) => F.get('event.contexts.data[0].data.sessionId', e) === F.get('event.domain_sessionid', e),
          events
        )
      )
    ).toBe(3);
    expect(
      F.size(
        F.filter(
          (e: any) => F.get('event.contexts.data[0].data.sessionIndex', e) === F.get('event.domain_sessionidx', e),
          events
        )
      )
    ).toBe(3);
  });

  it('should increment event index in session context', () => {
    const events: any[] = F.filter((ev: any) => F.get('event.name_tracker', ev) === 'cookieSessionTracker', log);
    events.sort((a, b) => a.event.dvce_created_tstamp.localeCompare(b.event.dvce_created_tstamp));
    const getEventIndex = (e: any) => e.event.contexts.data[0].data.eventIndex;

    expect(getEventIndex(events[0])).toBe(1);
    expect(getEventIndex(events[1])).toBe(2);
    expect(getEventIndex(events[2])).toBe(1);
  });

  it('should match first event references to first event in session', () => {
    const events: any[] = F.filter((ev: any) => F.get('event.name_tracker', ev) === 'cookieSessionTracker', log);
    events.sort((a, b) => a.event.dvce_created_tstamp.localeCompare(b.event.dvce_created_tstamp));
    const getFirstEventId = (e: any) => e.event.contexts.data[0].data.firstEventId;
    const getFirstEventTimestamp = (e: any) => e.event.contexts.data[0].data.firstEventTimestamp;

    expect(getFirstEventId(events[0])).toBe(events[0].event.event_id);
    expect(getFirstEventId(events[1])).toBe(events[0].event.event_id);
    expect(getFirstEventId(events[2])).toBe(events[2].event.event_id);

    expect(getFirstEventTimestamp(events[0])).toBe(events[0].event.dvce_created_tstamp);
    expect(getFirstEventTimestamp(events[1])).toBe(events[0].event.dvce_created_tstamp);
    expect(getFirstEventTimestamp(events[2])).toBe(events[2].event.dvce_created_tstamp);
  });

  it('should match previous session ID in session context', () => {
    const events: any[] = F.filter((ev: any) => F.get('event.name_tracker', ev) === 'cookieSessionTracker', log);
    events.sort((a, b) => a.event.dvce_created_tstamp.localeCompare(b.event.dvce_created_tstamp));
    const getSessionId = (e: any) => e.event.domain_sessionid;
    const getPreviousSessionId = (e: any) => e.event.contexts.data[0].data.previousSessionId;

    expect(getPreviousSessionId(events[0])).toBeNull;
    expect(getPreviousSessionId(events[1])).toBeNull;
    expect(getPreviousSessionId(events[2])).toBe(getSessionId(events[0]));
  });

  it('should only increment domain_sessionidx outside of session timeout (local storage)', () => {
    const withSingleVid = (ev: unknown) =>
      F.get('event.name_tracker', ev) === 'localStorageSessionTracker' && F.get('event.domain_sessionidx', ev) === 1;

    expect(F.size(F.filter(withSingleVid, log))).toBe(2);
    expect(F.size(F.filter((e) => F.get('event.name_tracker', e) === 'localStorageSessionTracker', log))).toBe(3);
  });

  it('should only increment domain_sessionidx outside of session timeout (anonymous session tracking)', () => {
    const withSingleVid = (ev: unknown) =>
      F.get('event.name_tracker', ev) === 'anonymousSessionTracker' && F.get('event.domain_sessionidx', ev) === 1;

    expect(F.size(F.filter(withSingleVid, log))).toBe(2);
    expect(F.size(F.filter((e) => F.get('event.name_tracker', e) === 'anonymousSessionTracker', log))).toBe(3);
  });

  it('should only increment domain_sessionidx outside of session timeout (cookie storage)', () => {
    const withSingleVid = (ev: unknown) =>
      F.get('event.name_tracker', ev) === 'cookieSessionTracker' && F.get('event.domain_sessionidx', ev) === 1;

    expect(F.size(F.filter(withSingleVid, log))).toBe(2);
    expect(F.size(F.filter((e) => F.get('event.name_tracker', e) === 'cookieSessionTracker', log))).toBe(3);
  });
});
