<template>
  <fieldset>
    <label v-for="item in checkboxList" :key="item.name">
      <input
        type="checkbox"
        v-model="conditionValues[item.name]"
        :value="item.name"
        @change="updateCondition($event, item)"
      />
      <span>{{ displayName(item.name) }}</span>
    </label>
    <label v-for="item in selectList" :key="item.name">
      <span>{{ displayName(item.name) }}</span>
      <select
        v-model="conditionValues[item.name]"
        @change="updateCondition($event, item)"
      >
        <option v-for="(option, index) in item.options" :value="index" :key="index">
          {{ displayOptionName(option) }}
        </option>
      </select>
    </label>
    <hr />
    <ul class="option-description" style="display: none">
      <li v-for="item in displayStatAjustmentList" :key="item">{{ item }}</li>
    </ul>
  </fieldset>
</template>

<script lang="ts">
import {
  calculateFormulaArray,
  checkConditionMatches,
  makeValidConditionValueArr,
  ALL_ELEMENTS,
} from "@/calculate";
import { deepcopy } from "@/common";
import {
  DAMAGE_RESULT_TEMPLATE,
  STAT_PERCENT_LIST,
  TCharacterInput,
  TConditionInput,
  TStats,
} from "@/input";
import { computed, defineComponent, PropType, reactive } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
  name: "ConditionInput",
  props: {
    characterInput: { type: Object as PropType<TCharacterInput>, required: true },
    conditionInput: { type: Object as PropType<TConditionInput>, required: true },
  },
  emits: ["update:condition"],
  setup(props, context) {
    const { displayName, displayOptionName } = CompositionFunction();

    const conditionInputRea = reactive(props.conditionInput);
    const conditionValues = conditionInputRea.conditionValues as any;
    const checkboxList = conditionInputRea.checkboxList;
    const selectList = conditionInputRea.selectList;
    const damageResultDummy = deepcopy(DAMAGE_RESULT_TEMPLATE);

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

    const updateCondition = (event: Event, item: any) => {
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
            conditionInputRea.conditionValues[exclusion] = false;
          }
          if (selectList.filter((s) => s.name == exclusion).length > 0) {
            conditionInputRea.conditionValues[exclusion] = 0;
          }
        });
      }
      context.emit("update:condition");
    };

    const statusChangeDetailObjArr = computed(() => {
      const result = [] as any[];
      [
        props.characterInput.damageDetailMyCharacter,
        props.characterInput.damageDetailMyWeapon,
        props.characterInput.damageDetailMyArtifactSets,
      ].forEach((damageDetail) => {
        if (damageDetail && damageDetail.ステータス変更系詳細) {
          damageDetail.ステータス変更系詳細.forEach((damageDetailObj) => {
            if (damageDetailObj.条件) {
              result.push(damageDetailObj);
            }
          });
        }
      });
      return result;
    });

    const talentChangeDetailObjArr = computed(() => {
      const result = [] as any[];
      [
        props.characterInput.damageDetailMyCharacter,
        props.characterInput.damageDetailMyWeapon,
        props.characterInput.damageDetailMyArtifactSets,
      ].forEach((damageDetail) => {
        if (damageDetail && damageDetail.天賦性能変更系詳細) {
          damageDetail.天賦性能変更系詳細.forEach((damageDetailObj) => {
            if (damageDetailObj.条件) {
              result.push(damageDetailObj);
            }
          });
        }
      });
      return result;
    });

    const displayStatAjustmentList = computed(() => {
      const resultArr = [];
      for (const stat of Object.keys(conditionInputRea.conditionAdjustments)) {
        let result = stat.replace("%", "").replace(/^敵/, "敵の");
        result = result.replace(/ダメージバフ$/, "ダメージ");
        result = result.replace(/ダメージアップ$/, "ダメージ");
        result = result.replace("凍結反応ボーナス", "凍結反応の継続時間");
        result = result.replace(/反応ボーナス$/, "反応ダメージ");
        result += conditionInputRea.conditionAdjustments[stat] >= 0 ? "+" : "";
        result += conditionInputRea.conditionAdjustments[stat];
        if (stat.endsWith("%") || STAT_PERCENT_LIST.includes(stat)) result += "%";
        resultArr.push(result);
      }
      const validConditionValueArr = makeValidConditionValueArr(conditionInputRea);
      for (const myDetailObj of talentChangeDetailObjArr.value) {
        if (myDetailObj["条件"]) {
          const number = checkConditionMatches(
            myDetailObj["条件"],
            validConditionValueArr,
            0
          );
          if (number == 0) continue;
          let str = "";
          if (myDetailObj["対象"]) continue;
          if (myDetailObj["数値"]) continue;
          if (myDetailObj["種類"]) {
            str += " ";
            str += myDetailObj["種類"];
          }
          if (str) {
            resultArr.push(str.trim());
          }
        }
      }
      return resultArr;
    });

    return {
      displayName,
      displayOptionName,

      checkboxList,
      selectList,
      conditionValues,

      updateCondition,

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

:checked + span {
  color: palevioletred;
}
</style>
