(function(){"use strict";var e={9520:function(e,t,a){var r=a(5130),l=a(6768),n=a(4232);const o={class:"base-container"},i={class:"pane2"},c={class:"pane3"},u={colspan:"3"},p=["value"];function g(e,t,a,g,s,d){const C=(0,l.g2)("vue-good-table");return(0,l.uX)(),(0,l.CE)("div",o,[t[26]||(t[26]=(0,l.Lk)("div",{class:"pane1"},[(0,l.Lk)("p",{class:"left-top"},[(0,l.Lk)("a",{href:"./"},"げんかるく")]),(0,l.Lk)("p",null," "),(0,l.Lk)("h2",null,"会心率と会心ダメージの目標値"),(0,l.Lk)("p",null," "),(0,l.eW)(" 会心率とダメージの比率と聖遺物のみ（キャラクターと武器の双方に会心系の突破ステータスなし）の場合の基準値を設定すると、 キャラクターや武器に会心系の突破ステータスがある場合に同レベルの会心スコアを持つ聖遺物を装備した時の会心率と会心ダメージの目安を計算します。 ")],-1)),(0,l.Lk)("div",i,[(0,l.bF)(C,{columns:e.columns,rows:e.rows,theme:"nocturnal",styleClass:"vgt-table striped","sort-options":{enabled:!0,initialSortBy:[{field:"characterCritScore",type:"asc"},{field:"weaponRarity",type:"asc"},{field:"weaponCritScore",type:"asc"}]}},null,8,["columns","rows"])]),(0,l.Lk)("div",c,[(0,l.Lk)("h3",null,(0,n.v_)(e.displayName("設定")),1),(0,l.Lk)("table",null,[(0,l.Lk)("tbody",null,[(0,l.Lk)("tr",null,[t[18]||(t[18]=(0,l.Lk)("th",null,"比率",-1)),(0,l.Lk)("td",null,[(0,l.Lk)("label",null,[(0,l.eW)((0,n.v_)(e.displayName("会心率"))+" ",1),(0,l.bo)((0,l.Lk)("input",{type:"number","onUpdate:modelValue":t[0]||(t[0]=t=>e.critRateRatio=t),min:"0",skip:"0.01",onChange:t[1]||(t[1]=(...t)=>e.calculateCritTarget&&e.calculateCritTarget(...t))},null,544),[[r.Jo,e.critRateRatio]])])]),t[19]||(t[19]=(0,l.Lk)("td",null,":",-1)),(0,l.Lk)("td",null,[(0,l.Lk)("label",null,[(0,l.eW)((0,n.v_)(e.displayName("会心ダメージ"))+" ",1),(0,l.bo)((0,l.Lk)("input",{type:"number","onUpdate:modelValue":t[2]||(t[2]=t=>e.critDmgRatio=t),min:"0",skip:"0.01",onChange:t[3]||(t[3]=(...t)=>e.calculateCritTarget&&e.calculateCritTarget(...t))},null,544),[[r.Jo,e.critDmgRatio]])])])]),(0,l.Lk)("tr",null,[t[20]||(t[20]=(0,l.Lk)("th",{rowspan:"2"},"聖遺物のみの目標値",-1)),(0,l.Lk)("td",u,[((0,l.uX)(!0),(0,l.CE)(l.FK,null,(0,l.pI)(e.TARGET_PRESET,((a,o)=>((0,l.uX)(),(0,l.CE)("label",{key:a[0]},[(0,l.bo)((0,l.Lk)("input",{type:"radio","onUpdate:modelValue":t[4]||(t[4]=t=>e.targetPresetSelected=t),value:o,onChange:t[5]||(t[5]=(...t)=>e.targetPresetOnChange&&e.targetPresetOnChange(...t))},null,40,p),[[r.XL,e.targetPresetSelected]]),(0,l.eW)(" "+(0,n.v_)("Lv."+o),1)])))),128))])]),(0,l.Lk)("tr",null,[(0,l.Lk)("td",null,[(0,l.Lk)("label",null,[(0,l.eW)((0,n.v_)(e.displayName("会心率"))+" ",1),(0,l.bo)((0,l.Lk)("input",{type:"number","onUpdate:modelValue":t[6]||(t[6]=t=>e.critRateTarget=t),min:"0",onChange:t[7]||(t[7]=(...t)=>e.calculateCritTarget&&e.calculateCritTarget(...t))},null,544),[[r.Jo,e.critRateTarget]])])]),t[21]||(t[21]=(0,l.Lk)("td",null,null,-1)),(0,l.Lk)("td",null,[(0,l.Lk)("label",null,[(0,l.eW)((0,n.v_)(e.displayName("会心ダメージ"))+" ",1),(0,l.bo)((0,l.Lk)("input",{type:"number","onUpdate:modelValue":t[8]||(t[8]=t=>e.critDmgTarget=t),min:"0",onChange:t[9]||(t[9]=(...t)=>e.calculateCritTarget&&e.calculateCritTarget(...t))},null,544),[[r.Jo,e.critDmgTarget]])])])]),(0,l.Lk)("tr",null,[t[22]||(t[22]=(0,l.Lk)("th",null,"上限",-1)),(0,l.Lk)("td",null,[(0,l.Lk)("label",null,[(0,l.eW)((0,n.v_)(e.displayName("会心率"))+" ",1),(0,l.bo)((0,l.Lk)("input",{type:"number","onUpdate:modelValue":t[10]||(t[10]=t=>e.critRateLimit=t),min:"0",max:"100",onChange:t[11]||(t[11]=(...t)=>e.calculateCritTarget&&e.calculateCritTarget(...t))},null,544),[[r.Jo,e.critRateLimit]])])])]),(0,l.Lk)("tr",null,[(0,l.Lk)("th",null,(0,n.v_)(e.displayName("氷元素共鳴")),1),(0,l.Lk)("td",null,[(0,l.Lk)("label",null,[(0,l.eW)((0,n.v_)(e.displayName("会心率"))+" ",1),(0,l.bo)((0,l.Lk)("select",{"onUpdate:modelValue":t[12]||(t[12]=t=>e.cryoResonance=t),onChange:t[13]||(t[13]=(...t)=>e.calculateCritTarget&&e.calculateCritTarget(...t))},t[23]||(t[23]=[(0,l.Lk)("option",{value:"0"},null,-1),(0,l.Lk)("option",{value:"15"},"+15%",-1)]),544),[[r.u1,e.cryoResonance]])])])]),(0,l.Lk)("tr",null,[(0,l.Lk)("th",null,(0,n.v_)(e.displayName("氷風を彷徨う勇士")),1),(0,l.Lk)("td",null,[(0,l.Lk)("label",null,[(0,l.eW)((0,n.v_)(e.displayName("会心率"))+" ",1),(0,l.bo)((0,l.Lk)("select",{"onUpdate:modelValue":t[14]||(t[14]=t=>e.artifact4BS=t),onChange:t[15]||(t[15]=(...t)=>e.calculateCritTarget&&e.calculateCritTarget(...t))},t[24]||(t[24]=[(0,l.Lk)("option",{value:"0"},null,-1),(0,l.Lk)("option",{value:"20"},"+20%",-1),(0,l.Lk)("option",{value:"40"},"+40%",-1)]),544),[[r.u1,e.artifact4BS]])])])]),(0,l.Lk)("tr",null,[(0,l.Lk)("th",null,(0,n.v_)(e.displayName("ファントムハンター")),1),(0,l.Lk)("td",null,[(0,l.Lk)("label",null,[(0,l.eW)((0,n.v_)(e.displayName("会心率"))+" ",1),(0,l.bo)((0,l.Lk)("select",{"onUpdate:modelValue":t[16]||(t[16]=t=>e.artifact4PH=t),onChange:t[17]||(t[17]=(...t)=>e.calculateCritTarget&&e.calculateCritTarget(...t))},t[25]||(t[25]=[(0,l.Lk)("option",{value:"0"},null,-1),(0,l.Lk)("option",{value:"12"},"+12%",-1),(0,l.Lk)("option",{value:"24"},"+24%",-1),(0,l.Lk)("option",{value:"36"},"+36%",-1)]),544),[[r.u1,e.artifact4PH]])])])])])])]),t[27]||(t[27]=(0,l.Lk)("div",{class:"footer"},[(0,l.Lk)("hr")],-1))])}a(2681);var s=a(144),d=a(5682),C=(0,l.pM)({name:"CritTarget",components:{"vue-good-table":a(9950).A},setup(){const{displayName:e}=(0,d.A)(),t=e=>e?"あり":"なし",a=[{label:e("キャラ会心"),field:"characterCritScore",formatFn:t,thClass:"text-center",tdClass:"text-center"},{label:e("武器会心"),field:"weaponCritScore",formatFn:t,thClass:"text-center",tdClass:"text-center"},{label:e("武器レアリティ"),field:"weaponRarity",thClass:"text-center",tdClass:"text-center"},{label:e("武器会心スコア"),field:"weaponCritScore",thClass:"text-center",tdClass:"text-center"},{label:e("会心率"),field:"targetCritRate",width:"15%",thClass:"text-center",tdClass:"text-center"},{label:e("会心ダメージ"),field:"targetCritDmg",width:"15%",thClass:"text-center",tdClass:"text-center"},{label:e("期待値"),field:"expectedDmg",width:"15%",thClass:"text-center",tdClass:"text-center"}],r=(0,s.Kh)([{characterCritScore:0,weaponCritScore:0,weaponRarity:null,weaponBaseAtk:null,targetCritRate:"",targetCritDmg:"",expectedDmg:""},{characterCritScore:38.4,weaponCritScore:0,weaponRarity:null,weaponBaseAtk:null,targetCritRate:"",targetCritDmg:"",expectedDmg:""},{characterCritScore:0,weaponCritScore:36.8,weaponRarity:4,weaponBaseAtk:44,targetCritRate:"",targetCritDmg:"",expectedDmg:""},{characterCritScore:0,weaponCritScore:55.1,weaponRarity:4,weaponBaseAtk:42,targetCritRate:"",targetCritDmg:"",expectedDmg:""},{characterCritScore:0,weaponCritScore:73.6,weaponRarity:4,weaponBaseAtk:41,targetCritRate:"",targetCritDmg:"",expectedDmg:""},{characterCritScore:38.4,weaponCritScore:36.8,weaponRarity:4,weaponBaseAtk:44,targetCritRate:"",targetCritDmg:"",expectedDmg:""},{characterCritScore:38.4,weaponCritScore:55.1,weaponRarity:4,weaponBaseAtk:42,targetCritRate:"",targetCritDmg:"",expectedDmg:""},{characterCritScore:38.4,weaponCritScore:73.6,weaponRarity:4,weaponBaseAtk:41,targetCritRate:"",targetCritDmg:"",expectedDmg:""},{characterCritScore:0,weaponCritScore:44.1,weaponRarity:5,weaponBaseAtk:48,targetCritRate:"",targetCritDmg:"",expectedDmg:""},{characterCritScore:0,weaponCritScore:66.2,weaponRarity:5,weaponBaseAtk:46,targetCritRate:"",targetCritDmg:"",expectedDmg:""},{characterCritScore:0,weaponCritScore:88.2,weaponRarity:5,weaponBaseAtk:44,targetCritRate:"",targetCritDmg:"",expectedDmg:""},{characterCritScore:38.4,weaponCritScore:44.1,weaponRarity:5,weaponBaseAtk:48,targetCritRate:"",targetCritDmg:"",expectedDmg:""},{characterCritScore:38.4,weaponCritScore:66.2,weaponRarity:5,weaponBaseAtk:46,targetCritRate:"",targetCritDmg:"",expectedDmg:""},{characterCritScore:38.4,weaponCritScore:88.2,weaponRarity:5,weaponBaseAtk:44,targetCritRate:"",targetCritDmg:"",expectedDmg:""}]),l=[[50,100],[55,110],[60,120],[65,130],[70,140],[75,150],[80,160],[85,170]],n=(0,s.KR)(2);null!=localStorage.getItem("CritTarget")&&(n.value=Number(localStorage.getItem("CritTarget")));const o=(0,s.KR)(1),i=(0,s.KR)(2),c=(0,s.KR)(l[n.value][0]),u=(0,s.KR)(l[n.value][1]),p=(0,s.KR)(100),g=(0,s.KR)(0),C=(0,s.KR)(0),m=(0,s.KR)(0),k=()=>{r.forEach((e=>{let t=c.value,a=u.value,r=e.characterCritScore+e.weaponCritScore;g.value&&(r+=2*Number(g.value)),C.value&&(r+=2*Number(C.value)),m.value&&(r+=2*Number(m.value));const l=2*o.value+i.value;t+=r*(o.value/l),a+=r*(i.value/l);let n=p.value;t>n&&(a+=2*(t-n),t=n),e.targetCritRate=Math.round(10*t)/10+"%",e.targetCritDmg=Math.round(10*a)/10+"%";let s=0;s+=t/100*(100+a),s+=(100-t)/100*100,s=Math.round(10*s)/10,e.expectedDmg=s+"%"}))};k();const v=()=>{c.value=l[n.value][0],u.value=l[n.value][1],k(),localStorage.setItem("CritTarget",String(n.value))};return{displayName:e,columns:a,rows:r,critRateRatio:o,critDmgRatio:i,critRateTarget:c,critDmgTarget:u,critRateLimit:p,cryoResonance:g,artifact4BS:C,artifact4PH:m,TARGET_PRESET:l,targetPresetSelected:n,calculateCritTarget:k,targetPresetOnChange:v}}}),m=a(1241);const k=(0,m.A)(C,[["render",g],["__scopeId","data-v-4e5d2a89"]]);var v=k,f=a(2277);async function h(){(0,r.Ef)(v,{}).use(f.A).mount("#app")}h()}},t={};function a(r){var l=t[r];if(void 0!==l)return l.exports;var n=t[r]={id:r,loaded:!1,exports:{}};return e[r].call(n.exports,n,n.exports,a),n.loaded=!0,n.exports}a.m=e,function(){var e=[];a.O=function(t,r,l,n){if(!r){var o=1/0;for(p=0;p<e.length;p++){r=e[p][0],l=e[p][1],n=e[p][2];for(var i=!0,c=0;c<r.length;c++)(!1&n||o>=n)&&Object.keys(a.O).every((function(e){return a.O[e](r[c])}))?r.splice(c--,1):(i=!1,n<o&&(o=n));if(i){e.splice(p--,1);var u=l();void 0!==u&&(t=u)}}return t}n=n||0;for(var p=e.length;p>0&&e[p-1][2]>n;p--)e[p]=e[p-1];e[p]=[r,l,n]}}(),function(){a.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return a.d(t,{a:t}),t}}(),function(){a.d=function(e,t){for(var r in t)a.o(t,r)&&!a.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}}(),function(){a.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){a.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){a.nmd=function(e){return e.paths=[],e.children||(e.children=[]),e}}(),function(){a.j=760}(),function(){var e={760:0};a.O.j=function(t){return 0===e[t]};var t=function(t,r){var l,n,o=r[0],i=r[1],c=r[2],u=0;if(o.some((function(t){return 0!==e[t]}))){for(l in i)a.o(i,l)&&(a.m[l]=i[l]);if(c)var p=c(a)}for(t&&t(r);u<o.length;u++)n=o[u],a.o(e,n)&&e[n]&&e[n][0](),e[n]=0;return a.O(p)},r=self["webpackChunkgencalc"]=self["webpackChunkgencalc"]||[];r.forEach(t.bind(null,0)),r.push=t.bind(null,r.push.bind(r))}();var r=a.O(void 0,[504,996],(function(){return a(9520)}));r=a.O(r)})();
//# sourceMappingURL=CritTarget.057c793f.js.map