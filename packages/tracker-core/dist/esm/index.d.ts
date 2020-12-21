/**
 * Interface for a Payload dictionary
 */
interface PayloadDictionary {
    [key: string]: unknown;
}
/**
 * Interface for mutable object encapsulating tracker payload
 */
interface PayloadData {
    /**
     * Adds an entry to the Payload
     * @param key Key for Payload dictionary entry
     * @param value Value for Payload dictionaty entry
     */
    add: (key: string, value?: string) => void;
    /**
     * Merges a payload into the existing payload
     * @param dict The payload to merge
     */
    addDict: (dict: PayloadDictionary) => void;
    /**
     * Adds a JSON object to the payload - will stringify the JSON object
     * @param keyIfEncoded key if base64 encoding is enabled
     * @param keyIfNotEncoded key if base64 encoding is disabled
     * @param json The json to be stringified and added to the payload
     */
    addJson: (keyIfEncoded: string, keyIfNotEncoded: string, json: Record<string, unknown>) => void;
    /**
     * Builds and returns the Payload
     */
    build: () => PayloadDictionary;
}
/**
 * Interface common for any Self-Describing JSON such as custom context or
 * Self-describing (ex-unstuctured) event
 */
interface SelfDescribingJson extends Record<string, unknown> {
    schema: string;
    data: Record<string, unknown>;
}
/**
 * Algebraic datatype representing possible timestamp type choice
 */
type Timestamp = TrueTimestamp | DeviceTimestamp | number;
interface TrueTimestamp {
    readonly type: "ttm";
    readonly value: number;
}
interface DeviceTimestamp {
    readonly type: "dtm";
    readonly value: number;
}
/**
 * Interface containing all Core functions
 */
