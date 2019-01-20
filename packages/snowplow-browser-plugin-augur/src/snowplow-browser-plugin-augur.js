export default function snowplowBrowserPluginAugur() {
    // TODO
}
//const getAugurIdentityLiteContext = Symbol()


//    /**
//      * Creates a context from the window['augur'] object
//      *
//      * @return object The IdentityLite context
//      */
//     [getAugurIdentityLiteContext]() {
//         var augur = this.state.windowAlias.augur
//         if (augur) {
//             var context = { consumer: {}, device: {} }
//             var consumer = augur.consumer || {}
//             context.consumer.UUID = consumer.UID
//             var device = augur.device || {}
//             context.device.ID = device.ID
//             context.device.isBot = device.isBot
//             context.device.isProxied = device.isProxied
//             context.device.isTor = device.isTor
//             var fingerprint = device.fingerprint || {}
//             context.device.isIncognito = fingerprint.browserHasIncognitoEnabled

//             return {
//                 schema: 'iglu:io.augur.snowplow/identity_lite/jsonschema/1-0-0',
//                 data: context,
//             }
//         }
//     }



        // // Add Augur Context
        // if (this.config.contexts.augurIdentityLite) {
        //     const augurIdentityLiteContext = this[getAugurIdentityLiteContext]()
        //     if (augurIdentityLiteContext) {
        //         combinedContexts.push(augurIdentityLiteContext)
        //     }
        // }
