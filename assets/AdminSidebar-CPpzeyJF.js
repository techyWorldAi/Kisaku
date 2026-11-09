import{d as S,u as x,r as _,b as C,c,F as y,a,l as h,k as p,i as l,f as k,g as O,w as b,h as z,t as r,n as g,q as w,B as L,m as V,o,_ as j}from"./index-CuV2EJ-e.js";import{a as B,L as N}from"./log-out-BLo56NVM.js";import{c as i,P,X as D,M as I}from"./x-Bz8rmKcc.js";/**
 * @license lucide-vue-next v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=i("clipboard-list",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M12 11h4",key:"1jrz19"}],["path",{d:"M12 16h4",key:"n85exb"}],["path",{d:"M8 11h.01",key:"1dfujw"}],["path",{d:"M8 16h.01",key:"18s6g9"}]]);/**
 * @license lucide-vue-next v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=i("panels-top-left",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"M9 21V9",key:"1oto5p"}]]);/**
 * @license lucide-vue-next v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const H=i("scroll-text",[["path",{d:"M15 12h-5",key:"r7krc0"}],["path",{d:"M15 8h-5",key:"1khuty"}],["path",{d:"M19 17V5a2 2 0 0 0-2-2H4",key:"zz82l3"}],["path",{d:"M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3",key:"1ph1d7"}]]);/**
 * @license lucide-vue-next v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=i("shopping-basket",[["path",{d:"m15 11-1 9",key:"5wnq3a"}],["path",{d:"m19 11-4-7",key:"cnml18"}],["path",{d:"M2 11h20",key:"3eubbj"}],["path",{d:"m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4",key:"yiazzp"}],["path",{d:"M4.5 15.5h15",key:"13mye1"}],["path",{d:"m5 11 4-7",key:"116ra9"}],["path",{d:"m9 11 1 9",key:"1ojof7"}]]);/**
 * @license lucide-vue-next v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=i("user-round-cog",[["path",{d:"m14.305 19.53.923-.382",key:"3m78fa"}],["path",{d:"m15.228 16.852-.923-.383",key:"npixar"}],["path",{d:"m16.852 15.228-.383-.923",key:"5xggr7"}],["path",{d:"m16.852 20.772-.383.924",key:"dpfhf9"}],["path",{d:"m19.148 15.228.383-.923",key:"1reyyz"}],["path",{d:"m19.53 21.696-.382-.924",key:"1goivc"}],["path",{d:"M2 21a8 8 0 0 1 10.434-7.62",key:"1yezr2"}],["path",{d:"m20.772 16.852.924-.383",key:"htqkph"}],["path",{d:"m20.772 19.148.924.383",key:"9w9pjp"}],["circle",{cx:"10",cy:"8",r:"5",key:"o932ke"}],["circle",{cx:"18",cy:"18",r:"3",key:"1xkwt0"}]]);/**
 * @license lucide-vue-next v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=i("users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]]),E=["aria-expanded"],K={class:"admin-nav","aria-label":"Administration"},F={key:0,class:"nav-count"},W={class:"sidebar-bottom"},X={class:"signed-in"},G={class:"avatar"},J={class:"signed-in-copy"},Q=S({__name:"AdminSidebar",props:{pendingOrders:{default:0}},setup(u){const s=x(),v=w(),t=_(!1),f=[{label:"Dashboard",to:"/admin/dashboard",icon:B},{label:"Orders",to:"/admin/orders",icon:T},{label:"Sales orders",to:"/admin/sales",icon:R,salesAccess:!0},{label:"Products",to:"/admin/products",icon:P},{label:"Storefront",to:"/admin/storefront",icon:q,adminOnly:!0},{label:"Audit logs",to:"/admin/audit-logs",icon:H,adminOnly:!0},{label:"Accounts",to:"/admin/users",icon:$},{label:"Employees",to:"/admin/users?view=employees",icon:U}],A=C(()=>f.filter(d=>(!d.adminOnly||s.isAdmin)&&(!d.salesAccess||s.canAccessSales)&&(d.salesAccess||s.canAccessAdmin)));function M(){s.logout(),v.push("/login")}return(d,e)=>{const m=O("router-link");return o(),c(y,null,[a("button",{type:"button",class:"admin-mobile-toggle","aria-expanded":t.value,"aria-label":"Toggle admin navigation",onClick:e[0]||(e[0]=n=>t.value=!t.value)},[t.value?(o(),p(l(D),{key:0,size:20})):(o(),p(l(I),{key:1,size:20}))],8,E),t.value?(o(),c("button",{key:0,type:"button",class:"admin-sidebar-scrim","aria-label":"Close admin navigation",onClick:e[1]||(e[1]=n=>t.value=!1)})):h("",!0),a("aside",{class:g(["admin-sidebar",{"sidebar-open":t.value}])},[k(m,{to:"/admin/dashboard",class:"admin-brand","aria-label":"Kisaku admin home"},{default:b(()=>[...e[3]||(e[3]=[a("img",{class:"admin-brand-logo",src:L,alt:"Kisaku Supply Agencies"},null,-1),a("small",{class:"admin-brand-label"},"ADMINISTRATION",-1)])]),_:1}),e[5]||(e[5]=a("p",{class:"nav-caption"},"WORKSPACE",-1)),a("nav",K,[(o(!0),c(y,null,z(A.value,n=>(o(),p(m,{key:n.to,to:n.to,class:g(["admin-nav-link",{"nav-active":d.$route.fullPath===n.to}]),onClick:e[2]||(e[2]=Y=>t.value=!1)},{default:b(()=>[(o(),p(V(n.icon),{size:18})),a("span",null,r(n.label),1),n.label==="Orders"&&u.pendingOrders>0?(o(),c("span",F,r(u.pendingOrders),1)):h("",!0)]),_:2},1032,["to","class"]))),128))]),a("div",W,[a("div",X,[a("span",G,r(l(s).user?.name?.slice(0,1).toUpperCase()??"S"),1),a("span",J,[a("strong",null,r(l(s).user?.name??"Staff member"),1),a("small",null,r(l(s).isAdmin?"Administrator":l(s).isSalesAgent?"Sales agent":"Staff"),1)])]),a("button",{class:"logout-button",type:"button",onClick:M},[k(l(N),{size:17}),e[4]||(e[4]=a("span",null,"Sign out",-1))])])],2)],64)}}}),sa=j(Q,[["__scopeId","data-v-fc1c6735"]]);export{sa as A,T as C,R as S,$ as U,H as a};
