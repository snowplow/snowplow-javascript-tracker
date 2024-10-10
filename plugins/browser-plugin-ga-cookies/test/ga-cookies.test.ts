import { buildLinkClick, trackerCore } from '@snowplow/tracker-core';
import { GaCookiesPlugin } from '../src';

describe('GA Cookies plugin', () => {
  let cookieJar: string;

  beforeAll(() => {
    cookieJar = '';
    jest.spyOn(document, 'cookie', 'set').mockImplementation((cookie) => {
      cookieJar += cookie;
    });
    jest.spyOn(document, 'cookie', 'get').mockImplementation(() => cookieJar);
  });

  afterEach(() => {
    cookieJar = '';
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('Returns values for GA4 cookies by default', (done) => {
    const containerId = '1234';
    document.cookie = `_ga=1234; __utma=567; _ga_${containerId}=567;`;
    const core = trackerCore({
      corePlugins: [GaCookiesPlugin()],
      callback: (payloadBuilder) => {
        const { data } = payloadBuilder.getJson()[1].json;
        expect(data).toMatchSnapshot();
        done();
      },
    });

    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('Does not add any additional GA4 context when GA4 cookies are not detected', (done) => {
    /* In v3, an empty Universal Analytics cookies context was added to the contexts array. */
    const containerId = '1234';
    const measurementId = `G-${containerId}`;
    document.cookie = ``;
    const core = trackerCore({
      corePlugins: [GaCookiesPlugin({ ua: true, ga4MeasurementId: measurementId })],
      callback: (payloadBuilder) => {
        const { data } = payloadBuilder.getJson()[1].json;
        expect(data).toMatchSnapshot();
        done();
      },
    });

    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('Returns values for GA4 cookies and Universal Analytics cookies', (done) => {
    const containerId = '1234';
    const measurementId = `G-${containerId}`;
    document.cookie = `_ga=1234; __utma=567; _ga_${containerId}=567;`;
    const core = trackerCore({
      corePlugins: [GaCookiesPlugin({ ua: true, ga4MeasurementId: measurementId })],
      callback: (payloadBuilder) => {
        const { data } = payloadBuilder.getJson()[1].json;
        expect(data).toMatchSnapshot();
        done();
      },
    });

    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('Returns values for GA4 cookies and not Universal Analytics cookies', (done) => {
    const containerId = '1234';
    const measurementId = `G-${containerId}`;
    document.cookie = `_ga=1234; __utma=567; _ga_${containerId}=567;`;
    const core = trackerCore({
      corePlugins: [GaCookiesPlugin({ ua: false, ga4: true, ga4MeasurementId: measurementId })],
      callback: (payloadBuilder) => {
        const { data } = payloadBuilder.getJson()[1].json;
        expect(data).toMatchSnapshot();
        done();
      },
    });

    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('Correctly returns values for GA4 cookies for multiple measurement ids', (done) => {
    const containerIdFoo = '1234';
    const containerIdBar = '5678';
    const measurementIds = [`G-${containerIdFoo}`, `G-${containerIdBar}`];
    document.cookie = `_ga=1234; __utma=567; _ga_${containerIdFoo}=567; _ga_${containerIdBar}=789;`;
    const core = trackerCore({
      corePlugins: [GaCookiesPlugin({ ua: false, ga4: true, ga4MeasurementId: measurementIds })],
      callback: (payloadBuilder) => {
        const { data } = payloadBuilder.getJson()[1].json;
        expect(data).toMatchSnapshot();
        done();
      },
    });

    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('Correctly returns values for GA4 cookies with cookie prefix', (done) => {
    const containerId = '1234';
    const measurementId = `G-${containerId}`;
    const cookiePrefix = 'test';
    document.cookie = `${cookiePrefix}_ga=1234; __utma=567; ${cookiePrefix}_ga_${containerId}=567;`;
    const core = trackerCore({
      corePlugins: [GaCookiesPlugin({ ua: false, ga4: true, ga4MeasurementId: measurementId, cookiePrefix })],
      callback: (payloadBuilder) => {
        const { data } = payloadBuilder.getJson()[1].json;
        expect(data).toMatchSnapshot();
        done();
      },
    });

    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('Only returns values for GA4 user cookies without measurement id/s and GA4 enabled', (done) => {
    const containerId = '1234';
    document.cookie = `_ga=1234; __utma=567; _ga_${containerId}=567;`;
    const core = trackerCore({
      corePlugins: [GaCookiesPlugin({ ua: false, ga4: true })],
      callback: (payloadBuilder) => {
        const { data } = payloadBuilder.getJson()[1].json;
        expect(data).toMatchSnapshot();
        done();
      },
    });

    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('Returns separate contexts for GA4 enabled setup with different cookie_prefix options', (done) => {
    const containerId = '1234';
    const cookiePrefix = 'test';
    /* gtag.js with the { cookie_prefix } option will create {cookie_prefix}_ga and {cookie_prefix}_ga_{containerId} cookies. */
    document.cookie = `_ga=1234; __utma=567; _ga_${containerId}=567; ${cookiePrefix}_ga=890;`;
    const core = trackerCore({
      corePlugins: [GaCookiesPlugin({ ua: false, ga4: true, cookiePrefix })],
      callback: (payloadBuilder) => {
        const { data } = payloadBuilder.getJson()[1].json;
        expect(data).toMatchSnapshot();
        done();
      },
    });

    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });

  it('Returns separate contexts for GA4 enabled setup with different cookie_prefix options and measurement ids', (done) => {
    const containerId = '1234';
    const measurementId = `G-${containerId}`;
    const prefixContainerId = '567';
    const prefixMeasurementId = `G-${prefixContainerId}`;
    const cookiePrefix = 'test';
    /* gtag.js with the { cookie_prefix } option will create {cookie_prefix}_ga and {cookie_prefix}_ga_{containerId} cookies. */
    document.cookie = `_ga=1234; __utma=567; _ga_${containerId}=567; ${cookiePrefix}_ga=890; ${cookiePrefix}_ga_${prefixContainerId}=098`;
    const core = trackerCore({
      corePlugins: [
        GaCookiesPlugin({ ua: false, ga4: true, cookiePrefix, ga4MeasurementId: [measurementId, prefixMeasurementId] }),
      ],
      callback: (payloadBuilder) => {
        const { data } = payloadBuilder.getJson()[1].json;
        expect(data).toMatchSnapshot();
        done();
      },
    });

    core.track(buildLinkClick({ targetUrl: 'https://example.com' }));
  });
});
