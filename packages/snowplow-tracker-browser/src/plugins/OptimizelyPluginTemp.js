   
// const getOptimizelyData = Symbol()
// const getOptimizelyXData = Symbol()
// const getOptimizelySummary = Symbol()
// const getOptimizelyXSummary = Symbol()
// const getOptimizelyExperimentContexts = Symbol()
// const getOptimizelyStateContexts = Symbol()
// const getOptimizelyVariationContexts = Symbol()
// const getOptimizelyVisitorContext = Symbol()
// const getOptimizelyAudienceContexts = Symbol()
// const getOptimizelyDimensionContexts = Symbol()
// const getOptimizelySummaryContexts = Symbol()
// const getOptimizelyXSummaryContexts = Symbol()
   
   
   // /**
    //  * Check that *both* optimizely and optimizely.data exist and return
    //  * optimizely.data.property
    //  *
    //  * @param property optimizely data property
    //  * @param snd optional nested property
    //  */
    // [getOptimizelyData](property, snd) {
    //     var data
    //     if (this.state.windowAlias.optimizely && this.state.windowAlias.optimizely.data) {
    //         data = this.state.windowAlias.optimizely.data[property]
    //         if (typeof snd !== 'undefined' && data !== undefined) {
    //             data = data[snd]
    //         }
    //     }
    //     return data
    // }

    // /**
    //  * Check that *both* optimizely and optimizely.data exist
    //  *
    //  * @param property optimizely data property
    //  * @param snd optional nested property
    //  */
    // [getOptimizelyXData](property, snd) {
    //     var data
    //     if (this.state.windowAlias.optimizely) {
    //         data = this.state.windowAlias.optimizely.get(property)
    //         if (typeof snd !== 'undefined' && data !== undefined) {
    //             data = data[snd]
    //         }
    //     }
    //     return data
    // }

    // /**
    //  * Get data for Optimizely "lite" contexts - active experiments on current page
    //  *
    //  * @returns Array content of lite optimizely lite context
    //  */
    // [getOptimizelySummary]() {
    //     var state = this[getOptimizelyData]('state')
    //     var experiments = this[getOptimizelyData]('experiments')

    //     return (state && experiments && state.activeExperiments).map(function(activeExperiment) {
    //         var current = experiments[activeExperiment]
    //         return {
    //             activeExperimentId: activeExperiment.toString(),
    //             // User can be only in one variation (don't know why is this array)
    //             variation: state.variationIdsMap[activeExperiment][0].toString(),
    //             conditional: current && current.conditional,
    //             manual: current && current.manual,
    //             name: current && current.name,
    //         }
    //     })
    // }

    // /**
    //  * Get data for OptimizelyX contexts - active experiments on current page
    //  *
    //  * @returns Array content of lite optimizely lite context
    //  */
    // [getOptimizelyXSummary]() {
    //     const state = this[getOptimizelyXData]('state')
    //     const experiment_ids = state.getActiveExperimentIds()
    //     //const experiments = this[getOptimizelyXData]('data', 'experiments')
    //     const visitor = this[getOptimizelyXData]('visitor')

    //     return experiment_ids.map(activeExperiment => {
    //         const variation = state.getVariationMap()[activeExperiment]
    //         const variationName = variation.name
    //         const variationId = variation.id
    //         const visitorId = visitor.visitorId
    //         return {
    //             experimentId: pInt(activeExperiment),
    //             variationName: variationName,
    //             variation: pInt(variationId),
    //             visitorId: visitorId,
    //         }
    //     })
    // }

    // /**
    //  * Creates a context from the window['optimizely'].data.experiments object
    //  *
    //  * @return Array Experiment contexts
    //  */
    // [getOptimizelyExperimentContexts]() {
    //     const experiments = this[getOptimizelyData]('experiments')
    //     if (experiments) {
    //         var contexts = []

    //         for (var key in experiments) {
    //             if (experiments.hasOwnProperty(key)) {
    //                 var context = {}
    //                 context.id = key
    //                 var experiment = experiments[key]
    //                 context.code = experiment.code
    //                 context.manual = experiment.manual
    //                 context.conditional = experiment.conditional
    //                 context.name = experiment.name
    //                 context.variationIds = experiment.variation_ids

    //                 contexts.push({
    //                     schema: 'iglu:com.optimizely/experiment/jsonschema/1-0-0',
    //                     data: context,
    //                 })
    //             }
    //         }
    //         return contexts
    //     }
    //     return []
    // }

    // /**
    //  * Creates a context from the window['optimizely'].data.state object
    //  *
    //  * @return Array State contexts
    //  */
    // [getOptimizelyStateContexts]() {
    //     var experimentIds = []
    //     var experiments = this[getOptimizelyData]('experiments')
    //     if (experiments) {
    //         for (var key in experiments) {
    //             if (experiments.hasOwnProperty(key)) {
    //                 experimentIds.push(key)
    //             }
    //         }
    //     }

    //     var state = this[getOptimizelyData]('state')
    //     if (state) {
    //         var contexts = []
    //         var activeExperiments = state.activeExperiments || []

    //         for (var i = 0; i < experimentIds.length; i++) {
    //             var experimentId = experimentIds[i]
    //             var context = {}
    //             context.experimentId = experimentId
    //             context.isActive = isValueInArray(experimentIds[i], activeExperiments)
    //             var variationMap = state.variationMap || {}
    //             context.variationIndex = variationMap[experimentId]
    //             var variationNamesMap = state.variationNamesMap || {}
    //             context.variationName = variationNamesMap[experimentId]
    //             var variationIdsMap = state.variationIdsMap || {}
    //             if (variationIdsMap[experimentId] && variationIdsMap[experimentId].length === 1) {
    //                 context.variationId = variationIdsMap[experimentId][0]
    //             }

    //             contexts.push({
    //                 schema: 'iglu:com.optimizely/state/jsonschema/1-0-0',
    //                 data: context,
    //             })
    //         }
    //         return contexts
    //     }
    //     return []
    // }

    // /**
    //  * Creates a context from the window['optimizely'].data.variations object
    //  *
    //  * @return Array Variation contexts
    //  */
    // [getOptimizelyVariationContexts]() {
    //     var variations = this[getOptimizelyData]('variations')
    //     if (variations) {
    //         var contexts = []

    //         for (var key in variations) {
    //             if (variations.hasOwnProperty(key)) {
    //                 var context = {}
    //                 context.id = key
    //                 var variation = variations[key]
    //                 context.name = variation.name
    //                 context.code = variation.code

    //                 contexts.push({
    //                     schema: 'iglu:com.optimizely/variation/jsonschema/1-0-0',
    //                     data: context,
    //                 })
    //             }
    //         }
    //         return contexts
    //     }
    //     return []
    // }

    // /**
    //  * Creates a context from the window['optimizely'].data.visitor object
    //  *
    //  * @return object Visitor context
    //  */
    // [getOptimizelyVisitorContext]() {
    //     var visitor = this[getOptimizelyData]('visitor')
    //     if (visitor) {
    //         var context = {}
    //         context.browser = visitor.browser
    //         context.browserVersion = visitor.browserVersion
    //         context.device = visitor.device
    //         context.deviceType = visitor.deviceType
    //         context.ip = visitor.ip
    //         var platform = visitor.platform || {}
    //         context.platformId = platform.id
    //         context.platformVersion = platform.version
    //         var location = visitor.location || {}
    //         context.locationCity = location.city
    //         context.locationRegion = location.region
    //         context.locationCountry = location.country
    //         context.mobile = visitor.mobile
    //         context.mobileId = visitor.mobileId
    //         context.referrer = visitor.referrer
    //         context.os = visitor.os

    //         return {
    //             schema: 'iglu:com.optimizely/visitor/jsonschema/1-0-0',
    //             data: context,
    //         }
    //     }
    // }

    // /**
    //  * Creates a context from the window['optimizely'].data.visitor.audiences object
    //  *
    //  * @return Array VisitorAudience contexts
    //  */
    // [getOptimizelyAudienceContexts]() {
    //     var audienceIds = this[getOptimizelyData]('visitor', 'audiences')
    //     if (audienceIds) {
    //         var contexts = []

    //         for (var key in audienceIds) {
    //             if (audienceIds.hasOwnProperty(key)) {
    //                 var context = { id: key, isMember: audienceIds[key] }

    //                 contexts.push({
    //                     schema: 'iglu:com.optimizely/visitor_audience/jsonschema/1-0-0',
    //                     data: context,
    //                 })
    //             }
    //         }
    //         return contexts
    //     }
    //     return []
    // }

    // /**
    //  * Creates a context from the window['optimizely'].data.visitor.dimensions object
    //  *
    //  * @return Array VisitorDimension contexts
    //  */
    // [getOptimizelyDimensionContexts]() {
    //     var dimensionIds = this[getOptimizelyData]('visitor', 'dimensions')
    //     if (dimensionIds) {
    //         var contexts = []

    //         for (var key in dimensionIds) {
    //             if (dimensionIds.hasOwnProperty(key)) {
    //                 var context = { id: key, value: dimensionIds[key] }

    //                 contexts.push({
    //                     schema: 'iglu:com.optimizely/visitor_dimension/jsonschema/1-0-0',
    //                     data: context,
    //                 })
    //             }
    //         }
    //         return contexts
    //     }
    //     return []
    // }

    // /**
    //  * Creates an Optimizely lite context containing only data required to join
    //  * event to experiment data
    //  *
    //  * @returns Array of custom contexts
    //  */
    // [getOptimizelySummaryContexts]() {
    //     return this[getOptimizelySummary]().map(experiment => {
    //         return {
    //             schema: 'iglu:com.optimizely.snowplow/optimizely_summary/jsonschema/1-0-0',
    //             data: experiment,
    //         }
    //     })
    // }

    // /**
    //  * Creates an OptimizelyX context containing only data required to join
    //  * event to experiment data
    //  *
    //  * @returns Array of custom contexts
    //  */
    // [getOptimizelyXSummaryContexts]() {
    //     return this[getOptimizelyXSummary]().map(experiment => {
    //         return {
    //             schema: 'iglu:com.optimizely.optimizelyx/summary/jsonschema/1-0-0',
    //             data: experiment,
    //         }
    //     })
    // }


    //   // Add Optimizely Contexts
    //   if (this.state.windowAlias.optimizely) {
    //     if (this.config.contexts.optimizelySummary) {
    //         const activeExperiments = this[getOptimizelySummaryContexts]()
    //         activeExperiments.forEach(function(e) {
    //             combinedContexts.push(e)
    //         })
    //     }

    //     if (this.config.contexts.optimizelyXSummary) {
    //         const activeExperiments = this[getOptimizelyXSummaryContexts]()
    //         activeExperiments.forEach(function(e) {
    //             combinedContexts.push(e)
    //         })
    //     }

    //     if (this.config.contexts.optimizelyExperiments) {
    //         const experimentContexts = this[getOptimizelyExperimentContexts]()
    //         experimentContexts.forEach(function(e) {
    //             combinedContexts.push(e)
    //         })
    //         // for (var i = 0; i < experimentContexts.length; i++) {
    //         //     combinedContexts.push(experimentContexts[i])
    //         // }
    //     }

    //     if (this.config.contexts.optimizelyStates) {
    //         const stateContexts = this[getOptimizelyStateContexts]()
    //         stateContexts.forEach(function(e) {
    //             combinedContexts.push(e)
    //         })
    //         // for (var i = 0; i < stateContexts.length; i++) {
    //         //     combinedContexts.push(stateContexts[i])
    //         // }
    //     }

    //     if (this.config.contexts.optimizelyVariations) {
    //         const variationContexts = this[getOptimizelyVariationContexts]()
    //         variationContexts.forEach(function(e) {
    //             combinedContexts.push(e)
    //         })
    //         // for (var i = 0; i < variationContexts.length; i++) {
    //         //     combinedContexts.push(variationContexts[i])
    //         // }
    //     }

    //     if (this.config.contexts.optimizelyVisitor) {
    //         const optimizelyVisitorContext = getOptimizelyVisitorContext()
    //         if (optimizelyVisitorContext) {
    //             combinedContexts.push(optimizelyVisitorContext)
    //         }
    //     }

    //     if (this.config.contexts.optimizelyAudiences) {
    //         const audienceContexts = getOptimizelyAudienceContexts()
    //         for (var i = 0; i < audienceContexts.length; i++) {
    //             combinedContexts.push(audienceContexts[i])
    //         }
    //     }

    //     if (this.config.contexts.optimizelyDimensions) {
    //         var dimensionContexts = getOptimizelyDimensionContexts()
    //         dimensionContexts.forEach(function(e) {
    //             combinedContexts.push(e)
    //         })
    //         // for (var i = 0; i < dimensionContexts.length; i++) {
    //         //     combinedContexts.push(dimensionContexts[i])
    //         // }
    //     }
    // }
