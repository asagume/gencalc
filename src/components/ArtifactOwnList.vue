<template>
  <div class="tab-switch part-select">
    <input class="hidden" id="own-list-cat-tab-1" type="radio" value="1" v-model="artifactCatSelectTab">
    <label for="own-list-cat-tab-1">
      {{ displayName('生の花') }}
    </label>
    <input class="hidden" id="own-list-cat-tab-2" type="radio" value="2" v-model="artifactCatSelectTab">
    <label for="own-list-cat-tab-2">
      {{ displayName('死の羽') }}
    </label>
    <input class="hidden" id="own-list-cat-tab-3" type="radio" value="3" v-model="artifactCatSelectTab">
    <label for="own-list-cat-tab-3">
      {{ displayName('時の砂') }}
    </label>
    <input class="hidden" id="own-list-cat-tab-4" type="radio" value="4" v-model="artifactCatSelectTab">
    <label for="own-list-cat-tab-4">
      {{ displayName('空の杯') }}
    </label>
    <input class="hidden" id="own-list-cat-tab-5" type="radio" value="5" v-model="artifactCatSelectTab">
    <label for="own-list-cat-tab-5">
      {{ displayName('理の冠') }}
    </label>
  </div>
  <div class="artifact-list">
    <template v-for="item in getArtifactList(artifactCatSelectTab)" :key="item.id">
      <ArtifactItem :artifact="item.artifact" :id="item.id" :controls="['edit']" @change:article="artifactOnChange" />
    </template>
  </div>
  <div>
    <label>
      <input type="checkbox" v-model="savable" :disabled="!changed" />
      <span>{{ displayName("聖遺物所持状況を保存する") }}</span>
    </label>
    <button type="button" @click="save" :disabled="!savable">
      {{ displayName("実行") }}
    </button>
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

type TArtifactWithId = {
  id: number,
  artifact: TArtifact,
};

var nextId = 1;

export default defineComponent({
  name: "ArtifactOwnList",
  components: {
    ArtifactItem,
  },
  setup() {
    const { displayName, displayStatValue, targetValue } = CompositionFunction();

    const STORAGE_KEY = 'artifact_list';

    const artifactCatSelectTab = ref(1);
    const artifactList = reactive([] as TArtifactWithId[]);

    const changed = ref(false);
    const savable = ref(false);

    const getArtifactList = (index: any) => {
      const result = artifactList.filter(s => s.artifact.cat_id == Number(index))
      return result.sort((a, b) => {
        if (a.artifact.setname != b.artifact.setname) {
          const setNameArr = Object.keys(ARTIFACT_SET_MASTER);
          const aIndex = setNameArr.indexOf(a.artifact.setname);
          const bIndex = setNameArr.indexOf(b.artifact.setname);
          return aIndex - bIndex;
        }
        if (a.artifact.mainStat != b.artifact.mainStat) {
          const statNameArr = Object.keys(聖遺物ステータスTEMPLATE);
          const aIndex = statNameArr.indexOf(a.artifact.mainStat);
          const bIndex = statNameArr.indexOf(b.artifact.mainStat);
          return aIndex - bIndex;
        }
        return 0;
      });
    };

    const artifactOnChange = (id: number, artifact: TArtifact) => {
      let index = 0;
      for (; index < artifactList.length; index++) {
        if (artifactList[index].id == id) {
          artifactList[index].artifact = artifact;
          break;
        }
      }
      changed.value = true;
    };

    const save = () => {
      const work = artifactList.map(s => s.artifact);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(work));
      changed.value = false;
      savable.value = false;
    };

    const onLoad = () => {
      if (STORAGE_KEY in localStorage) {
        const value: any[] = JSON.parse(localStorage[STORAGE_KEY]);
        const newList = value.filter(s => 'setname' in s).map(s => ({ id: nextId++, artifact: s }));
        artifactList.splice(0, artifactList.length, ...newList);
      }
      console.log(artifactList);
    };
    onLoad();

    return {
      displayName, displayStatValue, targetValue,

      artifactCatSelectTab,
      getArtifactList,
      artifactOnChange,

      changed,
      savable,
      save,
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
