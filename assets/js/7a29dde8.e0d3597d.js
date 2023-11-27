"use strict";(self.webpackChunkapi_docs=self.webpackChunkapi_docs||[]).push([[6199],{446:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>i,contentTitle:()=>d,default:()=>h,frontMatter:()=>c,metadata:()=>s,toc:()=>a});var t=n(5893),o=n(1151);const c={},d=void 0,s={id:"node-tracker/markdown/node-tracker.adconversionevent",title:"node-tracker.adconversionevent",description:"Home &gt; @snowplow/node-tracker &gt; AdConversionEvent",source:"@site/docs/node-tracker/markdown/node-tracker.adconversionevent.md",sourceDirName:"node-tracker/markdown",slug:"/node-tracker/markdown/node-tracker.adconversionevent",permalink:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker.adconversionevent",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"node-tracker.adconversionevent.initialvalue",permalink:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker.adconversionevent.initialvalue"},next:{title:"node-tracker.adconversionevent.property",permalink:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker.adconversionevent.property"}},i={},a=[{value:"AdConversionEvent interface",id:"adconversionevent-interface",level:2},{value:"Remarks",id:"remarks",level:2},{value:"Properties",id:"properties",level:2}];function l(e){const r={a:"a",code:"code",h2:"h2",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,o.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.a,{href:"/snowplow-javascript-tracker/docs/node-tracker/markdown/",children:"Home"})," > ",(0,t.jsx)(r.a,{href:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker",children:"@snowplow/node-tracker"})," > ",(0,t.jsx)(r.a,{href:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker.adconversionevent",children:"AdConversionEvent"})]}),"\n",(0,t.jsx)(r.h2,{id:"adconversionevent-interface",children:"AdConversionEvent interface"}),"\n",(0,t.jsx)(r.p,{children:"An Ad Conversion Event Used to track an advertisement click"}),"\n",(0,t.jsx)("b",{children:"Signature:"}),"\n",(0,t.jsx)(r.pre,{children:(0,t.jsx)(r.code,{className:"language-typescript",children:"interface AdConversionEvent \n"})}),"\n",(0,t.jsx)(r.h2,{id:"remarks",children:"Remarks"}),"\n",(0,t.jsx)(r.p,{children:"If you provide the cost field, you must also provide one of 'cpa', 'cpc', and 'cpm' for the costModel field."}),"\n",(0,t.jsx)(r.h2,{id:"properties",children:"Properties"}),"\n",(0,t.jsxs)(r.table,{children:[(0,t.jsx)(r.thead,{children:(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.th,{children:"Property"}),(0,t.jsx)(r.th,{children:"Type"}),(0,t.jsx)(r.th,{children:"Description"})]})}),(0,t.jsxs)(r.tbody,{children:[(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.a,{href:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker.adconversionevent.action",children:"action?"})}),(0,t.jsx)(r.td,{children:"string"}),(0,t.jsxs)(r.td,{children:[(0,t.jsx)("i",{children:"(Optional)"})," The type of user interaction e.g. 'purchase'"]})]}),(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.a,{href:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker.adconversionevent.advertiserid",children:"advertiserId?"})}),(0,t.jsx)(r.td,{children:"string"}),(0,t.jsxs)(r.td,{children:[(0,t.jsx)("i",{children:"(Optional)"})," Identifier for the advertiser which the campaign belongs to"]})]}),(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.a,{href:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker.adconversionevent.campaignid",children:"campaignId?"})}),(0,t.jsx)(r.td,{children:"string"}),(0,t.jsxs)(r.td,{children:[(0,t.jsx)("i",{children:"(Optional)"})," Identifier for the advertiser which the campaign belongs to"]})]}),(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.a,{href:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker.adconversionevent.category",children:"category?"})}),(0,t.jsx)(r.td,{children:"string"}),(0,t.jsxs)(r.td,{children:[(0,t.jsx)("i",{children:"(Optional)"})," Conversion category"]})]}),(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.a,{href:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker.adconversionevent.conversionid",children:"conversionId?"})}),(0,t.jsx)(r.td,{children:"string"}),(0,t.jsxs)(r.td,{children:[(0,t.jsx)("i",{children:"(Optional)"})," Identifier for the particular conversion instance"]})]}),(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.a,{href:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker.adconversionevent.cost",children:"cost?"})}),(0,t.jsx)(r.td,{children:"number"}),(0,t.jsxs)(r.td,{children:[(0,t.jsx)("i",{children:"(Optional)"})," Advertisement cost"]})]}),(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.a,{href:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker.adconversionevent.costmodel",children:"costModel?"})}),(0,t.jsx)(r.td,{children:'"cpa" | "cpc" | "cpm"'}),(0,t.jsxs)(r.td,{children:[(0,t.jsx)("i",{children:"(Optional)"})," The cost model for the campaign"]})]}),(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.a,{href:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker.adconversionevent.initialvalue",children:"initialValue?"})}),(0,t.jsx)(r.td,{children:"number"}),(0,t.jsxs)(r.td,{children:[(0,t.jsx)("i",{children:"(Optional)"})," How much the conversion is initially worth"]})]}),(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.a,{href:"/snowplow-javascript-tracker/docs/node-tracker/markdown/node-tracker.adconversionevent.property",children:"property?"})}),(0,t.jsx)(r.td,{children:"string"}),(0,t.jsxs)(r.td,{children:[(0,t.jsx)("i",{children:"(Optional)"})," Describes the object of the conversion"]})]})]})]})]})}function h(e={}){const{wrapper:r}={...(0,o.a)(),...e.components};return r?(0,t.jsx)(r,{...e,children:(0,t.jsx)(l,{...e})}):l(e)}},1151:(e,r,n)=>{n.d(r,{Z:()=>s,a:()=>d});var t=n(7294);const o={},c=t.createContext(o);function d(e){const r=t.useContext(c);return t.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function s(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:d(e.components),t.createElement(c.Provider,{value:r},e.children)}}}]);