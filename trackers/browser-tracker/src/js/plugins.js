import { ClientHintsPlugin } from '@snowplow/browser-plugin-client-hints';
import { OptimizelyPlugin } from '@snowplow/browser-plugin-optimizely';
import { OptimizelyXPlugin } from '@snowplow/browser-plugin-optimizely-x';
import { ParrablePlugin } from '@snowplow/browser-plugin-parrable';
import { PerformanceTimingPlugin } from '@snowplow/browser-plugin-performance-timing';
import { GdprPlugin } from '@snowplow/browser-plugin-gdpr';
import { LinkClickTrackingPlugin } from '@snowplow/browser-plugin-link-click-tracking';
import { FormTrackingPlugin } from '@snowplow/browser-plugin-form-tracking';
import { ErrorTrackingPlugin } from '@snowplow/browser-plugin-error-tracking';
import { GeolocationPlugin } from '@snowplow/browser-plugin-geolocation';
import { GaCookiesPlugins } from '@snowplow/browser-plugin-ga-cookies';
import pluginConfig from '../../plugins.config';

export function Plugins(argmap) {
  const {
      contexts: {
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
      },
    } = argmap,
    gdprPlugin = pluginConfig.gdpr ? GdprPlugin() : null,
    geolocationPlugin = pluginConfig.geolocation ? GeolocationPlugin(geolocation) : null,
    contextPlugins = [],
    apiPlugins = [];

  // --- Context Plugins ---

  if (pluginConfig.optimizely) {
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

  if (pluginConfig.performanceTiming && performanceTiming) {
    contextPlugins.push(PerformanceTimingPlugin());
  }

  if (pluginConfig.optimizelyX && optimizelyXSummary) {
    contextPlugins.push(OptimizelyXPlugin());
  }

  if (pluginConfig.clientHints && clientHints) {
    contextPlugins.push(ClientHintsPlugin(clientHints.includeHighEntropy ? true : false));
  }

  if (pluginConfig.parrable && parrable) {
    contextPlugins.push(ParrablePlugin());
  }

  if (pluginConfig.gaCookies && gaCookies) {
    contextPlugins.push(GaCookiesPlugins());
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

  if (pluginConfig.linkClickTracking) {
    apiPlugins.push(LinkClickTrackingPlugin());
  }

  if (pluginConfig.formTracking) {
    apiPlugins.push(FormTrackingPlugin());
  }

  if (pluginConfig.errorTracking) {
    apiPlugins.push(ErrorTrackingPlugin());
  }

  return {
    contextPlugins: contextPlugins,
    apiPlugins: apiPlugins,
  };
}
