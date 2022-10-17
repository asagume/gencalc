<template>
  <fieldset>
    <label v-for="item in checkboxList" :key="item.name">
      <input type="checkbox" v-model="conditionValues[item.name]" :value="item.name"
        @change="updateCondition($event, item)" />
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
import { deepcopy, isNumber, overwriteObject } from "@/common";
import {
  TCharacterInput,
  TCheckboxEntry,
  TConditionAdjustments,
  TConditionInput,
  TSelectEntry,
} from "@/input";
import { computed, defineComponent, nextTick, PropType, reactive, ref } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
  name: "ConditionInput",
  props: {
    characterInput: { type: Object as PropType<TCharacterInput>, required: true },
    conditionInput: { type: Object as PropType<TConditionInput>, required: true },
    conditionAdjustments: { type: Object as PropType<TConditionAdjustments>, required: true },
  },
  emits: ["update:condition"],
  setup(props, context) {
    const { displayName, displayStatName, displayStatValue, displayOptionName } = CompositionFunction();

    const checkboxList = reactive(deepcopy(props.conditionInput.checkboxList) as TCheckboxEntry[]);
    const selectList = reactive(deepcopy(props.conditionInput.selectList) as TSelectEntry[]);
    const conditionValues = reactive(deepcopy(props.conditionInput.conditionValues) as any);  // TConditionValues

    const isDisplayDescription = ref(false);

    const initialize = (conditionInput: TConditionInput) => {
      checkboxList.splice(0, checkboxList.length, ...conditionInput.checkboxList);
      selectList.splice(0, selectList.length, ...conditionInput.selectList);
      overwriteObject(conditionValues, conditionInput.conditionValues);
    };

    const exclusionMap = computed(() => {
      const result = new Map() as Map<string, string[] | null>;
      [
        props.characterInput.damageDetailMyCharacter,
        props.characterInput.damageDetailMyWeapon,
        props.characterInput.damageDetailMyArtifactSets,
      ].forEach((damageDetail) => {
        if (damageDetail && damageDetail.排他) {
          damageDetail.排他.forEach((value, key) => {
            result.set(key, value);
          });
        }
      });
      return result;
    });

    const updateCondition = async (event: Event, item: any) => {
      console.log(event, item);
      let exclusionArr;
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
        });
      }
      await nextTick();
      context.emit("update:condition", conditionValues);
    };

    const displayStatAjustmentList = computed(() => {
      const resultArr = [];
      for (const stat of Object.keys(props.conditionAdjustments)) {
        const value = props.conditionAdjustments[stat];
        let result: string = displayStatName(stat).replace('%', '');
        if (value == null) {
          // nop
        } else if (isNumber(value)) {
          if (value >= 0) {
            if (stat.split('.')[0] == '別枠乗算') result += '=';
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

    return {
      displayName,
      displayOptionName,

      initialize,

      checkboxList,
      selectList,
      conditionValues,

      updateCondition,

      isDisplayDescription,
      displayStatAjustmentList,
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
</style>
