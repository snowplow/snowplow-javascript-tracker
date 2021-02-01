import { Plugin, SelfDescribingJson } from '@snowplow/tracker-core';
import { ApiPlugin, ApiMethods } from '@snowplow/browser-core';
import { Geolocation } from './contexts';

interface GeolocationMethods extends ApiMethods {
  enableGeolocationContext: () => void;
}

const GeolocationPlugin = (enableAtLoad: boolean = false): Plugin & ApiPlugin<GeolocationMethods> => {
  let geolocation: SelfDescribingJson<Geolocation>;
  let geolocationContextAdded = false;
  let navigatorAlias: Navigator = navigator;

  if (enableAtLoad) {
    enableGeolocationContext();
  }

  /**
   * Attempts to create a context using the geolocation API and add it to commonContexts
   */
  function enableGeolocationContext() {
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
      });
    }
  }

  return {
    contexts: () => {
      return geolocation ? [geolocation] : [];
    },
    apiMethods: {
      enableGeolocationContext,
    },
  };
};

export { GeolocationPlugin };
