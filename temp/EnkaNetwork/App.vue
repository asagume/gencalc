<template>
  <div class="base-container">
    <div class="pane1">
      <div class="header">
        <div class="top-left"><a href="./">GENCALC</a></div>
        <div class="top-right"><a href="https://enka.shinshin.moe/">Enka.Network</a></div>
        <p>&nbsp;</p>
        <h3>DATA IMPORTER <span style="font-size: smaller">powered by</span> Enka.Network</h3>
      </div>
    </div>

    <div class="pane2">
      <div id="uid">
        <form @submit.prevent="submit">
          <label>
            UID:
            <input v-model="uid" type="text" maxlength="9" placeholder="ENTER UID" pattern="[0-9]+">
          </label>
          <button type="submit" :disabled="timer > 0">
            <span class="material-symbols-outlined"> send </span></button>
          <span class="time">&emsp; {{ timer }}</span>
        </form>
      </div>
    </div>

    <div class="pane3">
      <template v-if="u">
        <table>
          <tr>
            <th>UID</th>
            <td>{{ u.uid }}</td>
          </tr>
          <tr>
            <th>NICKNAME</th>
            <td>{{ u.playerInfo.nickname }}</td>
          </tr>
          <tr>
            <th>AR</th>
            <td>{{ u.playerInfo.level }}</td>
          </tr>
          <tr>
            <th>WR</th>
            <td>{{ u.playerInfo.worldLevel }}</td>
          </tr>
          <tr>
            <td colspan="2">
              <p>{{ u.playerInfo.signature }}</p>
            </td>
          </tr>
        </table>

        <ul>
          <li class="character" v-for="(characterInfo, index) in characterInfoList" :key="index">
            <template v-if="characterInfo.characterMaster">
              <div class="character">
                <img :class="'character ' + characterBgClass(characterInfo)" :src="characterImgSrc(characterInfo)"
                  :alt="displayName(characterInfo.characterMaster.key)">
                <img class="vision" :src="visionImgSrc(characterInfo)" alt="vision">
                <p class="constellation">{{ characterInfo.constellation }}</p>
              </div>
              <div class="level">Lv.{{ characterInfo.level }}</div>
              <img class="weapon" :src="weaponImgSrc(characterInfo)" alt="weapon">
              <img class="artifact-set" :src="artifactSetImgSrc(characterInfo, 0)" alt="artifact-set">
              <img class="artifact-set" :src="artifactSetImgSrc(characterInfo, 1)" alt="artifact-set">
            </template>
            <div v-if="false">
              {{characterInfo.savedata}}
            </div>
            <div>
              <button @click="locate(index)" :disabled="buttonDisabled(index)">
                OPEN GENCALC
              </button>
            </div>
            <div>
              <button @click="save(index)" :disabled="saveButtonDisabled(index)">
                <span class="material-symbols-outlined"> save </span>
              </button>
            </div>
          </li>
        </ul>
      </template>
    </div>

    <div class="footer">
      <hr />

      《Enka.Network》様経由でゲーム内のキャラクターデータ取得して《げんかるく》に取り込むためのリンクを作成します。
      <ol style="text-align: left;">
        <li>UIDを入力後、<span class="material-symbols-outlined"> send </span>をクリックしてください</li>
      </ol>
      <hr>
      <p>下記の制約があります。</p>
      <ol style="text-align: left;">
        <li>不可：旅人</li>
        <li>不可：げんかるくに実装されていないキャラクター</li>
        <li>不可：げんかるくに実装されていない武器を装備しているデータ</li>
        <li>制限：げんかるくに実装されていない聖遺物セット効果はセット効果なし（NONE）に置き換えられる</li>
      </ol>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import {
  ARTIFACT_SET_MASTER,
  CHARACTER_MASTER,
  ELEMENT_IMG_SRC,
  IMG_SRC_DUMMY,
  STAR_BACKGROUND_IMAGE_CLASS,
  TAnyObject,
  TArtifactSetEntry,
  TCharacterEntry,
  TCharacterKey,
  TWeaponEntry,
  WEAPON_MASTER,
} from "@/master";
import CompositionFunction from "@/components/CompositionFunction.vue";
import { makeSharedata, 突破レベルレベルARRAY } from "@/input";
import { deepcopy, overwriteObject } from "@/common";

