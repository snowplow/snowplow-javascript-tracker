import test from 'ava';

import { newEmitterEvent } from '../../src/emitter/emitter_event';
import { newEventStorePayload } from '../../src/event_store_payload';

test('getGETRequestURL returns the correct URL with stm', (t) => {
  const collectorUrl = 'https://example.com';
  const payload = { e: 'pv' };
  const event = newEmitterEvent(newEventStorePayload({ payload }));
  const url = event.getGETRequestURL(collectorUrl, true);
  t.regex(url, new RegExp(`${collectorUrl}\\?stm=\\d+&e=pv`));
});

test('getGETRequestURL returns the correct URL without stm', (t) => {
  const collectorUrl = 'https://example.com';
  const payload = { e: 'pv', p: 'web' };
  const event = newEmitterEvent(newEventStorePayload({ payload }));
  const url = event.getGETRequestURL(collectorUrl, false);
  t.is(url, `${collectorUrl}?e=pv&p=web`);
});

test('getGETRequestBytesCount returns the correct byte count', (t) => {
  const payload = { e: 'pv', p: 'web' };
  const event = newEmitterEvent(newEventStorePayload({ payload }));
  const count = event.getGETRequestBytesCount();
  t.is(count, 11);
});

test('getPOSTRequestBody processes integer into string values', (t) => {
  const payload = { e: 'pv', x: 12 };
  const event = newEmitterEvent(newEventStorePayload({ payload }));
  const body = event.getPOSTRequestBody();
  t.deepEqual(body, { e: 'pv', x: '12' });
});

test('getPOSTRequestBytesCount returns the correct byte count', (t) => {
  const payload = { e: 'pv', p: 'web' };
  const event = newEmitterEvent(newEventStorePayload({ payload }));
  const count = event.getPOSTRequestBytesCount();
  t.is(count, 20);
});

test('getPOSTRequestBytesCount counts multibyte chars properly', (t) => {
  const payload = { e: 'pv', p: '🍕' };
  const event = newEmitterEvent(newEventStorePayload({ payload }));
  const count = event.getPOSTRequestBytesCount();
  t.is(count, 21);
});

test('getPayload returns the payload', (t) => {
  const payload = { e: 'pv' };
  const event = newEmitterEvent(newEventStorePayload({ payload }));
  t.deepEqual(event.getPayload(), payload);
});

test('getServerAnonymization returns the serverAnonymization value', (t) => {
  const payload = { e: 'pv' };
  const event = newEmitterEvent(newEventStorePayload({ payload, svrAnon: true }));
  t.true(event.getServerAnonymization());
});

test('getServerAnonymization returns false by default', (t) => {
  const payload = { e: 'pv' };
  const event = newEmitterEvent(newEventStorePayload({ payload }));
  t.false(event.getServerAnonymization());
});
