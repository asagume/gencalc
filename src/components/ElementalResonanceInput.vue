<template>
  <fieldset class="elemental-resonance">
    <label v-for="item in elementalResonanceList" :key="item.key">
      <input type="checkbox" v-model="elementalResonanceChecked[item.key]" @change="onChange(item.key)" />
      <span>{{ displayName(item.名前) }}</span>
      <template v-if="item.key == '草元素共鳴'">
        <select v-model="dendroOption" @change="onChange(item.key)">
          <option value=""></option>
          <option value="20">+20</option>
          <option value="30">+30</option>
          <option value="50">+50</option>
        </select>
      </template>
    </label>
    <hr />
    <ul class="option-description">
      <li v-for="item in displayStatAjustmentList" :key="item">{{ item }}</li>
    </ul>
    <hr />
    <article v-for="(item, index) in descriptionList" :key="index" :class="elementClass(item[0])">
      {{ item[1] }}
    </article>
  </fieldset>
</template>

<script lang="ts">
import { deepcopy } from "@/common";
import { CONDITION_INPUT_TEMPLATE, STAT_PERCENT_LIST, TConditionInput, TElementalResonance, } from "@/input";
import {
  ELEMENTAL_RESONANCE_MASTER,
  ELEMENTAL_RESONANCE_MASTER_LIST,
  ELEMENT_COLOR_CLASS,
  TElementalResonanceKey,
} from "@/master";
import { computed, defineComponent, nextTick, PropType, reactive, ref, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

type TConditionValuesAny = {
  [key: string]: any;
}

export default defineComponent({
  name: "ElementalResonanceInput",
  props: {
    elementalResonance: {
      type: Object as PropType<TElementalResonance>,
    }
  },
  emits: ["update:elemental-resonance"],
  setup(props, context) {
    const { displayName } = CompositionFunction();

    const elementalResonanceList = ELEMENTAL_RESONANCE_MASTER_LIST;
    const elementalResonanceChecked = reactive({} as { [key: string]: boolean });
    elementalResonanceList.forEach(entry => {
      elementalResonanceChecked[entry.key] = false;
    });
    // 燃焼、原激化、開花反応を発動すると、周囲チーム全員の元素熟知+30、継続時間6秒。超激化、草激化、超開花、烈開花反応を発動すると、周囲チーム全員の元素熟知+20、継続時間6秒。
    const dendroOption = ref(0);

    const conditionInput = reactive(deepcopy(CONDITION_INPUT_TEMPLATE) as TConditionInput);
    const conditionValues = conditionInput.conditionValues as TConditionValuesAny;

    const statAdjustments = computed(() => {
      return props.elementalResonance?.conditionAdjustments ?? {};
    });

    const displayStatAjustmentList = computed(() => {
      const resultArr: string[] = [];
      const conditionAdjustments = props.elementalResonance?.conditionAdjustments;
      if (conditionAdjustments) {
        for (const stat of Object.keys(conditionAdjustments)) {
          const val = statAdjustments.value[stat];
          if (!val) continue;
          let str = stat.replace("%", "").replace(/^敵/, "敵の");
          str += val >= 0 ? "+" : "";
          str += val;
          if (stat.endsWith("%") || STAT_PERCENT_LIST.includes(stat)) str += "%";
          resultArr.push(str);
        }
      }
      return resultArr;
    });

    const onChange = async (key?: string) => {
      if (key) {
        if (elementalResonanceChecked[key]) {
          if (key == "元素共鳴なし") {
            for (const name of Object.keys(elementalResonanceChecked).filter(
              (s) => s != "元素共鳴なし"
            )) {
              elementalResonanceChecked[name] = false;
            }
          } else {
            if (
              Object.keys(elementalResonanceChecked).filter(
                (s) => s != "元素共鳴なし" && elementalResonanceChecked[s]
              ).length > 2
            ) {
              elementalResonanceChecked[key] = false;
            }
            elementalResonanceChecked["元素共鳴なし"] = false;
          }
        }
      }
      await nextTick();
      Object.keys(elementalResonanceChecked).forEach(key => {
        conditionValues[key] = elementalResonanceChecked[key];
      });
      if (dendroOption.value) {
        conditionValues['dendroOption'] = dendroOption.value;
      }
      context.emit("update:elemental-resonance", conditionValues);
    };

    const initializeValues = (initialObj: TConditionInput) => {
      Object.keys(elementalResonanceChecked).forEach(key => {
        if (key in initialObj.conditionValues) {
          elementalResonanceChecked[key] = Boolean(initialObj.conditionValues[key]);
        } else {
          elementalResonanceChecked[key] = false;
        }
      });
      if ('dendroOption' in initialObj.conditionValues) {
        dendroOption.value = Number(initialObj.conditionValues['dendroOption']);
      }
      onChange();
    };

    const descriptionList = computed(() => {
      const result = [] as any[];
      for (const name of Object.keys(elementalResonanceChecked).filter(
        (s) => elementalResonanceChecked[s]
      )) {
        result.push([
          name,
          ELEMENTAL_RESONANCE_MASTER[name as TElementalResonanceKey].説明,
        ]);
      }
      return result;
    });

    watch(props, () => {
      displayStatAjustmentList.value;
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
      elementalResonanceChecked,
      dendroOption,

      displayStatAjustmentList,
      descriptionList,
      elementClass,

      onChange,
      initializeValues,
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
