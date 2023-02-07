<template>
  <div class="base-container">
    <div class="pane1">
      <div class="header">
        <div class="top-left"><a href="./">げんかるく</a></div>
        <div class="top-right"><a href="https://enka.network/">Enka.Network</a></div>
      </div>
    </div>

    <div class="pane2">
      <div id="uid">
        <form @submit.prevent="submit">
          <label>
            UID:
            <input v-model="uid" type="text" maxlength="9" placeholder="ENTER UID" pattern="[0-9]+" />
          </label>
          <button type="submit" :disabled="timer > 0">
            <span class="material-symbols-outlined"> send </span>
          </button>
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
                  :alt="displayName(characterInfo.characterMaster.key)" />
                <img class="vision" :src="visionImgSrc(characterInfo)" alt="vision" />
                <div class="constellation" v-if="characterInfo.constellation">
                  {{ characterInfo.constellation }}
                </div>
              </div>
              <div class="level">Lv.{{ characterInfo.level }}</div>
              <img class="weapon" :src="weaponImgSrc(characterInfo)" alt="weapon" />
              <img class="artifact-set" :src="artifactSetImgSrc(characterInfo, 0)" alt="artifact-set" />
              <img class="artifact-set" :src="artifactSetImgSrc(characterInfo, 1)" alt="artifact-set" />
            </template>
            <div v-if="false">
              {{ characterInfo.savedata }}
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

        <div>
          <input class="hidden" id="artifacts-toggle" type="checkbox" v-model="artifactsToggle" />
          <label class="toggle-switch no-border" for="artifacts-toggle" style="width: 40rem">
            聖遺物 - ARTIFACTS -
          </label>
        </div>
        <div v-if="artifactsToggle">
          <button type="button" @click="artifactsSaveOnClick" :disabled="artifactsSaveButtonDisabled()"> SAVE </button>
          <div>
            <template v-for="(artifact, index) in artifacts" :key="index">
              <ArtifactItem :artifact="artifact" />
            </template>
          </div>
        </div>
      </template>
    </div>

    <div class="footer">
      <hr />
      <h2>
        DATA IMPORTER <span style="font-size: smaller">powered by</span> Enka.Network
        Ver.0.2.4
      </h2>
      《Enka.Network》様経由でゲーム内のキャラクターデータ取得して《げんかるく》に取り込むためのリンクを作成します。
      <ol style="text-align: left">
        <li>
          UIDを入力後、<span class="material-symbols-outlined"> send </span>をクリックしてください
        </li>
      </ol>
      <hr />
      <p>下記の制約があります。</p>
      <ol style="text-align: left">
        <li>不可：げんかるくに実装されていないキャラクター</li>
        <li>不可：げんかるくに実装されていない武器を装備しているデータ</li>
        <li>
          制限：げんかるくに実装されていない聖遺物セット効果はセット効果なし（NONE）に置き換えられる
        </li>
      </ol>
      <hr />
      <dl class="history">
        <dt>0.3.0 (2023/02/07)</dt>
        <dd>
          Enka Networkの新APIに対応
        </dd>
        <dt>0.2.4</dt>
        <dd>
          聖遺物の個別取込の準備
        </dd>
        <dt>0.2.3</dt>
        <dd>
          旅人対応。
        </dd>
        <dt>0.2.2</dt>
        <dd>
          突破していない武器を装備したキャラクターが含まれる場合に処理が止まる問題に対処。
        </dd>
        <dt>0.2.1</dt>
        <dd>
          げんかるくを開く際のデータの受け渡し方法を変更（クエリストリングからセッションストレージへ）
        </dd>
        <dt>0.2.0</dt>
        <dd>Enka.NetworkのAPI(URL)変更に追従。機能復活。</dd>
      </dl>
    </div>
  </div>
