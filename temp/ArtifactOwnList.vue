<template>
  <div class="tab-switch part-select">
    <input class="hidden" id="part-select-tab-1" type="radio" value="1" v-model="artifactPartSelectTab">
    <label for="part-select-tab-1">
      {{ displayName('生の花') }}
    </label>
    <input class="hidden" id="part-select-tab-2" type="radio" value="2" v-model="artifactPartSelectTab">
    <label for="part-select-tab-2">
      {{ displayName('死の羽') }}
    </label>
    <input class="hidden" id="part-select-tab-3" type="radio" value="3" v-model="artifactPartSelectTab">
    <label for="part-select-tab-3">
      {{ displayName('時の砂') }}
    </label>
    <input class="hidden" id="part-select-tab-4" type="radio" value="4" v-model="artifactPartSelectTab">
    <label for="part-select-tab-4">
      {{ displayName('空の杯') }}
    </label>
    <input class="hidden" id="part-select-tab-5" type="radio" value="5" v-model="artifactPartSelectTab">
    <label for="part-select-tab-5">
      {{ displayName('理の冠') }}
    </label>
  </div>
  <div class="artifact-list">
    <template v-for="(artifact, index) in getArtifactList(artifactPartSelectTab)" :key="index">
      <ArtifactItem :artifact="artifact" />
    </template>
  </div>
</template>

<script lang="ts">
import ArtifactItem from "@/components/ArtifactItem.vue";
import {
  ARTIFACT_SET_MASTER,
} from "@/master";
import { defineComponent, reactive, ref } from "vue";
import CompositionFunction from "./CompositionFunction.vue";
import { TArtifact, 聖遺物ステータスTEMPLATE } from "@/input";

export default defineComponent({
  name: "ArtifactOwnList",
  components: {
    ArtifactItem,
  },
  setup() {
    const { displayName, displayStatValue, targetValue } = CompositionFunction();

    const artifactPartSelectTab = ref('1');
    const artifactList = reactive([] as TArtifact[]);

    const getArtifactList = (index: any) => {
      const result = artifactList.filter(s => s.cat_id == Number(index))
      return result.sort((a, b) => {
        if (a.setname != b.setname) {
          const setNameArr = Object.keys(ARTIFACT_SET_MASTER);
          const aIndex = setNameArr.indexOf(a.setname);
          const bIndex = setNameArr.indexOf(b.setname);
          return aIndex - bIndex;
        }
        if (a.mainStat != b.mainStat) {
          const statNameArr = Object.keys(聖遺物ステータスTEMPLATE);
          const aIndex = statNameArr.indexOf(a.mainStat);
          const bIndex = statNameArr.indexOf(b.mainStat);
          return aIndex - bIndex;
        }
        return 0;
      });
    };

    const onLoad = () => {
      const storageKey = 'artifact_list';
      if (storageKey in localStorage) {
        const value = JSON.parse(localStorage[storageKey]);
        artifactList.splice(0, artifactList.length, ...value);
      }
      console.log(artifactList);
    };
    onLoad();

    return {
      displayName, displayStatValue, targetValue,

      artifactPartSelectTab,
      getArtifactList,
    };
  },
});
</script>

<style scoped>
.tab-switch.part-select label {
  width: calc(100% / 5 - 20px);
  max-width: 16rem;
  background: linear-gradient(to top, #55290b, black);
}

.artifact-list {
  margin-left: auto;
  margin-right: auto;
}
</style>
