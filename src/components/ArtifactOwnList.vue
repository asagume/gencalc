<template>
  <div class="cat-select">
    <label>
      <input class="hidden" type="radio" value="1" v-model="artifactCatTabSelected" @change="catOnChange">
      <img src="images/flower_of_life.png" :alt="displayName('生の花')">
    </label>
    <label>
      <input class="hidden" type="radio" value="2" v-model="artifactCatTabSelected" @change="catOnChange">
      <img src="images/plume_of_death.png" :alt="displayName('死の羽')">
    </label>
    <label>
      <input class="hidden" type="radio" value="3" v-model="artifactCatTabSelected" @change="catOnChange">
      <img src="images/sands_of_eon.png" :alt="displayName('時の砂')">
    </label>
    <label>
      <input class="hidden" type="radio" value="4" v-model="artifactCatTabSelected" @change="catOnChange">
      <img src="images/goblet_of_eonothem.png" :alt="displayName('空の杯')">
    </label>
    <label>
      <input class="hidden" type="radio" value="5" v-model="artifactCatTabSelected" @change="catOnChange">
      <img src="images/circlet_of_logos.png" :alt="displayName('理の冠')">
    </label>
  </div>

  <div class="artifact-list">
    <template v-for="item in artifactOwnArrCatId(artifactCatTabSelected)" :key="item.id">
      <ArtifactItem :artifact="item.artifact" :id="item.id" :control="artifactControl" :selected="item.selected"
        @update:article="updateArtifact" @select:artifact="selectArtifact" />
    </template>
  </div>

  <div style="margin-top: 10px">
    <!-- 通常モード -->
    <template v-if="!controlMode">
      <button type="button" @click="removeOnClick">
        {{ displayName('削除') }}
      </button>
      <button type="button" @click="newArtifactOnClick">
        {{ displayName('新規聖遺物') }}
      </button>
    </template>
    <!-- 削除モード -->
    <template v-if="controlMode == 'remove'">
      <button type="button" :disabled="selectCount == 0" @click="removeExecOnClick">
        {{ displayName('削除実行') }}
      </button>
      <button type="button" @click="removeModeEndProc">
        {{ displayName('キャンセル') }}
      </button>
    </template>
    <!-- 新規聖遺物モード -->
    <template v-if="controlMode == 'new-artifact'">
      <ArtifactItem :artifact="newArtifact" :id="0" control="editable" :initial="true"
        @update:artifact="updateArtifact" />
      <div>
        <button type="button" @click="newArtifactAddOnClick" :disabled="!addable">
          {{ displayName('聖遺物追加') }}
        </button>
        <button type="button" @click="newArtifactModeEndProc">
          {{ displayName('キャンセル') }}
        </button>
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
  selected: boolean,
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

    const artifactCatTabSelected = ref(1);
    const artifactOwnArr = reactive([] as TArtifactWithId[]);
    const newArtifact = reactive(_.cloneDeep(ARTIFACT_TEMPLATE));
    const artifactControl = ref('editable');
    const controlMode = ref('' as string);

    const changed = ref(false);
    const savable = ref(false);

    const selectCount = computed(() => {
      return artifactOwnArr.filter(s => s.selected).length;
    });

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
      return artifactOwnArr.filter(s => _.isEqual(s.artifact, newArtifact)).length == 0;
    });

    const artifactOwnArrCatId = (index: any) => {
      const result = artifactOwnArr.filter(s => s.artifact.cat_id == Number(index))
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

    /**
     * 表示部位変更イベント.
     */
    const catOnChange = () => {
      removeModeEndProc();
      newArtifactModeEndProc();
      newArtifact.cat_id = Number(artifactCatTabSelected.value);
      newArtifact.mainStat = String(CAT_MAINSTAT[newArtifact.cat_id][0]);
      newArtifact.mainStatValue = Number(CAT_MAINSTAT[newArtifact.cat_id][1]);
    };

    /**
     * 削除ボタンクリックイベント
     */
    const removeOnClick = () => {
      controlMode.value = 'remove';
      artifactControl.value = 'selectable';
    };

    /**
     * [削除モード]削除実行ボタンクリックイベント
     */
    const removeExecOnClick = () => {
      const newArtifactOwnArr = artifactOwnArr.filter(s => !s.selected);
      artifactOwnArr.splice(0, artifactOwnArr.length, ...newArtifactOwnArr);
      removeModeEndProc();
      changed.value = true;
    };

    /**
     * 削除モード終了処理
     */
    const removeModeEndProc = () => {
      controlMode.value = '';
      artifactOwnArr.forEach(e => {
        e.selected = false;
      });
      artifactControl.value = 'editable';
    };

    /**
     * 新規聖遺物ボタンクリックイベント
     */
    const newArtifactOnClick = () => {
      controlMode.value = 'new-artifact';
      artifactControl.value = '';
    };

    /**
     * [新規聖遺物モード]聖遺物追加ボタンクリックイベント
     */
    const newArtifactAddOnClick = () => {
      const newEntry = {
        id: nextId++,
        artifact: _.cloneDeep(newArtifact),
        selected: false,
      };
      artifactOwnArr.push(newEntry);
      newArtifactModeEndProc();
      changed.value = true;
    };

    /**
     * 新規聖遺物モード終了処理
     */
    const newArtifactModeEndProc = () => {
      controlMode.value = '';
      artifactControl.value = 'editable';
    };

    /**
     * 聖遺物更新イベント.
     * @param id 聖遺物ID
     * @param artifact 聖遺物データ
     */
    const updateArtifact = (id: number, artifact: TArtifact) => {
      if (id == 0) {
        overwriteObject(newArtifact, artifact);
        return;
      }
      let index = 0;
      for (; index < artifactOwnArr.length; index++) {
        if (artifactOwnArr[index].id == id) {
          artifactOwnArr[index].artifact = artifact;
          break;
        }
      }
      changed.value = true;
    };

    /**
     * 聖遺物選択イベント.
     * @param id 聖遺物ID
     */
    const selectArtifact = (id: number) => {
      let index = 0;
      for (; index < artifactOwnArr.length; index++) {
        if (artifactOwnArr[index].id == id) {
          artifactOwnArr[index].selected = !artifactOwnArr[index].selected;
          break;
        }
      }
    };

    /**
     * 聖遺物所持状況保存ボタンクリックイベント.
     */
    const save = () => {
      const work = artifactOwnArr.map(s => s.artifact);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(work));
      changed.value = false;
      savable.value = false;
    };

    const onLoad = () => {
      if (STORAGE_KEY in localStorage) {
        const value: any[] = JSON.parse(localStorage[STORAGE_KEY]);
        const newList = value.filter(s => 'setname' in s).map(s => ({
          id: nextId++, artifact: s, selected: false,
        }));
        artifactOwnArr.splice(0, artifactOwnArr.length, ...newList);
      }
    };
    onLoad();

    return {
      displayName, displayStatValue, targetValue,

      artifactCatTabSelected,
      newArtifact,
      artifactControl,
      controlMode,
      selectCount,
      addable,
      artifactOwnArrCatId,

      changed,
      savable,

      catOnChange,
      removeOnClick,
      removeExecOnClick,
      removeModeEndProc,
      newArtifactOnClick,
      newArtifactAddOnClick,
      newArtifactModeEndProc,

      updateArtifact,
      selectArtifact,

      save,
    };
  },
});
</script>

<style scoped>
.cat-select {
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 10px;
}

.cat-select label {
  margin-left: 3px;
  margin-right: 3px;
}

.cat-select img {
  width: 33px;
  height: 33px;
  border-radius: 50%;
}

:checked+img {
  background-color: rgb(156, 140, 49);
}

.artifact-list {
  margin-left: auto;
  margin-right: auto;
}
</style>
