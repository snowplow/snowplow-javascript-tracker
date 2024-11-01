"use strict";(self.webpackChunkapi_docs=self.webpackChunkapi_docs||[]).push([[31352],{58908:(n,e,t)=>{t.r(e),t.d(e,{assets:()=>c,contentTitle:()=>a,default:()=>l,frontMatter:()=>i,metadata:()=>s,toc:()=>u});var r=t(85893),o=t(11151);const i={},a=void 0,s={id:"browser-tracker/browser-tracker.api",title:"browser-tracker.api",description:'API Report File for "@snowplow/browser-tracker"',source:"@site/docs/browser-tracker/browser-tracker.api.md",sourceDirName:"browser-tracker",slug:"/browser-tracker/browser-tracker.api",permalink:"/snowplow-javascript-tracker/docs/browser-tracker/browser-tracker.api",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"JavaScript Trackers",permalink:"/snowplow-javascript-tracker/docs/"},next:{title:"index",permalink:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/"}},c={},u=[{value:"API Report File for &quot;@snowplow/browser-tracker&quot;",id:"api-report-file-for-snowplowbrowser-tracker",level:2}];function d(n){const e={a:"a",blockquote:"blockquote",code:"code",h2:"h2",p:"p",pre:"pre",...(0,o.a)(),...n.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(e.h2,{id:"api-report-file-for-snowplowbrowser-tracker",children:'API Report File for "@snowplow/browser-tracker"'}),"\n",(0,r.jsxs)(e.blockquote,{children:["\n",(0,r.jsxs)(e.p,{children:["Do not edit this file. It is a report generated by ",(0,r.jsx)(e.a,{href:"https://api-extractor.com/",children:"API Extractor"}),"."]}),"\n"]}),"\n",(0,r.jsx)(e.pre,{children:(0,r.jsx)(e.code,{className:"language-ts",children:'\n// @public\nexport type ActivityCallback = (data: ActivityCallbackData) => void;\n\n// @public\nexport type ActivityCallbackData = {\n    context: Array<SelfDescribingJson>;\n    pageViewId: string;\n    minXOffset: number;\n    minYOffset: number;\n    maxXOffset: number;\n    maxYOffset: number;\n};\n\n// @public\nexport interface ActivityTrackingConfiguration {\n    heartbeatDelay: number;\n    minimumVisitLength: number;\n}\n\n// @public\nexport interface ActivityTrackingConfigurationCallback {\n    callback: ActivityCallback;\n}\n\n// @public\nexport function addGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive> | Record<string, ConditionalContextProvider | ContextPrimitive>, trackers?: Array<string>): void;\n\n// @public\nexport function addPlugin(configuration: BrowserPluginConfiguration, trackers?: Array<string>): void;\n\n// @public (undocumented)\nexport type AnonymousTrackingOptions = boolean | {\n    withSessionTracking?: boolean;\n    withServerAnonymisation?: boolean;\n};\n\n// @public\nexport interface BrowserPlugin extends CorePlugin {\n    activateBrowserPlugin?: (tracker: BrowserTracker) => void;\n}\n\n// @public\nexport interface BrowserPluginConfiguration extends CorePluginConfiguration {\n    /* The plugin to add */\n    // (undocumented)\n    plugin: BrowserPlugin;\n}\n\n// @public\nexport interface BrowserTracker {\n    addPlugin: (configuration: BrowserPluginConfiguration) => void;\n    clearUserData: (configuration?: ClearUserDataConfiguration) => void;\n    core: TrackerCore;\n    crossDomainLinker: (crossDomainLinkerCriterion: (elt: HTMLAnchorElement | HTMLAreaElement) => boolean) => void;\n    disableActivityTracking: () => void;\n    disableActivityTrackingCallback: () => void;\n    disableAnonymousTracking: (configuration?: DisableAnonymousTrackingConfiguration) => void;\n    discardBrace: (enableFilter: boolean) => void;\n    discardHashTag: (enableFilter: boolean) => void;\n    enableActivityTracking: (configuration: ActivityTrackingConfiguration) => void;\n    enableActivityTrackingCallback: (configuration: ActivityTrackingConfiguration & ActivityTrackingConfigurationCallback) => void;\n    enableAnonymousTracking: (configuration?: EnableAnonymousTrackingConfiguration) => void;\n    flushBuffer: (configuration?: FlushBufferConfiguration) => void;\n    getCookieName: (basename: string) => string;\n    getDomainSessionIndex: () => number;\n    getDomainUserId: () => string;\n    getDomainUserInfo: () => ParsedIdCookie;\n    getPageViewId: () => string;\n    getTabId: () => string | null;\n    getUserId: () => string | null | undefined;\n    id: string;\n    namespace: string;\n    newSession: () => void;\n    preservePageViewId: () => void;\n    preservePageViewIdForUrl: (preserve: PreservePageViewIdForUrl) => void;\n    setBufferSize: (newBufferSize: number) => void;\n    setCollectorUrl: (collectorUrl: string) => void;\n    setCookiePath: (path: string) => void;\n    setCustomUrl: (url: string) => void;\n    setDocumentTitle: (title: string) => void;\n    setOptOutCookie: (name?: string | null) => void;\n    setReferrerUrl: (url: string) => void;\n    setUserId: (userId?: string | null) => void;\n    setUserIdFromCookie: (cookieName: string) => void;\n    setUserIdFromLocation: (querystringField: string) => void;\n    setUserIdFromReferrer: (querystringField: string) => void;\n    setVisitorCookieTimeout: (timeout: number) => void;\n    sharedState: SharedState;\n    trackPageView: (event?: PageViewEvent & CommonEventProperties) => void;\n    updatePageActivity: () => void;\n}\n\n// Warning: (ae-forgotten-export) The symbol "RequireAtLeastOne" needs to be exported by the entry point index.module.d.ts\n//\n// @public (undocumented)\nexport type BuiltInContexts = RequireAtLeastOne<{\n    /* Toggles the web_page context */\n    webPage: boolean;\n    /* Toggles the session context */\n    session: boolean;\n    /* Toggles the browser context */\n    browser: boolean;\n}> | Record<string, never>;\n\n// @public\nexport function clearGlobalContexts(trackers?: Array<string>): void;\n\n// @public\nexport function clearUserData(configuration?: ClearUserDataConfiguration, trackers?: Array<string>): void;\n\n// @public\nexport interface ClearUserDataConfiguration {\n    /* Store session information in memory for subsequent events */\n    // (undocumented)\n    preserveSession: boolean;\n    /* Store user information in memory for subsequent events */\n    // (undocumented)\n    preserveUser: boolean;\n}\n\n// @public\nexport interface ClientSession extends Record<string, unknown> {\n    eventIndex: number;\n    firstEventId: string | null;\n    firstEventTimestamp: string | null;\n    previousSessionId: string | null;\n    sessionId: string;\n    sessionIndex: number;\n    storageMechanism: string;\n    userId: string;\n}\n\n// @public\nexport interface CommonEventProperties<T = Record<string, unknown>> {\n    context?: Array<SelfDescribingJson<T>> | null;\n    timestamp?: Timestamp | null;\n}\n\n// @public\nexport type ConditionalContextProvider = FilterProvider | RuleSetProvider;\n\n// @public\nexport interface ContextEvent {\n    event: Payload;\n    eventSchema: string;\n    eventType: string;\n}\n\n// @public\nexport type ContextFilter = (args?: ContextEvent) => boolean;\n\n// @public\nexport type ContextGenerator = (args?: ContextEvent) => SelfDescribingJson | SelfDescribingJson[] | undefined;\n\n// @public\nexport type ContextPrimitive = SelfDescribingJson | ContextGenerator;\n\n// @public (undocumented)\nexport type CookieSameSite = "None" | "Lax" | "Strict";\n\n// @public\nexport interface CorePlugin {\n    activateCorePlugin?: (core: TrackerCore) => void;\n    afterTrack?: (payload: Payload) => void;\n    beforeTrack?: (payloadBuilder: PayloadBuilder) => void;\n    contexts?: () => SelfDescribingJson[];\n    filter?: (payload: Payload) => boolean;\n    logger?: (logger: Logger) => void;\n}\n\n// @public\nexport interface CorePluginConfiguration {\n    /* The plugin to add */\n    // (undocumented)\n    plugin: CorePlugin;\n}\n\n// @public\nexport function crossDomainLinker(crossDomainLinkerCriterion: (elt: HTMLAnchorElement | HTMLAreaElement) => boolean, trackers?: Array<string>): void;\n\n// @public\nexport interface DeviceTimestamp {\n    // (undocumented)\n    readonly type: "dtm";\n    // (undocumented)\n    readonly value: number;\n}\n\n// @public\nexport function disableActivityTracking(trackers?: Array<string>): void;\n\n// @public\nexport function disableActivityTrackingCallback(trackers?: Array<string>): void;\n\n// @public\nexport function disableAnonymousTracking(configuration?: DisableAnonymousTrackingConfiguration, trackers?: Array<string>): void;\n\n// @public\nexport interface DisableAnonymousTrackingConfiguration {\n    /* Available configurations for different storage strategies */\n    // (undocumented)\n    stateStorageStrategy?: StateStorageStrategy;\n}\n\n// @public\nexport function discardBrace(enable: boolean, trackers?: Array<string>): void;\n\n// @public\nexport function discardHashTag(enable: boolean, trackers?: Array<string>): void;\n\n// @public (undocumented)\nexport interface EmitterConfigurationBase {\n    bufferSize?: number;\n    connectionTimeout?: number;\n    credentials?: "omit" | "same-origin" | "include";\n    customFetch?: (input: Request, options?: RequestInit) => Promise<Response>;\n    customHeaders?: Record<string, string>;\n    dontRetryStatusCodes?: number[];\n    eventMethod?: EventMethod;\n    eventStore?: EventStore;\n    idService?: string;\n    keepalive?: boolean;\n    maxGetBytes?: number;\n    maxPostBytes?: number;\n    onRequestFailure?: (data: RequestFailure, response?: Response) => void;\n    onRequestSuccess?: (data: EventBatch, response: Response) => void;\n    postPath?: string;\n    retryFailedRequests?: boolean;\n    retryStatusCodes?: number[];\n    useStm?: boolean;\n}\n\n// @public\nexport function enableActivityTracking(configuration: ActivityTrackingConfiguration, trackers?: Array<string>): void;\n\n// @public\nexport function enableActivityTrackingCallback(configuration: ActivityTrackingConfiguration & ActivityTrackingConfigurationCallback, trackers?: Array<string>): void;\n\n// @public\nexport function enableAnonymousTracking(configuration?: EnableAnonymousTrackingConfiguration, trackers?: Array<string>): void;\n\n// @public\nexport interface EnableAnonymousTrackingConfiguration {\n    /* Configuration for Anonymous Tracking */\n    // (undocumented)\n    options?: AnonymousTrackingOptions;\n    /* Available configurations for different storage strategies */\n    // (undocumented)\n    stateStorageStrategy?: StateStorageStrategy;\n}\n\n// @public\nexport type EventBatch = Payload[];\n\n// Warning: (ae-forgotten-export) The symbol "EventJsonWithKeys" needs to be exported by the entry point index.module.d.ts\n//\n// @public\nexport type EventJson = Array<EventJsonWithKeys>;\n\n// @public (undocumented)\nexport type EventMethod = "post" | "get";\n\n// @public\nexport interface EventPayloadAndContext {\n    context: Array<SelfDescribingJson>;\n    event: PayloadBuilder;\n}\n\n// @public\nexport interface EventStore {\n    add: (payload: EventStorePayload) => Promise<number>;\n    count: () => Promise<number>;\n    getAll: () => Promise<readonly EventStorePayload[]>;\n    getAllPayloads: () => Promise<readonly Payload[]>;\n    iterator: () => EventStoreIterator;\n    removeHead: (count: number) => Promise<void>;\n}\n\n// @public (undocumented)\nexport interface EventStoreConfiguration {\n    maxSize?: number;\n}\n\n// @public\nexport interface EventStoreIterator {\n    // Warning: (ae-forgotten-export) The symbol "EventStoreIteratorNextResult" needs to be exported by the entry point index.module.d.ts\n    next: () => Promise<EventStoreIteratorNextResult>;\n}\n\n// @public (undocumented)\nexport interface EventStorePayload {\n    payload: Payload;\n    svrAnon?: boolean;\n}\n\n// @public (undocumented)\nexport type ExtendedCrossDomainLinkerAttributes = {\n    userId?: boolean;\n    sessionId?: boolean;\n    sourceId?: boolean;\n    sourcePlatform?: boolean;\n    reason?: boolean | ((evt: Event) => string);\n};\n\n// @public (undocumented)\nexport type ExtendedCrossDomainLinkerOptions = boolean | ExtendedCrossDomainLinkerAttributes;\n\n// @public\nexport type FilterProvider = [\nContextFilter,\nArray<ContextPrimitive> | ContextPrimitive\n];\n\n// @public\nexport function flushBuffer(configuration?: FlushBufferConfiguration, trackers?: Array<string>): void;\n\n// @public\nexport interface FlushBufferConfiguration {\n    /* The size of the buffer after this flush */\n    // (undocumented)\n    newBufferSize?: number;\n}\n\n// @public\nexport type JsonProcessor = (payloadBuilder: PayloadBuilder, jsonForProcessing: EventJson, contextEntitiesForProcessing: SelfDescribingJson[]) => void;\n\n// @public (undocumented)\nexport interface LocalStorageEventStoreConfigurationBase extends EventStoreConfiguration {\n    maxLocalStorageQueueSize?: number;\n    useLocalStorage?: boolean;\n}\n\n// @public (undocumented)\nexport interface Logger {\n    // (undocumented)\n    debug: (message: string, ...extraParams: unknown[]) => void;\n    // (undocumented)\n    error: (message: string, error?: unknown, ...extraParams: unknown[]) => void;\n    // (undocumented)\n    info: (message: string, ...extraParams: unknown[]) => void;\n    // Warning: (ae-forgotten-export) The symbol "LOG_LEVEL" needs to be exported by the entry point index.module.d.ts\n    //\n    // (undocumented)\n    setLogLevel: (level: LOG_LEVEL) => void;\n    // (undocumented)\n    warn: (message: string, error?: unknown, ...extraParams: unknown[]) => void;\n}\n\n// @public\nexport function newSession(trackers?: Array<string>): void;\n\n// @public\nexport function newTracker(trackerId: string, endpoint: string, configuration?: TrackerConfiguration): BrowserTracker | null | undefined;\n\n// @public\nexport interface PageViewEvent {\n    contextCallback?: (() => Array<SelfDescribingJson>) | null;\n    title?: string | null;\n}\n\n// @public\nexport type ParsedIdCookie = [\ncookieDisabled: string,\ndomainUserId: string,\ncookieCreateTs: number,\nvisitCount: number,\nnowTs: number,\nlastVisitTs: number | undefined,\nsessionId: string,\npreviousSessionId: string,\nfirstEventId: string,\nfirstEventTs: number | undefined,\neventIndex: number\n];\n\n// @public\nexport type Payload = Record<string, unknown>;\n\n// @public\nexport interface PayloadBuilder {\n    add: (key: string, value: unknown) => void;\n    addContextEntity: (entity: SelfDescribingJson) => void;\n    addDict: (dict: Payload) => void;\n    addJson: (keyIfEncoded: string, keyIfNotEncoded: string, json: Record<string, unknown>) => void;\n    build: () => Payload;\n    getJson: () => EventJson;\n    getPayload: () => Payload;\n    withJsonProcessor: (jsonProcessor: JsonProcessor) => void;\n}\n\n// @public (undocumented)\nexport type Platform = "web" | "mob" | "pc" | "srv" | "app" | "tv" | "cnsl" | "iot";\n\n// @public\nexport function preservePageViewId(trackers?: Array<string>): void;\n\n// @public (undocumented)\nexport type PreservePageViewIdForUrl = boolean | "full" | "pathname" | "pathnameAndSearch";\n\n// @public\nexport function removeGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive | string>, trackers?: Array<string>): void;\n\n// @public\nexport type RequestFailure = {\n    events: EventBatch;\n    status?: number;\n    message?: string;\n    willRetry: boolean;\n};\n\n// @public\nexport interface RuleSet {\n    // (undocumented)\n    accept?: Array<string> | string;\n    // (undocumented)\n    reject?: Array<string> | string;\n}\n\n// @public\nexport type RuleSetProvider = [\nRuleSet,\nArray<ContextPrimitive> | ContextPrimitive\n];\n\n// @public\nexport interface SelfDescribingEvent<T = Record<string, unknown>> {\n    event: SelfDescribingJson<T>;\n}\n\n// @public\nexport type SelfDescribingJson<T = Record<string, unknown>> = {\n    schema: string;\n    data: T extends any[] ? never : T extends {} ? T : never;\n};\n\n// @public\nexport function setBufferSize(newBufferSize: number, trackers?: Array<string>): void;\n\n// @public\nexport function setCollectorUrl(collectorUrl: string, trackers?: Array<string>): void;\n\n// @public\nexport function setCookiePath(path: string, trackers?: Array<string>): void;\n\n// @public\nexport function setCustomUrl(url: string, trackers?: Array<string>): void;\n\n// @public\nexport function setDocumentTitle(title: string, trackers?: Array<string>): void;\n\n// @public\nexport function setOptOutCookie(name?: string | null, trackers?: Array<string>): void;\n\n// @public\nexport function setReferrerUrl(url: string, trackers?: Array<string>): void;\n\n// @public\nexport function setUserId(userId?: string | null, trackers?: Array<string>): void;\n\n// @public\nexport function setUserIdFromCookie(cookieName: string, trackers?: Array<string>): void;\n\n// @public\nexport function setUserIdFromLocation(querystringField: string, trackers?: Array<string>): void;\n\n// @public\nexport function setUserIdFromReferrer(querystringField: string, trackers?: Array<string>): void;\n\n// @public\nexport function setVisitorCookieTimeout(timeout: number, trackers?: Array<string>): void;\n\n// @public\nexport class SharedState {\n    // (undocumented)\n    bufferFlushers: Array<(sync: boolean) => void>;\n    /* DOM Ready */\n    // (undocumented)\n    hasLoaded: boolean;\n    /* DOM Ready */\n    // (undocumented)\n    pageViewId?: string;\n    /* DOM Ready */\n    // (undocumented)\n    pageViewUrl?: string;\n    /* DOM Ready */\n    // (undocumented)\n    registeredOnLoadHandlers: Array<() => void>;\n}\n\n// @public (undocumented)\nexport type StateStorageStrategy = "cookieAndLocalStorage" | "cookie" | "localStorage" | "none";\n\n// @public\nexport interface StructuredEvent {\n    // (undocumented)\n    action: string;\n    // (undocumented)\n    category: string;\n    // (undocumented)\n    label?: string;\n    // (undocumented)\n    property?: string;\n    // (undocumented)\n    value?: number;\n}\n\n// @public\nexport type Timestamp = TrueTimestamp | DeviceTimestamp | number;\n\n// @public\nexport type TrackerConfiguration = {\n    encodeBase64?: boolean;\n    cookieDomain?: string;\n    cookieName?: string;\n    cookieSameSite?: CookieSameSite;\n    cookieSecure?: boolean;\n    cookieLifetime?: number;\n    sessionCookieTimeout?: number;\n    appId?: string;\n    platform?: Platform;\n    respectDoNotTrack?: boolean;\n    crossDomainLinker?: (elt: HTMLAnchorElement | HTMLAreaElement) => boolean;\n    useExtendedCrossDomainLinker?: ExtendedCrossDomainLinkerOptions;\n    discoverRootDomain?: boolean;\n    stateStorageStrategy?: StateStorageStrategy;\n    resetActivityTrackingOnPageView?: boolean;\n    anonymousTracking?: AnonymousTrackingOptions;\n    contexts?: BuiltInContexts;\n    plugins?: Array<BrowserPlugin>;\n    onSessionUpdateCallback?: (updatedSession: ClientSession) => void;\n    preservePageViewIdForUrl?: PreservePageViewIdForUrl;\n    synchronousCookieWrite?: boolean;\n} & EmitterConfigurationBase & LocalStorageEventStoreConfigurationBase;\n\n// @public\nexport interface TrackerCore {\n    addGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive> | Record<string, ConditionalContextProvider | ContextPrimitive>): void;\n    addPayloadDict(dict: Payload): void;\n    addPayloadPair: (key: string, value: unknown) => void;\n    addPlugin(configuration: CorePluginConfiguration): void;\n    clearGlobalContexts(): void;\n    getBase64Encoding(): boolean;\n    removeGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive | string>): void;\n    resetPayloadPairs(dict: Payload): void;\n    setAppId(appId: string): void;\n    setBase64Encoding(encode: boolean): void;\n    setColorDepth(depth: string): void;\n    setIpAddress(ip: string): void;\n    setLang(lang: string): void;\n    setPlatform(value: string): void;\n    setScreenResolution(width: string, height: string): void;\n    setTimezone(timezone: string): void;\n    setTrackerNamespace(name: string): void;\n    setTrackerVersion(version: string): void;\n    setUseragent(useragent: string): void;\n    setUserId(userId: string): void;\n    setViewport(width: string, height: string): void;\n    track: (pb: PayloadBuilder, context?: Array<SelfDescribingJson> | null, timestamp?: Timestamp | null) => Payload | undefined;\n}\n\n// @public\nexport function trackPageView(event?: PageViewEvent & CommonEventProperties, trackers?: Array<string>): void;\n\n// @public\nexport function trackSelfDescribingEvent<T = Record<string, unknown>>(event: SelfDescribingEvent<T> & CommonEventProperties, trackers?: Array<string>): void;\n\n// @public\nexport function trackStructEvent(event: StructuredEvent & CommonEventProperties, trackers?: Array<string>): void;\n\n// @public\nexport interface TrueTimestamp {\n    // (undocumented)\n    readonly type: "ttm";\n    // (undocumented)\n    readonly value: number;\n}\n\n// @public\nexport function updatePageActivity(trackers?: Array<string>): void;\n\n// @public (undocumented)\nexport const version: string;\n\n// (No @packageDocumentation comment for this package)\n\n'})})]})}function l(n={}){const{wrapper:e}={...(0,o.a)(),...n.components};return e?(0,r.jsx)(e,{...n,children:(0,r.jsx)(d,{...n})}):d(n)}},11151:(n,e,t)=>{t.d(e,{Z:()=>s,a:()=>a});var r=t(67294);const o={},i=r.createContext(o);function a(n){const e=r.useContext(i);return r.useMemo((function(){return"function"==typeof n?n(e):{...e,...n}}),[e,n])}function s(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(o):n.components||o:a(n.components),r.createElement(i.Provider,{value:e},n.children)}}}]);