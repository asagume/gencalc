<template>
  <fieldset class="team-option">
    <template v-for="supporter in supporterKeyList" :key="supporter">
      <fieldset v-if="supporterOpenClose[supporter]" class="supporter">
        <legend>
          <input class="hidden" :id="'supporter-' + supporter" type="checkbox"
            v-model="supporterOpenClose[supporter]" />
          <label class="toggle-switch" :for="'supporter-' + supporter">
            <span>{{ displayName(supporter) }}</span>
          </label>
        </legend>
        <div class="left">
          <label class="condition" v-for="item in supporterCheckboxList(supporter)" :key="item.name">
            <input type="checkbox" v-model="conditionValues[item.name]" :value="item.name"
              :disabled="conditionDisabled(item)" @change="onChange" />
            <span> {{ displayName(item.displayName) }}</span>
          </label>
          <label class="condition" v-for="item in supporterSelectList(supporter)" :key="item.name">
            <span> {{ displayName(item.displayName) }} </span>
            <select v-model="conditionValues[item.name]" :disabled="conditionDisabled(item)" @change="onChange">
              <option v-for="(option, index) in item.options" :value="index" :key="option">
                {{ displayOptionName(option) }}
              </option>
            </select>
          </label>
        </div>
      </fieldset>
      <template v-else>
        <input class="hidden" :id="'supporter-else-' + supporter" type="checkbox"
          v-model="supporterOpenClose[supporter]" :disabled="supporterDisabled(supporter)" />
        <label :class="'toggle-switch' + supporterOptionSelectedClass(supporter)" :for="'supporter-else-' + supporter">
          <span>{{ displayName(supporter) }}</span>
        </label>
      </template>
    </template>

    <hr />

    <ul class="option-description">
      <li v-for="item in displayStatAjustmentList" :key="item">{{ item }}</li>
    </ul>

    <label>
      {{ displayName("すべて閉じる") }}
      <button type="button" @click="closeAllSupporters"> {{ displayName("実行") }} </button>
    </label>
    <label>
      {{ displayName("すべてクリア") }}
      <button type="button" @click="clearAllSupporterOptions"> {{ displayName("実行") }} </button>
    </label>
  </fieldset>

  <p class="notice">
    キャラクターの天賦レベルやステータスによって効果量が変動する種類のオプションはデフォルト名称の構成保存データが存在する場合に選択可能になります。
    <br />
    構成保存データのデフォルト名称：あなたの{キャラクターの名前}
  </p>
</template>

