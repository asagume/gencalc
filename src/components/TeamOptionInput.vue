<template>
  <fieldset class="team-option">
    <template v-for="supporter in supporterKeyList" :key="supporter">
      <fieldset
        v-if="supporterOpenClose[supporter]"
        class="supporter"
        v-show="supporterVisible(supporter)"
      >
        <legend>
          <input
            class="hidden"
            :id="'supporter-' + supporter"
            type="checkbox"
            v-model="supporterOpenClose[supporter]"
          />
          <label class="toggle-switch unfold" :for="'supporter-' + supporter">
            <span>{{ displayName(supporter) }}</span>
          </label>
        </legend>
        <div class="left">
          <label
            class="condition"
            v-for="item in supporterCheckboxList(supporter)"
            :key="item.name"
          >
            <input
              type="checkbox"
              v-model="conditionValues[item.name]"
              :value="item.name"
              :disabled="conditionDisabled(item)"
              @change="onChange"
            />
            <span> {{ displayName(item.displayName) }}</span>
          </label>
          <label
            class="condition"
            v-for="item in supporterSelectList(supporter)"
            :key="item.name"
          >
            <span> {{ displayName(item.displayName) }} </span>
            <select
              v-model="conditionValues[item.name]"
              :disabled="conditionDisabled(item)"
              @change="onChange"
            >
              <option
                v-for="(option, index) in item.options"
                :value="index"
                :key="option"
              >
                {{ displayOptionName(option) }}
              </option>
            </select>
          </label>
        </div>
      </fieldset>
      <template v-else>
        <div v-show="supporterVisible(supporter)" class="supporter-else">
          <input
            class="hidden"
            :id="'supporter-else-' + supporter"
            type="checkbox"
            v-model="supporterOpenClose[supporter]"
          />
          <label
            :class="'toggle-switch fold' + supporterOptionSelectedClass(supporter)"
            :for="'supporter-else-' + supporter"
          >
            <span>{{ displayName(supporter) }}</span>
          </label>
        </div>
      </template>
    </template>

    <hr />

    <ul class="option-description">
      <li v-for="item in displayStatAjustmentList" :key="item">{{ item }}</li>
    </ul>

    <label>
      {{ displayName("すべて閉じる") }}
      <button type="button" @click="closeAllSupporters">{{ displayName("実行") }}</button>
    </label>
    <label>
      {{ displayName("すべてクリア") }}
      <button type="button" @click="clearAllSupporterOptions">
        {{ displayName("実行") }}
      </button>
    </label>
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
  calculateDamageResult,
  calculateStats,
  checkConditionMatches,
  makeValidConditionValueArr,
} from "@/calculate";
import { deepcopy, isNumber, overwriteObject } from "@/common";
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
  makeDamageDetailObjArr,
  makeConditionExclusionMapFromStr,
  TStats,
  makeTeamOptionDetailObjArr,
  TDamageDetailObj,
  ステータスTEMPLATE,
} from "@/input";
import {
  CHARACTER_MASTER,
  getCharacterMasterDetail,
  TCharacterKey,
  TEAM_OPTION_MASTER_LIST,
} from "@/master";
import { computed, defineComponent, nextTick, PropType, reactive, watch } from "vue";
import CompositionFunction from "./CompositionFunction.vue";

type TConditionValuesAny = {
  [key: string]: any;
};

