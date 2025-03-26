import { Payload, trackerCore } from '@snowplow/tracker-core';
import { newAppInstallPlugin } from '../../src/plugins/app_install';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APPLICATION_INSTALL_EVENT_SCHEMA } from '../../src/constants';

describe('Application install plugin', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('tracks an app install event on first tracker init', async () => {
    const tracker = trackerCore({
      callback: (pb) => payloads.push(pb.build()),
      base64: false,
    });
    const appInstallPlugin = newAppInstallPlugin(
      {
        asyncStorage: AsyncStorage,
        namespace: 'test',
        installAutotracking: true,
      },
      tracker
    );
    tracker.addPlugin(appInstallPlugin);

    const payloads: Payload[] = [];

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(payloads.length).toBe(1);
    const [{ ue_pr }] = payloads as any;
    expect(ue_pr).toContain(APPLICATION_INSTALL_EVENT_SCHEMA);
  });

  it('does not track an app install event on subsequent tracker inits', async () => {
    const tracker1 = trackerCore({
      callback: (pb) => payloads.push(pb.build()),
      base64: false,
    });
    tracker1.addPlugin(
      newAppInstallPlugin(
        {
          asyncStorage: AsyncStorage,
          namespace: 'test',
          installAutotracking: true,
        },
        tracker1
      )
    );

    const payloads: Payload[] = [];
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(payloads.length).toBe(1);

    const tracker2 = trackerCore({
      callback: (pb) => payloads.push(pb.build()),
      base64: false,
    });
    tracker2.addPlugin(
      newAppInstallPlugin(
        {
          asyncStorage: AsyncStorage,
          namespace: 'test',
          installAutotracking: true,
        },
        tracker2
      )
    );

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(payloads.length).toBe(1);
  });

  it('does not track an app install event when autotracking is disabled', async () => {
    const tracker = trackerCore({
      callback: (pb) => payloads.push(pb.build()),
      base64: false,
    });
    const appInstallPlugin = newAppInstallPlugin(
      {
        asyncStorage: AsyncStorage,
        namespace: 'test',
      },
      tracker
    );
    tracker.addPlugin(appInstallPlugin);

    const payloads: Payload[] = [];

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(payloads.length).toBe(0);
  });
});
