import F from 'lodash/fp';
import { fetchResults } from '../micro';
import { pageSetup } from './helpers';

describe('Sessions', () => {
  let log: Array<unknown> = [];
  let testIdentifier = '';

  const logContains = (ev: unknown) => F.some(F.isMatch(ev as object), log);

  beforeAll(async () => {
    testIdentifier = await pageSetup();
    await browser.url('/session-integration.html');
    await browser.pause(6000); // Time for requests to get written
    log = await browser.call(async () => await fetchResults());
  });

  it('should count sessions using cookies', () => {
    expect(
      logContains({
        event: {
          event: 'page_view',
          name_tracker: 'cookieSessionTracker',
          domain_sessionidx: 2,
          app_id: 'session-integration-' + testIdentifier,
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
          app_id: 'session-integration-' + testIdentifier,
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
          app_id: 'session-integration-' + testIdentifier,
        },
      })
    ).toBe(true);
  });

  it('should only add session context when enabled', () => {
    const events = (ev: any) =>
      F.get('event.name_tracker', ev) !== 'cookieSessionTracker' &&
      F.get('contexts[0]', ev) === 'iglu:com.snowplowanalytics.snowplow/client_session/jsonschema/1-0-2' &&
      F.get('event.app_id', ev) === 'session-integration-' + testIdentifier;

    expect(F.size(F.filter(events, log))).toBe(0);
  });

  it('should have the same information in session context as in event properties', () => {
    const events = F.filter(
      (ev: any) =>
        F.get('event.name_tracker', ev) === 'cookieSessionTracker' &&
        F.get('event.app_id', ev) === 'session-integration-' + testIdentifier,
      log
    );

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
    const events: any[] = F.filter(
      (ev: any) =>
        F.get('event.name_tracker', ev) === 'cookieSessionTracker' &&
        F.get('event.app_id', ev) === 'session-integration-' + testIdentifier,
      log
    );
    events.sort((a, b) => a.event.dvce_created_tstamp.localeCompare(b.event.dvce_created_tstamp));
    const getEventIndex = (e: any) => e.event.contexts.data[0].data.eventIndex;

    expect(getEventIndex(events[0])).toBe(1);
    expect(getEventIndex(events[1])).toBe(2);
    expect(getEventIndex(events[2])).toBe(1);
  });

  it('should match first event references to first event in session', () => {
    const events: any[] = F.filter(
      (ev: any) =>
        F.get('event.name_tracker', ev) === 'cookieSessionTracker' &&
        F.get('event.app_id', ev) === 'session-integration-' + testIdentifier,
      log
    );
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
    const events: any[] = F.filter(
      (ev: any) =>
        F.get('event.name_tracker', ev) === 'cookieSessionTracker' &&
        F.get('event.app_id', ev) === 'session-integration-' + testIdentifier,
      log
    );
    events.sort((a, b) => a.event.dvce_created_tstamp.localeCompare(b.event.dvce_created_tstamp));
    const getSessionId = (e: any) => e.event.domain_sessionid;
    const getPreviousSessionId = (e: any) => e.event.contexts.data[0].data.previousSessionId;

    expect(getPreviousSessionId(events[0])).toBeNull;
    expect(getPreviousSessionId(events[1])).toBeNull;
    expect(getPreviousSessionId(events[2])).toBe(getSessionId(events[0]));
  });

  it('should only increment domain_sessionidx outside of session timeout (local storage)', () => {
    const withSingleVid = (ev: unknown) =>
      F.get('event.name_tracker', ev) === 'localStorageSessionTracker' &&
      F.get('event.domain_sessionidx', ev) === 1 &&
      F.get('event.app_id', ev) === 'session-integration-' + testIdentifier;

    expect(F.size(F.filter(withSingleVid, log))).toBe(2);
    expect(
      F.size(
        F.filter(
          (e) =>
            F.get('event.name_tracker', e) === 'localStorageSessionTracker' &&
            F.get('event.app_id', e) === 'session-integration-' + testIdentifier,
          log
        )
      )
    ).toBe(3);
  });

  it('should only increment domain_sessionidx outside of session timeout (anonymous session tracking)', () => {
    const withSingleVid = (ev: unknown) =>
      F.get('event.name_tracker', ev) === 'anonymousSessionTracker' &&
      F.get('event.domain_sessionidx', ev) === 1 &&
      F.get('event.app_id', ev) === 'session-integration-' + testIdentifier;

    expect(F.size(F.filter(withSingleVid, log))).toBe(2);
    expect(
      F.size(
        F.filter(
          (e) =>
            F.get('event.name_tracker', e) === 'anonymousSessionTracker' &&
            F.get('event.app_id', e) === 'session-integration-' + testIdentifier,
          log
        )
      )
    ).toBe(4);
    expect(
      F.size(
        F.uniqBy(
          F.get('event.domain_sessionid'),
          F.filter(
            (e) =>
              F.get('event.name_tracker', e) === 'anonymousSessionTracker' &&
              F.get('event.app_id', e) === 'session-integration-' + testIdentifier,
            log
          )
        )
      )
    ).toBe(2);
  });

  it('should only increment domain_sessionidx outside of session timeout (cookie storage)', () => {
    const withSingleVid = (ev: unknown) =>
      F.get('event.name_tracker', ev) === 'cookieSessionTracker' &&
      F.get('event.domain_sessionidx', ev) === 1 &&
      F.get('event.app_id', ev) === 'session-integration-' + testIdentifier;

    expect(F.size(F.filter(withSingleVid, log))).toBe(2);
    expect(
      F.size(
        F.filter(
          (e) =>
            F.get('event.name_tracker', e) === 'cookieSessionTracker' &&
            F.get('event.app_id', e) === 'session-integration-' + testIdentifier,
          log
        )
      )
    ).toBe(3);
  });
});
