import { APPLICATION_CONTEXT_SCHEMA } from '../../src/tracker/schemata';
import { createTracker } from '../helpers';

describe('Application context:', () => {
  it('Adds the entity when the appVersion option is configured', (done) => {
    const tracker = createTracker({
      appVersion: '1.0.2-beta.2',
      plugins: [
        {
          filter: (payload) => {
            const { data: payloadData } = JSON.parse(payload.co as string);
            const appContext = payloadData.find((context: any) => context.schema.match(APPLICATION_CONTEXT_SCHEMA));
            expect(appContext).toBeTruthy();
            expect(appContext.data.version).toBe('1.0.2-beta.2');
            done();
            return false;
          },
        },
      ],
    });

    tracker?.trackPageView();
  });

  it('Does not attach the entity if not configured', (done) => {
    const tracker = createTracker({
      plugins: [
        {
          filter: (payload) => {
            const { data: payloadData } = JSON.parse(payload.co as string);
            const applicationContext = payloadData.find((context: any) =>
              context.schema.match(APPLICATION_CONTEXT_SCHEMA)
            );
            expect(applicationContext).toBeUndefined();
            done();
            return false
          },
        },
      ],
    });

    tracker?.trackPageView();
  });
});
