<template>
  <div class="member-area">
    <img :src="memberIconSrc(character)" :alt="displayName(character)">
    <template v-for="member in teamMembers" :key="member">
      <img :src="memberIconSrc(member)" :alt="displayName(member)" @click="removeFromTeamOnClick(member)">
    </template>
  </div>

  <fieldset class="team-option">
    <template v-for="supporter in supporterKeyList" :key="supporter">
      <fieldset v-if="supporterOpenClose[supporter]" class="supporter" v-show="supporterVisible(supporter)">
        <legend class="supporter">
          <input class="hidden" :id="'supporter-' + supporter" type="checkbox"
            v-model="supporterOpenClose[supporter]" />
          <label class="toggle-switch unfold" :for="'supporter-' + supporter">
            <span>{{ displayName(supporter) }}</span>
          </label>
          <template v-if="builddataSelectable(supporter)">
            <span class="builddata-selector" @click="
              builddataSelectorVisible[supporter] = !builddataSelectorVisible[supporter]
            ">
              <span class="material-symbols-outlined"> settings </span>
            </span>
          </template>
        </legend>
        <div class="builddata-selector" v-show="builddataSelectorVisible[supporter]">
          <label>buildname
            <select v-model="selectedBuildname[supporter]" @change="buildnameSelectionOnChange">
              <option v-for="item in buildnameList(supporter)" :value="item" :key="item">
                {{ item }}
              </option>
            </select>
          </label>
        </div>
        <div class="team">
          <template v-if="teamMembers.includes(supporter)">
            <button type="button" @click="removeFromTeamOnClick(supporter)">
              Remove from Team
            </button>
          </template>
          <template v-else>
            <button type="button" :disabled="teamMembers.length >= 3" @click="addToTeamOnClick(supporter)">
              Add to Team
            </button>
          </template>
        </div>
        <div class="left">
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
              :disabled="conditionDisabled(item)" @change="onChange(supporter, item)" />
          </label>
        </div>
      </fieldset>
      <template v-else>
        <div v-show="supporterVisible(supporter)" class="supporter-else">
          <input class="hidden" :id="'supporter-else-' + supporter" type="checkbox"
            v-model="supporterOpenClose[supporter]" />
          <label :class="'toggle-switch fold' + supporterOptionSelectedClass(supporter)"
            :for="'supporter-else-' + supporter">
            <span>{{ displayName(supporter) }}</span>
          </label>
        </div>
      </template>
    </template>

    <hr />

    <ul class="option-description">
      <li v-for="item in displayStatAjustmentList" :key="item">{{ item }}</li>
    </ul>

    <label>
      {{ displayName("すべて閉じる") }}
      <button type="button" @click="closeAllSupporters">{{ displayName("実行") }}</button>
    </label>
    <label>
      {{ displayName("すべてクリア") }}
      <button type="button" @click="clearAllSupporterOptions">
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
  calculateFormulaArray,
  checkConditionMatches,
  makeValidConditionValueArr,
} from "@/calculate";
import { deepcopy, isNumber, overwriteObject } from "@/common";
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
} from "@/input";
import {
  CHARACTER_MASTER,
  getCharacterMasterDetail,
  TCharacterKey,
  TEAM_OPTION_MASTER_LIST,
} from "@/master";
import { computed, defineComponent, nextTick, PropType, reactive, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

type TCOnditionValuesAny = { [key: string]: any };

export default defineComponent({
  name: "TeamOptionInput",
  props: {
    character: { type: String as PropType<TCharacterKey>, required: true },
    topStats: {
      type: Object as PropType<TStats>,
      required: true,
    },
    savedSupporters: {
      type: Object as PropType<{ key: string; value: string, buildname: string }[]>,
      required: true,
    },
    calculatedSupporters: {
      type: Object as PropType<{ [key: string]: TSupporterInput | undefined }>,
      required: true,
    },
    teamMembers: {
      type: Array as PropType<string[]>,
      required: true,
    }
  },
  emits: ["update:team-option", "update:buildname-selection", 'update:team-members'],
  setup(props, context) {
    const {
      displayName,
      displayStatName,
      displayStatValue,
      displayOptionName,
    } = CompositionFunction();

    const supporterKeyList = Object.keys(CHARACTER_MASTER);
    const supporterOpenClose = reactive({} as { [key: string]: boolean });

    const damageDetailArr = [] as any[];
    const statusChangeDetailObjArr: TDamageDetailObj[] = [];
    const talentChangeDetailObjArr: TDamageDetailObj[] = [];
    const conditionMap = new Map() as Map<string, string[] | null | object>;
    const exclusionMap = new Map() as Map<string, string[] | null>;
    const conditionInput = reactive(
      deepcopy(CONDITION_INPUT_TEMPLATE) as TConditionInput
    );
    const conditionValues = conditionInput.conditionValues as TCOnditionValuesAny;
    const checkboxList = conditionInput.checkboxList;
    const selectList = conditionInput.selectList;
    const numberList = conditionInput.numberList;
    const statsObjDummy = deepcopy(ステータスTEMPLATE);
    const damageResultDummy = deepcopy(DAMAGE_RESULT_TEMPLATE);

    const additionalConditions: string[] = [];

    const builddataSelectorVisible = reactive({} as { [key: string]: boolean });
    const selectedBuildname = reactive({} as { [key: string]: string | null });
    const supporterDamageResult = reactive(
      new Map() as Map<string, [TStats, TDamageResult]>
    );

    for (const masterList of [TEAM_OPTION_MASTER_LIST]) {
      for (const entry of masterList) {
        const supporter = entry.key.split("_")[0];
        if ("詳細" in entry) {
          for (const detailObj of entry.詳細) {
            if ("条件" in detailObj) {
              if (!(detailObj as any).条件.startsWith(supporter + "*")) {
                (detailObj as any).条件 = supporter + "*" + detailObj.条件;
              }
            } else {
              (detailObj as any).条件 = supporter + "*" + entry.名前;
            }
          }
        }
        damageDetailArr.splice(damageDetailArr.length, 0, ...makeDamageDetailObjArr(entry, null, null, null, statusChangeDetailObjArr, talentChangeDetailObjArr, "その他オプション"));
      }
    }
    damageDetailArr
      .filter((s) => s["条件"])
      .forEach((detailObj) => {
        makeConditionExclusionMapFromStr(detailObj["条件"] as string, conditionMap, exclusionMap);
      });
    statusChangeDetailObjArr
      .filter((s) => s["条件"])
      .forEach((detailObj) => {
        makeConditionExclusionMapFromStr(detailObj["条件"] as string, conditionMap, exclusionMap);
      });
    talentChangeDetailObjArr
      .filter((s) => s["条件"])
      .forEach((detailObj) => {
        makeConditionExclusionMapFromStr(detailObj["条件"] as string, conditionMap, exclusionMap);
      });
    conditionMap.forEach((value, key) => {
      if (value && Array.isArray(value)) {
        if (!value[0].startsWith("required_")) {
          conditionMap.set(key, ["", ...value]);
        }
      }
    });

    const updateConditionList = () => {
      conditionMap.forEach((value: string[] | null | object, key: string) => {
        if (value === null) { // checkbox
          if (checkboxList.filter((s) => s.name == key).length == 0) {
            checkboxList.push({
              name: key,
              displayName: key.replace(/^.+\*/, "")
            });
          }
        } else if (Array.isArray(value)) {  // select
          if (selectList.filter((s) => s.name == key).length == 0) {
            const required = value[0].startsWith("required_");
            selectList.push({
              name: key,
              displayName: key.replace(/^.+\*/, ""),
              options: (required || !value[0]) ? value : ['', ...value],
              required: required,
            });
          }
        } else if (_.isPlainObject(value)) {  // number
          numberList.push({
            name: key,
            displayName: key.replace(/^.+\*/, ""),
            min: (value as any).min,
            max: (value as any).max,
            step: (value as any).step,
          });
        }
      });
      conditionMap.forEach((value, key) => {
        if (value === null) { // checkbox
          if (!(key in conditionValues)) conditionValues[key] = false;
        } else if (Array.isArray(value)) {  // select
          if (!(key in conditionValues)) conditionValues[key] = 0;
        } else if (_.isPlainObject(value)) {  // number
          if (!(key in conditionValues)) conditionValues[key] = (value as any).min;
        }
      });
    };

    const takeMasterTeamOption = (character: string, master: any) => {
      if ("チームバフ" in master) {
        const detailObjArr = master.チームバフ as any[];
        const damageDetailObjArr: TDamageDetailObj[] = makeTeamOptionDetailObjArr(detailObjArr);
        damageDetailObjArr.forEach((damageDetailObj) => {
          let condition = character + "*";
          if (damageDetailObj.条件) condition += damageDetailObj.条件;
          else condition += damageDetailObj.名前;
          damageDetailObj.条件 = condition;
          if (!additionalConditions.includes(condition)) {
            additionalConditions.push(condition);
          }
          const changeKind = getChangeKind(damageDetailObj.種類 as string);
          if (
            changeKind == "STATUS" &&
            statusChangeDetailObjArr.filter((s) => s.条件 == condition && s.種類 == damageDetailObj.種類).length == 0
          ) {
            statusChangeDetailObjArr.splice(statusChangeDetailObjArr.length, 0, damageDetailObj);
          }
          if (
            changeKind == "TALENT" &&
            talentChangeDetailObjArr.filter((s) => s.条件 == condition && s.種類 == damageDetailObj.種類).length == 0
          ) {
            talentChangeDetailObjArr.splice(talentChangeDetailObjArr.length, 0, damageDetailObj);
          }
          makeConditionExclusionMapFromStr(condition, conditionMap, exclusionMap);
        });
        updateConditionList();
      }
    };

    async function setupFromCharacterMaster() {
      for (const character of Object.keys(CHARACTER_MASTER)) {
        const characterMaster = await getCharacterMasterDetail(character as TCharacterKey);
        takeMasterTeamOption(character, characterMaster);
      }
    }

    const setupSupporterDamageResult = (savedSupporter: {
      key: string;
      value: string;
    }): [TStats, TDamageResult] => {
      const calculatedSupporter = props.calculatedSupporters[savedSupporter.key];
      if (!calculatedSupporter) {
        return [_.cloneDeep(ステータスTEMPLATE), _.cloneDeep(DAMAGE_RESULT_TEMPLATE)];
      }
      const characterInput = calculatedSupporter.characterInput;
      const statsInput = calculatedSupporter.statsInput;
      const damageResult = calculatedSupporter.damageResult;

      // マスターから取り込んだチームバフを削除します
      const removeConditions: string[] = additionalConditions.filter((s) =>
        s.startsWith(characterInput.character + "*")
      );
      if (removeConditions.length > 0) {
        statusChangeDetailObjArr.splice(0, statusChangeDetailObjArr.length, ...statusChangeDetailObjArr.filter((s) => !removeConditions.includes(s.条件 as string)));
        talentChangeDetailObjArr.splice(0, talentChangeDetailObjArr.length, ...talentChangeDetailObjArr.filter((s) => !removeConditions.includes(s.条件 as string)));
        removeConditions.forEach((condition) => {
          if (conditionMap.has(condition)) {
            conditionMap.delete(condition);
          }
        });
        checkboxList.splice(0, checkboxList.length, ...checkboxList.filter((s) => !removeConditions.includes(s.name)));
        selectList.splice(0, selectList.length, ...selectList.filter((s) => !removeConditions.includes(s.name)));
        numberList.splice(0, numberList.length, ...numberList.filter((s) => !removeConditions.includes(s.name)));
        additionalConditions.splice(0, additionalConditions.length, ...additionalConditions.filter((s) => !removeConditions.includes(s)));
      }

      // キャラクターマスターに記述したチームバフを取り込みます
      takeMasterTeamOption(characterInput.character, characterInput.characterMaster);

      // 武器マスターに記述したチームバフを取り込みます
      takeMasterTeamOption(characterInput.character, characterInput.weaponMaster);

      return [statsInput.statsObj, damageResult];
    };

    const supporterCheckboxList = (supporter: any) => {
      return checkboxList.filter((s) => s.name.startsWith(supporter + "*"));
    };

    const supporterSelectList = (supporter: any) => {
      return selectList.filter((s) => s.name.startsWith(supporter + "*"));
    };

    const supporterNumberList = (supporter: any) => {
      return numberList.filter((s) => s.name.startsWith(supporter + "*"));
    };

    /** 選択中のキャラクターのオプションは無効です */
    const supporterVisible = (supporter: any) => {
      if (supporter == props.character) return false;
      if (supporterCheckboxList(supporter).length) return true;
      if (supporterSelectList(supporter).length) return true;
      if (supporterNumberList(supporter).length) return true;
      return false;
    };

    const supporterOptionSelectedClass = (supporter: any) => {
      for (const entry of supporterCheckboxList(supporter)) {
        if (conditionValues[entry.name]) return " selected";
      }
      for (const entry of supporterSelectList(supporter)) {
        if (!entry.required && conditionValues[entry.name]) return " selected";
      }
      return "";
    };

    /** サポーターのステータス（天賦レベル）を参照するオプションには保存データが必要です */
    const conditionDisabled = (item: any): boolean => {
      const supporter = item.name.split("*")[0];
      if (props.savedSupporters.filter((s) => s.key == supporter).length > 0)
        return false;
      for (const myDetailObj of statusChangeDetailObjArr) {
        if (myDetailObj.条件) {
          if (myDetailObj.条件.startsWith(item.name)) {
            if (isNumber(myDetailObj.数値)) return false;
            if (Array.isArray(myDetailObj.数値)) {
              for (const entry of myDetailObj.数値) {
                if (!isNumber(entry) && !["+", "-", "*", "/"].includes(entry)) return true;
              }
            }
          }
        }
      }
      for (const myDetailObj of talentChangeDetailObjArr) {
        if (myDetailObj.条件) {
          if (myDetailObj.条件.startsWith(item.name)) {
            if (isNumber(myDetailObj.数値)) return false;
            if (Array.isArray(myDetailObj.数値)) {
              for (const entry of myDetailObj.数値) {
                if (!isNumber(entry) && !["+", "-", "*", "/"].includes(entry)) return true;
              }
            }
          }
        }
      }
      return false;
    };

    /** ステータス補正値を計算します */
    const statAdjustments = computed(() => {
      const workObj = {} as TStats;
      const validConditionValueArr = makeValidConditionValueArr(conditionInput);
      [statusChangeDetailObjArr, talentChangeDetailObjArr].forEach((detailObjArr) => {
        if (detailObjArr) {
          for (const myDetailObj of detailObjArr) {
            let supporter;
            let myNew数値 = myDetailObj.数値;
            const my上限 = myDetailObj.上限;
            const my下限 = myDetailObj.下限;
            if (myDetailObj.条件) {
              supporter = myDetailObj.条件.substring(0, myDetailObj.条件.indexOf("*"));
              if (supporter == props.character) continue;
              const number = checkConditionMatches(myDetailObj.条件, validConditionValueArr, 6);
              if (!number || number == 0) continue;
              if (number != 1 && myNew数値) {
                myNew数値 = (myNew数値 as any).concat(["*", number]);
              }
            }
            let statsObj: TStats = statsObjDummy;
            let damageResult: TDamageResult = damageResultDummy;
            if (supporter) {
              const temp = supporterDamageResult.get(supporter);
              if (temp) {
                statsObj = temp[0];
                damageResult = temp[1];
              }
            }
            Object.keys(props.topStats).forEach(stat => { // チーム内で最も高いステータスをセットします
              statsObj[stat] = props.topStats[stat];
            });
            let myValue = Infinity;
            if (myNew数値) {
              myValue = calculateFormulaArray(myNew数値, statsObj, damageResult, my上限, my下限);
            }
            const kinds = [] as string[];
            if (myDetailObj.種類) {
              if (
                myDetailObj.種類.startsWith("全") ||
                myDetailObj.種類.startsWith("敵全")
              ) {
                for (const elem of ["炎", "水", "風", "雷", "草", "氷", "岩"]) {
                  kinds.push(myDetailObj.種類.replace("全", elem));
                }
              } else {
                kinds.push(myDetailObj.種類);
              }
            }
            for (const kind of kinds) {
              let tempKind = kind;
              if (myDetailObj.対象) tempKind += "." + myDetailObj.対象;
              if (tempKind in workObj) {
                workObj[tempKind] += myValue;
              } else {
                workObj[tempKind] = myValue;
              }
            }
          }
        }
      });
      return workObj;
    });

    /** ステータス補正値を表示用の形式に編集します */
    const displayStatAjustmentList = computed(() => {
      const resultArr = [];
      for (const stat of Object.keys(statAdjustments.value)) {
        let result: string = displayStatName(stat).replace("%", "");
        const value = statAdjustments.value[stat];
        if (value != Infinity) {
          if (isNumber(value)) {
            if (value >= 0) {
              if (stat.split(".")[0] == "別枠乗算") result += "=";
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
    });

    async function onLoad() {
      updateConditionList();
      setupFromCharacterMaster();

      for (const key of supporterKeyList) {
        supporterOpenClose[key] = false;
      }

      for (const entry of props.savedSupporters) {
        selectedBuildname[entry.key] = entry.buildname;
        supporterDamageResult.set(entry.key, setupSupporterDamageResult(entry));
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
      context.emit("update:team-option", conditionInput);
    };

    const initializeValues = async (initialObj: TConditionInput) => {
      Object.keys(conditionValues).forEach((key) => {
        if (key in initialObj.conditionValues) {
          conditionValues[key] = initialObj.conditionValues[key];
        } else {
          if (conditionMap.has(key)) {
            const value = conditionMap.get(key);
            if (value === null) {
              conditionValues[key] = false;
            } else if (Array.isArray(value)) {
              conditionValues[key] = 0;
            } else if (_.isPlainObject(value)) {
              conditionValues[key] = (value as any).min;
            }
          }
        }
      });
      for (const entry of props.savedSupporters) {
        selectedBuildname[entry.key] = entry.buildname;
        supporterDamageResult.set(entry.key, setupSupporterDamageResult(entry));
      }
      onChange();
    };

    const closeAllSupporters = () => {
      for (const supporter of Object.keys(supporterOpenClose)) {
        supporterOpenClose[supporter] = false;
      }
    };

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
    };

    function convertBuildname(character: string, storageKey: string) {
      const prefix = makeBuildStorageKey(character);
      if (storageKey == prefix) return makeDefaultBuildname(character);
      return storageKey.replace(new RegExp("^" + prefix + "_"), "");
    }

    const buildnameList = (character: string) => {
      const re = new RegExp("^構成_" + character + "(_|$)");
      const storageKeys = Object.keys(localStorage).filter((s) => re.test(s));
      const list = storageKeys.map((s) => convertBuildname(character, s));
      const defaultBuildname = makeDefaultBuildname(character);
      const result = list.filter((s) => s != defaultBuildname).sort();
      if (list.includes(defaultBuildname)) result.unshift(defaultBuildname);
      return result;
    };

    const builddataSelectable = (character: string) => {
      return buildnameList(character).length > 0;
    };

    supporterKeyList.forEach((supporter) => {
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
    });
    const buildnameSelectionOnChange = () => {
      context.emit("update:buildname-selection", selectedBuildname);
    };

    function updateTeamMembers(teamMembers: string[]) {
      context.emit("update:team-members", teamMembers);
    }

    const addToTeamOnClick = (supporer: string) => {
      updateTeamMembers([...props.teamMembers, supporer]);
    };

    const removeFromTeamOnClick = (member: string) => {
      updateTeamMembers(props.teamMembers.filter(s => s != member));
    };

    const memberIconSrc = (member: string) => {
      return (CHARACTER_MASTER as any)[member].icon_url;
    };

    watch(props, async (newVal, oldVal) => {
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
            setupSupporterDamageResult(savedSupporter[0]);
          }
          selectedBuildname[key] = savedSupporter[0].buildname;
        }
      }
      for (const entry of oldVal.savedSupporters) {
        const absent = newVal.savedSupporters.filter((s) => s.key == entry.key).length == 0;
        if (absent) {
          supporterDamageResult.delete(entry.key);
          delete selectedBuildname[entry.key];
        }
      }
      onChange();
    });

    return {
      displayName,
      displayOptionName,

      supporterKeyList,
      supporterCheckboxList,
      supporterSelectList,
      supporterNumberList,
      conditionValues,
      supporterVisible,
      supporterOptionSelectedClass,
      conditionDisabled,
      displayStatAjustmentList,

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

      memberIconSrc,
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
  margin: 2px 0.5rem;
  text-align: left;
}

div.supporter-else {
  display: inline-block;
  width: calc(100% / 3);
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
  width: calc(100% - 3rem - 6px);
}

label.condition {
  min-width: calc(100% / 3 - 1rem - 6px);
}

:disabled+label {
  color: gray;
}

label.selected {
  background-color: maroon;
}

p.notice {
  text-align: left;
  color: chocolate;
}

.builddata-selector {
  width: 90%;
  margin-left: auto;
  margin-right: auto;
}

.builddata-selector label {
  width: 100%;
}

span.builddata-selector .material-symbols-outlined {
  font-size: 2.4rem;
}

.member-area img {
  width: 32px;
  height: 32px;
}
</style>
