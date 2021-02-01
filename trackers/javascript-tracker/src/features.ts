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
import { BrowserFeaturesPlugin } from '@snowplow/browser-plugin-browser-features';
import { TimezonePlugin } from '@snowplow/browser-plugin-timezone';
import { plugins } from '../tracker.config';
import { Plugin } from '@snowplow/tracker-core';
import { ApiMethods, ApiPlugin } from '@snowplow/browser-core';

export function Plugins(argmap: any) {
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
    } = argmap?.contexts ?? {},
    gdprPlugin = plugins.gdpr ? GdprPlugin() : null,
    geolocationPlugin = plugins.geolocation ? GeolocationPlugin(geolocation) : null,
    activatedPlugins: Array<Plugin | ApiPlugin<ApiMethods>> = [];

  // --- Context Plugins ---

  if (plugins.optimizely) {
    activatedPlugins.push(
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
    activatedPlugins.push(PerformanceTimingPlugin());
  }

  if (plugins.optimizelyX && optimizelyXSummary) {
    activatedPlugins.push(OptimizelyXPlugin());
  }

  if (plugins.clientHints && clientHints) {
    activatedPlugins.push(ClientHintsPlugin(clientHints.includeHighEntropy ? true : false));
  }

  if (plugins.parrable && parrable) {
    activatedPlugins.push(ParrablePlugin());
  }

  if (plugins.gaCookies && gaCookies) {
    activatedPlugins.push(GaCookiesPlugin());
  }

  if (geolocationPlugin) {
    // Always add as has API which could enable the context
    activatedPlugins.push(geolocationPlugin);
  }

  if (gdprPlugin) {
    // Always add as has API which could enable the context
    activatedPlugins.push(gdprPlugin);
  }

  // --- API Plugins ---
  if (geolocationPlugin) {
    activatedPlugins.push(geolocationPlugin);
  }

  if (gdprPlugin) {
    activatedPlugins.push(gdprPlugin);
  }

  if (plugins.linkClickTracking) {
    activatedPlugins.push(LinkClickTrackingPlugin());
  }

  if (plugins.formTracking) {
    activatedPlugins.push(FormTrackingPlugin());
  }

  if (plugins.errorTracking) {
    activatedPlugins.push(ErrorTrackingPlugin());
  }

  if (plugins.browserFeatures) {
    activatedPlugins.push(BrowserFeaturesPlugin());
  }

  if (plugins.timezone) {
    activatedPlugins.push(TimezonePlugin());
  }

  return activatedPlugins;
}
