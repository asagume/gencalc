<template>
  <fieldset class="team-option">
    <fieldset class="supporter" v-for="supporter in supporterKeyList" :key="supporter">
      <legend>{{ displayName(supporter) }}</legend>
      <div class="left">
        <label v-for="item in supporterCheckboxList(supporter)" :key="item.name">
          <input
            type="checkbox"
            v-model="conditionValues[item.name]"
            :value="item.name"
            :disabled="conditionDisabled(item)"
            @change="onChange"
          />
          <span> {{ displayName(item.displayName) }}</span>
        </label>
        <label v-for="item in supporterSelectList(supporter)" :key="item.name">
          <span> {{ displayName(item.displayName) }} </span>
          <select
            v-model="conditionValues[item.name]"
            :disabled="conditionDisabled(item)"
            @change="onChange"
          >
            <option v-for="(option, index) in item.options" :value="index" :key="option">
              {{ displayOptionName(option) }}
            </option>
          </select>
        </label>
      </div>
    </fieldset>
    <hr />
    <ul class="option-description">
      <li v-for="item in displayStatAjustmentList" :key="item">{{ item }}</li>
    </ul>
  </fieldset>
</template>

<script lang="ts">
import {
  calculateArtifactStats,
  calculateArtifactStatsMain,
  calculateFormulaArray,
  calculateResult,
  calculateStats,
  checkConditionMatches,
  isUseReference,
  makeValidConditionValueArr,
} from "@/calculate";
import { deepcopy } from "@/common";
import GlobalMixin from "@/GlobalMixin.vue";
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
  STAT_PERCENT_LIST,
} from "@/input";
import { TEAM_OPTION_MASTER_LIST } from "@/master";
import { computed, defineComponent, reactive } from "vue";

export default defineComponent({
  name: "TeamOptionInput",
  mixins: [GlobalMixin],
  emits: ["update:team-option"],
  setup(props, context) {
    const savedSupporters = Object.keys(localStorage)
      .filter((s) => s.startsWith("構成_") && s.split("_").length == 2)
      .map((s) => ({ key: s, value: localStorage[s] }));

    const supporterMap = computed(() => {
      const result = new Map();
      for (const entry of TEAM_OPTION_MASTER_LIST) {
        result.set(entry.key.split("_")[0], entry);
      }
      return result;
    });
    const supporterKeyList = computed(() => {
      return Array.from(supporterMap.value.keys());
    });

    const loadSupporterData = async () => {
      for (const supporter of supporterKeyList.value) {
        const storageKey = "あなたの" + supporter;
        if (localStorage[storageKey]) {
          const supporterSavedata = JSON.parse(localStorage[storageKey]);
          const characterInput = deepcopy(CHARACTER_INPUT_TEMPLATE) as TCharacterInput;
          const artifactDetailInput = deepcopy(
            ARTIFACT_DETAIL_INPUT_TEMPLATE
          ) as TArtifactDetailInput;
          const conditionInput = deepcopy(CONDITION_INPUT_TEMPLATE) as TConditionInput;
          const optionInput = deepcopy(OPTION_INPUT_TEMPLATE) as TOptionInput;
          const statsInput = deepcopy(STATS_INPUT_TEMPLATE) as TStatsInput;
          const damageResult = deepcopy(DAMAGE_RESULT_TEMPLATE) as TDamageResult;
          await loadRecommendation(
            characterInput,
            artifactDetailInput,
            conditionInput,
            supporterSavedata
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
          calculateResult(
            damageResult,
            characterInput as any,
            conditionInput as any,
            statsInput
          );
        }
      }
    };

    const damageDetailArr = [] as any[];
    const statusChangeDetailObjArr = [] as any[];
    const talentChangeDetailObjArr = [] as any[];
    const conditionMap = new Map() as Map<string, any[] | null>;
    const exclusionMap = new Map() as Map<string, string[] | null>;
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
    console.log("team damageDetailArr", damageDetailArr);
    statusChangeDetailObjArr
      .filter((s) => s["条件"])
      .forEach((detailObj) => {
        makeConditionExclusionMapFromStr(detailObj["条件"], conditionMap, exclusionMap);
      });
    console.log("team statusChangeDetailObjArr", statusChangeDetailObjArr);
    talentChangeDetailObjArr
      .filter((s) => s["条件"])
      .forEach((detailObj) => {
        makeConditionExclusionMapFromStr(detailObj["条件"], conditionMap, exclusionMap);
      });
    console.log("team talentChangeDetailObjArr", talentChangeDetailObjArr);
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
          const require = value[0].startsWith("required_");
          selectList.push({
            name: key,
            options: value,
            require: require,
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

    const supporterCheckboxList = (supporter: any) => {
      return checkboxList.filter((s) => s.name.startsWith(supporter));
    };

    const supporterSelectList = (supporter: any) => {
      return selectList.filter((s) => s.name.startsWith(supporter));
    };

    const conditionDisabled = (item: any): boolean => {
      const supporter = item.name.split("_")[0];
      if (savedSupporters.includes(supporter)) return false;
      for (const myDetailObj of statusChangeDetailObjArr) {
        if (myDetailObj.条件.startsWith(item.name)) {
          if (isUseReference(myDetailObj.数値)) {
            return true;
          }
        }
      }
      return false;
    };

    const statAdjustments = computed(() => {
      const workObj = {} as TStats;
      const validConditionValueArr = makeValidConditionValueArr(conditionInput);
      for (const myDetailObj of statusChangeDetailObjArr) {
        let myNew数値 = myDetailObj["数値"];
        if (myDetailObj["条件"]) {
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
        const myValue = calculateFormulaArray(myNew数値, workObj, damageResultDummy);
        if (myDetailObj["種類"] in workObj) {
          workObj[myDetailObj["種類"]] += myValue;
        } else {
          workObj[myDetailObj["種類"]] = myValue;
        }
      }
      return workObj;
    });

    const displayStatAjustmentList = computed(() => {
      const resultArr = [];
      for (const stat of Object.keys(statAdjustments.value)) {
        let str = stat
          .replace("%", "")
          .replace(/^敵/, "敵の")
          .replace("ダメージ会心", "ダメージの会心");
        str += statAdjustments.value[stat] >= 0 ? "+" : "";
        str += statAdjustments.value[stat];
        if (
          stat.endsWith("%") ||
          STAT_PERCENT_LIST.includes(stat) ||
          stat.endsWith("会心率") ||
          stat.endsWith("会心ダメージ")
        )
          str += "%";
        resultArr.push(str);
      }
      return resultArr;
    });

    const onChange = () => {
      console.log(conditionValues, statAdjustments.value);
      context.emit("update:team-option", statAdjustments.value);
    };

    return {
      supporterKeyList,
      supporterCheckboxList,
      supporterSelectList,
      conditionValues,
      conditionDisabled,
      onChange,
      displayStatAjustmentList,
    };
  },
});
</script>
<style scoped>
div.left {
  text-align: left;
}

label {
  display: inline-block;
  margin: 2px 1rem;
  min-width: calc(100% / 3 - 2rem);
  text-align: left;
}

label input,
label select {
  margin: 0 0.5rem;
}

:checked + span {
  color: palevioletred;
}
</style>
