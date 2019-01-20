export default function snowplowBrowserPluginParable() {
    // TODO
}
//const getParrableContext = Symbol()

//  /**
//      * Creates a context from the window['_hawk'] object
//      *
//      * @return object The Parrable context
//      */
//     [getParrableContext]() {
//         var parrable = window['_hawk']
//         if (parrable) {
//             var context = { encryptedId: null, optout: null }
//             context['encryptedId'] = parrable.browserid
//             var regex = new RegExp('(?:^|;)\\s?' + '_parrable_hawk_optout'.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1') + '=(.*?)(?:;|$)', 'i'),
//                 match = document.cookie.match(regex)
//             context['optout'] = match && decodeURIComponent(match[1]) ? match && decodeURIComponent(match[1]) : 'false'
//             return {
//                 schema: 'iglu:com.parrable/encrypted_payload/jsonschema/1-0-0',
//                 data: context,
//             }
//         }
//     }



      
// //Add Parrable Context
// if (this.config.contexts.parrable) {
//     var parrableContext = this[getParrableContext]()
//     if (parrableContext) {
//         combinedContexts.push(parrableContext)
//     }
// }