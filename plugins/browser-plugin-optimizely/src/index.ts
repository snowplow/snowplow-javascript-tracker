/*
 * Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang
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

import { isValueInArray, BrowserPlugin } from '@snowplow/browser-tracker-core';
import {
  Experiment,
  OptimizelySummary,
  State,
  Variation,
  Visitor,
  VisitorAudience,
  VisitorDimension,
} from './contexts';

declare global {
  interface Window {
    optimizely: {
      data: { [key: string]: any };
    };
  }
}

/**
 * Adds classic Opimizely context to events
 *
 * @param summary Add summary context
 * @param experiments Add experiments context
 * @param states Add states context
 * @param variations Add variations context
 * @param visitor Add visitor context
 * @param audiences Add audiences context
 * @param dimensions Add dimensions context
 */
export function OptimizelyPlugin(
  summary: boolean = true,
  experiments: boolean = true,
  states: boolean = true,
  variations: boolean = true,
  visitor: boolean = true,
  audiences: boolean = true,
  dimensions: boolean = true
): BrowserPlugin {
  const windowOptimizelyAlias = window.optimizely;

  /**
   * Check that *both* optimizely and optimizely.data exist and return
   * optimizely.data.property
   *
   * @param property optimizely data property
   * @param snd optional nested property
   */
  function getOptimizelyData(property: string, snd?: string) {
    let data;
    if (windowOptimizelyAlias && windowOptimizelyAlias.data) {
      data = windowOptimizelyAlias.data[property];
      if (typeof snd !== 'undefined' && data !== undefined) {
        data = data[snd];
      }
    }
    return data;
  }

  /**
   * Get data for Optimizely "lite" contexts - active experiments on current page
   *
   * @returns Array content of lite optimizely lite context
   */
  function getOptimizelySummary(): OptimizelySummary[] {
    var state = getOptimizelyData('state');
    var experiments = getOptimizelyData('experiments');

    if (!state || !experiments) return [];

    return (
      state.activeExperiments?.map(function (activeExperiment: string) {
        var current = experiments[activeExperiment];
        return {
          activeExperimentId: activeExperiment.toString(),
          // User can be only in one variation (don't know why is this array)
          variation: state.variationIdsMap[activeExperiment][0].toString(),
          conditional: current && current.conditional,
          manual: current && current.manual,
          name: current && current.name,
        };
      }) ?? []
    );
  }

  /**
   * Creates a context from the window['optimizely'].data.experiments object
   *
   * @return Array Experiment contexts
   */
  function getOptimizelyExperimentContexts() {
    var experiments = getOptimizelyData('experiments');
    if (experiments) {
      var contexts = [];

      for (var key in experiments) {
        if (experiments.hasOwnProperty(key)) {
          var context: Experiment = {};
          context.id = key;
          var experiment = experiments[key];
          context.code = experiment.code;
          context.manual = experiment.manual;
          context.conditional = experiment.conditional;
          context.name = experiment.name;
          context.variationIds = experiment.variation_ids;

          contexts.push({
            schema: 'iglu:com.optimizely/experiment/jsonschema/1-0-0',
            data: context,
          });
        }
      }
      return contexts;
    }
    return [];
  }

  /**
   * Creates a context from the window['optimizely'].data.state object
   *
   * @return Array State contexts
   */
  function getOptimizelyStateContexts() {
    var experimentIds = [];
    var experiments = getOptimizelyData('experiments');
    if (experiments) {
      for (var key in experiments) {
        if (experiments.hasOwnProperty(key)) {
          experimentIds.push(key);
        }
      }
    }

    var state = getOptimizelyData('state');
    if (state) {
      var contexts = [];
      var activeExperiments = state.activeExperiments || [];

      for (var i = 0; i < experimentIds.length; i++) {
        var experimentId = experimentIds[i];
        var context: State = {};
        context.experimentId = experimentId;
        context.isActive = isValueInArray(experimentIds[i], activeExperiments);
        var variationMap = state.variationMap || {};
        context.variationIndex = variationMap[experimentId];
        var variationNamesMap = state.variationNamesMap || {};
        context.variationName = variationNamesMap[experimentId];
        var variationIdsMap = state.variationIdsMap || {};
        if (variationIdsMap[experimentId] && variationIdsMap[experimentId].length === 1) {
          context.variationId = variationIdsMap[experimentId][0];
        }

        contexts.push({
          schema: 'iglu:com.optimizely/state/jsonschema/1-0-0',
          data: context,
        });
      }
      return contexts;
    }
    return [];
  }

  /**
   * Creates a context from the window['optimizely'].data.variations object
   *
   * @return Array Variation contexts
   */
  function getOptimizelyVariationContexts() {
    var variations = getOptimizelyData('variations');
    if (variations) {
      var contexts = [];

      for (var key in variations) {
        if (variations.hasOwnProperty(key)) {
          var context: Variation = {};
          context.id = key;
          var variation = variations[key];
          context.name = variation.name;
          context.code = variation.code;

          contexts.push({
            schema: 'iglu:com.optimizely/variation/jsonschema/1-0-0',
            data: context,
          });
        }
      }
      return contexts;
    }
    return [];
  }

  /**
   * Creates a context from the window['optimizely'].data.visitor object
   *
   * @return object Visitor context
   */
  function getOptimizelyVisitorContexts() {
    var visitor = getOptimizelyData('visitor');
    if (visitor) {
      var context: Visitor = {};
      context.browser = visitor.browser;
      context.browserVersion = visitor.browserVersion;
      context.device = visitor.device;
      context.deviceType = visitor.deviceType;
      context.ip = visitor.ip;
      var platform = visitor.platform || {};
      context.platformId = platform.id;
      context.platformVersion = platform.version;
      var location = visitor.location || {};
      context.locationCity = location.city;
      context.locationRegion = location.region;
      context.locationCountry = location.country;
      context.mobile = visitor.mobile;
      context.mobileId = visitor.mobileId;
      context.referrer = visitor.referrer;
      context.os = visitor.os;

      return [
        {
          schema: 'iglu:com.optimizely/visitor/jsonschema/1-0-0',
          data: context,
        },
      ];
    }
    return [];
  }

  /**
   * Creates a context from the window['optimizely'].data.visitor.audiences object
   *
   * @return Array VisitorAudience contexts
   */
  function getOptimizelyAudienceContexts() {
    var audienceIds = getOptimizelyData('visitor', 'audiences');
    if (audienceIds) {
      var contexts = [];

      for (var key in audienceIds) {
        if (audienceIds.hasOwnProperty(key)) {
          var context: VisitorAudience = { id: key, isMember: audienceIds[key] };

          contexts.push({
            schema: 'iglu:com.optimizely/visitor_audience/jsonschema/1-0-0',
            data: context,
          });
        }
      }
      return contexts;
    }
    return [];
  }

  /**
   * Creates a context from the window['optimizely'].data.visitor.dimensions object
   *
   * @return Array VisitorDimension contexts
   */
  function getOptimizelyDimensionContexts() {
    var dimensionIds = getOptimizelyData('visitor', 'dimensions');
    if (dimensionIds) {
      var contexts = [];

      for (var key in dimensionIds) {
        if (dimensionIds.hasOwnProperty(key)) {
          var context: VisitorDimension = { id: key, value: dimensionIds[key] };

          contexts.push({
            schema: 'iglu:com.optimizely/visitor_dimension/jsonschema/1-0-0',
            data: context,
          });
        }
      }
      return contexts;
    }
    return [];
  }

  /**
   * Creates an Optimizely lite context containing only data required to join
   * event to experiment data
   *
   * @returns Array of custom contexts
   */
  function getOptimizelySummaryContexts() {
    return getOptimizelySummary().map(function (experiment) {
      return {
        schema: 'iglu:com.optimizely.snowplow/optimizely_summary/jsonschema/1-0-0',
        data: experiment,
      };
    });
  }

  return {
    contexts: () => {
      const combinedContexts = [];

      // Add Optimizely Contexts
      if (windowOptimizelyAlias) {
        if (summary) {
          combinedContexts.push(...getOptimizelySummaryContexts());
        }

        if (experiments) {
          combinedContexts.push(...getOptimizelyExperimentContexts());
        }

        if (states) {
          combinedContexts.push(...getOptimizelyStateContexts());
        }

        if (variations) {
          combinedContexts.push(...getOptimizelyVariationContexts());
        }

        if (visitor) {
          combinedContexts.push(...getOptimizelyVisitorContexts());
        }

        if (audiences) {
          combinedContexts.push(...getOptimizelyAudienceContexts());
        }

        if (dimensions) {
          combinedContexts.push(...getOptimizelyDimensionContexts());
        }
      }

      return combinedContexts;
    },
  };
}
