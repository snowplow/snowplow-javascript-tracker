import { SelfDescribingJson } from '@snowplow/tracker-core';
import { BrowserPlugin } from '@snowplow/browser-core';
import { Geolocation } from './contexts';

const navigatorAlias = navigator,
  _trackers: Record<string, [boolean, SelfDescribingJson<Geolocation> | undefined]> = {};

let geolocation: SelfDescribingJson<Geolocation>,
  geolocationContextAdded = false;

export function GeolocationPlugin(enableAtLoad: boolean = false): BrowserPlugin {
  let trackerId: string;

  return {
    activateBrowserPlugin: (tracker) => {
      trackerId = tracker.id;
      _trackers[tracker.id] = [false, undefined];

      if (enableAtLoad) {
        enableGeolocationContext([trackerId]);
      }
    },
    contexts: () => {
      let context = _trackers[trackerId]?.[1];
      if (context) {
        return [context];
      }

      return [];
    },
  };
}

/**
 * Attempts to create a context using the geolocation API and add it to commonContexts
 */
export function enableGeolocationContext(trackers: Array<string> = Object.keys(_trackers)) {
  trackers.forEach((t) => {
    //Mark as enabled
    _trackers[t] = [true, geolocation]; // Geolocation might still be undefined but it could also be set already
  });

  if (!geolocationContextAdded && navigatorAlias.geolocation && navigatorAlias.geolocation.getCurrentPosition) {
    geolocationContextAdded = true;
    navigatorAlias.geolocation.getCurrentPosition(function (position) {
      var coords = position.coords;
      geolocation = {
        schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
        data: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeLongitudeAccuracy: coords.accuracy,
          altitude: coords.altitude,
          altitudeAccuracy: coords.altitudeAccuracy,
          bearing: coords.heading,
          speed: coords.speed,
          timestamp: Math.round(position.timestamp),
        },
      };

      // Ensure all trackers with geolocation enabled have the context set
      for (const key in _trackers) {
        if (Object.prototype.hasOwnProperty.call(_trackers, key) && _trackers[key][0]) {
          _trackers[key] = [true, geolocation];
        }
      }
    });
  }
}
