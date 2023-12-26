<template>
  <fieldset>
    <label v-for="item in checkboxList" :key="item.name">
      <input type="checkbox" v-model="conditionValues[item.name]" :value="item" @change="valueOnChange($event, item)" />
      <span> {{ displayName(item.name) }}</span>
    </label>
    <label v-for="item in selectList" :key="item.name">
      <span> {{ displayName(item.name) }} </span>
      <select v-model="conditionValues[item.name]" @change="valueOnChange($event, item)">
        <option v-for="(option, index) in item.options" :value="index" :key="option">
          {{ displayOptionName(option) }}
        </option>
      </select>
    </label>
    <label class="condition" v-for="item in numberList" :key="item.name">
      <span> {{ displayName(item.name) }}</span>
      <input type="number" v-model="conditionValues[item.name]" :min="item.min" :max="item.max" :step="item.step"
        @blur="valueOnChange($event, item)" />
    </label>
    <hr />
    <ul class="option-description">
      <li v-for="item in displayStatAjustmentList" :key="item">{{ item }}</li>
    </ul>
  </fieldset>
</template>

<script lang="ts">
import _ from "lodash";
import { isNumeric } from "@/common";
import {
  TConditionInput,
  TConditionValues,
} from "@/input";
import { PropType, computed, defineComponent, nextTick, reactive } from "vue";
import CompositionFunction from './CompositionFunction.vue';

export default defineComponent({
  name: 'MiscOptionInput',
  props: {
    conditionInput: { type: Object as PropType<TConditionInput>, required: true, },
  },
  emits: ['update:misc-option'],
  setup(props, context) {
    const { displayName, displayStatName, displayStatValue, displayOptionName } = CompositionFunction();

    const conditionValues = reactive({} as TConditionValues);

    const conditionMap = computed(() => props.conditionInput.conditionMap);
    const exclusionMap = computed(() => props.conditionInput.exclusionMap)
    const checkboxList = computed(() => props.conditionInput.checkboxList);
    const selectList = computed(() => props.conditionInput.selectList);
    const numberList = computed(() => props.conditionInput.numberList);

    /** ステータス補正値を表示用の形式に編集します */
    const displayStatAjustmentList = computed(() => {
      const result: string[] = [];
      for (const stat of Object.keys(props.conditionInput.conditionAdjustments)) {
        let work = displayStatName(stat).replace('%', '');
        const value = props.conditionInput.conditionAdjustments[stat];
        if (value !== null) {
          if (isNumeric(value)) {
            if (value >= 0) {
              work += ['別枠乗算'].includes(stat.split('.')[0]) ? '=' : '+';
            }
            work += displayStatValue(stat, value);
          } else if (value) {
            work += "=" + value;
          }
        }
        result.push(work);
      }
      return result;
    })

    /** オプションの値が変更されたことを上位に通知します */
    const updateOption = async () => {
      await nextTick();
      context.emit('update:misc-option', conditionValues);
    }

    const valueOnChange = async (event: Event, item: any) => {
      let exclusionArr: string[] | undefined = undefined;
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
          if (checkboxList.value.filter((s) => s.name == exclusion).length > 0) {
            conditionValues[exclusion] = false;
          }
          if (selectList.value.filter((s) => s.name == exclusion).length > 0) {
            conditionValues[exclusion] = 0;
          }
        })
      }
      updateOption();
    }

    const initializeValues = (input: TConditionInput) => {
      Object.keys(conditionValues).forEach((key) => {
        if (input.conditionValues[key] !== undefined) {
          conditionValues[key] = input.conditionValues[key];
        } else {
          if (conditionMap.value.has(key)) {
            const value = conditionMap.value.get(key);
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
      updateOption();
    }

    return {
      displayName, displayOptionName,

      checkboxList,
      selectList,
      numberList,
      conditionValues,
      displayStatAjustmentList,

      valueOnChange,

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
