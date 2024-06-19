import { buildSelfDescribingEvent, trackerCore } from '@snowplow/tracker-core';
import { EventSpecificationsPlugin } from '../src';
import { BrowserTracker } from '@snowplow/browser-tracker-core';

describe('Event Specifications plugin', () => {
  it('Detects matching event and adds context', (done) => {
    const playEventSpecificationId = '1234';
    const eventSpecsPlugin = EventSpecificationsPlugin({
      SnowplowMediaPlugin: { play_event: playEventSpecificationId },
    });
    const core = trackerCore({
      base64: false,
      corePlugins: [
        eventSpecsPlugin,
        {
          afterTrack(payload) {
            let context = JSON.parse(payload.co as string);
            expect(context.data[0].schema).toMatch(
              'iglu:com.snowplowanalytics.snowplow/event_specification/jsonschema/1-0-0'
            );
            expect(context.data[0].data).toEqual({ id: playEventSpecificationId });
            done();
          },
        },
      ],
    });

    eventSpecsPlugin.activateBrowserPlugin?.({ core } as BrowserTracker);
    core.track(
      buildSelfDescribingEvent({
        event: {
          schema: 'iglu:com.snowplowanalytics.snowplow.media/play_event/jsonschema/1-0-0',
          data: {},
        },
      })
    );
  });

  it('Does not add context on non-matching event', (done) => {
    const eventSpecsPlugin = EventSpecificationsPlugin({
      SnowplowMediaPlugin: { pause_event: '1234' },
    });
    const core = trackerCore({
      base64: false,
      corePlugins: [
        eventSpecsPlugin,
        {
          afterTrack(payload) {
            const context = payload.co as string;
            expect(context).toBe(undefined);
            done();
          },
        },
      ],
    });

    eventSpecsPlugin.activateBrowserPlugin?.({ core } as BrowserTracker);
    core.track(
      buildSelfDescribingEvent({
        event: {
          schema: 'iglu:com.snowplowanalytics.snowplow.media/play_event/jsonschema/1-0-0',
          data: {},
        },
      })
    );
  });
});
