/*
 * Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import * as ClientHints from '@snowplow/browser-plugin-client-hints';
import * as Optimizely from '@snowplow/browser-plugin-optimizely';
import * as OptimizelyX from '@snowplow/browser-plugin-optimizely-x';
import * as PerformanceTiming from '@snowplow/browser-plugin-performance-timing';
import * as Consent from '@snowplow/browser-plugin-consent';
import * as Geolocation from '@snowplow/browser-plugin-geolocation';
import * as GaCookies from '@snowplow/browser-plugin-ga-cookies';
import * as LinkClickTracking from '@snowplow/browser-plugin-link-click-tracking';
import * as FormTracking from '@snowplow/browser-plugin-form-tracking';
import * as ErrorTracking from '@snowplow/browser-plugin-error-tracking';
import * as BrowserFeatures from '@snowplow/browser-plugin-browser-features';
import * as Timezone from '@snowplow/browser-plugin-timezone';
import * as Ecommerce from '@snowplow/browser-plugin-ecommerce';
import * as EnhancedEcommerce from '@snowplow/browser-plugin-enhanced-ecommerce';
import * as AdTracking from '@snowplow/browser-plugin-ad-tracking';
import * as SiteTracking from '@snowplow/browser-plugin-site-tracking';
import * as MediaTracking from '@snowplow/browser-plugin-media-tracking';
import * as YouTubeTracking from '@snowplow/browser-plugin-youtube-tracking';
import * as plugins from '../tracker.config';
import { BrowserPlugin } from '@snowplow/browser-tracker-core';
import { JavaScriptTrackerConfiguration } from './configuration';

/**
 * Calculates the required plugins to intialise per tracker
 * @param configuration - The tracker configuration object
 */
export function Plugins(configuration: JavaScriptTrackerConfiguration) {
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
    clientHints,
  } = configuration?.contexts ?? {};
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
    activatedPlugins.push([
      ClientHintsPlugin(typeof clientHints === 'object' && clientHints.includeHighEntropy),
      apiMethods,
    ]);
  }

  if (plugins.gaCookies && gaCookies) {
    const { GaCookiesPlugin, ...apiMethods } = GaCookies;
    activatedPlugins.push([GaCookiesPlugin(), apiMethods]);
  }

  if (plugins.consent) {
    const { ConsentPlugin, ...apiMethods } = Consent;
    activatedPlugins.push([ConsentPlugin(), apiMethods]);
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

  if (plugins.adTracking) {
    const { AdTrackingPlugin, ...apiMethods } = AdTracking;
    activatedPlugins.push([AdTrackingPlugin(), apiMethods]);
  }

  if (plugins.siteTracking) {
    const { SiteTrackingPlugin, ...apiMethods } = SiteTracking;
    activatedPlugins.push([SiteTrackingPlugin(), apiMethods]);
  }

  if (plugins.browserFeatures) {
    const { BrowserFeaturesPlugin, ...apiMethods } = BrowserFeatures;
    activatedPlugins.push([BrowserFeaturesPlugin(), apiMethods]);
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

  return activatedPlugins;
}
