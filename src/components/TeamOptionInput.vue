<template>
  <fieldset class="team-option">
    <template v-for="supporter in supporterKeyList" :key="supporter">
      <fieldset v-if="supporterOpenClose[supporter]" class="supporter">
        <legend>
          <input class="hidden" :id="'supporter-' + supporter" type="checkbox"
            v-model="supporterOpenClose[supporter]" />
          <label class="toggle-switch" :for="'supporter-' + supporter">
            <span>{{ displayName(supporter) }}</span>
          </label>
        </legend>
        <div class="left">
          <label class="condition" v-for="item in supporterCheckboxList(supporter)" :key="item.name">
            <input type="checkbox" v-model="conditionValues[item.name]" :value="item.name"
              :disabled="conditionDisabled(item)" @change="onChange" />
            <span> {{ displayName(item.displayName) }}</span>
          </label>
          <label class="condition" v-for="item in supporterSelectList(supporter)" :key="item.name">
            <span> {{ displayName(item.displayName) }} </span>
            <select v-model="conditionValues[item.name]" :disabled="conditionDisabled(item)" @change="onChange">
              <option v-for="(option, index) in item.options" :value="index" :key="option">
                {{ displayOptionName(option) }}
              </option>
            </select>
          </label>
        </div>
      </fieldset>
      <template v-else>
        <input class="hidden" :id="'supporter-else-' + supporter" type="checkbox"
          v-model="supporterOpenClose[supporter]" />
        <label class="toggle-switch" :for="'supporter-else-' + supporter">
          <span>{{ displayName(supporter) }}</span>
        </label>
      </template>
    </template>
    <hr />
    <ul class="option-description">
      <li v-for="item in displayStatAjustmentList" :key="item">{{ item }}</li>
    </ul>
  </fieldset>

  <p class="notice">
    キャラクターの天賦レベルやステータスによって効果量が変動する種類のオプションはデフォルト名称の構成保存データが存在する場合に選択可能になります。
    <br />
    構成保存データのデフォルト名称：あなたの{キャラクターの名前}
  </p>
</template>

