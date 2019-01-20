export default function snowplowBrowserPluginEcommerce() {
    // TODO
}

//const ecommerceTransactionTemplate = Symbol()
// const logTransaction = Symbol()
// const logTransactionItem = Symbol()

//   /*
//      * Initializes an empty ecommerce
//      * transaction and line items
//      */
//     [ecommerceTransactionTemplate]() {
//         return {
//             transaction: {},
//             items: [],
//         }
//     }


// /**
//      * Log ecommerce transaction metadata
//      *
//      * @param string orderId
//      * @param string affiliation
//      * @param string total
//      * @param string tax
//      * @param string shipping
//      * @param string city
//      * @param string state
//      * @param string country
//      * @param string currency The currency the total/tax/shipping are expressed in
//      * @param object context Custom context relating to the event
//      * @param tstamp number or Timestamp object
//      */
//     [logTransaction](orderId, affiliation, total, tax, shipping, city, state, country, currency, context, tstamp) {
//         this.core.trackEcommerceTransaction(
//             orderId,
//             affiliation,
//             total,
//             tax,
//             shipping,
//             city,
//             state,
//             country,
//             currency,
//             this[addCommonContexts](context),
//             tstamp
//         )
//     }

//     /**
//      * Log ecommerce transaction item
//      *
//      * @param string orderId
//      * @param string sku
//      * @param string name
//      * @param string category
//      * @param string price
//      * @param string quantity
//      * @param string currency The currency the price is expressed in
//      * @param object context Custom context relating to the event
//      */
//     [logTransactionItem](orderId, sku, name, category, price, quantity, currency, context, tstamp) {
//         this.core.trackEcommerceTransactionItem(orderId, sku, name, category, price, quantity, currency, this[addCommonContexts](context), tstamp)
//     }


// state:{
//     ecommerceTransaction: _this[ecommerceTransactionTemplate](),
// }



//       /**
//      * Track a GA Enhanced Ecommerce Action with all stored
//      * Enhanced Ecommerce contexts
//      *
//      * @param string action
//      * @param array context Optional. Context relating to the event.
//      * @param tstamp Opinal number or Timestamp object
//      */
//     trackEnhancedEcommerceAction(action, context, tstamp) {
//         var combinedEnhancedEcommerceContexts = this.state.enhancedEcommerceContexts.concat(context || [])
//         this.state.enhancedEcommerceContexts.length = 0

//         this[trackCallback](() => {
//             this.core.trackSelfDescribingEvent(
//                 {
//                     schema: 'iglu:com.google.analytics.enhanced-ecommerce/action/jsonschema/1-0-0',
//                     data: {
//                         action: action,
//                     },
//                 },
//                 this[addCommonContexts](combinedEnhancedEcommerceContexts),
//                 tstamp
//             )
//         })
//     }

//     /**
//      * Adds a GA Enhanced Ecommerce Action Context
//      *
//      * @param string id
//      * @param string affiliation
//      * @param number revenue
//      * @param number tax
//      * @param number shipping
//      * @param string coupon
//      * @param string list
//      * @param integer step
//      * @param string option
//      * @param string currency
//      */
//     addEnhancedEcommerceActionContext(id, affiliation, revenue, tax, shipping, coupon, list, step, option, currency) {
//         this.state.enhancedEcommerceContexts.push({
//             schema: 'iglu:com.google.analytics.enhanced-ecommerce/actionFieldObject/jsonschema/1-0-0',
//             data: {
//                 id: id,
//                 affiliation: affiliation,
//                 revenue: pFloat(revenue),
//                 tax: pFloat(tax),
//                 shipping: pFloat(shipping),
//                 coupon: coupon,
//                 list: list,
//                 step: pInt(step),
//                 option: option,
//                 currency: currency,
//             },
//         })
//     }

//     /**
//      * Adds a GA Enhanced Ecommerce Impression Context
//      *
//      * @param string id
//      * @param string name
//      * @param string list
//      * @param string brand
//      * @param string category
//      * @param string variant
//      * @param integer position
//      * @param number price
//      * @param string currency
//      */
//     addEnhancedEcommerceImpressionContext(id, name, list, brand, category, variant, position, price, currency) {
//         this.state.enhancedEcommerceContexts.push({
//             schema: 'iglu:com.google.analytics.enhanced-ecommerce/impressionFieldObject/jsonschema/1-0-0',
//             data: {
//                 id: id,
//                 name: name,
//                 list: list,
//                 brand: brand,
//                 category: category,
//                 variant: variant,
//                 position: pInt(position),
//                 price: pFloat(price),
//                 currency: currency,
//             },
//         })
//     }

//     /**
//      * Adds a GA Enhanced Ecommerce Product Context
//      *
//      * @param string id
//      * @param string name
//      * @param string list
//      * @param string brand
//      * @param string category
//      * @param string variant
//      * @param number price
//      * @param integer quantity
//      * @param string coupon
//      * @param integer position
//      * @param string currency
//      */
//     addEnhancedEcommerceProductContext(id, name, list, brand, category, variant, price, quantity, coupon, position, currency) {
//         this.state.enhancedEcommerceContexts.push({
//             schema: 'iglu:com.google.analytics.enhanced-ecommerce/productFieldObject/jsonschema/1-0-0',
//             data: {
//                 id: id,
//                 name: name,
//                 list: list,
//                 brand: brand,
//                 category: category,
//                 variant: variant,
//                 price: pFloat(price),
//                 quantity: pInt(quantity),
//                 coupon: coupon,
//                 position: pInt(position),
//                 currency: currency,
//             },
//         })
//     }

