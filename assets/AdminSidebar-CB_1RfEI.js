import{d as C,h as M,g as _,c as d,F as h,a,l as m,k as c,u as o,e as u,r as A,w as k,f as w,t as i,n as b,q as S,m as O,o as n,_ as z}from"./index-BUK9bx6z.js";import{c as r,X as V,M as I}from"./x-B9GT8n3o.js";/**
 * @license lucide-vue-next v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=r("clipboard-list",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M12 11h4",key:"1jrz19"}],["path",{d:"M12 16h4",key:"n85exb"}],["path",{d:"M8 11h.01",key:"1dfujw"}],["path",{d:"M8 16h.01",key:"18s6g9"}]]);/**
 * @license lucide-vue-next v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=r("layout-dashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]);/**
 * @license lucide-vue-next v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=r("log-out",[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]]);/**
 * @license lucide-vue-next v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=r("package",[["path",{d:"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",key:"1a0edw"}],["path",{d:"M12 22V12",key:"d0xqtd"}],["polyline",{points:"3.29 7 12 12 20.71 7",key:"ousv84"}],["path",{d:"m7.5 4.27 9 5.15",key:"1c824w"}]]);/**
 * @license lucide-vue-next v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=r("user-round-cog",[["path",{d:"m14.305 19.53.923-.382",key:"3m78fa"}],["path",{d:"m15.228 16.852-.923-.383",key:"npixar"}],["path",{d:"m16.852 15.228-.383-.923",key:"5xggr7"}],["path",{d:"m16.852 20.772-.383.924",key:"dpfhf9"}],["path",{d:"m19.148 15.228.383-.923",key:"1reyyz"}],["path",{d:"m19.53 21.696-.382-.924",key:"1goivc"}],["path",{d:"M2 21a8 8 0 0 1 10.434-7.62",key:"1yezr2"}],["path",{d:"m20.772 16.852.924-.383",key:"htqkph"}],["path",{d:"m20.772 19.148.924.383",key:"9w9pjp"}],["circle",{cx:"10",cy:"8",r:"5",key:"o932ke"}],["circle",{cx:"18",cy:"18",r:"3",key:"1xkwt0"}]]);/**
 * @license lucide-vue-next v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=r("users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]]),U=["aria-expanded"],q={class:"admin-nav","aria-label":"Administration"},B={key:0,class:"nav-count"},H={class:"sidebar-bottom"},R={class:"signed-in"},$={class:"avatar"},E={class:"signed-in-copy"},T=C({__name:"AdminSidebar",props:{pendingOrders:{default:0}},setup(p){const l=M(),g=S(),t=_(!1),v=[{label:"Dashboard",to:"/admin/dashboard",icon:D},{label:"Orders",to:"/admin/orders",icon:j},{label:"Products",to:"/admin/products",icon:L},{label:"Accounts",to:"/admin/users",icon:P},{label:"Employees",to:"/admin/users?view=employees",icon:N}];function f(){l.logout(),g.push("/login")}return(x,e)=>{const y=A("router-link");return n(),d(h,null,[a("button",{type:"button",class:"admin-mobile-toggle","aria-expanded":t.value,"aria-label":"Toggle admin navigation",onClick:e[0]||(e[0]=s=>t.value=!t.value)},[t.value?(n(),c(o(V),{key:0,size:20})):(n(),c(o(I),{key:1,size:20}))],8,U),t.value?(n(),d("button",{key:0,type:"button",class:"admin-sidebar-scrim","aria-label":"Close admin navigation",onClick:e[1]||(e[1]=s=>t.value=!1)})):m("",!0),a("aside",{class:b(["admin-sidebar",{"sidebar-open":t.value}])},[u(y,{to:"/admin/dashboard",class:"admin-brand","aria-label":"Kisaku admin home"},{default:k(()=>[...e[3]||(e[3]=[a("span",{class:"brand-mark"},"K",-1),a("span",null,[a("strong",null,"KISAKU"),a("small",null,"ADMINISTRATION")],-1)])]),_:1}),e[5]||(e[5]=a("p",{class:"nav-caption"},"WORKSPACE",-1)),a("nav",q,[(n(),d(h,null,w(v,s=>u(y,{key:s.to,to:s.to,class:b(["admin-nav-link",{"nav-active":x.$route.fullPath===s.to}]),onClick:e[2]||(e[2]=F=>t.value=!1)},{default:k(()=>[(n(),c(O(s.icon),{size:18})),a("span",null,i(s.label),1),s.label==="Orders"&&p.pendingOrders>0?(n(),d("span",B,i(p.pendingOrders),1)):m("",!0)]),_:2},1032,["to","class"])),64))]),a("div",H,[a("div",R,[a("span",$,i(o(l).user?.name?.slice(0,1).toUpperCase()??"S"),1),a("span",E,[a("strong",null,i(o(l).user?.name??"Staff member"),1),a("small",null,i(o(l).isAdmin?"Administrator":"Staff"),1)])]),a("button",{class:"logout-button",type:"button",onClick:f},[u(o(K),{size:17}),e[4]||(e[4]=a("span",null,"Sign out",-1))])])],2)],64)}}}),G=z(T,[["__scopeId","data-v-a16c5bb4"]]);export{G as A,j as C,L as P,P as U};
