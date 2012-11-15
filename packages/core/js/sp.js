/*
 * SnowPlow - The world's most powerful web analytics platform
 *
 * @description JavaScript tracker for SnowPlow
 * @version     0.8.0
 * @author      Alex Dean, Simon Andersson, Anthon Pang
 * @copyright   Anthon Pang, SnowPlow Analytics Ltd
 * @license     Simplified BSD
 */
if(!this.JSON2){this.JSON2={}}(function(){function d(f){return f<10?"0"+f:f}function l(n,m){var f=Object.prototype.toString.apply(n);if(f==="[object Date]"){return isFinite(n.valueOf())?n.getUTCFullYear()+"-"+d(n.getUTCMonth()+1)+"-"+d(n.getUTCDate())+"T"+d(n.getUTCHours())+":"+d(n.getUTCMinutes())+":"+d(n.getUTCSeconds())+"Z":null}if(f==="[object String]"||f==="[object Number]"||f==="[object Boolean]"){return n.valueOf()}if(f!=="[object Array]"&&typeof n.toJSON==="function"){return n.toJSON(m)}return n}var c=new RegExp("[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]","g"),e='\\\\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]',i=new RegExp("["+e,"g"),j,b,k={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},h;
function a(f){i.lastIndex=0;return i.test(f)?'"'+f.replace(i,function(m){var n=k[m];return typeof n==="string"?n:"\\u"+("0000"+m.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+f+'"'}function g(s,p){var n,m,t,f,q=j,o,r=p[s];if(r&&typeof r==="object"){r=l(r,s)}if(typeof h==="function"){r=h.call(p,s,r)}switch(typeof r){case"string":return a(r);case"number":return isFinite(r)?String(r):"null";case"boolean":case"null":return String(r);case"object":if(!r){return"null"}j+=b;o=[];if(Object.prototype.toString.apply(r)==="[object Array]"){f=r.length;for(n=0;n<f;n+=1){o[n]=g(n,r)||"null"}t=o.length===0?"[]":j?"[\n"+j+o.join(",\n"+j)+"\n"+q+"]":"["+o.join(",")+"]";j=q;return t}if(h&&typeof h==="object"){f=h.length;for(n=0;n<f;n+=1){if(typeof h[n]==="string"){m=h[n];t=g(m,r);if(t){o.push(a(m)+(j?": ":":")+t)}}}}else{for(m in r){if(Object.prototype.hasOwnProperty.call(r,m)){t=g(m,r);if(t){o.push(a(m)+(j?": ":":")+t)}}}}t=o.length===0?"{}":j?"{\n"+j+o.join(",\n"+j)+"\n"+q+"}":"{"+o.join(",")+"}";j=q;
return t}}if(typeof JSON2.stringify!=="function"){JSON2.stringify=function(o,m,n){var f;j="";b="";if(typeof n==="number"){for(f=0;f<n;f+=1){b+=" "}}else{if(typeof n==="string"){b=n}}h=m;if(m&&typeof m!=="function"&&(typeof m!=="object"||typeof m.length!=="number")){throw new Error("JSON.stringify")}return g("",{"":o})}}if(typeof JSON2.parse!=="function"){JSON2.parse=function(o,f){var n;function m(s,r){var q,p,t=s[r];if(t&&typeof t==="object"){for(q in t){if(Object.prototype.hasOwnProperty.call(t,q)){p=m(t,q);if(p!==undefined){t[q]=p}else{delete t[q]}}}}return f.call(s,r,t)}o=String(o);c.lastIndex=0;if(c.test(o)){o=o.replace(c,function(p){return"\\u"+("0000"+p.charCodeAt(0).toString(16)).slice(-4)})}if((new RegExp("^[\\],:{}\\s]*$")).test(o.replace(new RegExp('\\\\(?:["\\\\/bfnrt]|u[0-9a-fA-F]{4})',"g"),"@").replace(new RegExp('"[^"\\\\\n\r]*"|true|false|null|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?',"g"),"]").replace(new RegExp("(?:^|:|,)(?:\\s*\\[)+","g"),""))){n=eval("("+o+")");
return typeof f==="function"?m({"":n},""):n}throw new SyntaxError("JSON.parse")}}}());(function(a){var b=(function(){var f="s",g=function(j){var k=-j.getTimezoneOffset();return(k!==null?k:0)},c=function(){return g(new Date(2010,0,1,0,0,0,0))},e=function(){return g(new Date(2010,5,1,0,0,0,0))},h=function(k){var l=((k.getMonth()>5?e():c())),j=g(k);return(l-j)!==0},i=function(){var j=c(),k=e(),l=c()-e();if(l<0){return j+",1"}else{if(l>0){return k+",1,"+f}}return j+",0"},d=function(){var j=i();return new b.TimeZone(b.olson.timezones[j])};return{determine_timezone:function(){if(typeof console!=="undefined"){console.log("jstz.determine_timezone() is deprecated and will be removed in an upcoming version. Please use jstz.determine() instead.")}return d()},determine:d,date_is_dst:h}}());b.TimeZone=function(c){var e=null,d=function(){return e},g=function(){var h=b.olson.ambiguity_list[e],k=h.length,j=0,l=h[0];for(;j<k;j+=1){l=h[j];if(b.date_is_dst(b.olson.dst_start_dates[l])){e=l;return}}},f=function(){return typeof(b.olson.ambiguity_list[e])!=="undefined"
};e=c;if(f()){g()}return{name:d}};b.olson={};b.olson.timezones={"-720,0":"Etc/GMT+12","-660,0":"Pacific/Pago_Pago","-600,1":"America/Adak","-600,0":"Pacific/Honolulu","-570,0":"Pacific/Marquesas","-540,0":"Pacific/Gambier","-540,1":"America/Anchorage","-480,1":"America/Los_Angeles","-480,0":"Pacific/Pitcairn","-420,0":"America/Phoenix","-420,1":"America/Denver","-360,0":"America/Guatemala","-360,1":"America/Chicago","-360,1,s":"Pacific/Easter","-300,0":"America/Bogota","-300,1":"America/New_York","-270,0":"America/Caracas","-240,1":"America/Halifax","-240,0":"America/Santo_Domingo","-240,1,s":"America/Asuncion","-210,1":"America/St_Johns","-180,1":"America/Godthab","-180,0":"America/Argentina/Buenos_Aires","-180,1,s":"America/Montevideo","-120,0":"America/Noronha","-120,1":"Etc/GMT+2","-60,1":"Atlantic/Azores","-60,0":"Atlantic/Cape_Verde","0,0":"Etc/UTC","0,1":"Europe/London","60,1":"Europe/Berlin","60,0":"Africa/Lagos","60,1,s":"Africa/Windhoek","120,1":"Asia/Beirut","120,0":"Africa/Johannesburg","180,1":"Europe/Moscow","180,0":"Asia/Baghdad","210,1":"Asia/Tehran","240,0":"Asia/Dubai","240,1":"Asia/Yerevan","270,0":"Asia/Kabul","300,1":"Asia/Yekaterinburg","300,0":"Asia/Karachi","330,0":"Asia/Kolkata","345,0":"Asia/Kathmandu","360,0":"Asia/Dhaka","360,1":"Asia/Omsk","390,0":"Asia/Rangoon","420,1":"Asia/Krasnoyarsk","420,0":"Asia/Jakarta","480,0":"Asia/Shanghai","480,1":"Asia/Irkutsk","525,0":"Australia/Eucla","525,1,s":"Australia/Eucla","540,1":"Asia/Yakutsk","540,0":"Asia/Tokyo","570,0":"Australia/Darwin","570,1,s":"Australia/Adelaide","600,0":"Australia/Brisbane","600,1":"Asia/Vladivostok","600,1,s":"Australia/Sydney","630,1,s":"Australia/Lord_Howe","660,1":"Asia/Kamchatka","660,0":"Pacific/Noumea","690,0":"Pacific/Norfolk","720,1,s":"Pacific/Auckland","720,0":"Pacific/Tarawa","765,1,s":"Pacific/Chatham","780,0":"Pacific/Tongatapu","780,1,s":"Pacific/Apia","840,0":"Pacific/Kiritimati"};
b.olson.dst_start_dates={"America/Denver":new Date(2011,2,13,3,0,0,0),"America/Mazatlan":new Date(2011,3,3,3,0,0,0),"America/Chicago":new Date(2011,2,13,3,0,0,0),"America/Mexico_City":new Date(2011,3,3,3,0,0,0),"Atlantic/Stanley":new Date(2011,8,4,7,0,0,0),"America/Asuncion":new Date(2011,9,2,3,0,0,0),"America/Santiago":new Date(2011,9,9,3,0,0,0),"America/Campo_Grande":new Date(2011,9,16,5,0,0,0),"America/Montevideo":new Date(2011,9,2,3,0,0,0),"America/Sao_Paulo":new Date(2011,9,16,5,0,0,0),"America/Los_Angeles":new Date(2011,2,13,8,0,0,0),"America/Santa_Isabel":new Date(2011,3,5,8,0,0,0),"America/Havana":new Date(2011,2,13,2,0,0,0),"America/New_York":new Date(2011,2,13,7,0,0,0),"Asia/Gaza":new Date(2011,2,26,23,0,0,0),"Asia/Beirut":new Date(2011,2,27,1,0,0,0),"Europe/Minsk":new Date(2011,2,27,2,0,0,0),"Europe/Helsinki":new Date(2011,2,27,4,0,0,0),"Europe/Istanbul":new Date(2011,2,28,5,0,0,0),"Asia/Damascus":new Date(2011,3,1,2,0,0,0),"Asia/Jerusalem":new Date(2011,3,1,6,0,0,0),"Africa/Cairo":new Date(2010,3,30,4,0,0,0),"Asia/Yerevan":new Date(2011,2,27,4,0,0,0),"Asia/Baku":new Date(2011,2,27,8,0,0,0),"Pacific/Auckland":new Date(2011,8,26,7,0,0,0),"Pacific/Fiji":new Date(2010,11,29,23,0,0,0),"America/Halifax":new Date(2011,2,13,6,0,0,0),"America/Goose_Bay":new Date(2011,2,13,2,1,0,0),"America/Miquelon":new Date(2011,2,13,5,0,0,0),"America/Godthab":new Date(2011,2,27,1,0,0,0)};
b.olson.ambiguity_list={"America/Denver":["America/Denver","America/Mazatlan"],"America/Chicago":["America/Chicago","America/Mexico_City"],"America/Asuncion":["Atlantic/Stanley","America/Asuncion","America/Santiago","America/Campo_Grande"],"America/Montevideo":["America/Montevideo","America/Sao_Paulo"],"Asia/Beirut":["Asia/Gaza","Asia/Beirut","Europe/Minsk","Europe/Helsinki","Europe/Istanbul","Asia/Damascus","Asia/Jerusalem","Africa/Cairo"],"Asia/Yerevan":["Asia/Yerevan","Asia/Baku"],"Pacific/Auckland":["Pacific/Auckland","Pacific/Fiji"],"America/Los_Angeles":["America/Los_Angeles","America/Santa_Isabel"],"America/New_York":["America/Havana","America/New_York"],"America/Halifax":["America/Goose_Bay","America/Halifax"],"America/Godthab":["America/Miquelon","America/Godthab"]};if(typeof exports!=="undefined"){exports.jstz=b}else{a.jstz=b}})(this);var _snaq=_snaq||[];var SnowPlow=SnowPlow||function(){var a=window;return{version:"js-0.8.0",expireDateTime:null,plugins:{},hasLoaded:false,registeredOnLoadHandlers:[],documentAlias:document,windowAlias:a,navigatorAlias:navigator,screenAlias:screen,encodeWrapper:a.encodeURIComponent,decodeWrapper:a.decodeURIComponent,urldecode:unescape,asyncTracker:null,}
}();SnowPlow.isDefined=function(a){return typeof a!=="undefined"};SnowPlow.isFunction=function(a){return typeof a==="function"};SnowPlow.isObject=function(a){return typeof a==="object"};SnowPlow.isString=function(a){return typeof a==="string"||a instanceof String};SnowPlow.encodeUtf8=function(a){return SnowPlow.urldecode(SnowPlow.encodeWrapper(a))};SnowPlow.urlFixup=function(e,a,b){function d(i,h){var l=new RegExp("^(?:https?|ftp)(?::/*(?:[^?]+)[?])([^#]+)"),k=l.exec(i),j=new RegExp("(?:^|&)"+h+"=([^&]*)"),g=k?j.exec(k[1]):0;return g?SnowPlow.decodeWrapper(g[1]):""}function c(f){var h=new RegExp("^(?:(?:https?|ftp):)/*(?:[^@]+@)?([^:/#]+)"),g=h.exec(f);return g?g[1]:f}if(e==="translate.googleusercontent.com"){if(b===""){b=a}a=d(a,"u");e=c(a)}else{if(e==="cc.bingj.com"||e==="webcache.googleusercontent.com"||e.slice(0,5)==="74.6."){a=SnowPlow.documentAlias.links[0].href;e=c(a)}}return[e,a,b]};SnowPlow.getReferrer=function(){var a="";try{a=SnowPlow.windowAlias.top.document.referrer}catch(c){if(SnowPlow.windowAlias.parent){try{a=SnowPlow.windowAlias.parent.document.referrer
}catch(b){a=""}}}if(a===""){a=SnowPlow.documentAlias.referrer}return a};SnowPlow.domainFixup=function(b){var a=b.length;if(b.charAt(--a)==="."){b=b.slice(0,a)}if(b.slice(0,2)==="*."){b=b.slice(1)}return b};SnowPlow.addEventListener=function(d,c,b,a){if(d.addEventListener){d.addEventListener(c,b,a);return true}if(d.attachEvent){return d.attachEvent("on"+c,b)}d["on"+c]=b};SnowPlow.getCookie=function(c){var a=new RegExp("(^|;)[ ]*"+c+"=([^;]*)"),b=a.exec(SnowPlow.documentAlias.cookie);return b?SnowPlow.decodeWrapper(b[2]):0};SnowPlow.setCookie=function(g,d,c,f,b,e){var a;if(c){a=new Date();a.setTime(a.getTime()+c)}SnowPlow.documentAlias.cookie=g+"="+SnowPlow.encodeWrapper(d)+(c?";expires="+a.toGMTString():"")+";path="+(f||"/")+(b?";domain="+b:"")+(e?";secure":"")};SnowPlow.executePluginMethod=function(b,e){var a="",d,c;for(d in SnowPlow.plugins){if(Object.prototype.hasOwnProperty.call(SnowPlow.plugins,d)){c=SnowPlow.plugins[d][b];if(SnowPlow.isFunction(c)){a+=c(e)}}}return a};SnowPlow.sha1=function sha1(r){var c=function(j,i){return(j<<i)|(j>>>(32-i))
},s=function(y){var x="",w,j;for(w=7;w>=0;w--){j=(y>>>(w*4))&15;x+=j.toString(16)}return x},f,u,t,b=[],l=1732584193,h=4023233417,g=2562383102,e=271733878,d=3285377520,q,p,o,n,m,v,a,k=[];r=SnowPlow.encodeUtf8(r);a=r.length;for(u=0;u<a-3;u+=4){t=r.charCodeAt(u)<<24|r.charCodeAt(u+1)<<16|r.charCodeAt(u+2)<<8|r.charCodeAt(u+3);k.push(t)}switch(a&3){case 0:u=2147483648;break;case 1:u=r.charCodeAt(a-1)<<24|8388608;break;case 2:u=r.charCodeAt(a-2)<<24|r.charCodeAt(a-1)<<16|32768;break;case 3:u=r.charCodeAt(a-3)<<24|r.charCodeAt(a-2)<<16|r.charCodeAt(a-1)<<8|128;break}k.push(u);while((k.length&15)!==14){k.push(0)}k.push(a>>>29);k.push((a<<3)&4294967295);for(f=0;f<k.length;f+=16){for(u=0;u<16;u++){b[u]=k[f+u]}for(u=16;u<=79;u++){b[u]=c(b[u-3]^b[u-8]^b[u-14]^b[u-16],1)}q=l;p=h;o=g;n=e;m=d;for(u=0;u<=19;u++){v=(c(q,5)+((p&o)|(~p&n))+m+b[u]+1518500249)&4294967295;m=n;n=o;o=c(p,30);p=q;q=v}for(u=20;u<=39;u++){v=(c(q,5)+(p^o^n)+m+b[u]+1859775393)&4294967295;m=n;n=o;o=c(p,30);p=q;q=v}for(u=40;u<=59;u++){v=(c(q,5)+((p&o)|(p&n)|(o&n))+m+b[u]+2400959708)&4294967295;
m=n;n=o;o=c(p,30);p=q;q=v}for(u=60;u<=79;u++){v=(c(q,5)+(p^o^n)+m+b[u]+3395469782)&4294967295;m=n;n=o;o=c(p,30);p=q;q=v}l=(l+q)&4294967295;h=(h+p)&4294967295;g=(g+o)&4294967295;e=(e+n)&4294967295;d=(d+m)&4294967295}v=s(l)+s(h)+s(g)+s(e)+s(d);return v.toLowerCase()};SnowPlow.murmurhash3_32_gc=function murmurhash3_32_gc(k,f){var l,m,h,b,e,a,c,j,g,d;l=k.length&3;m=k.length-l;h=f;e=3432918353;c=461845907;d=0;while(d<m){g=((k.charCodeAt(d)&255))|((k.charCodeAt(++d)&255)<<8)|((k.charCodeAt(++d)&255)<<16)|((k.charCodeAt(++d)&255)<<24);++d;g=((((g&65535)*e)+((((g>>>16)*e)&65535)<<16)))&4294967295;g=(g<<15)|(g>>>17);g=((((g&65535)*c)+((((g>>>16)*c)&65535)<<16)))&4294967295;h^=g;h=(h<<13)|(h>>>19);b=((((h&65535)*5)+((((h>>>16)*5)&65535)<<16)))&4294967295;h=(((b&65535)+27492)+((((b>>>16)+58964)&65535)<<16))}g=0;switch(l){case 3:g^=(k.charCodeAt(d+2)&255)<<16;case 2:g^=(k.charCodeAt(d+1)&255)<<8;case 1:g^=(k.charCodeAt(d)&255);g=(((g&65535)*e)+((((g>>>16)*e)&65535)<<16))&4294967295;g=(g<<15)|(g>>>17);
g=(((g&65535)*c)+((((g>>>16)*c)&65535)<<16))&4294967295;h^=g}h^=k.length;h^=h>>>16;h=(((h&65535)*2246822507)+((((h>>>16)*2246822507)&65535)<<16))&4294967295;h^=h>>>13;h=((((h&65535)*3266489909)+((((h>>>16)*3266489909)&65535)<<16)))&4294967295;h^=h>>>16;return h>>>0};SnowPlow.Tracker=function Tracker(v){var b=SnowPlow.urlFixup(SnowPlow.documentAlias.domain,SnowPlow.windowAlias.location.href,SnowPlow.getReferrer()),ag=SnowPlow.domainFixup(b[0]),au=b[1],T=b[2],R="GET",d=B(v),al="",F,x=SnowPlow.documentAlias.title,z="7z|aac|ar[cj]|as[fx]|avi|bin|csv|deb|dmg|doc|exe|flv|gif|gz|gzip|hqx|jar|jpe?g|js|mp(2|3|4|e?g)|mov(ie)?|ms[ip]|od[bfgpst]|og[gv]|pdf|phps|png|ppt|qtm?|ra[mr]?|rpm|sea|sit|tar|t?bz2?|tgz|torrent|txt|wav|wm[av]|wpd||xls|xml|z|zip",P=[ag],f=[],K=[],r=[],O=500,g,t,h,ar="_sp_",l,at,ao,D,p=63072000000,q=1800000,H=15768000000,n=SnowPlow.documentAlias.location.protocol==="https",o=SnowPlow.navigatorAlias.userLanguage||SnowPlow.navigatorAlias.language,am=aq(),N=i(),s=U(),Y=false,V=false,S,L,m,A=SnowPlow.sha1,X,E,e=ad();
function ad(){return{transaction:{},items:[]}}function ap(ay){var az;if(h){az=new RegExp("#.*");return ay.replace(az,"")}return ay}function aw(ay){var aA=new RegExp("^([a-z]+):"),az=aA.exec(ay);return az?az[1]:null}function af(aA,ay){var aB=aw(ay),az;if(aB){return ay}if(ay.slice(0,1)==="/"){return aw(aA)+"://"+getHostName(aA)+ay}aA=ap(aA);if((az=aA.indexOf("?"))>=0){aA=aA.slice(0,az)}if((az=aA.lastIndexOf("/"))!==aA.length-1){aA=aA.slice(0,az+1)}return aA+ay}function Q(aB){var az,ay,aA;for(az=0;az<P.length;az++){ay=domainFixup(P[az].toLowerCase());if(aB===ay){return true}if(ay.slice(0,1)==="."){if(aB===ay.slice(1)){return true}aA=aB.length-ay.length;if((aA>0)&&(aB.slice(aA)===ay)){return true}}}return false}function ax(ay){var az=new Image(1,1);az.onload=function(){};az.src=d+"?"+ay}function C(aA,az){var ay=new Date();if(!ao){ax(aA);SnowPlow.expireDateTime=ay.getTime()+az}}function ac(ay){return ar+ay+"."+al+"."+X}function c(){var ay=ac("testcookie");if(!SnowPlow.isDefined(SnowPlow.navigatorAlias.cookieEnabled)){SnowPlow.setCookie(ay,"1");
return SnowPlow.getCookie(ay)==="1"?"1":"0"}return SnowPlow.navigatorAlias.cookieEnabled?"1":"0"}function M(){X=A((l||ag)+(at||"/")).slice(0,4)}function ak(){var ay=new Date();S=ay.getTime()}function k(aC,az,ay,aB,aA){SnowPlow.setCookie(ac("id"),aC+"."+az+"."+ay+"."+aB+"."+aA,p,at,l,n)}function a(){var az=new Date(),ay=Math.round(az.getTime()/1000),aB=SnowPlow.getCookie(ac("id")),aA;if(aB){aA=aB.split(".");aA.unshift("0")}else{if(!E){E=A((SnowPlow.navigatorAlias.userAgent||"")+(SnowPlow.navigatorAlias.platform||"")+JSON2.stringify(am)+ay).slice(0,16)}aA=["1",E,ay,0,ay,""]}return aA}function y(az,aQ){var aO,ay=new Date(),aE=Math.round(ay.getTime()/1000),aS,aP,aB,aK,aM,aD,aC,aN,aA=1024,aT,aG,aJ=ac("id"),aF=ac("ses"),aL=a(),aI=SnowPlow.getCookie(aF),aR=F||au,aH;if(ao){SnowPlow.setCookie(aJ,"",-1,at,l);SnowPlow.setCookie(aF,"",-1,at,l);return""}aS=aL[0];aP=aL[1];aK=aL[2];aB=aL[3];aM=aL[4];aD=aL[5];if(!aI){aB++;aD=aM}az+="&p=Web&tid="+String(Math.random()).slice(2,8)+"&uid="+aP+"&fp="+s+"&vid="+aB+"&tv="+SnowPlow.encodeWrapper(SnowPlow.version)+(al.length?"&aid="+SnowPlow.encodeWrapper(al):"")+"&lang="+o+(T.length?"&refr="+SnowPlow.encodeWrapper(ap(T)):"");
for(aO in am){if(Object.prototype.hasOwnProperty.call(am,aO)){aH=(aO==="res"||aO==="cd"||aO==="cookie")?"&":"&f_";az+=aH+aO+"="+am[aO]}}az+="&tz="+N;az+="&url="+SnowPlow.encodeWrapper(ap(window.location));k(aP,aK,aB,aE,aD);SnowPlow.setCookie(aF,"*",q,at,l,n);az+=SnowPlow.executePluginMethod(aQ);return az}function ae(ay){return("https:"==document.location.protocol?"https":"http")+"://"+ay+"/i"}function B(ay){return ae(ay+".cloudfront.net")}function ah(ay){var az=ay||"";return{add:function(aA,aB){if(aB!==undefined&&aB!==""){az+="&"+aA+"="+SnowPlow.encodeWrapper(aB)}},build:function(){return az}}}function j(aA,aD,ay,aC,aB){var az="ev_ca="+SnowPlow.encodeWrapper(aA)+"&ev_ac="+SnowPlow.encodeWrapper(aD);if(String(ay).length){az+="&ev_la="+SnowPlow.encodeWrapper(ay)}if(String(aC).length){az+="&ev_pr="+SnowPlow.encodeWrapper(aC)}if(String(aB).length){az+="&ev_va="+SnowPlow.encodeWrapper(aB)}az=y(az,"event");C(az,O)}function W(aC,ay,aA,az){var aB="ad_ba="+SnowPlow.encodeWrapper(aC);if(String(ay).length){aB+="&ad_ca="+SnowPlow.encodeWrapper(ay)
}if(String(aA).length){aB+="&ad_ad="+SnowPlow.encodeWrapper(aA)}if(String(az).length){aB+="&ad_uid="+SnowPlow.encodeWrapper(az)}aB=y(aB,configCustomData,"adimp");C(aB,O)}function aa(aC,aB,aI,aD,ay,aG,az,aA){var aH=ah();aH.add("tr_id",aC);aH.add("tr_af",aB);aH.add("tr_tt",aI);aH.add("tr_tx",aD);aH.add("tr_sh",ay);aH.add("tr_ci",aG);aH.add("tr_st",az);aH.add("tr_co",aA);var aE=aH.build();var aF=y(aE,"ecommerceTransaction");C(aF,O)}function G(aA,aF,ay,az,aE,aC){var aG=ah();aG.add("ti_id",aA);aG.add("ti_sk",aF);aG.add("ti_na",ay);aG.add("ti_ca",az);aG.add("ti_pr",aE);aG.add("ti_qu",aC);var aB=aG.build();var aD=y(aB,"ecommerceTransactionItem");C(aD,O)}function J(aB){function aC(aE){if(!SnowPlow.isString(aE)){aE=aE.text||"";var aD=SnowPlow.documentAlias.getElementsByTagName("title");if(aD&&SnowPlow.isDefined(aD[0])){aE=aD[0].text}}return aE}var ay=new Date(),aA=y("page="+SnowPlow.encodeWrapper(aC(aB||x)),"log");C(aA,O);if(g&&t&&!V){V=true;addEventListener(SnowPlow.documentAlias,"click",ak);addEventListener(SnowPlow.documentAlias,"mouseup",ak);
addEventListener(SnowPlow.documentAlias,"mousedown",ak);addEventListener(SnowPlow.documentAlias,"mousemove",ak);addEventListener(SnowPlow.documentAlias,"mousewheel",ak);addEventListener(SnowPlow.windowAlias,"DOMMouseScroll",ak);addEventListener(SnowPlow.windowAlias,"scroll",ak);addEventListener(SnowPlow.documentAlias,"keypress",ak);addEventListener(SnowPlow.documentAlias,"keydown",ak);addEventListener(SnowPlow.documentAlias,"keyup",ak);addEventListener(SnowPlow.windowAlias,"resize",ak);addEventListener(SnowPlow.windowAlias,"focus",ak);addEventListener(SnowPlow.windowAlias,"blur",ak);S=ay.getTime();setTimeout(function az(){var aD=new Date(),aE;if((S+t)>aD.getTime()){if(g<aD.getTime()){aE=y("ping=1","ping");C(aE,O)}setTimeout(az,t)}},t)}}function aj(az,ay){var aA=y(ay+"="+SnowPlow.encodeWrapper(ap(az)),"link");C(aA,O)}function an(az,ay){if(az!==""){return az+ay.charAt(0).toUpperCase()+ay.slice(1)}return ay}function w(aD){var aC,ay,aB=["","webkit","ms","moz"],aA;if(!D){for(ay=0;ay<aB.length;
ay++){aA=aB[ay];if(Object.prototype.hasOwnProperty.call(SnowPlow.documentAlias,an(aA,"hidden"))){if(SnowPlow.documentAlias[an(aA,"visibilityState")]==="prerender"){aC=true}break}}}if(aC){addEventListener(SnowPlow.documentAlias,aA+"visibilitychange",function az(){SnowPlow.documentAlias.removeEventListener(aA+"visibilitychange",az,false);aD()});return}aD()}function u(aA,az){var aB,ay="(^| )(piwik[_-]"+az;if(aA){for(aB=0;aB<aA.length;aB++){ay+="|"+aA[aB]}}ay+=")( |$)";return new RegExp(ay)}function ai(aB,ay,aC){if(!aC){return"link"}var aA=u(K,"download"),az=u(r,"link"),aD=new RegExp("\\.("+z+")([?&#]|$)","i");return az.test(aB)?"link":(aA.test(aB)||aD.test(ay)?"download":0)}function ab(aD){var aB,az,ay;while((aB=aD.parentNode)!==null&&SnowPlow.isDefined(aB)&&((az=aD.tagName.toUpperCase())!=="A"&&az!=="AREA")){aD=aB}if(SnowPlow.isDefined(aD.href)){var aE=aD.hostname||getHostName(aD.href),aF=aE.toLowerCase(),aA=aD.href.replace(aE,aF),aC=new RegExp("^(javascript|vbscript|jscript|mocha|livescript|ecmascript|mailto):","i");
if(!aC.test(aA)){ay=ai(aD.className,aA,Q(aF));if(ay){aA=urldecode(aA);aj(aA,ay)}}}}function av(ay){var az,aA;ay=ay||SnowPlow.windowAlias.event;az=ay.which||ay.button;aA=ay.target||ay.srcElement;if(ay.type==="click"){if(aA){ab(aA)}}else{if(ay.type==="mousedown"){if((az===1||az===2)&&aA){L=az;m=aA}else{L=m=null}}else{if(ay.type==="mouseup"){if(az===L&&aA===m){ab(aA)}L=m=null}}}}function Z(az,ay){if(ay){addEventListener(az,"mouseup",av,false);addEventListener(az,"mousedown",av,false)}else{addEventListener(az,"click",av,false)}}function I(az){if(!Y){Y=true;var aA,ay=u(f,"ignore"),aB=SnowPlow.documentAlias.links;if(aB){for(aA=0;aA<aB.length;aA++){if(!ay.test(aB[aA].className)){Z(aB[aA],az)}}}}}function U(){var aB=[navigator.userAgent,[screen.height,screen.width,screen.colorDepth].join("x"),(new Date()).getTimezoneOffset(),!!window.sessionStorage,!!window.localStorage,];var ay=[];if(navigator.plugins){for(var aC=0;aC<navigator.plugins.length;aC++){var az=[];for(var aA=0;aA<navigator.plugins[aC].length;
aA++){az.push([navigator.plugins[aC][aA].type,navigator.plugins[aC][aA].suffixes])}ay.push([navigator.plugins[aC].name+"::"+navigator.plugins[aC].description,az.join("~")])}}return SnowPlow.murmurhash3_32_gc(aB.join("###")+"###"+ay.sort().join(";"),123412414)}function i(){var ay=jstz.determine();return(typeof(ay)==="undefined")?"":SnowPlow.encodeWrapper(ay.name())}function aq(){var ay,aA,aB={pdf:"application/pdf",qt:"video/quicktime",realp:"audio/x-pn-realaudio-plugin",wma:"application/x-mplayer2",dir:"application/x-director",fla:"application/x-shockwave-flash",java:"application/x-java-vm",gears:"application/x-googlegears",ag:"application/x-silverlight"},az={};if(SnowPlow.navigatorAlias.mimeTypes&&SnowPlow.navigatorAlias.mimeTypes.length){for(ay in aB){if(Object.prototype.hasOwnProperty.call(aB,ay)){aA=SnowPlow.navigatorAlias.mimeTypes[aB[ay]];az[ay]=(aA&&aA.enabledPlugin)?"1":"0"}}}if(typeof navigator.javaEnabled!=="unknown"&&SnowPlow.isDefined(SnowPlow.navigatorAlias.javaEnabled)&&SnowPlow.navigatorAlias.javaEnabled()){az.java="1"
}if(SnowPlow.isFunction(SnowPlow.windowAlias.GearsFactory)){az.gears="1"}az.res=SnowPlow.screenAlias.width+"x"+SnowPlow.screenAlias.height;az.cd=screen.colorDepth;az.cookie=c();return az}M();return{getVisitorId:function(){return(a())[1]},getVisitorInfo:function(){return a()},setSiteId:function(ay){al=ay},setLinkTrackingTimer:function(ay){O=ay},setDownloadExtensions:function(ay){z=ay},addDownloadExtensions:function(ay){z+="|"+ay},setDomains:function(ay){P=isString(ay)?[ay]:ay;P.push(ag)},setIgnoreClasses:function(ay){f=isString(ay)?[ay]:ay},setReferrerUrl:function(ay){T=ay},setCustomUrl:function(ay){F=af(au,ay)},setDocumentTitle:function(ay){x=ay},setDownloadClasses:function(ay){K=isString(ay)?[ay]:ay},setLinkClasses:function(ay){r=isString(ay)?[ay]:ay},discardHashTag:function(ay){h=ay},setCookieNamePrefix:function(ay){ar=ay},setCookieDomain:function(ay){l=domainFixup(ay);M()},setCookiePath:function(ay){at=ay;M()},setVisitorCookieTimeout:function(ay){p=ay*1000},setSessionCookieTimeout:function(ay){q=ay*1000
},setReferralCookieTimeout:function(ay){H=ay*1000},setDoNotTrack:function(az){var ay=SnowPlow.navigatorAlias.doNotTrack||SnowPlow.navigatorAlias.msDoNotTrack;ao=az&&(ay==="yes"||ay==="1")},addListener:function(az,ay){Z(az,ay)},enableLinkTracking:function(ay){if(SnowPlow.hasLoaded){I(ay)}else{SnowPlow.registeredOnLoadHandlers.push(function(){I(ay)})}},setHeartBeatTimer:function(aA,az){var ay=new Date();g=ay.getTime()+aA*1000;t=az*1000},killFrame:function(){if(SnowPlow.windowAlias.location!==SnowPlow.windowAlias.top.location){SnowPlow.windowAlias.top.location=SnowPlow.windowAlias.location}},redirectFile:function(ay){if(SnowPlow.windowAlias.location.protocol==="file:"){SnowPlow.windowAlias.location=ay}},setCountPreRendered:function(ay){D=ay},trackLink:function(az,ay){w(function(){aj(az,ay)})},trackPageView:function(ay){w(function(){J(ay)})},setAccount:function(ay){if(typeof console!=="undefined"){console.log("SnowPlow: setAccount() is deprecated and will be removed in an upcoming version. Please use setCollectorCf() instead.")
}d=B(ay)},setCollectorCf:function(ay){d=B(ay)},setCollectorUrl:function(ay){d=ae(ay)},trackEvent:function(az,aC,ay,aB,aA){j(az,aC,ay,aB,aA)},trackImpression:function(aB,ay,aA,az){W(aB,ay,aA,az)},addTrans:function(ay,aB,aC,aA,az,aF,aD,aE){e.transaction={orderId:ay,affiliation:aB,total:aC,tax:aA,shipping:az,city:aF,state:aD,country:aE}},addItem:function(ay,aD,az,aB,aA,aC){e.items.push({orderId:ay,sku:aD,name:az,category:aB,price:aA,quantity:aC})},trackTrans:function(){aa(e.transaction.orderId,e.transaction.affiliation,e.transaction.total,e.transaction.tax,e.transaction.shipping,e.transaction.city,e.transaction.state,e.transaction.country);e.items.forEach(function(ay){G(ay.orderId,ay.sku,ay.name,ay.category,ay.price,ay.quantity)});e=ad()}}};SnowPlow.build=function(){function b(){var g,j,h;for(g=0;g<arguments.length;g+=1){h=arguments[g];j=h.shift();if(SnowPlow.isString(j)){SnowPlow.asyncTracker[j].apply(SnowPlow.asyncTracker,h)}else{j.apply(SnowPlow.asyncTracker,h)}}}function f(){var g;SnowPlow.executePluginMethod("unload");
if(SnowPlow.expireDateTime){do{g=new Date()}while(g.getTimeAlias()<SnowPlow.expireDateTime)}}function d(){var g;if(!SnowPlow.hasLoaded){SnowPlow.hasLoaded=true;SnowPlow.executePluginMethod("load");for(g=0;g<SnowPlow.registeredOnLoadHandlers.length;g++){SnowPlow.registeredOnLoadHandlers[g]()}}return true}function e(){var h;if(SnowPlow.documentAlias.addEventListener){SnowPlow.addEventListener(SnowPlow.documentAlias,"DOMContentLoaded",function g(){SnowPlow.documentAlias.removeEventListener("DOMContentLoaded",g,false);d()})}else{if(SnowPlow.documentAlias.attachEvent){SnowPlow.documentAlias.attachEvent("onreadystatechange",function g(){if(SnowPlow.documentAlias.readyState==="complete"){SnowPlow.documentAlias.detachEvent("onreadystatechange",g);d()}});if(SnowPlow.documentAlias.documentElement.doScroll&&SnowPlow.windowAlias===SnowPlow.windowAlias.top){(function g(){if(!SnowPlow.hasLoaded){try{SnowPlow.documentAlias.documentElement.doScroll("left")}catch(i){setTimeout(g,0);return}d()}}())}}}if((new RegExp("WebKit")).test(SnowPlow.navigatorAlias.userAgent)){h=setInterval(function(){if(SnowPlow.hasLoaded||/loaded|complete/.test(SnowPlow.documentAlias.readyState)){clearInterval(h);
d()}},10)}SnowPlow.addEventListener(SnowPlow.windowAlias,"load",d,false)}function a(){return{push:b}}SnowPlow.addEventListener(SnowPlow.windowAlias,"beforeunload",f,false);e();Date.prototype.getTimeAlias=Date.prototype.getTime;SnowPlow.asyncTracker=new SnowPlow.Tracker();for(var c=0;c<_snaq.length;c++){b(_snaq[c])}_snaq=new a();return{addPlugin:function(g,h){SnowPlow.plugins[g]=h},getTracker:function(g){return new SnowPlow.Tracker(g)},getAsyncTracker:function(){return SnowPlow.asyncTracker}}};(function(){var a=SnowPlow.build();for(prop in a){if(a.hasOwnProperty(prop)){if(SnowPlow[prop]===undefined){SnowPlow[prop]=a[prop]}}}}());