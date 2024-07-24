"use strict";(self.webpackChunkapi_docs=self.webpackChunkapi_docs||[]).push([[7425],{9731:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>c,contentTitle:()=>d,default:()=>l,frontMatter:()=>s,metadata:()=>i,toc:()=>a});var o=t(5893),n=t(1151);const s={},d=void 0,i={id:"node-tracker/markdown/node-tracker.gotemitter",title:"node-tracker.gotemitter",description:"Home &gt; @snowplow/node-tracker &gt; gotEmitter",source:"@site/docs/node-tracker/markdown/node-tracker.gotemitter.md",sourceDirName:"node-tracker/markdown",slug:"/node-tracker/markdown/node-tracker.gotemitter",permalink:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker.gotemitter",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"node-tracker.formsubmissionevent",permalink:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker.formsubmissionevent"},next:{title:"node-tracker.httpmethod",permalink:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker.httpmethod"}},c={},a=[{value:"gotEmitter() function",id:"gotemitter-function",level:2},{value:"Parameters",id:"parameters",level:2}];function h(e){const r={a:"a",code:"code",h2:"h2",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,n.a)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)(r.p,{children:[(0,o.jsx)(r.a,{href:"/snowplow-javascript-tracker/docs/node-tracker/markdown/",children:"Home"})," > ",(0,o.jsx)(r.a,{href:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker",children:"@snowplow/node-tracker"})," > ",(0,o.jsx)(r.a,{href:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker.gotemitter",children:"gotEmitter"})]}),"\n",(0,o.jsx)(r.h2,{id:"gotemitter-function",children:"gotEmitter() function"}),"\n",(0,o.jsxs)(r.p,{children:["Create an emitter object, which uses the ",(0,o.jsx)(r.code,{children:"got"})," library, that will send events to a collector"]}),"\n",(0,o.jsx)("b",{children:"Signature:"}),"\n",(0,o.jsx)(r.pre,{children:(0,o.jsx)(r.code,{className:"language-typescript",children:"declare function gotEmitter(endpoint: string, protocol?: HttpProtocol, port?: number, method?: HttpMethod, bufferSize?: number, retry?: number | Partial<RequiredRetryOptions>, cookieJar?: PromiseCookieJar | ToughCookieJar, callback?: (error?: RequestError, response?: Response<string>) => void, agents?: Agents, serverAnonymization?: boolean): Emitter;\n"})}),"\n",(0,o.jsx)(r.h2,{id:"parameters",children:"Parameters"}),"\n",(0,o.jsxs)(r.table,{children:[(0,o.jsx)(r.thead,{children:(0,o.jsxs)(r.tr,{children:[(0,o.jsx)(r.th,{children:"Parameter"}),(0,o.jsx)(r.th,{children:"Type"}),(0,o.jsx)(r.th,{children:"Description"})]})}),(0,o.jsxs)(r.tbody,{children:[(0,o.jsxs)(r.tr,{children:[(0,o.jsx)(r.td,{children:"endpoint"}),(0,o.jsx)(r.td,{children:"string"}),(0,o.jsx)(r.td,{children:"The collector to which events will be sent"})]}),(0,o.jsxs)(r.tr,{children:[(0,o.jsx)(r.td,{children:"protocol"}),(0,o.jsx)(r.td,{children:"HttpProtocol"}),(0,o.jsx)(r.td,{children:"http or https"})]}),(0,o.jsxs)(r.tr,{children:[(0,o.jsx)(r.td,{children:"port"}),(0,o.jsx)(r.td,{children:"number"}),(0,o.jsx)(r.td,{children:"The port for requests to use"})]}),(0,o.jsxs)(r.tr,{children:[(0,o.jsx)(r.td,{children:"method"}),(0,o.jsx)(r.td,{children:"HttpMethod"}),(0,o.jsx)(r.td,{children:"get or post"})]}),(0,o.jsxs)(r.tr,{children:[(0,o.jsx)(r.td,{children:"bufferSize"}),(0,o.jsx)(r.td,{children:"number"}),(0,o.jsx)(r.td,{children:"Number of events which can be queued before flush is called"})]}),(0,o.jsxs)(r.tr,{children:[(0,o.jsx)(r.td,{children:"retry"}),(0,o.jsx)(r.td,{children:"number | Partial<RequiredRetryOptions>"}),(0,o.jsxs)(r.td,{children:["Configure the retry policy for ",(0,o.jsx)("code",{children:"got"})," - ",(0,o.jsx)(r.a,{href:"https://github.com/sindresorhus/got/blob/v11.5.2/readme.md%5C#retry",children:"https://github.com/sindresorhus/got/blob/v11.5.2/readme.md\\#retry"})]})]}),(0,o.jsxs)(r.tr,{children:[(0,o.jsx)(r.td,{children:"cookieJar"}),(0,o.jsx)(r.td,{children:"PromiseCookieJar | ToughCookieJar"}),(0,o.jsxs)(r.td,{children:["Add a cookieJar to ",(0,o.jsx)("code",{children:"got"})," - ",(0,o.jsx)(r.a,{href:"https://github.com/sindresorhus/got/blob/v11.5.2/readme.md%5C#cookiejar",children:"https://github.com/sindresorhus/got/blob/v11.5.2/readme.md\\#cookiejar"})]})]}),(0,o.jsxs)(r.tr,{children:[(0,o.jsx)(r.td,{children:"callback"}),(0,o.jsx)(r.td,{children:"(error?: RequestError, response?: Response<string>) => void"}),(0,o.jsxs)(r.td,{children:["Callback called after a ",(0,o.jsx)("code",{children:"got"})," request following retries - called with ErrorRequest (",(0,o.jsx)(r.a,{href:"https://github.com/sindresorhus/got/blob/v11.5.2/readme.md%5C#errors",children:"https://github.com/sindresorhus/got/blob/v11.5.2/readme.md\\#errors"}),") and Response (",(0,o.jsx)(r.a,{href:"https://github.com/sindresorhus/got/blob/v11.5.2/readme.md%5C#response",children:"https://github.com/sindresorhus/got/blob/v11.5.2/readme.md\\#response"}),")"]})]}),(0,o.jsxs)(r.tr,{children:[(0,o.jsx)(r.td,{children:"agents"}),(0,o.jsx)(r.td,{children:"Agents"}),(0,o.jsxs)(r.td,{children:["Set new http.Agent and https.Agent objects on ",(0,o.jsx)("code",{children:"got"})," requests - ",(0,o.jsx)(r.a,{href:"https://github.com/sindresorhus/got/blob/v11.5.2/readme.md%5C#agent",children:"https://github.com/sindresorhus/got/blob/v11.5.2/readme.md\\#agent"})]})]}),(0,o.jsxs)(r.tr,{children:[(0,o.jsx)(r.td,{children:"serverAnonymization"}),(0,o.jsx)(r.td,{children:"boolean"}),(0,o.jsx)(r.td,{children:"If the request should undergo server anonymization."})]})]})]}),"\n",(0,o.jsx)("b",{children:"Returns:"}),"\n",(0,o.jsx)(r.p,{children:"Emitter"})]})}function l(e={}){const{wrapper:r}={...(0,n.a)(),...e.components};return r?(0,o.jsx)(r,{...e,children:(0,o.jsx)(h,{...e})}):h(e)}},1151:(e,r,t)=>{t.d(r,{Z:()=>i,a:()=>d});var o=t(7294);const n={},s=o.createContext(n);function d(e){const r=o.useContext(s);return o.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function i(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(n):e.components||n:d(e.components),o.createElement(s.Provider,{value:r},e.children)}}}]);