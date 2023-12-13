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
import _ from "lodash";
import {
  evalFormula,
  checkConditionMatches,
  makeValidConditionValueArr,
} from "@/calculate";
import { isNumeric, overwriteObject } from "@/common";
import {
  CONDITION_INPUT_TEMPLATE,
  DAMAGE_RESULT_TEMPLATE,
  makeConditionExclusionMapFromStr,
  makeDamageDetailObjArr,
  TConditionInput,
  TDamageDetailObj,
  TStats,
} from "@/input";
import { OPTION1_MASTER_LIST, OPTION2_MASTER_LIST } from "@/master";
import { computed, defineComponent, nextTick, reactive } from "vue";
import CompositionFunction from './CompositionFunction.vue';

type TConditionValuesAny = {
  [key: string]: any;
}

export default defineComponent({
  name: 'MiscOptionInput',
  emits: ['update:misc-option'],
  setup(props, context) {
    const { displayName, displayStatName, displayStatValue, displayOptionName } = CompositionFunction();

    const damageDetailArr = [] as any[];
    const statusChangeDetailObjArr: TDamageDetailObj[] = [];
    const talentChangeDetailObjArr: TDamageDetailObj[] = [];
    const conditionMap = new Map() as Map<string, string[] | null>;
    const exclusionMap = new Map() as Map<string, string[] | null>;
    const conditionInput = reactive(_.cloneDeep(CONDITION_INPUT_TEMPLATE) as TConditionInput);
    const conditionValues = conditionInput.conditionValues as TConditionValuesAny;
    const checkboxList = conditionInput.checkboxList;
    const selectList = conditionInput.selectList;
    const damageResultDummy = _.cloneDeep(DAMAGE_RESULT_TEMPLATE);

    for (const masterList of [OPTION1_MASTER_LIST, OPTION2_MASTER_LIST]) {
      for (const entry of masterList) {
        if ('詳細' in entry) {
          for (const detailObj of entry.詳細) {
            if (!('条件' in detailObj)) {
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
            'その他オプション'
          )
        );
      }
    }
    statusChangeDetailObjArr.filter((s) => s.条件).forEach((detailObj) => {
      makeConditionExclusionMapFromStr(detailObj.条件 as string, conditionMap, exclusionMap);
    });
    talentChangeDetailObjArr.filter((s) => s.条件).forEach((detailObj) => {
      makeConditionExclusionMapFromStr(detailObj.条件 as string, conditionMap, exclusionMap);
    });
    conditionMap.forEach((value, key) => {
      if (value && Array.isArray(value)) {
        if (!value[0].startsWith('required_')) {
          conditionMap.set(key, ['', ...value]);
        }
      }
    });
    conditionMap.forEach((value: string[] | null, key: string) => {
      if (value) {
        if (selectList.filter((s) => s.name == key).length == 0) {
          const required = value[0].startsWith('required_');
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
        let myValue = undefined;
        if (myDetailObj.数値) {
          let myNew数値 = myDetailObj.数値;
          if (myDetailObj.条件) {
            const number = checkConditionMatches(myDetailObj.条件, validConditionValueArr, 0);
            if (number === 0) continue;
            myNew数値 = '(' + myNew数値 + ')*' + number;
          }
          myValue = evalFormula(myNew数値, workObj, damageResultDummy);
        }
        if (myDetailObj.種類) {
          if (myValue === undefined) {
            workObj[myDetailObj.種類] = 0;
          } else {
            if (myDetailObj.種類 in workObj) {
              workObj[myDetailObj.種類] += myValue;
            } else {
              workObj[myDetailObj.種類] = myValue;
            }
          }
        }
      }
      return workObj;
    });

    const displayStatAjustmentList = computed(() => {
      const resultArr = [];
      for (const stat of Object.keys(statAdjustments.value)) {
        const value = statAdjustments.value[stat];
        let result: string = displayStatName(stat).replace('%', '');
        if (isNumeric(value)) {
          if (value >= 0) {
            if (stat.split('.')[0] === '別枠乗算') result += '=';
            else result += '+';
          }
          result += displayStatValue(stat, value);
        } else if (value) {
          result += '=' + value;
        }
        resultArr.push(result);
      }
      return resultArr;
    });

    const onChange = async () => {
      await nextTick();
      overwriteObject(conditionInput.conditionAdjustments, statAdjustments.value);
      context.emit('update:misc-option', conditionInput);
    };

    const initializeValues = (initialObj: TConditionInput) => {
      Object.keys(conditionValues).forEach(key => {
        if (key in initialObj.conditionValues) {
          conditionValues[key] = initialObj.conditionValues[key];
        } else {
          if (conditionMap.has(key)) {
            if (conditionMap.get(key)) {
              conditionValues[key] = 0;
            } else {
              conditionValues[key] = false;
            }
          }
        }
      });
      onChange();
    };

    return {
      displayName, displayOptionName,

      checkboxList,
      selectList,
      conditionValues,
      displayStatAjustmentList,

      onChange,
      initializeValues,
    };
  },
});
</script>
<style scoped>
fieldset {
  text-align: left;
}

label {
  position: relative;
  display: inline-block;
  margin: 2px 1rem;
  min-width: calc(100% / 2 - 2rem);
  height: 3.8rem;
  text-align: left;
  vertical-align: middle;
}

label input {
  margin: 0 0.5rem;
}

label select {
  position: absolute;
  right: 0;
  top: -0.5rem;
}

:checked+span {
  color: palevioletred;
}
</style>

function OPTION_INPUT_CHILD_TEMPLATE(OPTION_INPUT_CHILD_TEMPLATE: any): any {
  throw new Error("Function not implemented.");
}
