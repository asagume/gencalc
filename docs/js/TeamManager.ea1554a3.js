(function(){"use strict";var e={5476:function(e,t,n){var a=n(5130),i=n(6768),o=n(4232);const l={class:"base-container"},r={class:"pane1"},s={class:"display-stat-select"},u=["value"],c={class:"display-stat"},d={class:"number-of-teams"},m=["min"],p={class:"data-control"},f=["disabled"],h={class:"pane2",id:"team-list-and-editor"},v={class:"team-tags-area"},b={id:"search-datalist"},g=["value"],k=["onUpdate:modelValue"],y=["id"],T={class:"pane3"},I={id:"team-rotation"};function E(e,t,n,E,O,C){const L=(0,i.g2)("TeamItem"),R=(0,i.g2)("draggable"),S=(0,i.g2)("TeamEditorModal"),M=(0,i.g2)("TeamRotation");return(0,i.uX)(),(0,i.CE)("div",l,[t[12]||(t[12]=(0,i.Lk)("div",{class:"header"},[(0,i.eW)("   "),(0,i.Lk)("a",{href:"./"},"げんかるく")],-1)),(0,i.Lk)("div",r,[(0,i.Lk)("fieldset",null,[(0,i.Lk)("div",s,[((0,i.uX)(!0),(0,i.CE)(i.FK,null,(0,i.pI)(e.DISPLAY_STAT_LIST,(n=>((0,i.uX)(),(0,i.CE)("label",{class:"display-stat",key:n[1]},[(0,i.bo)((0,i.Lk)("input",{class:"hidden",type:"radio",name:"display-stat","onUpdate:modelValue":t[0]||(t[0]=t=>e.displayStat=t),value:n[0]},null,8,u),[[a.XL,e.displayStat]]),(0,i.Lk)("span",null,(0,o.v_)(n[1]),1)])))),128)),(0,i.Lk)("label",c,[(0,i.bo)((0,i.Lk)("input",{class:"hidden",type:"checkbox","onUpdate:modelValue":t[1]||(t[1]=t=>e.displayTags=t)},null,512),[[a.lH,e.displayTags]]),t[8]||(t[8]=(0,i.Lk)("span",null,"TAGS",-1))])]),(0,i.Lk)("label",d,[t[9]||(t[9]=(0,i.eW)(" Number of teams ")),(0,i.bo)((0,i.Lk)("input",{type:"number",min:e.NUMBER_OF_TEAMS,max:999,"onUpdate:modelValue":t[2]||(t[2]=t=>e.numberOfTeams=t),onChange:t[3]||(t[3]=(...t)=>e.numberOfTeamsOnChange&&e.numberOfTeamsOnChange(...t))},null,40,m),[[a.Jo,e.numberOfTeams]])]),(0,i.Lk)("div",p,[(0,i.Lk)("button",{type:"button",disabled:e.saveDisabled,onClick:t[4]||(t[4]=(...t)=>e.saveOnClick&&e.saveOnClick(...t))}," Save ",8,f),(0,i.Lk)("button",{type:"button",onClick:t[5]||(t[5]=(...t)=>e.loadOnClick&&e.loadOnClick(...t))}," Load "),(0,i.Lk)("button",{type:"button",onClick:t[6]||(t[6]=(...t)=>e.clearOnClick&&e.clearOnClick(...t))}," Clear ")])])]),(0,i.Lk)("div",h,[(0,i.bo)((0,i.Lk)("div",null,[(0,i.Lk)("div",v,[(0,i.bo)((0,i.Lk)("input",{class:"search",type:"search","onUpdate:modelValue":t[7]||(t[7]=t=>e.searchWord=t),list:"search-datalist"},null,512),[[a.Jo,e.searchWord]]),(0,i.Lk)("datalist",b,[((0,i.uX)(!0),(0,i.CE)(i.FK,null,(0,i.pI)(e.searchDatalist,(t=>((0,i.uX)(),(0,i.CE)("option",{key:t,value:e.displayName(t)},null,8,g)))),128))]),((0,i.uX)(!0),(0,i.CE)(i.FK,null,(0,i.pI)(e.teamTagList,(t=>((0,i.uX)(),(0,i.CE)("label",{key:t},[(0,i.bo)((0,i.Lk)("input",{class:"hidden",type:"checkbox","onUpdate:modelValue":n=>e.teamTagChecked[t]=n},null,8,k),[[a.lH,e.teamTagChecked[t]]]),(0,i.Lk)("span",null,(0,o.v_)(t),1)])))),128))]),(0,i.bF)(R,{list:e.filteredTeams,"item-key":"id",sort:!0,handle:".handle"},{item:(0,i.k6)((({element:t})=>[(0,i.Lk)("div",{style:{display:"inline-block"},id:"team-"+t.id},[(0,i.bF)(L,{team:t,selected:e.teamSelected(t.id),"display-stat":e.displayStat,"display-res":e.displayRes,constellations:e.constellations,editable:!0,"show-equipment":!0,"display-tags":e.displayTags,onClick:n=>e.teamOnClick(t.id),"onClick:edit":e.editOnClick,"onClick:jumpToRotation":e.jumpToRotation,"onUpdate:memberResult":e.updateMemberResult},null,8,["team","selected","display-stat","display-res","constellations","display-tags","onClick","onClick:edit","onClick:jumpToRotation","onUpdate:memberResult"])],8,y)])),_:1},8,["list"])],512),[[a.aG,!e.teamEditorVisible]]),(0,i.bo)((0,i.Lk)("div",null,[e.forcusedTeam?((0,i.uX)(),(0,i.Wv)(S,{key:0,visible:e.teamEditorVisible,team:e.forcusedTeam,"team-tags":e.teamTagList,"onClick:cancel":e.teamEditorOnClickCancel,"onClick:ok":e.teamEditorOnClickOk},null,8,["visible","team","team-tags","onClick:cancel","onClick:ok"])):(0,i.Q3)("",!0)],512),[[a.aG,e.teamEditorVisible]])]),(0,i.Lk)("div",T,[t[10]||(t[10]=(0,i.Lk)("hr",null,null,-1)),t[11]||(t[11]=(0,i.Lk)("h3",null,"ROTATION",-1)),(0,i.Lk)("div",I,[e.forcusedTeam?((0,i.uX)(),(0,i.Wv)(M,{key:0,team:e.forcusedTeam,"team-member-result":e.teamMemberResult,constellations:e.constellations,"onUpdate:rotation":e.updateRotation,"onClick:jumpToTeam":e.jumpToTeam},null,8,["team","team-member-result","constellations","onUpdate:rotation","onClick:jumpToTeam"])):(0,i.Q3)("",!0)])]),t[13]||(t[13]=(0,i.Fv)('<div class="pane4" data-v-8f212e62></div><div class="footer" data-v-8f212e62><hr data-v-8f212e62><h2 data-v-8f212e62>チーム編成 Ver.1.0.0</h2><ul class="usage" data-v-8f212e62><li data-v-8f212e62>右上の◆のドラッグ＆ドロップでチームの並べ替えができます。</li></ul><dl class="history" data-v-8f212e62><dt data-v-8f212e62>1.1.0</dt><dd data-v-8f212e62> チーム分類用のタグ機能を追加。 </dd><dt data-v-8f212e62>1.0.0</dt><dd data-v-8f212e62> 元素チャージ効率計算機能が（ひとまず）完成しました。 </dd><dt data-v-8f212e62>0.5.0</dt><dd data-v-8f212e62> ローテーションが保存されるようになりました。チームデータの一部として記憶します。 </dd></dl><p data-v-8f212e62><a href="./TeamExample.html" data-v-8f212e62>EXAMPLE</a></p><p data-v-8f212e62><a href="./" data-v-8f212e62>げんかるく - 原神ダメージシミュレーター</a>   <a href="./TeamOptionList.html" data-v-8f212e62>強化・弱体効果一覧</a></p></div>',2))])}n(4114),n(7642),n(8004),n(3853),n(5876),n(2475),n(5024),n(1698);var O=n(8626),C=n.n(O),L=n(1527),R=n.n(L),S=n(144),M=n(5682),j=n(2112),_=n(9164),D=n(1419),w=n(7976),W=n(1800),A=n(6924),N=(0,i.pM)({name:"TeamManager",props:{id:{type:Number}},components:{draggable:R(),TeamItem:w.A,TeamEditorModal:D.A,TeamRotation:W.A},setup(e){const{displayName:t}=(0,M.A)(),n=(0,S.KR)(!1),a=[["","None"],["レベル","Lv."],["HP上限","Max HP"],["攻撃力","ATK"],["防御力","DEF"],["元素熟知","EM"],["会心率/ダメージ","CRIT"],["元素チャージ効率","ER"]],o=(0,S.KR)(_.dk),l=(0,S.Kh)([]);for(let i=0;i<o.value;i++)l.push((0,_.Mu)(i));const r=(0,S.Kh)({}),s=(0,S.KR)(""),u=(0,S.KR)(!0),c=(0,S.KR)(!1),d=(0,S.KR)(0),m=(0,S.KR)(""),p=(0,S.Kh)({}),f=(0,S.KR)(""),h=(0,S.Kh)({});(0,i.sV)((()=>{w(),void 0!==e.id&&(d.value=e.id,n.value=!0)}));const v=(0,i.EW)((()=>A.AB.map((e=>[e.key,e.icon_url])).sort(((e,t)=>{const n=e[1].split("/"),a=n[n.length-1].split("_"),i=a[a.length-1],o=t[1].split("/"),l=o[o.length-1].split("_"),r=l[l.length-1];return i.localeCompare(r)})).map((e=>e[0])))),b=(0,i.EW)((()=>{const e=[];return l.forEach((t=>{e.push(...t.tags)})),[...new Set(e)].sort()})),g=(0,i.EW)((()=>l.filter((e=>e.id==d.value)).length?l.filter((e=>e.id==d.value))[0]:void 0)),k=(0,i.EW)((()=>(0,_.Wh)(l))),y=(0,i.EW)((()=>k.value==m.value)),T=e=>e==d.value,I=(0,i.EW)((()=>{let e={};if(d.value in r)e=r[d.value];else if(-1!=d.value){const t=l.filter((e=>e.id==d.value))[0];t.members.forEach((t=>{e&&(e[t.id]=(0,_.RX)())}))}return e})),E=(0,i.EW)((()=>{let e=l;if(f.value){const t=f.value;e=e.filter((e=>e.name.includes(t)||e.members.filter((e=>e.name.includes(t)||e.replacements.filter((e=>e.includes(t))).length>0)).length>0))}const t=Object.keys(h).filter((e=>b.value.includes(e)&&h[e]));return t.length&&(e=e.filter((e=>e.tags.filter((e=>t.includes(e))).length>0))),e})),O=()=>{if(o.value>l.length){const e=Math.max(...l.map((e=>e.id))),t=o.value-l.length;for(let n=0;n<t;n++)l.push((0,_.Mu)(e+1+n))}else o.value<l.length&&(d.value>o.value&&(d.value=0),l.splice(o.value))};function L(){const e=localStorage.getItem("キャラクター所持状況");if(e){const t={},n=JSON.parse(e);Object.keys(n).forEach((e=>{const a=Number(n[e]);Number.isNaN(a)&&(t[e]=a)})),(0,j.BW)(p,t)}}function R(){const e=localStorage.getItem("teams"),t=[];for(let n=0;n<o.value;n++)t.push((0,_.Mu)(n));if(e){const n=JSON.parse(e);(0,_.GX)(t,n,!0),o.value=t.length,m.value=e}l.splice(0,l.length,...t)}const D=()=>{l.forEach((e=>{e.tags.forEach((e=>{void 0===h[e]&&(h[e]=!1)}))}))},w=()=>{L(),R(),D()},W=()=>{localStorage.setItem("teams",k.value),R(),d.value=0},N=()=>{l.forEach((e=>{(0,_.ab)(e)}))},K=e=>{d.value=e},V=e=>{e==d.value?(n.value=!0,(0,i.dY)().then((()=>{document.getElementById("team-list-and-editor")?.scrollIntoView({behavior:"smooth"})}))):d.value=e},X=e=>{if(n.value=!1,d.value<0)return;P();const t=l.filter((e=>e.id==d.value))[0];if(t){t.name=e.name;for(let n=0;n<e.members.length;n++){const a=e.members[n],i=t.members[n];i.name==a.name&&i.buildname==e.members[n].buildname||(i.name=e.members[n].name,i.buildname=e.members[n].buildname,i.builddata=i.buildname?(0,_.ME)(i.name,i.buildname):void 0),C().isEqual(i.tags,a.tags)||i.tags.splice(0,i.tags.length,...a.tags),C().isEqual(i.replacements,a.replacements)||i.replacements.splice(0,i.replacements.length,...a.replacements)}t.description=e.description,C().isEqual(t.rotation,e.rotation)||t.rotation.splice(0,t.rotation.length,...e.rotation),t.tags=e.tags,D()}},F=()=>{n.value=!1,P()},U=(e,t)=>{if(-1!=d.value){const n=l.filter((e=>e.id==d.value))[0];n&&(n.rotation.splice(0,n.rotation.length,...e),n.rotationDescription=t)}},x=()=>{(0,i.dY)().then((()=>{document.getElementById("team-rotation")?.scrollIntoView({behavior:"smooth"})}))},P=()=>{-1!=d.value&&(0,i.dY)().then((()=>{document.getElementById("team-"+d.value)?.scrollIntoView({behavior:"smooth"})}))},B=(e,t)=>{r[e]=t,e==d.value&&I.value};return{displayName:t,DISPLAY_STAT_LIST:a,NUMBER_OF_TEAMS:_.dk,numberOfTeams:o,displayStat:s,displayRes:u,displayTags:c,teams:l,constellations:p,teamEditorVisible:n,teamSelected:T,forcusedTeam:g,saveDisabled:y,teamMemberResult:I,searchWord:f,searchDatalist:v,teamTagList:b,teamTagChecked:h,filteredTeams:E,numberOfTeamsOnChange:O,saveOnClick:W,loadOnClick:w,clearOnClick:N,teamOnClick:K,editOnClick:V,teamEditorOnClickOk:X,teamEditorOnClickCancel:F,updateRotation:U,jumpToRotation:x,jumpToTeam:P,updateMemberResult:B}}}),K=n(1241);const V=(0,K.A)(N,[["render",E],["__scopeId","data-v-8f212e62"]]);var X=V,F=n(2277);async function U(){(0,a.Ef)(X,{}).use(F.A).mount("#app")}U()},9164:function(e,t,n){n.d(t,{AS:function(){return T},FT:function(){return k},GX:function(){return D},Gm:function(){return d},KS:function(){return b},Kq:function(){return L},ME:function(){return E},MQ:function(){return g},Mu:function(){return S},RX:function(){return O},Wh:function(){return _},Yw:function(){return I},ZF:function(){return w},ab:function(){return j},dk:function(){return c},jI:function(){return m},mu:function(){return C},os:function(){return f},rr:function(){return y},uP:function(){return p}});n(4114);var a=n(8626),i=n.n(a),o=n(725),l=n(2112),r=n(1493),s=n(6924),u=n(3497);const c=10,d=4,m=["片手剣","長柄武器"],p=["鹿野院平蔵","リオセスリ"],f=["フリーナ","アルレッキーノ"];let h=0;const v=new Map;function b(e){let t;return e&&e in s.Zn&&(t=s.Zn[e]),t}async function g(){const e=[];for(const t of Object.keys(s.Zn))e.push((0,s.Td)(t).then((e=>{v.set(t,e)})));await Promise.all(e)}function k(e){return v.get(e)}function y(e,t){let n;if(e&&t&&e in s._U){const a=s._U[e];t in a&&(n=a[t])}return n}function T(e){const t=e.split("_"),n=t[1];let a;return t.splice(0,2),a=t.length>0?t.join("_"):(0,r.no)(n),a}function I(e){return Object.keys(localStorage).filter((t=>t.startsWith((0,r.F0)(e))))}function E(e,t){let n;const a=(0,r.F0)(e,t),i=localStorage.getItem(a);return i&&(n=JSON.parse(i)),n}function O(){return{characterInput:(0,r.D$)(),artifactDetailInput:(0,r.fD)(),conditionInput:(0,r.BP)(),optionInput:(0,r.Xs)(),statsInput:(0,r.b7)(),damageResult:(0,r.GQ)()}}const C=async(e,t)=>{const n=O();if(!e.name)return n;n.characterInput.character=e.name,n.characterInput.characterMaster=await(0,s.Td)(n.characterInput.character);const a={"片手剣":"無鋒の剣","両手剣":"訓練用大剣","長柄武器":"新米の長槍","弓":"狩猟弓","法器":"生徒ノート"};n.characterInput.weapon=a[n.characterInput.characterMaster.武器];const i=e.builddata;if(!i)return n;if(await(0,r.g4)(n.characterInput,n.artifactDetailInput,n.conditionInput,n.optionInput,i),(0,r.Lk)(n.characterInput),(0,r.Oq)(n.characterInput),(0,r.pL)(n.characterInput),(0,r.N2)(n.conditionInput,n.characterInput,n.optionInput),(0,o.Jo)(n.artifactDetailInput.聖遺物ステータスメイン効果,n.artifactDetailInput.聖遺物メイン効果),(0,o.S_)(n.artifactDetailInput),n.conditionInput.checkboxList.forEach((e=>{n.conditionInput.conditionValues[e.name]=!1})),n.conditionInput.selectList.forEach((e=>{n.conditionInput.conditionValues[e.name]=0})),await(0,r.c0)(n.characterInput,n.conditionInput,n.optionInput),L(t)){const e={};L(t).filter((e=>["炎元素共鳴","水元素共鳴","草元素共鳴","元素共鳴なし"].includes(e))).forEach((t=>{if(n.optionInput.elementalResonance.conditionValues[t]=!0,"詳細"in s.u[t]){const n=s.u[t].詳細;if(n)for(const t of n)"種類"in t&&"数値"in t&&(t.種類 in e?e[t.種類]+=t.数値:e[t.種類]=t.数値)}})),(0,l.BW)(n.optionInput.elementalResonance.conditionAdjustments,e)}return(0,o.s2)(n.statsInput,n.characterInput,n.artifactDetailInput,n.conditionInput,n.optionInput),(0,o.h9)(n.damageResult,n.characterInput,n.conditionInput,n.statsInput),n},L=e=>{const t=[],n={},a=e.members.filter((e=>e.name));return 4==a.length&&(a.forEach((e=>{const t=b(e.name);t&&(t.元素 in n?n[t.元素]++:n[t.元素]=1)})),4==Object.keys(n).length?t.push("元素共鳴なし"):Object.keys(n).forEach((e=>{n[e]>=2&&t.push(e+"元素共鳴")}))),t};function R(e){return{id:e,name:"",buildname:void 0,builddata:void 0,tags:[],replacements:[]}}function S(e){const t={id:e,name:"チーム"+(e+1),members:[],description:"",rotation:[],rotationDescription:"",tags:[]};for(let n=0;n<d;n++)t.members.push(R(h++));return t}function M(e){e.name="",e.buildname=void 0,e.builddata=void 0,e.tags=[],e.replacements=[]}function j(e){e.name="チーム"+(e.id+1),e.members.forEach((e=>{M(e)}))}function _(e){const t=i().cloneDeep(e);let n=0;return t.forEach((e=>{e.id=n++,e.members.forEach((e=>{e.id=0,e.builddata=void 0})),e.rotation?.length&&e.rotation.forEach((e=>{e.id=0}))})),JSON.stringify(t,((e,t)=>null!==t?t:void 0))}function D(e,t,n=!1){let a=0;for(let o=0;o<t.length;o++){const l=t[o];let r=e[o];r||(r=S(o),e.push(r)),r.name=l.name;for(let e=0;e<r.members.length;e++)if(l.members?.length){const t=l.members[e];t&&(r.members[e].name=t.name,n?(r.members[e].buildname=t.buildname,r.members[e].builddata=t.buildname?E(t.name,t.buildname):void 0):(r.members[e].buildname=void 0,r.members[e].builddata=void 0),r.members[e].tags=t.tags??[],r.members[e].replacements=t.replacements??[])}r.description=l.description??"",l.rotation?.length&&(r.rotation=i().cloneDeep(l.rotation),r.rotation.forEach((e=>{if(e.id=a++,e.action.startsWith("E")){const t=(0,u.y0)(e.member);t.includes(e.action)||(e.action=t[0])}}))),r.rotationDescription=l.rotationDescription??"",r.tags=l.tags??[]}e.length>t.length&&e.length>=c&&e.splice(t.length)}function w(e){let t=1;const n=k(e);if(n)for(const a of[n.特殊通常攻撃?.詳細,n.通常攻撃?.詳細]){if(!a)continue;let e=1;a.forEach((t=>{if(t.名前){const n=t.名前.match(/.*(\d)段.+/);if(!n)return;const a=Number(n[1]);a>e&&(e=a)}})),t<e&&(t=e)}return t}}},t={};function n(a){var i=t[a];if(void 0!==i)return i.exports;var o=t[a]={id:a,loaded:!1,exports:{}};return e[a].call(o.exports,o,o.exports,n),o.loaded=!0,o.exports}n.m=e,function(){var e=[];n.O=function(t,a,i,o){if(!a){var l=1/0;for(c=0;c<e.length;c++){a=e[c][0],i=e[c][1],o=e[c][2];for(var r=!0,s=0;s<a.length;s++)(!1&o||l>=o)&&Object.keys(n.O).every((function(e){return n.O[e](a[s])}))?a.splice(s--,1):(r=!1,o<l&&(l=o));if(r){e.splice(c--,1);var u=i();void 0!==u&&(t=u)}}return t}o=o||0;for(var c=e.length;c>0&&e[c-1][2]>o;c--)e[c]=e[c-1];e[c]=[a,i,o]}}(),function(){n.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return n.d(t,{a:t}),t}}(),function(){n.d=function(e,t){for(var a in t)n.o(t,a)&&!n.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})}}(),function(){n.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){n.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){n.nmd=function(e){return e.paths=[],e.children||(e.children=[]),e}}(),function(){n.j=609}(),function(){var e={609:0};n.O.j=function(t){return 0===e[t]};var t=function(t,a){var i,o,l=a[0],r=a[1],s=a[2],u=0;if(l.some((function(t){return 0!==e[t]}))){for(i in r)n.o(r,i)&&(n.m[i]=r[i]);if(s)var c=s(n)}for(t&&t(a);u<l.length;u++)o=l[u],n.o(e,o)&&e[o]&&e[o][0](),e[o]=0;return n.O(c)},a=self["webpackChunkgencalc"]=self["webpackChunkgencalc"]||[];a.forEach(t.bind(null,0)),a.push=t.bind(null,a.push.bind(a))}();var a=n.O(void 0,[504,996],(function(){return n(5476)}));a=n.O(a)})();
//# sourceMappingURL=TeamManager.ea1554a3.js.map