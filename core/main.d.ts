declare module 'snowplow-tracker/lib/base64' {
	export function base64urldecode(data: string): string;
	export function base64encode(data: string): string;
	export function base64decode(encodedData: string): string;

}
declare module 'snowplow-tracker/lib/payload' {
	export interface PayloadData {
	    add: (key: string, value?: string) => void;
	    addDict: (dict: Object) => void;
	    addJson: (keyIfEncoded: string, keyIfNotEncoded: string, json: Object) => void;
	    build: () => Object;
	}
	export function isNonEmptyJson(property: any): boolean;
	export function isJson(property: Object): boolean;
	export function payloadBuilder(base64Encode: boolean): PayloadData;

}
declare module 'snowplow-tracker/lib/contexts' {
	import { PayloadData } from 'snowplow-tracker/lib/payload';
	import { SelfDescribingJson } from 'snowplow-tracker/lib/core';
	export type ContextGenerator = (payload: SelfDescribingJson, eventType: string, schema: string) => SelfDescribingJson;
	export type ContextPrimitive = SelfDescribingJson | ContextGenerator;
	export type ContextFilter = (payload: SelfDescribingJson, eventType: string, schema: string) => boolean;
	export type FilterContextProvider = [ContextFilter, Array<ContextPrimitive> | ContextPrimitive];
	export interface RuleSet {
	    accept?: string[] | string;
	    reject?: string[] | string;
	}
	export type PathContextProvider = [RuleSet, Array<ContextPrimitive> | ContextPrimitive];
	export type ConditionalContextProvider = FilterContextProvider | PathContextProvider;
	export function getSchemaParts(input: string): Array<string> | undefined;
	export function isValidMatcher(input: any): boolean;
	export function isStringArray(input: any): boolean;
	export function isValidRuleSetArg(input: any): boolean;
	export function isSelfDescribingJson(input: any): boolean;
	export function isEventJson(input: any): boolean;
	export function isRuleSet(input: any): boolean;
	export function isContextGenerator(input: any): boolean;
	export function isContextFilter(input: any): boolean;
	export function isContextPrimitive(input: any): boolean;
	export function isFilterContextProvider(input: any): boolean;
	export function isPathContextProvider(input: any): boolean;
	export function isConditionalContextProvider(input: any): boolean;
	export function matchSchemaAgainstRule(rule: string, schema: string): boolean;
	export function matchSchemaAgainstRuleSet(ruleSet: RuleSet, schema: string): boolean;
	export function contextModule(): {
	    addGlobalContexts: (contexts: any[]) => void;
	    clearAllContexts: () => void;
	    removeGlobalContexts: (contexts: any[]) => void;
	    getApplicableContexts: (event: PayloadData) => SelfDescribingJson[];
	};

}
declare module 'snowplow-tracker/lib/core' {
	import * as payload from 'snowplow-tracker/lib/payload';
	export interface SelfDescribingJson extends Object {
	    schema: string;
	    data: Object;
	}
	export type Timestamp = TrueTimestamp | DeviceTimestamp | number;
	export interface TrueTimestamp {
	    readonly type: "ttm";
	    readonly value: number;
	}
	export interface DeviceTimestamp {
	    readonly type: "dtm";
	    readonly value: number;
	}
	export function trackerCore(base64: boolean, callback?: (PayloadData) => void): {
	    setBase64Encoding: (encode: boolean) => void;
	    addPayloadPair: (key: string, value: string) => void;
	    addPayloadDict: (dict: Object) => void;
	    resetPayloadPairs: (dict: Object) => void;
	    setTrackerVersion: (version: string) => void;
	    setTrackerNamespace: (name: string) => void;
	    setAppId: (appId: string) => void;
	    setPlatform: (value: string) => void;
	    setUserId: (userId: string) => void;
	    setScreenResolution: (width: string, height: string) => void;
	    setViewport: (width: string, height: string) => void;
	    setColorDepth: (depth: string) => void;
	    setTimezone: (timezone: string) => void;
	    setLang: (lang: string) => void;
	    setIpAddress: (ip: string) => void;
	    trackUnstructEvent: (properties: Object, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackSelfDescribingEvent: (properties: Object, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackPageView: (pageUrl: string, pageTitle: string, referrer: string, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackPagePing: (pageUrl: string, pageTitle: string, referrer: string, minXOffset: number, maxXOffset: number, minYOffset: number, maxYOffset: number, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackStructEvent: (category: string, action: string, label: string, property: string, value?: number | undefined, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackEcommerceTransaction: (orderId: string, affiliation: string, totalValue: string, taxValue?: string | undefined, shipping?: string | undefined, city?: string | undefined, state?: string | undefined, country?: string | undefined, currency?: string | undefined, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackEcommerceTransactionItem: (orderId: string, sku: string, name: string, category: string, price: string, quantity: string, currency?: string | undefined, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackScreenView: (name: string, id: string, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackLinkClick: (targetUrl: string, elementId: string, elementClasses: string[], elementTarget: string, elementContent: string, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackAdImpression: (impressionId: string, costModel: string, cost: number, targetUrl: string, bannerId: string, zoneId: string, advertiserId: string, campaignId: string, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackAdClick: (targetUrl: string, clickId: string, costModel: string, cost: number, bannerId: string, zoneId: string, impressionId: string, advertiserId: string, campaignId: string, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackAdConversion: (conversionId: string, costModel: string, cost: number, category: string, action: string, property: string, initialValue: number, advertiserId: string, campaignId: string, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackSocialInteraction: (action: string, network: string, target: string, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackAddToCart: (sku: string, name: string, category: string, unitPrice: string, quantity: string, currency?: string | undefined, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackRemoveFromCart: (sku: string, name: string, category: string, unitPrice: string, quantity: string, currency?: string | undefined, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackFormChange: (formId: string, elementId: string, nodeName: string, type: string, elementClasses: string[], value: string, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackFormSubmission: (formId: string, formClasses: string[], elements: string[], context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackSiteSearch: (terms: string[], filters: Object, totalResults: number, pageResults: number, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackConsentWithdrawn: (all: boolean, id?: string | undefined, version?: string | undefined, name?: string | undefined, description?: string | undefined, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    trackConsentGranted: (id: string, version: string, name?: string | undefined, description?: string | undefined, expiry?: string | undefined, context?: SelfDescribingJson[] | undefined, tstamp?: number | TrueTimestamp | DeviceTimestamp | undefined) => payload.PayloadData;
	    addGlobalContexts: (contexts: Object[]) => void;
	    clearGlobalContexts: () => void;
	    removeGlobalContexts: (contexts: Object[]) => void;
	};

}
declare module 'snowplow-tracker/index' {
	export { trackerCore } from 'snowplow-tracker/lib/core';

}
