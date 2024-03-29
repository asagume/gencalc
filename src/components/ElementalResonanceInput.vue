<template>
  <fieldset class="elemental-resonance">
    <label v-for="item in elementalResonanceList" :key="item.key">
      <input type="checkbox" v-model="elementalResonanceChecked[item.key]" @change="onChange(item.key)" />
      <span>{{ displayName(item.名前) }}</span>
      <template v-if="item.key == '草元素共鳴'">
        <select v-model="dendroOption" @change="onChange(item.key)">
          <option value="0"></option>
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
import { TConditionInput, TConditionValues, TElementalResonance, } from "@/input";
import {
  ELEMENTAL_RESONANCE_MASTER,
  ELEMENTAL_RESONANCE_MASTER_LIST,
  ELEMENT_COLOR_CLASS,
  TElementalResonanceKey,
} from "@/master";
import { computed, defineComponent, nextTick, onMounted, PropType, reactive, ref, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";
import { isNumeric, overwriteObject } from "@/common";

export default defineComponent({
  name: "ElementalResonanceInput",
  props: {
    elementalResonance: { type: Object as PropType<TElementalResonance>, required: true, }
  },
  emits: ["update:elemental-resonance"],
  setup(props, context) {
    const { displayName, displayStatName, displayStatValue } = CompositionFunction();

    const elementalResonanceList = ELEMENTAL_RESONANCE_MASTER_LIST;
    const elementalResonanceChecked = reactive({} as { [key: string]: boolean });
    elementalResonanceList.forEach(entry => {
      elementalResonanceChecked[entry.key] = false;
    });
    // 燃焼、原激化、開花反応を発動すると、周囲チーム全員の元素熟知+30、継続時間6秒。超激化、草激化、超開花、烈開花反応を発動すると、周囲チーム全員の元素熟知+20、継続時間6秒。
    const dendroOption = ref(0);
    const conditionValues = reactive({} as TConditionValues);

    const displayStatAjustmentList = computed(() => {
      const resultArr: string[] = [];
      const conditionAdjustments = props.elementalResonance?.conditionAdjustments;
      if (conditionAdjustments) {
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
      }
      return resultArr;
    })

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
    })

    const elementClass = (item: string) => {
      let result = "";
      if (item) {
        result = (ELEMENT_COLOR_CLASS as any)[item.substring(0, 1)];
      }
      return result;
    }

    /** オプションの値が変更されたことを上位に通知します */
    const updateOption = async () => {
      await nextTick();
      context.emit('update:elemental-resonance', conditionValues);
    }

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
      } else {
        conditionValues['dendroOption'] = 0;
      }
      updateOption();
    }

    const initializeValues = (input: TConditionInput) => {
      overwriteObject(conditionValues, input.conditionValues);
      Object.keys(elementalResonanceChecked).forEach(key => {
        if (key in conditionValues) {
          elementalResonanceChecked[key] = Boolean(conditionValues[key]);
        } else {
          elementalResonanceChecked[key] = false;
        }
      });
      if ('dendroOption' in conditionValues) {
        dendroOption.value = Number(conditionValues['dendroOption']);
      }
      updateOption();
    }

    onMounted(() => {
      overwriteObject(conditionValues, props.elementalResonance.conditionValues);
      updateOption();
    })

    watch(props, () => {
      displayStatAjustmentList.value;
    })

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
