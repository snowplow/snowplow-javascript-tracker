export default function snowplowBrowserPluginFormtracking() {
    // TODO
}
//   /**
//      * Enables automatic form tracking.
//      * An event will be fired when a form field is changed or a form submitted.
//      * This can be called multiple times: only forms not already tracked will be tracked.
//      *
//      * @param object config Configuration object determining which forms and fields to track.
//      *                      Has two properties: "forms" and "fields"
//      * @param array context Context for all form tracking events
//      */
//     enableFormTracking(config, context) {
//         if (this.mutSnowplowState.hasLoaded) {
//             this.formTrackingManager.configureFormTracking(config)
//             this.formTrackingManager.addFormListeners(context)
//         } else {
//             this.mutSnowplowState.registeredOnLoadHandlers.push(() => {
//                 this.formTrackingManager.configureFormTracking(config)
//                 this.formTrackingManager.addFormListeners(context)
//             })
//         }
//     }
