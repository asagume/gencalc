<template>
  <div class="member">
    <div class="member-img" @click="characterOnClick">
      <div class="with-tooltip">
        <img :class="'character'+characterImgClass" :src="characterImgSrc" :alt="displayName(member.name)" />
        <span class="tooltip">{{ displayName(member.name) }}</span>
      </div>
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
import {
  pushBuildinfoToSession,
  TStats,
} from "@/input";
import {
  ARTIFACT_SET_MASTER,
  CHARACTER_MASTER,
  ELEMENT_IMG_SRC,
  IMG_SRC_DUMMY,
  STAR_BACKGROUND_IMAGE_CLASS,
  TArtifactSetEntry,
  TCharacterEntry,
  TCharacterKey,
  TWeaponEntry,
  WEAPON_MASTER,
} from "@/master";
import { computed, defineComponent, PropType, ref, watch } from "vue";
import {
  getBuilddataFromStorage,
  TMember,
} from "./team";

export default defineComponent({
  name: "MemberItem",
  props: {
    member: { type: Object as PropType<TMember>, required: true },
    statsObj: { type: Object as PropType<TStats> },
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
    watch(props, async (newVal) => {
      console.log(newVal.statsObj);
      watchCount.value++;
    });

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
    const weaponName = computed(() =>
      weaponMaster.value ? weaponMaster.value.key : ''
    );
    const imgArtifactSetSrc = (index: number) =>
      artifactSetMasters.value[index]?.image ?? IMG_SRC_DUMMY;
    const artifactSetName = (index: number) =>
      artifactSetMasters.value[index]?.key ?? '';

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

    const weaponMaster = computed((): TWeaponEntry => {
      let result = undefined;
      if (savedata.value) {
        const weapon = savedata.value.武器;
        if (weapon && characterMaster.value) {
          result = (WEAPON_MASTER as any)[characterMaster.value.武器][weapon];
        }
      }
      return result;
    });

    const artifactSetMasters = computed((): TArtifactSetEntry[] => {
      const result: TArtifactSetEntry[] = [];
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
        if (props.statsObj && stat) {
          if (stat === "会心率/ダメージ") {
            result = displayStatValue("会心率", props.statsObj["会心率"]);
            result += "/";
            result += displayStatValue("会心ダメージ", props.statsObj["会心ダメージ"]);
          } else {
            result = displayStatValue(stat, props.statsObj[stat]);
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
      weaponName,
      imgArtifactSetSrc,
      artifactSetName,

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