export default defineComponent({
  name: "TeamOptionInput",
  props: {
    character: { type: String as PropType<TCharacterKey>, required: true },
    savedSupporters: {
      type: Object as PropType<{ key: string; value: string }[]>,
      required: true,
    },
  },
  emits: ["update:team-option"],
  setup(props, context) {
    const {
      displayName,
      displayStatName,
      displayStatValue,
      displayOptionName,
    } = CompositionFunction();

    const supporterKeyList = Object.keys(CHARACTER_MASTER);
    const supporterOpenClose = reactive({} as { [key: string]: boolean });

    const damageDetailArr = [] as any[];
    const statusChangeDetailObjArr: TDamageDetailObj[] = [];
    const talentChangeDetailObjArr: TDamageDetailObj[] = [];
    const conditionMap = new Map() as Map<string, string[] | null>;
    const exclusionMap = new Map() as Map<string, string[] | null>;
    const conditionInput = reactive(
      deepcopy(CONDITION_INPUT_TEMPLATE) as TConditionInput
    );
    const conditionValues = conditionInput.conditionValues as TConditionValuesAny;
    const checkboxList = conditionInput.checkboxList;
    const selectList = conditionInput.selectList;
    const statsObjDummy = deepcopy(ステータスTEMPLATE);
    const damageResultDummy = deepcopy(DAMAGE_RESULT_TEMPLATE);

    const additionalConditions: string[] = [];

    for (const masterList of [TEAM_OPTION_MASTER_LIST]) {
      for (const entry of masterList) {
        const supporter = entry.key.split("_")[0];
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
        makeConditionExclusionMapFromStr(
          detailObj["条件"] as string,
          conditionMap,
          exclusionMap
        );
      });
    statusChangeDetailObjArr
      .filter((s) => s["条件"])
      .forEach((detailObj) => {
        makeConditionExclusionMapFromStr(
          detailObj["条件"] as string,
          conditionMap,
          exclusionMap
        );
      });
    talentChangeDetailObjArr
      .filter((s) => s["条件"])
      .forEach((detailObj) => {
        makeConditionExclusionMapFromStr(
          detailObj["条件"] as string,
          conditionMap,
          exclusionMap
        );
      });
    conditionMap.forEach((value, key) => {
      if (value && Array.isArray(value)) {
        if (!value[0].startsWith("required_")) {
          conditionMap.set(key, ["", ...value]);
        }
      }
    });

    const updateConditionList = () => {
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
          if (!(key in conditionValues)) conditionValues[key] = false;
        } else {
          // select
          if (!(key in conditionValues)) conditionValues[key] = 0;
        }
      });
    };
    updateConditionList();

    for (const key of supporterKeyList) {
      supporterOpenClose[key] = false;
    }

    const supporterDamageResult = reactive(
      new Map() as Map<string, [TStats, TDamageResult]>
    );

    const takeMasterTeamOption = (character: string, master: any) => {
      if ("チームバフ" in master) {
        const detailObjArr = master.チームバフ as any[];
        const damageDetailObjArr: TDamageDetailObj[] = makeTeamOptionDetailObjArr(
          detailObjArr
        );
        damageDetailObjArr.forEach((damageDetailObj) => {
          const condition = character + "*" + damageDetailObj.名前;
          damageDetailObj.条件 = condition;
          if (!additionalConditions.includes(condition)) {
            additionalConditions.push(condition);
          }
          if (statusChangeDetailObjArr.filter((s) => s.条件 == condition).length == 0) {
            statusChangeDetailObjArr.splice(
              statusChangeDetailObjArr.length,
              0,
              damageDetailObj
            );
          }
          // if (talentChangeDetailObjArr.filter((s) => s.条件 == condition).length == 0) {
          //   talentChangeDetailObjArr.splice(
          //     talentChangeDetailObjArr.length,
          //     0,
          //     damageDetailObj
          //   );
          // }
          makeConditionExclusionMapFromStr(condition, conditionMap, exclusionMap);
        });
        updateConditionList();
      }
    };

    const setupSupporterDamageResult = async (savedSupporter: {
      key: string;
      value: string;
    }): Promise<[TStats, TDamageResult]> => {
      const characterInput = deepcopy(CHARACTER_INPUT_TEMPLATE) as TCharacterInput;
      const artifactDetailInput = deepcopy(
        ARTIFACT_DETAIL_INPUT_TEMPLATE
      ) as TArtifactDetailInput;
      const conditionInput = deepcopy(CONDITION_INPUT_TEMPLATE) as TConditionInput;
      const optionInput = deepcopy(OPTION_INPUT_TEMPLATE) as TOptionInput;
      const statsInput = deepcopy(STATS_INPUT_TEMPLATE) as TStatsInput;
      const damageResult = deepcopy(DAMAGE_RESULT_TEMPLATE) as TDamageResult;

      characterInput.character = savedSupporter.key as TCharacterKey;
      characterInput.characterMaster = await getCharacterMasterDetail(
        characterInput.character
      );

      const builddata = JSON.parse(savedSupporter.value);

      await loadRecommendation(
        characterInput,
        artifactDetailInput,
        conditionInput,
        optionInput,
        builddata
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

      if (characterInput.character == "雷電将軍") {
        // for 雷罰悪曜の眼
        const myCharacterMaster = await getCharacterMasterDetail(props.character);
        statsInput.statsObj["元素エネルギー"] =
          myCharacterMaster["元素爆発"]["元素エネルギー"];
      }

      calculateDamageResult(damageResult, characterInput, conditionInput, statsInput);

      // マスターから取り込んだチームバフを削除します
      const removeConditions: string[] = additionalConditions.filter((s) =>
        s.startsWith(characterInput.character + "*")
      );
      if (removeConditions.length > 0) {
        statusChangeDetailObjArr.splice(
          0,
          statusChangeDetailObjArr.length,
          ...statusChangeDetailObjArr.filter(
            (s) => !removeConditions.includes(s.条件 as string)
          )
        );
        talentChangeDetailObjArr.splice(
          0,
          talentChangeDetailObjArr.length,
          ...talentChangeDetailObjArr.filter(
            (s) => !removeConditions.includes(s.条件 as string)
          )
        );
        removeConditions.forEach((condition) => {
          if (conditionMap.has(condition)) {
            conditionMap.delete(condition);
          }
        });
        checkboxList.splice(
          0,
          checkboxList.length,
          ...checkboxList.filter((s) => !removeConditions.includes(s.name))
        );
        selectList.splice(
          0,
          selectList.length,
          ...selectList.filter((s) => !removeConditions.includes(s.name))
        );
        additionalConditions.splice(
          0,
          additionalConditions.length,
          ...additionalConditions.filter((s) => !removeConditions.includes(s))
        );
      }

      // キャラクターマスターに記述したチームバフを取り込みます
      takeMasterTeamOption(characterInput.character, characterInput.characterMaster);

      // 武器マスターに記述したチームバフを取り込みます
      takeMasterTeamOption(characterInput.character, characterInput.weaponMaster);

      return [statsInput.statsObj, damageResult];
    };

    const loadSupporterData = async () => {
      for (const savedSupporter of props.savedSupporters) {
        const [statsObj, damageResult] = await setupSupporterDamageResult(savedSupporter);
        supporterDamageResult.set(savedSupporter.key, [statsObj, damageResult]);
      }
    };
    loadSupporterData();

    const supporterCheckboxList = (supporter: any) => {
      return checkboxList.filter((s) => s.name.startsWith(supporter + "*"));
    };

    const supporterSelectList = (supporter: any) => {
      return selectList.filter((s) => s.name.startsWith(supporter + "*"));
    };

    /** 選択中のキャラクターのオプションは無効です */
    const supporterVisible = (supporter: any) => {
      if (supporter == props.character) return false;
      if (supporterCheckboxList(supporter).length) return true;
      if (supporterSelectList(supporter).length) return true;
      return false;
    };

    const supporterOptionSelectedClass = (supporter: any) => {
      for (const entry of supporterCheckboxList(supporter)) {
        if (conditionValues[entry.name]) return " selected";
      }
      for (const entry of supporterSelectList(supporter)) {
        if (!entry.required && conditionValues[entry.name]) return " selected";
      }
      return "";
    };

    /** サポーターのステータス（天賦レベル）を参照するオプションには保存データが必要です */
    const conditionDisabled = (item: any): boolean => {
      const supporter = item.name.split("*")[0];
      if (props.savedSupporters.filter((s) => s.key == supporter).length > 0)
        return false;
      for (const myDetailObj of statusChangeDetailObjArr) {
        if (myDetailObj.条件) {
          if (myDetailObj.条件.startsWith(item.name)) {
            if (isNumber(myDetailObj.数値)) return false;
            if (Array.isArray(myDetailObj.数値)) {
              for (const entry of myDetailObj.数値) {
                if (!isNumber(entry) && !["+", "-", "*", "/"].includes(entry))
                  return true;
              }
            }
          }
        }
      }
      for (const myDetailObj of talentChangeDetailObjArr) {
        if (myDetailObj.条件) {
          if (myDetailObj.条件.startsWith(item.name)) {
            if (isNumber(myDetailObj.数値)) return false;
            if (Array.isArray(myDetailObj.数値)) {
              for (const entry of myDetailObj.数値) {
                if (!isNumber(entry) && !["+", "-", "*", "/"].includes(entry))
                  return true;
              }
            }
          }
        }
      }
      return false;
    };

    /** ステータス補正値を計算します */
    const statAdjustments = computed(() => {
      const workObj = {} as TStats;
      const validConditionValueArr = makeValidConditionValueArr(conditionInput);
      [statusChangeDetailObjArr, talentChangeDetailObjArr].forEach((detailObjArr) => {
        if (detailObjArr) {
          for (const myDetailObj of detailObjArr) {
            let supporter;
            let myNew数値 = myDetailObj.数値;
            let my上限 = myDetailObj.上限;
            if (myDetailObj["条件"]) {
              supporter = myDetailObj["条件"].substring(
                0,
                myDetailObj["条件"].indexOf("*")
              );
              if (supporter == props.character) continue;
              const number = checkConditionMatches(
                myDetailObj["条件"],
                validConditionValueArr,
                0
              );
              if (number == 0) continue;
              if (number != 1 && myNew数値) {
                myNew数値 = (myNew数値 as any).concat(["*", number]);
              }
            }
            let statsObj: TStats = statsObjDummy;
            let damageResult: TDamageResult = damageResultDummy;
            if (supporter) {
              const temp = supporterDamageResult.get(supporter);
              if (temp) {
                statsObj = temp[0];
                damageResult = temp[1];
              }
            }
            let myValue = Infinity;
            if (myNew数値) {
              myValue = calculateFormulaArray(myNew数値, statsObj, damageResult, my上限);
            }
            const kinds = [] as string[];
            if (myDetailObj["種類"]) {
              if (
                myDetailObj["種類"].startsWith("全") ||
                myDetailObj["種類"].startsWith("敵全")
              ) {
                for (const elem of ["炎", "水", "風", "雷", "草", "氷", "岩"]) {
                  kinds.push(myDetailObj["種類"].replace("全", elem));
                }
              } else {
                kinds.push(myDetailObj["種類"]);
              }
            }
            for (const kind of kinds) {
              if (kind in workObj) {
                workObj[kind] += myValue;
              } else {
                workObj[kind] = myValue;
              }
            }
          }
        }
      });
      // context.emit("update:team-option", workObj);
      return workObj;
    });

    /** ステータス補正値を表示用の形式に編集します */
    const displayStatAjustmentList = computed(() => {
      const resultArr = [];
      for (const stat of Object.keys(statAdjustments.value)) {
        let result: string = displayStatName(stat).replace("%", "");
        const value = statAdjustments.value[stat];
        if (value != Infinity) {
          if (isNumber(value)) {
            if (value >= 0) {
              if (stat.split(".")[0] == "別枠乗算") result += "=";
              else result += "+";
            }
            result += displayStatValue(stat, value);
          } else if (value) {
            result += "=" + value;
          }
        }
        resultArr.push(result);
      }
      return resultArr;
    });

    /** オプションが変更されたことを上位に通知します */
    const onChange = async () => {
      await nextTick();
      overwriteObject(conditionInput.conditionAdjustments, statAdjustments.value);
      context.emit("update:team-option", conditionInput);
    };

    const initializeValues = (initialObj: TConditionInput) => {
      Object.keys(conditionValues).forEach((key) => {
        if (key in initialObj.conditionValues) {
          conditionValues[key] = initialObj.conditionValues[key];
        } else {
          if (conditionMap.has(key)) {
            if (conditionMap.get(key)) {
              conditionValues[key] = 0;
            } else {
              conditionValues[key] = false;
            }
          }
        }
      });
      onChange();
    };

    const closeAllSupporters = () => {
      for (const supporter of Object.keys(supporterOpenClose)) {
        supporterOpenClose[supporter] = false;
      }
    };

    const clearAllSupporterOptions = () => {
      for (const entry of checkboxList) {
        conditionValues[entry.name] = false;
      }
      for (const entry of selectList) {
        conditionValues[entry.name] = 0;
      }
    };

    watch(props, async (newVal, oldVal) => {
      for (const entry of newVal.savedSupporters) {
        const changed =
          oldVal.savedSupporters.filter(
            (s) => s.key == entry.key && s.value == entry.value
          ).length > 0;
        if (
          changed ||
          entry.key == "雷電将軍" // for 雷罰悪曜の眼
        ) {
          const temp = await setupSupporterDamageResult(entry);
          supporterDamageResult.set(entry.key, temp);
        }
      }
      for (const entry of oldVal.savedSupporters) {
        const absent =
          newVal.savedSupporters.filter((s) => s.key == entry.key).length == 0;
        if (absent) {
          supporterDamageResult.delete(entry.key);
        }
      }
    });

    return {
      displayName,
      displayOptionName,

      supporterKeyList,
      supporterCheckboxList,
      supporterSelectList,
      conditionValues,
      supporterVisible,
      supporterOptionSelectedClass,
      conditionDisabled,
      displayStatAjustmentList,

      onChange,
      initializeValues,

      supporterOpenClose,
      closeAllSupporters,
      clearAllSupporterOptions,
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
  padding-top: 0;
}

label {
  display: inline-block;
  margin: 2px 0.5rem;
  text-align: left;
}

div.supporter-else {
  display: inline-block;
  width: calc(100% / 3);
}

.unfold {
  text-align: center;
  padding: 0;
  background-color: transparent;
  border-width: 0 0 2px 0;
  border-radius: 0;
  width: 20rem;
}

.fold {
  text-align: center;
  width: calc(100% - 3rem - 6px);
}

label.condition {
  min-width: calc(100% / 3 - 1rem - 6px);
}

:disabled + label {
  color: gray;
}

label.selected {
  background-color: maroon;
}

p.notice {
  text-align: left;
  color: chocolate;
}
</style>
