<template>
  <fieldset class="team-option">
    <template v-for="supporter in SUPPORTER_KEY_LIST" :key="supporter">
      <fieldset v-if="supporterOpenClose[supporter]" class="supporter" v-show="supporterVisible(supporter)">
        <div class="left">
          <div :class="'supporter' + supporterOptionSelectedClass(supporter)">
            <input class="hidden" :id="'supporter-' + supporter" type="checkbox"
              v-model="supporterOpenClose[supporter]" />
            <label class="fold with-tooltip" :for="'supporter-' + supporter">
              <div class="character">
                <img class="character" :src="characterIconSrc(supporter)" :alt="displayName(supporter)">
                <img class="vision" :src="characterVisionIconSrc(supporter)" alt="vision">
              </div>
              <span class="tooltip"> {{ displayName(supporter) }} </span>
            </label>
            <button type="button" v-if="teamMembers.includes(supporter)" @click="removeFromTeamOnClick(supporter)">
              <span class="material-symbols-outlined remove"> person_remove </span>
            </button>
            <button type="button" v-else :disabled="teamMembers.length >= 3" @click="addToTeamOnClick(supporter)">
              <span class="material-symbols-outlined add"> person_add </span>
            </button>
          </div>
          <div class="builddata-selector" v-if="buildnameList(supporter).length">
            <label>
              <select v-model="selectedBuildname[supporter]" @change="buildnameSelectionOnChange">
                <option v-for="item in buildnameList(supporter)" :value="item" :key="item">
                  {{ item }}
                </option>
              </select>
            </label>
          </div>
          <div class="equipment">
            <div class="with-tooltip">
              <img :src="weaponIconSrc(supporter)" alt="weapon" />
              <span class="tooltip">{{ weaponName(supporter) }}</span>
            </div>
            <div class="with-tooltip">
              <img :src="artifactSetIconSrc(supporter, 0)" alt="artifact set" />
              <span class="tooltip">{{ artifactSetName(supporter, 0) }}</span>
            </div>
            <div class="with-tooltip">
              <img :src="artifactSetIconSrc(supporter, 1)" alt="artifact set" />
              <span class="tooltip">{{ artifactSetName(supporter, 1) }}</span>
            </div>
          </div>
          <label class="condition" v-for="item in supporterCheckboxList(supporter)" :key="item.name">
            <input type="checkbox" v-model="conditionValues[item.name]" :disabled="conditionDisabled(item)"
              @change="onChange(supporter, item)" />
            <span> {{ displayName(item.displayName) }}</span>
          </label>
          <label class="condition" v-for="item in supporterSelectList(supporter)" :key="item.name">
            <span> {{ displayName(item.displayName) }} </span>
            <select v-model="conditionValues[item.name]" :disabled="conditionDisabled(item)"
              @change="onChange(supporter, item)">
              <option v-for="(option, index) in item.options" :value="index" :key="option">
                {{ displayOptionName(option) }}
              </option>
            </select>
          </label>
          <label class="condition" v-for="item in supporterNumberList(supporter)" :key="item.name">
            <span> {{ displayName(item.displayName) }}</span>
            <input type="number" v-model="conditionValues[item.name]" :min="item.min" :max="item.max" :step="item.step"
              :disabled="conditionDisabled(item)" @blur="onChange(supporter, item)" />
          </label>
        </div>
      </fieldset>
      <template v-else>
        <div v-show="supporterVisible(supporter)"
          :class="'supporter-else' + elementBgClass(supporter) + supporterOptionSelectedClass(supporter)">
          <input class="hidden" :id="'supporter-else-' + supporter" type="checkbox"
            v-model="supporterOpenClose[supporter]" />
          <label class="fold with-tooltip" :for="'supporter-else-' + supporter">
            <div class="character">
              <img class="character" :src="characterIconSrc(supporter)" :alt="displayName(supporter)">
              <img class="vision" :src="characterVisionIconSrc(supporter)" alt="vision">
            </div>
            <span class="tooltip"> {{ displayName(supporter) }} </span>
          </label>
          <button type="button" v-if="teamMembers.includes(supporter)" @click="removeFromTeamOnClick(supporter)">
            <span class="material-symbols-outlined remove"> person_remove </span>
          </button>
          <button type="button" v-else :disabled="teamMembers.length >= 3" @click="addToTeamOnClick(supporter)">
            <span class="material-symbols-outlined add"> person_add </span>
          </button>
        </div>
      </template>
    </template>

    <hr />

    <ul class="option-description">
      <li v-for="item in displayStatAjustmentList" :key="item">{{ item }}</li>
    </ul>

    <label>
      {{ displayName("すべて閉じる") }}
      <button class="execute" type="button" @click="closeAllSupporters">{{ displayName("実行") }}</button>
    </label>
    <label>
      {{ displayName("すべてクリア") }}
      <button class="execute" type="button" @click="clearAllSupporterOptions">
        {{ displayName("実行") }}
      </button>
    </label>
  </fieldset>

  <p class="notice">
    キャラクターの天賦レベルやステータスによって効果量が変動する種類のオプションはデフォルト名称の構成保存データが存在する場合に選択可能になります。
    <br />
    構成保存データのデフォルト名称：あなたの{キャラクターの名前}
  </p>
