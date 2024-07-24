"use strict";(self.webpackChunkapi_docs=self.webpackChunkapi_docs||[]).push([[7889],{4623:(r,e,n)=>{n.r(e),n.d(e,{assets:()=>c,contentTitle:()=>i,default:()=>u,frontMatter:()=>a,metadata:()=>s,toc:()=>d});var o=n(5893),t=n(1151);const a={},i=void 0,s={id:"browser-tracker/markdown/browser-tracker.trackerconfiguration",title:"browser-tracker.trackerconfiguration",description:"Home &gt; @snowplow/browser-tracker &gt; TrackerConfiguration",source:"@site/docs/browser-tracker/markdown/browser-tracker.trackerconfiguration.md",sourceDirName:"browser-tracker/markdown",slug:"/browser-tracker/markdown/browser-tracker.trackerconfiguration",permalink:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.trackerconfiguration",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"browser-tracker.structuredevent.value",permalink:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.structuredevent.value"},next:{title:"browser-tracker.trackpageview",permalink:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.trackpageview"}},c={},d=[{value:"TrackerConfiguration type",id:"trackerconfiguration-type",level:2},{value:"Example",id:"example",level:2}];function l(r){const e={a:"a",code:"code",h2:"h2",p:"p",pre:"pre",...(0,t.a)(),...r.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)(e.p,{children:[(0,o.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/",children:"Home"})," > ",(0,o.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker",children:"@snowplow/browser-tracker"})," > ",(0,o.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.trackerconfiguration",children:"TrackerConfiguration"})]}),"\n",(0,o.jsx)(e.h2,{id:"trackerconfiguration-type",children:"TrackerConfiguration type"}),"\n",(0,o.jsx)(e.p,{children:"The configuration object for initialising the tracker"}),"\n",(0,o.jsx)("b",{children:"Signature:"}),"\n",(0,o.jsx)(e.pre,{children:(0,o.jsx)(e.code,{className:"language-typescript",children:"type TrackerConfiguration = {\r\n    encodeBase64?: boolean;\r\n    cookieDomain?: string;\r\n    cookieName?: string;\r\n    cookieSameSite?: CookieSameSite;\r\n    cookieSecure?: boolean;\r\n    cookieLifetime?: number;\r\n    withCredentials?: boolean;\r\n    sessionCookieTimeout?: number;\r\n    appId?: string;\r\n    platform?: Platform;\r\n    respectDoNotTrack?: boolean;\r\n    eventMethod?: EventMethod;\r\n    postPath?: string;\r\n    useStm?: boolean;\r\n    bufferSize?: number;\r\n    crossDomainLinker?: (elt: HTMLAnchorElement | HTMLAreaElement) => boolean;\r\n    useExtendedCrossDomainLinker?: ExtendedCrossDomainLinkerOptions;\r\n    maxPostBytes?: number;\r\n    maxGetBytes?: number;\r\n    discoverRootDomain?: boolean;\r\n    stateStorageStrategy?: StateStorageStrategy;\r\n    maxLocalStorageQueueSize?: number;\r\n    resetActivityTrackingOnPageView?: boolean;\r\n    connectionTimeout?: number;\r\n    anonymousTracking?: AnonymousTrackingOptions;\r\n    contexts?: BuiltInContexts;\r\n    plugins?: Array<BrowserPlugin>;\r\n    customHeaders?: Record<string, string>;\r\n    retryStatusCodes?: number[];\r\n    dontRetryStatusCodes?: number[];\r\n    onSessionUpdateCallback?: (updatedSession: ClientSession) => void;\r\n    idService?: string;\r\n    retryFailedRequests?: boolean;\r\n    onRequestSuccess?: (data: EventBatch) => void;\r\n    onRequestFailure?: (data: RequestFailure) => void;\r\n    preservePageViewIdForUrl?: PreservePageViewIdForUrl;\r\n};\n"})}),"\n",(0,o.jsx)(e.h2,{id:"example",children:"Example"}),"\n",(0,o.jsx)(e.pre,{children:(0,o.jsx)(e.code,{children:"newTracker('sp1', 'collector.my-website.com', {\r\n appId: 'my-app-id',\r\n platform: 'web',\r\n plugins: [ PerformanceTimingPlugin(), AdTrackingPlugin() ],\r\n stateStorageStrategy: 'cookieAndLocalStorage'\r\n});\r\n\n"})})]})}function u(r={}){const{wrapper:e}={...(0,t.a)(),...r.components};return e?(0,o.jsx)(e,{...r,children:(0,o.jsx)(l,{...r})}):l(r)}},1151:(r,e,n)=>{n.d(e,{Z:()=>s,a:()=>i});var o=n(7294);const t={},a=o.createContext(t);function i(r){const e=o.useContext(a);return o.useMemo((function(){return"function"==typeof r?r(e):{...e,...r}}),[e,r])}function s(r){let e;return e=r.disableParentContext?"function"==typeof r.components?r.components(t):r.components||t:i(r.components),o.createElement(a.Provider,{value:e},r.children)}}}]);