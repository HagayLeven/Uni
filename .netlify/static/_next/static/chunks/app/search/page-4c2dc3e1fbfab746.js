(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[797],{3974:function(e,t,n){Promise.resolve().then(n.bind(n,1956))},1956:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return d}});var i=n(7437),r=n(2265),c=n(6881),a=n(3523),l=n(9732),s=n(2339),u=n(4817),o=n(3274);function d(){let[e,t]=(0,r.useState)(""),[n,d]=(0,r.useState)([]),[y,h]=(0,r.useState)(!1),[p,f]=(0,r.useState)(!1),k=async t=>{if(t.preventDefault(),!e.trim())return;h(!0),f(!0);let{data:n}=await c.O.from("posts").select("id, content, type, upvotes, downvotes, sensitivity, created_at, profiles(full_name, avatar_url), topics(title)").ilike("content","%".concat(e,"%")).order("created_at",{ascending:!1}).limit(20);d((null!=n?n:[]).map(e=>{var t,n,i,r,c,a,l,s,u,o,d,y,h,p,f;let k=(null!==(r=e.content)&&void 0!==r?r:"").split("\n").filter(Boolean);return{id:e.id,type:null!==(c=e.type)&&void 0!==c?c:"summary",title:null!==(a=k[0])&&void 0!==a?a:"",body:null!==(l=k.slice(1).join("\n").trim()||k[0])&&void 0!==l?l:"",author:{name:null!==(s=null===(t=e.profiles)||void 0===t?void 0:t.full_name)&&void 0!==s?s:"משתמש",avatar:null!==(u=null===(n=e.profiles)||void 0===n?void 0:n.avatar_url)&&void 0!==u?u:null},course:null!==(o=null===(i=e.topics)||void 0===i?void 0:i.title)&&void 0!==o?o:"כללי",upvotes:null!==(d=e.upvotes)&&void 0!==d?d:0,downvotes:null!==(y=e.downvotes)&&void 0!==y?y:0,score:(null!==(h=e.upvotes)&&void 0!==h?h:0)-(null!==(p=e.downvotes)&&void 0!==p?p:0),comments:0,sensitivity:null!==(f=e.sensitivity)&&void 0!==f?f:"safe",userVote:null,timeAgo:function(e){let t=Math.floor((Date.now()-new Date(e).getTime())/6e4);if(t<1)return"עכשיו";if(t<60)return"לפני ".concat(t," דקות");let n=Math.floor(t/60);return n<24?"לפני ".concat(n," שעות"):"לפני ".concat(Math.floor(n/24)," ימים")}(e.created_at),files:[]}})),h(!1)};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)("div",{className:"flex bg-gray-950",style:{height:"100dvh"},dir:"rtl",children:[(0,i.jsx)("div",{className:"hidden md:flex shrink-0",children:(0,i.jsx)(a.Y,{})}),(0,i.jsx)("main",{className:"flex-1 overflow-y-auto pb-28 md:pb-6",children:(0,i.jsxs)("div",{className:"max-w-2xl mx-auto px-4 py-6 space-y-4",children:[(0,i.jsxs)("form",{onSubmit:k,className:"flex gap-2",children:[(0,i.jsxs)("div",{className:"relative flex-1",children:[(0,i.jsx)(u.Z,{size:15,className:"absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none"}),(0,i.jsx)("input",{value:e,onChange:e=>t(e.target.value),placeholder:"חפש פוסטים, סיכומים, שאלות...",autoFocus:!0,className:"w-full h-11 bg-gray-800 border border-gray-700 rounded-xl pe-10 ps-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"})]}),(0,i.jsx)("button",{type:"submit",disabled:y,className:"h-11 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm",children:"חפש"})]}),y&&(0,i.jsx)("div",{className:"flex justify-center py-12",children:(0,i.jsx)(o.Z,{size:24,className:"animate-spin text-indigo-500"})}),!y&&p&&0===n.length&&(0,i.jsxs)("p",{className:"text-center text-gray-600 py-12",children:['לא נמצאו תוצאות עבור "',e,'"']}),!y&&n.map(e=>(0,i.jsx)(s.y,{post:e},e.id))]})})]}),(0,i.jsx)(l.L,{})]})}},2468:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},2421:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]])},4392:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("ChevronUp",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]])},3550:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("Ellipsis",[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"19",cy:"12",r:"1",key:"1wjl8i"}],["circle",{cx:"5",cy:"12",r:"1",key:"1pcz8c"}]])},7019:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("EyeOff",[["path",{d:"M9.88 9.88a3 3 0 1 0 4.24 4.24",key:"1jxqfv"}],["path",{d:"M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68",key:"9wicm4"}],["path",{d:"M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61",key:"1jreej"}],["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}]])},5733:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("Eye",[["path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",key:"rwhkz3"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]])},2023:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]])},2177:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("Gamepad2",[["line",{x1:"6",x2:"10",y1:"11",y2:"11",key:"1gktln"}],["line",{x1:"8",x2:"8",y1:"9",y2:"13",key:"qnk9ow"}],["line",{x1:"15",x2:"15.01",y1:"12",y2:"12",key:"krot7o"}],["line",{x1:"18",x2:"18.01",y1:"10",y2:"10",key:"1lcuu1"}],["path",{d:"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z",key:"mfqc10"}]])},1005:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("Home",[["path",{d:"m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"y5dka4"}],["polyline",{points:"9 22 9 12 15 12 15 22",key:"e2us08"}]])},8604:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("Image",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]])},3274:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]])},7390:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]])},8422:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("Pencil",[["path",{d:"M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z",key:"5qss01"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]])},2513:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]])},9348:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("Rss",[["path",{d:"M4 11a9 9 0 0 1 9 9",key:"pv89mb"}],["path",{d:"M4 4a16 16 0 0 1 16 16",key:"k0647b"}],["circle",{cx:"5",cy:"19",r:"1",key:"bfqh0e"}]])},4817:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]])},1510:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("Share2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]])},4341:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("ShieldAlert",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]])},500:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]])},3907:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]])},883:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]])},5016:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("Trophy",[["path",{d:"M6 9H4.5a2.5 2.5 0 0 1 0-5H6",key:"17hqa7"}],["path",{d:"M18 9h1.5a2.5 2.5 0 0 0 0-5H18",key:"lmptdp"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22",key:"1nw9bq"}],["path",{d:"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22",key:"1np0yb"}],["path",{d:"M18 2H6v7a6 6 0 0 0 12 0V2Z",key:"u46fv3"}]])},8184:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]])},2022:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]])},4697:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(8030).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])}},function(e){e.O(0,[93,141,502,372,241,339,971,23,744],function(){return e(e.s=3974)}),_N_E=e.O()}]);