(function(){"use strict";var e={3550:function(e,t,a){a.d(t,{FX:function(){return w},GN:function(){return P},Ml:function(){return M},Nd:function(){return k},Uk:function(){return N},_j:function(){return I},bw:function(){return n},bx:function(){return h},dr:function(){return S},oN:function(){return c},tm:function(){return O}});a(7658);var n=a(8667),r=a(7722),l=a(1930),i=a(7849),s=a(2364),o=a(1003),c=a(5678),u=a(2124),d=a(3185),f=a(8970),p=a(6385),_=a(5093),v=a(9286),b=a(8846),m=a(7646);const h="data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7";function g(e){let t=null;return e.icon_url?t=e.icon_url:e.image?t=e.image:e.import&&(t=e.import.replace("data/","images/"),-1!=t.indexOf("characters/")&&(t=t.replace("characters/","characters/face/")),t=t.replace(/json$/,"png")),t}const y=[];Object.keys(n).forEach((e=>{const t=n[e];t.key=e,t.icon_url=g(t),y.push(t)}));const k={"片手剣":r,"両手剣":l,"長柄武器":i,"弓":s,"法器":o};Object.keys(k).forEach((e=>{const t=k[e];Object.keys(t).forEach((e=>{const a=t[e];a.key=e,a.icon_url=g(a)}))}));Object.keys(r).map((e=>r[e])),Object.keys(l).map((e=>l[e])),Object.keys(i).map((e=>i[e])),Object.keys(s).map((e=>s[e])),Object.keys(o).map((e=>o[e]));const I=[];Object.keys(c).forEach((e=>{const t=c[e];t.key=e,t.icon_url=g(t),I.push(t)}));Object.keys(u[5]),Object.keys(d);for(const j of Object.keys(f))for(const e of Object.keys(f[j]))f[j][e]>=1e3&&(f[j][e]=1/0);const w=Object.keys(f).map((e=>({key:e,...f[e]}))),E=(Object.keys(p).map((e=>({key:e,...p[e]}))),Object.keys(_).map((e=>({key:e,..._[e]}))),Object.keys(v).map((e=>({key:e,...v[e]}))),Object.keys(b).map((e=>({key:e,...b[e]}))),Object.keys(m).map((e=>({key:e,...m[e]}))),new Map);async function O(e){try{if(!E.has(e)){const t=n[e]["import"].replace(/^\//,""),a=await fetch(t).then((e=>e.json())),r=n[e].武器;a.通常攻撃.icon_url=A[r],E.set(e,a)}return E.get(e)}catch(t){throw console.error(e),t}}new Map;const P={"炎":"images/element_pyro.png","水":"images/element_hydro.png","風":"images/element_anemo.png","雷":"images/element_electro.png","草":"images/element_dendro.png","氷":"images/element_cryo.png","岩":"images/element_geo.png"},A={"片手剣":"images/characters/NormalAttack_sword.png","両手剣":"images/characters/NormalAttack_claymore.png","長柄武器":"images/characters/NormalAttack_polearm.png","弓":"images/characters/NormalAttack_bow.png","法器":"images/characters/NormalAttack_catalyst.png"},S={1:"star1-bg",2:"star2-bg",3:"star3-bg",4:"star4-bg",5:"star5-bg"},H=(new Map([["キャラクター",null],["レベル",null],["命ノ星座",0],["通常攻撃レベル",0],["元素スキルレベル",0],["元素爆発レベル",0],["武器",null],["武器レベル",0],["精錬ランク",0],["聖遺物セット効果1",null],["聖遺物セット効果2",null],["聖遺物メイン効果1",null],["聖遺物メイン効果2",null],["聖遺物メイン効果3",null],["聖遺物メイン効果4",null],["聖遺物メイン効果5",null],["聖遺物サブ効果HP",0],["聖遺物サブ効果攻撃力",0],["聖遺物サブ効果防御力",0],["聖遺物サブ効果元素熟知",0],["聖遺物サブ効果会心率",0],["聖遺物サブ効果会心ダメージ",0],["聖遺物サブ効果元素チャージ効率",0],["聖遺物サブ効果HPP",0],["聖遺物サブ効果攻撃力P",0],["聖遺物サブ効果防御力P",0],["聖遺物優先するサブ効果1",null],["聖遺物優先するサブ効果1上昇値",-1],["聖遺物優先するサブ効果1上昇回数",-1],["聖遺物優先するサブ効果2",null],["聖遺物優先するサブ効果2上昇値",-1],["聖遺物優先するサブ効果2上昇回数",-1],["聖遺物優先するサブ効果3",null],["聖遺物優先するサブ効果3上昇値",-1],["聖遺物優先するサブ効果3上昇回数",-1]]),new Map([["HP%","HP"],["元素熟知","熟"],["元素チャージ効率","ﾁｬ"],["会心率","率"],["会心ダメージ","ダ"],["与える治療効果","治"]]),new Map([["HP%","HP"],["攻撃力%","AT"],["防御力%","DF"],["元素熟知","EM"],["会心率","CR"],["会心ダメージ","CD"],["元素チャージ効率","ER"],["与える治療効果","HE"],["炎元素ダメージバフ","Py"],["水元素ダメージバフ","Hy"],["風元素ダメージバフ","An"],["雷元素ダメージバフ","El"],["草元素ダメージバフ","De"],["氷元素ダメージバフ","Cr"],["岩元素ダメージバフ","Ge"],["物理ダメージバフ","Ph"]]),new Map([["HP","HP"],["攻撃力","ATK"],["防御力","DEF"],["元素熟知","ElementalMastery"],["会心率","CritRate"],["会心ダメージ","CritDMG"],["元素チャージ効率","EnergyRecharge"],["炎元素ダメージバフ","Pyro"],["水元素ダメージバフ","Hydro"],["風元素ダメージバフ","Anemo"],["雷元素ダメージバフ","Electro"],["草元素ダメージバフ","Dendro"],["氷元素ダメージバフ","Cryo"],["岩元素ダメージバフ","Geo"],["物理ダメージバフ","Physical"],["与える治療効果","Healing"],["HP%","HPp"],["攻撃力%","ATKp"],["防御力%","DEFp"]])),T=new Map;H.forEach(((e,t)=>{T.set(e,t)}));const M=[{key:"",values:[7,7,7],counts:[0,0,0]},{key:"厳選初心者",values:[3,3,3],counts:[7,4,4]},{key:"厳選1ヶ月",values:[3,3,3],counts:[8,5,5]},{key:"厳選3ヶ月",values:[3,3,3],counts:[11,8,7]},{key:"日々石割り",values:[1,1,1],counts:[14,11,10]}],R={1:"flower_of_life",2:"plume_of_death",3:"sands_of_eon",4:"goblet_of_eonothem",5:"circlet_of_logos"};function N(e,t="1"){let a=h;return e in c&&(a=c[e].icon_url,a.startsWith("data:image/gif;")||(a=a.replace(/.png$/,""),a+="/"+R[String(t)]+".png")),a}},6826:function(e,t,a){var n=a(9242),r=a(3396),l=a(7139);const i=e=>((0,r.dD)("data-v-302bee06"),e=e(),(0,r.Cn)(),e),s={class:"base-container"},o=(0,r.uE)('<div class="pane1" data-v-302bee06><div class="header" data-v-302bee06><div class="top-left" data-v-302bee06><a href="./" data-v-302bee06>げんかるく</a></div><div class="top-right" data-v-302bee06><a href="https://enka.network/" data-v-302bee06>Enka.Network</a></div></div></div>',1),c={class:"pane2"},u={id:"uid"},d=["disabled"],f=i((()=>(0,r._)("span",{class:"material-symbols-outlined"}," send ",-1))),p=[f],_={class:"time"},v={class:"avoid"},b=i((()=>(0,r._)("br",null,null,-1))),m=i((()=>(0,r._)("br",null,null,-1))),h=i((()=>(0,r._)("span",{class:"material-symbols-outlined"}," send ",-1))),g=i((()=>(0,r._)("br",null,null,-1))),y=["href"],k=i((()=>(0,r._)("br",null,null,-1))),I={class:"pane3"},w=i((()=>(0,r._)("th",null,"UID",-1))),E=i((()=>(0,r._)("th",null,"NICKNAME",-1))),O=i((()=>(0,r._)("th",null,"AR",-1))),P=i((()=>(0,r._)("th",null,"WR",-1))),A={colspan:"2"},S={class:"character"},H=["src","alt"],T=["src"],M={key:0,class:"constellation"},R={class:"level"},N=["src"],j=["src"],D=["src"],C=["onClick","disabled"],L=["onClick","disabled"],U=i((()=>(0,r._)("span",{class:"material-symbols-outlined"}," save ",-1))),F=[U],q=i((()=>(0,r._)("label",{class:"toggle-switch no-border",for:"artifacts-toggle",style:{width:"40rem"}}," 聖遺物 - ARTIFACTS - ",-1))),G={key:0},x=["disabled"],B=(0,r.uE)('<div class="footer" data-v-302bee06><hr data-v-302bee06><h2 data-v-302bee06> DATA IMPORTER <span style="font-size:smaller;" data-v-302bee06>powered by</span> Enka.Network Ver.0.3.1 </h2> 《Enka.Network》様経由でゲーム内のキャラクターデータ取得して《げんかるく》に取り込むためのリンクを作成します。 <ol style="text-align:left;" data-v-302bee06><li data-v-302bee06> UIDを入力後、<span class="material-symbols-outlined" data-v-302bee06> send </span>をクリックしてください </li></ol><hr data-v-302bee06><p data-v-302bee06>下記の制約があります。</p><ol style="text-align:left;" data-v-302bee06><li data-v-302bee06>不可：げんかるくに実装されていないキャラクター</li><li data-v-302bee06>不可：げんかるくに実装されていない武器を装備しているデータ</li><li data-v-302bee06> 制限：げんかるくに実装されていない聖遺物セット効果はセット効果なし（NONE）に置き換えられる </li></ol><hr data-v-302bee06><dl class="history" data-v-302bee06><dt data-v-302bee06>0.3.0 (2023/02/07)</dt><dd data-v-302bee06> Enka Networkの新APIに対応 </dd><dt data-v-302bee06>0.2.4</dt><dd data-v-302bee06> 聖遺物の個別取込の準備 </dd><dt data-v-302bee06>0.2.3</dt><dd data-v-302bee06> 旅人対応。 </dd><dt data-v-302bee06>0.2.2</dt><dd data-v-302bee06> 突破していない武器を装備したキャラクターが含まれる場合に処理が止まる問題に対処。 </dd><dt data-v-302bee06>0.2.1</dt><dd data-v-302bee06> げんかるくを開く際のデータの受け渡し方法を変更（クエリストリングからセッションストレージへ） </dd><dt data-v-302bee06>0.2.0</dt><dd data-v-302bee06>Enka.NetworkのAPI(URL)変更に追従。機能復活。</dd></dl></div>',1);function z(e,t,a,i,f,U){const z=(0,r.up)("ArtifactItem");return(0,r.wg)(),(0,r.iD)("div",s,[o,(0,r._)("div",c,[(0,r._)("div",u,[(0,r._)("form",{onSubmit:t[2]||(t[2]=(0,n.iM)(((...t)=>e.submit&&e.submit(...t)),["prevent"]))},[(0,r._)("label",null,[(0,r.Uk)(" UID: "),(0,r.wy)((0,r._)("input",{"onUpdate:modelValue":t[0]||(t[0]=t=>e.uid=t),type:"text",maxlength:"9",placeholder:"ENTER UID",pattern:"[0-9]+"},null,512),[[n.nr,e.uid]])]),(0,r._)("button",{type:"submit",disabled:e.timer>0},p,8,d),(0,r._)("span",_,"  "+(0,l.zw)(e.timer),1),(0,r.wy)((0,r._)("div",v,[b,(0,r.Uk)(" 本ページからのEnka.Networkへのリクエストが失敗する場合"),m,(0,r.Uk)(" 下記URLをクリックして表示されたデータをテキストエリアに貼り付けて、再度"),h,(0,r.Uk)("をクリックして下さい。直接処理します。 "),g,(0,r._)("a",{href:"https://enka.network/api/uid/"+e.uid,target:"_blank"},(0,l.zw)("https://enka.network/api/uid/"+e.uid),9,y),k,(0,r.wy)((0,r._)("textarea",{"onUpdate:modelValue":t[1]||(t[1]=t=>e.uStr=t)},null,512),[[n.nr,e.uStr]])],512),[[n.F8,e.uid]])],32)])]),(0,r._)("div",I,[e.u?((0,r.wg)(),(0,r.iD)(r.HY,{key:0},[(0,r._)("table",null,[(0,r._)("tr",null,[w,(0,r._)("td",null,(0,l.zw)(e.u.uid),1)]),(0,r._)("tr",null,[E,(0,r._)("td",null,(0,l.zw)(e.u.playerInfo.nickname),1)]),(0,r._)("tr",null,[O,(0,r._)("td",null,(0,l.zw)(e.u.playerInfo.level),1)]),(0,r._)("tr",null,[P,(0,r._)("td",null,(0,l.zw)(e.u.playerInfo.worldLevel),1)]),(0,r._)("tr",null,[(0,r._)("td",A,[(0,r._)("p",null,(0,l.zw)(e.u.playerInfo.signature),1)])])]),(0,r._)("ul",null,[((0,r.wg)(!0),(0,r.iD)(r.HY,null,(0,r.Ko)(e.characterInfoList,((t,a)=>((0,r.wg)(),(0,r.iD)("li",{class:"character",key:a},[t.characterMaster?((0,r.wg)(),(0,r.iD)(r.HY,{key:0},[(0,r._)("div",S,[(0,r._)("img",{class:(0,l.C_)("character "+e.characterBgClass(t)),src:e.characterImgSrc(t),alt:e.displayName(t.characterMaster.key)},null,10,H),(0,r._)("img",{class:"vision",src:e.visionImgSrc(t),alt:"vision"},null,8,T),t.constellation?((0,r.wg)(),(0,r.iD)("div",M,(0,l.zw)(t.constellation),1)):(0,r.kq)("",!0)]),(0,r._)("div",R,"Lv."+(0,l.zw)(t.level),1),(0,r._)("img",{class:"weapon",src:e.weaponImgSrc(t),alt:"weapon"},null,8,N),(0,r._)("img",{class:"artifact-set",src:e.artifactSetImgSrc(t,0),alt:"artifact-set"},null,8,j),(0,r._)("img",{class:"artifact-set",src:e.artifactSetImgSrc(t,1),alt:"artifact-set"},null,8,D)],64)):(0,r.kq)("",!0),(0,r.kq)("",!0),(0,r._)("div",null,[(0,r._)("button",{onClick:t=>e.locate(a),disabled:e.buttonDisabled(a)}," OPEN GENCALC ",8,C)]),(0,r._)("div",null,[(0,r._)("button",{onClick:t=>e.save(a),disabled:e.saveButtonDisabled(a)},F,8,L)])])))),128))]),(0,r._)("div",null,[(0,r.wy)((0,r._)("input",{class:"hidden",id:"artifacts-toggle",type:"checkbox","onUpdate:modelValue":t[3]||(t[3]=t=>e.artifactsToggle=t)},null,512),[[n.e8,e.artifactsToggle]]),q]),e.artifactsToggle?((0,r.wg)(),(0,r.iD)("div",G,[(0,r._)("button",{type:"button",onClick:t[4]||(t[4]=(...t)=>e.artifactsSaveOnClick&&e.artifactsSaveOnClick(...t)),disabled:e.artifactsSaveButtonDisabled()}," SAVE ",8,x),(0,r._)("div",null,[((0,r.wg)(!0),(0,r.iD)(r.HY,null,(0,r.Ko)(e.artifacts,((e,t)=>((0,r.wg)(),(0,r.j4)(z,{key:t,artifact:e},null,8,["artifact"])))),128))])])):(0,r.kq)("",!0)],64)):(0,r.kq)("",!0)]),B])}a(7658);var K=a(4806),V=a.n(K),Y=a(4870),Q=a(3550),J=a(6552),W=a(2986),Z=a(5983),X=a(5378);const $={itemId:0,ascension:0,refine:1,level:1},ee={itemIds:[],rarities:[0,0,0,0,0],mainStats:["","","","",""],subStatObj:{}},te={1:"生の花",2:"死の羽",3:"時の砂",4:"空の杯",5:"理の冠"},ae=["EQUIP_BRACER","EQUIP_NECKLACE","EQUIP_SHOES","EQUIP_RING","EQUIP_DRESS"],ne={FIGHT_PROP_HP:"HP",FIGHT_PROP_ATTACK:"攻撃力",FIGHT_PROP_DEFENSE:"防御力",FIGHT_PROP_HP_PERCENT:"HP%",FIGHT_PROP_ATTACK_PERCENT:"攻撃力%",FIGHT_PROP_DEFENSE_PERCENT:"防御力%",FIGHT_PROP_ELEMENT_MASTERY:"元素熟知",FIGHT_PROP_CRITICAL:"会心率",FIGHT_PROP_CRITICAL_HURT:"会心ダメージ",FIGHT_PROP_CHARGE_EFFICIENCY:"元素チャージ効率",FIGHT_PROP_FIRE_ADD_HURT:"炎元素ダメージバフ",FIGHT_PROP_WATER_ADD_HURT:"水元素ダメージバフ",FIGHT_PROP_WIND_ADD_HURT:"風元素ダメージバフ",FIGHT_PROP_ELEC_ADD_HURT:"雷元素ダメージバフ",FIGHT_PROP_GRASS_ADD_HURT:"草元素ダメージバフ",FIGHT_PROP_ICE_ADD_HURT:"氷元素ダメージバフ",FIGHT_PROP_ROCK_ADD_HURT:"岩元素ダメージバフ",FIGHT_PROP_PHYSICAL_ADD_HURT:"物理ダメージバフ",FIGHT_PROP_HEAL_ADD:"与える治療効果"};var re=(0,r.aZ)({name:"App",components:{ArtifactItem:X.Z},setup(){const{displayName:e}=(0,J.Z)();let t,a,n,l;async function i(){const e=await Promise.all(["data/HoyoAvatarMaster.json","data/HoyoWeaponMaster.json","data/HoyoArtifactMaster.json","data/HoyoSkillMaster.json"].map((e=>fetch(e).then((e=>e.json())))));t=e[0],a=e[1],n=e[2],l=e[3]}i();const s=(0,Y.iH)(""),o=(0,Y.iH)(0);let c;const u=(0,Y.iH)(""),d=(0,Y.qj)({uid:"",playerInfo:{nickname:""}}),f=(0,Y.qj)([]),p=(0,Y.iH)(!1);function _(e){e=Math.trunc(e/10);const t=n.filter((t=>t.id==e));return t.length?t[0]:void 0}function v(e){const t=Q._j.filter((t=>t?.artifact_list?.includes(e)));return t.length?t[0].key:void 0}function b(e){const t=[];for(const a of e.equipList)if("ITEM_RELIQUARY"==a.flat.itemType){const e=_(a.itemId);if(!e)continue;const n=v(e.name);if(!n)continue;const r={name:e.name,rarity:a.flat.rankLevel,setname:n,cat_id:e.reliquary_cat_id,mainStat:ne[a.flat.reliquaryMainstat.mainPropId],mainStatValue:a.flat.reliquaryMainstat.statValue,subStats:[]};for(const t of a.flat.reliquarySubstats){const e={name:ne[t.appendPropId],value:t.statValue};r.subStats.push(e)}t.push(r)}return t}const m=(0,r.Fl)((()=>{const e=[];if(d?.avatarInfoList?.length)for(const t of d.avatarInfoList)e.push(...b(t));return e}));async function h(e,r){const i=e.avatarInfoList[r],s={avatarId:i.avatarId,level:e.playerInfo.showAvatarInfoList[r].level,ascension:i.propMap["1002"]?.ival??0,constellation:i.talentIdList?.length??0,skillLevelList:[],weapon:V().cloneDeep($),reliq:V().cloneDeep(ee),artifacts:[]};Object.keys(i.skillLevelMap).forEach((e=>{s.skillLevelList.push([e,i.skillLevelMap[e]])}));for(const t of i.equipList)if("ITEM_RELIQUARY"==t.flat.itemType){s.reliq.itemIds.push(t.itemId);const e=ae.indexOf(t.flat.equipType);s.reliq.rarities[e]=t.flat.rankLevel,s.reliq.mainStats[e]=t.flat.reliquaryMainstat.mainPropId;for(const a of t.flat.reliquarySubstats)a.appendPropId in s.reliq.subStatObj?s.reliq.subStatObj[a.appendPropId]+=a.statValue:s.reliq.subStatObj[a.appendPropId]=a.statValue}else"ITEM_WEAPON"==t.flat.itemType&&(s.weapon.itemId=t.itemId,"affixMap"in t.weapon?Object.keys(t.weapon.affixMap).forEach((e=>{s.weapon.refine=t.weapon.affixMap[e]+1})):s.weapon.refine=1,s.weapon.level=t.weapon.level,t.weapon.promoteLevel?s.weapon.ascension=t.weapon.promoteLevel:s.weapon.ascension=1);s.artifacts.push(...b(i));const o=t.filter((e=>e.id==s.avatarId));if(o.length){let e=o[0].name;if(o.length>1){const t=l.filter((e=>e.avatar_id==s.avatarId));let a;for(a of t)if(a.skill_list.filter((e=>String(e.id)==s.skillLevelList[0][0])).length)break;if(a)for(const n of Object.keys(Q.bw).filter((e=>e.startsWith("旅人")))){const t=await(0,Q.tm)(n),r=t.通常攻撃.名前;if(a.skill_list.filter((e=>e.name==r)).length){e=n;break}}}s.characterMaster=Q.bw[e];const t=a.filter((e=>e.id==s.weapon.itemId));t.length&&(s.weaponMaster=Q.Nd[s.characterMaster["武器"]][t[0].name])}const c=[void 0,void 0],u=[];s.reliq.itemIds.filter((e=>e)).forEach((e=>{e=Math.trunc(e/10);const t=n.filter((t=>t.id==e));t.length&&u.push(t[0].name)}));const d={};return Object.keys(Q.oN).forEach((e=>{const t=Q.oN[e];"artifact_list"in t&&u.forEach((a=>{t.artifact_list.includes(a)&&(e in d?d[e]++:d[e]=1)}))})),Object.keys(d).forEach((e=>{if(d[e]>=4)c[0]=Q.oN[e],c[1]=Q.oN[e];else if(d[e]>=2){const t=c.indexOf(void 0);-1!=t&&(c[t]=Q.oN[e])}})),s.artifactSetMasters=c,s.savedata=await g(s),s}async function g(e){const t={};t["キャラクター"]=e.characterMaster?.key,t["レベル"]=e.level+(W.iU[e.ascension][0]==e.level?"+":""),t["命ノ星座"]=e.constellation;const a=l.filter((t=>t.avatar_id==e.avatarId));if(a.length){const n=await(0,Q.tm)(t["キャラクター"]);if(e.skillLevelList.forEach((e=>{let r;for(const t of a){const a=t.skill_list.filter((t=>t.id==Number(e[0])));if(a.length){r=a[0];break}}r&&(n.通常攻撃.名前==r.name?t["通常攻撃レベル"]=e[1]:n.元素スキル.名前==r.name?t["元素スキルレベル"]=e[1]:n.元素爆発.名前==r.name&&(t["元素爆発レベル"]=e[1]))})),t["命ノ星座"]>=3){const e=n.命ノ星座["3"]?.説明;e&&(-1!=e.indexOf(n.元素スキル.名前)?t["元素スキルレベル"]+=3:-1!=e.indexOf(n.元素爆発.名前)&&(t["元素爆発レベル"]+=3))}if(t["命ノ星座"]>=5){const e=n.命ノ星座["5"]?.説明;e&&(-1!=e.indexOf(n.元素スキル.名前)?t["元素スキルレベル"]+=3:-1!=e.indexOf(n.元素爆発.名前)&&(t["元素爆発レベル"]+=3))}}t["武器"]=e.weaponMaster?.key,t["武器レベル"]=e.weapon.level+(W.iU[e.weapon.ascension][0]==e.weapon.level?"+":""),t["精錬ランク"]=e.weapon.refine,e.artifactSetMasters?(t["聖遺物セット効果1"]=e.artifactSetMasters[0]?.key??"NONE",t["聖遺物セット効果2"]=e.artifactSetMasters[1]?.key??"NONE"):(t["聖遺物セット効果1"]="NONE",t["聖遺物セット効果2"]="NONE");for(let n=0;n<5;n++)e.reliq.mainStats[n]?t["聖遺物メイン効果"+(n+1)]=e.reliq.rarities[n]+"_"+ne[e.reliq.mainStats[n]]:t["聖遺物メイン効果"+(n+1)]=null;return W.Hx.forEach((e=>{e="聖遺物サブ効果"+e.replace("%","P"),t[e]=0})),Object.keys(e.reliq.subStatObj).forEach((a=>{const n="聖遺物サブ効果"+ne[a].replace("%","P");t[n]=e.reliq.subStatObj[a]})),e.artifacts&&(t["artifact_list"]=e.artifacts),t}const y=async()=>{if(!s.value&&!s.value.match(/^[0-9]{9}$/))return;const e="https://enka.network/api/uid/"+s.value;fetch(e).then((e=>e.json())).then((async e=>{console.log(e),(0,Z.fX)(d,e),k()})).catch((e=>{alert("Enka.Netrowkへのリクエストで異常が発生しました!"),console.error(e),u.value&&((0,Z.fX)(d,JSON.parse(u.value)),k())})).catch((e=>{alert("JSON parse error! "+e)}))};async function k(){const e=[];for(let t=0;t<d.playerInfo.showAvatarInfoList.length;t++)e.push(await h(d,t));f.splice(0,f.length,...e),P(),d.ttl&&(o.value=Number(d.ttl),c=window.setInterval((function(){S()}),1e3))}const I=e=>{const t=f[e].savedata;(0,W.Ac)(t.キャラクター,void 0,t),window.open("./","_blank")},w=e=>{const t="構成_"+f[e].characterMaster.key;localStorage.setItem(t,JSON.stringify(f[e].savedata)),O(e)},E=e=>!f[e].characterMaster||!f[e].weaponMaster,O=e=>{let t=E(e);if(!t){const a="構成_"+f[e].characterMaster.key;if(a in localStorage){const n=JSON.stringify(f[e].savedata),r=localStorage[a];t=n==r}}return t},P=()=>{if(0===m.value.length)return!0;const e="artifact_list";let t=[];e in localStorage&&(t=JSON.parse(localStorage[e]));for(const a of m.value)if(0==t.filter((e=>V().isEqual(e,a))).length)return!1;return!0},A=()=>{const e="artifact_list";let t=[];e in localStorage&&(t=JSON.parse(localStorage[e]));const a=V().cloneDeep(t);for(const n of m.value)t.filter((e=>V().isEqual(e,n))).length>0||a.push(n);localStorage[e]=JSON.stringify(a),P()},S=()=>{o.value>0?o.value--:clearInterval(c)},H=e=>e.characterMaster?e.characterMaster.icon_url:Q.bx,T=e=>e.characterMaster?Q.dr[e.characterMaster.レアリティ]:Q.bx,M=e=>e.characterMaster?Q.GN[e.characterMaster.元素]:Q.bx,R=e=>e.weaponMaster?e.weaponMaster.icon_url:Q.bx,N=(e,t)=>{let a=Q.bx;if(e.artifactSetMasters){const n=e.artifactSetMasters[t];n&&(a=(0,Q.Uk)(n.key))}return a};return{displayName:e,uid:s,timer:o,uStr:u,u:d,characterInfoList:f,submit:y,locate:I,save:w,buttonDisabled:E,saveButtonDisabled:O,artifactsSaveOnClick:A,artifactsSaveButtonDisabled:P,characterImgSrc:H,characterBgClass:T,visionImgSrc:M,weaponImgSrc:R,artifactSetImgSrc:N,artifactsToggle:p,artifacts:m,RELIQUARY_CAT_NAME:te}}}),le=a(89);const ie=(0,le.Z)(re,[["render",z],["__scopeId","data-v-302bee06"]]);var se=ie,oe=a(2540);async function ce(){(0,n.ri)(se,{}).use(oe.Z).mount("#app")}ce()}},t={};function a(n){var r=t[n];if(void 0!==r)return r.exports;var l=t[n]={id:n,loaded:!1,exports:{}};return e[n].call(l.exports,l,l.exports,a),l.loaded=!0,l.exports}a.m=e,function(){var e=[];a.O=function(t,n,r,l){if(!n){var i=1/0;for(u=0;u<e.length;u++){n=e[u][0],r=e[u][1],l=e[u][2];for(var s=!0,o=0;o<n.length;o++)(!1&l||i>=l)&&Object.keys(a.O).every((function(e){return a.O[e](n[o])}))?n.splice(o--,1):(s=!1,l<i&&(i=l));if(s){e.splice(u--,1);var c=r();void 0!==c&&(t=c)}}return t}l=l||0;for(var u=e.length;u>0&&e[u-1][2]>l;u--)e[u]=e[u-1];e[u]=[n,r,l]}}(),function(){a.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return a.d(t,{a:t}),t}}(),function(){a.d=function(e,t){for(var n in t)a.o(t,n)&&!a.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})}}(),function(){a.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){a.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){a.nmd=function(e){return e.paths=[],e.children||(e.children=[]),e}}(),function(){a.j=27}(),function(){var e={27:0};a.O.j=function(t){return 0===e[t]};var t=function(t,n){var r,l,i=n[0],s=n[1],o=n[2],c=0;if(i.some((function(t){return 0!==e[t]}))){for(r in s)a.o(s,r)&&(a.m[r]=s[r]);if(o)var u=o(a)}for(t&&t(n);c<i.length;c++)l=i[c],a.o(e,l)&&e[l]&&e[l][0](),e[l]=0;return a.O(u)},n=self["webpackChunkgencalc"]=self["webpackChunkgencalc"]||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))}();var n=a.O(void 0,[998,64],(function(){return a(6826)}));n=a.O(n)})();
//# sourceMappingURL=EnkaNetwork.ba6962e9.js.map