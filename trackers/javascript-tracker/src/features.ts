import * as ClientHints from '@snowplow/browser-plugin-client-hints';
import * as OptimizelyX from '@snowplow/browser-plugin-optimizely-x';
import * as PerformanceTiming from '@snowplow/browser-plugin-performance-timing';
import * as Geolocation from '@snowplow/browser-plugin-geolocation';
import * as GaCookies from '@snowplow/browser-plugin-ga-cookies';
import * as LinkClickTracking from '@snowplow/browser-plugin-link-click-tracking';
import * as FormTracking from '@snowplow/browser-plugin-form-tracking';
import * as ErrorTracking from '@snowplow/browser-plugin-error-tracking';
import * as Timezone from '@snowplow/browser-plugin-timezone';
import * as EnhancedEcommerce from '@snowplow/browser-plugin-enhanced-ecommerce';
import * as AdTracking from '@snowplow/browser-plugin-ad-tracking';
import * as SiteTracking from '@snowplow/browser-plugin-site-tracking';
import * as SnowplowEcommerce from '@snowplow/browser-plugin-snowplow-ecommerce';
import * as MediaTracking from '@snowplow/browser-plugin-media-tracking';
import * as YouTubeTracking from '@snowplow/browser-plugin-youtube-tracking';
import * as plugins from '../tracker.config';
import { BrowserPlugin } from '@snowplow/browser-tracker-core';
import { JavaScriptTrackerConfiguration } from './configuration';
import * as EnhancedConsent from '@snowplow/browser-plugin-enhanced-consent';
import * as SnowplowMedia from '@snowplow/browser-plugin-media';
import * as VimeoTracking from '@snowplow/browser-plugin-vimeo-tracking';
import * as PrivacySandbox from '@snowplow/browser-plugin-privacy-sandbox';
import * as ButtonClickTracking from '@snowplow/browser-plugin-button-click-tracking';
import * as EventSpecifications from '@snowplow/browser-plugin-event-specifications';
import * as PerformanceNavigationTiming from '@snowplow/browser-plugin-performance-navigation-timing';
import * as WebVitals from '@snowplow/browser-plugin-web-vitals';
import * as ElementTracking from '@snowplow/browser-plugin-element-tracking';

/**
 * Calculates the required plugins to intialise per tracker
 * @param configuration - The tracker configuration object
 */
export function Plugins(configuration: JavaScriptTrackerConfiguration) {
  const { performanceTiming, gaCookies, geolocation, clientHints, webVitals, performanceNavigationTiming } =
    configuration?.contexts ?? {};
  const activatedPlugins: Array<[BrowserPlugin, {} | Record<string, Function>]> = [];

  if (plugins.performanceTiming && performanceTiming) {
    const { PerformanceTimingPlugin, ...apiMethods } = PerformanceTiming;
    activatedPlugins.push([PerformanceTimingPlugin(), apiMethods]);
  }

  if (plugins.optimizelyX) {
    const { OptimizelyXPlugin, ...apiMethods } = OptimizelyX;
    activatedPlugins.push([OptimizelyXPlugin(), apiMethods]);
  }

  if (plugins.clientHints && clientHints) {
    const { ClientHintsPlugin, ...apiMethods } = ClientHints;
    activatedPlugins.push([
      ClientHintsPlugin(typeof clientHints === 'object' && clientHints.includeHighEntropy),
      apiMethods,
    ]);
  }

  if (plugins.gaCookies && gaCookies) {
    const { GaCookiesPlugin, ...apiMethods } = GaCookies;
    const gaCookiesPlugin = typeof gaCookies === 'object' ? GaCookiesPlugin(gaCookies) : GaCookiesPlugin();
    activatedPlugins.push([gaCookiesPlugin, apiMethods]);
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

  if (plugins.enhancedEcommerce) {
    const { EnhancedEcommercePlugin, ...apiMethods } = EnhancedEcommerce;
    activatedPlugins.push([EnhancedEcommercePlugin(), apiMethods]);
  }

  if (plugins.adTracking) {
    const { AdTrackingPlugin, ...apiMethods } = AdTracking;
    activatedPlugins.push([AdTrackingPlugin(), apiMethods]);
  }

  if (plugins.siteTracking) {
    const { SiteTrackingPlugin, ...apiMethods } = SiteTracking;
    activatedPlugins.push([SiteTrackingPlugin(), apiMethods]);
  }

  if (plugins.snowplowEcommerceTracking) {
    const { SnowplowEcommercePlugin, ...apiMethods } = SnowplowEcommerce;
    activatedPlugins.push([SnowplowEcommercePlugin(), apiMethods]);
  }

  if (plugins.timezone) {
    const { TimezonePlugin, ...apiMethods } = Timezone;
    activatedPlugins.push([TimezonePlugin(), apiMethods]);
  }

  if (plugins.mediaTracking) {
    const { MediaTrackingPlugin, ...apiMethods } = MediaTracking;
    activatedPlugins.push([MediaTrackingPlugin(), apiMethods]);
  }

  if (plugins.youtubeTracking) {
    const { YouTubeTrackingPlugin, ...apiMethods } = YouTubeTracking;
    activatedPlugins.push([YouTubeTrackingPlugin(), apiMethods]);
  }

  if (plugins.enhancedConsent) {
    const { EnhancedConsentPlugin, ...apiMethods } = EnhancedConsent;
    activatedPlugins.push([EnhancedConsentPlugin(), apiMethods]);
  }

  if (plugins.snowplowMedia) {
    const { SnowplowMediaPlugin, ...apiMethods } = SnowplowMedia;
    activatedPlugins.push([SnowplowMediaPlugin(), apiMethods]);
  }

  if (plugins.vimeoTracking) {
    const { VimeoTrackingPlugin, ...apiMethods } = VimeoTracking;
    activatedPlugins.push([VimeoTrackingPlugin(), apiMethods]);
  }

  if (plugins.privacySandbox) {
    const { PrivacySandboxPlugin, ...apiMethods } = PrivacySandbox;
    activatedPlugins.push([PrivacySandboxPlugin(), apiMethods]);
  }

  if (plugins.buttonClickTracking) {
    const { ButtonClickTrackingPlugin, ...apiMethods } = ButtonClickTracking;
    activatedPlugins.push([ButtonClickTrackingPlugin(), apiMethods]);
  }

  if (plugins.eventSpecifications) {
    const { EventSpecificationsPlugin, ...apiMethods } = EventSpecifications;
    activatedPlugins.push([EventSpecificationsPlugin(), apiMethods]);
  }

  if (plugins.performanceNavigationTiming && performanceNavigationTiming) {
    const { PerformanceNavigationTimingPlugin, ...apiMethods } = PerformanceNavigationTiming;
    activatedPlugins.push([PerformanceNavigationTimingPlugin(), apiMethods]);
  }

  if (plugins.webVitals && webVitals) {
    const { WebVitalsPlugin, ...apiMethods } = WebVitals;
    activatedPlugins.push([WebVitalsPlugin(typeof webVitals === 'object' ? webVitals : undefined), apiMethods]);
  }

  if (plugins.elementTracking) {
    const { SnowplowElementTrackingPlugin, ...apiMethods } = ElementTracking;
    activatedPlugins.push([SnowplowElementTrackingPlugin(), apiMethods]);
  }

  return activatedPlugins;
}
