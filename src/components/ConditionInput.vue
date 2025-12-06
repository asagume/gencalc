<template>
  <fieldset>
    <label v-for="item in checkboxList" :key="item.name">
      <input type="checkbox" v-model="conditionValues[item.name]" @change="updateCondition($event, item)" />
      <span>{{ displayName(item.name) }}</span>
    </label>
    <label v-for="item in selectList" :key="item.name">
      <span>{{ displayName(item.name) }}</span>
      <select v-model="conditionValues[item.name]" @change="updateCondition($event, item)">
        <option v-for="(option, index) in item.options" :value="index" :key="index">
          {{ displayOptionName(option) }}
        </option>
      </select>
    </label>
    <label v-for="item in numberList" :key="item.name">
      <span>{{ displayName(item.name) }}</span>
      <input type="number" v-model="conditionValues[item.name]" :min="item.min" :max="item.max" :step="item.step"
        @blur="updateCondition($event, item)" />
    </label>
    <div style="text-align: center">
      <label class="open-close">
        <input class="hidden" type="checkbox" v-model="isDisplayDescription">
        <span></span>
      </label>
    </div>
    <ul class="option-description" v-if="isDisplayDescription">
      <li v-for="item in displayStatAjustmentList" :key="item">{{ item }}</li>
    </ul>
  </fieldset>
</template>

<script lang="ts">
import _ from "lodash";
import { isNumeric, overwriteObject } from "@/common";
import {
  CONDITION_INPUT_TEMPLATE,
  TCharacterInput,
  TCheckboxEntry,
  TConditionAdjustments,
  TConditionInput,
  TConditionValues,
  TNumberEntry,
  TSelectEntry,
  makeExclusionMapFromCharacterInput,
} from "@/input";
import { computed, defineComponent, nextTick, PropType, reactive, ref, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
  name: 'ConditionInput',
  props: {
    characterInput: { type: Object as PropType<TCharacterInput>, required: true, },
  },
  emits: ['update:condition'],
  setup(props, context) {
    const { displayName, displayStatName, displayStatValue, displayOptionName } = CompositionFunction();

    const INVISIBLE_NAMES = ['月兆', '月反応ボーナス', '魔導秘儀'];

    const checkboxList = reactive(_.cloneDeep(CONDITION_INPUT_TEMPLATE.checkboxList) as TCheckboxEntry[]);
    const selectList = reactive(_.cloneDeep(CONDITION_INPUT_TEMPLATE.selectList) as TSelectEntry[]);
    const numberList = reactive(_.cloneDeep(CONDITION_INPUT_TEMPLATE.numberList) as TNumberEntry[]);
    const conditionValues = reactive(_.cloneDeep(CONDITION_INPUT_TEMPLATE.conditionValues) as TConditionValues);
    const conditionAdjustments = reactive(_.cloneDeep(CONDITION_INPUT_TEMPLATE.conditionAdjustments) as TConditionAdjustments);
    const isDisplayDescription = ref(false);

    const displayStatAjustmentList = computed(() => {
      const resultArr = [];
      for (const stat of Object.keys(conditionAdjustments)) {
        const value = conditionAdjustments[stat];
        let result = displayStatName(stat).replace('%', '');
        if (value === null) {
          // nop
        } else if (isNumeric(value)) {
          if (value === 0) continue;
          else if (value >= 0) {
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
    })

    const exclusionMap = computed(() => makeExclusionMapFromCharacterInput(props.characterInput))

    const initialize = (conditionInput: TConditionInput) => {
      const filteredCheckboxList = conditionInput.checkboxList.filter(item => !INVISIBLE_NAMES.includes(item.name));
      if (!_.isEqual(checkboxList, filteredCheckboxList)) {
        checkboxList.splice(0, checkboxList.length, ...filteredCheckboxList);
      }
      const filteredSelectList = conditionInput.selectList.filter(item => !INVISIBLE_NAMES.includes(item.name));
      if (!_.isEqual(selectList, filteredSelectList)) {
        selectList.splice(0, selectList.length, ...filteredSelectList);
      }
      const filteredNumberList = conditionInput.numberList.filter(item => !INVISIBLE_NAMES.includes(item.name));
      if (!_.isEqual(numberList, filteredNumberList)) {
        numberList.splice(0, numberList.length, ...filteredNumberList);
      }
      if (!_.isEqual(conditionValues, conditionInput.conditionValues)) {
        overwriteObject(conditionValues, conditionInput.conditionValues);
      }
      if (!_.isEqual(conditionAdjustments, conditionInput.conditionAdjustments)) {
        overwriteObject(conditionAdjustments, conditionInput.conditionAdjustments);
      }
    }

    const updateCondition = async (event: Event, item: any) => {
      let exclusionArr: string[] | null | undefined = undefined;
      if (event.currentTarget instanceof HTMLInputElement) {
        if (event.currentTarget.checked) {
          exclusionArr = exclusionMap.value.get(item.name);
        }
      } else if (event.currentTarget instanceof HTMLSelectElement) {
        if (event.currentTarget.value) {
          exclusionArr = exclusionMap.value.get(item.name);
        }
      }
      if (exclusionArr) {
        exclusionArr.forEach((exclusion) => {
          if (checkboxList.filter((s) => s.name == exclusion).length > 0) {
            conditionValues[exclusion] = false;
          }
          if (selectList.filter((s) => s.name == exclusion).length > 0) {
            conditionValues[exclusion] = 0;
          }
        })
      }
      await nextTick();
      context.emit('update:condition', conditionValues);
    }

    watch(props, () => {
      exclusionMap.value;
    })

    return {
      displayName,
      displayOptionName,

      checkboxList,
      selectList,
      numberList,
      conditionValues,
      isDisplayDescription,
      displayStatAjustmentList,

      initialize,
      updateCondition,
    };
  },
});
</script>

<style scoped>
label {
  display: inline-block;
  margin: 2px 1rem;
}

label input,
label select {
  margin: 0 0.5rem;
}

:checked+span {
  color: palevioletred;
}

label.open-close {
  padding: 0;
  width: calc(100% - 1rem);
  background-color: transparent;
}

label.open-close input[type="checkbox"]+span::before {
  width: 100%;
}

input[type="number"] {
  width: 10rem;
  text-align: right;
}
</style>
