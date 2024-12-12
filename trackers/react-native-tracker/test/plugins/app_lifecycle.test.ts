import { AppState } from 'react-native';
import { BACKGROUND_EVENT_SCHEMA, LIFECYCLE_CONTEXT_SCHEMA } from '../../src/constants';
import { buildPageView, Payload, trackerCore } from '@snowplow/tracker-core';
import { newAppLifecyclePlugin } from '../../src/plugins/app_lifecycle';

describe('Application lifecycle plugin', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('tracks events on app state changes', async () => {
    const appStateSpy = jest.spyOn(AppState, 'addEventListener');

    const payloads: Payload[] = [];
    const tracker = trackerCore({
      callback: (pb) => payloads.push(pb.build()),
      base64: false,
    });
    const appLifecyclePlugin = await newAppLifecyclePlugin({}, tracker);
    tracker.addPlugin(appLifecyclePlugin);

    appStateSpy.mock.calls?.[0]?.[1]('background');

    expect(payloads.length).toBe(1);
    expect(payloads[0]?.ue_pr ?? '').toContain(BACKGROUND_EVENT_SCHEMA);
  });

  it('attaches lifecycle context to events with the correct properties', async () => {
    const appStateSpy = jest.spyOn(AppState, 'addEventListener');

    const payloads: Payload[] = [];
    const tracker = trackerCore({
      callback: (pb) => payloads.push(pb.build()),
      base64: false,
    });
    const appLifecyclePlugin = await newAppLifecyclePlugin({}, tracker);
    tracker.addPlugin(appLifecyclePlugin);

    tracker.track(buildPageView({ pageUrl: 'http://localhost' }));

    expect(payloads.length).toBe(1);
    expect(JSON.parse(payloads[0]?.co as string).data).toEqual([
      {
        schema: LIFECYCLE_CONTEXT_SCHEMA,
        data: {
          isVisible: true,
          index: 1,
        },
      },
    ]);

    payloads.length = 0;
    appStateSpy.mock.calls?.[0]?.[1]('background');

    expect(payloads.length).toBe(1);
    expect(JSON.parse(payloads[0]?.co as string).data).toEqual([
      {
        schema: LIFECYCLE_CONTEXT_SCHEMA,
        data: {
          isVisible: false,
          index: 1,
        },
      },
    ]);

    payloads.length = 0;
    appStateSpy.mock.calls?.[0]?.[1]('active');

    expect(payloads.length).toBe(1);
    expect(JSON.parse(payloads[0]?.co as string).data).toEqual([
      {
        schema: LIFECYCLE_CONTEXT_SCHEMA,
        data: {
          isVisible: true,
          index: 2,
        },
      },
    ]);
  });

  it('removes subscription on tracker deactivation', async () => {
    const appStateSpy = jest.spyOn(AppState, 'addEventListener');
    const removeSpy = jest.fn();
    appStateSpy.mockReturnValue({ remove: removeSpy });

    const tracker = trackerCore({
      callback: () => {},
      base64: false,
    });
    const appLifecyclePlugin = await newAppLifecyclePlugin({}, tracker);
    tracker.addPlugin(appLifecyclePlugin);

    expect(appStateSpy).toHaveBeenCalledTimes(1);
    tracker.deactivate();
    expect(removeSpy).toHaveBeenCalledTimes(1);
  });
});
