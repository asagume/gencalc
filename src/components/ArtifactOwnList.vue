<template>
  <div class="tab-switch part-select">
    <input class="hidden" id="own-list-cat-tab-1" type="radio" value="1" v-model="artifactCatSelectTab"
      @change="catOnChange">
    <label for="own-list-cat-tab-1">
      {{ displayName('生の花') }}
    </label>
    <input class="hidden" id="own-list-cat-tab-2" type="radio" value="2" v-model="artifactCatSelectTab"
      @change="catOnChange">
    <label for="own-list-cat-tab-2">
      {{ displayName('死の羽') }}
    </label>
    <input class="hidden" id="own-list-cat-tab-3" type="radio" value="3" v-model="artifactCatSelectTab"
      @change="catOnChange">
    <label for="own-list-cat-tab-3">
      {{ displayName('時の砂') }}
    </label>
    <input class="hidden" id="own-list-cat-tab-4" type="radio" value="4" v-model="artifactCatSelectTab"
      @change="catOnChange">
    <label for="own-list-cat-tab-4">
      {{ displayName('空の杯') }}
    </label>
    <input class="hidden" id="own-list-cat-tab-5" type="radio" value="5" v-model="artifactCatSelectTab"
      @change="catOnChange">
    <label for="own-list-cat-tab-5">
      {{ displayName('理の冠') }}
    </label>
  </div>
  <div class="artifact-list">
    <template v-for="item in getArtifactList(artifactCatSelectTab)" :key="item.id">
      <ArtifactItem :artifact="item.artifact" :id="item.id" :controls="['edit', 'remove']"
        @update:article="updateArtifact" @remove:artifact="removeArtifact" />
    </template>
  </div>
  <div class="new-artifact">
    <template v-if="!isAdding">
      <button type="button" @click="isAdding = true"> {{ displayName('新規聖遺物') }}</button>
    </template>
    <template v-else>
      <ArtifactItem :artifact="newArtifact" :id="0" :controls="['edit']" :initials="['edit']"
        @update:artifact="updateArtifact" />
      <div>
        <button type="button" @click="add" :disabled="!addable"> {{ displayName('追加する') }}</button>
        <button type="button" @click="isAdding = false"> {{ displayName('閉じる') }}</button>
      </div>
    </template>
  </div>
  <div style="margin-top: 10px">
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
import _ from 'lodash';
import ArtifactItem from "@/components/ArtifactItem.vue";
import {
  ARTIFACT_SET_MASTER,
} from "@/master";
import { computed, defineComponent, reactive, ref } from "vue";
import CompositionFunction from "./CompositionFunction.vue";
import { ARTIFACT_TEMPLATE, TArtifact, 聖遺物ステータスTEMPLATE } from "@/input";
import { overwriteObject } from '@/common';

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
    const newArtifact = reactive(_.cloneDeep(ARTIFACT_TEMPLATE));

    const isAdding = ref(false);
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

    const CAT_MAINSTAT = [
      ['', 0],
      ['HP', 4780],
      ['攻撃力', 311],
      ['攻撃力%', 46.6],
      ['炎元素ダメージバフ', 46.6],
      ['会心率', 31.1],
    ];

    const catOnChange = () => {
      newArtifact.cat_id = artifactCatSelectTab.value;
      newArtifact.mainStat = String(CAT_MAINSTAT[newArtifact.cat_id][0]);
      newArtifact.mainStatValue = Number(CAT_MAINSTAT[newArtifact.cat_id][1]);
    };

    const updateArtifact = (id: number, artifact: TArtifact) => {
      if (id == 0) {
        overwriteObject(newArtifact, artifact);
        return;
      }
      let index = 0;
      for (; index < artifactList.length; index++) {
        if (artifactList[index].id == id) {
          artifactList[index].artifact = artifact;
          break;
        }
      }
      changed.value = true;
    };

    const removeArtifact = (id: number) => {
      let index = 0;
      for (; index < artifactList.length; index++) {
        if (artifactList[index].id == id) {
          artifactList.splice(index, 1);
          break;
        }
      }
    };

    const addable = computed(() => {
      if (!newArtifact.name) return false;
      if (!newArtifact.rarity) return false;
      if (!newArtifact.setname) return false;
      if (!newArtifact.cat_id) return false;
      if (!newArtifact.mainStat) return false;
      if (!newArtifact.mainStatValue) return false;
      for (const subStat of newArtifact.subStats) {
        if (!subStat.name) return false;
        if (!subStat.value) return false;
      }
      return true;
    });

    const add = () => {
      const newEntry = {
        id: nextId++,
        artifact: _.cloneDeep(newArtifact),
      };
      console.log(newEntry);
      artifactList.push(newEntry);
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
      newArtifact,
      getArtifactList,

      catOnChange,
      updateArtifact,
      removeArtifact,

      isAdding,
      addable,
      add,
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
