import test from 'ava';

import { newInMemoryEventStore } from '../src/event_store';

test('count returns the number of events', async (t) => {
  const eventStore = newInMemoryEventStore({});
  await eventStore.add({ e: 'pv' });
  await eventStore.add({ e: 'pv' });

  t.is(await eventStore.count(), 2);
});

test('iterator returns all events', async (t) => {
  const eventStore = newInMemoryEventStore({});
  await eventStore.add({ e: 'pv' });
  await eventStore.add({ e: 'pv' });

  const iterator = eventStore.iterator();
  const { payload: first } = await iterator.next();
  const { payload: second } = await iterator.next();
  const { done } = await iterator.next();

  t.deepEqual(first, { e: 'pv' });
  t.deepEqual(second, { e: 'pv' });
  t.true(done);
});

test('removeHead removes the first n events', async (t) => {
  const eventStore = newInMemoryEventStore({});
  await eventStore.add({ e: 'pv' });
  await eventStore.add({ e: 'pv' });

  await eventStore.removeHead(1);

  t.is(await eventStore.count(), 1);
});

test('removeHead does nothing when there are no events', async (t) => {
  const eventStore = newInMemoryEventStore({});
  await eventStore.removeHead(1);

  t.is(await eventStore.count(), 0);
});

test('does not exceed maxSize', async (t) => {
  const eventStore = newInMemoryEventStore({ maxSize: 1 });
  await eventStore.add({ e: 'pv1' });
  await eventStore.add({ e: 'pv2' });

  t.is(await eventStore.count(), 1);
  t.is((await eventStore.iterator().next()).payload?.e, 'pv2');
});