//     /**
//      * Adds a GA Enhanced Ecommerce Promo Context
//      *
//      * @param string id
//      * @param string name
//      * @param string creative
//      * @param string position
//      * @param string currency
//      */
//     addEnhancedEcommercePromoContext(id, name, creative, position, currency) {
//         this.state.enhancedEcommerceContexts.push({
//             schema: 'iglu:com.google.analytics.enhanced-ecommerce/promoFieldObject/jsonschema/1-0-0',
//             data: {
//                 id: id,
//                 name: name,
//                 creative: creative,
//                 position: position,
//                 currency: currency,
//             },
//         })
//     }



    // /**
    //  * Track an ecommerce transaction
    //  *
    //  * @param string orderId Required. Internal unique order id number for this transaction.
    //  * @param string affiliation Optional. Partner or store affiliation.
    //  * @param string total Required. Total amount of the transaction.
    //  * @param string tax Optional. Tax amount of the transaction.
    //  * @param string shipping Optional. Shipping charge for the transaction.
    //  * @param string city Optional. City to associate with transaction.
    //  * @param string state Optional. State to associate with transaction.
    //  * @param string country Optional. Country to associate with transaction.
    //  * @param string currency Optional. Currency to associate with this transaction.
    //  * @param object context Optional. Context relating to the event.
    //  * @param tstamp number or Timestamp object
    //  */
    // addTrans(orderId, affiliation, total, tax, shipping, city, state, country, currency, context, tstamp) {
    //     this.state.ecommerceTransaction.transaction = {
    //         orderId: orderId,
    //         affiliation: affiliation,
    //         total: total,
    //         tax: tax,
    //         shipping: shipping,
    //         city: city,
    //         state: state,
    //         country: country,
    //         currency: currency,
    //         context: context,
    //         tstamp: tstamp,
    //     }
    // }

    // /**
    //  * Track an ecommerce transaction item
    //  *
    //  * @param string orderId Required Order ID of the transaction to associate with item.
    //  * @param string sku Required. Item's SKU code.
    //  * @param string name Optional. Product name.
    //  * @param string category Optional. Product category.
    //  * @param string price Required. Product price.
    //  * @param string quantity Required. Purchase quantity.
    //  * @param string currency Optional. Product price currency.
    //  * @param object context Optional. Context relating to the event.
    //  * @param tstamp number or Timestamp object
    //  */
    // addItem(orderId, sku, name, category, price, quantity, currency, context, tstamp) {
    //     this.state.ecommerceTransaction.items.push({
    //         orderId: orderId,
    //         sku: sku,
    //         name: name,
    //         category: category,
    //         price: price,
    //         quantity: quantity,
    //         currency: currency,
    //         context: context,
    //         tstamp: tstamp,
    //     })
    // }

    // /**
    //  * Commit the ecommerce transaction
    //  *
    //  * This call will send the data specified with addTrans,
    //  * addItem methods to the tracking server.
    //  */
    // trackTrans() {
    //     this[trackCallback](() => {
    //         this[logTransaction](
    //             this.state.ecommerceTransaction.transaction.orderId,
    //             this.state.ecommerceTransaction.transaction.affiliation,
    //             this.state.ecommerceTransaction.transaction.total,
    //             this.state.ecommerceTransaction.transaction.tax,
    //             this.state.ecommerceTransaction.transaction.shipping,
    //             this.state.ecommerceTransaction.transaction.city,
    //             this.state.ecommerceTransaction.transaction.state,
    //             this.state.ecommerceTransaction.transaction.country,
    //             this.state.ecommerceTransaction.transaction.currency,
    //             this.state.ecommerceTransaction.transaction.context,
    //             this.state.ecommerceTransaction.transaction.tstamp
    //         )
    //         for (var i = 0; i < this.state.ecommerceTransaction.items.length; i++) {
    //             var item = this.state.ecommerceTransaction.items[i]
    //             this[logTransactionItem](item.orderId, item.sku, item.name, item.category, item.price, item.quantity, item.currency, item.context, item.tstamp)
    //         }

    //         this.state.ecommerceTransaction = this[ecommerceTransactionTemplate]()
    //     })
    // }


    // /**
    //  * Track an add-to-cart event
    //  *
    //  * @param string sku Required. Item's SKU code.
    //  * @param string name Optional. Product name.
    //  * @param string category Optional. Product category.
    //  * @param string unitPrice Optional. Product price.
    //  * @param string quantity Required. Quantity added.
    //  * @param string currency Optional. Product price currency.
    //  * @param array context Optional. Context relating to the event.
    //  * @param tstamp number or Timestamp object
    //  */
    // trackAddToCart(sku, name, category, unitPrice, quantity, currency, context, tstamp) {
    //     this[trackCallback](() => {
    //         this.core.trackAddToCart(sku, name, category, unitPrice, quantity, currency, this[addCommonContexts](context), tstamp)
    //     })
    // }

    // /**
    //  * Track a remove-from-cart event
    //  *
    //  * @param string sku Required. Item's SKU code.
    //  * @param string name Optional. Product name.
    //  * @param string category Optional. Product category.
    //  * @param string unitPrice Optional. Product price.
    //  * @param string quantity Required. Quantity removed.
    //  * @param string currency Optional. Product price currency.
    //  * @param array context Optional. Context relating to the event.
    //  * @param tstamp Opinal number or Timestamp object
    //  */
    // trackRemoveFromCart(sku, name, category, unitPrice, quantity, currency, context, tstamp) {
    //     this[trackCallback](() => {
    //         this.core.trackRemoveFromCart(sku, name, category, unitPrice, quantity, currency, this[addCommonContexts](context), tstamp)
    //     })
    // }