<script lang="ts">
import {
  calculateArtifactStats,
  calculateArtifactStatsMain,
  calculateFormulaArray,
  calculateResult,
  calculateStats,
  checkConditionMatches,
  isUseReference,
  makeValidConditionValueArr,
} from "@/calculate";
import { deepcopy } from "@/common";
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
  TCheckboxEntry,
  TSelectEntry,
  makeDamageDetailObjArr,
  makeConditionExclusionMapFromStr,
  TStats,
  STAT_PERCENT_LIST,
} from "@/input";
import { getCharacterMasterDetail, TCharacterKey, TEAM_OPTION_MASTER_LIST } from "@/master";
import { computed, defineComponent, PropType, reactive, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

export default defineComponent({
  name: "TeamOptionInput",
  props: {
    character: { type: String as PropType<TCharacterKey>, required: true },
    savedSupporters: { type: Object as PropType<{ key: string; value: string }[]>, required: true },
  },
  emits: ["update:team-option"],
  setup(props, context) {
    const { displayName, displayOptionName } = CompositionFunction();

    const supporterKeyList = reactive([] as string[]);
    const supporterOpenClose = reactive({} as { [key: string]: boolean });

    const supporterDamageResult = new Map() as Map<string, TDamageResult>;

    const setupSupporterDamageResult = async (savedSupporter: { key: string, value: string }) => {
      console.log(setupSupporterDamageResult.name, savedSupporter);
      const characterInput = deepcopy(CHARACTER_INPUT_TEMPLATE) as TCharacterInput;
      const artifactDetailInput = deepcopy(ARTIFACT_DETAIL_INPUT_TEMPLATE) as TArtifactDetailInput;
      const conditionInput = deepcopy(CONDITION_INPUT_TEMPLATE) as TConditionInput;
      const optionInput = deepcopy(OPTION_INPUT_TEMPLATE) as TOptionInput;
      const statsInput = deepcopy(STATS_INPUT_TEMPLATE) as TStatsInput;
      const damageResult = deepcopy(DAMAGE_RESULT_TEMPLATE) as TDamageResult;

      characterInput.character = savedSupporter.key as TCharacterKey;
      characterInput.characterMaster = await getCharacterMasterDetail(characterInput.character);
      await loadRecommendation(
        characterInput,
        artifactDetailInput,
        conditionInput,
        JSON.parse(savedSupporter.value)
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
        characterInput,
        conditionInput,
        statsInput
      );
      return damageResult;
    };

    const loadSupporterData = async () => {
      for (const savedSupporter of props.savedSupporters) {
        const damageResult = await setupSupporterDamageResult(savedSupporter);
        supporterDamageResult.set(savedSupporter.key, damageResult);
      }
    };
    loadSupporterData();

    watch(props.savedSupporters, async (newVal, oldVal) => {
      for (const entry of newVal) {
        const changed = oldVal.filter(s => s.key == entry.key && s.value == entry.value).length > 0;
        if (changed) {
          const damageResult = await setupSupporterDamageResult(entry);
          supporterDamageResult.set(entry.key, damageResult);
        }
      }
      for (const entry of oldVal) {
        const absent = newVal.filter(s => s.key == entry.key).length == 0;
        if (absent) {
          supporterDamageResult.delete(entry.key);
        }
      }
    });

    const damageDetailArr = [] as any[];
    const statusChangeDetailObjArr = [] as any[];
    const talentChangeDetailObjArr = [] as any[];
    const conditionMap = new Map() as Map<string, any[] | null>;
    const exclusionMap = new Map() as Map<string, string[] | null>;
    const conditionInput = reactive({
      conditionValues: {} as { [key: string]: any },
      checkboxList: [] as (TCheckboxEntry & { displayName: string })[],
      selectList: [] as (TSelectEntry & { displayName: string })[],
    });
    const conditionValues = conditionInput.conditionValues;
    const checkboxList = conditionInput.checkboxList;
    const selectList = conditionInput.selectList;
    const damageResultDummy = deepcopy(DAMAGE_RESULT_TEMPLATE);

    for (const masterList of [TEAM_OPTION_MASTER_LIST]) {
      for (const entry of masterList) {
        const supporter = entry.key.split("_")[0];
        if (!supporterKeyList.includes(supporter)) supporterKeyList.push(supporter);
        if ("詳細" in entry) {
          for (const detailObj of entry.詳細) {
            if ("条件" in detailObj) {
              if (!(detailObj as any).条件.startsWith(supporter + "*")) {
                (detailObj as any).条件 = supporter + "*" + detailObj.条件;
              }
            } else {
              (detailObj as any).条件 = supporter + "*" + entry.名前;
            }
          }
        }
        damageDetailArr.splice(
          damageDetailArr.length,
          0,
          ...makeDamageDetailObjArr(
            entry,
            null,
            null,
            null,
            statusChangeDetailObjArr,
            talentChangeDetailObjArr,
            "その他オプション"
          )
        );
      }
    }
    damageDetailArr
      .filter((s) => s["条件"])
      .forEach((detailObj) => {
        makeConditionExclusionMapFromStr(detailObj["条件"], conditionMap, exclusionMap);
      });
    statusChangeDetailObjArr
      .filter((s) => s["条件"])
      .forEach((detailObj) => {
        makeConditionExclusionMapFromStr(detailObj["条件"], conditionMap, exclusionMap);
      });
    talentChangeDetailObjArr
      .filter((s) => s["条件"])
      .forEach((detailObj) => {
        makeConditionExclusionMapFromStr(detailObj["条件"], conditionMap, exclusionMap);
      });
    conditionMap.forEach((value, key) => {
      if (value && Array.isArray(value)) {
        if (!value[0].startsWith("required_")) {
          conditionMap.set(key, ["", ...value]);
        }
      }
    });
    conditionMap.forEach((value: string[] | null, key: string) => {
      if (value) {
        if (selectList.filter((s) => s.name == key).length == 0) {
          const required = value[0].startsWith("required_");
          selectList.push({
            name: key,
            options: value,
            required: required,
            displayName: key.replace(/^.+\*/, ""),
          });
        }
      } else {
        if (checkboxList.filter((s) => s.name == key).length == 0) {
          checkboxList.push({ name: key, displayName: key.replace(/^.+\*/, "") });
        }
      }
    });
    conditionMap.forEach((value, key) => {
      if (value === null) {
        // checkbox
        conditionValues[key] = false;
      } else {
        // select
        conditionValues[key] = 0;
      }
    });
    for (const key of supporterKeyList) {
      supporterOpenClose[key] = false;
    }

    const supporterCheckboxList = (supporter: any) => {
      return checkboxList.filter((s) => s.name.startsWith(supporter));
    };

    const supporterSelectList = (supporter: any) => {
      return selectList.filter((s) => s.name.startsWith(supporter));
    };

    const conditionDisabled = (item: any): boolean => {
      const supporter = item.name.split("_")[0];
      if (supporter == props.character) return true;
      if (supporterDamageResult.has(supporter)) return false;
      for (const myDetailObj of statusChangeDetailObjArr) {
        if (myDetailObj.条件.startsWith(item.name)) {
          if (isUseReference(myDetailObj.数値)) {
            return true;
          }
        }
      }
      return false;
    };

    const statAdjustments = computed(() => {
      const workObj = {} as TStats;
      const validConditionValueArr = makeValidConditionValueArr(conditionInput);
      for (const myDetailObj of statusChangeDetailObjArr) {
        let supporter;
        let myNew数値 = myDetailObj["数値"];
        if (myDetailObj["条件"]) {
          supporter = myDetailObj["条件"].substring(0, myDetailObj["条件"].indexOf('*'));
          const number = checkConditionMatches(
            myDetailObj["条件"],
            validConditionValueArr,
            0
          );
          if (number == 0) continue;
          if (number != 1) {
            myNew数値 = (myNew数値 as any).concat(["*", number]);
          }
        }
        const damageResult = supporter ? supporterDamageResult.get(supporter) : damageResultDummy;
        const myValue = calculateFormulaArray(myNew数値, workObj, damageResult);
        const kinds = [] as string[];
        if (myDetailObj["種類"].startsWith('全') || myDetailObj["種類"].startsWith('敵全')) {
          for (const elem of ['炎', '水', '風', '雷', '草', '氷', '岩']) {
            kinds.push(myDetailObj["種類"].replace('全', elem))
          }
        } else {
          kinds.push(myDetailObj["種類"]);
        }
        for (const kind of kinds) {
          if (kind in workObj) {
            workObj[kind] += myValue;
          } else {
            workObj[kind] = myValue;
          }
        }
      }
      return workObj;
    });

    // TODO 多言語対応
    const displayStatAjustmentList = computed(() => {
      const resultArr = [];
      for (const stat of Object.keys(statAdjustments.value)) {
        let str = stat
          .replace("%", "")
          .replace(/^敵/, "敵の")
          .replace("ダメージ会心", "ダメージの会心");
        str += statAdjustments.value[stat] >= 0 ? "+" : "";
        str += statAdjustments.value[stat];
        if (
          stat.endsWith("%") ||
          STAT_PERCENT_LIST.includes(stat) ||
          stat.endsWith("会心率") ||
          stat.endsWith("会心ダメージ")
        )
          str += "%";
        resultArr.push(str);
      }
      return resultArr;
    });

    const onChange = () => {
      console.log(conditionValues, statAdjustments.value);
      context.emit("update:team-option", statAdjustments.value);
    };

    return {
      displayName, displayOptionName,

      supporterKeyList,
      supporterCheckboxList,
      supporterSelectList,
      conditionValues,
      conditionDisabled,
      onChange,
      displayStatAjustmentList,
      supporterOpenClose,
    };
  },
});
</script>
<style scoped>
div.left {
  text-align: left;
  width: 100%;
}

fieldset.supporter {
  margin-bottom: 10px;
}

label {
  display: inline-block;
  margin: 2px 0.5rem;
  text-align: left;
}

label.toggle-switch {
  text-align: center;
  width: calc(100% / 3 - 3rem - 4px);
  min-width: none;
}

legend label.toggle-switch {
  padding: 0;
  background-color: transparent;
  border-width: 0 0 1px 0;
  border-radius: 0;
  width: 20rem;
}

label.condition {
  min-width: calc(100% / 3 - 1rem - 4px);
}

p.notice {
  text-align: left;
  color: chocolate;
}
</style>