</template>
<script lang="ts">
import _ from 'lodash';
import { computed, defineComponent, reactive, ref } from 'vue';
import {
  ARTIFACT_SET_MASTER,
  ARTIFACT_SET_MASTER_LIST,
  CHARACTER_MASTER,
  ELEMENT_IMG_SRC,
  getArtifactIconUrl,
  getCharacterMasterDetail,
  IMG_SRC_DUMMY,
  STAR_BACKGROUND_IMAGE_CLASS,
  TAnyObject,
  TArtifactSetEntry,
  TCharacterEntry,
  TCharacterKey,
  TWeaponEntry,
  WEAPON_MASTER,
} from '@/master';
import CompositionFunction from '@/components/CompositionFunction.vue';
import {
  TArtifact,
  pushBuildinfoToSession,
  突破レベルレベルARRAY,
  聖遺物サブ効果ARRAY,
} from '@/input';
import { overwriteObject } from '@/common';
import ArtifactItem from '@/components/ArtifactItem.vue';

type THoyoAvatarMasterValue = {
  id: number;
  name: string;
  icon: string | null;
  weapon_cat_id: number;
  avatar_level: number;
  element_attr_id: number;
  max_level: number;
};
type THoyoAvatarMaster = THoyoAvatarMasterValue[];

type THoyoWeaponMasterValue = {
  id: number;
  name: string;
  icon: string | null;
  weapon_cat_id: number;
  weapon_level: number;
  max_level: number;
};
type THoyoWeaponMaster = THoyoWeaponMasterValue[];

type THoyoArtifactMasterValue = {
  id: number;
  name: string;
  icon: string | null;
  reliquary_cat_id: number;
  reliquary_level: number;
  max_level: number;
};
type THoyoArtifactMaster = THoyoArtifactMasterValue[];

type THoyoSkillMasterValue = {
  avatar_id: number;
  skill_list: [
    {
      id: number;
      group_id: number;
      name: string;
      icon: string | null;
      max_level: number;
    }
  ];
};
type THoyoSkillMaster = THoyoSkillMasterValue[];

const WEAPON_INFO_TEMPLATE = {
  itemId: 0,
  ascension: 0,
  refine: 1,
  level: 1,
};

type TReliqStat = {
  [key: string]: number;
};

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
  skillLevelList: [] as [string, number][],
  weapon: WEAPON_INFO_TEMPLATE,
  reliq: RELIQ_INFO_TEMPLATE,
  artifacts: [] as TArtifact[],
};
type TCharacterInfo = typeof CHARACTER_INFO_TEMPLATE & {
  characterMaster?: TCharacterEntry;
  weaponMaster?: TWeaponEntry;
  artifactSetMasters?: [TArtifactSetEntry?, TArtifactSetEntry?];
  savedata?: TAnyObject;
};

const RELIQUARY_CAT_NAME = {
  '1': '生の花',
  '2': '死の羽',
  '3': '時の砂',
  '4': '空の杯',
  '5': '理の冠',
};

