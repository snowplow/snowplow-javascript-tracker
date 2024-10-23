import test from 'ava';

import { newEmitterRequest } from '../../src/emitter/emitter_request';
import { newEmitterEvent } from '../../src/emitter/emitter_event';
import { newEventStorePayload } from '../../src/event_store_payload';

const newEmitterEventFromPayload = (payload: Record<string, unknown>) => {
  return newEmitterEvent(newEventStorePayload({ payload }));
};

// MARK: - addEvent

test('addEvent adds an event to the request', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    maxPostBytes: 1000,
  });

  const event = newEmitterEventFromPayload({ e: 'pv' });

  t.true(request.addEvent(event));
  t.is(request.getEvents().length, 1);
});

test('addEvent returns false when server anonymization does not match previous events', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    maxPostBytes: 1000,
  });

  t.true(
    request.addEvent(
      newEmitterEvent(
        newEventStorePayload({
          payload: { e: 'pv' },
          svrAnon: true,
        })
      )
    )
  );
  t.false(
    request.addEvent(
      newEmitterEvent(
        newEventStorePayload({
          payload: { e: 'pv' },
          svrAnon: false,
        })
      )
    )
  );
  t.true(
    request.addEvent(
      newEmitterEvent(
        newEventStorePayload({
          payload: { e: 'pv' },
          svrAnon: true,
        })
      )
    )
  );
  t.is(request.getEvents().length, 2);
});

// MARK: - countBytes

test('countBytes returns the correct byte count', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    maxPostBytes: 1000,
  });

  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));
  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'mob' })));
  t.is(request.countBytes(), 40 + 88); // 40 bytes for each event, 88 bytes for the payload_data envelope
});

// MARK: - countEvents

test('countEvents returns the correct event count', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    maxPostBytes: 1000,
  });

  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));
  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'mob' })));
  t.is(request.countEvents(), 2);
});

// MARK: - isFull

test('isFull returns false when not reached max post bytes', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    maxPostBytes: 1000,
  });

  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));
  t.false(request.isFull());
});

test('isFull returns false when reached buffer size and not max post bytes', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    maxPostBytes: 1000,
  });

  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));
  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'mob' })));
  t.false(request.isFull());
});

test('isFull returns true when reached max post bytes', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    maxPostBytes: 10,
  });

  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));
  t.true(request.isFull());
});

// MARK: - toRequest

test('toRequest returns a Request object with default settings', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
  });

  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));
  const req = request.toRequest()!;
  t.is(req.url, 'https://example.com/com.snowplowanalytics.snowplow/tp2');
  t.is(req.method, 'POST');
  t.is(req.headers.get('Content-Type'), 'application/json; charset=UTF-8');
  t.is(req.headers.get('SP-Anonymous'), null);
});

test('toRequest builds a GET request when method is get', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    eventMethod: 'get',
    useStm: false,
  });

  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));
  const req = request.toRequest()!;
  t.is(req.url, 'https://example.com/i?e=pv&p=web');
  t.is(req.method, 'GET');
});

test('toRequest includes stm when useStm is true', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    eventMethod: 'get',
    useStm: true,
  });

  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));
  const req = request.toRequest()!;
  t.regex(req.url, /stm=\d+/);
});

test('toRequest includes custom headers', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    customHeaders: { 'X-Test': 'test' },
  });

  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));
  const req = request.toRequest()!;
  t.is(req.headers.get('X-Test'), 'test');
});

test('toRequest includes server anonymization header', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
  });

  t.true(
    request.addEvent(
      newEmitterEvent(
        newEventStorePayload({
          payload: { e: 'pv', p: 'web' },
          svrAnon: true,
        })
      )
    )
  );
  const req = request.toRequest()!;
  t.is(req.headers.get('SP-Anonymous'), '*');
});

test('toRequest contains keepalive', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    keepalive: true,
  });

  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));
  const req = request.toRequest()!;
  t.is(req.keepalive, true);
});

test('toRequest URL contains custom POST path', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    postPath: '/custom',
  });

  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));
  const req = request.toRequest()!;
  t.is(req.url, 'https://example.com/custom');
});

test('toRequest URL adds default protocol when missing', (t) => {
  const request = newEmitterRequest({
    endpoint: 'example.com',
  });

  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));
  const req = request.toRequest()!;
  t.is(req.url, 'https://example.com/com.snowplowanalytics.snowplow/tp2');
});

test('toRequest URL adds protocol and port', (t) => {
  const request = newEmitterRequest({
    endpoint: 'example.com',
    protocol: 'http',
    port: 9090,
  });

  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));
  const req = request.toRequest()!;
  t.is(req.url, 'http://example.com:9090/com.snowplowanalytics.snowplow/tp2');
});

test('toRequest URL does not add protocol if already contains', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    protocol: 'http',
  });

  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));
  const req = request.toRequest()!;
  t.is(req.url, 'https://example.com/com.snowplowanalytics.snowplow/tp2');
});

test('toRequest returns undefined when no events', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
  });

  t.is(request.toRequest(), undefined);
});

test('toRequest contains default credentials', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    eventMethod: 'get',
  });

  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));
  const req = request.toRequest()!;
  t.is(req.credentials, 'include');
});

test('toRequest contains credentials', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    credentials: 'omit',
  });

  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));
  const req = request.toRequest()!;
  t.is(req.credentials, 'omit');
});

test('toRequest adds stm to POST request', async (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    useStm: true,
  });

  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));
  const req = request.toRequest()!;
  const data = await req.json();
  t.truthy(data.data[0].stm);
});

test('toRequest body has the correct structure', async (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
  });

  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));
  t.true(request.addEvent(newEmitterEventFromPayload({ e: 'pv', p: 'web' })));

  const req = request.toRequest()!;
  const data = await req.json();
  t.is(data.schema, 'iglu:com.snowplowanalytics.snowplow/payload_data/jsonschema/1-0-4');
  t.is(data.data.length, 2);
});
