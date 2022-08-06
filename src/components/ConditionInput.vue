<template>
  <fieldset>
    <label v-for="item in checkboxList" :key="item">
      <input
        type="checkbox"
        v-model="conditionValues[item]"
        :value="item"
        @change="$emit('update:condition')"
      />
      <span>{{ item }}</span>
    </label>
    <label v-for="item in selectList" :key="item.name">
      <span>{{ item.name }}</span>
      <select v-model="conditionValues[item.name]" @change="$emit('update:condition')">
        <option v-for="(option, index) in item.options" :value="index" :key="index">
          {{ displayOptionName(option) }}
        </option>
      </select>
    </label>
  </fieldset>
</template>

<script lang="ts">
import { deepcopy } from "@/common";
import GlobalMixin from "@/GlobalMixin.vue";
import { CONDITION_INPUT_TEMPLATE } from "@/input";
import { defineComponent, reactive } from "vue";

export default defineComponent({
  name: "ConditionInput",
  mixins: [GlobalMixin],
  props: {
    characterInput: { type: Object, require: true },
    conditionInput: { type: Object, require: true },
  },
  emits: ["update:condition"],
  setup(props) {
    const conditionInputRea = reactive(
      props.conditionInput ?? deepcopy(CONDITION_INPUT_TEMPLATE)
    );
    const conditionValues = conditionInputRea.conditionValues;
    const checkboxList = conditionInputRea.checkboxList;
    const selectList = conditionInputRea.selectList;

    return {
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

:checked + span {
  color: palevioletred;
}
</style>
