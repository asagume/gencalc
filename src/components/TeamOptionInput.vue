<template>
  <fieldset>
    <fieldset v-for="supporter in supporterKeyList" :key="supporter">
      <legend>{{ displayName(supporter) }}</legend>
      <label v-for="item in supporterMap.get(supporter)" :key="item">
        {{ item }}
      </label>
    </fieldset>
  </fieldset>
</template>

<script lang="ts">
import {
  calculateArtifactStats,
  calculateArtifactStatsMain,
  calculateResult,
  calculateStats,
} from "@/calculate";
import { deepcopy } from "@/common";
import GlobalMixin from "@/GlobalMixin.vue";
import {
  ARTIFACT_DETAIL_INPUT_TEMPLATE,
  CHARACTER_INPUT_TEMPLATE,
  CONDITION_INPUT_TEMPLATE,
  DAMAGE_RESULT_TEMPLATE,
  loadRecommendation,
  makeDamageDetailObjArrObjArtifactSets,
  makeDamageDetailObjArrObjCharacter,
  makeDamageDetailObjArrObjWeapon,
  setupConditionValues,
  OPTION_INPUT_TEMPLATE,
  STATS_INPUT_TEMPLATE,
  TArtifactDetailInput,
  TCharacterInput,
  TConditionInput,
  TDamageResult,
  TOptionInput,
  TStatsInput,
} from "@/input";
import { TEAM_OPTION_MASTER_LIST } from "@/master";
import { computed, defineComponent } from "vue";

export default defineComponent({
  name: "TeamOptionInput",
  mixins: [GlobalMixin],
  props: {
    characterInput: { type: Object, require: true },
    conditionInput: { type: Object, require: true },
  },
  setup() {
    const supporterMap = computed(() => {
      const result = new Map();
      for (const entry of TEAM_OPTION_MASTER_LIST) {
        result.set(entry.key.split("_")[0], entry);
      }
      return result;
    });
    const supporterKeyList = computed(() => {
      return Array.from(supporterMap.value.keys());
    });

    const loadSupporterData = async () => {
      for (const supporter of supporterKeyList.value) {
        const storageKey = "あなたの" + supporter;
        if (localStorage[storageKey]) {
          const supporterSavedata = JSON.parse(localStorage[storageKey]);
          const characterInput = deepcopy(CHARACTER_INPUT_TEMPLATE) as TCharacterInput;
          const artifactDetailInput = deepcopy(
            ARTIFACT_DETAIL_INPUT_TEMPLATE
          ) as TArtifactDetailInput;
          const conditionInput = deepcopy(CONDITION_INPUT_TEMPLATE) as TConditionInput;
          const optionInput = deepcopy(OPTION_INPUT_TEMPLATE) as TOptionInput;
          const statsInput = deepcopy(STATS_INPUT_TEMPLATE) as TStatsInput;
          const damageResult = deepcopy(DAMAGE_RESULT_TEMPLATE) as TDamageResult;
          await loadRecommendation(
            characterInput,
            artifactDetailInput,
            conditionInput,
            supporterSavedata
          );
          makeDamageDetailObjArrObjCharacter(characterInput);
          makeDamageDetailObjArrObjWeapon(characterInput);
          makeDamageDetailObjArrObjArtifactSets(characterInput);
          setupConditionValues(conditionInput, characterInput);
          calculateArtifactStatsMain(
            artifactDetailInput.聖遺物ステータスメイン効果,
            artifactDetailInput.聖遺物メイン効果
          );
          calculateArtifactStats(artifactDetailInput);
          calculateStats(
            statsInput,
            characterInput,
            artifactDetailInput,
            conditionInput,
            optionInput
          );
          calculateResult(
            damageResult,
            characterInput as any,
            conditionInput as any,
            statsInput
          );
        }
      }
    };

    return {
      supporterMap,
      supporterKeyList,
    };
  },
});
</script>
<style scoped></style>