interface Core {
    /**
     * Set a persistent key-value pair to be added to every payload
     *
     * @param key Field name
     * @param value Field value
     */
    addPayloadPair: (key: string, value: string) => void;
    /**
     * Turn base 64 encoding on or off
     *
     * @param encode Whether to encode payload
     */
    setBase64Encoding(encode: boolean): void;
    /**
     * Merges a dictionary into payloadPairs
     *
     * @param dict Adds a new payload dictionary to the existing one
     */
    addPayloadDict(dict: PayloadDictionary): void;
    /**
     * Replace payloadPairs with a new dictionary
     *
     * @param dict Resets all current payload pairs with a new dictionary of pairs
     */
    resetPayloadPairs(dict: PayloadDictionary): void;
    /**
     * Set the tracker version
     *
     * @param version The version of the current tracker
     */
    setTrackerVersion(version: string): void;
    /**
     * Set the tracker namespace
     *
     * @param name The trackers namespace
     */
    setTrackerNamespace(name: string): void;
    /**
     * Set the application ID
     *
     * @param appId An application ID which identifies the current application
     */
    setAppId(appId: string): void;
    /**
     * Set the platform
     *
     * @param value A valid Snowplow platform value
     */
    setPlatform(value: string): void;
    /**
     * Set the user ID
     *
     * @param userId The custom user id
     */
    setUserId(userId: string): void;
    /**
     * Set the screen resolution
     *
     * @param width screen resolution width
     * @param height screen resolution height
     */
    setScreenResolution(width: string, height: string): void;
    /**
     * Set the viewport dimensions
     *
     * @param width viewport width
     * @param height viewport height
     */
    setViewport(width: string, height: string): void;
    /**
     * Set the color depth
     *
     * @param depth A color depth value as string
     */
    setColorDepth(depth: string): void;
    /**
     * Set the timezone
     *
     * @param timezone A timezone string
     */
    setTimezone(timezone: string): void;
    /**
     * Set the language
     *
     * @param lang A language string e.g. 'en-UK'
     */
    setLang(lang: string): void;
    /**
     * Set the IP address
     *
     * @param ip An IP Address string
     */
    setIpAddress(ip: string): void;
    /**
     * Set the Useragent
     *
     * @param useragent A useragent string
     */
    setUseragent(useragent: string): void;
    /**
     * Log a self-describing event
     *
     * @param properties Contains the properties and schema location for the event
     * @param context Custom contexts relating to the event
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    trackSelfDescribingEvent: (properties: Record<string, unknown>, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void) => PayloadData;
    /**
     * Log the page view / visit
     *
     * @param pageUrl Current page URL
     * @param pageTitle The user-defined page title to attach to this page view
     * @param referrer URL users came from
     * @param context Custom contexts relating to the event
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    trackPageView(pageUrl: string, pageTitle: string, referrer: string, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData;
    /**
     * Log that a user is still viewing a given page
     * by sending a page ping
     *
     * @param pageUrl Current page URL
     * @param pageTitle The page title to attach to this page ping
     * @param referrer URL users came from
     * @param minXOffset Minimum page x offset seen in the last ping period
     * @param maxXOffset Maximum page x offset seen in the last ping period
     * @param minYOffset Minimum page y offset seen in the last ping period
     * @param maxYOffset Maximum page y offset seen in the last ping period
     * @param context Custom contexts relating to the event
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    trackPagePing(pageUrl: string, pageTitle: string, referrer: string, minXOffset: number, maxXOffset: number, minYOffset: number, maxYOffset: number, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData;
    /**
     * Track a structured event
     *
     * @param category The name you supply for the group of objects you want to track
     * @param action A string that is uniquely paired with each category, and commonly used to define the type of user interaction for the web object
     * @param label An optional string to provide additional dimensions to the event data
     * @param property Describes the object or the action performed on it, e.g. quantity of item added to basket
     * @param value An integer that you can use to provide numerical data about the user event
     * @param context Custom contexts relating to the event
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    trackStructEvent(category: string, action: string, label: string, property: string, value?: number, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData;
    /**
     * Track an ecommerce transaction
     *
     * @param orderId Internal unique order id number for this transaction.
     * @param affiliation Partner or store affiliation.
     * @param totalValue Total amount of the transaction.
     * @param taxValue Tax amount of the transaction.
     * @param shipping Shipping charge for the transaction.
     * @param city City to associate with transaction.
     * @param state State to associate with transaction.
     * @param country Country to associate with transaction.
     * @param currency Currency to associate with this transaction.
     * @param context Context relating to the event.
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    trackEcommerceTransaction(orderId: string, affiliation: string, totalValue: string, taxValue?: string, shipping?: string, city?: string, state?: string, country?: string, currency?: string, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData;
    /**
     * Track an ecommerce transaction item
     *
     * @param orderId Required Order ID of the transaction to associate with item.
     * @param sku Item's SKU code.
     * @param name Product name.
     * @param category Product category.
     * @param price Product price.
     * @param quantity Purchase quantity.
     * @param currency Product price currency.
     * @param context Context relating to the event.
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    trackEcommerceTransactionItem(orderId: string, sku: string, name: string, category: string, price: string, quantity: string, currency?: string, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData;
    /**
     * Track a screen view self describing event
     *
     * @param name The name of the screen
     * @param id The ID of the screen
     * @param context Contexts relating to the event
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    trackScreenView(name: string, id: string, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData;
    /**
     * Log the link or click with the server
     *
     * @param targetUrl
     * @param elementId
     * @param elementClasses
     * @param elementTarget
     * @param elementContent innerHTML of the link
     * @param context Custom contexts relating to the event
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    trackLinkClick(targetUrl: string, elementId: string, elementClasses: Array<string>, elementTarget: string, elementContent: string, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData;
    /**
     * Track an ad being served
     *
     * @param impressionId Identifier for a particular ad impression
     * @param costModel The cost model. 'cpa', 'cpc', or 'cpm'
     * @param cost Cost
     * @param targetUrl URL ad pointing to
     * @param bannerId Identifier for the ad banner displayed
     * @param zoneId Identifier for the ad zone
     * @param advertiserId Identifier for the advertiser
     * @param campaignId Identifier for the campaign which the banner belongs to
     * @param context Custom contexts relating to the event
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    trackAdImpression(impressionId: string, costModel: string, cost: number, targetUrl: string, bannerId: string, zoneId: string, advertiserId: string, campaignId: string, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData;
    /**
     * Track an ad being clicked
     *
     * @param targetUrl (required) The link's target URL
     * @param clickId Identifier for the ad click
     * @param costModel The cost model. 'cpa', 'cpc', or 'cpm'
     * @param cost Cost
     * @param bannerId Identifier for the ad banner displayed
     * @param zoneId Identifier for the ad zone
     * @param impressionId Identifier for a particular ad impression
     * @param advertiserId Identifier for the advertiser
     * @param campaignId Identifier for the campaign which the banner belongs to
     * @param context Custom contexts relating to the event
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    trackAdClick(targetUrl: string, clickId: string, costModel: string, cost: number, bannerId: string, zoneId: string, impressionId: string, advertiserId: string, campaignId: string, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData;
    /**
     * Track an ad conversion event
     *
     * @param conversionId Identifier for the ad conversion event
     * @param costModel The cost model. 'cpa', 'cpc', or 'cpm'
     * @param cost Cost
     * @param category The name you supply for the group of objects you want to track
     * @param action A string that is uniquely paired with each category
     * @param property Describes the object of the conversion or the action performed on it
     * @param initialValue Revenue attributable to the conversion at time of conversion
     * @param advertiserId Identifier for the advertiser
     * @param campaignId Identifier for the campaign which the banner belongs to
     * @param context Custom contexts relating to the event
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    trackAdConversion(conversionId: string, costModel: string, cost: number, category: string, action: string, property: string, initialValue: number, advertiserId: string, campaignId: string, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData;
    /**
     * Track a social event
     *
     * @param action Social action performed
     * @param network Social network
     * @param target Object of the social action e.g. the video liked, the tweet retweeted
     * @param context Custom contexts relating to the event
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    trackSocialInteraction(action: string, network: string, target: string, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData;
    /**
     * Track an add-to-cart event
     *
     * @param sku Item's SKU code.
     * @param name Product name.
     * @param category Product category.
     * @param unitPrice Product price.
     * @param quantity Quantity added.
     * @param currency Product price currency.
     * @param context Context relating to the event.
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    trackAddToCart(sku: string, name: string, category: string, unitPrice: string, quantity: string, currency?: string, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData;
    /**
     * Track a remove-from-cart event
     *
     * @param sku Item's SKU code.
     * @param name Product name.
     * @param category Product category.
     * @param unitPrice Product price.
     * @param quantity Quantity removed.
     * @param currency Product price currency.
     * @param context Context relating to the event.
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    trackRemoveFromCart(sku: string, name: string, category: string, unitPrice: string, quantity: string, currency?: string, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData;
    /**
     * Track the value of a form field changing or receiving focus
     *
     * @param schema The schema type of the event
     * @param formId The parent form ID
     * @param elementId ID of the changed element
     * @param nodeName "INPUT", "TEXTAREA", or "SELECT"
     * @param type Type of the changed element if its type is "INPUT"
     * @param elementClasses List of classes of the changed element
     * @param value The new value of the changed element
     * @param context Context relating to the event.
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    trackFormFocusOrChange(schema: string, formId: string, elementId: string, nodeName: string, type: string, elementClasses: Array<string>, value: string, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData;
    /**
     * Track a form submission event
     *
     * @param formId ID of the form
     * @param formClasses Classes of the form
     * @param elements Mutable elements within the form
     * @param context Context relating to the event.
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    trackFormSubmission(formId: string, formClasses: Array<string>, elements: Array<Record<string, unknown>>, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData;
    /**
     * Track an internal search event
     *
     * @param terms Search terms
     * @param filters Search filters
     * @param totalResults Number of results
     * @param pageResults Number of results displayed on page
     * @param context Context relating to the event.
     * @param tstamp Timestamp of the event
     * @return Payload
     */
    trackSiteSearch(terms: Array<string>, filters: Record<string, string | boolean>, totalResults: number, pageResults: number, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData;
    /**
     * Track a consent withdrawn event
     *
     * @param all Indicates user withdraws consent for all documents.
     * @param id ID number associated with document.
     * @param version Version number of document.
     * @param name Name of document.
     * @param description Description of document.
     * @param context Context relating to the event.
     * @param tstamp Timestamp of the event.
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    trackConsentWithdrawn(all: boolean, id?: string, version?: string, name?: string, description?: string, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData;
    /**
     * Track a consent granted event
     *
     * @param id ID number associated with document.
     * @param version Version number of document.
     * @param name Name of document.
     * @param description Description of document.
     * @param expiry Date-time when consent expires.
     * @param context Context relating to the event.
     * @param tstamp Timestamp of the event.
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */
    trackConsentGranted(id: string, version: string, name?: string, description?: string, expiry?: string, context?: Array<SelfDescribingJson>, tstamp?: Timestamp, afterTrack?: (Payload: PayloadDictionary) => void): PayloadData;
    /**
     * Adds contexts globally, contexts added here will be attached to all applicable events
     * @param contexts An array containing either contexts or a conditional contexts
     */
    addGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>): void;
    /**
     * Removes all global contexts
     */
    clearGlobalContexts(): void;
    /**
     * Removes previously added global context, performs a deep comparison of the contexts or conditional contexts
     * @param contexts An array containing either contexts or a conditional contexts
     */
    removeGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>): void;
}
/**
 * Create a tracker core object
 *
 * @param base64 Whether to base 64 encode contexts and self describing event JSONs
 * @param callback Function applied to every payload dictionary object
 * @return Tracker core
 */
