<template>
  <table>
    <tr>
      <td :class="'name ' + colorClass(characterMaster)" colspan="2">
        <span @click="$emit('open:character-info', 1)">
          {{ displayName(characterMaster.名前) }}
          <span class="material-symbols-outlined"> info </span>
        </span>
      </td>
      <td colspan="2" :class="'title ' + colorClass(characterMaster)">
        <span v-show="characterMaster.baseInfo.称号">
          {{ displayName(characterMaster.baseInfo.称号) }}</span>
      </td>
    </tr>
    <tr>
      <td style="width: 20%">
        <select v-model="ascension" @change="ascensionOnChange">
          <option v-for="item in ascensionRange" :value="item" :key="item">
            A{{ item }}
          </option>
        </select>
        <select v-model="level" @change="characterOnChange">
          <option v-for="item in levelRange" :value="item" :key="item">
            Lv.{{ item }}
          </option>
        </select>
        <select v-model="constellation" @change="characterOnChange">
          <option v-for="item in constellationRange" :value="item" :key="item">
            C{{ item }}
          </option>
        </select>
      </td>
      <td style="position: relative; width: 30%">
        <img :class="'character' + bgImageClass(characterMaster)" :src="characterMaster.icon_url"
          :alt="characterMaster.名前" @click="$emit('open:character-select')" />
        <img class="vision" :src="visionSrc(characterMaster)" :alt="characterMaster.元素" />
      </td>
      <td class="icon">
        <img :class="'weapon' + bgImageClass(weaponMaster)" :src="weaponMaster['icon_url']" :alt="weaponMaster.名前"
          @click="$emit('open:weapon-select')" />
        <div class="tooltip">{{ displayName(weaponMaster.名前) }}</div>
      </td>
      <td style="width: 20%">
        <select v-model="weaponAscension" @change="weaponAscensionOnChange">
          <option v-for="item in weaponAscensionRange" :value="item" :key="item">
            A{{ item }}
          </option>
        </select>
        <select v-model="weaponLevel" @change="weaponOnChange">
          <option v-for="item in weaponLevelRange" :value="item" :key="item">
            Lv.{{ item }}
          </option>
        </select>
        <select v-model="weaponRefine" @change="weaponOnChange">
          <option v-for="item in weaponRefineRange" :value="item" :key="item">
            R{{ item }}
          </option>
        </select>
      </td>
    </tr>
  </table>
  <table class="talent-and-artifact">
    <tr>
      <td class="icon">
        <img :class="'talent ' + bgColorClass(characterMaster)" :src="characterMaster['通常攻撃']['icon_url']"
          :alt="characterMaster['通常攻撃']['名前']" @click="$emit('open:character-info', 2)" />
        <div class="tooltip">{{ displayName(characterMaster["通常攻撃"]["名前"]) }}</div>
      </td>
      <td class="icon">
        <img :class="'talent ' + bgColorClass(characterMaster)" :src="characterMaster['元素スキル']['icon_url']"
          :alt="characterMaster['元素スキル']['名前']" @click="$emit('open:character-info', 3)" />
        <div class="tooltip">
          {{ displayName(characterMaster["元素スキル"]["名前"]) }}
        </div>
      </td>
      <td class="icon">
        <img :class="'talent ' + bgColorClass(characterMaster)" :src="characterMaster['元素爆発']['icon_url']"
          :alt="characterMaster['元素爆発']['名前']" @click="$emit('open:character-info', 4)" />
        <div class="tooltip">{{ displayName(characterMaster["元素爆発"]["名前"]) }}</div>
      </td>
      <td class="icon">
        <label @click="openArtifactSetSelect(0)">
          <img :class="'artifact-set' + artifactSetSelectClass(0)" :src="artifactSetMasters[0].image"
            :alt="artifactSetMasters[0].key" />
        </label>
        <div class="tooltip">{{ displayName(artifactSetMasters[0].key) }}</div>
      </td>
      <td class="icon">
        <label @click="openArtifactSetSelect(1)">
          <img :class="'artifact-set' + artifactSetSelectClass(1)" :src="artifactSetMasters[1].image"
            :alt="artifactSetMasters[1].key" />
        </label>
        <div class="tooltip">{{ displayName(artifactSetMasters[1].key) }}</div>
      </td>
      <td class="artifact-detail-button icon">
        <label @click="$emit('open:artifact-detail-input')">
          <img class="artifact-set" :src="IMG_SRC_DUMMY" :alt="displayName('聖遺物ステータス')" />
          <img class="left-icon" src="images/artifact.png" alt="artifact" />
          <img class="right-icon" src="images/artifact.png" alt="artifact" />
          <div class="absolute-center">{{ "000" }}</div>
        </label>
        <div class="tooltip">{{ displayName("聖遺物詳細") }}</div>
      </td>
    </tr>
    <tr>
      <td>
        <select v-model="normalAttackLevel" @change="characterOnChange">
          <option v-for="item in normalAttackLevelRange" :value="item" :key="item">
            Lv.{{ item }}
          </option>
        </select>
      </td>
      <td>
        <select v-model="elementalSkillLevel" @change="characterOnChange">
          <option v-for="item in elementalSkillLevelRange" :value="item" :key="item">
            Lv.{{ item }}
          </option>
        </select>
      </td>
      <td>
        <select v-model="elementalBurstLevel" @change="characterOnChange">
          <option v-for="item in elementalBurstLevelRange" :value="item" :key="item">
            Lv.{{ item }}
          </option>
        </select>
      </td>
      <td colspan="3">
        <select v-model="storageOrRecommendationRef">
          <option value="0">{{ displayName("名前を付けて保存") }}</option>
          <option value="1">{{ displayName("おすすめセット呼び出し") }}</option>
        </select>
      </td>
    </tr>
  </table>
  <table style="margin-top: 10px; table-layout: fixed">
    <tr v-show="storageOrRecommendationRef == '0'">
      <td colspan="4">
        <label>
          <input class="save-name" type="text" v-model="buildname" maxlength="20" placeholder="input build name"
            @change="saveDisabled = false" />
        </label>
      </td>
      <td>
        <button type="button" :disabled="saveDisabled" @click="saveOnClick">
          Save
          <!-- <span class="material-symbols-outlined"> save </span> -->
        </button>
      </td>
      <td>
        <button type="button" :disabled="removeDisabled" @click="removeOnClick">
          Remove
          <!-- <span class="material-symbols-outlined"> delete </span> -->
        </button>
      </td>
    </tr>
    <tr v-show="storageOrRecommendationRef == '1'">
      <td colspan="6">
        <select v-model="selectedRecommendation" @change="recommendationOnChange($event)">
          <option v-for="item in recommendationList" :value="item.name" :key="item.name">
            {{ displayBuildName(item) }}
          </option>
        </select>
      </td>
    </tr>
  </table>