</template>

<script lang="ts">
import _ from 'lodash';
import {
  checkConditionMatches,
  evalFormula,
  makeValidConditionValueArr,
} from "@/calculate";
import { isNumeric, overwriteObject } from "@/common";
import {
  CONDITION_INPUT_TEMPLATE,
  DAMAGE_RESULT_TEMPLATE,
  TConditionInput,
  TDamageResult,
  makeDamageDetailObjArr,
  makeConditionExclusionMapFromStr,
  TStats,
  makeTeamOptionDetailObjArr,
  TDamageDetailObj,
  ステータスTEMPLATE,
  getChangeKind,
  makeDefaultBuildname,
  makeBuildStorageKey,
  TSupporterInput,
  SUPPORTER_INPUT_TEMPLATE,
  TConditionValues,
} from "@/input";
import {
  ALL_ELEMENTS,
  CHARACTER_MASTER,
  ELEMENT_BG_COLOR_CLASS,
  ELEMENT_IMG_SRC,
  getCharacterMasterDetail,
  IMG_SRC_DUMMY,
  TCharacterKey,
  TEAM_OPTION_MASTER_LIST,
} from "@/master";
import { computed, defineComponent, nextTick, PropType, reactive, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

type TConditionValuesAny = { [key: string]: any };

export default defineComponent({
  name: 'TeamOptionInput',
  props: {
    character: { type: String as PropType<TCharacterKey>, required: true, },
    topStats: { type: Object as PropType<TStats>, required: true, },
    savedSupporters: { type: Object as PropType<{ key: string; value: string, buildname: string }[]>, required: true, },
    calculatedSupporters: { type: Object as PropType<{ [key: string]: TSupporterInput | undefined }>, required: true, },
    teamMembers: { type: Array as PropType<string[]>, required: true, },
    initialConditionValue: { type: Object as PropType<TConditionValues>, }
  },
  emits: ['update:team-option', 'update:buildname-selection', 'update:team-members'],
  setup(props, context) {
    const {
      displayName,
      displayStatName,
      displayStatValue,
      displayOptionName,
    } = CompositionFunction();

    const SUPPORTER_KEY_LIST = Object.keys(CHARACTER_MASTER);
    SUPPORTER_KEY_LIST.sort((a, b) => ALL_ELEMENTS.indexOf((CHARACTER_MASTER as any)[a].元素) - ALL_ELEMENTS.indexOf((CHARACTER_MASTER as any)[b].元素));
    const supporterOpenClose = reactive({} as { [key: string]: boolean });

    const damageDetailArr = [] as any[];
    const statusChangeDetailObjArr: TDamageDetailObj[] = [];
    const talentChangeDetailObjArr: TDamageDetailObj[] = [];
    const conditionMap = new Map() as Map<string, string[] | null | object>;
    const exclusionMap = new Map() as Map<string, string[] | null>;
    const conditionInput = reactive(_.cloneDeep(CONDITION_INPUT_TEMPLATE) as TConditionInput);
    if (props.initialConditionValue) {
      _.merge(conditionInput.conditionValues, props.initialConditionValue);
    }
    const conditionValues = conditionInput.conditionValues as TConditionValuesAny;
    const checkboxList = conditionInput.checkboxList;
    const selectList = conditionInput.selectList;
    const numberList = conditionInput.numberList;
    const statsObjDummy = _.cloneDeep(ステータスTEMPLATE);
    const damageResultDummy = _.cloneDeep(DAMAGE_RESULT_TEMPLATE);

    const additionalConditions: string[] = [];

    const builddataSelectorVisible = reactive({} as { [key: string]: boolean });
    const selectedBuildname = reactive({} as { [key: string]: string | null });
    const supporterInputResultMap = reactive(new Map() as Map<string, TSupporterInput>);

    const elementBgClass = (supporter: string) => {
      return ' ' + (ELEMENT_BG_COLOR_CLASS as any)[(CHARACTER_MASTER as any)[supporter].元素];
    }

    function formatCondition(supporter: string, name: string | null, condition: string | null | undefined) {
      let result = supporter + '*';
      if (condition) {
        result += condition.replace(/([&|^])/g, '$1' + supporter + '*');
      } else if (name) {
        result += name;
      }
      result = result.replace(supporter + '*' + supporter + '*', supporter + '*');
      return result;
    }

    for (const masterList of [TEAM_OPTION_MASTER_LIST]) {
      for (const entry of masterList) {
        const supporter = entry.key.split('_')[0];
        if ('詳細' in entry) {
          for (const detailObj of entry.詳細) {
            (detailObj as any).条件 = formatCondition(supporter, entry.名前, (detailObj as any).条件);
          }
        }
        damageDetailArr.splice(damageDetailArr.length, 0, ...makeDamageDetailObjArr(entry, null, null, null, statusChangeDetailObjArr, talentChangeDetailObjArr, 'その他オプション'));
      }
    }
    damageDetailArr.filter((s) => s.条件).forEach((detailObj) => {
      makeConditionExclusionMapFromStr(detailObj.条件 as string, conditionMap, exclusionMap);
    })
    statusChangeDetailObjArr.filter((s) => s.条件).forEach((detailObj) => {
      makeConditionExclusionMapFromStr(detailObj.条件 as string, conditionMap, exclusionMap);
    })
    talentChangeDetailObjArr.filter((s) => s.条件).forEach((detailObj) => {
      makeConditionExclusionMapFromStr(detailObj.条件 as string, conditionMap, exclusionMap);
    })
    conditionMap.forEach((value, key) => {
      if (value && _.isArray(value)) {
        if (!value[0].startsWith('required_')) {
          conditionMap.set(key, ['', ...value]);
        }
      }
    })

    const updateConditionList = () => {
      conditionMap.forEach((value: string[] | null | object, key: string) => {
        if (value === null) { // checkbox
          if (checkboxList.filter((s) => s.name == key).length === 0) {
            checkboxList.push({
              name: key,
              displayName: key.replace(/^.+\*/, '')
            })
          }
        } else if (_.isArray(value)) {  // select
          if (selectList.filter((s) => s.name == key).length === 0) {
            const required = value[0].startsWith('required_');
            selectList.push({
              name: key,
              displayName: key.replace(/^.+\*/, ''),
              options: (required || !value[0]) ? value : ['', ...value],
              required: required,
            })
          }
        } else if (_.isPlainObject(value)) {  // number
          if (numberList.filter((s) => s.name == key).length === 0) {
            numberList.push({
              name: key,
              displayName: key.replace(/^.+\*/, ''),
              min: (value as any).min,
              max: (value as any).max,
              step: (value as any).step,
            })
          }
        }
      });
      conditionMap.forEach((value, key) => {
        if (value === null) { // checkbox
          if (!(key in conditionValues)) conditionValues[key] = false;
        } else if (_.isArray(value)) {  // select
          if (!(key in conditionValues)) conditionValues[key] = 0;
        } else if (_.isPlainObject(value)) {  // number
          if (!(key in conditionValues)) conditionValues[key] = (value as any).min;
        }
      })
    }

    const takeMasterTeamOption = (character: string, master: any) => {
      if ('チームバフ' in master) {
        const detailObjArr = master.チームバフ as any[];
        const damageDetailObjArr: TDamageDetailObj[] = makeTeamOptionDetailObjArr(detailObjArr);
        damageDetailObjArr.forEach((damageDetailObj) => {
          const condition = formatCondition(character, damageDetailObj.名前, damageDetailObj.条件);
          damageDetailObj.条件 = condition;
          if (!additionalConditions.includes(condition)) {
            additionalConditions.push(condition);
          }
          const changeKind = getChangeKind(damageDetailObj.種類 as string);
          if (changeKind == 'STATUS' &&
            statusChangeDetailObjArr.filter((s) => s.条件 == condition && s.種類 == damageDetailObj.種類).length == 0
          ) {
            statusChangeDetailObjArr.splice(statusChangeDetailObjArr.length, 0, damageDetailObj);
          }
          if (changeKind == 'TALENT' &&
            talentChangeDetailObjArr.filter((s) => s.条件 == condition && s.種類 == damageDetailObj.種類).length == 0
          ) {
            talentChangeDetailObjArr.splice(talentChangeDetailObjArr.length, 0, damageDetailObj);
          }
          makeConditionExclusionMapFromStr(condition, conditionMap, exclusionMap);
        })
        updateConditionList();
      }
    }

    async function setupFromCharacterMaster() {
      const list: Promise<void>[] = [];
      for (const character of SUPPORTER_KEY_LIST) {
        list.push(getCharacterMasterDetail(character as TCharacterKey).then(result => {
          takeMasterTeamOption(character, result);
        }))
      }
      await Promise.all(list);
    }

    const setupSupporterDamageResult = (savedSupporter: {
      key: string;
      value: string;
    }): TSupporterInput => {
      const supporterInputResult = props.calculatedSupporters[savedSupporter.key];
      if (!supporterInputResult) {
        return _.cloneDeep(SUPPORTER_INPUT_TEMPLATE);
      }
      const characterInput = supporterInputResult.characterInput;

      // マスターから取り込んだチームバフを削除します
      const removeConditions: string[] = additionalConditions.filter((s) =>
        s.startsWith(characterInput.character + '*')
      )
      if (removeConditions.length > 0) {
        statusChangeDetailObjArr.splice(0, statusChangeDetailObjArr.length, ...statusChangeDetailObjArr.filter((s) => !removeConditions.includes(s.条件 as string)));
        talentChangeDetailObjArr.splice(0, talentChangeDetailObjArr.length, ...talentChangeDetailObjArr.filter((s) => !removeConditions.includes(s.条件 as string)));
        removeConditions.forEach((condition) => {
          if (conditionMap.has(condition)) {
            conditionMap.delete(condition);
          }
        })
        checkboxList.splice(0, checkboxList.length, ...checkboxList.filter((s) => !removeConditions.includes(s.name)));
        selectList.splice(0, selectList.length, ...selectList.filter((s) => !removeConditions.includes(s.name)));
        numberList.splice(0, numberList.length, ...numberList.filter((s) => !removeConditions.includes(s.name)));
        additionalConditions.splice(0, additionalConditions.length, ...additionalConditions.filter((s) => !removeConditions.includes(s)));
      }

      // キャラクターマスターに記述したチームバフを取り込みます
      takeMasterTeamOption(characterInput.character, characterInput.characterMaster);

      // 武器マスターに記述したチームバフを取り込みます
      takeMasterTeamOption(characterInput.character, characterInput.weaponMaster);

      return supporterInputResult;
    }

    /** 選択中のキャラクターのオプションは無効です */
    const supporterVisible = (supporter: any) => supporter != props.character;
    const supporterOptionSelectedClass = (supporter: any) => {
      if (supporterCheckboxList(supporter).filter(s => conditionValues[s.name]).length > 0
        || supporterSelectList(supporter).filter(s => !s.required && conditionValues[s.name]).length > 0) {
        return ' selected';
      }
      return '';
    }
    const supporterCheckboxList = (supporter: any) => checkboxList.filter((s) => s.name.startsWith(supporter + '*'));
    const supporterSelectList = (supporter: any) => selectList.filter((s) => s.name.startsWith(supporter + '*'));
    const supporterNumberList = (supporter: any) => numberList.filter((s) => s.name.startsWith(supporter + '*'));


    const characterIconSrc = (character: string) => (CHARACTER_MASTER as any)[character].icon_url;
    const characterVisionIconSrc = (character: string) => (ELEMENT_IMG_SRC as any)[(CHARACTER_MASTER as any)[character].元素];
    const weaponIconSrc = (character: string) => {
      let result = IMG_SRC_DUMMY;
      const inputResult = supporterInputResultMap.get(character);
      if (inputResult && inputResult?.characterInput?.weaponMaster) {
        result = inputResult.characterInput.weaponMaster.icon_url;
      }
      return result;
    }
    const weaponName = (character: string) => {
      let result = '';
      const inputResult = supporterInputResultMap.get(character);
      if (inputResult && inputResult?.characterInput?.weaponMaster) {
        result = inputResult.characterInput.weaponMaster.名前;
      }
      return result;
    }
    const artifactSetIconSrc = (character: string, index: number) => {
      let result = IMG_SRC_DUMMY;
      const inputResult = supporterInputResultMap.get(character);
      if (inputResult && inputResult?.characterInput?.artifactSetMasters) {
        if (inputResult.characterInput.artifactSetMasters.length > index) {
          result = inputResult.characterInput.artifactSetMasters[index].icon_url;
        }
      }
      return result;
    }
    const artifactSetName = (character: string, index: number) => {
      let result = '';
      const inputResult = supporterInputResultMap.get(character);
      if (inputResult && inputResult?.characterInput?.artifactSetMasters) {
        if (inputResult.characterInput.artifactSetMasters.length > index) {
          result = inputResult.characterInput.artifactSetMasters[index].key;
        }
      }
      return result;
    }

    /** サポーターのステータス（天賦レベル）を参照するオプションには保存データが必要です */
    const conditionDisabled = (item: any): boolean => {
      const supporter = item.name.split('*')[0];
      if (props.savedSupporters.filter((s) => s.key == supporter).length === 0) {
        for (const myDetailObj of statusChangeDetailObjArr) {
          if (_.isString(myDetailObj.条件) && myDetailObj.条件.startsWith(item.name)) {
            if (myDetailObj.数値?.includes('$')) {
              return true;
            }
          }
        }
        for (const myDetailObj of talentChangeDetailObjArr) {
          if (_.isString(myDetailObj.条件) && myDetailObj.条件.startsWith(item.name)) {
            if (myDetailObj.数値?.includes('$')) {
              return true;
            }
          }
        }
      }
      return false;
    }

    /** ステータス補正値を計算します */
    const statAdjustments = computed(() => {
      const workObj = {} as TStats;
      const validConditionValueArr = makeValidConditionValueArr(conditionInput);
      [statusChangeDetailObjArr, talentChangeDetailObjArr].forEach((detailObjArr) => {
        if (detailObjArr) {
          for (const detailObj of detailObjArr) {
            let supporter;
            let myNew数値 = detailObj.数値;
            const my上限 = detailObj.上限;
            const my下限 = detailObj.下限;
            if (detailObj.条件) {
              supporter = detailObj.条件.substring(0, detailObj.条件.indexOf('*'));
              if (supporter == props.character) continue;
              const number = checkConditionMatches(detailObj.条件, validConditionValueArr, 6);
              if (!number || number === 0) continue;
              if (number !== 1 && myNew数値) {
                myNew数値 = '(' + myNew数値 + ')*' + number;
              }
            }
            let statsObj: TStats = statsObjDummy;
            let damageResult: TDamageResult = damageResultDummy;
            if (supporter) {
              const temp = supporterInputResultMap.get(supporter);
              if (temp) {
                statsObj = temp.statsInput.statsObj;
                damageResult = temp.damageResult;
              }
            }
            Object.keys(props.topStats).forEach(stat => { // チーム内で最も高いステータスをセットします
              statsObj[stat] = props.topStats[stat];
            })
            let myValue = Infinity;
            if (myNew数値) {
              myValue = evalFormula(myNew数値, statsObj, damageResult, my上限, my下限);
            }
            const kinds = [] as string[];
            if (detailObj.種類) {
              if (detailObj.種類.startsWith('全') || detailObj.種類.startsWith('敵全')) {
                for (const elem of ALL_ELEMENTS) {
                  kinds.push(detailObj.種類.replace('全', elem));
                }
              } else {
                kinds.push(detailObj.種類);
              }
            }
            for (const kind of kinds) {
              let tempKind = kind;
              if (detailObj.対象) {
                tempKind += '.' + detailObj.対象;
              }
              if (tempKind in workObj) {
                workObj[tempKind] += myValue;
              } else {
                workObj[tempKind] = myValue;
              }
            }
          }
        }
      })
      return workObj;
    })

    /** ステータス補正値を表示用の形式に編集します */
    const displayStatAjustmentList = computed(() => {
      const resultArr = [];
      for (const stat of Object.keys(statAdjustments.value)) {
        let result: string = displayStatName(stat).replace('%', '');
        const value = statAdjustments.value[stat];
        if (value != Infinity) {
          if (isNumeric(value)) {
            if (value >= 0) {
              if (stat.split('.')[0] === '別枠乗算') result += '=';
              else result += "+";
            }
            result += displayStatValue(stat, value);
          } else if (value) {
            result += "=" + value;
          }
        }
        resultArr.push(result);
      }
      return resultArr;
    })

    const initializeSupporters = (calculatedSupporters: { [key: string]: TSupporterInput | undefined }) => {
      for (const entry of props.savedSupporters) {
        selectedBuildname[entry.key] = entry.buildname;
        const result = setupSupporterDamageResult(entry);
        supporterInputResultMap.set(entry.key, result);
      }
      Object.keys(calculatedSupporters).forEach(key => {
        const supporterInputResult = calculatedSupporters[key];
        if (supporterInputResult) {
          supporterInputResultMap.set(key, supporterInputResult);
        }
      })
    }

    function convertBuildname(character: string, storageKey: string) {
      const prefix = makeBuildStorageKey(character);
      if (storageKey == prefix) return makeDefaultBuildname(character);
      return storageKey.replace(new RegExp('^' + prefix + '_'), '');
    }

    const buildnameList = (character: string) => {
      const re = new RegExp('^構成_' + character.replace('(', '\\(').replace(')', '\\)') + '(_|$)');
      const storageKeys = Object.keys(localStorage).filter((s) => re.test(s));
      const list = storageKeys.map((s) => convertBuildname(character, s));
      const defaultBuildname = makeDefaultBuildname(character);
      const result = list.filter((s) => s != defaultBuildname).sort();
      if (list.includes(defaultBuildname)) {
        result.unshift(defaultBuildname);
      }
      return result;
    }

    const builddataSelectable = (character: string) => buildnameList(character).length > 0;

    SUPPORTER_KEY_LIST.forEach((supporter) => {
      builddataSelectorVisible[supporter] = false;
      const list = buildnameList(supporter);
      if (list.length > 0) {
        let buildname = list[0];
        const workArr = props.savedSupporters.filter(s => s.key == supporter);
        if (workArr.length) {
          buildname = workArr[0].buildname;
        }
        selectedBuildname[supporter] = buildname;
      }
    })

    async function onLoad() {
      updateConditionList();
      setupFromCharacterMaster();
      initializeSupporters(props.calculatedSupporters);

      for (const key of SUPPORTER_KEY_LIST) {
        supporterOpenClose[key] = false;
      }
    }
    onLoad();

    /** オプションが変更されたことを上位に通知します */
    const onChange = async (supporter?: string, item?: any) => {
      if (supporter && item) {
        console.debug(supporter, item.name, conditionValues[item.name]);
      }
      await nextTick();
      overwriteObject(conditionInput.conditionAdjustments, statAdjustments.value);
      context.emit('update:team-option', conditionInput);
    }

    const initializeValues = async (initialObj: TConditionInput) => {
      Object.keys(conditionValues).forEach((key) => {
        if (key in initialObj.conditionValues) {
          conditionValues[key] = initialObj.conditionValues[key];
        } else {
          if (conditionMap.has(key)) {
            const value = conditionMap.get(key);
            if (value === null) {
              conditionValues[key] = false;
            } else if (_.isArray(value)) {
              conditionValues[key] = 0;
            } else if (_.isPlainObject(value)) {
              conditionValues[key] = (value as any).min;
            }
          }
        }
      })
      onChange();
    }

    const closeAllSupporters = () => {
      for (const supporter of Object.keys(supporterOpenClose)) {
        supporterOpenClose[supporter] = false;
      }
    }

    const clearAllSupporterOptions = () => {
      for (const entry of checkboxList) {
        conditionValues[entry.name] = false;
      }
      for (const entry of selectList) {
        conditionValues[entry.name] = 0;
      }
      for (const entry of numberList) {
        conditionValues[entry.name] = entry.min;
      }
    }

    const buildnameSelectionOnChange = () => {
      context.emit('update:buildname-selection', selectedBuildname);
    }

    function updateTeamMembers(teamMembers: string[]) {
      context.emit('update:team-members', teamMembers);
    }

    const addToTeamOnClick = (supporer: string) => {
      updateTeamMembers([...props.teamMembers, supporer]);
    }

    const removeFromTeamOnClick = (member: string) => {
      updateTeamMembers(props.teamMembers.filter(s => s != member));
    }

    watch(props, async (newVal, oldVal) => {
      const workPromiseArr: any[] = [];
      for (const key of Object.keys(newVal.calculatedSupporters)) {
        const newWork = newVal.calculatedSupporters[key];
        const oldWork = oldVal.calculatedSupporters[key];
        let changed;
        if (oldWork) {
          if (!_.isEqual(newWork?.statsInput, oldWork.statsInput)) {
            changed = true;
          } else if (!_.isEqual(newWork?.damageResult, oldWork.damageResult)) {
            changed = true;
          }
        } else {
          changed = true;
        }
        const savedSupporter = newVal.savedSupporters.filter(s => s.key == key);
        if (savedSupporter.length) {
          if (changed) {
            workPromiseArr.push(setupSupporterDamageResult(savedSupporter[0]));
          }
          selectedBuildname[key] = savedSupporter[0].buildname;
        }
      }
      for (const entry of oldVal.savedSupporters) {
        const absent = newVal.savedSupporters.filter((s) => s.key == entry.key).length === 0;
        if (absent) {
          supporterInputResultMap.delete(entry.key);
          delete selectedBuildname[entry.key];
        }
      }
      await Promise.all(workPromiseArr);  // ここをPromise.allでやっちゃっていいかは…？
      onChange();
    })

    return {
      displayName,
      displayOptionName,

      SUPPORTER_KEY_LIST,
      supporterCheckboxList,
      supporterSelectList,
      supporterNumberList,
      conditionValues,
      supporterVisible,
      supporterOptionSelectedClass,
      conditionDisabled,
      displayStatAjustmentList,
      elementBgClass,

      initializeSupporters,
      onChange,
      initializeValues,

      supporterOpenClose,
      closeAllSupporters,
      clearAllSupporterOptions,

      builddataSelectable,
      builddataSelectorVisible,
      buildnameList,
      selectedBuildname,
      buildnameSelectionOnChange,
      addToTeamOnClick,
      removeFromTeamOnClick,

      characterIconSrc,
      characterVisionIconSrc,
      weaponIconSrc,
      weaponName,
      artifactSetIconSrc,
      artifactSetName,
    };
  },
});
</script>
<style scoped>
div.left {
  text-align: left;
  width: 100%;
}

fieldset.supporter {
  margin-bottom: 10px;
  padding-top: 0;
}

legend.supporter {
  border-width: 0 0 2px 0;
  border-radius: 0;
}

label {
  display: inline-block;
  margin: 2px 3px;
  text-align: left;
}

.unfold {
  text-align: center;
  padding: 0;
  background-color: transparent;
  border: none;
  width: 20rem;
}

.fold {
  text-align: center;
  width: 36px;
}

span.remove {
  color: goldenrod;
}

button:disabled span.add {
  color: gray;
}

label.condition {
  min-width: calc(100% / 3 - 1rem - 6px);
}

:disabled+label {
  color: gray;
}

.supporter-else.selected {
  border: 1px solid white;
  background-color: darkgoldenrod;
}

p.notice {
  text-align: left;
  color: chocolate;
}

div.supporter-else,
div.supporter {
  display: inline-block;
  min-width: 72px;
  white-space: nowrap;
  margin-right: 1px;
  border-radius: 10px;
  margin-bottom: 1px;
}

div.supporter-else {
  border: 1px solid black;
}

div.supporter label.fold {
  padding: 0;
  margin: 2px 3px;
}

div.supporter button,
div.supporter-else button {
  display: inline-block;
  padding: 0;
  margin: 0 3px;
  border: none;
  background: transparent;
  vertical-align: middle;
  color: blanchedalmond;
}

div.supporter button span,
div.supporter-else button span {
  width: 20px;
  height: 20px;
  font-size: 20px;
}

.builddata-selector {
  display: inline-block;
  margin-right: 5px;
  width: calc(100% - 194px);
}

.builddata-selector label {
  width: 100%;
}

.builddata-selector label select,
.builddata-selector label select option {
  width: 100%;
  background: black;
  color: blanchedalmond;
}

.builddata-selector label select option:focus {
  background: linear-gradient(red, red);
  color: blanchedalmond;
}


span.builddata-selector .material-symbols-outlined {
  font-size: 2.4rem;
}

div.character {
  position: relative;
  display: inline-block;
  margin-left: 4px;
  margin-right: 4px;
}

div.character img.character {
  width: 36px;
  height: 36px;
}

div.character img.vision {
  width: 12px;
  height: 12px;
  position: absolute;
  left: 2px;
  top: 2px;
}

div.equipment,
div.with-tooltip {
  display: inline-block;
}

div.equipment img {
  width: 36px;
  height: 36px;
}

.pyro-bg {
  background: rgba(204, 98, 98, 0.7);
}

.hydro-bg {
  background: rgba(80, 138, 204, 0.7);
}

.anemo-bg {
  background: rgba(80, 204, 162, 0.7);
}

.electro-bg {
  background: rgba(204, 110, 204, 0.7);
}

.dendro-bg {
  background: rgba(110, 204, 88, 0.7);
}

.cryo-bg {
  background: rgba(99, 204, 204, 0.7);
}

.geo-bg {
  background: rgba(204, 166, 99, 0.7);
}

button.execute {
  padding-left: 1rem;
  padding-right: 1rem;
}

input[type="number"] {
  text-align: right;
}
</style>
