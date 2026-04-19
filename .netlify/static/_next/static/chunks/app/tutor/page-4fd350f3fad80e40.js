(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[383],{2360:function(e,t,n){Promise.resolve().then(n.bind(n,7859))},7859:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return p}});var a=n(7437),s=n(2265),r=n(3523),i=n(9732),l=n(3274),o=n(994),c=n(7440),d=n(2980);function u(e){let t=e.toLowerCase();return/✅|כל הכבוד|מצוין|נכון|perfect|bravo|יפה|נהדר/.test(e)?"joyful":/😅|אופס|שגיאה|לא הצלחתי|נסה שוב/.test(e)?"compassion":/📝|שאלה|בחירה|a\)|b\)|c\)|d\)/.test(t)?"focused":/שלום|היי|מה תרצה|ללמוד היום/.test(e)?"core":"calm"}function h(e){let{onClose:t}=e,n=["היי! שאל אותי כל שאלה לימודית \uD83D\uDCDA","אני כאן אם צריך עזרה! \uD83E\uDD13","שאלה טובה שווה יותר מתשובה! \uD83D\uDCA1","בוא נלמד ביחד! ✨"],s=n[Math.floor(Math.random()*n.length)];return(0,a.jsxs)("div",{className:"fixed bottom-24 end-4 z-50 flex items-end gap-2 animate-in slide-in-from-bottom-4 duration-300",dir:"rtl",children:[(0,a.jsxs)("div",{className:"bg-gray-900 border border-indigo-500/40 rounded-2xl rounded-br-sm px-4 py-3 shadow-xl max-w-[200px]",children:[(0,a.jsx)("p",{className:"text-sm text-gray-100",children:s}),(0,a.jsx)("button",{onClick:t,className:"text-[10px] text-gray-500 mt-1 hover:text-gray-300",children:"סגור"})]}),(0,a.jsx)(d.i,{pose:"joyful",size:44,animate:!0})]})}let m=["בוא נלמד על הלם והסוגים שלו","הסבר לי ABCDE assessment","מה פרוטוקול ACS וכאב חזה?","שאל אותי שאלות על CPR","תרופות חירום — אפינפרין, ניטרו, אספירין","טראומה — MARCH ועצירת דימום"];function p(){let[e,t]=(0,s.useState)([]),[n,p]=(0,s.useState)(""),[x,f]=(0,s.useState)(!1),[y,g]=(0,s.useState)(!1),[b,k]=(0,s.useState)(!1),[v,j]=(0,s.useState)("core"),w=(0,s.useRef)(null),D=(0,s.useRef)(null);(0,s.useEffect)(()=>{b||(k(!0),N("שלום! אני מתחיל עכשיו — מה תרצה ללמוד היום?",!0))},[]),(0,s.useEffect)(()=>{let e=setTimeout(()=>{x||g(!0)},45e3+45e3*Math.random());return()=>clearTimeout(e)},[e,x]),(0,s.useEffect)(()=>{var e;null===(e=w.current)||void 0===e||e.scrollIntoView({behavior:"smooth"})},[e]),(0,s.useEffect)(()=>{let t=[...e].reverse().find(e=>"assistant"===e.role);(null==t?void 0:t.content)&&j(u(t.content))},[e]);let N=async function(n){var a,s,r;let i=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(!n.trim()||x)return;p(""),g(!1);let l={id:crypto.randomUUID(),role:"user",content:n},o=i?[l]:[...e,l];i||t(e=>[...e,l]),f(!0);let c=crypto.randomUUID();t(e=>[...e,{id:c,role:"assistant",content:""}]);try{let e=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:i?[l]:o})});if(!e.ok){let t=await e.json().catch(()=>({}));throw Error(null!==(s=t.error)&&void 0!==s?s:"שגיאת שרת ".concat(e.status))}if(!e.body)throw Error("תגובה ריקה מהשרת");let n=e.body.getReader(),a=new TextDecoder,r="";for(;;){let{done:e,value:s}=await n.read();if(e)break;r+=a.decode(s,{stream:!0}),t(e=>e.map(e=>e.id===c?{...e,content:r}:e))}}catch(n){let e=null!==(r=null==n?void 0:n.message)&&void 0!==r?r:"שגיאה לא ידועה";t(t=>t.map(t=>t.id===c?{...t,content:"⚠️ ".concat(e,"\n\nאם הבעיה נמשכת — ודא שמפתח ה-API תקין ב-.env.local")}:t))}f(!1),null===(a=D.current)||void 0===a||a.focus()};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsxs)("div",{className:"flex bg-gray-950",style:{height:"100dvh"},dir:"rtl",children:[(0,a.jsx)("div",{className:"hidden md:flex shrink-0",children:(0,a.jsx)(r.Y,{})}),(0,a.jsxs)("main",{className:"flex-1 flex flex-col min-w-0 overflow-hidden",children:[(0,a.jsxs)("div",{className:"flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-950/80 backdrop-blur shrink-0",children:[(0,a.jsx)(d.i,{pose:x?"focused":v,size:38,animate:x}),(0,a.jsxs)("div",{children:[(0,a.jsx)("h1",{className:"text-base font-bold text-white",children:"Uni"}),(0,a.jsx)("p",{className:"text-xs text-indigo-400",children:"עוזרת לימודית \xb7 מבוסס Gemini"})]}),(0,a.jsxs)("div",{className:"ms-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20",children:[(0,a.jsx)("span",{className:"w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"}),(0,a.jsx)("span",{className:"text-xs text-green-400 font-medium",children:"מחוברת"})]})]}),(0,a.jsxs)("div",{className:"flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-4",children:[0===e.length&&(0,a.jsxs)("div",{className:"flex flex-col items-center gap-6 pt-8",children:[(0,a.jsx)(d.i,{pose:"core",size:80,animate:!0}),(0,a.jsxs)("div",{className:"text-center",children:[(0,a.jsx)("h2",{className:"text-xl font-bold text-white",children:"היי! אני Uni \uD83E\uDD89"}),(0,a.jsx)("p",{className:"text-sm text-gray-400 mt-1 max-w-xs",children:"שאל אותי כל שאלה — פרוטוקולים, תרופות, הגדרות, או סתם שוחח איתי"})]}),(0,a.jsx)("div",{className:"grid grid-cols-1 gap-2 w-full max-w-sm",children:m.map(e=>(0,a.jsx)("button",{onClick:()=>N(e),className:"text-start px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm text-gray-300 transition-colors",children:e},e))})]}),e.map(e=>{let t=e.content?u(e.content):"calm";return(0,a.jsxs)("div",{className:(0,c.cn)("flex gap-3","user"===e.role?"justify-end":"justify-start"),children:["assistant"===e.role&&(0,a.jsx)(d.i,{pose:e.content?t:"sleeping",size:32,animate:!e.content}),(0,a.jsx)("div",{className:(0,c.cn)("max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed","user"===e.role?"bg-indigo-600 text-white rounded-tr-sm":"bg-gray-800 text-gray-100 rounded-tl-sm border border-gray-700"),children:e.content?(0,a.jsx)("span",{className:"whitespace-pre-wrap",dangerouslySetInnerHTML:{__html:e.content.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>")}}):(0,a.jsxs)("span",{className:"flex gap-1 items-center text-gray-400",children:[(0,a.jsx)("span",{className:"w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce",style:{animationDelay:"0ms"}}),(0,a.jsx)("span",{className:"w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce",style:{animationDelay:"150ms"}}),(0,a.jsx)("span",{className:"w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce",style:{animationDelay:"300ms"}})]})})]},e.id)}),(0,a.jsx)("div",{ref:w})]}),(0,a.jsx)("div",{className:"px-4 pb-4 pt-2 border-t border-gray-800 shrink-0",style:{paddingBottom:"calc(1rem + env(safe-area-inset-bottom))"},children:(0,a.jsxs)("form",{onSubmit:e=>{e.preventDefault(),N(n)},className:"flex gap-2",children:[(0,a.jsx)("input",{ref:D,value:n,onChange:e=>p(e.target.value),placeholder:"שאל את Uni...",disabled:x,className:"flex-1 h-11 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"}),(0,a.jsx)("button",{type:"submit",disabled:x||!n.trim(),className:"h-11 w-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center shrink-0",children:x?(0,a.jsx)(l.Z,{size:16,className:"animate-spin"}):(0,a.jsx)(o.Z,{size:16})})]})})]})]}),y&&(0,a.jsx)(h,{onClose:()=>g(!1)}),(0,a.jsx)(i.L,{})]})}},2980:function(e,t,n){"use strict";n.d(t,{i:function(){return l}});var a=n(7437),s=n(7440);let r={core:"\uD83E\uDD89",focused:"\uD83E\uDD89",calm:"\uD83E\uDD89",joyful:"\uD83E\uDD89",compassion:"\uD83E\uDD89",sleeping:"\uD83E\uDD89"},i={core:"",focused:"",calm:"animate-pulse",joyful:"animate-bounce",compassion:"",sleeping:"animate-pulse"};function l(e){let{pose:t="core",size:n=40,animate:l=!1,className:o}=e;return(0,a.jsx)("div",{style:{width:n,height:n},className:(0,s.cn)("rounded-full shrink-0 flex items-center justify-center select-none overflow-hidden","bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500","shadow-lg shadow-indigo-500/30",l&&i[t],o),children:(0,a.jsx)("img",{src:"/uni/".concat(t,".png"),alt:"Uni — ".concat(t),width:n,height:n,className:"w-full h-full object-cover",onError:e=>{let a=e.currentTarget;a.style.display="none";let s=a.parentElement;if(s&&!s.querySelector(".uni-emoji")){let e=document.createElement("span");e.className="uni-emoji text-2xl",e.textContent=r[t],e.style.fontSize="".concat(.55*n,"px"),s.appendChild(e)}}})})}},2468:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},2421:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]])},2023:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]])},2177:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("Gamepad2",[["line",{x1:"6",x2:"10",y1:"11",y2:"11",key:"1gktln"}],["line",{x1:"8",x2:"8",y1:"9",y2:"13",key:"qnk9ow"}],["line",{x1:"15",x2:"15.01",y1:"12",y2:"12",key:"krot7o"}],["line",{x1:"18",x2:"18.01",y1:"10",y2:"10",key:"1lcuu1"}],["path",{d:"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z",key:"mfqc10"}]])},1005:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("Home",[["path",{d:"m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"y5dka4"}],["polyline",{points:"9 22 9 12 15 12 15 22",key:"e2us08"}]])},8604:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("Image",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]])},3274:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]])},7390:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]])},2513:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]])},9348:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("Rss",[["path",{d:"M4 11a9 9 0 0 1 9 9",key:"pv89mb"}],["path",{d:"M4 4a16 16 0 0 1 16 16",key:"k0647b"}],["circle",{cx:"5",cy:"19",r:"1",key:"bfqh0e"}]])},994:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("Send",[["path",{d:"m22 2-7 20-4-9-9-4Z",key:"1q3vgg"}],["path",{d:"M22 2 11 13",key:"nzbqef"}]])},500:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]])},3907:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]])},5016:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("Trophy",[["path",{d:"M6 9H4.5a2.5 2.5 0 0 1 0-5H6",key:"17hqa7"}],["path",{d:"M18 9h1.5a2.5 2.5 0 0 0 0-5H18",key:"lmptdp"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22",key:"1nw9bq"}],["path",{d:"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22",key:"1np0yb"}],["path",{d:"M18 2H6v7a6 6 0 0 0 12 0V2Z",key:"u46fv3"}]])},8184:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]])},2022:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]])},4697:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])}},function(e){e.O(0,[93,141,502,372,241,971,23,744],function(){return e(e.s=2360)}),_N_E=e.O()}]);