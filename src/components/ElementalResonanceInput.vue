<template>
  <fieldset class="elemental-resonance">
    <p>{{ displayName('元素共鳴') }}</p>
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
    <article v-for="(item, index) in descriptionList" :key="index" :class="elementClass(item[0])">
      {{ item[1] }}
    </article>
    <hr />
    <p>{{ displayName('月兆') }}</p>
    <label>
      <input type="checkbox" v-model="moonsignChecked.nascentGleam" @change="onChangeMoonsign(1)" />
      <span>{{ displayName('初照') }}</span>
    </label>
    <label>
      <input type="checkbox" v-model="moonsignChecked.ascendantGleam" @change="onChangeMoonsign(2)" />
      <span>{{ displayName('満照') }}</span>
    </label>
    <br />
    <template v-if="moonsignChecked.ascendantGleam && false">
      <label>
        <select>
          <option v-for="member in otherMemberList" :key="member" :value="member">{{ member }}</option>
        </select>
      </label>
    </template>
    <label>{{ '月反応ダメージ' }}
      <input type="number" v-model="lunarDmgBonus" min="0" max="36" @change="onChangeMoonsign(2)"
        :disabled="!moonsignChecked.ascendantGleam">
    </label>
    <hr />
    <p>{{ displayName('魔導') }}</p>
    <label>
      <input type="checkbox" v-model="hexereiChecked" @change="onChangeHexerei()" />
      <span>魔導秘儀</span>
    </label>
    <hr />
    <ul class="option-description">
      <li v-for="item in displayStatAjustmentList" :key="item">{{ item }}</li>
    </ul>
  </fieldset>
</template>

<script lang="ts">
import { TConditionInput, TConditionValues, TElementalResonance, TMoonsign, } from "@/input";
import {
  ELEMENTAL_RESONANCE_MASTER,
  ELEMENTAL_RESONANCE_MASTER_LIST,
  ELEMENT_COLOR_CLASS,
  TCharacterKey,
  TElementalResonanceKey,
} from "@/master";
import { computed, defineComponent, nextTick, onMounted, PropType, reactive, ref, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";
import { isNumeric, overwriteObject } from "@/common";

export default defineComponent({
  name: "ElementalResonanceInput",
  props: {
    elementalResonance: { type: Object as PropType<TElementalResonance>, required: true, },
    moonsign: { type: Object as PropType<TMoonsign>, required: true, },
    hexerei: { type: Boolean, required: true, },
    character: { type: String as PropType<TCharacterKey>, required: true, },
    teamMembers: { type: Array as PropType<string[]>, required: true, },
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
    const moonsignChecked = reactive({} as TMoonsign);
    const hexereiChecked = ref(false);
    const otherMemberList = computed(() => {
      const result = [] as string[];
      props.teamMembers.forEach(name => {
        if (name != props.character) {
          result.push(name);
        }
      });
      return result;
    })
    const lunarDmgBonus = ref(36);

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

    const onChangeMoonsign = async (level: number) => {
      if (level == 1) {
        if (!moonsignChecked.nascentGleam) {
          moonsignChecked.ascendantGleam = false;
        }
      } else if (level == 2) {
        if (moonsignChecked.ascendantGleam) {
          moonsignChecked.nascentGleam = true;
        }
      }
      if (moonsignChecked.ascendantGleam) { // 満照
        conditionValues['月兆'] = 2;
        conditionValues['月反応ボーナス'] = lunarDmgBonus.value;
      } else if (moonsignChecked.nascentGleam) { // 初照
        conditionValues['月兆'] = 1;
        conditionValues['月反応ボーナス'] = 0;
      } else {
        conditionValues['月兆'] = 0;
        conditionValues['月反応ボーナス'] = 0;
      }
      await nextTick();
      updateOption();
    }

    const onChangeHexerei = async () => {
      conditionValues['魔導秘儀'] = hexereiChecked.value;
      await nextTick();
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
      if ('月兆' in conditionValues) {
        if (conditionValues['月兆'] === 2) {
          moonsignChecked.nascentGleam = true;
          moonsignChecked.ascendantGleam = true;
        } else if (conditionValues['月兆'] === 1) {
          moonsignChecked.nascentGleam = true;
          moonsignChecked.ascendantGleam = false;
        } else {
          moonsignChecked.nascentGleam = false;
          moonsignChecked.ascendantGleam = false;
        }
      }
      if ('魔導秘儀' in conditionValues) {
        hexereiChecked.value = Boolean(conditionValues['魔導秘儀']);
      }
      updateOption();
    }

    onMounted(() => {
      overwriteObject(conditionValues, props.elementalResonance.conditionValues);
      moonsignChecked.nascentGleam = props.moonsign.nascentGleam;
      moonsignChecked.ascendantGleam = props.moonsign.ascendantGleam;
      hexereiChecked.value = props.hexerei;
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
      moonsignChecked,
      otherMemberList,
      lunarDmgBonus,
      hexereiChecked,

      displayStatAjustmentList,
      descriptionList,
      elementClass,

      onChange,
      onChangeMoonsign,
      onChangeHexerei,
      initializeValues,
    };
  },
});
</script>
<style scoped>
div.elemental-resonance {
  margin-top: 10px;
}

fieldset.elemental-resonance p {
  color: gold;
  background-color: #333;
  margin-top: 0;
  margin-bottom: 0;
  padding-top: 2px;
  padding-bottom: 2px;
  vertical-align: middle;
  font-weight: bold;
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
