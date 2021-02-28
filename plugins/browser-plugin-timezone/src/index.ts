import { determine } from 'jstimezonedetect';
import { BrowserTracker, BrowserPlugin } from '@snowplow/browser-core';

export function TimezonePlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      tracker.core.setTimezone(determine(typeof Intl !== 'undefined').name());
    },
  };
}
