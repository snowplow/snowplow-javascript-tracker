import test from 'ava';

import { newEmitterEvent } from '../../src/emitter/emitter_event';

test('getGETRequestURL returns the correct URL with stm', (t) => {
  const collectorUrl = 'https://example.com';
  const payload = { e: 'pv' };
  const event = newEmitterEvent(payload);
  const url = event.getGETRequestURL(collectorUrl, true);
  t.is(url, `${collectorUrl}?stm=${new Date().getTime()}&e=pv`);
});

test('getGETRequestURL returns the correct URL without stm', (t) => {
  const collectorUrl = 'https://example.com';
  const payload = { e: 'pv' };
  const event = newEmitterEvent(payload);
  const url = event.getGETRequestURL(collectorUrl, false);
  t.is(url, `${collectorUrl}?e=pv`);
});

test('getGETRequestBytesCount returns the correct byte count', (t) => {
  const payload = { e: 'pv', p: 'web' };
  const event = newEmitterEvent(payload);
  const count = event.getGETRequestBytesCount();
  t.is(count, 11);
});

test('getPOSTRequestBody processes integer into string values', (t) => {
  const payload = { e: 'pv', x: 12 };
  const event = newEmitterEvent(payload);
  const body = event.getPOSTRequestBody();
  t.deepEqual(body, { e: 'pv', x: '12' });
});

test('getPOSTRequestBytesCount returns the correct byte count', (t) => {
  const payload = { e: 'pv', p: 'web' };
  const event = newEmitterEvent(payload);
  const count = event.getPOSTRequestBytesCount();
  t.is(count, 20);
});

test('getPayload returns the payload', (t) => {
  const payload = { e: 'pv' };
  const event = newEmitterEvent(payload);
  t.deepEqual(event.getPayload(), payload);
});