const RELIQ_EQUIP_TYPE = [
  'EQUIP_BRACER', // 生の花
  'EQUIP_NECKLACE', // 死の羽
  'EQUIP_SHOES', // 時の砂
  'EQUIP_RING', // 空の杯
  'EQUIP_DRESS', // 理の冠
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
  name: 'App',
  components: {
    ArtifactItem,
  },
  setup() {
    const { displayName } = CompositionFunction();

    let HoyoAvatarMaster: THoyoAvatarMaster;
    let HoyoWeaponMaster: THoyoWeaponMaster;
    let HoyoArtifactMaster: THoyoArtifactMaster;
    let HoyoSkillMaster: THoyoSkillMaster;

    async function onLoad() {
      const responses = await Promise.all(
        [
          'data/HoyoAvatarMaster.json',
          'data/HoyoWeaponMaster.json',
          'data/HoyoArtifactMaster.json',
          'data/HoyoSkillMaster.json',
        ].map((s) => fetch(s).then((resp) => resp.json()))
      );
      HoyoAvatarMaster = responses[0];
      HoyoWeaponMaster = responses[1];
      HoyoArtifactMaster = responses[2];
      HoyoSkillMaster = responses[3];
    }
    onLoad();

    const uid = ref('');
    const timer = ref(0);
    let timerObj: number | undefined;
    const u = reactive({
      uid: '',
      playerInfo: {
        nickname: '',
      },
    } as TAnyObject);
    const characterInfoList = reactive([] as any[]);
    const artifactsToggle = ref(false);

    function getHoyoArtifactValue(id: number) {
      id = Math.trunc(id / 10);
      const arr = HoyoArtifactMaster.filter(s => s.id == id);
      return arr.length ? arr[0] : undefined;
    }

    function getArtifactSetName(name: string) {
      const arr = ARTIFACT_SET_MASTER_LIST.filter(s => s?.artifact_list?.includes(name));
      return arr.length ? arr[0].key : undefined;
    }

    function makeCharacterArtifacts(avatarInfo: any) {
      const result: TArtifact[] = [];
      for (const equip of avatarInfo.equipList) {
        if (equip.flat.itemType == 'ITEM_RELIQUARY') {
          const hoyoArtifactMasterValue = getHoyoArtifactValue(equip.itemId);
          if (!hoyoArtifactMasterValue) continue;
          const artifactSet = getArtifactSetName(hoyoArtifactMasterValue.name);
          if (!artifactSet) continue;
          const artifact: TArtifact = {
            name: hoyoArtifactMasterValue.name,
            rarity: equip.flat.rankLevel,
            setname: artifactSet,
            cat_id: hoyoArtifactMasterValue.reliquary_cat_id,
            mainStat: (FIGHT_PROP_STAT_OBJ as any)[equip.flat.reliquaryMainstat.mainPropId],
            mainStatValue: equip.flat.reliquaryMainstat.statValue,
            subStats: [],
          };
          for (const reliquarySubstat of equip.flat.reliquarySubstats) {
            const subStat = {
              name: (FIGHT_PROP_STAT_OBJ as any)[reliquarySubstat.appendPropId],
              value: reliquarySubstat.statValue,
            };
            artifact.subStats.push(subStat);
          }
          result.push(artifact);
        }
      }
      return result;
    }

    const artifacts = computed(() => {
      const result: TArtifact[] = [];
      if (u?.avatarInfoList?.length) {
        for (const avatarInfo of u.avatarInfoList) {
          result.push(...makeCharacterArtifacts(avatarInfo));
        }
      }
      return result;
    });

    async function makeCharacterInfo(u: TAnyObject, index: number) {
      const avatarInfo = u.avatarInfoList[index];

      const result: TCharacterInfo = {
        avatarId: avatarInfo.avatarId,
        level: u.playerInfo.showAvatarInfoList[index].level,
        ascension: avatarInfo.propMap['1002']?.ival ?? 0,
        constellation: avatarInfo.talentIdList?.length ?? 0,
        skillLevelList: [] as [string, number][],
        weapon: _.cloneDeep(WEAPON_INFO_TEMPLATE),
        reliq: _.cloneDeep(RELIQ_INFO_TEMPLATE),
        artifacts: [],
      };

      Object.keys(avatarInfo.skillLevelMap).forEach((key) => {
        result.skillLevelList.push([key, avatarInfo.skillLevelMap[key]]);
      });

      for (const equip of avatarInfo.equipList) {
        if (equip.flat.itemType == 'ITEM_RELIQUARY') {
          // 聖遺物
          result.reliq.itemIds.push(equip.itemId);
          // メイン効果
          const reliqIndex = RELIQ_EQUIP_TYPE.indexOf(equip.flat.equipType);
          result.reliq.rarities[reliqIndex] = equip.flat.rankLevel;
          result.reliq.mainStats[reliqIndex] = equip.flat.reliquaryMainstat.mainPropId;

          // サブ効果
          for (const reliquarySubstat of equip.flat.reliquarySubstats) {
            if (reliquarySubstat.appendPropId in result.reliq.subStatObj) {
              result.reliq.subStatObj[reliquarySubstat.appendPropId] +=
                reliquarySubstat.statValue;
            } else {
              result.reliq.subStatObj[reliquarySubstat.appendPropId] =
                reliquarySubstat.statValue;
            }
          }
        } else if (equip.flat.itemType == 'ITEM_WEAPON') {
          // 武器
          result.weapon.itemId = equip.itemId;
          if ('affixMap' in equip.weapon) {
            Object.keys(equip.weapon.affixMap).forEach((key) => {
              result.weapon.refine = equip.weapon.affixMap[key] + 1; // 精錬ランク？
            });
          } else {
            result.weapon.refine = 1;
          }
          result.weapon.level = equip.weapon.level;
          if (equip.weapon.promoteLevel) {
            result.weapon.ascension = equip.weapon.promoteLevel;
          } else {
            result.weapon.ascension = 1;
          }
        }
      }

      result.artifacts.push(...makeCharacterArtifacts(avatarInfo));

      const avatarWork = HoyoAvatarMaster.filter((s) => s.id == result.avatarId);
      if (avatarWork.length) {
        let name: TCharacterKey = avatarWork[0].name as TCharacterKey;
        if (avatarWork.length > 1) {
          const skillWorkArr = HoyoSkillMaster.filter(s => s.avatar_id == result.avatarId);
          let skillEntry;
          for (skillEntry of skillWorkArr) {
            if (skillEntry.skill_list.filter(s => String(s.id) == result.skillLevelList[0][0]).length) {
              break;
            }
          }
          if (skillEntry) {
            for (const character of Object.keys(CHARACTER_MASTER).filter(s => s.startsWith('旅人'))) {
              const characterDetail = await getCharacterMasterDetail(character as TCharacterKey);
              const talentName = characterDetail.通常攻撃.名前;
              if (skillEntry.skill_list.filter(s => s.name == talentName).length) {
                name = character as TCharacterKey;
                break;
              }
            }
          }
        }
        result.characterMaster = CHARACTER_MASTER[name] as TCharacterEntry;

        const weaponWork = HoyoWeaponMaster.filter((s) => s.id == result.weapon.itemId);
        if (weaponWork.length) {
          result.weaponMaster = (WEAPON_MASTER as any)[result.characterMaster['武器']][
            weaponWork[0].name
          ];
        }
      }

      const artifactSetMasters: [TArtifactSetEntry | undefined, TArtifactSetEntry | undefined] = [undefined, undefined];
      const artifactNames: string[] = [];
      result.reliq.itemIds
        .filter((s) => s)
        .forEach((itemId) => {
          itemId = Math.trunc(itemId / 10);
          const work = HoyoArtifactMaster.filter((s) => s.id == itemId);
          if (work.length) {
            artifactNames.push(work[0].name);
          }
        });
      const artifactSetWork: TAnyObject = {};
      Object.keys(ARTIFACT_SET_MASTER).forEach((key) => {
        const entry = (ARTIFACT_SET_MASTER as any)[key];
        if ('artifact_list' in entry) {
          artifactNames.forEach((artifactName) => {
            if (entry.artifact_list.includes(artifactName)) {
              if (key in artifactSetWork) {
                artifactSetWork[key]++;
              } else {
                artifactSetWork[key] = 1;
              }
            }
          });
        }
      });
      Object.keys(artifactSetWork).forEach((key) => {
        if (artifactSetWork[key] >= 4) {
          artifactSetMasters[0] = (ARTIFACT_SET_MASTER as any)[key] as TArtifactSetEntry;
          artifactSetMasters[1] = (ARTIFACT_SET_MASTER as any)[key] as TArtifactSetEntry;
        } else if (artifactSetWork[key] >= 2) {
          const index = artifactSetMasters.indexOf(undefined);
          if (index != -1) {
            artifactSetMasters[index] = (ARTIFACT_SET_MASTER as any)[
              key
            ] as TArtifactSetEntry;
          }
        }
      });
      result.artifactSetMasters = artifactSetMasters;

      result.savedata = await makeSavedata(result);

      return result;
    }

    async function makeSavedata(characterInfo: TCharacterInfo) {
      const result = {} as TAnyObject;

      // キャラクター
      result['キャラクター'] = characterInfo.characterMaster?.key;
      // レベル
      result['レベル'] = characterInfo.level + (突破レベルレベルARRAY[characterInfo.ascension][0] == characterInfo.level ? '+' : '');
      // 命ノ星座
      result['命ノ星座'] = characterInfo.constellation;

      const workSkillArr = HoyoSkillMaster.filter((s) => s.avatar_id == characterInfo.avatarId);
      if (workSkillArr.length) {
        const characterMasterDetail = await getCharacterMasterDetail(result['キャラクター']);
        characterInfo.skillLevelList.forEach((skillLevel) => {
          let skillInfo;
          for (const skillEntry of workSkillArr) {
            const workArr = skillEntry.skill_list.filter((s) => s.id == Number(skillLevel[0]));
            if (workArr.length) {
              skillInfo = workArr[0];
              break;
            }
          }
          if (skillInfo) {
            if (characterMasterDetail.通常攻撃.名前 == skillInfo.name) {
              result['通常攻撃レベル'] = skillLevel[1];
            } else if (characterMasterDetail.元素スキル.名前 == skillInfo.name) {
              result['元素スキルレベル'] = skillLevel[1];
            } else if (characterMasterDetail.元素爆発.名前 == skillInfo.name) {
              result['元素爆発レベル'] = skillLevel[1];
            }
          }
        });
        if (result['命ノ星座'] >= 3) {
          const desc = characterMasterDetail.命ノ星座['3']?.説明;
          if (desc) {
            if (desc.indexOf(characterMasterDetail.元素スキル.名前) != -1) {
              result['元素スキルレベル'] += 3;
            } else if (desc.indexOf(characterMasterDetail.元素爆発.名前) != -1) {
              result['元素爆発レベル'] += 3;
            }
          }
        }
        if (result['命ノ星座'] >= 5) {
          const desc = characterMasterDetail.命ノ星座['5']?.説明;
          if (desc) {
            if (desc.indexOf(characterMasterDetail.元素スキル.名前) != -1) {
              result['元素スキルレベル'] += 3;
            } else if (desc.indexOf(characterMasterDetail.元素爆発.名前) != -1) {
              result['元素爆発レベル'] += 3;
            }
          }
        }
      }
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
        } else {
          result['聖遺物メイン効果' + (i + 1)] = null;
        }
      }
      // 聖遺物サブ効果
      聖遺物サブ効果ARRAY.forEach((stat) => {
        stat = '聖遺物サブ効果' + stat.replace('%', 'P');
        result[stat] = 0;
      });
      Object.keys(characterInfo.reliq.subStatObj).forEach((prop) => {
        const stat = '聖遺物サブ効果' + (FIGHT_PROP_STAT_OBJ as any)[prop].replace('%', 'P');
        result[stat] = characterInfo.reliq.subStatObj[prop];
      });

      // 聖遺物リスト
      if (characterInfo.artifacts) {
        result['artifact_list'] = characterInfo.artifacts;
      }

      return result;
    }

    const submit = async () => {
      if (!uid.value && !uid.value.match(/^[0-9]{9}$/)) return;
      const url = 'https://enka.network/api/uid/' + uid.value + '/';
      // const url = 'data/__data_2.json';
      fetch(url)
        .then((resp) => resp.json())
        .then(async (json) => {
          console.log(json);
          overwriteObject(u, json);

          const work: any[] = [];
          for (let i = 0; i < u.playerInfo.showAvatarInfoList.length; i++) {
            work.push(await makeCharacterInfo(u, i));
          }
          characterInfoList.splice(0, characterInfoList.length, ...work);

          artifactsSaveButtonDisabled();

          if (json.ttl) {
            timer.value = Number(json.ttl);
            timerObj = setInterval(function () {
              count();
            }, 1000);
          }
        });
    };

    const locate = (index: number) => {
      // const sharedata = makeSharedata(characterInfoList[index].savedata);
      // const encoded = encodeURI(sharedata).replace('+', '%2B');
      // window.open('./?allin=' + encoded, '_blank');
      const savedata = characterInfoList[index].savedata;
      pushBuildinfoToSession(savedata.キャラクター, undefined, savedata);
      window.open('./', '_blank');
    };

    const save = (index: number) => {
      const storageKey = '構成_' + characterInfoList[index].characterMaster.key;
      localStorage.setItem(storageKey, JSON.stringify(characterInfoList[index].savedata));
      saveButtonDisabled(index);
    };

    const buttonDisabled = (index: number) => {
      return (
        !characterInfoList[index].characterMaster ||
        !characterInfoList[index].weaponMaster
      );
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

    const artifactsSaveButtonDisabled = () => {
      if (artifacts.value.length === 0) return true;
      const storageKey = 'artifact_list';
      let curValue: any[] = [];
      if (storageKey in localStorage) {
        curValue = JSON.parse(localStorage[storageKey]);
      }
      for (const artifact of artifacts.value) {
        if (curValue.filter(s => _.isEqual(s, artifact)).length == 0) {
          return false;
        }
      }
      return true;
    };

    const artifactsSaveOnClick = () => {
      const storageKey = 'artifact_list';
      let curValue: any[] = [];
      if (storageKey in localStorage) {
        curValue = JSON.parse(localStorage[storageKey]);
      }
      const newValue: any[] = _.cloneDeep(curValue);
      for (const artifact of artifacts.value) {
        if (curValue.filter(s => _.isEqual(s, artifact)).length > 0) continue;
        newValue.push(artifact);
      }
      localStorage[storageKey] = JSON.stringify(newValue);
      artifactsSaveButtonDisabled();
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
          result = getArtifactIconUrl(work.key);
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
      artifactsSaveOnClick,
      artifactsSaveButtonDisabled,

      characterImgSrc,
      characterBgClass,
      visionImgSrc,
      weaponImgSrc,
      artifactSetImgSrc,

      artifactsToggle,
      artifacts,
      RELIQUARY_CAT_NAME,
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
  height: 30px;
}

.top-left {
  position: absolute;
  top: 5px;
  left: 1rem;
}

.top-right {
  position: absolute;
  top: 5px;
  right: 1rem;
}

input {
  font-size: 3rem;
  font-family: monospace;
  padding-left: 1rem;
  width: 24rem;
}

button {
  vertical-align: bottom;
  padding-left: 4px;
  padding-right: 4px;
}

button span {
  font-size: 2.6rem;
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
  background-size: contain;
}

img.vision {
  position: absolute;
  left: 6%;
  top: 4%;
  max-width: 25%;
}

img.weapon,
img.artifact-set {
  width: calc(100% / 3 - 4px);
  height: calc(100% / 3 - 4px);
  border-radius: 50%;
  border: 2px solid whitesmoke;
  background-color: black;
}

div.constellation {
  position: absolute;
  font-size: 4rem;
  right: 4%;
  top: 4%;
  background-color: black;
  opacity: 50%;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

div.level {
  background-color: black;
  border-radius: 5px;
  padding: 2px;
}

dl.history {
  text-align: left;
  padding-left: 2rem;
}

table.artifact {
  width: 90%;
  table-layout: auto;
  margin-bottom: 0;
}

table.artifact-substat {
  width: 100%;
  margin-bottom: 0;
}

table.artifact tr td {
  border-bottom: 2px solid whitesmoke;
  padding: 3px;
}

table.artifact-substat tr td {
  border-bottom: 1px solid gray;
  padding: 3px;
}

table.artifact-substat tr:last-child td {
  border-bottom: none;
}
</style>
