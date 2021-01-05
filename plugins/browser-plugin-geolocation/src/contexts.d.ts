/**
 * Schema for client geolocation contexts
 */
export interface Geolocation {
  latitude: number;
  longitude: number;
  latitudeLongitudeAccuracy?: number | null;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  bearing?: number | null;
  speed?: number | null;
  timestamp?: number | null;
  [key: string]: unknown;
}