type THoyoAvatarMasterValue = {
  id: number,
  name: string,
  icon: string,
  weapon_cat_id: number,
  avatar_level: number,
  element_attr_id: number,
  max_level: number,
};
type THoyoAvatarMaster = THoyoAvatarMasterValue[];

type THoyoWeaponMasterValue = {
  id: number,
  name: string,
  icon: string,
  weapon_cat_id: number,
  weapon_level: number,
  max_level: number,
};
type THoyoWeaponMaster = THoyoWeaponMasterValue[];

type THoyoArtifactMasterValue = {
  id: number,
  name: string,
  icon: string,
  reliquary_cat_id: number,
  reliquary_level: number,
  max_level: number,
};
type THoyoArtifactMaster = THoyoArtifactMasterValue[];

const WEAPON_INFO_TEMPLATE = {
  itemId: 0,
  ascension: 0,
  refine: 1,
  level: 1,
};

type TReliqStat = {
  [key: string]: number,
}

const RELIQ_INFO_TEMPLATE = {
  itemIds: [] as number[],
  rarities: [0, 0, 0, 0, 0],
  mainStats: ['', '', '', '', ''],
  subStatObj: {} as TReliqStat,
};

const CHARACTER_INFO_TEMPLATE = {
  avatarId: 0,
  level: 1,
  ascension: 0,
  constellation: 0,
  skillLevelList: [] as number[],
  weapon: WEAPON_INFO_TEMPLATE,
  reliq: RELIQ_INFO_TEMPLATE,
};
type TCharacterInfo = typeof CHARACTER_INFO_TEMPLATE & {
  characterMaster?: TCharacterEntry,
  weaponMaster?: TWeaponEntry,
  artifactSetMasters?: [TArtifactSetEntry?, TArtifactSetEntry?],
  savedata?: TAnyObject,
};

const RELIQ_EQUIP_TYPE = [
  'EQUIP_BRACER',   // 生の花
  'EQUIP_NECKLACE', // 死の羽
  'EQUIP_SHOES',    // 時の砂
  'EQUIP_RING',     // 空の杯
  'EQUIP_DRESS'     // 理の冠
];

const FIGHT_PROP_STAT_OBJ = {
  FIGHT_PROP_HP: 'HP',
  FIGHT_PROP_ATTACK: '攻撃力',
  FIGHT_PROP_DEFENSE: '防御力',
  FIGHT_PROP_HP_PERCENT: 'HP%',
  FIGHT_PROP_ATTACK_PERCENT: '攻撃力%',
  FIGHT_PROP_DEFENSE_PERCENT: '防御力%',
  FIGHT_PROP_ELEMENT_MASTERY: '元素熟知',
  FIGHT_PROP_CRITICAL: '会心率',
  FIGHT_PROP_CRITICAL_HURT: '会心ダメージ',
  FIGHT_PROP_CHARGE_EFFICIENCY: '元素チャージ効率',
  FIGHT_PROP_FIRE_ADD_HURT: '炎元素ダメージバフ',
  FIGHT_PROP_WATER_ADD_HURT: '水元素ダメージバフ',
  FIGHT_PROP_WIND_ADD_HURT: '風元素ダメージバフ',
  FIGHT_PROP_ELEC_ADD_HURT: '雷元素ダメージバフ',
  FIGHT_PROP_GRASS_ADD_HURT: '草元素ダメージバフ',
  FIGHT_PROP_ICE_ADD_HURT: '氷元素ダメージバフ',
  FIGHT_PROP_ROCK_ADD_HURT: '岩元素ダメージバフ',
  FIGHT_PROP_PHYSICAL_ADD_HURT: '物理ダメージバフ',
  FIGHT_PROP_HEAL_ADD: '与える治療効果',
};

