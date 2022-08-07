<template>
  <fieldset>
    <label v-for="item in checkboxList" :key="item.name">
      <input type="checkbox" v-model="conditionValues[item.name]" :value="item" @change="onChange" />
      <span> {{ displayName(item.name) }}</span>
    </label>
    <label v-for="item in selectList" :key="item.name">
      <span> {{ displayName(item.name) }} </span>
      <select v-model="conditionValues[item.name]" @change="onChange">
        <option v-for="(option, index) in item.options" :value="index" :key="option">
          {{ displayOptionName(option) }}
        </option>
      </select>
    </label>
    <hr />
    <ul class="option-description">
      <li v-for="item in displayStatAjustmentList" :key="item">{{ item }}</li>
    </ul>
  </fieldset>
</template>

<script lang="ts">
import GlobalMixin from "@/GlobalMixin.vue";
import {
  calculateFormulaArray,
  checkConditionMatches,
  makeValidConditionValueArr,
} from "@/calculate";
import { deepcopy } from "@/common";
import {
  DAMAGE_RESULT_TEMPLATE,
  makeConditionExclusionMapFromStr,
  makeDamageDetailObjArr,
  STAT_PERCENT_LIST,
  TCheckboxEntry,
  TSelectEntry,
  TStats,
} from "@/input";
import { OPTION1_MASTER_LIST, OPTION2_MASTER_LIST } from "@/master";
import { computed, defineComponent, reactive } from "vue";

export default defineComponent({
  name: "MiscOptionInput",
  mixins: [GlobalMixin],
  emits: ["update:misc-option"],
  setup(props, context) {
    const damageDetailArr = [] as any[];
    const statusChangeDetailObjArr = [] as any[];
    const talentChangeDetailObjArr = [] as any[];
    const conditionMap = new Map() as Map<string, any[] | null>;
    const exclusionMap = new Map() as Map<string, string[] | null>;
    const conditionInput = reactive({
      conditionValues: {} as { [key: string]: any },
      checkboxList: [] as TCheckboxEntry[],
      selectList: [] as TSelectEntry[],
    });
    const conditionValues = conditionInput.conditionValues;
    const checkboxList = conditionInput.checkboxList;
    const selectList = conditionInput.selectList;
    const damageResultDummy = deepcopy(DAMAGE_RESULT_TEMPLATE);

    for (const masterList of [OPTION1_MASTER_LIST, OPTION2_MASTER_LIST]) {
      for (const entry of masterList) {
        if ("詳細" in entry) {
          for (const detailObj of entry.詳細) {
            if (!("条件" in detailObj)) {
              (detailObj as any).条件 = entry.key;
            }
          }
        }
        damageDetailArr.splice(
          damageDetailArr.length - 1,
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
          });
        }
      } else {
        if (checkboxList.filter((s) => s.name == key).length == 0) {
          checkboxList.push({ name: key });
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
        let str = stat.replace("%", "").replace(/^敵/, "敵の");
        str += statAdjustments.value[stat] >= 0 ? "+" : "";
        str += statAdjustments.value[stat];
        if (stat.endsWith("%") || STAT_PERCENT_LIST.includes(stat)) str += "%";
        resultArr.push(str);
      }
      return resultArr;
    });

    const onChange = () => {
      context.emit("update:misc-option", statAdjustments.value);
    };

    return {
      checkboxList,
      selectList,
      conditionValues,
      onChange,
      displayStatAjustmentList,
    };
  },
});
</script>
<style scoped>
fieldset {
  text-align: left;
}

label {
  display: inline-block;
  margin: 2px 1rem;
  min-width: calc(100% / 2 - 2rem);
  text-align: left;
}

label input,
label select {
  margin: 0 0.5rem;
}

:checked+span {
  color: palevioletred;
}
</style>
