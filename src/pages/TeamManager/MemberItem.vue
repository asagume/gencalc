<template>
  <div class="member">
    <div class="member-img" @click="characterOnClick">
      <img :class="'character' + characterImgClass" :src="characterImgSrc" :alt="displayName(member.name)" />
      <img class="vision" :src="visionImgSrc" alt="vision" />
      <div class="constellation" v-show="constellation">
        {{ constellation }}
      </div>
      <div class="tag tag-3" v-if="member.tags[3]">{{ member.tags[3] }}</div>
      <div class="tag tag-2" v-if="member.tags[2]">{{ member.tags[2] }}</div>
      <div class="tag tag-1" v-if="member.tags[1]">{{ member.tags[1] }}</div>
      <div class="tag tag-0" v-if="member.tags[0]">{{ member.tags[0] }}</div>
    </div>
    <div class="stat-value" v-if="displayStat">
      {{ statValue }}
    </div>
    <div v-if="showEquipment">
      <img class="weapon" :src="imgWeaponSrc" alt="weapon" />
      <img class="artifact-set" :src="imgArtifactSetSrc(0)" alt="artifact-set" />
      <img class="artifact-set" :src="imgArtifactSetSrc(1)" alt="artifact-set" />
    </div>
    <div class="extra-control">
      <div v-if="viewable && extraControl == 'locate'">
        <button type="button" @click="locate">view</button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import CompositionFunction from "@/components/CompositionFunction.vue";
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
  pushBuildinfoToSession,
  TStats,
} from "@/input";
import {
  ARTIFACT_SET_MASTER,
  CHARACTER_MASTER,
  ELEMENTAL_RESONANCE_MASTER,
  ELEMENT_IMG_SRC,
  getCharacterMasterDetail,
  IMG_SRC_DUMMY,
  STAR_BACKGROUND_IMAGE_CLASS,
  TAnyObject,
  TArtifactSet,
  TCharacterEntry,
  TCharacterKey,
  WEAPON_MASTER,
} from "@/master";
import { computed, defineComponent, PropType, ref, watch } from "vue";
import {
  getBuilddataFromStorage,
  TMember,
} from "./team";
import {
  calculateArtifactStats,
  calculateArtifactStatsMain,
  calculateStats,
} from "@/calculate";

