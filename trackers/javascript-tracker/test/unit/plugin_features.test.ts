import { SelfDescribingJson } from '@snowplow/tracker-core';
import { Plugins } from '../../src/features';

describe('Performance Navigation Timing', () => {
  let windowSpy: any;

  const otherContexts = {
    webPage: false,
    session: false,
    performanceTiming: false,
    gaCookies: false,
    geolocation: false,
    clientHints: false,
    webVitals: false,
  };

  const hasPerformanceNavigationTimingContext = (plugins: ReturnType<typeof Plugins>): boolean => {
    const pluginContexts = plugins.map((plugin) => plugin[0]?.contexts?.());
    const hasPerformanceContext = pluginContexts.some((contexts?: SelfDescribingJson[]) =>
      contexts?.some(
        (context: { schema?: string }) => context.schema === 'iglu:org.w3/PerformanceNavigationTiming/jsonschema/1-0-0'
      )
    );
    return hasPerformanceContext;
  };

  beforeEach(() => {
    windowSpy = jest.spyOn(global, 'window', 'get');

    // The PerformanceNavigationTiming context will only be added if the plugin can:
    // - Access the `performance` object on the window
    // - See that a value is returned from `getEntriesByType`
    windowSpy.mockImplementation(() => ({
      performance: {
        getEntriesByType: () => [{}],
      },
    }));
  });

  it('Is enabled if contexts.performanceNavigationTiming is true', () => {
    const plugins = Plugins({
      contexts: {
        performanceNavigationTiming: true,
        ...otherContexts,
      },
    });

    expect(hasPerformanceNavigationTimingContext(plugins)).toBe(true);
  });

  it('Is disabled if contexts.performanceNavigationTiming is false', () => {
    const plugins = Plugins({
      contexts: {
        performanceNavigationTiming: false,
        ...otherContexts,
      },
    });

    expect(hasPerformanceNavigationTimingContext(plugins)).toBe(false);
  });
});
