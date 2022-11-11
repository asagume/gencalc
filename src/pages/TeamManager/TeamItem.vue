<template>
  <div :class="'team' + selectedClass">
    <div class="title">
      <label class="name">
        <span class="handle">◆</span>
        <span v-if="editable">
          <input type="text" minlength="1" maxlength="16" v-model="name" placeholder="INPUT TEAM NAME"
            @change="nameOnChange" />
          <span class="button material-symbols-outlined" @click="editable = false">
            edit_off
          </span>
        </span>
        <span v-else>
          <span>{{ name }}</span>
          <span class="button material-symbols-outlined" @click="editable = true">
            edit
          </span>
        </span>
      </label>
      <div class="elemental-resonance">
        <img class="elemental-resonance" v-for="src in resonanceElementImgSrcs" :key="src" :src="src" alt="resonance" />
      </div>
    </div>
    <div class="members">
      <table>
        <tr>
          <td v-for="member in team.members" :key="member.id">
            <MemberItem :member="member" :statsObj="memberStats[member.id]" :displayStat="displayStat"
              :showEquipment="true" :viewable="true" :members="team.members.map(s => s.name)"
              :elementalResonance="elementalResonance" @click:character="characterOnClick"
              @change:buildname="changeBuildname" />
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import CompositionFunction from "@/components/CompositionFunction.vue";
import { CHARACTER_MASTER, ELEMENTAL_RESONANCE_MASTER, ELEMENT_IMG_SRC, getCharacterMasterDetail, TAnyObject, TCharacterKey } from "@/master";
import { computed, defineComponent, PropType, reactive, ref, watch } from "vue";
import { characterMaster, getBuilddataFromStorage, TMember, TTeam } from "./team";
import MemberItem from "./MemberItem.vue";
import { ALL_ELEMENTS, calculateArtifactStats, calculateArtifactStatsMain, calculateDamageResult, calculateFormulaArray, calculateStats } from "@/calculate";
import { deepcopy, overwriteObject } from "@/common";
import {
  ARTIFACT_DETAIL_INPUT_TEMPLATE,
  CHARACTER_INPUT_TEMPLATE,
  CONDITION_INPUT_TEMPLATE,
  OPTION_INPUT_TEMPLATE,
  STATS_INPUT_TEMPLATE,
  TArtifactDetailInput,
  TCharacterInput,
  TConditionInput,
  TOptionInput,
  TStatsInput,
  loadRecommendation,
  makeDamageDetailObjArrObjCharacter,
  makeDamageDetailObjArrObjWeapon,
  makeDamageDetailObjArrObjArtifactSets,
  setupConditionValues,
  TStats,
  TDamageResult,
  DAMAGE_RESULT_TEMPLATE,
} from "@/input";

type TMemberResult = {
  characterInput: TCharacterInput,
  artifactDetailInput: TArtifactDetailInput,
  conditionInput: TConditionInput,
  optionInput: TOptionInput,
  statsInput: TStatsInput,
  damageResult: TDamageResult,
};

