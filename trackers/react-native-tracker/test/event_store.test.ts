import { newReactNativeEventStore } from '../src/event_store';

describe('React Native event store', () => {
  it('keeps track of added events', async () => {
    const eventStore = await newReactNativeEventStore({
      namespace: 'test',
    });

    expect(await eventStore.add({ payload: { e: 'pv' } })).toBe(1);
    expect(await eventStore.add({ payload: { e: 'pp' } })).toBe(2);
    expect(await eventStore.count()).toBe(2);

    expect(await eventStore.getAll()).toEqual([{ payload: { e: 'pv' } }, { payload: { e: 'pp' } }]);

    expect((await eventStore.iterator().next()).value?.payload).toEqual({ e: 'pv' });

    await eventStore.removeHead(1);
    expect(await eventStore.count()).toBe(1);
    expect(await eventStore.getAll()).toEqual([{ payload: { e: 'pp' } }]);
  });

  it('separates event stores by namespace', async () => {
    const eventStore1 = await newReactNativeEventStore({
      namespace: 'test1',
    });
    const eventStore2 = await newReactNativeEventStore({
      namespace: 'test2',
    });

    await eventStore1.add({ payload: { e: 'pv1' } });
    await eventStore2.add({ payload: { e: 'pv2' } });

    expect(await eventStore1.count()).toBe(1);
    expect(await eventStore2.count()).toBe(1);

    expect(await eventStore1.getAll()).toEqual([{ payload: { e: 'pv1' } }]);
    expect(await eventStore2.getAll()).toEqual([{ payload: { e: 'pv2' } }]);
  });

  it('syncs with AsyncStorage', async () => {
    const eventStore1 = await newReactNativeEventStore({
      namespace: 'testA',
    });

    await eventStore1.add({ payload: { e: 'pv' } });
    await eventStore1.add({ payload: { e: 'pp' } });

    const eventStore2 = await newReactNativeEventStore({
      namespace: 'testA',
    });

    expect(await eventStore2.count()).toBe(2);
  });
});
