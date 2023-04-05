import { BrowserPlugin } from '@snowplow/browser-tracker-core';
import { constructNavigationTimingContext, getPerformanceNavigationTimingContext } from './contexts';
import { SelfDescribingJson } from '@snowplow/tracker-core';

let navigationTimingEntry: SelfDescribingJson<Record<string, unknown>>[];

/**
 * Adds Performance Navigation Timing context to events
 *
 * @remarks
 * May not be fully populated when initial Page View fires
 * Often a good idea to take the latest performance timing context
 * for a given page view id when analyzing in the warehouse
 */
export function PerformanceNavigationTimingPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: () => {
      /* Setup a PerformanceObserver to allow caching of a completed navigation timing entry. We don't need to query the API after that. */
      if (typeof PerformanceObserver !== 'undefined') {
        const perfObserver = new PerformanceObserver((observedEntries) => {
          const [observedNavigationTiming] = observedEntries.getEntries() as PerformanceNavigationTiming[];
          /* We mark the entry as final by the measurement of loadEventEnd which is the final in the processing model  */
          if (observedNavigationTiming.loadEventEnd > 0) {
            navigationTimingEntry = constructNavigationTimingContext(observedNavigationTiming);
          }
        });

        perfObserver.observe({
          type: 'navigation',
          buffered: true,
        });
      }
    },
    contexts: () => navigationTimingEntry || getPerformanceNavigationTimingContext(),
  };
}
