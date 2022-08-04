<template>
  <fieldset>
    <label v-for="item in checkboxList" :key="item">
      <input type="checkbox" v-model="conditionValues[item]" :value="item" />
      <span>{{ item }}</span>
    </label>
    <label v-for="item in selectList" :key="item.name">
      <span>{{ item.name }}</span>
      <select v-model="conditionValues[item.name]">
        <option v-if="!item.require" value=""></option>
        <option v-for="(option, index) in item.options" :value="index" :key="index">
          {{ displayOptionName(option) }}
        </option>
      </select>
    </label>
  </fieldset>
</template>

<script lang="ts">
import GlobalMixin from "@/GlobalMixin.vue";
import { TDamageDetail } from "@/input";
import { computed, defineComponent, ref } from "vue";

type TCheckboxEntry = string;
type TSelectEntry = {
  name: string;
  options: string[];
  require: boolean;
};

export default defineComponent({
  name: 'ConditionInput',
  mixins: [GlobalMixin],
  props: {
    characterInput: { type: Object, require: true },
    conditionInput: { type: Object, require: true },
  },
  setup(props) {
    const displayOptionName = (name: string) => name.replace(/^required_/, "");

    const myDamageDatailArr = computed(() => {
      const result = [] as TDamageDetail[];
      if (props.characterInput) {
        if (props.characterInput.damageDetailMyCharacter) result.push(props.characterInput.damageDetailMyCharacter);
        if (props.characterInput.damageDetailMyWeapon) result.push(props.characterInput.damageDetailMyWeapon);
        if (props.characterInput.damageDetailMyArtifactSets) result.push(props.characterInput.damageDetailMyArtifactSets);
      }
      return result;
    });
    const checkboxList = computed((): TCheckboxEntry[] => {
      const result = [] as string[];
      myDamageDatailArr.value
        .filter((s) => s)
        .forEach((damageDetail) => {
          damageDetail.条件.forEach((value: string[] | null, key: string) => {
            if (value) return;
            result.push(key);
          });
        });
      return result;
    });
    const selectList = computed((): TSelectEntry[] => {
      const result = [] as TSelectEntry[];
      myDamageDatailArr.value
        .filter((s) => s)
        .forEach((damageDetail) => {
          damageDetail.条件.forEach((value: string[] | null, key: string) => {
            if (!value) return;
            result.push({
              name: key,
              options: value,
              require: value[0].startsWith("required_"),
            });
          });
        });
      return result;
    });

    const conditionValues = ref(props.conditionInput?.conditionValues ?? {});

    return {
      displayOptionName,
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
