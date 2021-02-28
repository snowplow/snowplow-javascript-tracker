import * as ClientHints from '@snowplow/browser-plugin-client-hints';
import * as Optimizely from '@snowplow/browser-plugin-optimizely';
import * as OptimizelyX from '@snowplow/browser-plugin-optimizely-x';
import * as Parrable from '@snowplow/browser-plugin-parrable';
import * as PerformanceTiming from '@snowplow/browser-plugin-performance-timing';
import * as Gdpr from '@snowplow/browser-plugin-gdpr';
import * as Geolocation from '@snowplow/browser-plugin-geolocation';
import * as GaCookies from '@snowplow/browser-plugin-ga-cookies';
import * as LinkClickTracking from '@snowplow/browser-plugin-link-click-tracking';
import * as FormTracking from '@snowplow/browser-plugin-form-tracking';
import * as ErrorTracking from '@snowplow/browser-plugin-error-tracking';
import * as BrowserFeatures from '@snowplow/browser-plugin-browser-features';
import * as Timezone from '@snowplow/browser-plugin-timezone';
import * as Ecommerce from '@snowplow/browser-plugin-ecommerce';
import * as EnhancedEcommerce from '@snowplow/browser-plugin-enhanced-ecommerce';
import { plugins } from '../tracker.config';
import { BrowserPlugin } from '@snowplow/browser-core';

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
  } = argmap?.contexts ?? {};
  const activatedPlugins: Array<[BrowserPlugin, {} | Record<string, Function>]> = [];

  if (
    plugins.optimizely &&
    (optimizelySummary ||
      optimizelyExperiments ||
      optimizelyStates ||
      optimizelyVariations ||
      optimizelyVisitor ||
      optimizelyAudiences ||
      optimizelyDimensions)
  ) {
    const { OptimizelyPlugin, ...apiMethods } = Optimizely;
    activatedPlugins.push([
      OptimizelyPlugin(
        optimizelySummary,
        optimizelyExperiments,
        optimizelyStates,
        optimizelyVariations,
        optimizelyVisitor,
        optimizelyAudiences,
        optimizelyDimensions
      ),
      apiMethods,
    ]);
  }

  if (plugins.performanceTiming && performanceTiming) {
    const { PerformanceTimingPlugin, ...apiMethods } = PerformanceTiming;
    activatedPlugins.push([PerformanceTimingPlugin(), apiMethods]);
  }

  if (plugins.optimizelyX && optimizelyXSummary) {
    const { OptimizelyXPlugin, ...apiMethods } = OptimizelyX;
    activatedPlugins.push([OptimizelyXPlugin(), apiMethods]);
  }

  if (plugins.clientHints && clientHints) {
    const { ClientHintsPlugin, ...apiMethods } = ClientHints;
    activatedPlugins.push([ClientHintsPlugin(clientHints.includeHighEntropy ? true : false), apiMethods]);
  }

  if (plugins.parrable && parrable) {
    const { ParrablePlugin, ...apiMethods } = Parrable;
    activatedPlugins.push([ParrablePlugin(), apiMethods]);
  }

  if (plugins.gaCookies && gaCookies) {
    const { GaCookiesPlugin, ...apiMethods } = GaCookies;
    activatedPlugins.push([GaCookiesPlugin(), apiMethods]);
  }

  if (plugins.gdpr) {
    const { GdprPlugin, ...apiMethods } = Gdpr;
    activatedPlugins.push([GdprPlugin(), apiMethods]);
  }

  if (plugins.geolocation) {
    const { GeolocationPlugin, ...apiMethods } = Geolocation;
    activatedPlugins.push([GeolocationPlugin(geolocation), apiMethods]);
  }

  if (plugins.linkClickTracking) {
    const { LinkClickTrackingPlugin, ...apiMethods } = LinkClickTracking;
    activatedPlugins.push([LinkClickTrackingPlugin(), apiMethods]);
  }

  if (plugins.formTracking) {
    const { FormTrackingPlugin, ...apiMethods } = FormTracking;
    activatedPlugins.push([FormTrackingPlugin(), apiMethods]);
  }

  if (plugins.errorTracking) {
    const { ErrorTrackingPlugin, ...apiMethods } = ErrorTracking;
    activatedPlugins.push([ErrorTrackingPlugin(), apiMethods]);
  }

  if (plugins.ecommerce) {
    const { EcommercePlugin, ...apiMethods } = Ecommerce;
    activatedPlugins.push([EcommercePlugin(), apiMethods]);
  }

  if (plugins.enhancedEcommerce) {
    const { EnhancedEcommercePlugin, ...apiMethods } = EnhancedEcommerce;
    activatedPlugins.push([EnhancedEcommercePlugin(), apiMethods]);
  }

  if (plugins.browserFeatures) {
    const { BrowserFeaturesPlugin, ...apiMethods } = BrowserFeatures;
    activatedPlugins.push([BrowserFeaturesPlugin(), apiMethods]);
  }

  if (plugins.timezone) {
    const { TimezonePlugin, ...apiMethods } = Timezone;
    activatedPlugins.push([TimezonePlugin(), apiMethods]);
  }

  return activatedPlugins;
}