export default defineComponent({
  name: "MemberItem",
  props: {
    member: { type: Object as PropType<TMember>, required: true },
    displayStat: { type: String },
    showEquipment: { type: Boolean },
    viewable: { type: Boolean },
    tags: { type: Array as PropType<any[]> },
    members: { type: Array as PropType<string[]> },
    elementalResonance: { type: Array as PropType<string[]> },
  },
  emits: ["click:character", "change:buildname"],
  setup(props, context) {
    const { displayName, displayStatValue } = CompositionFunction();

    const extraControl = ref("locate");

    const watchCount = ref(0);
    watch(props, async () => {
      await calculateMemberStats();
      watchCount.value++;
    });

    const characterInput = deepcopy(CHARACTER_INPUT_TEMPLATE) as TCharacterInput;
    const artifactDetailInput = deepcopy(
      ARTIFACT_DETAIL_INPUT_TEMPLATE
    ) as TArtifactDetailInput;
    const conditionInput = deepcopy(CONDITION_INPUT_TEMPLATE) as TConditionInput;
    const optionInput = deepcopy(OPTION_INPUT_TEMPLATE) as TOptionInput;
    const statsInput = deepcopy(STATS_INPUT_TEMPLATE) as TStatsInput;

    const calculateMemberStats = async () => {
      if (!props.member.name) return;

      characterInput.character = props.member.name as TCharacterKey;
      characterInput.characterMaster = await getCharacterMasterDetail(
        characterInput.character
      );

      const builddata = savedata.value;
      if (!builddata) return {};

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

      conditionInput.checkboxList.forEach((entry) => {
        conditionInput.conditionValues[entry.name] = false;
      });
      conditionInput.selectList.forEach((entry) => {
        conditionInput.conditionValues[entry.name] = 0;
      });

      const myVision = characterInput.characterMaster.元素;
      const teamElements: TAnyObject = {};
      if (props.members) {
        props.members.filter(s => s).forEach(entry => {
          const vision = CHARACTER_MASTER[entry as TCharacterKey].元素;
          if (vision in teamElements) {
            teamElements[vision]++;
          } else {
            teamElements[vision] = 1;
          }
        })
      }

      // 金メッキの夢
      const gildedDreamsSet = characterInput.artifactSets.filter(s => s == '金メッキの夢').length;
      if (gildedDreamsSet == 2) {
        let sameCount = (teamElements[myVision] - 1);
        let otherCount = Object.keys(teamElements).filter(s => s != myVision).map(s => teamElements[s]).reduce((a, b) => a+ b);
        conditionInput.conditionValues['[金メッキの夢4]同じ元素タイプ'] = sameCount;
        conditionInput.conditionValues['[金メッキの夢4]異なる元素タイプ'] = otherCount;
      }

      // 夜蘭
      if (characterInput.character == '夜蘭') {
        conditionInput.conditionValues['先後の決め手'] = Object.keys(teamElements).length;
      }

      // 元素共鳴
      if (props.elementalResonance) {
        const workObj = {} as TStats;
        props.elementalResonance.forEach(entry => {
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

      calculateStats(
        statsInput,
        characterInput,
        artifactDetailInput,
        conditionInput,
        optionInput
      );
    }
    calculateMemberStats();

    const characterMaster = computed(() =>
      props.member.name
        ? (CHARACTER_MASTER[props.member.name as TCharacterKey] as TCharacterEntry) ??
        undefined
        : undefined
    );
    const characterImgSrc = computed(
      () => characterMaster.value?.icon_url ?? IMG_SRC_DUMMY
    );
    const characterImgClass = computed(() => {
      const rarity = characterMaster.value?.レアリティ;
      return rarity ? " " + (STAR_BACKGROUND_IMAGE_CLASS as any)[String(rarity)] : "";
    });
    const visionImgSrc = computed(() =>
      characterMaster.value?.元素
        ? (ELEMENT_IMG_SRC as any)[characterMaster.value.元素]
        : IMG_SRC_DUMMY
    );
    const constellation = computed(() => (savedata.value ? savedata.value.命ノ星座 : ""));
    const imgWeaponSrc = computed(() =>
      weaponMaster.value ? weaponMaster.value.icon_url : IMG_SRC_DUMMY
    );
    const imgArtifactSetSrc = (index: number) =>
      artifactSetMasters.value[index]?.image ?? IMG_SRC_DUMMY;

    const characterOnClick = () => {
      context.emit("click:character");
    };

    const savedata = computed(() => {
      let result = undefined;
      const character = props.member.name;
      if (character && props.member.buildname) {
        result = getBuilddataFromStorage(character, props.member.buildname);
      }
      return result;
    });

    const weaponMaster = computed(() => {
      let result = undefined;
      if (savedata.value) {
        const weapon = savedata.value.武器;
        if (weapon && characterMaster.value) {
          result = (WEAPON_MASTER as any)[characterMaster.value.武器][weapon];
        }
      }
      return result;
    });

    const artifactSetMasters = computed(() => {
      const result: TArtifactSet[] = [];
      if (savedata.value) {
        for (let i = 0; i < 2; i++) {
          const key = "聖遺物セット効果" + (i + 1);
          let value = savedata.value[key] ?? "NONE";
          result.push((ARTIFACT_SET_MASTER as any)[value]);
        }
      }
      return result;
    });

    const statValue = computed(() => {
      watchCount.value;
      let result = "-";
      if (savedata.value) {
        let stat = props.displayStat;
        if (stat) {
          if (stat === "会心率/ダメージ") {
            result = displayStatValue("会心率", statsInput.statsObj["会心率"]);
            result += "/";
            result += displayStatValue("会心ダメージ", statsInput.statsObj["会心ダメージ"]);
          } else {
            result = displayStatValue(stat, statsInput.statsObj[stat]);
          }
        }
      }
      return result;
    });

    const locate = () => {
      const member = props.member;
      pushBuildinfoToSession(member.name, props.member.buildname);
      window.open("./", "_blank");
    };

    return {
      displayName,

      characterImgSrc,
      characterImgClass,
      visionImgSrc,
      constellation,
      imgWeaponSrc,
      imgArtifactSetSrc,

      statValue,

      extraControl,

      locate,

      characterOnClick,
    };
  },
});
</script>
<style>
div.member-img {
  position: relative;
  width: 100%;
}

img.character {
  width: calc(100%);
  background-size: contain;
}

img.vision {
  width: calc(100% / 3);
  position: absolute;
  left: 0;
  top: 0;
}

div.constellation {
  position: absolute;
  font-size: 20px;
  padding: 2px 5px;
  right: 2px;
  top: 2px;
  background-color: black;
  border-radius: 50%;
  opacity: 75%;
}

div.tag {
  position: absolute;
  left: 50%;
  bottom: 1px;
  transform: translateX(-50%);
  width: 70px;
  height: 12px;
  font-size: 10px;
  background-color: dimgray;
  border: 2px solid whitesmoke;
  border-radius: 3px;
  padding-top: 1px;
}

div.tag-0 {
  bottom: 1px;
}

div.tag-1 {
  bottom: 19px;
}

div.tag-2 {
  bottom: 37px;
}

div.tag-3 {
  bottom: 55px;
}

img.weapon,
img.artifact-set {
  width: calc(100% / 3 - 4px);
  height: calc(100% / 3 - 4px);
  border: 2px solid silver;
  border-radius: 50%;
}

div.stat-value {
  font-size: 12px;
  padding-top: 2px;
  padding-bottom: 2px;
}
</style>
