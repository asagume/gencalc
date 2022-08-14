<template>
  <fieldset class="elemental-resonance">
    <label v-for="item in elementalResonanceList" :key="item.key">
      <input type="checkbox" v-model="elementalResonanceCheckedRea[item.key]" @change="onChange(item.key)" />
      <span>{{ displayName(item.名前) }}</span>
    </label>
    <hr />
    <ul class="option-description">
      <li v-for="item in displayStatAjustmentList" :key="item">{{ item }}</li>
    </ul>
  </fieldset>
</template>

<script lang="ts">
import { STAT_PERCENT_LIST, TStats } from "@/input";
import { ELEMENTAL_RESONANCE_MASTER, ELEMENTAL_RESONANCE_MASTER_LIST } from "@/master";
import { computed, defineComponent, PropType, reactive } from "vue";
import CompositionFunction from './CompositionFunction.vue';

export default defineComponent({
  name: "ElementalResonanceInput",
  emits: ["update:elemental-resonance"],
  props: {
    elementalResonanceChecked: {
      type: Object as PropType<{ [key: string]: boolean }>,
      required: true,
    },
  },
  setup(props, context) {
    const { displayName } = CompositionFunction();

    const elementalResonanceList = ELEMENTAL_RESONANCE_MASTER_LIST;
    const elementalResonanceCheckedRea = reactive(props.elementalResonanceChecked);

    const statAdjustments = computed(() => {
      const workObj = {} as TStats;
      for (const name of Object.keys(elementalResonanceCheckedRea).filter(
        (s) => elementalResonanceCheckedRea[s]
      )) {
        if ("詳細" in (ELEMENTAL_RESONANCE_MASTER as any)[name]) {
          const detailObjArr = (ELEMENTAL_RESONANCE_MASTER as any)[name].詳細;
          if (detailObjArr) {
            for (const detailObj of detailObjArr) {
              if ("種類" in detailObj && "数値" in detailObj) {
                if (detailObj.種類 in workObj) {
                  workObj[detailObj.種類] += detailObj.数値;
                } else {
                  workObj[detailObj.種類] = detailObj.数値;
                }
              }
            }
          }
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

    const onChange = (key: string) => {
      if (elementalResonanceCheckedRea[key]) {
        if (key == "元素共鳴なし") {
          for (const name of Object.keys(elementalResonanceCheckedRea).filter(
            (s) => s != "元素共鳴なし"
          )) {
            elementalResonanceCheckedRea[name] = false;
          }
        } else {
          if (
            Object.keys(elementalResonanceCheckedRea).filter(
              (s) => s != "元素共鳴なし" && elementalResonanceCheckedRea[s]
            ).length > 2
          ) {
            elementalResonanceCheckedRea[key] = false;
          }
          elementalResonanceCheckedRea["元素共鳴なし"] = false;
        }
      }
      context.emit("update:elemental-resonance", statAdjustments.value);
    };

    return {
      displayName,

      elementalResonanceList,
      elementalResonanceCheckedRea,
      onChange,
      displayStatAjustmentList,
    };
  },
});
</script>
<style scoped>
div.elemental-resonance {
  margin-top: 10px;
}

label {
  display: inline-block;
}
</style>
