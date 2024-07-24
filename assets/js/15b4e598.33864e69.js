"use strict";(self.webpackChunkapi_docs=self.webpackChunkapi_docs||[]).push([[4126],{732:(r,e,t)=>{t.r(e),t.d(e,{assets:()=>i,contentTitle:()=>n,default:()=>h,frontMatter:()=>c,metadata:()=>o,toc:()=>d});var s=t(5893),a=t(1151);const c={},n=void 0,o={id:"browser-tracker/markdown/browser-tracker",title:"browser-tracker",description:"Home &gt; @snowplow/browser-tracker",source:"@site/docs/browser-tracker/markdown/browser-tracker.md",sourceDirName:"browser-tracker/markdown",slug:"/browser-tracker/markdown/browser-tracker",permalink:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"browser-tracker.getbatch",permalink:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.getbatch"},next:{title:"browser-tracker.newsession",permalink:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.newsession"}},i={},d=[{value:"browser-tracker package",id:"browser-tracker-package",level:2},{value:"Functions",id:"functions",level:2},{value:"Interfaces",id:"interfaces",level:2},{value:"Variables",id:"variables",level:2},{value:"Type Aliases",id:"type-aliases",level:2}];function l(r){const e={a:"a",h2:"h2",p:"p",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,a.a)(),...r.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(e.p,{children:[(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/",children:"Home"})," > ",(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker",children:"@snowplow/browser-tracker"})]}),"\n",(0,s.jsx)(e.h2,{id:"browser-tracker-package",children:"browser-tracker package"}),"\n",(0,s.jsx)(e.h2,{id:"functions",children:"Functions"}),"\n",(0,s.jsxs)(e.table,{children:[(0,s.jsx)(e.thead,{children:(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.th,{children:"Function"}),(0,s.jsx)(e.th,{children:"Description"})]})}),(0,s.jsxs)(e.tbody,{children:[(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.addglobalcontexts",children:"addGlobalContexts(contexts, trackers)"})}),(0,s.jsx)(e.td,{children:"All provided contexts will be sent with every event"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.addplugin",children:"addPlugin(configuration, trackers)"})}),(0,s.jsx)(e.td,{children:"Add a plugin into the plugin collection after trackers have already been initialised"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.clearglobalcontexts",children:"clearGlobalContexts(trackers)"})}),(0,s.jsx)(e.td,{children:"Clear all global contexts that are sent with events"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.clearuserdata",children:"clearUserData(configuration, trackers)"})}),(0,s.jsx)(e.td,{children:"Clears all cookies and local storage containing user and session identifiers"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.crossdomainlinker",children:"crossDomainLinker(crossDomainLinkerCriterion, trackers)"})}),(0,s.jsx)(e.td,{children:"Enable querystring decoration for links passing a filter"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.disableactivitytracking",children:"disableActivityTracking(trackers)"})}),(0,s.jsx)(e.td,{children:"Disables page activity tracking."})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.disableactivitytrackingcallback",children:"disableActivityTrackingCallback(trackers)"})}),(0,s.jsx)(e.td,{children:"Disables page activity tracking callback."})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.disableanonymoustracking",children:"disableAnonymousTracking(configuration, trackers)"})}),(0,s.jsxs)(e.td,{children:["Disables anonymous tracking if active (ie. tracker initialized with ",(0,s.jsx)("code",{children:"anonymousTracking"}),") For stateStorageStrategy override, uses supplied value first, falls back to one defined in initial config, otherwise uses cookieAndLocalStorage."]})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.discardbrace",children:"discardBrace(enable, trackers)"})}),(0,s.jsx)(e.td,{children:"Strip braces from URL"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.discardhashtag",children:"discardHashTag(enable, trackers)"})}),(0,s.jsx)(e.td,{children:"Strip hash tag (or anchor) from URL"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.enableactivitytracking",children:"enableActivityTracking(configuration, trackers)"})}),(0,s.jsx)(e.td,{children:"Enables page activity tracking (sends page pings to the Collector regularly)."})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.enableactivitytrackingcallback",children:"enableActivityTrackingCallback(configuration, trackers)"})}),(0,s.jsx)(e.td,{children:"Enables page activity tracking (replaces collector ping with callback)."})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.enableanonymoustracking",children:"enableAnonymousTracking(configuration, trackers)"})}),(0,s.jsxs)(e.td,{children:["Enables anonymous tracking (ie. tracker initialized without ",(0,s.jsx)("code",{children:"anonymousTracking"}),")"]})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.flushbuffer",children:"flushBuffer(configuration, trackers)"})}),(0,s.jsx)(e.td,{children:"Send all events in the outQueue Only need to use this when sending events with a bufferSize of at least 2"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.newsession",children:"newSession(trackers)"})}),(0,s.jsx)(e.td,{children:"Expires current session and starts a new session."})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.newtracker",children:"newTracker(trackerId, endpoint)"})}),(0,s.jsx)(e.td,{children:"Initialise a new tracker"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.newtracker_1",children:"newTracker(trackerId, endpoint, configuration)"})}),(0,s.jsx)(e.td,{children:"Initialise a new tracker"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.preservepageviewid",children:"preservePageViewId(trackers)"})}),(0,s.jsxs)(e.td,{children:["Stop regenerating ",(0,s.jsx)("code",{children:"pageViewId"})," (available from ",(0,s.jsx)("code",{children:"web_page"})," context)"]})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.removeglobalcontexts",children:"removeGlobalContexts(contexts, trackers)"})}),(0,s.jsx)(e.td,{children:"All provided contexts will no longer be sent with every event"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.setbuffersize",children:"setBufferSize(newBufferSize, trackers)"})}),(0,s.jsx)(e.td,{children:"Set the buffer size Can be useful if you want to stop batching requests to ensure events start sending closer to event creation"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.setcollectorurl",children:"setCollectorUrl(collectorUrl, trackers)"})}),(0,s.jsx)(e.td,{children:"Specify the Snowplow collector URL. Specific http or https to force it or leave it off to match the website protocol."})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.setcookiepath",children:"setCookiePath(path, trackers)"})}),(0,s.jsx)(e.td,{children:"Set first-party cookie path"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.setcustomurl",children:"setCustomUrl(url, trackers)"})}),(0,s.jsx)(e.td,{children:"Override url"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.setdocumenttitle",children:"setDocumentTitle(title, trackers)"})}),(0,s.jsx)(e.td,{children:"Override document.title"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.setoptoutcookie",children:"setOptOutCookie(name, trackers)"})}),(0,s.jsx)(e.td,{children:"Sets the opt out cookie."})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.setreferrerurl",children:"setReferrerUrl(url, trackers)"})}),(0,s.jsx)(e.td,{children:"Override referrer"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.setuserid",children:"setUserId(userId, trackers)"})}),(0,s.jsx)(e.td,{children:"Set the business-defined user ID for this user."})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.setuseridfromcookie",children:"setUserIdFromCookie(cookieName, trackers)"})}),(0,s.jsx)(e.td,{children:"Set the business-defined user ID for this user to the value of a cookie."})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.setuseridfromlocation",children:"setUserIdFromLocation(querystringField, trackers)"})}),(0,s.jsx)(e.td,{children:"Set the business-defined user ID for this user using the location querystring."})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.setuseridfromreferrer",children:"setUserIdFromReferrer(querystringField, trackers)"})}),(0,s.jsx)(e.td,{children:"Set the business-defined user ID for this user using the referrer querystring."})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.setvisitorcookietimeout",children:"setVisitorCookieTimeout(timeout, trackers)"})}),(0,s.jsx)(e.td,{children:"Set visitor cookie timeout (in seconds)"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.trackpageview",children:"trackPageView(event, trackers)"})}),(0,s.jsx)(e.td,{children:"Track a visit to a web page"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.trackselfdescribingevent",children:"trackSelfDescribingEvent(event, trackers)"})}),(0,s.jsx)(e.td,{children:"Track a self-describing event happening on this page. A custom event type, allowing for an event to be tracked using your own custom schema and a data object which conforms to the supplied schema"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.trackstructevent",children:"trackStructEvent(event, trackers)"})}),(0,s.jsx)(e.td,{children:"Track a structured event A classic style of event tracking, allows for easier movement between analytics systems. A loosely typed event, creating a Self Describing event is preferred, but useful for interoperability."})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.updatepageactivity",children:"updatePageActivity(trackers)"})}),(0,s.jsx)(e.td,{children:"Triggers the activityHandler manually to allow external user defined activity. i.e. While watching a video"})]})]})]}),"\n",(0,s.jsx)(e.h2,{id:"interfaces",children:"Interfaces"}),"\n",(0,s.jsxs)(e.table,{children:[(0,s.jsx)(e.thead,{children:(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.th,{children:"Interface"}),(0,s.jsx)(e.th,{children:"Description"})]})}),(0,s.jsxs)(e.tbody,{children:[(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.activitytrackingconfiguration",children:"ActivityTrackingConfiguration"})}),(0,s.jsx)(e.td,{children:"The base configuration for activity tracking"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.activitytrackingconfigurationcallback",children:"ActivityTrackingConfigurationCallback"})}),(0,s.jsx)(e.td,{children:"The callback for enableActivityTrackingCallback"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.browserplugin",children:"BrowserPlugin"})}),(0,s.jsx)(e.td,{children:"Interface which defines Core Plugins"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.browserpluginconfiguration",children:"BrowserPluginConfiguration"})}),(0,s.jsx)(e.td,{children:"The configuration of the plugin to add"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.browsertracker",children:"BrowserTracker"})}),(0,s.jsx)(e.td,{children:"The Browser Tracker"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.clearuserdataconfiguration",children:"ClearUserDataConfiguration"})}),(0,s.jsx)(e.td,{children:"The configuration that can be changed when enabling anonymous tracking"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.clientsession",children:"ClientSession"})}),(0,s.jsx)(e.td,{children:"Schema for client client session context entity"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.commoneventproperties",children:"CommonEventProperties"})}),(0,s.jsx)(e.td,{children:"Additional data points to set when tracking an event"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.contextevent",children:"ContextEvent"})}),(0,s.jsxs)(e.td,{children:["Argument for ",(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.contextgenerator",children:"ContextGenerator"})," and ",(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.contextfilter",children:"ContextFilter"})," callback"]})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.disableanonymoustrackingconfiguration",children:"DisableAnonymousTrackingConfiguration"})}),(0,s.jsx)(e.td,{children:"The configuration that can be changed when disabling anonymous tracking"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.enableanonymoustrackingconfiguration",children:"EnableAnonymousTrackingConfiguration"})}),(0,s.jsx)(e.td,{children:"The configuration that can be changed when enabling anonymous tracking"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.eventpayloadandcontext",children:"EventPayloadAndContext"})}),(0,s.jsx)(e.td,{children:"Interface for returning a built event (PayloadBuilder) and context (Array of SelfDescribingJson)."})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.flushbufferconfiguration",children:"FlushBufferConfiguration"})}),(0,s.jsx)(e.td,{children:"The configuration that can be changed when flushing the buffer"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.pageviewevent",children:"PageViewEvent"})}),(0,s.jsx)(e.td,{children:"A Page View event Used for tracking a page view"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.ruleset",children:"RuleSet"})}),(0,s.jsx)(e.td,{children:"A ruleset has accept or reject properties that contain rules for matching Iglu schema URIs"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.selfdescribingevent",children:"SelfDescribingEvent"})}),(0,s.jsx)(e.td,{children:"A Self Describing Event A custom event type, allowing for an event to be tracked using your own custom schema and a data object which conforms to the supplied schema"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.structuredevent",children:"StructuredEvent"})}),(0,s.jsx)(e.td,{children:"A Structured Event A classic style of event tracking, allows for easier movement between analytics systems. A loosely typed event, creating a Self Describing event is preferred, but useful for interoperability."})]})]})]}),"\n",(0,s.jsx)(e.h2,{id:"variables",children:"Variables"}),"\n",(0,s.jsxs)(e.table,{children:[(0,s.jsx)(e.thead,{children:(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.th,{children:"Variable"}),(0,s.jsx)(e.th,{children:"Description"})]})}),(0,s.jsx)(e.tbody,{children:(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.version",children:"version"})}),(0,s.jsx)(e.td,{})]})})]}),"\n",(0,s.jsx)(e.h2,{id:"type-aliases",children:"Type Aliases"}),"\n",(0,s.jsxs)(e.table,{children:[(0,s.jsx)(e.thead,{children:(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.th,{children:"Type Alias"}),(0,s.jsx)(e.th,{children:"Description"})]})}),(0,s.jsxs)(e.tbody,{children:[(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.activitycallback",children:"ActivityCallback"})}),(0,s.jsx)(e.td,{children:"The callback for enableActivityTrackingCallback"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.activitycallbackdata",children:"ActivityCallbackData"})}),(0,s.jsx)(e.td,{children:"The data which is passed to the Activity Tracking callback"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.anonymoustrackingoptions",children:"AnonymousTrackingOptions"})}),(0,s.jsx)(e.td,{})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.builtincontexts",children:"BuiltInContexts"})}),(0,s.jsx)(e.td,{})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.conditionalcontextprovider",children:"ConditionalContextProvider"})}),(0,s.jsx)(e.td,{children:"Conditional context providers are two element arrays used to decide when to attach contexts, where: - the first element is some conditional criterion - the second element is any number of context primitives"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.contextfilter",children:"ContextFilter"})}),(0,s.jsx)(e.td,{children:"A context filter is a user-supplied callback that is evaluated for each event to determine if the context associated with the filter should be attached to the event"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.contextgenerator",children:"ContextGenerator"})}),(0,s.jsx)(e.td,{children:"A context generator is a user-supplied callback that is evaluated for each event to allow an additional context to be dynamically attached to the event"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.contextprimitive",children:"ContextPrimitive"})}),(0,s.jsx)(e.td,{children:"A context primitive is either a self-describing JSON or a context generator"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.cookiesamesite",children:"CookieSameSite"})}),(0,s.jsx)(e.td,{})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.eventbatch",children:"EventBatch"})}),(0,s.jsx)(e.td,{children:"A collection of events which are sent to the collector. This can either be a collection of query strings or JSON objects."})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.eventmethod",children:"EventMethod"})}),(0,s.jsx)(e.td,{})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.extendedcrossdomainlinkerattributes",children:"ExtendedCrossDomainLinkerAttributes"})}),(0,s.jsx)(e.td,{})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.extendedcrossdomainlinkeroptions",children:"ExtendedCrossDomainLinkerOptions"})}),(0,s.jsx)(e.td,{})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.filterprovider",children:"FilterProvider"})}),(0,s.jsx)(e.td,{children:"A filter provider is a tuple that has two parts: a context filter and the context primitive(s) If the context filter evaluates to true, the tracker will attach the context primitive(s)"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.getbatch",children:"GetBatch"})}),(0,s.jsx)(e.td,{children:"A collection of GET events which are sent to the collector. This will be a collection of query strings."})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.parsedidcookie",children:"ParsedIdCookie"})}),(0,s.jsxs)(e.td,{children:["The format of state elements stored in the ",(0,s.jsx)("code",{children:"id"})," cookie."]})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.platform",children:"Platform"})}),(0,s.jsx)(e.td,{})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.postbatch",children:"PostBatch"})}),(0,s.jsx)(e.td,{children:"A collection of POST events which are sent to the collector. This will be a collection of JSON objects."})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.preservepageviewidforurl",children:"PreservePageViewIdForUrl"})}),(0,s.jsx)(e.td,{})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.requestfailure",children:"RequestFailure"})}),(0,s.jsxs)(e.td,{children:["The data that will be available to the ",(0,s.jsx)("code",{children:"onRequestFailure"})," callback"]})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.rulesetprovider",children:"RuleSetProvider"})}),(0,s.jsx)(e.td,{children:"A ruleset provider is aa tuple that has two parts: a ruleset and the context primitive(s) If the ruleset allows the current event schema URI, the tracker will attach the context primitive(s)"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.selfdescribingjson",children:"SelfDescribingJson"})}),(0,s.jsx)(e.td,{children:"Export interface for any Self-Describing JSON such as context or Self Describing events"})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.statestoragestrategy",children:"StateStorageStrategy"})}),(0,s.jsx)(e.td,{})]}),(0,s.jsxs)(e.tr,{children:[(0,s.jsx)(e.td,{children:(0,s.jsx)(e.a,{href:"/snowplow-javascript-tracker/docs/browser-tracker/markdown/browser-tracker.trackerconfiguration",children:"TrackerConfiguration"})}),(0,s.jsx)(e.td,{children:"The configuration object for initialising the tracker"})]})]})]})]})}function h(r={}){const{wrapper:e}={...(0,a.a)(),...r.components};return e?(0,s.jsx)(e,{...r,children:(0,s.jsx)(l,{...r})}):l(r)}},1151:(r,e,t)=>{t.d(e,{Z:()=>o,a:()=>n});var s=t(7294);const a={},c=s.createContext(a);function n(r){const e=s.useContext(c);return s.useMemo((function(){return"function"==typeof r?r(e):{...e,...r}}),[e,r])}function o(r){let e;return e=r.disableParentContext?"function"==typeof r.components?r.components(a):r.components||a:n(r.components),s.createElement(c.Provider,{value:e},r.children)}}}]);