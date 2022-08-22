<template>
  <fieldset class="elemental-resonance">
    <label v-for="item in elementalResonanceList" :key="item.key">
      <input
        type="checkbox"
        v-model="elementalResonanceCheckedRea[item.key]"
        @change="onChange(item.key)"
      />
      <span>{{ displayName(item.名前) }}</span>
      <template v-if="item.key == '草元素共鳴'">
        <select v-model="dendroOption" @change="onChange(item.key)">
          <option value=""></option>
          <option value="20">+20</option>
          <option value="30">+30</option>
        </select>
      </template>
    </label>
    <hr />
    <ul class="option-description">
      <li v-for="item in displayStatAjustmentList" :key="item">{{ item }}</li>
    </ul>
    <hr />
    <article
      v-for="(item, index) in descriptionList"
      :key="index"
      :class="elementClass(item[0])"
    >
      {{ item[1] }}
    </article>
  </fieldset>
</template>

<script lang="ts">
import { STAT_PERCENT_LIST, TStats } from "@/input";
import {
  ELEMENTAL_RESONANCE_MASTER,
  ELEMENTAL_RESONANCE_MASTER_LIST,
  ELEMENT_COLOR_CLASS,
  TElementalResonanceKey,
} from "@/master";
import { computed, defineComponent, PropType, reactive, ref } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

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

    // 燃焼、原激化、開花反応を発動すると、周囲チーム全員の元素熟知+30、継続時間6秒。超激化、草激化、超開花、烈開花反応を発動すると、周囲チーム全員の元素熟知+20、継続時間6秒。
    const dendroOption = ref(0);

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
        if (name === "草元素共鳴") {
          if (dendroOption.value) {
            workObj["元素熟知"] += Number(dendroOption.value);
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

    const descriptionList = computed(() => {
      const result = [] as any[];
      for (const name of Object.keys(elementalResonanceCheckedRea).filter(
        (s) => elementalResonanceCheckedRea[s]
      )) {
        result.push([
          name,
          ELEMENTAL_RESONANCE_MASTER[name as TElementalResonanceKey].説明,
        ]);
      }
      return result;
    });

    const elementClass = (item: string) => {
      let result = "";
      if (item) {
        result = (ELEMENT_COLOR_CLASS as any)[item.substring(0, 1)];
      }
      return result;
    };

    return {
      displayName,

      elementalResonanceList,
      elementalResonanceCheckedRea,
      onChange,
      displayStatAjustmentList,
      descriptionList,
      elementClass,

      dendroOption,
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
  margin-left: 5px;
  margin-right: 5px;
  margin-bottom: 5px;
}

article {
  text-align: left;
  padding: 5px;
}

select {
  margin-left: 5px;
}
</style>
