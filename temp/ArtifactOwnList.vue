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
  <div class="artifact" v-for="(artifact, index) in getArtifactList(artifactPartSelectTab)" :key="index">
    <table class="artifact">
      <tr>
        <td>
          <img class="artifact-icon" :src="artifactSetIconSrc(artifact.set)" :alt="displayName(artifact.name)">
          <br />
          {{ displayName(artifact.mainStat).replace(/%$/, '') + '+' + displayStatValue(artifact.mainStat,
              artifact.mainStatValue)
          }}
        </td>
        <td>
          <table class="artifact-substat">
            <tr v-for="(subStat, index2) in artifact.subStats" :key="index2">
              <td>
                {{ displayName(subStat.name).replace(/%$/, '') + '+' + displayStatValue(subStat.name, subStat.value) }}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  <div class="new-artifact">
    <table class="artifact">
      <tr>
        <td>
          <img class="artifact-icon" :src="artifactSetIconSrc(newArtifact.set)" alt="new artifact"
            @click="newArtifactSetOnClick">
          <br />
          <select v-model="newArtifact.mainStat" @change="newArtifactMainstatOnChange">
            <option v-for="stat in artifactMainstatArr(artifactPartSelectTab)" :key="stat" :value="stat">
              {{ displayName(stat) }}
            </option>
          </select>
        </td>
        <td>
          <table class="artifact-substat">
            <tr v-for="substat in 聖遺物サブ効果ARRAY" :key="substat">
              <th class="stat">
                {{ displayName(substat) }}
              </th>
              <td class="value">
                <input type="number" :step="inputNumberStep(substat)" :disabled="substat == newArtifact.mainStat">
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import {
  ARTIFACT_SET_MASTER,
} from "@/master";
import { defineComponent, reactive, ref } from "vue";
import CompositionFunction from "./CompositionFunction.vue";
import { ARTIFACT_TEMPLATE, TArtifact, 聖遺物サブ効果ARRAY, 聖遺物ステータスTEMPLATE, } from "@/input";

export default defineComponent({
  name: "ArtifactOwnList",
  setup() {
    const { displayName, displayStatValue, percent, targetValue } = CompositionFunction();

    const artifactPartSelectTab = ref(1);
    const artifactList = reactive([] as TArtifact[]);

    const newArtifact = reactive(_.cloneDeep(ARTIFACT_TEMPLATE));

    const getArtifactList = (index: any) => {
      const result = artifactList.filter(s => s.cat_id == Number(index))
      return result.sort((a, b) => {
        if (a.set != b.set) {
          const setNameArr = Object.keys(ARTIFACT_SET_MASTER);
          const aIndex = setNameArr.indexOf(a.set);
          const bIndex = setNameArr.indexOf(b.set);
          return aIndex - bIndex;
        }
        if (a.mainStat != b.mainStat) {
          const statNameArr = Object.keys(聖遺物ステータスTEMPLATE);
          const aIndex = statNameArr.indexOf(a.set);
          const bIndex = statNameArr.indexOf(b.set);
          return aIndex - bIndex;
        }
        return 0;
      });
    };

    const artifactSetIconSrc = (setname: string) => {
      return (ARTIFACT_SET_MASTER as any)[setname].icon_url;
    };

    const MAINSTAT_ARRAY1: string[] = [
      'HP',
    ];
    const MAINSTAT_ARRAY2: string[] = [
      '攻撃力',
    ];
    const MAINSTAT_ARRAY3: string[] = [
      '元素チャージ効率',
      'HP%',
      '攻撃力%',
      '防御力%',
      '元素熟知',
    ];
    const MAINSTAT_ARRAY4: string[] = [
      '炎元素ダメージバフ',
      '水元素ダメージバフ',
      '風元素ダメージバフ',
      '雷元素ダメージバフ',
      '草元素ダメージバフ',
      '氷元素ダメージバフ',
      '岩元素ダメージバフ',
      '物理ダメージバフ',
      'HP%',
      '攻撃力%',
      '防御力%',
      '元素熟知',
    ];
    const MAINSTAT_ARRAY5: string[] = [
      '会心率',
      '会心ダメージ',
      '与える治療効果',
      'HP%',
      '攻撃力%',
      '防御力%',
      '元素熟知',
    ];

    const artifactMainstatArr = (cat_id: number) => {
      return [
        MAINSTAT_ARRAY1,
        MAINSTAT_ARRAY2,
        MAINSTAT_ARRAY3,
        MAINSTAT_ARRAY4,
        MAINSTAT_ARRAY5,
      ][cat_id - 1];
    };

    const inputNumberStep = (stat: string) => {
      if (percent(stat)) return 0.1;
      return 1;
    };

    const newArtifactSetOnClick = () => {
      console.log('newArtifactSetOnClick');
    };

    const newArtifactMainstatOnChange = () => {
      console.log('newArtifactMainstatOnChange');
    };

    const newArtifactSubstatOnChange = (index: number) => {
      console.log('newArtifactSubstatOnChange', index);
    };

    const onLoad = () => {
      const storageKey = 'artifact_list';
      if (storageKey in localStorage) {
        const value = JSON.parse(localStorage[storageKey]);
        artifactList.splice(0, artifactList.length, ...value);
      }
    };
    onLoad();

    return {
      displayName, displayStatValue, targetValue,

      artifactPartSelectTab,
      getArtifactList,

      newArtifact,
      artifactMainstatArr,
      聖遺物サブ効果ARRAY,
      inputNumberStep,

      newArtifactSetOnClick,
      newArtifactMainstatOnChange,
      newArtifactSubstatOnChange,

      artifactSetIconSrc,
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

div.artifact {
  display: inline-block;
  width: 45%;
  min-width: 336px;
  margin: 2px;
}

div.new-artifact {
  display: inline-block;
  width: 45%;
  min-width: 336px;
  margin: 2px;
}

table.artifact {
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  table-layout: fixed;
  border-spacing: 0;
}

table.artifact select {
  width: 90%;
}

table.artifact-substat {
  width: 100%;
  border-spacing: 0;
}

table.artifact tr td {
  vertical-align: top;
  border-bottom: 2px solid whitesmoke;
  padding: 3px;
}

table.artifact-substat tr td {
  border-bottom: 1px solid gray;
  padding: 3px;
  text-align: left;
}

table.artifact-substat tr:last-child td {
  border-bottom: none;
}

table.artifact-substat tr th.stat {
  text-align: right;
}

table.artifact-substat tr td.value {
  width: calc(100% / 3);
}

table.artifact-substat input[type="number"] {
  width: 100%;
}

img.artifact-icon {
  width: 7.2rem;
  height: 7.2rem;
}
</style>
