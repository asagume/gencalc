<template>
  <div class="member">
    <div class="member-img" @dblclick="characterOnDblclick">
      <div class="with-tooltip">
        <img :class="'character' + characterImgClass" :src="characterImgSrc" :alt="displayName(member.name)" />
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
      <img class="replacement replacement-0" v-if="member.replacements[0]" :src="replaceImgSrc(0)"
        :alt="member.replacements[0]">
      <img class="replacement replacement-1" v-if="member.replacements[1]" :src="replaceImgSrc(1)"
        :alt="member.replacements[1]">
    </div>
    <div class="stat-value" v-if="displayStat">
      {{ statValue }}
    </div>
    <div v-if="showEquipment">
      <img class="weapon" :src="imgWeaponSrc" alt="weapon" />
      <img class="artifact-set" :src="imgArtifactSetSrc(0)" alt="artifact-set" />
      <img class="artifact-set" :src="imgArtifactSetSrc(1)" alt="artifact-set" />
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
  name: 'MemberItem',
  props: {
    member: { type: Object as PropType<TMember>, required: true },
    displayStat: { type: String },
    showEquipment: { type: Boolean },
    statsObj: { type: Object as PropType<TStats> },
    viewable: { type: Boolean },
    tags: { type: Array as PropType<any[]> },
    members: { type: Array as PropType<string[]> },
    elementalResonance: { type: Array as PropType<string[]> },
  },
  setup(props) {
    const { displayName, displayStatValue } = CompositionFunction();

    const watchCount = ref(0);
    watch(props, () => {
      watchCount.value++;
    });

    const characterMaster = computed(() => props.member.name ? (CHARACTER_MASTER[props.member.name as TCharacterKey] as TCharacterEntry) ?? undefined : undefined);
    const characterImgSrc = computed(() => characterMaster.value?.icon_url ?? IMG_SRC_DUMMY);
    const characterImgClass = computed(() => characterMaster.value?.レアリティ ? (' ' + (STAR_BACKGROUND_IMAGE_CLASS as any)[String(characterMaster.value.レアリティ)]) : '');
    const visionImgSrc = computed(() => characterMaster.value?.元素 ? (ELEMENT_IMG_SRC as any)[characterMaster.value.元素] : IMG_SRC_DUMMY);
    const constellation = computed(() => (builddata.value ? builddata.value.命ノ星座 : ''));
    const builddata = computed(() => (props.member.name && props.member.buildname) ? getBuilddataFromStorage(props.member.name, props.member.buildname) : undefined);
    const weaponMaster = computed((): TWeaponEntry => {
      let result = undefined;
      if (builddata.value) {
        const weapon = builddata.value.武器;
        if (weapon && characterMaster.value) {
          result = (WEAPON_MASTER as any)[characterMaster.value.武器][weapon];
        }
      }
      return result;
    });
    const imgWeaponSrc = computed(() => weaponMaster.value?.icon_url ?? IMG_SRC_DUMMY);
    const weaponName = computed(() => weaponMaster.value?.key ?? '');
    const statValue = computed(() => {
      watchCount.value;
      let result = '-';
      if (builddata.value) {
        let stat = props.displayStat;
        if (props.statsObj && stat) {
          if (stat === '会心率/ダメージ') {
            result = displayStatValue('会心率', props.statsObj['会心率']);
            result += '/';
            result += displayStatValue('会心ダメージ', props.statsObj['会心ダメージ']);
          } else {
            result = displayStatValue(stat, props.statsObj[stat]);
          }
        }
      }
      return result;
    });
    const artifactSetMasters = computed((): TArtifactSetEntry[] => {
      const result: TArtifactSetEntry[] = [];
      if (builddata.value) {
        for (let i = 0; i < 2; i++) {
          const key = '聖遺物セット効果' + (i + 1);
          let value = builddata.value[key] ?? 'NONE';
          result.push((ARTIFACT_SET_MASTER as any)[value]);
        }
      }
      return result;
    });

    const replaceImgSrc = (replIndex: number) => {
      const name = replIndex < props.member.replacements.length ? props.member.replacements[replIndex] : undefined;
      return name ? (CHARACTER_MASTER[name as TCharacterKey] as TCharacterEntry).icon_url : IMG_SRC_DUMMY;
    };
    const imgArtifactSetSrc = (index: number) => artifactSetMasters.value[index]?.image ?? IMG_SRC_DUMMY;
    const artifactSetName = (index: number) => artifactSetMasters.value[index]?.key ?? '';

    const characterOnDblclick = () => {
      if (props.viewable) {
        locate();
      }
    };

    const locate = () => {
      const member = props.member;
      if (member?.name) {
        if (confirm('げんかるくで' + member.name + 'を開きます。よろしいですか？')) {
          const teammembers = props.members?.filter(s => s != member.name);
          pushBuildinfoToSession(member.name, member.buildname, undefined, teammembers);
          window.open('./', '_blank');
        }
      }
    };

    return {
      displayName,

      characterImgSrc,
      characterImgClass,
      visionImgSrc,
      constellation,
      replaceImgSrc,
      imgWeaponSrc,
      weaponName,
      imgArtifactSetSrc,
      artifactSetName,
      statValue,

      characterOnDblclick,
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
  background: linear-gradient(to top, #3d3d3b, #141414);
  border: 1px solid whitesmoke;
  border-radius: 3px;
  vertical-align: middle;
  padding-top: 1px;
}

div.tag-0 {
  bottom: 1px;
}

div.tag-1 {
  bottom: 17px;
}

div.tag-2 {
  bottom: 33px;
}

div.tag-3 {
  bottom: 49px;
}

img.replacement {
  position: absolute;
  left: 0;
  bottom: -2px;
  transform: translateX(-50%);
  width: 52px;
  height: 36px;
  border-radius: 75%;
  object-position: 0 0;
  object-fit: cover;
  z-index: 10;
}

img.replacement-0 {
  left: 25%;
}

img.replacement-1 {
  left: 75%;
}

img.weapon,
img.artifact-set {
  position: relative;
  width: calc(100% / 3 - 4px);
  height: calc(100% / 3 - 4px);
  border: 2px solid slategray;
  border-radius: 50%;
  background-color: black;
  z-index: 100;
}

div.stat-value {
  font-size: 12px;
  padding-top: 2px;
  padding-bottom: 2px;
}
</style>