export default defineComponent({
  name: "App",
  setup() {
    const { displayName } = CompositionFunction();

    let HoyoAvatarMaster: THoyoAvatarMaster;
    let HoyoWeaponMaster: THoyoWeaponMaster;
    let HoyoArtifactMaster: THoyoArtifactMaster;

    async function onLoad() {
      const responses = await Promise.all([
        'data/HoyoAvatarMaster.json',
        'data/HoyoWeaponMaster.json',
        'data/HoyoArtifactMaster.json',
      ].map(s => fetch(s).then(resp => resp.json())));
      HoyoAvatarMaster = responses[0];
      HoyoWeaponMaster = responses[1];
      HoyoArtifactMaster = responses[2];
    }
    onLoad();

    const uid = ref('');
    const timer = ref(0);
    let timerObj: number | undefined;
    const u = reactive({
      uid: '',
      playerInfo: {
        nickname: ''
      },
    } as TAnyObject);
    const characterInfoList = reactive([] as any[]);

    function makeCharacterInfo(u: TAnyObject, index: number) {
      const result: TCharacterInfo = {
        avatarId: u.avatarInfoList[index].avatarId,
        level: u.playerInfo.showAvatarInfoList[index].level,
        ascension: u.avatarInfoList[index].propMap['1002']?.ival ?? 0,
        constellation: u.avatarInfoList[index].talentIdList?.length ?? 0,
        skillLevelList: [] as number[],
        weapon: deepcopy(WEAPON_INFO_TEMPLATE),
        reliq: deepcopy(RELIQ_INFO_TEMPLATE),
      };

      Object.keys(u.avatarInfoList[index].skillLevelMap).forEach(key => {
        result.skillLevelList.push(u.avatarInfoList[index].skillLevelMap[key]);
      });
      if ('proudSkillExtraLevelMap' in u.avatarInfoList[index]) {
        Object.keys(u.avatarInfoList[index].proudSkillExtraLevelMap).forEach(key => {
          if (key.endsWith('2')) {    // 元素スキル？
            result.skillLevelList[1] += u.avatarInfoList[index].proudSkillExtraLevelMap[key];
          } else if (key.endsWith('9')) { // 元素爆発？
            result.skillLevelList[2] += u.avatarInfoList[index].proudSkillExtraLevelMap[key];
          }
        });
      }

      for (const equip of u.avatarInfoList[index].equipList) {
        if (equip.flat.itemType == 'ITEM_RELIQUARY') {   // 聖遺物
          result.reliq.itemIds.push(equip.itemId);
          // メイン効果
          const reliqIndex = RELIQ_EQUIP_TYPE.indexOf(equip.flat.equipType);
          result.reliq.rarities[reliqIndex] = equip.flat.rankLevel;
          result.reliq.mainStats[reliqIndex] = equip.flat.reliquaryMainstat.mainPropId;

          // サブ効果
          for (const reliquarySubstat of equip.flat.reliquarySubstats) {
            if (reliquarySubstat.appendPropId in result.reliq.subStatObj) {
              result.reliq.subStatObj[reliquarySubstat.appendPropId] += reliquarySubstat.statValue;
            } else {
              result.reliq.subStatObj[reliquarySubstat.appendPropId] = reliquarySubstat.statValue;
            }
          }
        } else if (equip.flat.itemType == 'ITEM_WEAPON') {    // 武器
          result.weapon.itemId = equip.itemId;
          if ('affixMap' in equip.weapon) {
            Object.keys(equip.weapon.affixMap).forEach(key => {
              result.weapon.refine = equip.weapon.affixMap[key] + 1;   // 精錬ランク？
            });
          }
          result.weapon.level = equip.weapon.level;
          result.weapon.ascension = equip.weapon.promoteLevel;
        }
      }

      const avatarWork = HoyoAvatarMaster.filter(s => s.id == result.avatarId);
      if (avatarWork.length) {
        result.characterMaster = CHARACTER_MASTER[avatarWork[0].name as TCharacterKey] as TCharacterEntry;

        const weaponWork = HoyoWeaponMaster.filter(s => s.id == result.weapon.itemId);
        if (weaponWork.length) {
          result.weaponMaster = (WEAPON_MASTER as any)[result.characterMaster['武器']][weaponWork[0].name];
        }
      }

      const artifactSetMasters: [(TArtifactSetEntry | undefined), (TArtifactSetEntry | undefined)] = [undefined, undefined];
      const artifactNames: string[] = [];
      result.reliq.itemIds.filter(s => s).forEach(itemId => {
        itemId = Math.trunc(itemId / 10)
        const work = HoyoArtifactMaster.filter(s => s.id == itemId);
        if (work.length) {
          artifactNames.push(work[0].name);
        }
      });
      const artifactSetWork: TAnyObject = {};
      Object.keys(ARTIFACT_SET_MASTER).forEach(key => {
        const entry = (ARTIFACT_SET_MASTER as any)[key];
        if ('artifact_list' in entry) {
          artifactNames.forEach(artifactName => {
            if (entry.artifact_list.includes(artifactName)) {
              if (key in artifactSetWork) {
                artifactSetWork[key]++;
              } else {
                artifactSetWork[key] = 1;
              }
            }
          })
        }
      });
      Object.keys(artifactSetWork).forEach(key => {
        if (artifactSetWork[key] >= 4) {
          artifactSetMasters[0] = (ARTIFACT_SET_MASTER as any)[key] as TArtifactSetEntry;
          artifactSetMasters[1] = (ARTIFACT_SET_MASTER as any)[key] as TArtifactSetEntry;
        } else if (artifactSetWork[key] >= 2) {
          const index = artifactSetMasters.indexOf(undefined);
          if (index != -1) {
            artifactSetMasters[index] = (ARTIFACT_SET_MASTER as any)[key] as TArtifactSetEntry;
          }
        }
      });
      result.artifactSetMasters = artifactSetMasters;

      result.savedata = makeSavedata(result);

      return result;
    }

    function makeSavedata(characterInfo: TCharacterInfo) {
      const result = {} as TAnyObject;

      // キャラクター
      result['キャラクター'] = characterInfo.characterMaster?.key;
      // レベル
      result['レベル'] = characterInfo.level + (突破レベルレベルARRAY[characterInfo.ascension][0] == characterInfo.level ? '+' : '');
      // 命ノ星座
      result['命ノ星座'] = characterInfo.constellation;
      // 通常攻撃レベル
      result['通常攻撃レベル'] = characterInfo.skillLevelList[0];
      // 元素スキルレベル
      result['元素スキルレベル'] = characterInfo.skillLevelList[1];
      // 元素爆発レベル
      result['元素爆発レベル'] = characterInfo.skillLevelList[2];
      // 武器
      result['武器'] = characterInfo.weaponMaster?.key;
      // 武器レベル
      result['武器レベル'] = characterInfo.weapon.level + (突破レベルレベルARRAY[characterInfo.weapon.ascension][0] == characterInfo.weapon.level ? '+' : '');
      // 精錬ランク
      result['精錬ランク'] = characterInfo.weapon.refine;
      // 聖遺物セット効果
      if (characterInfo.artifactSetMasters) {
        result['聖遺物セット効果1'] = characterInfo.artifactSetMasters[0]?.key ?? 'NONE';
        result['聖遺物セット効果2'] = characterInfo.artifactSetMasters[1]?.key ?? 'NONE';
      } else {
        result['聖遺物セット効果1'] = 'NONE';
        result['聖遺物セット効果2'] = 'NONE';
      }
      // 聖遺物メイン効果
      for (let i = 0; i < 5; i++) {
        if (characterInfo.reliq.mainStats[i]) {
          result['聖遺物メイン効果' + (i + 1)] = characterInfo.reliq.rarities[i] + '_' + (FIGHT_PROP_STAT_OBJ as any)[characterInfo.reliq.mainStats[i]];
        }
      }
      // 聖遺物サブ効果
      Object.keys(characterInfo.reliq.subStatObj).forEach(prop => {
        const stat = '聖遺物サブ効果' + (FIGHT_PROP_STAT_OBJ as any)[prop].replace('%', 'P');
        result[stat] = characterInfo.reliq.subStatObj[prop];
      });

      return result;
    }

    const submit = () => {
      if (!uid.value && !uid.value.match(/^[0-9]{9}$/)) return;
      // const url = 'https://enka.network/u/' + uid.value + '/__data.json';
      const url = 'data/__data.json';
      fetch(url).then(resp => resp.json()).then(json => {
        console.log(json);
        overwriteObject(u, json);

        const work: any[] = [];
        for (let i = 0; i < u.playerInfo.showAvatarInfoList.length; i++) {
          work.push(makeCharacterInfo(u, i));
        }
        characterInfoList.splice(0, characterInfoList.length, ...work);

        if (json.ttl) {
          timer.value = Number(json.ttl);
          timerObj = setInterval(function () { count() }, 1000);
        }
      });
    };

    const locate = (index: number) => {
      const sharedata = makeSharedata(characterInfoList[index].savedata);
      window.open('./?allin=' + sharedata, '_blank');
    };

    const save = (index: number) => {
      const storageKey = '構成_' + characterInfoList[index].characterMaster.key;
      localStorage.setItem(storageKey, JSON.stringify(characterInfoList[index].savedata));
    };

    const buttonDisabled = (index: number) => {
      return !characterInfoList[index].characterMaster || !characterInfoList[index].weaponMaster;
    };

    const saveButtonDisabled = (index: number): boolean => {
      let result = buttonDisabled(index);
      if (!result) {
        const storageKey = '構成_' + characterInfoList[index].characterMaster.key;
        if (storageKey in localStorage) {
          const newValue = JSON.stringify(characterInfoList[index].savedata);
          const curValue = localStorage[storageKey];
          result = newValue == curValue;
        }
      }
      return result;
    };

    const count = () => {
      if (timer.value > 0) {
        timer.value--;
      } else {
        clearInterval(timerObj);
      }
    };

    const characterImgSrc = (characterInfo: TCharacterInfo) => {
      if (characterInfo.characterMaster) {
        return characterInfo.characterMaster.icon_url;
      }
      return IMG_SRC_DUMMY;
    };

    const characterBgClass = (characterInfo: TCharacterInfo) => {
      if (characterInfo.characterMaster) {
        return STAR_BACKGROUND_IMAGE_CLASS[characterInfo.characterMaster.レアリティ];
      }
      return IMG_SRC_DUMMY;
    };

    const visionImgSrc = (characterInfo: TCharacterInfo) => {
      if (characterInfo.characterMaster) {
        return ELEMENT_IMG_SRC[characterInfo.characterMaster.元素];
      }
      return IMG_SRC_DUMMY;
    };

    const weaponImgSrc = (characterInfo: TCharacterInfo) => {
      if (characterInfo.weaponMaster) {
        return characterInfo.weaponMaster.icon_url;
      }
      return IMG_SRC_DUMMY;
    };

    const artifactSetImgSrc = (characterInfo: TCharacterInfo, index: number) => {
      let result = IMG_SRC_DUMMY;
      if (characterInfo.artifactSetMasters) {
        const work = characterInfo.artifactSetMasters[index];
        if (work) {
          result = work.icon_url;
        }
      }
      return result;
    };

    return {
      displayName,

      uid,
      timer,
      u,
      characterInfoList,

      submit,
      locate,
      save,
      buttonDisabled,
      saveButtonDisabled,

      characterImgSrc,
      characterBgClass,
      visionImgSrc,
      weaponImgSrc,
      artifactSetImgSrc,
    };
  },
});
</script>
<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