</template>

<script lang="ts">
import {
  ARTIFACT_SET_MASTER_DUMMY,
  TRecommendation,
  突破レベルレベルARRAY,
} from "@/input";
import {
  ELEMENT_BG_COLOR_CLASS,
  ELEMENT_COLOR_CLASS,
  ELEMENT_IMG_SRC,
  IMG_SRC_DUMMY,
  STAR_BACKGROUND_IMAGE_CLASS,
  TCharacterDetail,
} from "@/master";
import { computed, defineComponent, PropType, ref } from "vue";
import CompositionFunction from './CompositionFunction.vue';

export default defineComponent({
  name: "CharacterInput",
  props: {
    characterInput: { type: Object, required: true },
    recommendationList: { type: Array as PropType<TRecommendation[]>, required: true },
    recommendation: { type: Object as PropType<TRecommendation>, required: true },
    artifactSetSelectVisible: { type: Boolean },
  },
  emits: [
    "open:character-select",
    "open:character-info",
    "update:recommendation",
    "open:weapon-select",
    "open:artifact-set-select",
    "open:artifact-detail-input",
    "update:character-input-character",
    "update:character-input-weapon",
    "open:character-info",
  ],
  setup(props, context) {
    const { displayName, targetValue } = CompositionFunction();

    const ascensionRef = ref(props.characterInput.突破レベル);
    const levelRef = ref(props.characterInput.レベル);
    const constellationRef = ref(props.characterInput.命ノ星座);
    const normalAttackLevelRef = ref(props.characterInput.通常攻撃レベル);
    const elementalSkillLevelRef = ref(props.characterInput.元素スキルレベル);
    const elementalBurstLevelRef = ref(props.characterInput.元素爆発レベル);
    const weaponAscensionRef = ref(props.characterInput.武器突破レベル);
    const weaponLevelRef = ref(props.characterInput.武器レベル);
    const weaponRefineRef = ref(props.characterInput.武器精錬ランク);

    const storageOrRecommendationRef = ref("0");

    const displayBuildName = (item: TRecommendation) => item.name;

    const selectedRecommendationRef = ref(props.recommendation.name);
    const characterMaster = computed(() => props.characterInput.characterMaster);
    const weaponMaster = computed(() => props.characterInput.weaponMaster);
    const artifactSetMasters = computed(
      () =>
        props.characterInput?.artifactSetMasters ?? [
          ARTIFACT_SET_MASTER_DUMMY,
          ARTIFACT_SET_MASTER_DUMMY,
        ]
    );

    const visionSrc = (item: TCharacterDetail) => ELEMENT_IMG_SRC[item.元素] as string;
    const bgImageClass = (item: TCharacterDetail) =>
      (" " + STAR_BACKGROUND_IMAGE_CLASS[item.レアリティ]) as string;
    const colorClass = (item: TCharacterDetail) =>
      ELEMENT_COLOR_CLASS[item.元素] as string;
    const bgColorClass = (item: TCharacterDetail) =>
      ELEMENT_BG_COLOR_CLASS[item.元素] as string;
    let saveDisabled = false;
    let removeDisabled = false;
    const buildnameRef = ref(props.recommendation.name);
    const saveOnClick = () => {
      if (buildnameRef.value) {
        console.log(buildnameRef.value);
      }
    };
    const removeOnClick = () => {
      if (props.characterInput && buildnameRef.value) {
        localStorage.removeItem(
          "構成_" + props.characterInput.character + "_" + buildnameRef.value
        );
      }
    };
    const ascensionRange = computed(() => {
      return [0, 1, 2, 3, 4, 5, 6];
    });
    const levelRange = computed(() => {
      return 突破レベルレベルARRAY[ascensionRef.value];
    });
    const constellationRange = computed(() => {
      let max = 0;
      if ("命ノ星座" in characterMaster.value) {
        max = Object.keys(characterMaster.value["命ノ星座"]).length;
      }
      return Array.from({ length: max + 1 }, (_, i) => i);
    });
    const ascensionOnChange = () => {
      if (levelRef.value < levelRange.value[0]) {
        levelRef.value = levelRange.value[0];
      } else if (levelRef.value > levelRange.value[levelRange.value.length - 1]) {
        levelRef.value = levelRange.value[levelRange.value.length - 1];
      }
      characterOnChange();
    };
    const recommendationOnChange = (event: Event) => {
      if (!props.recommendationList) return;
      if (event.target instanceof HTMLSelectElement) {
        console.log(event.target.value);
        context.emit(
          "update:recommendation",
          props.recommendationList[event.target.selectedIndex]
        );
      }
    };
    const normalAttackLevelRange = computed(() => {
      return Array.from({ length: 10 }, (_, i) => i + 1);
    });
    const elementalSkillLevelRange = computed(() => {
      return Array.from({ length: 13 }, (_, i) => i + 1);
    });
    const elementalBurstLevelRange = computed(() => {
      return Array.from({ length: 13 }, (_, i) => i + 1);
    });
    const weaponAscensionRange = computed(() => {
      return [0, 1, 2, 3, 4, 5, 6];
    });
    const weaponLevelRange = computed(() => {
      return 突破レベルレベルARRAY[weaponAscensionRef.value];
    });
    const weaponRefineRange = computed(() => {
      return [1, 2, 3, 4, 5];
    });
    const weaponAscensionOnChange = () => {
      if (weaponLevelRef.value < weaponLevelRange.value[0]) {
        weaponLevelRef.value = weaponLevelRange.value[0];
      } else if (
        weaponLevelRef.value > weaponLevelRange.value[weaponLevelRange.value.length - 1]
      ) {
        weaponLevelRef.value = weaponLevelRange.value[weaponLevelRange.value.length - 1];
      }
      weaponOnChange();
    };
    const artifactSetIndexRef = ref(0);
    const artifactSetSelectClass = (index: number) =>
      props.artifactSetSelectVisible && index == artifactSetIndexRef.value
        ? " selected"
        : "";
    const openArtifactSetSelect = (index: number) => {
      artifactSetIndexRef.value = index;
      context.emit("open:artifact-set-select", index);
    };
    const characterOnChange = () => {
      const workInput = {} as any;
      workInput.突破レベル = ascensionRef.value;
      workInput.レベル = levelRef.value;
      workInput.命ノ星座 = constellationRef.value;
      workInput.通常攻撃レベル = normalAttackLevelRef.value;
      workInput.元素スキルレベル = elementalSkillLevelRef.value;
      workInput.元素爆発レベル = elementalBurstLevelRef.value;
      context.emit("update:character-input-character", workInput);
    };
    const weaponOnChange = () => {
      const workInput = {} as any;
      workInput.武器突破レベル = weaponAscensionRef.value;
      workInput.武器レベル = weaponLevelRef.value;
      workInput.武器精錬ランク = weaponRefineRef.value;
      context.emit("update:character-input-weapon", workInput);
    };

    return {
      displayName, targetValue,

      displayBuildName,
      visionSrc,
      bgImageClass,
      colorClass,
      bgColorClass,
      selectedRecommendation: selectedRecommendationRef,
      characterMaster,
      weaponMaster,
      artifactSetMasters,
      ascension: ascensionRef,
      level: levelRef,
      constellation: constellationRef,
      recommendationOnChange,
      normalAttackLevel: normalAttackLevelRef,
      elementalSkillLevel: elementalSkillLevelRef,
      elementalBurstLevel: elementalBurstLevelRef,
      weaponAscension: weaponAscensionRef,
      weaponLevel: weaponLevelRef,
      weaponRefine: weaponRefineRef,
      saveDisabled,
      removeDisabled,
      buildname: buildnameRef,
      saveOnClick,
      removeOnClick,
      ascensionRange,
      levelRange,
      constellationRange,
      ascensionOnChange,
      weaponAscensionRange,
      weaponLevelRange,
      weaponRefineRange,
      weaponAscensionOnChange,
      storageOrRecommendationRef,
      normalAttackLevelRange,
      elementalSkillLevelRange,
      elementalBurstLevelRange,
      openArtifactSetSelect,
      artifactSetSelectClass,
      characterOnChange,
      weaponOnChange,
      IMG_SRC_DUMMY: IMG_SRC_DUMMY,
    };
  },
});
</script>