declare function trackerCore(base64: boolean, callback?: (PayloadData: PayloadData) => void): Core;
/**
 * An interface for wrapping the Context Generator arguments
 */
interface ContextGeneratorEvent {
    event: PayloadDictionary;
    eventType: string;
    eventSchema: string;
}
/**
 * A context generator is a callback that returns a self-describing JSON
 * @param args - Object that contains: event, eventType, eventSchema
 * @return A self-describing JSON
 */
type ContextGenerator = (args?: ContextGeneratorEvent) => SelfDescribingJson;
/**
 * A context primitive is either a self-describing JSON or a context generator
 */
type ContextPrimitive = SelfDescribingJson | ContextGenerator;
/**
 * An interface for wrapping the Filter arguments
 */
interface ContextFilterEvent {
    event: PayloadDictionary;
    eventType: string;
    eventSchema: string;
}
/**
 * A context filter is a user-supplied callback that is evaluated for each event
 * to determine if the context associated with the filter should be attached to the event
 * @param args - Object that contains: event, eventType, eventSchema
 * @return A self-describing JSON
 */
type ContextFilter = (args?: ContextFilterEvent) => boolean;
/**
 * A filter provider is an array that has two parts: a context filter and context primitives
 * If the context filter evaluates to true, the tracker will attach the context primitive(s)
 */
type FilterProvider = [
    ContextFilter,
    Array<ContextPrimitive> | ContextPrimitive
];
/**
 * A ruleset has accept or reject properties that contain rules for matching Iglu schema URIs
 */
interface RuleSet {
    accept?: Array<string> | string;
    reject?: Array<string> | string;
}
/**
 * A ruleset provider is an array that has two parts: a ruleset and context primitives
 * If the ruleset allows the current event schema URI, the tracker will attach the context primitive(s)
 */
type RuleSetProvider = [
    RuleSet,
    Array<ContextPrimitive> | ContextPrimitive
];
/**
 * Conditional context providers are two element arrays used to decide when to attach contexts, where:
 * - the first element is some conditional criterion
 * - the second element is any number of context primitives
 */
type ConditionalContextProvider = FilterProvider | RuleSetProvider;
export { ContextPrimitive, ContextFilterEvent, ContextFilter, ContextGeneratorEvent, ContextGenerator, RuleSetProvider, FilterProvider, ConditionalContextProvider, PayloadData, PayloadDictionary, Core, SelfDescribingJson, Timestamp, TrueTimestamp, DeviceTimestamp, trackerCore };