.base-container {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto auto;
  grid-template-areas:
    "pane1"
    "pane2"
    "pane3"
    "footer";
}

h3 {
    margin-left: auto;
    margin-right: auto;
    width: 90%;
    color: #e8d14e;
    text-shadow: 0 0 5px black;
    border: 3px double gray;
    border-radius: 15px;
    padding-top: 3px;
    padding-bottom: 3px;
    background-color: #333;
}
</style>
<style scoped>
.header {
  position: relative;
}

.top-left {
  position: absolute;
  top: 0;
  left: 1rem;
}

.top-right {
  position: absolute;
  top: 0;
  right: 1rem;
}

input {
  font-size: 3rem;
  font-family: monospace;
}

button {
  vertical-align: bottom;
  font-size: 2.2rem;
}

table {
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 40px;
  table-layout: fixed;
  border-spacing: 0;
  width: 75%;
}

table th {
  text-align: right;
  color: orange;
}

table td {
  text-align: left;
}

table tr th,
table tr td {
  border-bottom: 2px solid whitesmoke;
  padding: 3px 20px;
}

table tr:last-child th,
table tr:last-child td {
  border: none;
}

ul {
  width: 100%;
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
  display: block;
  list-style: none;
  margin-block-start: 0;
  margin-block-end: 0;
  padding-inline-start: 0;
  padding-inline-end: 0;
}

ul li.character {
  display: inline-block;
  width: calc(100% / 4 - 10px);
  padding: 10px 5px;
  margin-bottom: 2rem;
}

div.character {
  position: relative;
}

img.character {
  width: 100%;
  max-width: 128px;
  background-size: contain;
}

img.vision {
  position: absolute;
  left: 4%;
  top: 4%;
  max-width: 33%;
}

img.weapon,
img.artifact-set {
  width: calc(100% / 3 - 4px);
  height: calc(100% / 3 - 4px);
  border-radius: 50%;
  border: 2px solid whitesmoke;
}

p.constellation {
  position: absolute;
  right: 10%;
  top: 0;
}

div.level {
  background-color: black;
  border-radius: 5px;
  padding: 2px;
}
</style>
  