<script lang="ts">
import {
  calculateArtifactStats,
  calculateArtifactStatsMain,
  calculateFormulaArray,
  calculateDamageResult,
  calculateStats,
  checkConditionMatches,
  makeValidConditionValueArr,
} from "@/calculate";
import { deepcopy, isNumber } from "@/common";
import {
  ARTIFACT_DETAIL_INPUT_TEMPLATE,
  CHARACTER_INPUT_TEMPLATE,
  CONDITION_INPUT_TEMPLATE,
  DAMAGE_RESULT_TEMPLATE,
  loadRecommendation,
  makeDamageDetailObjArrObjArtifactSets,
  makeDamageDetailObjArrObjCharacter,
  makeDamageDetailObjArrObjWeapon,
  setupConditionValues,
  OPTION_INPUT_TEMPLATE,
  STATS_INPUT_TEMPLATE,
  TArtifactDetailInput,
  TCharacterInput,
  TConditionInput,
  TDamageResult,
  TOptionInput,
  TStatsInput,
  TCheckboxEntry,
  TSelectEntry,
  makeDamageDetailObjArr,
  makeConditionExclusionMapFromStr,
  TStats,
} from "@/input";
import { getCharacterMasterDetail, TCharacterKey, TEAM_OPTION_MASTER_LIST } from "@/master";
import { computed, defineComponent, PropType, reactive, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
  name: "TeamOptionInput",
  props: {
    character: { type: String as PropType<TCharacterKey>, required: true },
    savedSupporters: { type: Object as PropType<{ key: string; value: string }[]>, required: true },
  },
  emits: ["update:team-option"],
  setup(props, context) {
    const { displayName, displayStatValue, displayOptionName } = CompositionFunction();

    const supporterKeyList = reactive([] as string[]);
    const supporterOpenClose = reactive({} as { [key: string]: boolean });

    const damageDetailArr = [] as any[];
    const statusChangeDetailObjArr = [] as any[];
    const talentChangeDetailObjArr = [] as any[];
    const conditionMap = new Map() as Map<string, string[]>;
    const exclusionMap = new Map() as Map<string, string[]>;
    const conditionInput = reactive({
      conditionValues: {} as { [key: string]: any },
      checkboxList: [] as (TCheckboxEntry & { displayName: string })[],
      selectList: [] as (TSelectEntry & { displayName: string })[],
    });
    const conditionValues = conditionInput.conditionValues;
    const checkboxList = conditionInput.checkboxList;
    const selectList = conditionInput.selectList;
    const damageResultDummy = deepcopy(DAMAGE_RESULT_TEMPLATE);

    for (const masterList of [TEAM_OPTION_MASTER_LIST]) {
      for (const entry of masterList) {
        const supporter = entry.key.split("_")[0];
        if (!supporterKeyList.includes(supporter)) supporterKeyList.push(supporter);
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
        damageDetailArr.splice(
          damageDetailArr.length,
          0,
          ...makeDamageDetailObjArr(
            entry,
            null,
            null,
            null,
            statusChangeDetailObjArr,
            talentChangeDetailObjArr,
            "その他オプション"
          )
        );
      }
    }
    damageDetailArr
      .filter((s) => s["条件"])
      .forEach((detailObj) => {
        makeConditionExclusionMapFromStr(detailObj["条件"], conditionMap, exclusionMap);
      });
    statusChangeDetailObjArr
      .filter((s) => s["条件"])
      .forEach((detailObj) => {
        makeConditionExclusionMapFromStr(detailObj["条件"], conditionMap, exclusionMap);
      });
    talentChangeDetailObjArr
      .filter((s) => s["条件"])
      .forEach((detailObj) => {
        makeConditionExclusionMapFromStr(detailObj["条件"], conditionMap, exclusionMap);
      });
    conditionMap.forEach((value, key) => {
      if (value && Array.isArray(value)) {
        if (!value[0].startsWith("required_")) {
          conditionMap.set(key, ["", ...value]);
        }
      }
    });
    conditionMap.forEach((value: string[] | null, key: string) => {
      if (value) {
        if (selectList.filter((s) => s.name == key).length == 0) {
          const required = value[0].startsWith("required_");
          selectList.push({
            name: key,
            options: value,
            required: required,
            displayName: key.replace(/^.+\*/, ""),
          });
        }
      } else {
        if (checkboxList.filter((s) => s.name == key).length == 0) {
          checkboxList.push({ name: key, displayName: key.replace(/^.+\*/, "") });
        }
      }
    });
    conditionMap.forEach((value, key) => {
      if (value === null) {
        // checkbox
        conditionValues[key] = false;
      } else {
        // select
        conditionValues[key] = 0;
      }
    });
    for (const key of supporterKeyList) {
      supporterOpenClose[key] = false;
    }

    const supporterDamageResult = reactive(new Map() as Map<string, TDamageResult>);

    const setupSupporterDamageResult = async (savedSupporter: { key: string, value: string }) => {
      const characterInput = deepcopy(CHARACTER_INPUT_TEMPLATE) as TCharacterInput;
      const artifactDetailInput = deepcopy(ARTIFACT_DETAIL_INPUT_TEMPLATE) as TArtifactDetailInput;
      const conditionInput = deepcopy(CONDITION_INPUT_TEMPLATE) as TConditionInput;
      const optionInput = deepcopy(OPTION_INPUT_TEMPLATE) as TOptionInput;
      const statsInput = deepcopy(STATS_INPUT_TEMPLATE) as TStatsInput;
      const damageResult = deepcopy(DAMAGE_RESULT_TEMPLATE) as TDamageResult;

      characterInput.character = savedSupporter.key as TCharacterKey;
      characterInput.characterMaster = await getCharacterMasterDetail(characterInput.character);

      const builddata = JSON.parse(savedSupporter.value);

      await loadRecommendation(
        characterInput,
        artifactDetailInput,
        conditionInput,
        builddata
      );
      makeDamageDetailObjArrObjCharacter(characterInput);
      makeDamageDetailObjArrObjWeapon(characterInput);
      makeDamageDetailObjArrObjArtifactSets(characterInput);
      setupConditionValues(conditionInput, characterInput);
      calculateArtifactStatsMain(
        artifactDetailInput.聖遺物ステータスメイン効果,
        artifactDetailInput.聖遺物メイン効果
      );
      calculateArtifactStats(artifactDetailInput);
      calculateStats(
        statsInput,
        characterInput,
        artifactDetailInput,
        conditionInput,
        optionInput
      );

      if (characterInput.character == '雷電将軍') { // for 雷罰悪曜の眼
        const myCharacterMaster = await getCharacterMasterDetail(props.character);
        statsInput.statsObj['元素エネルギー'] = myCharacterMaster['元素爆発']['元素エネルギー'];
      }

      calculateDamageResult(
        damageResult,
        characterInput,
        conditionInput,
        statsInput
      );
      return damageResult;
    };

    const loadSupporterData = async () => {
      for (const savedSupporter of props.savedSupporters) {
        const damageResult = await setupSupporterDamageResult(savedSupporter);
        supporterDamageResult.set(savedSupporter.key, damageResult);
      }
    };
    loadSupporterData();

    const supporterCheckboxList = (supporter: any) => {
      return checkboxList.filter((s) => s.name.startsWith(supporter));
    };

    const supporterSelectList = (supporter: any) => {
      return selectList.filter((s) => s.name.startsWith(supporter));
    };

    /** 選択中のキャラクターのオプションは無効です */
    const supporterDisabled = (supporter: any) => {
      return supporter == props.character;
    }

    const supporterOptionSelectedClass = (supporter: any) => {
      for (const entry of supporterCheckboxList(supporter)) {
        if (conditionValues[entry.name]) return ' selected';
      }
      for (const entry of supporterSelectList(supporter)) {
        if (!entry.required && conditionValues[entry.name]) return ' selected';
      }
      return '';
    }

    /** サポーターのステータス（天賦レベル）を参照するオプションには保存データが必要です */
    const conditionDisabled = (item: any): boolean => {
      const supporter = item.name.split("*")[0];
      if (props.savedSupporters.filter(s => s.key == supporter).length > 0) return false;
      for (const myDetailObj of statusChangeDetailObjArr) {
        if (myDetailObj.条件.startsWith(item.name)) {
          if (isNumber(myDetailObj.数値)) return false;
          if (Array.isArray(myDetailObj.数値)) {
            for (const entry of myDetailObj.数値) {
              if (!isNumber(entry) && !['+', '-', '*', '/'].includes(entry)) return true;
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
      for (const myDetailObj of statusChangeDetailObjArr) {
        let supporter;
        let myNew数値 = myDetailObj["数値"];
        if (myDetailObj["条件"]) {
          supporter = myDetailObj["条件"].substring(0, myDetailObj["条件"].indexOf('*'));
          const number = checkConditionMatches(
            myDetailObj["条件"],
            validConditionValueArr,
            0
          );
          if (number == 0) continue;
          if (number != 1) {
            myNew数値 = (myNew数値 as any).concat(["*", number]);
          }
        }
        const damageResult = supporter ? supporterDamageResult.get(supporter) : damageResultDummy;
        const myValue = calculateFormulaArray(myNew数値, workObj, damageResult);
        const kinds = [] as string[];
        if (myDetailObj["種類"].startsWith('全') || myDetailObj["種類"].startsWith('敵全')) {
          for (const elem of ['炎', '水', '風', '雷', '草', '氷', '岩']) {
            kinds.push(myDetailObj["種類"].replace('全', elem))
          }
        } else {
          kinds.push(myDetailObj["種類"]);
        }
        for (const kind of kinds) {
          if (kind in workObj) {
            workObj[kind] += myValue;
          } else {
            workObj[kind] = myValue;
          }
        }
      }
      context.emit("update:team-option", workObj);
      return workObj;
    });

    /** ステータス補正値を表示用の形式に編集します */
    const displayStatAjustmentList = computed(() => {
      // TODO 多言語対応
      const resultArr = [];
      for (const stat of Object.keys(statAdjustments.value)) {
        let str = stat
          .replace("%", "")
          .replace(/^敵/, "敵の")
          .replace("ダメージ会心", "ダメージの会心");
        str += statAdjustments.value[stat] >= 0 ? "+" : "";
        str += displayStatValue(stat, statAdjustments.value[stat]);
        resultArr.push(str);
      }
      return resultArr;
    });

    /** オプションが変更されたことを上位に通知します */
    const onChange = () => {
      context.emit("update:team-option", statAdjustments.value);
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
    };

    watch(props, async (newVal, oldVal) => {
      for (const entry of newVal.savedSupporters) {
        const changed = oldVal.savedSupporters.filter(s => s.key == entry.key && s.value == entry.value).length > 0;
        if (changed
          || entry.key == '雷電将軍' // for 雷罰悪曜の眼
        ) {
          const damageResult = await setupSupporterDamageResult(entry);
          supporterDamageResult.set(entry.key, damageResult);
        }
      }
      for (const entry of oldVal.savedSupporters) {
        const absent = newVal.savedSupporters.filter(s => s.key == entry.key).length == 0;
        if (absent) {
          supporterDamageResult.delete(entry.key);
        }
      }
    });

    return {
      displayName, displayOptionName,

      supporterKeyList,
      supporterCheckboxList,
      supporterSelectList,
      conditionValues,
      supporterDisabled,
      supporterOptionSelectedClass,
      conditionDisabled,
      onChange,
      displayStatAjustmentList,
      supporterOpenClose,

      closeAllSupporters,
      clearAllSupporterOptions,
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
}

label {
  display: inline-block;
  margin: 2px 0.5rem;
  text-align: left;
}

label.toggle-switch {
  text-align: center;
  width: calc(100% / 3 - 3rem - 4px);
  min-width: none;
}

legend label.toggle-switch {
  padding: 0;
  background-color: transparent;
  border-width: 0 0 1px 0;
  border-radius: 0;
  width: 20rem;
}

label.condition {
  min-width: calc(100% / 3 - 1rem - 4px);
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
</style>
