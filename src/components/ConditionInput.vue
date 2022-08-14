<template>
  <fieldset>
    <label v-for="item in checkboxList" :key="item.name">
      <input type="checkbox" v-model="conditionValues[item.name]" :value="item.name"
        @change="$emit('update:condition')" />
      <span>{{ displayName(item.name) }}</span>
    </label>
    <label v-for="item in selectList" :key="item.name">
      <span>{{ displayName(item.name) }}</span>
      <select v-model="conditionValues[item.name]" @change="$emit('update:condition')">
        <option v-for="(option, index) in item.options" :value="index" :key="index">
          {{ displayOptionName(option) }}
        </option>
      </select>
    </label>
  </fieldset>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import CompositionFunction from './CompositionFunction.vue';

export default defineComponent({
  name: "ConditionInput",
  props: {
    characterInput: { type: Object, required: true },
    conditionInput: { type: Object, required: true },
  },
  emits: ["update:condition"],
  setup(props) {
    const { displayName, displayOptionName } = CompositionFunction();

    const conditionInputRea = reactive(props.conditionInput);
    const conditionValues = conditionInputRea.conditionValues;
    const checkboxList = conditionInputRea.checkboxList;
    const selectList = conditionInputRea.selectList;

    return {
      displayName, displayOptionName,

      checkboxList,
      selectList,
      conditionValues,
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
</style>