<style scoped>
table {
  width: 100%;
  min-width: 360px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 10px;
  border: none;
}

tr,
td {
  border: none;
}

td.name {
  padding-bottom: 5px;
  text-align: right;
  vertical-align: middle;
}

td.name span {
  font-size: 3rem;
  font-weight: bold;
  text-shadow: 0 0 2px black;
}

td.title {
  text-align: right;
  text-shadow: 0 0 2px black;
  padding: 0 1rem;
}

td select,
td input,
td label {
  width: calc(100% - 6px);
}

input.save-name {
  width: calc(100% - 16px);
}

img.character {
  width: 100%;
  background-size: contain;
}

img.vision {
  width: 30%;
  position: absolute;
  left: 5%;
  top: 5%;
}

:checked+img {
  background-color: gold;
}

img.weapon {
  width: 90%;
  background-size: contain;
}

img.talent,
img.artifact-set {
  width: 100%;
  object-fit: fill;
  border-radius: 50%;
  border: none;
}

img.selected {
  background-color: rgb(156, 140, 49);
}

th.recommendation {
  color: #e8d14e;
  background-color: #333;
  border: 2px solid gray;
  border-radius: 10px;
  padding: 2px;
  margin: 10px;
}

td.artifact-detail-button {
  border: 2px solid gray;
}

input[type="text"] {
  padding-left: 1rem;
}

table.talent-and-artifact {
  table-layout: fixed;
}

table.talent-and-artifact td {
  table-layout: fixed;
  background-color: #333;
  border-radius: 10px;
}
</style>