export default defineComponent({
  name: "TeamItem",
  props: {
    team: { type: Object as PropType<TTeam>, required: true },
    selected: { type: Boolean, requied: true },
    displayStat: { type: String },
  },
  emits: ["change:name", "click:character", "change:buildname"],
  components: {
    MemberItem,
  },
  setup(props, context) {
    const { displayName } = CompositionFunction();

    const memberStats = reactive({} as TAnyObject);

    const watchCount = ref(0);
    watch(props, async (newVal) => {
      name.value = newVal.team.name;
      const list = [];
      for (const member of newVal.team.members) {
        list.push(calculateMemberResult(member).then(result => ({ key: member.id, value: result })));
      }
      const teamAdjustments: TStats = {};
      await Promise.all(list).then(results => {
        results.forEach(entry => {
          memberStats[entry.key] = entry.value.statsInput?.statsObj;

          const characterMaster = entry.value.characterInput?.characterMaster;
          const weaponMaster = entry.value.characterInput?.weaponMaster;
          if (characterMaster && characterMaster.チームバフ) {
            for (const damageDetail of characterMaster.チームバフ) {
              if (damageDetail.条件) continue;
              const value = calculateFormulaArray(damageDetail.数値, entry.value.statsInput.statsObj, entry.value.damageResult, damageDetail.最大値, damageDetail.最小値);
              if (damageDetail.種類 in teamAdjustments) {
                teamAdjustments[damageDetail.種類] += value;
              } else {
                teamAdjustments[damageDetail.種類] = value;
              }
            }
          }
          if (weaponMaster && weaponMaster.チームバフ) {
            for (const damageDetail of weaponMaster.チームバフ) {
              if (damageDetail.条件) continue;
              const value = calculateFormulaArray(damageDetail.数値, entry.value.statsInput.statsObj, entry.value.damageResult, damageDetail.最大値, damageDetail.最小値);
              if (damageDetail.種類 in teamAdjustments) {
                teamAdjustments[damageDetail.種類] += value;
              } else {
                teamAdjustments[damageDetail.種類] = value;
              }
            }
          }
        });
      });
      for (const stat of Object.keys(teamAdjustments)) {
        for (const memberKey of Object.keys(memberStats)) {
          if (!memberStats[memberKey]) continue;
          if (stat in memberStats[memberKey]) {
            memberStats[memberKey][stat] += teamAdjustments[stat];
          } else {
            memberStats[memberKey][stat] = teamAdjustments[stat];
          }
        }
      }
      watchCount.value++;
    });

    const selectedClass = computed(() => (props.selected ? " selected" : ""));
    const editable = ref(false);
    const name = ref(props.team.name);
    const nameOnChange = () => {
      context.emit("change:name", props.team.id, name);
    };

    const elementalResonance = computed(() => {
      const result: string[] = [];
      const work: TAnyObject = {};
      const members = props.team.members.filter((s) => s.name);
      if (members.length == 4) {
        members.forEach((member) => {
          const master = characterMaster(member);
          if (master) {
            if (master.元素 in work) {
              work[master.元素]++;
            } else {
              work[master.元素] = 1;
            }
          }
        });
        if (Object.keys(work).length == 4) {
          result.push("元素共鳴なし");
        } else {
          Object.keys(work).forEach((key) => {
            if (work[key] >= 2) {
              result.push(key + "元素共鳴");
            }
          });
        }
      }
      return result;
    });

    const resonanceElementImgSrcs = computed(() => {
      const result: string[] = [];
      elementalResonance.value.forEach((entry) => {
        if (entry == "元素共鳴なし") {
          const members = props.team.members.filter((s) => s.name);
          members.forEach((member) => {
            const master = CHARACTER_MASTER[member.name as TCharacterKey];
            const src = (ELEMENT_IMG_SRC as any)[master.元素];
            result.push(src);
          });
        } else {
          const src = (ELEMENT_IMG_SRC as any)[entry.replace("元素共鳴", "")];
          result.push(src);
          result.push(src);
        }
      });
      return result;
    });

    const calculateMemberResult = async (member: TMember): Promise<TMemberResult> => {
      const characterInput: TCharacterInput = deepcopy(CHARACTER_INPUT_TEMPLATE);
      const artifactDetailInput: TArtifactDetailInput = deepcopy(ARTIFACT_DETAIL_INPUT_TEMPLATE);
      const conditionInput: TConditionInput = deepcopy(CONDITION_INPUT_TEMPLATE);
      const optionInput: TOptionInput = deepcopy(OPTION_INPUT_TEMPLATE);
      const statsInput: TStatsInput = deepcopy(STATS_INPUT_TEMPLATE);
      const damageResult: TDamageResult = deepcopy(DAMAGE_RESULT_TEMPLATE);

      const result: TMemberResult = {
        characterInput: characterInput,
        artifactDetailInput: artifactDetailInput,
        conditionInput: conditionInput,
        optionInput: optionInput,
        statsInput: statsInput,
        damageResult: damageResult,
      };

      if (!member.name) return result;

      characterInput.character = member.name as TCharacterKey;
      characterInput.characterMaster = await getCharacterMasterDetail(
        characterInput.character
      );

      let builddata;
      const character = member.name;
      if (character && member.buildname) {
        builddata = getBuilddataFromStorage(character, member.buildname);
      }
      if (!builddata) return result;

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
      setupConditionValues(conditionInput, characterInput, optionInput);
      calculateArtifactStatsMain(
        artifactDetailInput.聖遺物ステータスメイン効果,
        artifactDetailInput.聖遺物メイン効果
      );
      calculateArtifactStats(artifactDetailInput);

      conditionInput.checkboxList.forEach((entry) => {
        conditionInput.conditionValues[entry.name] = false;
      });
      conditionInput.selectList.forEach((entry) => {
        conditionInput.conditionValues[entry.name] = 0;
      });

      const myVision = characterInput.characterMaster.元素;
      const teamElements: TAnyObject = {};
      if (props.team.members) {
        props.team.members.filter(s => s.name).forEach(entry => {
          const vision = CHARACTER_MASTER[entry.name as TCharacterKey].元素;
          if (vision in teamElements) {
            teamElements[vision]++;
          } else {
            teamElements[vision] = 1;
          }
        })
      }

      // 武器
      if (['千岩古剣', '千岩長槍'].includes(characterInput.weapon)) {
        if (props.team.members) {
          let liyueCount = 0;
          for (const entry of props.team.members.filter(s => s)) {
            const characterDetail = await getCharacterMasterDetail(entry.name as TCharacterKey);
            if (characterDetail.region) {
              if (['璃月港'].includes(characterDetail.region)) {
                liyueCount++;
              }
            }
          }
          const conditionKey = '[' + characterInput.weapon + ']璃月キャラ1人毎に攻撃力と会心率+';
          conditionInput.conditionValues[conditionKey] = liyueCount;
        }
      } else if (['惡王丸', '斬波のひれ長', '曚雲の月'].includes(characterInput.weapon)) {
        if (props.team.members) {
          let totalEnergyCost = 0;
          for (const entry of props.team.members.filter(s => s)) {
            const characterDetail = await getCharacterMasterDetail(entry.name as TCharacterKey);
            if ('元素エネルギー' in characterDetail.元素爆発) {
              totalEnergyCost += characterDetail.元素爆発.元素エネルギー;
            }
          }
          if (totalEnergyCost) {
            conditionInput.conditionValues['チーム全員の元素エネルギー上限の合計'] = totalEnergyCost;
          }
        }
      }

      const sameCount = teamElements[myVision] - 1;
      const otherElements = Object.keys(teamElements).filter(s => s != myVision);
      const otherCount = otherElements.length ? otherElements.map(s => teamElements[s]).reduce((a, b) => a + b) : 0;
      conditionInput.conditionValues['[チーム]同じ元素のキャラクター'] = sameCount;
      conditionInput.conditionValues['[チーム]異なる元素のキャラクター'] = otherCount;
      conditionInput.conditionValues['[チーム]キャラクターの元素タイプ'] = Object.keys(teamElements).length - 1; // requiredなので1減らします
      ALL_ELEMENTS.forEach(vision => {
        const key1 = '[チーム]' + vision + '元素キャラクター';
        conditionInput.conditionValues[key1] = teamElements[vision] ?? 0;
        const key2 = '[チーム]' + vision + '元素キャラクター(自分以外)';
        conditionInput.conditionValues[key2] = (teamElements[vision] ?? 0) - (vision == myVision ? 1 : 0);
      });

      // 元素共鳴
      if (elementalResonance.value) {
        const workObj = {} as TStats;
        elementalResonance.value.filter(s => ['炎元素共鳴', '水元素共鳴', '草元素共鳴', '元素共鳴なし'].includes(s)).forEach(entry => {
          optionInput.elementalResonance.conditionValues[entry] = true;
          if ("詳細" in (ELEMENTAL_RESONANCE_MASTER as any)[entry]) {
            const detailObjArr = (ELEMENTAL_RESONANCE_MASTER as any)[entry].詳細;
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
        });
        overwriteObject(optionInput.elementalResonance.conditionAdjustments, workObj);
      }

      calculateStats(statsInput, characterInput, artifactDetailInput, conditionInput, optionInput);
      calculateDamageResult(damageResult, characterInput, conditionInput, statsInput);

      return {
        characterInput: characterInput,
        artifactDetailInput: artifactDetailInput,
        conditionInput: conditionInput,
        optionInput: optionInput,
        statsInput: statsInput,
        damageResult: damageResult,
      } as TMemberResult;
    }

    const characterOnClick = () => {
      context.emit("click:character");
    };

    const changeBuildname = (memberId: number, buildname: string) => {
      context.emit("change:buildname", props.team.id, memberId, buildname);
    };

    return {
      displayName,

      selectedClass,
      editable,
      name,
      memberStats,
      elementalResonance,
      resonanceElementImgSrcs,

      nameOnChange,
      characterOnClick,
      changeBuildname,
    };
  },
});
</script>
<style>
div.team {
  display: inline-block;
  max-width: 322px;
  padding: 4px;
  border: 4px double silver;
  border-radius: 10px;
  margin-bottom: 10px;
}

div.title {
  position: relative;
  text-align: left;
  height: 4.5rem;
}

.handle {
  color: darkorange;
}

div.team.selected {
  border-color: gold;
}

label.name {
  font-size: 2.6rem;
}

label.name span {
  margin-left: 0.5rem;
}

label.name span.button {
  display: inline-block;
  position: absolute;
  left: 220px;
  top: 0;
  font-size: 2.6rem;
}

label.name span.button {
  display: inline-block;
  position: absolute;
  right: 0px;
  top: 0px;
}

label.name input {
  width: 180px;
  padding-top: 0;
  padding-bottom: 0;
}

div.elemental-resonance {
  position: absolute;
  right: 0;
  top: 0;
}

img.elemental-resonance {
  width: 20px;
}

.members table {
  width: 100%;
  table-layout: fixed;
  border-spacing: 0;
  text-align: center;
}
</style>
