import test from 'ava';

import { newEmitterRequest } from '../../src/emitter/emitter_request';
import { newEmitterEvent } from '../../src/emitter/emitter_event';

// MARK: - addEvent

test('addEvent adds an event to the request', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    maxPostBytes: 1000,
  });

  const event = newEmitterEvent({ e: 'pv' });

  request.addEvent(event);
  t.is(request.getEvents().length, 1);
});

// MARK: - countBytes

test('countBytes returns the correct byte count', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    maxPostBytes: 1000,
  });

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
  request.addEvent(newEmitterEvent({ e: 'pv', p: 'mob' }));
  t.is(request.countBytes(), 40);
});

// MARK: - countEvents

test('countEvents returns the correct event count', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    maxPostBytes: 1000,
  });

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
  request.addEvent(newEmitterEvent({ e: 'pv', p: 'mob' }));
  t.is(request.countEvents(), 2);
});

// MARK: - isFull

test('isFull returns false when not reached buffer size', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    maxPostBytes: 1000,
    bufferSize: 2,
  });

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
  t.false(request.isFull());
});

test('isFull returns true when reached buffer size', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    maxPostBytes: 1000,
    bufferSize: 2,
  });

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
  request.addEvent(newEmitterEvent({ e: 'pv', p: 'mob' }));
  t.true(request.isFull());
});

test('isFull returns true when reached max post bytes', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    maxPostBytes: 10,
    bufferSize: 2,
  });

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
  t.true(request.isFull());
});

// MARK: - toRequest

test('toRequest returns a Request object with default settings', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
  });

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
  const req = request.toRequest()!;
  t.is(req.url, 'https://example.com/com.snowplowanalytics.snowplow/tp2');
  t.is(req.method, 'POST');
  t.is(req.headers.get('Content-Type'), 'application/json; charset=UTF-8');
  t.is(req.headers.get('SP-Anonymous'), null);
  t.is(req.keepalive, true);
});

test('toRequest builds a GET request when method is get', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    eventMethod: 'get',
    useStm: false,
  });

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
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

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
  const req = request.toRequest()!;
  t.regex(req.url, /stm=\d+/);
});

test('toRequest includes custom headers', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    customHeaders: { 'X-Test': 'test' },
  });

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
  const req = request.toRequest()!;
  t.is(req.headers.get('X-Test'), 'test');
});

test('toRequest includes server anonymization header', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    serverAnonymization: true,
  });

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
  const req = request.toRequest()!;
  t.is(req.headers.get('SP-Anonymous'), '*');
});

test('toRequest contains keepalive', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    keepalive: false,
  });

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
  const req = request.toRequest()!;
  t.is(req.keepalive, false);
});

test('toRequest URL contains custom POST path', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    postPath: '/custom',
  });

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
  const req = request.toRequest()!;
  t.is(req.url, 'https://example.com/custom');
});

test('toRequest URL adds default protocol when missing', (t) => {
  const request = newEmitterRequest({
    endpoint: 'example.com',
  });

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
  const req = request.toRequest()!;
  t.is(req.url, 'https://example.com/com.snowplowanalytics.snowplow/tp2');
});

test('toRequest URL adds protocol and port', (t) => {
  const request = newEmitterRequest({
    endpoint: 'example.com',
    protocol: 'http',
    port: 9090,
  });

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
  const req = request.toRequest()!;
  t.is(req.url, 'http://example.com:9090/com.snowplowanalytics.snowplow/tp2');
});

test('toRequest URL does not add protocol if already contains', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    protocol: 'http',
  });

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
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

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
  const req = request.toRequest()!;
  t.is(req.credentials, 'include');
});

test('toRequest contains credentials', (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    credentials: 'omit',
  });

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
  const req = request.toRequest()!;
  t.is(req.credentials, 'omit');
});

test('toRequest adds stm to POST request', async (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
    useStm: true,
  });

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
  const req = request.toRequest()!;
  const data = await req.json();
  t.truthy(data.data[0].stm);
});

test('toRequest body has the correct structure', async (t) => {
  const request = newEmitterRequest({
    endpoint: 'https://example.com',
  });

  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));
  request.addEvent(newEmitterEvent({ e: 'pv', p: 'web' }));

  const req = request.toRequest()!;
  const data = await req.json();
  t.is(data.schema, 'iglu:com.snowplowanalytics.snowplow/payload_data/jsonschema/1-0-4');
  t.is(data.data.length, 2);
});
