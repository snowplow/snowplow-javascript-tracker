import { ClientHintsPlugin } from '@snowplow/browser-plugin-client-hints';
import { OptimizelyPlugin } from '@snowplow/browser-plugin-optimizely';
import { OptimizelyXPlugin } from '@snowplow/browser-plugin-optimizely-x';
import { ParrablePlugin } from '@snowplow/browser-plugin-parrable';
import { PerformanceTimingPlugin } from '@snowplow/browser-plugin-performance-timing';
import { GdprPlugin } from '@snowplow/browser-plugin-gdpr';
import { GeolocationPlugin } from '@snowplow/browser-plugin-geolocation';
import { GaCookiesPlugin } from '@snowplow/browser-plugin-ga-cookies';
import { LinkClickTrackingPlugin } from '@snowplow/browser-plugin-link-click-tracking';
import { FormTrackingPlugin } from '@snowplow/browser-plugin-form-tracking';
import { ErrorTrackingPlugin } from '@snowplow/browser-plugin-error-tracking';
import {
  DetectScreen,
  DetectDocument,
  DetectWindow,
  DetectCookie,
  DetectTimezone,
  DetectBrowserFeatures,
} from '@snowplow/browser-detectors';
import { plugins } from '../../tracker.config';
import { detectors } from '../../tracker.config';
export function Plugins(argmap) {
  const {
      performanceTiming,
      gaCookies,
      geolocation,
      optimizelyExperiments,
      optimizelyStates,
      optimizelyVariations,
      optimizelyVisitor,
      optimizelyAudiences,
      optimizelyDimensions,
      optimizelySummary,
      optimizelyXSummary,
      parrable,
      clientHints,
    } = argmap.contexts || {},
    gdprPlugin = plugins.gdpr ? GdprPlugin() : null,
    geolocationPlugin = plugins.geolocation ? GeolocationPlugin(geolocation) : null,
    contextPlugins = [],
    apiPlugins = [];

  // --- Context Plugins ---

  if (plugins.optimizely) {
    contextPlugins.push(
      OptimizelyPlugin(
        optimizelySummary,
        optimizelyExperiments,
        optimizelyStates,
        optimizelyVariations,
        optimizelyVisitor,
        optimizelyAudiences,
        optimizelyDimensions
      )
    );
  }

  if (plugins.performanceTiming && performanceTiming) {
    contextPlugins.push(PerformanceTimingPlugin());
  }

  if (plugins.optimizelyX && optimizelyXSummary) {
    contextPlugins.push(OptimizelyXPlugin());
  }

  if (plugins.clientHints && clientHints) {
    contextPlugins.push(ClientHintsPlugin(clientHints.includeHighEntropy ? true : false));
  }

  if (plugins.parrable && parrable) {
    contextPlugins.push(ParrablePlugin());
  }

  if (plugins.gaCookies && gaCookies) {
    contextPlugins.push(GaCookiesPlugin());
  }

  if (geolocationPlugin) {
    // Always add as has API which could enable the context
    contextPlugins.push(geolocationPlugin);
  }

  if (gdprPlugin) {
    // Always add as has API which could enable the context
    contextPlugins.push(gdprPlugin);
  }

  // --- API Plugins ---
  if (geolocationPlugin) {
    apiPlugins.push(geolocationPlugin);
  }

  if (gdprPlugin) {
    apiPlugins.push(gdprPlugin);
  }

  if (plugins.linkClickTracking) {
    apiPlugins.push(LinkClickTrackingPlugin());
  }

  if (plugins.formTracking) {
    apiPlugins.push(FormTrackingPlugin());
  }

  if (plugins.errorTracking) {
    apiPlugins.push(ErrorTrackingPlugin());
  }

  return {
    contextPlugins: contextPlugins,
    apiPlugins: apiPlugins,
  };
}

export function Detectors(argmap) {
  const { cookie, screen, window, document, timezone, browserFeatures } = argmap.detectors || {},
    selectedDetectors = {};

  if (detectors.cookie && (cookie ?? true)) {
    selectedDetectors.cookie = DetectCookie();
  }

  if (detectors.screen && (screen ?? true)) {
    selectedDetectors.screen = DetectScreen();
  }

  if (detectors.window && (window ?? true)) {
    selectedDetectors.window = DetectWindow();
  }

  if (detectors.document && (document ?? true)) {
    selectedDetectors.document = DetectDocument();
  }

  if (detectors.timezone && (timezone ?? true)) {
    selectedDetectors.timezone = DetectTimezone();
  }

  if (detectors.browserFeatures && (browserFeatures ?? true)) {
    selectedDetectors.browserFeatures = DetectBrowserFeatures();
  }

  return selectedDetectors;
}
