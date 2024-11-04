import { newTracker } from '../src';

describe('Initialize new tracker', () => {
  it('creates a tracker with minimal config', async () => {
    expect(await newTracker({ namespace: 'test', endpoint: 'http://localhost:9090' })).toBeDefined();
  });
});
