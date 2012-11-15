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
g=(((g&65535)*c)+((((g>>>16)*c)&65535)<<16))&4294967295;h^=g}h^=k.length;h^=h>>>16;h=(((h&65535)*2246822507)+((((h>>>16)*2246822507)&65535)<<16))&4294967295;h^=h>>>13;h=((((h&65535)*3266489909)+((((h>>>16)*3266489909)&65535)<<16)))&4294967295;h^=h>>>16;return h>>>0};SnowPlow.Tracker=function Tracker(H){var b=SnowPlow.urlFixup(SnowPlow.documentAlias.domain,SnowPlow.windowAlias.location.href,SnowPlow.getReferrer()),ah=SnowPlow.domainFixup(b[0]),av=b[1],U=b[2],S="GET",d=L(H),am="",E,w=SnowPlow.documentAlias.title,y="7z|aac|ar[cj]|as[fx]|avi|bin|csv|deb|dmg|doc|exe|flv|gif|gz|gzip|hqx|jar|jpe?g|js|mp(2|3|4|e?g)|mov(ie)?|ms[ip]|od[bfgpst]|og[gv]|pdf|phps|png|ppt|qtm?|ra[mr]?|rpm|sea|sit|tar|t?bz2?|tgz|torrent|txt|wav|wm[av]|wpd||xls|xml|z|zip",Q=[ah],f=[],K=[],r=[],P=500,g,t,h,at="_sp_",l,au,ap,C,p=63072000000,q=1800000,G=15768000000,n=SnowPlow.documentAlias.location.protocol==="https",o=SnowPlow.navigatorAlias.userLanguage||SnowPlow.navigatorAlias.language,an=ar(),O=i(),s=V(),Z=false,W=false,T,M,m,z=SnowPlow.sha1,Y,D,e=ae();
function L(az){if(typeof az==="undefined"){return null}else{if("cf" in az){return A(az.cf)}else{if("url" in az){return af(az.url)}}}}function ae(){return{transaction:{},items:[]}}function aq(az){var aA;if(h){aA=new RegExp("#.*");return az.replace(aA,"")}return az}function ax(az){var aB=new RegExp("^([a-z]+):"),aA=aB.exec(az);return aA?aA[1]:null}function ag(aB,az){var aC=ax(az),aA;if(aC){return az}if(az.slice(0,1)==="/"){return ax(aB)+"://"+getHostName(aB)+az}aB=aq(aB);if((aA=aB.indexOf("?"))>=0){aB=aB.slice(0,aA)}if((aA=aB.lastIndexOf("/"))!==aB.length-1){aB=aB.slice(0,aA+1)}return aB+az}function R(aC){var aA,az,aB;for(aA=0;aA<Q.length;aA++){az=domainFixup(Q[aA].toLowerCase());if(aC===az){return true}if(az.slice(0,1)==="."){if(aC===az.slice(1)){return true}aB=aC.length-az.length;if((aB>0)&&(aC.slice(aB)===az)){return true}}}return false}function ay(az){var aA=new Image(1,1);if(d===null){throw"No SnowPlow collector configured, cannot track"}else{console.log(d)}aA.onload=function(){};aA.src=d+"?"+az
}function B(aB,aA){var az=new Date();if(!ap){ay(aB);SnowPlow.expireDateTime=az.getTime()+aA}}function ad(az){return at+az+"."+am+"."+Y}function c(){var az=ad("testcookie");if(!SnowPlow.isDefined(SnowPlow.navigatorAlias.cookieEnabled)){SnowPlow.setCookie(az,"1");return SnowPlow.getCookie(az)==="1"?"1":"0"}return SnowPlow.navigatorAlias.cookieEnabled?"1":"0"}function N(){Y=z((l||ah)+(au||"/")).slice(0,4)}function al(){var az=new Date();T=az.getTime()}function k(aD,aA,az,aC,aB){SnowPlow.setCookie(ad("id"),aD+"."+aA+"."+az+"."+aC+"."+aB,p,au,l,n)}function a(){var aA=new Date(),az=Math.round(aA.getTime()/1000),aC=SnowPlow.getCookie(ad("id")),aB;if(aC){aB=aC.split(".");aB.unshift("0")}else{if(!D){D=z((SnowPlow.navigatorAlias.userAgent||"")+(SnowPlow.navigatorAlias.platform||"")+JSON2.stringify(an)+az).slice(0,16)}aB=["1",D,az,0,az,""]}return aB}function x(aA,aR){var aP,az=new Date(),aF=Math.round(az.getTime()/1000),aT,aQ,aC,aL,aN,aE,aD,aO,aB=1024,aU,aH,aK=ad("id"),aG=ad("ses"),aM=a(),aJ=SnowPlow.getCookie(aG),aS=E||av,aI;
if(ap){SnowPlow.setCookie(aK,"",-1,au,l);SnowPlow.setCookie(aG,"",-1,au,l);return""}aT=aM[0];aQ=aM[1];aL=aM[2];aC=aM[3];aN=aM[4];aE=aM[5];if(!aJ){aC++;aE=aN}aA+="&p=Web&tid="+String(Math.random()).slice(2,8)+"&uid="+aQ+"&fp="+s+"&vid="+aC+"&tv="+SnowPlow.encodeWrapper(SnowPlow.version)+(am.length?"&aid="+SnowPlow.encodeWrapper(am):"")+"&lang="+o+(U.length?"&refr="+SnowPlow.encodeWrapper(aq(U)):"");for(aP in an){if(Object.prototype.hasOwnProperty.call(an,aP)){aI=(aP==="res"||aP==="cd"||aP==="cookie")?"&":"&f_";aA+=aI+aP+"="+an[aP]}}aA+="&tz="+O;aA+="&url="+SnowPlow.encodeWrapper(aq(window.location));k(aQ,aL,aC,aF,aE);SnowPlow.setCookie(aG,"*",q,au,l,n);aA+=SnowPlow.executePluginMethod(aR);return aA}function A(az){return af(az+".cloudfront.net")}function af(az){return("https:"==document.location.protocol?"https":"http")+"://"+az+"/i"}function ai(az){var aA=az||"";return{add:function(aB,aC){if(aC!==undefined&&aC!==""){aA+="&"+aB+"="+SnowPlow.encodeWrapper(aC)}},build:function(){return aA}}
}function j(aB,aE,az,aD,aC){var aA="ev_ca="+SnowPlow.encodeWrapper(aB)+"&ev_ac="+SnowPlow.encodeWrapper(aE);if(String(az).length){aA+="&ev_la="+SnowPlow.encodeWrapper(az)}if(String(aD).length){aA+="&ev_pr="+SnowPlow.encodeWrapper(aD)}if(String(aC).length){aA+="&ev_va="+SnowPlow.encodeWrapper(aC)}aA=x(aA,"event");B(aA,P)}function X(aD,az,aB,aA){var aC="ad_ba="+SnowPlow.encodeWrapper(aD);if(String(az).length){aC+="&ad_ca="+SnowPlow.encodeWrapper(az)}if(String(aB).length){aC+="&ad_ad="+SnowPlow.encodeWrapper(aB)}if(String(aA).length){aC+="&ad_uid="+SnowPlow.encodeWrapper(aA)}aC=x(aC,configCustomData,"adimp");B(aC,P)}function ab(aD,aC,aJ,aE,az,aH,aA,aB){var aI=ai();aI.add("tr_id",aD);aI.add("tr_af",aC);aI.add("tr_tt",aJ);aI.add("tr_tx",aE);aI.add("tr_sh",az);aI.add("tr_ci",aH);aI.add("tr_st",aA);aI.add("tr_co",aB);var aF=aI.build();var aG=x(aF,"ecommerceTransaction");B(aG,P)}function F(aB,aG,az,aA,aF,aD){var aH=ai();aH.add("ti_id",aB);aH.add("ti_sk",aG);aH.add("ti_na",az);aH.add("ti_ca",aA);
aH.add("ti_pr",aF);aH.add("ti_qu",aD);var aC=aH.build();var aE=x(aC,"ecommerceTransactionItem");B(aE,P)}function J(aC){function aD(aF){if(!SnowPlow.isString(aF)){aF=aF.text||"";var aE=SnowPlow.documentAlias.getElementsByTagName("title");if(aE&&SnowPlow.isDefined(aE[0])){aF=aE[0].text}}return aF}var az=new Date(),aB=x("page="+SnowPlow.encodeWrapper(aD(aC||w)),"log");B(aB,P);if(g&&t&&!W){W=true;addEventListener(SnowPlow.documentAlias,"click",al);addEventListener(SnowPlow.documentAlias,"mouseup",al);addEventListener(SnowPlow.documentAlias,"mousedown",al);addEventListener(SnowPlow.documentAlias,"mousemove",al);addEventListener(SnowPlow.documentAlias,"mousewheel",al);addEventListener(SnowPlow.windowAlias,"DOMMouseScroll",al);addEventListener(SnowPlow.windowAlias,"scroll",al);addEventListener(SnowPlow.documentAlias,"keypress",al);addEventListener(SnowPlow.documentAlias,"keydown",al);addEventListener(SnowPlow.documentAlias,"keyup",al);addEventListener(SnowPlow.windowAlias,"resize",al);addEventListener(SnowPlow.windowAlias,"focus",al);
addEventListener(SnowPlow.windowAlias,"blur",al);T=az.getTime();setTimeout(function aA(){var aE=new Date(),aF;if((T+t)>aE.getTime()){if(g<aE.getTime()){aF=x("ping=1","ping");B(aF,P)}setTimeout(aA,t)}},t)}}function ak(aA,az){var aB=x(az+"="+SnowPlow.encodeWrapper(aq(aA)),"link");B(aB,P)}function ao(aA,az){if(aA!==""){return aA+az.charAt(0).toUpperCase()+az.slice(1)}return az}function v(aE){var aD,az,aC=["","webkit","ms","moz"],aB;if(!C){for(az=0;az<aC.length;az++){aB=aC[az];if(Object.prototype.hasOwnProperty.call(SnowPlow.documentAlias,ao(aB,"hidden"))){if(SnowPlow.documentAlias[ao(aB,"visibilityState")]==="prerender"){aD=true}break}}}if(aD){addEventListener(SnowPlow.documentAlias,aB+"visibilitychange",function aA(){SnowPlow.documentAlias.removeEventListener(aB+"visibilitychange",aA,false);aE()});return}aE()}function u(aB,aA){var aC,az="(^| )(piwik[_-]"+aA;if(aB){for(aC=0;aC<aB.length;aC++){az+="|"+aB[aC]}}az+=")( |$)";return new RegExp(az)}function aj(aC,az,aD){if(!aD){return"link"}var aB=u(K,"download"),aA=u(r,"link"),aE=new RegExp("\\.("+y+")([?&#]|$)","i");
return aA.test(aC)?"link":(aB.test(aC)||aE.test(az)?"download":0)}function ac(aE){var aC,aA,az;while((aC=aE.parentNode)!==null&&SnowPlow.isDefined(aC)&&((aA=aE.tagName.toUpperCase())!=="A"&&aA!=="AREA")){aE=aC}if(SnowPlow.isDefined(aE.href)){var aF=aE.hostname||getHostName(aE.href),aG=aF.toLowerCase(),aB=aE.href.replace(aF,aG),aD=new RegExp("^(javascript|vbscript|jscript|mocha|livescript|ecmascript|mailto):","i");if(!aD.test(aB)){az=aj(aE.className,aB,R(aG));if(az){aB=urldecode(aB);ak(aB,az)}}}}function aw(az){var aA,aB;az=az||SnowPlow.windowAlias.event;aA=az.which||az.button;aB=az.target||az.srcElement;if(az.type==="click"){if(aB){ac(aB)}}else{if(az.type==="mousedown"){if((aA===1||aA===2)&&aB){M=aA;m=aB}else{M=m=null}}else{if(az.type==="mouseup"){if(aA===M&&aB===m){ac(aB)}M=m=null}}}}function aa(aA,az){if(az){addEventListener(aA,"mouseup",aw,false);addEventListener(aA,"mousedown",aw,false)}else{addEventListener(aA,"click",aw,false)}}function I(aA){if(!Z){Z=true;var aB,az=u(f,"ignore"),aC=SnowPlow.documentAlias.links;
if(aC){for(aB=0;aB<aC.length;aB++){if(!az.test(aC[aB].className)){aa(aC[aB],aA)}}}}}function V(){var aC=[navigator.userAgent,[screen.height,screen.width,screen.colorDepth].join("x"),(new Date()).getTimezoneOffset(),!!window.sessionStorage,!!window.localStorage,];var az=[];if(navigator.plugins){for(var aD=0;aD<navigator.plugins.length;aD++){var aA=[];for(var aB=0;aB<navigator.plugins[aD].length;aB++){aA.push([navigator.plugins[aD][aB].type,navigator.plugins[aD][aB].suffixes])}az.push([navigator.plugins[aD].name+"::"+navigator.plugins[aD].description,aA.join("~")])}}return SnowPlow.murmurhash3_32_gc(aC.join("###")+"###"+az.sort().join(";"),123412414)}function i(){var az=jstz.determine();return(typeof(az)==="undefined")?"":SnowPlow.encodeWrapper(az.name())}function ar(){var az,aB,aC={pdf:"application/pdf",qt:"video/quicktime",realp:"audio/x-pn-realaudio-plugin",wma:"application/x-mplayer2",dir:"application/x-director",fla:"application/x-shockwave-flash",java:"application/x-java-vm",gears:"application/x-googlegears",ag:"application/x-silverlight"},aA={};
if(SnowPlow.navigatorAlias.mimeTypes&&SnowPlow.navigatorAlias.mimeTypes.length){for(az in aC){if(Object.prototype.hasOwnProperty.call(aC,az)){aB=SnowPlow.navigatorAlias.mimeTypes[aC[az]];aA[az]=(aB&&aB.enabledPlugin)?"1":"0"}}}if(typeof navigator.javaEnabled!=="unknown"&&SnowPlow.isDefined(SnowPlow.navigatorAlias.javaEnabled)&&SnowPlow.navigatorAlias.javaEnabled()){aA.java="1"}if(SnowPlow.isFunction(SnowPlow.windowAlias.GearsFactory)){aA.gears="1"}aA.res=SnowPlow.screenAlias.width+"x"+SnowPlow.screenAlias.height;aA.cd=screen.colorDepth;aA.cookie=c();return aA}N();return{getVisitorId:function(){return(a())[1]},getVisitorInfo:function(){return a()},setSiteId:function(az){am=az},setLinkTrackingTimer:function(az){P=az},setDownloadExtensions:function(az){y=az},addDownloadExtensions:function(az){y+="|"+az},setDomains:function(az){Q=isString(az)?[az]:az;Q.push(ah)},setIgnoreClasses:function(az){f=isString(az)?[az]:az},setReferrerUrl:function(az){U=az},setCustomUrl:function(az){E=ag(av,az)},setDocumentTitle:function(az){w=az
},setDownloadClasses:function(az){K=isString(az)?[az]:az},setLinkClasses:function(az){r=isString(az)?[az]:az},discardHashTag:function(az){h=az},setCookieNamePrefix:function(az){at=az},setCookieDomain:function(az){l=domainFixup(az);N()},setCookiePath:function(az){au=az;N()},setVisitorCookieTimeout:function(az){p=az*1000},setSessionCookieTimeout:function(az){q=az*1000},setReferralCookieTimeout:function(az){G=az*1000},setDoNotTrack:function(aA){var az=SnowPlow.navigatorAlias.doNotTrack||SnowPlow.navigatorAlias.msDoNotTrack;ap=aA&&(az==="yes"||az==="1")},addListener:function(aA,az){aa(aA,az)},enableLinkTracking:function(az){if(SnowPlow.hasLoaded){I(az)}else{SnowPlow.registeredOnLoadHandlers.push(function(){I(az)})}},setHeartBeatTimer:function(aB,aA){var az=new Date();g=az.getTime()+aB*1000;t=aA*1000},killFrame:function(){if(SnowPlow.windowAlias.location!==SnowPlow.windowAlias.top.location){SnowPlow.windowAlias.top.location=SnowPlow.windowAlias.location}},redirectFile:function(az){if(SnowPlow.windowAlias.location.protocol==="file:"){SnowPlow.windowAlias.location=az
}},setCountPreRendered:function(az){C=az},trackLink:function(aA,az){v(function(){ak(aA,az)})},trackPageView:function(az){v(function(){J(az)})},setAccount:function(az){if(typeof console!=="undefined"){console.log("SnowPlow: setAccount() is deprecated and will be removed in an upcoming version. Please use setCollectorCf() instead.")}d=A(az)},setCollectorCf:function(az){d=A(az)},setCollectorUrl:function(az){d=af(az)},trackEvent:function(aA,aD,az,aC,aB){j(aA,aD,az,aC,aB)},trackImpression:function(aC,az,aB,aA){X(aC,az,aB,aA)},addTrans:function(az,aC,aD,aB,aA,aG,aE,aF){e.transaction={orderId:az,affiliation:aC,total:aD,tax:aB,shipping:aA,city:aG,state:aE,country:aF}},addItem:function(az,aE,aA,aC,aB,aD){e.items.push({orderId:az,sku:aE,name:aA,category:aC,price:aB,quantity:aD})},trackTrans:function(){ab(e.transaction.orderId,e.transaction.affiliation,e.transaction.total,e.transaction.tax,e.transaction.shipping,e.transaction.city,e.transaction.state,e.transaction.country);e.items.forEach(function(az){F(az.orderId,az.sku,az.name,az.category,az.price,az.quantity)
});e=ae()}}};SnowPlow.build=function(){function b(){var g,j,h;for(g=0;g<arguments.length;g+=1){h=arguments[g];j=h.shift();if(SnowPlow.isString(j)){SnowPlow.asyncTracker[j].apply(SnowPlow.asyncTracker,h)}else{j.apply(SnowPlow.asyncTracker,h)}}}function f(){var g;SnowPlow.executePluginMethod("unload");if(SnowPlow.expireDateTime){do{g=new Date()}while(g.getTimeAlias()<SnowPlow.expireDateTime)}}function d(){var g;if(!SnowPlow.hasLoaded){SnowPlow.hasLoaded=true;SnowPlow.executePluginMethod("load");for(g=0;g<SnowPlow.registeredOnLoadHandlers.length;g++){SnowPlow.registeredOnLoadHandlers[g]()}}return true}function e(){var h;if(SnowPlow.documentAlias.addEventListener){SnowPlow.addEventListener(SnowPlow.documentAlias,"DOMContentLoaded",function g(){SnowPlow.documentAlias.removeEventListener("DOMContentLoaded",g,false);d()})}else{if(SnowPlow.documentAlias.attachEvent){SnowPlow.documentAlias.attachEvent("onreadystatechange",function g(){if(SnowPlow.documentAlias.readyState==="complete"){SnowPlow.documentAlias.detachEvent("onreadystatechange",g);
d()}});if(SnowPlow.documentAlias.documentElement.doScroll&&SnowPlow.windowAlias===SnowPlow.windowAlias.top){(function g(){if(!SnowPlow.hasLoaded){try{SnowPlow.documentAlias.documentElement.doScroll("left")}catch(i){setTimeout(g,0);return}d()}}())}}}if((new RegExp("WebKit")).test(SnowPlow.navigatorAlias.userAgent)){h=setInterval(function(){if(SnowPlow.hasLoaded||/loaded|complete/.test(SnowPlow.documentAlias.readyState)){clearInterval(h);d()}},10)}SnowPlow.addEventListener(SnowPlow.windowAlias,"load",d,false)}function a(){return{push:b}}SnowPlow.addEventListener(SnowPlow.windowAlias,"beforeunload",f,false);e();Date.prototype.getTimeAlias=Date.prototype.getTime;SnowPlow.asyncTracker=new SnowPlow.Tracker();for(var c=0;c<_snaq.length;c++){b(_snaq[c])}_snaq=new a();return{addPlugin:function(g,h){SnowPlow.plugins[g]=h},getTracker:function(g){if(typeof console!=="undefined"){console.log("SnowPlow: getTracker() is deprecated and will be removed in an upcoming version. Please use getTrackerCf() instead.")
}return new SnowPlow.Tracker({cf:g})},getTrackerCf:function(g){return new SnowPlow.Tracker({cf:g})},getTrackerUrl:function(g){return new SnowPlow.Tracker({url:g})},getAsyncTracker:function(){return SnowPlow.asyncTracker}}};(function(){var a=SnowPlow.build();for(prop in a){if(a.hasOwnProperty(prop)){if(SnowPlow[prop]===undefined){SnowPlow[prop]=a[prop]}}}}());